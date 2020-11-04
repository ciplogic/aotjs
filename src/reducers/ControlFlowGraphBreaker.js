import {findExpressionInBlock} from "../visitorUtils.js";
import {extractVar, replaceExpressionWithArray} from "./ExtractExpressionUtilities.js";
import {getStatement, parseJsExpression} from "../parseUtils.js";
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
    var method = getStatement(`__ifTrue(true, ${labelIndex})`)
    method.expression.arguments[0] = nodeTest
    return method
}

/**
 * @return boolean if found, returns true
 */
export function reduceIfTree(tree) {
    var result = false

    findExpressionInBlock(tree, 'IfStatement', (ifStatement, parent, idxStatement) => {
        var trueIfLabel = addLabel()
        var falseIfLabel = addLabel()
        var endIfLabel = addLabel()
        var testTrue = ifTrue(ifStatement.test, trueIfLabel.labelIndex)
        var jumpToFalse = addGoto(falseIfLabel.labelIndex)
        var jumpToEndIf = addGoto(endIfLabel.labelIndex)
        var falseBody = []
        if (ifStatement.alternate)
            falseBody = ifStatement.alternate.body
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

export function reduceTree(tree) {
    var found = true;

    while (found) {
        found = reduceIfTree(tree)
    }
}
