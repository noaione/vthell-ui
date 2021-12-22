import BaseIconClass from "./Base";
import type { ExtraIconClass } from "./_types";

export default function PlusIcon(props: ExtraIconClass) {
    return (
        <BaseIconClass {...props}>
            <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
            />
        </BaseIconClass>
    );
}
