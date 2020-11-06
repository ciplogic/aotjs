import {getStatement, parseJsExpression} from "../parseUtils.js";
import {arrayInsertAt, joinArrays, subarray} from "../utilities.js";

var idx = 0;

export function extractVar(assignedExpression, block, idxStatement) {
    var varName = '__var' + idx++
    var varExpr = getStatement('var ' + varName + ' = 1')
    varExpr.declarations[0].init = assignedExpression
    arrayInsertAt(block, idxStatement, varExpr)

    var varIdentifier = parseJsExpression(varName)

    return {varName, varExpr, varIdentifier}
}

export function extractVarByProperty(obj, key, parent, idxStatement) {
    const rightVar = extractVar(obj[key], parent.body, idxStatement)
    obj[key] = rightVar.varIdentifier
}

export function replaceExpressionWithArray(block, idxStatement, replaceArr) {
    var beforeArr = subarray(block.body, 0, idxStatement)
    var afterArr = subarray(block.body, idxStatement + 1)
    var newBody = joinArrays(beforeArr, replaceArr, afterArr)
    block.body = newBody
}
