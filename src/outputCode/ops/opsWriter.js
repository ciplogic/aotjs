import {JsOpNames} from "../../mir/AstToOpsBuilder.js";


function writeJump(op){
    switch (op.type){
        case JsOpNames.label:
            return `__label${op.id}:`;
        case JsOpNames.goto:
            return `goto __label${op.id}`;
        case JsOpNames.if:
            return `if(isTruish(${op.test})) goto __label${op.id}`;
    }
    return ''
}

function evalBinaryOp(node) {
    var code = node.isVar? 'JsVal ':''
    code += `${node.left} =`

    var methodName = ''
    switch (node.op)
    {
        case '+': methodName = 'add'; break;
        case '-': methodName = 'sub'; break;
        case '*': methodName = 'mul'; break;
        case '<': methodName = 'lessThan'; break;
        case '<=': methodName = 'lessOrEqThan'; break;
        default: throw new Error("Operator not handled: "+node.operator)
    }
    return `${code} ${methodName}(${node.opLeft}, ${node.opRight})`

}
function writeReadField(opNode) {
    var code = opNode.isVar? 'JsVal ':''
    var templateCode = `${code}${opNode.left} = jsReadField(${opNode.obj}, '${opNode.key}')`
    return templateCode;
}

function writeCall(opNode) {

    var code = opNode.isVar? 'JsVal ':''
    if (opNode.left)
    {
        code += `${opNode.left} =`
    }
    var args = opNode.args.join(',')
    var templateCode = `${code} ${opNode.callee}.invoke(${args})`
    return templateCode
}

function writeAssign(opNode) {

    var code = opNode.isVar? 'JsVal ':''
    code += `${opNode.left} = ${opNode.arg}`

    return code
}

function writeReturn(opNode) {

    return `return ${opNode.arg}`;
}

export function writeOps(fnDecl, functionBody) {
    var code = '';
    var addLine = (line)=>{code += line + ';\n';}
    functionBody.forEach(opNode=>{
        var jumpCode = writeJump(opNode)
        if (jumpCode) {
            return addLine( writeJump(opNode))
        }
        switch (opNode.type)
        {
            case JsOpNames.fnDecl:
                return;
            case JsOpNames.readfield:
                return addLine(writeReadField(opNode))
            case JsOpNames.call:
                return addLine(writeCall(opNode))
            case JsOpNames.binOp:
                return addLine(evalBinaryOp(opNode))
            case JsOpNames.ret:
                return addLine(writeReturn(opNode))
            case JsOpNames.assign:
                return addLine(writeAssign(opNode))
            default:
                //throw new Error("Unhandled: "+opNode.type)
                break
        }


    })
    return code
}