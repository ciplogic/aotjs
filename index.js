import {readFile, writeFile} from './src/utilities.js'
import {parseJs, printAst} from './src/parseUtils.js'
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";
import {breakExpressionInMultiplePasses} from "./src/reducers/BreakExpressions.js";
import {optimizeIr} from "./src/optimizers/optimizeIrPasses.js";
import {prefixDeclarations} from "./src/prefixer/PrefixDeclarations.js";
import {generateProgramCode} from "./src/outputCode/outputCodeGenerator.js";

var code = readFile('./examples/prog1.js')
var tree = parseJs(code)

reduceTree(tree)
prefixDeclarations(tree)
do {
    simplifyGotos(tree)
    breakExpressionInMultiplePasses(tree)
    var canOpt = optimizeIr(tree)
} while (canOpt)

var generatedCppCode = generateProgramCode(tree)

writeFile('out.cpp', generatedCppCode)

writeFile('out.js', printAst(tree))
