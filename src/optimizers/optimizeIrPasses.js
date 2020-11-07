import {findExpressionInBlock} from "../visitorUtils.js";

import {isNodeOfType, isNodeIdentifier} from "../nodeTypeUtilities.js";
import {parseJsExpression} from "../parseUtils.js";

function replaceMemberExpressionToValue(obj, key) {
    var memberExpression = obj[key]
    if (!isNodeOfType(memberExpression,'MemberExpression'))
        return false
    if (!isNodeIdentifier(memberExpression.object) || !isNodeIdentifier(memberExpression.property))
        return false
    var apiObj = memberExpression.object.name
    var globalObj = global[apiObj]
    if (typeof globalObj!== 'object')
        return false
    var constantName = memberExpression.property.name
    var constValue = globalObj[constantName]
    var typeOfVal = typeof constValue;
    if (typeOfVal === 'number') {
        var literal = parseJsExpression(''+constValue)
        obj[key] = literal
        return true
    }
    if (typeOfVal === 'string') {
        var literal = parseJsExpression('"'+constValue+'"')
        obj[key] = literal
        return true
    }

    return false
}

function replaceGlobalConstants(parentAst) {
    var result = false;
    findExpressionInBlock(parentAst, 'VariableDeclaration', (node, parent, idxStatement) => {

        result |= replaceMemberExpressionToValue(node.declarations[0], 'init')
    })
    findExpressionInBlock(parentAst, 'ExpressionStatement', (node, parent, idxStatement) => {
        if (node.expression.type !== 'AssignmentExpression')
            return
        result |= replaceMemberExpressionToValue(node.expression, 'right')
    })
    return result
}

export function optimizeIr(parentAst) {
    do{
        var canOptimize = replaceGlobalConstants(parentAst)
    }while (canOptimize)
}