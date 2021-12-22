import BaseIconClass from "./Base";
import type { ExtraIconClass } from "./_types";

export default function LoginIcon(props: ExtraIconClass) {
    return (
        <BaseIconClass {...props} outlined>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
        </BaseIconClass>
    );
}
