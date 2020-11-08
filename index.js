import {readFile} from './src/utilities.js'
import {logAst, parseJs, printAst} from './src/parseUtils.js'
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";
import {breakExpressionInMultiplePasses} from "./src/reducers/BreakExpressions.js";
import {optimizeIr} from "./src/optimizers/optimizeIrPasses.js";
import {prefixDeclarations} from "./src/prefixer/PrefixDeclarations.js";

var code = readFile('./examples/prog2.js')
var tree = parseJs(code)

reduceTree(tree)
prefixDeclarations(tree)
simplifyGotos(tree)
breakExpressionInMultiplePasses(tree)
optimizeIr(tree)

console.log('After: \n', printAst(tree))
