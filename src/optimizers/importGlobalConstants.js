import {isNodeIdentifier, isNodeOfType} from "../nodeTypeUtilities.js";
import {buildLiteralNode} from "../parseUtils.js";

export function replaceMemberExpressionToValue(obj, key) {
    var memberExpression = obj[key]
    if (!isNodeOfType(memberExpression, 'MemberExpression'))
        return false
    if (!isNodeIdentifier(memberExpression.object) || !isNodeIdentifier(memberExpression.property))
        return false
    var globalObj = global[memberExpression.object.name]
    if (typeof globalObj !== 'object')
        return false
    var constantName = memberExpression.property.name
    var constValue = globalObj[constantName]
    var constType = typeof constValue
    if (constType === 'function' || constType === 'object') {
        return false
    }
    obj[key] = buildLiteralNode(constValue)
    return true
}
