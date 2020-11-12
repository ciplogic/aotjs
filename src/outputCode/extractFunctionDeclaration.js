import * as walk from "acorn-walk";
import {getFunctionName, getLabelId, isLabelOrJump} from "../reducers/labels/labelUtilities.js";
import {printAst} from "../parseUtils.js";
import {extractLeftRightAssignmentOfNode} from "../optimizers/propagateConstantsInBlock.js";
import {isNodeIdentifier} from "../nodeTypeUtilities.js";

export function extractFunctionDeclaration(functionNode){
    var name = functionNode.id.name
    var args = functionNode.params.map(arg=>arg.name)
    var body = functionNode.body

    var usesThis = false
    walk.simple(functionNode, {
        ThisExpression(node, state) {
            usesThis = true
            return true
        }
    });

    return {name, args, body, usesThis, functionNode};
}

export function codeGenClassDeclaration(fnDecl) {
    var code = `struct ${fnDecl.name} {`
    var closure = '';
    if (fnDecl.usesThis){
        closure += 'JsVal _this;\n'
    }
    var argsText = fnDecl.args.map(arg=>`JsVal ${arg}`).join(', ');
    return `
${code}
${closure}
    JsVal invoke(${argsText});
};
    `;
}

function writeJump(op){
    var funcName = getFunctionName(op)
    var jumpId = getLabelId(op)
    switch (funcName){
        case '__label':
            return `__label${jumpId}:`;
        case '__goto':
            return `goto __label${jumpId}`;
        default:
            var trueExpr = printAst(op.expression.arguments[1])
            return `if(isTruish(${trueExpr})) goto __label${jumpId}`;
    }
}

function writeAssignment(assignDesc, opNode) {
    var code = assignDesc.propKey === 'init'? ' JsVal ': ''
    if (isNodeIdentifier(assignDesc.left))
    {
        code += assignDesc.left.name
    } else {
        //throw new Error('Unhandled')
        return  ''
    }
    code += ' = '
    code += printAst(assignDesc.right)
    return code;
}

function writeOps(fnDecl, functionBody) {
    var code = '';
    var addLine = (line)=>{code += line + ';\n';}
    functionBody.body.forEach(opNode=>{
        var isJump = isLabelOrJump(opNode)
        if (isJump) {
            return addLine( writeJump(opNode))

        }
        var leftRightAssignment = extractLeftRightAssignmentOfNode(opNode)
        if (leftRightAssignment)
        {
            return addLine(writeAssignment(leftRightAssignment, opNode))
        }
        if (opNode.type === 'ReturnStatement')
        {
            return addLine(printAst(opNode))
        }


    })
    return code
}

export function codeGenClassImplementation(fnDecl) {
    var argsText = fnDecl.args.map(arg=>`JsVal ${arg}`).join(', ');
    var code = `JsVal ${fnDecl.name}::invoke(${argsText}){`
    code += '\n'
    code += writeOps(fnDecl, fnDecl.body)
    code += '}\n'

    return code
}
