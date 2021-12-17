import BaseIconClass from "./Base";
import type { ExtraIconClass } from "./_types";

export default function ImageIcon(props: ExtraIconClass) {
    return (
        <BaseIconClass {...props}>
            <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
            />
        </BaseIconClass>
    );
}
