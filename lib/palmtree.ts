import { NodeTree } from "./model";

export function defaultMatcher(filterText: string, node: NodeTree) {
    return node.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
}

export type MatcherFunc = typeof defaultMatcher;

export function findNode(node: NodeTree, filter: string, matcher: MatcherFunc) {
    return (
        matcher(filter, node) ||
        (node.children &&
            node.children.length &&
            !!node.children.find((child) => findNode(child, filter, matcher)))
    );
}

export function filterTree(node: NodeTree, filter: string, matcher: MatcherFunc = defaultMatcher) {
    if (matcher(filter, node) || !node.children) {
        return node;
    }
    const filtered = node.children
        .filter((child) => findNode(child, filter, matcher))
        .map((child) => filterTree(child, filter, matcher));
    return Object.assign({}, node, { children: filtered });
}

export function expandFilteredNodes(node: NodeTree, filter: string, matcher: MatcherFunc = defaultMatcher) {
    let children = node.children;
    if (!children || children.length < 1) {
        return Object.assign({}, node, { toggled: false });
    }
    let childrenWithMatches = node.children?.filter((child) => findNode(child, filter, matcher));
    if (typeof childrenWithMatches === "undefined") {
        childrenWithMatches = [];
    }
    const shouldExpand = childrenWithMatches.length > 0;
    if (shouldExpand) {
        children = childrenWithMatches.map((child) => {
            return expandFilteredNodes(child, filter, matcher);
        });
    }
    return Object.assign({}, node, {
        children,
        toggled: shouldExpand,
    });
}
