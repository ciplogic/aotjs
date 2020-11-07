import {parseJsExpression} from "../../parseUtils.js";

function getFunctionName(node) {
    if (node.type !== 'ExpressionStatement')
        return ''
    var callExpression = node.expression;
    if (callExpression.type !== 'CallExpression')
        return ''
    if (callExpression.callee.type !== 'Identifier')
        return '';
    return callExpression.callee.name
}

var jumpCallNames = ['__label', '__ifTrue', '__goto']

export function isLabelOrJump(node) {
    var functionCallName = getFunctionName(node)
    return jumpCallNames.indexOf(functionCallName) >= 0
}

export function getLabelId(node) {
    return node.expression.arguments[0].value
}

export function extractJumpNodes(blockNode) {
    var jumpNodes = []
    blockNode.body.forEach(
        (node, index) => {
            if (isLabelOrJump(node)) {
                var functionName = getFunctionName(node)
                var stateJump = {
                    isJump: functionName !== '__label',
                    targetId: getLabelId(node),
                    idx: index,
                    node,
                    name: functionName,
                }
                jumpNodes.push(stateJump)
            }
        }
    )
    return jumpNodes
}

export function updateTarget(jumpNode, oldTarget, newTarget) {
    if (oldTarget !== jumpNode.targetId)
        return

    var literal = parseJsExpression('' + newTarget)
    jumpNode.node.expression.arguments[0] = literal
}
