import {findExpressionInBlock, visitEveryBlock} from "../visitorUtils.js";

import {replaceMemberExpressionToValue} from "./importGlobalConstants.js";
import {isLabelOrJump} from "../reducers/labels/labelUtilities.js";


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

function extractConstants(declarationMap, constantsMap) {

}

function propagateConstantsInBlock(node){
    var result = false;
    visitEveryBlock(node, blockNode=> {
        var constantsMap = new Map()
            var arr = blockNode.body
            for (var i = 0; i < arr.length; i++) {
                var childNode = arr[i]



                if (isLabelOrJump(childNode))
                {
                    constantsMap.clear()
                    continue
                }

            }
        })
}

export function optimizeIr(parentAst) {
    var didOptimize = false;
    do{
        var canOptimize = replaceGlobalConstants(parentAst)
        canOptimize |= propagateConstantsInBlock(parentAst)
        didOptimize = didOptimize || canOptimize
    }while (canOptimize)
    return didOptimize
}