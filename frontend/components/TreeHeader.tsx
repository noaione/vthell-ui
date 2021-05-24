import React from "react";

import FilmIcon from "@heroicons/react/solid/FilmIcon";
import AudioIcon from "@heroicons/react/solid/MusicNoteIcon";
import ImageIcon from "@heroicons/react/solid/PhotographIcon";
import FileIcon from "@heroicons/react/solid/DocumentIcon";
import TextIcon from "@heroicons/react/solid/DocumentTextIcon";
import FolderIcon from "@heroicons/react/solid/FolderIcon";
import FolderOpenIcon from "@heroicons/react/solid/FolderOpenIcon";

import { isType } from "../lib/utils";
import { NodeTree } from "../lib/filter";

function determineIcon(fileType: string) {
    if (!isType(fileType, "string")) return FileIcon;
    if (fileType.startsWith("text/")) {
        return TextIcon;
    } else if (fileType.startsWith("audio/")) {
        return AudioIcon;
    } else if (fileType.startsWith("video/")) {
        return FilmIcon;
    } else if (fileType.startsWith("image/")) {
        return ImageIcon;
    }
    return FileIcon;
}

interface HeaderProps {
    onSelect?: (node: NodeTree) => void;
    style?: { [key: string]: React.CSSProperties };
    customStyles?: { [key: string]: React.CSSProperties };
    node: NodeTree;
}

export default function TreeHeader(props: HeaderProps) {
    const { node } = props;

    let InlineIcon = FolderIcon;
    if (node.type === "file") {
        InlineIcon = determineIcon(node.mimetype);
    } else {
        if (node.toggled) {
            InlineIcon = FolderOpenIcon;
        }
    }

    return (
        <div className="inline-block">
            <InlineIcon className="w-4 h-4 inline-block mr-0.5" />
            {node.name}
        </div>
    );
}
