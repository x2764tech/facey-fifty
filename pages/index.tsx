import * as React from 'react';
import {GetServerSideProps} from 'next';
import stravaApi, {Strava} from 'strava-v3';
import segments from '../segments.json';

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

interface Segment {
    id: string;
    name: string;
    activity_type: "Ride" | "Run";
    distance: number;
    average_grade: number
    maximum_grade: number
    elevation_high: number
    elevation_low: number
    start_latlng: number[]
    end_latlng: number[]
    start_latitude: number
    start_longitude: number
    end_latitude: number
    end_longitude: number
    climb_category: 0 | 1 | 2 | 3 | 4 | 5
    city: string
    state: string
    country: string
    private: boolean
    hazardous: boolean
    starred: boolean
    created_at: Date
    updated_at: Date
    total_elevation_gain: number
    map: { id: string, polyline: string, resource_state: number },
    effort_count: number
    athlete_count: number
    star_count: number
    athlete_segment_stats: { pr_elapsed_time: number, pr_date: Date, effort_count: number }
}

const Home = ({user, segmentDetails}: HomeProps) => <>
    <style jsx>{`
        table {
            width: 100%
        }
        td, tr {
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
    <h1>Hello <span>{user.firstname} {user.lastname}</span></h1>
    <table>
        <colgroup>
            <col/>
            <col className="data"/>
            <col className="data"/>
            <col className="data"/>
            <col className="data"/>
            <col className="data"/>
            <col className="data"/>
        </colgroup>
        <thead>
        <tr>
            <td/>
            <th>Climb</th>
            <th>Distance</th>
            <th>Avg Grade</th>
            <th>Max Grade</th>
            <th>Your time</th>
            <th>Number of attempts</th>
        </tr>
        </thead>
        <tbody>
        {segmentDetails.map(s => ({...s, number: +s.name.replace(/Facey Fifty - No (\d+) -.+/, (_, number) => number)}))
            .sort((a, b) => a.number - b.number)
            .map(s =>
                <tr key={s.id}
                    style={{backgroundColor: s.athlete_segment_stats.effort_count ? 'lightgreen' : 'lightred'}}>

                    <td><a href={`https://www.strava.com/segments/${s.id}`}
                           target="_blank">{s.name.replace(/^\s*Facey Fifty - /, "")}</a></td>
                    <td className="data">{Math.ceil((s.elevation_high - s.elevation_low) * 3.28084)}ft</td>
                    <td className="data">{(s.distance * 0.0006213712).toFixed(2)} miles</td>
                    <td className="data">{s.average_grade}%</td>
                    <td className="data">{s.maximum_grade}%</td>
                    <td className="data">{formatTime(s.athlete_segment_stats.pr_elapsed_time)}</td>

                    <td className="data">{s.athlete_segment_stats.effort_count}</td>
                </tr>
            )
        }
        </tbody>
    </table>
</>;


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
    const segmentDetails = await Promise.all(segments.map(_ => strava.segments.get({id: _.id})));

    // @ts-ignore
    return {props: {user: req.user, segmentDetails}};
};

export default Home;

