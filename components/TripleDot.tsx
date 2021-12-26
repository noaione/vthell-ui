import React, { useEffect, useState } from "react";

export default function TripleDot() {
    const [dotState, setDotState] = React.useState(0);
    useEffect(() => {
        setInterval(() => {
            setDotState((dotState) => (dotState + 1) % 3);
        }, 500);
    }, []);

    let dots = "";
    for (let i = 0; i < dotState + 1; i++) {
        dots += ".";
    }

    return <span>Loading{dots}</span>;
}
