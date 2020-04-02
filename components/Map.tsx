import L from "leaflet";
import * as RL from 'react-leaflet';
import polyline from '@mapbox/polyline';
import Segment from '../Segment';
import React from 'react';

export type Category = 0 | 1 | 2 | 3 | 4 | 5;

const icons = new Map<Category, L.DivIcon>();

export default ({segments}: { segments: Segment[] }) => {

    const getIcon = (c: Category, description: string): L.DivIcon | undefined => {
        if (!icons.has(c)) icons.set(c, L.divIcon({html: description}));
        return icons.get(c);
    };
    const maxLatitude = Math.max(...segments.map(_ => Math.max(_.start_latitude, _.end_latitude)));
    const minLatitude = Math.min(...segments.map(_ => Math.min(_.start_latitude, _.end_latitude)));

    const maxLongitude = Math.max(...segments.map(_ => Math.max(_.start_longitude, _.end_longitude)));
    const minLongitude = Math.min(...segments.map(_ => Math.min(_.start_longitude, _.end_longitude)));

    return <RL.Map bounds={[[minLatitude, minLongitude], [maxLatitude, maxLongitude]]}>
        {/*
        https://a.tile.openstreetmap.org/${z}/${x}/${y}.png https://b.tile.openstreetmap.org/${z}/${x}/${y}.png https://c.tile.openstreetmap.org/${z}/${x}/${y}.png
        */}
        <RL.TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            subdomains={["a", "b", "c"]}
            minZoom={1}
            maxZoom={19}
        />
        <RL.TileLayer
            url='https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png'
            attribution='Wikimedia Labs | Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            maxZoom={16}
            />
        {segments.map(segment =>
            <React.Fragment key={segment.id}>

                {/*<RL.Marker position={[segment.start_latitude, segment.start_longitude]}>

                </RL.Marker>*/}
                <RL.Polyline
                    color={segment.athlete_segment_stats.effort_count ? 'lime' : 'black'}
                    positions={polyline.decode(segment.map.polyline).map(latLngArray => new L.LatLng(latLngArray[0], latLngArray[1]))}>
                    <RL.Popup>
                        {segment.name}
                    </RL.Popup>
                </RL.Polyline>
            </React.Fragment>
        )
        }
    </RL.Map>;
}
