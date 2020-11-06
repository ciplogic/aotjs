import {findExpressionInBlock} from "../visitorUtils.js";
import {getStatement, printAst} from "../parseUtils.js";
import {extractVar, replaceExpressionWithArray} from "./ExtractExpressionUtilities.js";

function BreakMultipleVarsInOne(parentAst) {
    var result = false;
    findExpressionInBlock(parentAst, 'VariableDeclaration', (node, parent, idxStatement) => {
        if (node.declarations.length===1)
            return
        var vars = []
        node.declarations.forEach(varDecl=>{
            var varExpr = getStatement('var x = 1')
            varExpr.declarations[0] = varDecl
            vars.push(varExpr)
        })
        replaceExpressionWithArray(parent, idxStatement, vars)
        result = true
    });
    return result;
}

function breakReturnStatement(parentAst) {
    var result = false;
    findExpressionInBlock(parentAst, 'ReturnStatement', (returnNode, parent, idxStatement) => {
        if (!returnNode.argument || returnNode.argument.type === 'Identifier')
            return
        const expr = extractVar(returnNode.argument, parent.body, idxStatement);
        returnNode.argument = expr.varIdentifier
        result = true
    })
    return result
}

function breakAssignmentExpressions(parentAst){

    var result = false;
    findExpressionInBlock(parentAst, 'AssignmentStatement', (returnNode, parent, idxStatement) => {
        if (!returnNode.argument || returnNode.argument.type === 'Identifier')
            return
        const expr = extractVar(returnNode.argument, parent.body, idxStatement);
        returnNode.argument = expr.varIdentifier
        result = true
    })
    return result
}


export function breakExpressionInMultiplePasses(parentAst) {
    do {
        var canSimplify = BreakMultipleVarsInOne(parentAst)
        canSimplify |= breakReturnStatement(parentAst)
        canSimplify |= breakAssignmentExpressions(parentAst)

    } while (canSimplify)
}
