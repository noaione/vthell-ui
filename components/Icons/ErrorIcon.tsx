import BaseIconClass from "./Base";
import type { ExtraIconClass } from "./_types";

export default function ErrorIcon(props: ExtraIconClass) {
    return (
        <BaseIconClass {...props} outlined>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </BaseIconClass>
    );
}
