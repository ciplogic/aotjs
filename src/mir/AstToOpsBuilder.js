import {isNodeEfectivelyLiteral, isNodeIdentifier} from "../nodeTypeUtilities.js";
import {printAst} from "../parseUtils.js";
import {extractLeftRightAssignmentOfNode} from "../optimizers/propagateConstantsInBlock.js";

export const JsOpNames = {
    unOp: 'unOp',
    binOp: 'binOp',
    if: 'if',
    goto: 'goto',
    label: 'label',
    new: 'new',
    call: 'call',
    ret: 'ret',
    assign: 'assign',
    readfield: 'readfield',
    fnDecl: 'fnDecl'
}

function addOp(ops, opName, data){
    var dataClone = {type: opName,...data}
    ops.push(dataClone)
}

function handleCallOp(ops, isVar, node, isNewOp, left)
{
    var valueTo = left?mapDirectValue(left):''
    var args = mapDirectValues(node.arguments)
    var callee = mapDirectValue(node.callee)
    switch (callee){
        case '__ifTrue':
        {
            addOp(ops, JsOpNames.if, {id: +args[0], test: args[1]});
            return
        }
        case '__goto':
        {
            addOp(ops, JsOpNames.goto, {id: +args[0]});
            return
        }
        case '__label':
        {
            addOp(ops, JsOpNames.label, {id: +args[0]});
            return
        }
    }
    var dataCall ={isVar, left: valueTo, callee, args};

    addOp(ops, isNewOp?JsOpNames.new:JsOpNames.call, dataCall)
}

function handleAssignOp(ops, isVar, node) {
    if (node.expression && node.expression.type === 'CallExpression')
    {
        handleCallOp(ops, isVar, node.expression, false)
        return
    }
    var leftRightAssignment = extractLeftRightAssignmentOfNode(node)
    if (!leftRightAssignment)
        throw new Error("Cannot assignmet be undefined")
    var {leftNode, rightNode} = leftRightAssignment;
    var rightNodeType = rightNode.type
    switch (rightNodeType){
        case 'BinaryExpression':
        {
            let binOpData = {isVar, left: mapDirectValue(leftNode),
                op: rightNode.operator,
                opLeft: mapDirectValue(rightNode.left),  opRight: mapDirectValue(rightNode.right),};
            addOp(ops, JsOpNames.binOp, binOpData)
            return;
        }
        case 'UnaryExpression':
        {
            addOp(ops, JsOpNames.unOp, {isVar, left: mapDirectValue(leftNode), opArg: mapDirectValue(rightNode.argument)})
            return;
        }
        case 'CallExpression':
        {
            handleCallOp(ops, isVar, rightNode, false, leftNode)
            return
        }
        case 'NewExpression':
        {
            handleCallOp(ops, isVar, rightNode, true, leftNode)
            return
        }
        case 'Identifier':
        {
            addOp(ops, JsOpNames.assign, {isVar, left: mapDirectValue(leftNode), arg: mapDirectValue(rightNode)})
            return;
        }
        case 'MemberExpression':
        {
            var data = {isVar, left: mapDirectValue(leftNode), obj: mapDirectValue(rightNode.object), key: mapDirectValue(rightNode.property)}
            addOp(ops, 'readfield', data)
            return;
        }
        default:
            throw new Error("Undhandled right hand: "+rightNodeType)
    }
    var leftReduced;
    if (isNodeIdentifier(leftNode)){
        leftReduced =mapDirectValue(leftNode)
        if (!isNodeIdentifier(rightNode))
        {
            var opName = rightNode.type
        }
        else {

        }
    }

    var opDef = {isVar, left: leftReduced, right: rightNode};
    addOp(ops, opName,  )
}

function buildBody(body) {
    var ops = []
    body.forEach(node=>{
        var nodeType = node.type
        switch (nodeType) {
            case "FunctionDeclaration":
                addOp(ops, 'fnDecl', buildOpsOfFunction(node))
                break

            case "VariableDeclaration":
                handleAssignOp(ops, true, node)
                break

            case "ExpressionStatement":
                handleAssignOp(ops, false, node)
                break
            case "ReturnStatement":
                addOp(ops, 'ret', {arg: mapDirectValue(node.argument)})
                break
            default:
                throw new Error("Unhandled node: "+nodeType)
        }
    })
    return ops;
}

class FunctionOps{
    constructor(name, args, body) {
        this.name = name
        this.args = args
        this.body = buildBody(body)

    }

}

function mapDirectValue(arg) {
    if (arg===undefined)
        return 'undefined'
    if (!isNodeIdentifier(arg) && !isNodeEfectivelyLiteral(arg))
        throw new Error("Unhandled argument: "+printAst(arg))
    var isId = false
    if (isNodeIdentifier(arg))
        isId = true
    var value = printAst(arg)
    return value
}
function mapDirectValues(params) {
    return params.map(arg=>mapDirectValue(arg))
}

function extractNameAndArgsOfFunction(functionNode) {
    var name = functionNode.id.name
    var args = mapDirectValues(functionNode.params)

    return {name, args};
}

export function buildOpsOfFunction(functionNode){
    var nameAndArgs = extractNameAndArgsOfFunction(functionNode)

    var result = new FunctionOps(nameAndArgs.name, nameAndArgs.args, functionNode.body.body)

    return result
}
export function buildOpsOfWrappedProgram(programNode) {
    return buildOpsOfFunction(programNode.body[0])
}

export function opsFunctionVisitor(opsFunction, cb)
{
    cb(opsFunction)
    opsFunction.body.forEach(node=>{
        if (node.type === JsOpNames.fnDecl){
            opsFunctionVisitor(node, cb)
        }
    })
}
