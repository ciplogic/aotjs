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
    switch (typeOfVal) {
        case 'number':
            obj[key] = parseJsExpression('' + constValue)
            return true
        case 'string':
            obj[key] = parseJsExpression('"' + constValue + '"')
            return true
    }

    return false
}