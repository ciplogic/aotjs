import {findExpressionInBlock, visitEveryBlock} from "../visitorUtils.js";
import {extractFunctionDeclaration} from "./extractFunctionDeclaration.js";

function codeGenClassDeclaration(fnDecl) {
    var code = `struct ${fnDecl.name} {`
    var closure = '';
    if (fnDecl.usesThis){
        closure += 'JsVal _this;\n'
    }
    var argsText = fnDecl.args.map(arg=>`JsVal ${arg}`).join(', ');
    var fullCode = `
${code}
${closure}
        JsVal invoke(${argsText});
};
    `
    return fullCode;
}

function codeGenClassImplementation(fnDecl) {

    var argsText = fnDecl.args.map(arg=>`JsVal ${arg}`).join(', ');
    var code = `JsVal ${fnDecl.name}::invoke(${argsText}){`
    code += '\n'

    code += '}\n'

    return code
}


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
