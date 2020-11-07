import {isNodeIdentifier, isNodeLiteral, isNodeOfType} from "../nodeTypeUtilities.js";
import {visitEveryBlock} from "../visitorUtils.js";
import {isLabelOrJump} from "../reducers/labels/labelUtilities.js";


export function extractLeftRightAssignmentOfNode(node) {
    var targetObj;
    if (isNodeOfType(node, 'VariableDeclaration')) {
        targetObj = node.declarations[0]
        var left = targetObj.id
        var right = targetObj.init
        var propKey = 'init'
    } else if (isNodeOfType(node, "ExpressionStatement") && (node.expression.type !== 'AssignmentExpression')) {
        targetObj = node.expression;
        var left = targetObj.left
        var right = targetObj.right
        var propKey = 'right'
    } else {
        return
    }
    return {left, right, targetObj, propKey}
}

function extractConstants(node, constantsMap) {
    var leftRightAssignment = extractLeftRightAssignmentOfNode(node)
    if (!leftRightAssignment)
        return
    var {left, right} = leftRightAssignment;
    if (!isNodeIdentifier(left))
        return
    if (!isNodeLiteral(right))
        return
    constantsMap.set(left.name, right)
}

function updateConstantIfNeeded(obj, propKey, constantMap) {
    var right = obj[propKey]
    if (!isNodeIdentifier(right)) {
        return false
    }
    var result = constantMap.get(right.name)
    if (!result)
        return false
    obj[propKey] = {...result}
    return true
}

function applyConstantsInRightHand(node, constantsMap) {
    var leftRightAssignment = extractLeftRightAssignmentOfNode(node)
    if (!leftRightAssignment)
        return
    var {left, right, targetObj, propKey} = leftRightAssignment;

    if (updateConstantIfNeeded(targetObj, propKey, constantsMap)) {
        return true
    }
    if (isNodeOfType(right, 'BinaryExpression')) {
        var changedLeft = updateConstantIfNeeded(right, 'left', constantsMap);
        var changedRight = updateConstantIfNeeded(right, 'right', constantsMap);
        return changedLeft || changedRight
    }
}

export function propagateConstantsInBlock(node) {
    var result = false;
    visitEveryBlock(node, blockNode => {
        var constantsMap = new Map()
        var arr = blockNode.body
        for (var i = 0; i < arr.length; i++) {
            var childNode = arr[i]

            extractConstants(childNode, constantsMap)
            result = applyConstantsInRightHand(childNode, constantsMap) || result

            if (isLabelOrJump(childNode)) {
                constantsMap.clear()

            }

        }
    })
    return result
}