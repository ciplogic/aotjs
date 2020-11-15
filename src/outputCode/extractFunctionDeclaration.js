import * as walk from "acorn-walk";
import {getFunctionName, getLabelId, isLabelOrJump} from "../reducers/labels/labelUtilities.js";
import {printAst} from "../parseUtils.js";
import {extractLeftRightAssignmentOfNode} from "../optimizers/propagateConstantsInBlock.js";
import {isNodeIdentifier} from "../nodeTypeUtilities.js";
import {writeOps} from "./ops/opsWriter.js";

export function extractFunctionDeclaration(functionNode){
    var name = functionNode.name
    var args = functionNode.args
    var body = functionNode.body

    var usesThis = false

    return {name, args, body, usesThis, functionNode};
}

export function codeGenClassDeclaration(fnDecl) {
    var code = `struct ${fnDecl.name} {`
    var closure = '';
    var argsText = fnDecl.args.map(arg=>`JsVal ${arg}`).join(', ');
    if (fnDecl.usesThis){
        closure += `JsVal _this;
    JsVal invokeNew(${argsText});
        `
    }
    return `
${code}
${closure}
    JsVal invoke(${argsText});
};
    `;
}

export function codeGenClassImplementation(fnDecl) {
    var argsText = fnDecl.args.map(arg=>`JsVal ${arg}`).join(', ');
    var code = `JsVal ${fnDecl.name}::invoke(${argsText}){`
    code += '\n'
    code += writeOps(fnDecl, fnDecl.body)
    code += '}\n'

    return code
}
