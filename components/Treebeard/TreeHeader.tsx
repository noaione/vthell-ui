import React from "react";

import FilmIcon from "../Icons/FilmIcon";
import AudioIcon from "../Icons/MusicNoteIcon";
import ImageIcon from "../Icons/ImageIcon";
import FileIcon from "../Icons/DocumentIcon";
import TextIcon from "../Icons/DocumentTextIcon";
import FolderIcon from "../Icons/FolderIcon";
import FolderOpenIcon from "../Icons/FolderOpenIcon";

import { isType } from "@/lib/utils";
import { NodeTree } from "@/lib/model";

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
        InlineIcon = determineIcon(node.mimetype ?? "unknown/unknown");
    } else {
        if (node.toggled) {
            InlineIcon = FolderOpenIcon;
        }
    }

    return (
        <div className="inline-block">
            <InlineIcon className="w-4 h-4 inline-block mr-0.5" />
            <span>{node.name}</span>
        </div>
    );
}
