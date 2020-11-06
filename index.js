import {readFile, arrayInsertAt} from './src/utilities.js'
import {parseJs, getStatement, printAst} from './src/parseUtils.js'
import {findExpressionInBlock} from './src/visitorUtils.js'
import {extractVar, replaceExpressionWithArray} from "./src/reducers/ExtractExpressionUtilities.js";
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";
import {breakExpressionInMultiplePasses} from "./src/reducers/BreakExpressions.js";

var code = readFile('./examples/prog1.js')
var tree = parseJs(code)

reduceTree(tree)


simplifyGotos(tree)
breakExpressionInMultiplePasses(tree)

console.log('After: \n', printAst(tree))
