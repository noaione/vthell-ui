import BaseIconClass from "./Base";
import type { ExtraIconClass } from "./_types";

export default function SearchIcon(props: ExtraIconClass) {
    return (
        <BaseIconClass {...props} outlined>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </BaseIconClass>
    );
}
