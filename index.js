import {readFile, writeFile} from './src/utilities.js'
import {parseJs, printAst} from './src/parseUtils.js'
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";
import {breakExpressionInMultiplePasses} from "./src/reducers/BreakExpressions.js";
import {optimizeIr} from "./src/optimizers/optimizeIrPasses.js";
import {prefixDeclarations} from "./src/prefixer/PrefixDeclarations.js";
import {generateProgramCode} from "./src/outputCode/outputCodeGenerator.js";
import {writeCmakeFileInDid} from "./src/outputCode/cmakeGenerator.js";

var code = readFile('./examples/prog2.js')
var tree = parseJs(code)

reduceTree(tree)
prefixDeclarations(tree)
do {
    simplifyGotos(tree)
    breakExpressionInMultiplePasses(tree)
    var canOpt = optimizeIr(tree)
} while (canOpt)

var generatedCppCode = generateProgramCode(tree)
writeFile('out/out.cpp', generatedCppCode)
writeCmakeFileInDid('out', 'out.cpp')


writeFile('out.js', printAst(tree))
