import React from "react";
import type { ExtraIconClass } from "./_types";

interface PathChild {
    children: React.ReactNode;
    outlined?: boolean;
}

export default class BaseIconClass extends React.Component<ExtraIconClass & PathChild> {
    render() {
        const { className, outlined } = this.props;
        let defaultClass = "h-5 w-5";
        if (typeof className === "string" && className.trim().length > 0) {
            defaultClass += ` ${className}`;
        }
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={defaultClass}
                viewBox={outlined ? "0 0 24 24" : "0 0 20 20"}
                fill={outlined ? "none" : "currentColor"}
                stroke={outlined ? "currentColor" : undefined}
            >
                {this.props.children}
            </svg>
        );
    }
}
