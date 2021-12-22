import BaseIconClass from "./Base";
import type { ExtraIconClass } from "./_types";

export default function FolderIcon(props: ExtraIconClass) {
    return (
        <BaseIconClass {...props}>
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </BaseIconClass>
    );
}
