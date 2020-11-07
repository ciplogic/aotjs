import {visitEveryBlock} from "../visitorUtils.js";
import {isLabelOrJump} from "../reducers/labels/labelUtilities.js";
import {isNodeLiteral, isNodeOfType} from "../nodeTypeUtilities.js";
import {extractLeftRightAssignmentOfNode} from "./propagateConstantsInBlock.js";
import {buildLiteralNode, printAst} from "../parseUtils.js";

function applyOperationOnLiteral(op, left, right) {
    var leftVal = left.value
    var rightVal = right.value
    //don't use eval, do it manually
    switch (op) {
        case '*':
            return leftVal * rightVal
        case '+':
            return leftVal + rightVal
        case '-':
            return leftVal - rightVal
        default:
            throw new Error("Cannot handle operator: " + op)
    }
}

function simplifyBinaryOp(targetObj, propKey) {
    var node = targetObj[propKey]
    if (!isNodeOfType(node, 'BinaryExpression'))
        return
    if (!isNodeLiteral(node.left) || !isNodeLiteral(node.right))
        return
    var literal = applyOperationOnLiteral(node.operator, node.left, node.right)
    targetObj[propKey] = buildLiteralNode(literal);
    return true
}

export function optimizeExpressions(parentAst) {
    var result = false;
    visitEveryBlock(parentAst, blockNode => {
        var constantsMap = new Map()
        var arr = blockNode.body
        for (var i = 0; i < arr.length; i++) {
            var childNode = arr[i]
            var leftRightAssignment = extractLeftRightAssignmentOfNode(childNode)
            if (!leftRightAssignment)
                continue
            var {left, right, targetObj, propKey} = leftRightAssignment;
            result = simplifyBinaryOp(targetObj, propKey) || result

            if (isLabelOrJump(childNode)) {
                constantsMap.clear()

            }

        }
    })
    return result
}