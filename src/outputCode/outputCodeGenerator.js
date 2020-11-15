import {
    codeGenClassDeclaration,
    codeGenClassImplementation,
    extractFunctionDeclaration
} from "./extractFunctionDeclaration.js";
import {opsFunctionVisitor} from "../mir/AstToOpsBuilder.js";

function writeMain() {
    return `
int main() {
    return 0;
}
`;
}

export function generateProgramCode(parentAst) {
    var functionsToGenerate = []
    opsFunctionVisitor(parentAst, (node)=>{
        var functionDeclaration = extractFunctionDeclaration(node)
        functionsToGenerate.push(functionDeclaration)
    })

    var codeOut = ""
    codeOut += `
#include "rtl/aotjs.hpp"

using namespace aotJs;
`
    functionsToGenerate.forEach(fnDec=>{
        codeOut += codeGenClassDeclaration(fnDec)
    })

    functionsToGenerate.forEach(fnDec=>{
        codeOut += codeGenClassImplementation(fnDec)
    })

    codeOut += writeMain()
    return codeOut
}
