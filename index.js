import {readFile} from './src/utilities.js'
import {parseJs, printAst} from './src/parseUtils.js'
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";
import {breakExpressionInMultiplePasses} from "./src/reducers/BreakExpressions.js";
import {optimizeIr} from "./src/optimizers/optimizeIrPasses.js";

var code = readFile('./examples/prog1.js')
var tree = parseJs(code)

reduceTree(tree)
simplifyGotos(tree)
breakExpressionInMultiplePasses(tree)
optimizeIr(tree)

console.log('After: \n', printAst(tree))
