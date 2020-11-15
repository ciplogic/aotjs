import {printAst} from "../../parseUtils.js";
import {isNodeEfectivelyLiteral} from "../../nodeTypeUtilities.js";

export function evalJsLiteral(rightHand){

}

function evalBinaryOp(node) {
    var {left, right} = node

    var methodName = ''
    switch (node.operator)
    {
        case '+': methodName = 'add'; break;
        case '-': methodName = 'sub'; break;
        case '*': methodName = 'mul'; break;
        case '<': methodName = 'lessThan'; break;
        case '<=': methodName = 'lessOrEqThan'; break;
        default: throw new Error("Operator not handled: "+node.operator)
    }
    return `${methodName}(${evalRightHand(left)}, ${evalRightHand(right)})`

}

function evalCall(isCall, node) {
    var args = node.arguments.map(evalRightHand).join(',')
    var invokeName = isCall?"invoke": "invokeNew"

    return `(${node.callee.name}()).${invokeName}(${args})`;
}

export function evalRightHand(node) {
    switch (node.type) {
        case 'Literal':
            return "_val(" + printAst(node) + ")"
        case 'Identifier':
            return node.name

        case 'NewExpression':
        case 'CallExpression':
            return evalCall(node.type==='CallExpression', node)

        case 'MemberExpression':
            return printAst(node)
        case 'BinaryExpression':
            return evalBinaryOp(node)
        case 'UnaryExpression':
            if (isNodeEfectivelyLiteral(node))
                return "_val(" + printAst(node) + ")"
            throw new Error(node.type)

        default:
            throw new Error("Unknown type: " + node.type)
    }
}