import {readFile, writeFile} from './src/utilities.js'
import {parseJs, printAst} from './src/parseUtils.js'
import {reduceTree} from "./src/reducers/ControlFlowGraphBreaker.js";
import {simplifyGotos} from "./src/reducers/labels/LabelAndGotoSimplifier.js";
import {breakExpressionInMultiplePasses} from "./src/reducers/BreakExpressions.js";
import {optimizeIr} from "./src/optimizers/optimizeIrPasses.js";
import {prefixDeclarations} from "./src/prefixer/PrefixDeclarations.js";
import {generateProgramCode} from "./src/outputCode/outputCodeGenerator.js";
import {writeCmakeFileInDid} from "./src/outputCode/cmakeGenerator.js";
import {buildOpsOfWrappedProgram} from "./src/mir/AstToOpsBuilder.js";

var code = readFile('./examples/prog2.js')
function parseJsWrapped(jsCode){
    var wrappedCode = `
function __global_main(){
${jsCode}
}
`
    return parseJs(wrappedCode)
}
//var tree = parseJs(code)
var tree = parseJsWrapped(code)

do {

    reduceTree(tree)
    simplifyGotos(tree)
    breakExpressionInMultiplePasses(tree)
    var canOpt = optimizeIr(tree)
} while (canOpt)
prefixDeclarations(tree)

var functionOps = buildOpsOfWrappedProgram(tree)

var generatedCppCode = generateProgramCode(functionOps)
writeFile('out/out.cpp', generatedCppCode)
writeCmakeFileInDid('out', 'out.cpp')


writeFile('out.js', printAst(tree))
