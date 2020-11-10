
export function isNodeOfType(node, nodeType) {
    return node && node.type === nodeType
}

export function isNodeIdentifier(node) {
    return isNodeOfType(node, 'Identifier')
}

export function isNodeLiteral(node) {
    return isNodeOfType(node, 'Literal')
}

export function isNodeEfectivelyLiteral(right) {
    return isNodeLiteral(right) || (isNodeOfType(right, 'UnaryExpression') && isNodeLiteral(right.argument))
}

export function isNodeLiteralOrIdentifier(node) {
    return isNodeLiteral(node) || isNodeIdentifier(node)
}

export function getVarDeclaration(varNode) {
    if(!isNodeOfType(varNode, 'VariableDeclaration'))
        return
    return varNode.declarations[0]
}

export function isNodeEffectivelyLiteralOrIdentifier(node) {
    return isNodeEfectivelyLiteral(node) || isNodeIdentifier(node)
}
