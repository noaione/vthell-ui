export type VTHellJobStatus =
    // Not downloading
    | "WAITING"
    // Currently being processed
    | "PREPARING"
    // Download has been called
    | "DOWNLOADING"
    // Download complete, now muxing
    | "MUXING"
    // Muxing complete, now uploading
    | "CLEANING"
    // Upload complete, now cleaning up
    | "UPLOAD"
    // Cleanup complete, now done
    | "DONE"
    // Error
    | "ERROR";

export interface VTHellJob {
    id: string;
    title: string;
    filename: string;
    start_time: number;
    channel_id: string;
    is_member: boolean;
    status: VTHellJobStatus;
    resolution: string | null;
    error: string | null;
    path?: string;
}
