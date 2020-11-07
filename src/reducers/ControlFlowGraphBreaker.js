import {findExpressionInBlock} from "../visitorUtils.js";
import {extractVar, replaceExpressionWithArray} from "./ExtractExpressionUtilities.js";
import {getStatement, parseJsExpression, printAst, wrapNodeInBlock, wrapNodeInBlockIfNeeded} from "../parseUtils.js";
import {joinArrays} from "../utilities.js";

var labelIndex = 0;

export function addLabel() {
    labelIndex++;
    return {
        labelIndex,
        statement: getStatement(`__label(${labelIndex})`)
    }
}

export function addGoto(labelIndex) {
    return getStatement(`__goto(${labelIndex})`)
}

export function ifTrue(nodeTest, labelIndex) {
    var method = getStatement(`__ifTrue(${labelIndex}, true)`)
    method.expression.arguments[1] = nodeTest
    return method
}

/**
 * @return boolean if found, returns true
 */
export function reduceIfTree(tree) {
    var result = false

    findExpressionInBlock(tree, 'IfStatement', (ifStatement, parent, idxStatement) => {
        wrapNodeInBlockIfNeeded(ifStatement, 'consequent');
        reduceTree(ifStatement.consequent)
        if (ifStatement.alternate) {
            wrapNodeInBlockIfNeeded(ifStatement, 'alternate');
            reduceTree(ifStatement.alternate)
        }
        var trueIfLabel = addLabel()
        var falseIfLabel = addLabel()
        var endIfLabel = addLabel()
        var testTrue = ifTrue(ifStatement.test, trueIfLabel.labelIndex)
        var jumpToFalse = addGoto(falseIfLabel.labelIndex)
        var jumpToEndIf = addGoto(endIfLabel.labelIndex)
        var falseBody = ifStatement.alternate ? ifStatement.alternate.body : []

        var newOps = joinArrays(
            [testTrue, jumpToFalse, trueIfLabel.statement],
            ifStatement.consequent.body,
            jumpToEndIf,
            falseIfLabel.statement,
            falseBody,
            endIfLabel.statement)

        replaceExpressionWithArray(parent, idxStatement, newOps)
        result = true
    })
    return result;
}

export function reduceWhile(tree) {
    var result = false

    //todo: handle break/continue as gotos
    findExpressionInBlock(tree, 'WhileStatement', (ifStatement, parent, idxStatement) => {
        reduceTree(ifStatement.body)
        var startWhileLabel = addLabel()
        var trueIfLabel = addLabel()
        var endWhileLabel = addLabel()
        var testTrue = ifTrue(ifStatement.test, trueIfLabel.labelIndex)
        var repeatLoop = addGoto(startWhileLabel.labelIndex)
        var jumpToFalse = addGoto(endWhileLabel.labelIndex)
        var newOps = joinArrays(
            [startWhileLabel.statement,
                testTrue, jumpToFalse, trueIfLabel.statement],
            ifStatement.body.body,
            repeatLoop,
            endWhileLabel.statement)

        replaceExpressionWithArray(parent, idxStatement, newOps)
        result = true
    })
    return result;
}

export function reduceFor(tree) {
    var result = false

    //todo: handle break/continue as gotos
    findExpressionInBlock(tree, 'ForStatement', (ifStatement, parent, idxStatement) => {
        reduceTree(ifStatement.body)
        var startWhileLabel = addLabel()
        var trueIfLabel = addLabel()
        var endWhileLabel = addLabel()
        var testTrue = ifTrue(ifStatement.test, trueIfLabel.labelIndex)
        var repeatLoop = addGoto(startWhileLabel.labelIndex)
        var jumpToFalse = addGoto(endWhileLabel.labelIndex)
        var newOps = joinArrays(
            ifStatement.init,
            [startWhileLabel.statement,
                testTrue, jumpToFalse, trueIfLabel.statement],
            ifStatement.body.body,
            repeatLoop,
            endWhileLabel.statement)

        replaceExpressionWithArray(parent, idxStatement, newOps)
        result = true
    })
    return result;
}

export function reduceTree(tree) {
    do {
        var found = false
        found |= reduceIfTree(tree)
        found |= reduceWhile(tree)
        found |= reduceFor(tree)
    } while (found)
}
