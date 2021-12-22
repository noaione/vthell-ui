import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

export default function DynamicDateTime(props: { unix: number }) {
    const [zone, setZone] = useState("UTC");

    useEffect(() => {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (typeof timezone === "string") {
                setZone(timezone);
            }
        } catch (e) {
            // who the fuck use this browser anymore
            return;
        }
    }, []);

    const date = DateTime.fromSeconds(props.unix, { zone: "UTC" }).setZone(zone);

    return (
        <span>
            {date.toLocaleString({
                weekday: "short",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }) +
                " UTC" +
                date.toFormat("Z")}
        </span>
    );
}
