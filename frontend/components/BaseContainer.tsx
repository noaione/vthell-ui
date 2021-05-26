import React from "react";

import { isType } from "../lib/utils";

export default function BaseContainer(
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        removeShadow?: boolean;
    }
) {
    const { children, className, removeShadow, ...extracted } = props;

    let extraClass = "";
    if (isType(className, "string")) {
        extraClass += className + " ";
    }

    return (
        <div
            {...extracted}
            className={`w-full m-auto md:w-2/3 ${!removeShadow ? "shadow-md" : ""} rounded-lg ${extraClass}`}
        >
            {children}
        </div>
    );
}
