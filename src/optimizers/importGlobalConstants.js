import {isNodeIdentifier, isNodeOfType} from "../nodeTypeUtilities.js";
import {parseJsExpression} from "../parseUtils.js";

export function replaceMemberExpressionToValue(obj, key) {
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