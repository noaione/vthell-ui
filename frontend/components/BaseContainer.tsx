import React from "react";

import { isType } from "../lib/utils";

export default function BaseContainer(
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {
    const { children, className, ...extracted } = props;

    let extraClass = "";
    if (isType(className, "string")) {
        extraClass += className + " ";
    }

    return (
        <div {...extracted} className={`md:w-2/3 m-auto shadow-md rounded-lg ${extraClass}`}>
            {children}
        </div>
    );
}
