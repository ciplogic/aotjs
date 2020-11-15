import {visitEveryBlock} from "../visitorUtils.js";
import {
    getVarDeclaration, isNodeEfectivelyLiteral,
    isNodeEffectivelyLiteralOrIdentifier, isNodeIdentifier
} from "../nodeTypeUtilities.js";
import {extractLeftRightAssignmentOfNode} from "./propagateConstantsInBlock.js";
import {arrayRemoveAt} from "../utilities.js";

function extractDeclarations(node) {
    var declarations = new Map()
    visitEveryBlock(node, blockNode => {
        blockNode.body.forEach((childNode, index) => {

            var decl = getVarDeclaration(childNode)
            if (!decl)
                return
            if(!isNodeEffectivelyLiteralOrIdentifier(decl.init))
                return
            declarations.set(childNode.declarations[0].id.name, true)
        })
    })
    return declarations
}

function removeUsageOfExpression(node, usedDeclaration) {
    if (!isNodeIdentifier(node)) {
        return;
    }
    usedDeclaration.delete(node.name)
}

function getRightHandUsage(node, usedDeclarations){
    if (!node)
        return;
    if (isNodeIdentifier(node))
    {
        findUnusedDeclarations(node, usedDeclarations)
        return
    }
    if (isNodeEfectivelyLiteral(node))
    {
        return;
    }
    var nodeType = node.type
    switch (nodeType) {
        case 'BinaryExpression': {
            removeUsageOfExpression(node.left, usedDeclarations)
            removeUsageOfExpression(node.right, usedDeclarations)
            return;
        }
        case 'NewExpression':
        case 'CallExpression': {
            removeUsageOfExpression(node.name, usedDeclarations)
            node.arguments.forEach(arg=>removeUsageOfExpression(arg, usedDeclarations))
            return;
        }
        case 'UnaryExpression':
        {
            removeUsageOfExpression(node.argument, usedDeclarations)
            break
        }

        case 'MemberExpression':
        {
            removeUsageOfExpression(node.object, usedDeclarations)
            return;
        }
        default:
            throw new Error("not handled getting usage of type: "+ nodeType)
    }
}

function findUnusedDeclarations(parentAst, usedDeclarations){
    visitEveryBlock(parentAst, blockNode => {
        blockNode.body.forEach((childNode, index) => {
            var leftRightAssignment = extractLeftRightAssignmentOfNode(childNode)
            if (!leftRightAssignment)
                return
            var {leftNode, rightNode, targetObj, propKey} = leftRightAssignment;
            if (propKey === 'right') //for assignemnts
            {
                removeUsageOfExpression(leftNode, usedDeclarations)
            }
            getRightHandUsage(rightNode, usedDeclarations);
        })
    })
}

export function dceVars(parentAst) {
    var declarations = extractDeclarations(parentAst)
    findUnusedDeclarations(parentAst, declarations)

    visitEveryBlock(parentAst, blockNode => {
        blockNode.body.forEach((varNode, index) => {

            if (varNode.type!=='VariableDeclaration')return
            var varDecl =getVarDeclaration(varNode)
            if (declarations.get(varDecl.id.name)){
                arrayRemoveAt(blockNode.body, index)
            }
        })
    })

    return !!declarations.size
}
