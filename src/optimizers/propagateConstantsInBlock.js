import {isNodeEfectivelyLiteral, isNodeIdentifier, isNodeLiteral, isNodeOfType} from "../nodeTypeUtilities.js";
import {getBlockArr, visitEveryBlock} from "../visitorUtils.js";
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
    return {leftNode: left, rightNode: right, targetObj, propKey}
}

function extractConstants(node, constantsMap) {
    var leftRightAssignment = extractLeftRightAssignmentOfNode(node)
    if (!leftRightAssignment)
        return
    var {leftNode, rightNode} = leftRightAssignment;
    if (!isNodeIdentifier(leftNode))
        return
    if (isNodeEfectivelyLiteral(rightNode)) {
        constantsMap.set(leftNode.name, rightNode)
    }
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

function updateConstantsOnExpression(obj, propKey, constantsMap) {

    var right = obj[propKey]
    if (isNodeLiteral(right))
        return
    if (isNodeIdentifier(right)) {
        return updateConstantIfNeeded(obj, propKey, constantsMap)
    }
    if (isNodeOfType(right, 'BinaryExpression')) {
        var changedLeft = updateConstantsOnExpression(right, 'left', constantsMap);
        var changedRight = updateConstantsOnExpression(right, 'right', constantsMap);
        return changedLeft || changedRight
    }
    if (isNodeOfType(right, 'CallExpression') || isNodeOfType(right, 'NewExpression')) {
        var accumulator = false;
        var args = right.arguments
        args.forEach((arg, index) => {
            accumulator = updateConstantsOnExpression(args, index, constantsMap) || accumulator
        })
        return accumulator;
    }
}

function applyConstantsInRightHand(node, constantsMap) {
    var leftRightAssignment = extractLeftRightAssignmentOfNode(node)
    if (!leftRightAssignment)
        return
    var {leftNode, rightNode, targetObj, propKey} = leftRightAssignment;

    return updateConstantsOnExpression(targetObj, propKey, constantsMap)
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

export function propagateGlobalConstants(node) {
    var constantsMap = new Map()
    var arr = getBlockArr(node);
    arr.forEach(childNode => {
        if (isNodeOfType(childNode, 'VariableDeclaration')) {
            extractConstants(childNode, constantsMap)
        }
    })
    if (!constantsMap.size)
        return

    var result = false
    visitEveryBlock(node, blockNode => {
        blockNode.body.forEach(childNode => {
            result = applyConstantsInRightHand(childNode, constantsMap) || result
        })
    })
    result = true;
}
