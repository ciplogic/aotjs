
export function isNodeOfType(node, nodeType) {
    return node && node.type === nodeType
}

export function isNodeIdentifier(node) {
    return isNodeOfType(node, 'Identifier')
}

export function isNodeLiteral(node) {
    return isNodeOfType(node, 'Literal')
}

export function isNodeLiteralOrIdentifier(node) {
    return isNodeLiteral(node) || isNodeIdentifier(node)
}
