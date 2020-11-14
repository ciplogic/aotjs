import {getFunctionName, getLabelId, isLabelOrJump} from "../../reducers/labels/labelUtilities.js";
import {printAst} from "../../parseUtils.js";
import {isNodeIdentifier} from "../../nodeTypeUtilities.js";
import {extractLeftRightAssignmentOfNode} from "../../optimizers/propagateConstantsInBlock.js";
import {evalRightHand} from "./printRightSideExpression.js";


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
    code += evalRightHand(assignDesc.right)
    return code;
}

export function writeOps(fnDecl, functionBody) {
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