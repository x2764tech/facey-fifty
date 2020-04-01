import * as React from 'react';
import {GetServerSideProps} from 'next';
import stravaApi, {Strava} from 'strava-v3';
import segments from '../segments.json';
import Segment from '../Segment';
import dynamic from 'next/dynamic';
import Head from 'next/head';

function Loader({error, isLoading, pastDelay,}: {
    error?: Error | null;
    isLoading?: boolean;
    pastDelay?: boolean;
    timedOut?: boolean;
}) {
    if (error !== null && error !== undefined) return <p>{error.message}</p>;
    if (isLoading) return <p>Loading...</p>;
    return null;
}

const Map = dynamic(import('../components/Map'), {ssr: false, loading: Loader});

const refresh = require('passport-oauth2-refresh');


type Dictionary = { [key: string]: any };

interface HomeProps extends Dictionary {
    user: any;
    segmentDetails: Segment[];
}

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
}

const Toggle = ({showText, hideText, children}: React.PropsWithChildren<{showText:string, hideText: string}>) => {
    const [isHidden, setIsHidden] = React.useState(true);
    return <>
            <button onClick={() => setIsHidden(!isHidden)}>{isHidden?showText:hideText}</button>
            {!isHidden&&children}
        </>
};

type RenderedSegment = Segment & {
    complete: boolean;
    number: number;
}

const List = ({segments}:{segments:RenderedSegment[]}) => {
    const [visible, setVisible] = React.useState<string[]>([]);
    return <>
        <style jsx>{`
        table {
                width: 100%
            }
            td, th {
                padding: 0.25rem 0.5rem;
            }
            a {
            color: blue;
            text-decoration: none;
            }
            td.data  {
                text-align: right;
            }
        `}</style>

            <Toggle showText={"show map"} hideText={"hide map"}>
                <Map segments={segments}/>
            </Toggle>
        <table>
            <colgroup>
                <col width="1"/>
                <col/>
                <col className="data"/>
                <col className="data"/>
                <col className="data"/>
                <col className="data"/>
                <col className="data"/>
            </colgroup>
            <thead>
            <tr>
                <td/>
                <td/>
                <th>Climb</th>
                <th>Distance</th>
                <th>Avg Grade</th>
                <th>Your time</th>
                <th>Number of attempts</th>
            </tr>
            </thead>
            <tbody>
            {segments
                .map(s =>
                    <React.Fragment key={s.id}>
                        <tr
                            style={{backgroundColor: s.complete ? 'lightgreen' : 'lightred'}}>
                            <td>
                                <button
                                    onClick={() => setVisible(e => visible.includes(s.id) ? e.filter(_ => _ !== s.id) : [...e, s.id])}>{visible.includes(s.id) ? '🔼' : '🔽'}</button>
                            </td>
                            <td><a href={`https://www.strava.com/segments/${s.id}`}
                                   target="_blank">{s.name}</a></td>
                            <td className="data">{Math.ceil((s.elevation_high - s.elevation_low) * 3.28084)}ft</td>
                            <td className="data">{(s.distance * 0.0006213712).toFixed(2)} miles</td>
                            <td className="data">{s.average_grade}%</td>
                            <td className="data">{formatTime(s.athlete_segment_stats.pr_elapsed_time)}</td>

                            <td className="data">{s.athlete_segment_stats.effort_count}</td>
                        </tr>
                        {visible.includes(s.id) &&
                        <tr>
                            <td colSpan={2}>
                                <iframe style={{width: "100%", height: "450px"}}
                                        src={`https://veloviewer.com/segments/${s.id}/embed?default2d=y&units=i`}
                                        frameBorder="0"
                                        scrolling="no"/>
                            </td>
                            <td colSpan={5}>
                                <Map segments={[s]}/>
                            </td>
                        </tr>

                        }
                    </React.Fragment>
                )
            }
            </tbody>
        </table>
    </>;
};


const Home = ({user, segmentDetails}: HomeProps) => {
    let allTheDetails = segmentDetails.map(s => ({
        ...s,
        number: +s.name.replace(/Facey Fifty - No (\d+) -.+/, (_, number) => number),
        complete: s.athlete_segment_stats.effort_count > 0,
        name: s.name.replace(/^\s*Facey Fifty - /, "")
    }))
        .sort((a, b) => a.number - b.number);


    let [filter,setFilter] = React.useState<"all"|"done"|"todo">("all");

    const [visibleSegments,setVisibleSegments] = React.useState(allTheDetails);

    React.useEffect(() => {
        console.log("Show %s segments", filter);
        setVisibleSegments(
            filter === 'all'
                ? allTheDetails
                : filter == "done"
                ? allTheDetails.filter(_ => _.complete)
                : allTheDetails.filter(_ => !_.complete)
        )
    }, [filter]);

    return <>
        <Head>
            <title>Facey Fifty</title>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
                  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
                  crossOrigin=""/>

            <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
                    integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
                    crossOrigin=""/>
        </Head>
        <style jsx>{`
            h1 {
                display: inline-block;
                padding-right: 0.5rem;
            }
            .score {
                border: 2px solid black;
                background: blue;
                padding: 0.5em;
                display: inline-block;
                color: white;
            }
            
            ul {
                list-style: none;
                padding-inline-start: 0;
                display: inline-block;
            }
            
            ul li {
                list-style: none;
                display: inline
            }
            ul li input[type=radio] {
                display: none;
            }
            ul li label {
                padding: 0.5rem;
                border: 2px solid blue;
                border-right-width: 0;
            }
            ul li:last-child label {
                border-right-width: 2px;
            }
            ul li label.active {
                background-color: blue;
                color: white;
            }
        `}</style>
        <h1>Hello <span>{user.firstname} {user.lastname}</span> <span className="score">{allTheDetails.filter(_ => _.complete).length}/50</span></h1>
        <ul>
            <li><label className={filter==="all"?"active":""}><input type="radio" checked={filter==="all"} onClick={() => setFilter("all")}/> All</label></li>
            <li><label className={filter==="todo"?"active":""}><input type="radio" checked={filter==="todo"} onClick={() => setFilter("todo")}/> Todo</label></li>
            <li><label className={filter==="done"?"active":""}><input type="radio" checked={filter==="done"} onClick={() => setFilter("done")}/> Done</label></li>
        </ul>
        {' '}
        <List segments={visibleSegments}/>
    </>;
};


export const getServerSideProps: GetServerSideProps<HomeProps> = async ({req}) => {


    const {accessToken, refreshToken} = await new Promise((resolve, reject) => {
        // @ts-ignore
        const currentRefreshToken = req.user.refreshToken;
        refresh.requestNewAccessToken('strava', currentRefreshToken, (err: { statusCode: number; data?: any }, accessToken: string, refreshToken: string) => {
                err ? reject(err) : resolve({accessToken, refreshToken})
            }
        )
    });

    // @ts-ignore
    req.session.passport.user.accessToken = accessToken;
    // @ts-ignore
    req.session.passport.user.refreshToken = refreshToken;


    // @ts-ignore
    const strava = new stravaApi.client(accessToken) as Strava;
    const segmentDetails = await Promise.all(segments.map(_ => strava.segments.get({id: _.id}).then(segment => ({...segment, ..._}))));

    // @ts-ignore
    return {props: {user: req.user, segmentDetails}};
};

export default Home;

