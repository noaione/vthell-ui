import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import { NodeTree } from "../model";
import { isNone, Nullable } from "../utils";
import { expandFilteredNodes, filterTree } from "../palmtree";

interface RecordReduxState {
    tree: NodeTree | null;
    filtered: NodeTree | null;
    active: NodeTree | null;
    searchQuery: string;
}

const initialState: RecordReduxState = {
    tree: null,
    filtered: null,
    active: null,
    searchQuery: "",
};

interface NodeTreeWithToggleOption {
    node: NodeTree;
    toggle: boolean;
}

function recurseFindNodeAndReplace(tree: NodeTree, target: NodeTree) {
    if (tree.id === target.id) {
        return Object.assign({}, target);
    }
    if (tree.children) {
        tree.children = tree.children.map((node) => recurseFindNodeAndReplace(node, target));
    }
    return tree;
}

function safelyDeleteProperties(obj: any, properties: string[]) {
    properties.forEach((property) => {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(property)) {
            delete obj[property];
        }
    });
}

function rebuildTree(tree: NodeTree) {
    if (!tree) {
        return tree;
    }
    if (tree.type === "file") {
        safelyDeleteProperties(tree, ["children", "toggled", "active"]);
    } else if (tree.type === "folder") {
        if (tree.children === null) {
            tree.children = [];
        }
        if (tree.toggled === null) {
            tree.toggled = false;
        }
        // @ts-ignore
        tree.children = tree.children.map((child) => rebuildTree(child));
    }
    return tree;
}

function filterPalmTree(tree?: NodeTree | null, search: string = ""): Nullable<NodeTree> | undefined {
    search = search.trim();
    if (search.length < 1) {
        return null;
    }
    if (isNone(tree)) {
        return undefined;
    }
    const filtered = filterTree(tree, search);
    return expandFilteredNodes(filtered, search);
}

export const recordsReducer = createSlice({
    name: "records",
    initialState,
    reducers: {
        setTree: (state, action: PayloadAction<NodeTree>) => {
            state.tree = rebuildTree(action.payload);
            state.filtered = null;
            const filtered = filterPalmTree(state.tree, state.searchQuery);
            if (typeof filtered === "undefined") {
                return;
            }
            state.filtered = filtered;
        },
        resetState: (state) => {
            state.active = null;
            state.searchQuery = "";
            state.tree = null;
            state.filtered = null;
        },
        searchTree: (state, action: PayloadAction<string>) => {
            const { payload } = action;
            state.searchQuery = payload.trim();
            const filtered = filterPalmTree(state.tree, payload);
            if (typeof filtered === "undefined") {
                return;
            }
            state.filtered = filtered;
        },
        setActive: (state, action: PayloadAction<NodeTree | NodeTreeWithToggleOption>) => {
            const { payload } = action;
            const useKey = isNone(state.filtered) ? "tree" : "filtered";
            if (state.active !== null) {
                const old = Object.assign({}, state.active, { active: false });
                if (state[useKey]) {
                    // @ts-ignore
                    state[useKey] = recurseFindNodeAndReplace(state[useKey], old);
                    if (useKey === "filtered") {
                        // @ts-ignore
                        state.tree = recurseFindNodeAndReplace(state.tree, old);
                    }
                }
            }
            // check if "node" key exist
            if (Object.keys(payload).includes("node")) {
                const { node, toggle } = payload as NodeTreeWithToggleOption;
                let modifiedNode = Object.assign({}, node, { active: true });
                if (node.children) {
                    modifiedNode = Object.assign({}, modifiedNode, { toggled: toggle });
                }
                if (state[useKey]) {
                    // @ts-ignore
                    state[useKey] = recurseFindNodeAndReplace(state[useKey], modifiedNode);
                    if (useKey === "filtered") {
                        // @ts-ignore
                        state.tree = recurseFindNodeAndReplace(state.tree, old);
                    }
                }
                state.active = modifiedNode;
            } else {
                const node = payload as NodeTree;
                let modifiedNode = Object.assign({}, node, { active: true });
                if (node.children) {
                    modifiedNode = Object.assign({}, modifiedNode, { toggled: true });
                }
                state.active = modifiedNode;
            }
        },
    },
});

export const { setTree, setActive, searchTree, resetState } = recordsReducer.actions;
export const selectPalmTree = (state: RootState) => state.records.tree;
export const selectPalmBranch = (state: RootState) => {
    if (!isNone(state.records.filtered)) {
        return state.records.filtered;
    }
    return state.records.tree;
};

export default recordsReducer.reducer;
