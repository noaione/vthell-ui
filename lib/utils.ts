import { DateTime } from "luxon";

export type Nullable<T> = T | null;
export type NoneType = null | undefined;
export type NoneAble<T> = T | NoneType;
export type JSTypeof =
    | "string"
    | "function"
    | "bigint"
    | "number"
    | "boolean"
    | "undefined"
    | "object"
    | "symbol"
    | "array"; // Extra addition

export function capitalizeLetters(text: string) {
    return text.slice(0, 1).toUpperCase() + text.slice(1);
}

export function isType<T>(data: T, type: JSTypeof): data is typeof data {
    if (type === "array" && Array.isArray(data)) {
        return true;
    }
    return typeof data === type;
}

export function isNone(data: any): data is NoneType {
    return data === null || typeof data === "undefined";
}

export function walk(data: any, note: string) {
    const nots = note.split(".");
    for (let i = 0; i < nots.length; i++) {
        if (isNone(data)) {
            break;
        }
        const n = nots[i];
        data = data[n];
    }
    return data;
}

export function humanizeBytes(bytes: number): string {
    const sizes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
    if (bytes === 0) return "0 B";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)) as unknown as string);
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

export function parseUnix(unix: number): string {
    const dt = DateTime.fromSeconds(unix, { zone: "UTC" });
    return dt.toLocaleString({
        weekday: "short",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function buildPath(baseUrl: string, extraPaths: string[]): string {
    if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
    }
    let path = baseUrl;
    for (const p of extraPaths) {
        if (p.startsWith("/")) {
            path += p;
        } else {
            path += "/" + p;
        }
    }
    return path;
}

export function selectSingle(query: string | string[]) {
    if (isNone(query)) {
        return "";
    }
    if (typeof query === "string") {
        return query;
    }
    return query[0];
}
