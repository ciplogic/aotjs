import {readFile, arrayInsertAt} from './src/utilities.js'
import {parseJs, getStatement, printAst} from './src/parseUtils.js'
import {findExpressionInBlock} from './src/visitorUtils.js'
import {extractVar} from "./src/reducers/ExtractExpressionUtilities.js";
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";

var code = readFile('./examples/prog2.js')
var tree = parseJs(code)

reduceTree(tree)

findExpressionInBlock(tree, 'ReturnStatement', (returnNode, parent, idxStatement) => {
    if (!returnNode.argument || returnNode.argument.type === 'Identifier')
        return
    const expr = extractVar(returnNode.argument, parent.body, idxStatement);
    returnNode.argument = expr.varExpr
})

simplifyGotos(tree)


console.log('After: \n', printAst(tree))
