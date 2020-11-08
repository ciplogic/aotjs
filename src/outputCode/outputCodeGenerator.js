import {findExpressionInBlock, visitEveryBlock} from "../visitorUtils.js";

function extractFunctionNodes(blockNode) {

}


export function generateProgramCode(parentAst) {
    findExpressionInBlock(parentAst, 'Function', (node, parent, idx)=>{
        var {functions, blocOps} = extractFunctionNodes(node);
    })
}