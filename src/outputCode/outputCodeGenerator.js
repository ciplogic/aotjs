import {findExpressionInBlock, visitEveryBlock} from "../visitorUtils.js";
import {
    codeGenClassDeclaration,
    codeGenClassImplementation,
    extractFunctionDeclaration
} from "./extractFunctionDeclaration.js";

function writeMain() {
    return `
int main() {
    return 0;
}
`;
}

export function generateProgramCode(parentAst) {
    var functionsToGenerate = []
    findExpressionInBlock(parentAst, 'FunctionDeclaration', (node, parent, idx)=>{
        var functionDeclaration = extractFunctionDeclaration(node)
        functionsToGenerate.push(functionDeclaration)
    })

    var codeOut = ""
    codeOut += `
#include "rtl/aotjs.hpp"
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
