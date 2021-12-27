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
    | "ERROR"
    // Cancelled status, same thing as error but it will not be reloaded again
    | "CANCELLED";

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

export interface NodeTree {
    id?: string | number;
    type?: "file" | "folder";
    size?: number;
    mimetype?: string;
    modtime?: number;
    name: string;
    toggled?: boolean;
    active?: boolean;
    loading?: boolean;
    children?: NodeTree[];
}

export type AutoSchedulerType = "word" | "regex" | "channel" | "group";

export interface AutoSchedulerBase {
    type: AutoSchedulerType;
    data: string;
}

export interface AutoScheduler extends AutoSchedulerBase {
    id?: number;
    chains: AutoSchedulerBase[] | null;
    enabled: boolean;
}
