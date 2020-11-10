import {visitEveryBlock} from "../visitorUtils.js";
import {isLabelOrJump} from "../reducers/labels/labelUtilities.js";
import {isNodeEfectivelyLiteral, isNodeOfType} from "../nodeTypeUtilities.js";
import {extractLeftRightAssignmentOfNode} from "./propagateConstantsInBlock.js";
import {parseJsExpression, printAst} from "../parseUtils.js";

function applyOperationOnLiteral(expressionNode) {
    var code = printAst(expressionNode)
    var resultEval = eval(code)
    var result = parseJsExpression(resultEval)
    return result
}

function simplifyBinaryOp(targetObj, propKey) {
    var node = targetObj[propKey]
    if (!isNodeOfType(node, 'BinaryExpression'))
        return
    if (!isNodeEfectivelyLiteral(node.left) || !isNodeEfectivelyLiteral(node.right))
        return
    var literal = applyOperationOnLiteral(node)
    targetObj[propKey] = literal
    return true
}

export function optimizeExpressions(parentAst) {
    var result = false;
    visitEveryBlock(parentAst, blockNode => {
        var constantsMap = new Map()
        var arr = blockNode.body
        arr.forEach(childNode=>{
            var leftRightAssignment = extractLeftRightAssignmentOfNode(childNode)
            if (!leftRightAssignment)
                return
            var {left, right, targetObj, propKey} = leftRightAssignment;
            result = simplifyBinaryOp(targetObj, propKey) || result

            if (isLabelOrJump(childNode)) {
                constantsMap.clear()

            }
        })
    })
    return result
}
