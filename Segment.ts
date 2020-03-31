export default interface Segment {
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
