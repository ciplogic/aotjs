import {findExpressionInBlock, visitEveryBlock} from "../visitorUtils.js";
import {getStatement, parseJs, printAst} from "../parseUtils.js";
import {extractVar, extractVarByProperty, replaceExpressionWithArray} from "./ExtractExpressionUtilities.js";
import {isNodeEffectivelyLiteralOrIdentifier, isNodeIdentifier, isNodeOfType} from "../nodeTypeUtilities.js";
import {extractLeftRightAssignmentOfNode} from "../optimizers/propagateConstantsInBlock.js";

function BreakMultipleVarsInOne(parentAst) {
    var result = false;
    findExpressionInBlock(parentAst, 'VariableDeclaration', (node, parent, idxStatement) => {
        if (node.kind!=='var'){
            node.kind = 'var'
        }
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


function isBreakableRightHandBinaryOperator(binOp) {
    if (!isNodeEffectivelyLiteralOrIdentifier(binOp.left))
        return true;
    if (!isNodeEffectivelyLiteralOrIdentifier(binOp.right))
        return true;
    return false
}

function doSimplifyBinaryOp(binOp, parent, idxStatement) {
    if (!isNodeOfType(binOp, "BinaryExpression")) {
        return false
    }
    if (isBreakableRightHandBinaryOperator(binOp)) {
        extractVarByProperty(binOp, 'right', parent, idxStatement)
        extractVarByProperty(binOp, 'left', parent, idxStatement)
        return  true;
    }
    return false;
}


function doSimplifyUnaryOp(binOp, parent, idxStatement) {

    if (!isNodeOfType(binOp, "UnaryExpression")) {
        return false
    }
    if (!isNodeEffectivelyLiteralOrIdentifier(binOp.argument)) {
        extractVarByProperty(binOp, 'argument', parent, idxStatement)
        return true;
    }
    return false
}


function doSimplifyMemberExpression(memberExpression, parent, idxStatement) {

    if (!isNodeOfType(memberExpression, "MemberExpression")) {
        return false
    }

    if (!isNodeIdentifier(memberExpression.object)) {
        extractVarByProperty(memberExpression, 'object', parent, idxStatement)
        return true;
    }
    if (!isNodeIdentifier(memberExpression.property)) {
        extractVarByProperty(memberExpression, 'property', parent, idxStatement)
        return true;
    }

}

function doSimplifyCall(callExpression, parent, idxStatement) {
    if (!isNodeOfType(callExpression, "CallExpression") && !isNodeOfType(callExpression, 'NewExpression')) {
        return false
    }
    if (!isNodeIdentifier(callExpression.callee)) {
        extractVarByProperty(callExpression, 'callee', parent, idxStatement)
        return true;
    }
    var result = false
    callExpression.arguments.forEach((arg,index)=>{
        if (!isNodeEffectivelyLiteralOrIdentifier(arg)) {
            extractVarByProperty(callExpression.arguments, index, parent, idxStatement)
            result = true
        }
    })
    return result
}

function breakComplexAssignments(parentAst) {
    var result = false;

    visitEveryBlock(parentAst, parent => {
        parent.body.forEach((node, index)=> {
            if (result)
                return
            var leftRightAssignment = extractLeftRightAssignmentOfNode(node)
            if (!leftRightAssignment)
                return
            var code = printAst(node)
            var {leftNode, rightNode, targetObj, propKey} = leftRightAssignment;
            if (doSimplifyBinaryOp(rightNode, parent, index)) {
                result = true;
                return
            }
            if (doSimplifyUnaryOp(rightNode, parent, index)) {
                result = true;
                return
            }
            if (doSimplifyCall(rightNode, parent, index)) {
                result = true;
                return
            }
            if (doSimplifyMemberExpression(rightNode, parent, index)) {
                result = true;

            }
        })
    })

    return result
}

function breakComplexExpressions(parentAst) {
    var result = false;

    visitEveryBlock(parentAst, parent => {
        parent.body.forEach((node, index)=> {
            if (result)
                return
            if (!isNodeOfType(node, 'ExpressionStatement'))
                return
            var right = node.expression
            if (doSimplifyMemberExpression(right, parent, index)) {
                result = true;
                return
            }
            if (doSimplifyCall(right, parent, index)) {
                result = true;

            }
        })
    })

    return result
}
function breakAssignmentExpressions(parentAst) {
    var result = false;
    findExpressionInBlock(parentAst, 'ExpressionStatement', (node, parent, idxStatement) => {
        if (result)
            return
        if (node.expression.type !== 'AssignmentExpression')
            return
        var assignmentExpression = node.expression
        var right = assignmentExpression.right;
        if (assignmentExpression.operator !== '=') {
            if (!isNodeEffectivelyLiteralOrIdentifier(right)) {
                extractVarByProperty(assignmentExpression, 'right', parent, idxStatement)
                result = true;
            }
            return
        }
        if (!isNodeIdentifier(assignmentExpression.left) && !isNodeIdentifier(assignmentExpression.right)) {
            extractVarByProperty(assignmentExpression, 'right', parent, idxStatement)
        }


    })
    return result
}

function breakUpdateExpression (parentAst) {
    var result = false;
    visitEveryBlock(parentAst, blockNode => {
        blockNode.body.forEach((expressionNode, index) => {
            if (result)
                return
            if (expressionNode.type !== 'ExpressionStatement')
                return
            var node = expressionNode.expression;
            if (node.type !== 'UpdateExpression')
                return
            var argument = node.argument
            var exprVar = extractVar(node.argument, blockNode.body, index)
            //TODO: for -- should be '-1'
            var replacementCode = argument.name + ' = ' + exprVar.varName + '+1'
            var evalExpression = parseJs(replacementCode)
            blockNode.body[index + 1] = evalExpression
            result = true
        })
    })
    return result
}

export function breakExpressionInMultiplePasses(parentAst) {
    do {
        var canSimplify = BreakMultipleVarsInOne(parentAst)
        canSimplify |= breakReturnStatement(parentAst)
        canSimplify |= breakComplexExpressions(parentAst)
        canSimplify |= breakComplexAssignments(parentAst)
        canSimplify |= breakAssignmentExpressions(parentAst)
        canSimplify |= breakUpdateExpression(parentAst)

    } while (canSimplify)
}
