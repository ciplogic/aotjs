import {findExpressionInBlock} from "../visitorUtils.js";

import {replaceMemberExpressionToValue} from "./importGlobalConstants.js";
import {propagateConstantsInBlock} from "./propagateConstantsInBlock.js";
import {optimizeExpressions} from "./expressionCalculator.js";


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
    var didOptimize = false;
    do {
        var canOptimize = replaceGlobalConstants(parentAst)
        canOptimize = propagateConstantsInBlock(parentAst) || canOptimize
        canOptimize = optimizeExpressions(parentAst)
        didOptimize = didOptimize || canOptimize
    }while (canOptimize)
    return didOptimize
}