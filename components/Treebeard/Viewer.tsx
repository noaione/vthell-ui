import React from "react";

import { NodeTree } from "@/lib/model";
import { humanizeBytes, parseUnix } from "@/lib/utils";

const HELP_MSG = "Select a File/Folder to see It's Information.";

export function countFolderSizesRecurce(
    node: NodeTree,
    cb: (size: number) => void,
    cb2: (node: NodeTree) => void
) {
    const children = node.children ?? [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "file") {
            if (typeof cb === "function") {
                cb(child.size ?? 0);
            }
            if (typeof cb2 === "function") {
                cb2(child);
            }
        } else if (child.type === "folder") {
            countFolderSizesRecurce(child, cb, cb2);
        }
    }
}

interface NodeViewerProps {
    node: NodeTree;
}

export default function NodeViewer(props: NodeViewerProps) {
    const { node } = props;
    if (!node) {
        return (
            <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5">
                {HELP_MSG}
            </div>
        );
    }
    if (node.loading) {
        return (
            <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5">
                {HELP_MSG}
            </div>
        );
    }

    const { type, name } = node;

    if (type === "folder" || name === "Stream Archive") {
        let finalSize = 0;
        let fileCount = 0;
        const cb = (data: number) => (finalSize += data);
        const fcCount = () => fileCount++;
        countFolderSizesRecurce(node, cb, fcCount);

        return (
            <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5">
                <h2 className="text-lg font-semibold">{name}</h2>
                <p>
                    <span className="font-semibold">Total sizes</span>: {humanizeBytes(finalSize)}
                </p>
                <p>
                    <span className="font-semibold">Total files</span>: {fileCount.toLocaleString()} files
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5">
            <h2 className="text-xl font-semibold">File Information</h2>
            <p className="mb-2">{name}</p>
            <p>
                <span className="font-semibold">Size:</span> {humanizeBytes(node.size ?? 0)}
            </p>
            <p>
                <span className="font-semibold">Last Modified:</span> {parseUnix(node.modtime ?? 0)}
            </p>
            <p>
                <span className="font-semibold">Type:</span> {node.mimetype}
            </p>
        </div>
    );
}
