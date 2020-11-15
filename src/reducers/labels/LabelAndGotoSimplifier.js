import {visitEveryBlock} from "../../visitorUtils.js";
import {arrayRemoveAt, reverseForEach} from "../../utilities.js";
import {extractJumpNodes, getJumpNodeState, isLabelOrJump, updateTarget} from './labelUtilities.js'
import {logAst} from "../../parseUtils.js";

function simplifyConsecutiveLabels(blockNode) {
    var jumpNodes = extractJumpNodes(blockNode)
    var result = false;
    jumpNodes
        .forEach((labelNode, idx) => {
            if (labelNode.isJump)
                return
            if (idx === jumpNodes.length - 1)
                return;
            var nextlabel = jumpNodes[idx + 1]
            if (nextlabel.isJump && nextlabel.name !== '__goto')
                return
            if (labelNode.idx + 1 !== nextlabel.idx)
                return
            var gotos = jumpNodes.filter(it => it.isJump)
            gotos.forEach(node => {
                updateTarget(node, labelNode.targetId, nextlabel.targetId)
            })
            result = true;

        })
    return result;
}


function removeSecondConsecutiveGoto(blockNode) {
    var jumpNodes = extractJumpNodes(blockNode)
    var result = false;
    jumpNodes
        .forEach((gotoNode, idx) => {
            if (result)
                return
            if (gotoNode.name !== '__goto')
                return
            var nodeIdx = gotoNode.idx
            if (nodeIdx === blockNode.body.length - 1)
                return;

            var nextlabel = blockNode.body[nodeIdx + 1]
            if (isLabelOrJump(nextlabel)) {
                var jumpState = getJumpNodeState(nextlabel, nodeIdx + 1)
                if (!jumpState.isJump)
                    return;
            }
            result = true;
            arrayRemoveAt(blockNode.body, nodeIdx + 1)
        })

    return result;
}

function removeGotoNextLine(blockNode) {
    var jumpNodes = extractJumpNodes(blockNode)
    var result = false;
    jumpNodes
        .forEach((gotoNode, idx) => {
            if (result)
                return
            if (gotoNode.name !== '__goto')
                return
            if (idx === jumpNodes.length - 1)
                return;

            var nextlabel = jumpNodes[idx + 1]
            if (nextlabel.name !== '__label')
                return
            if (gotoNode.targetId !== nextlabel.targetId) {
                return;
            }
            result = true;
            arrayRemoveAt(blockNode.body, gotoNode.idx)
        })

    return result;
}

function removeUnreferencedLabels(blockNode) {
    var jumpNodes = extractJumpNodes(blockNode)
    var referencedGotos = []
    var gotos = jumpNodes.filter(it => it.isJump)
    gotos.forEach((gotoNode) => {
        var target = gotoNode.targetId
        if (referencedGotos.indexOf(target) === -1) {
            referencedGotos.push(target)
        }
    })
    var idxToRemove = []
    jumpNodes.filter(it => !it.isJump)
        .forEach((labelNode) => {
            var target = labelNode.targetId
            if (referencedGotos.indexOf(target) === -1) {
                idxToRemove.push(labelNode.idx)
            }
        })

    reverseForEach(idxToRemove, (idx) => {
        arrayRemoveAt(blockNode.body, idx)
    })

    return !!idxToRemove.length;
}

function removeRowAfterReturnIfNotLabel(blockNode) {
    for(var i = 0; i<blockNode.body.length-1; i++){
        var rowNode = blockNode.body[i]
        var nodeType = rowNode.type
        if (nodeType!=="ReturnStatement")
            continue

        var node = blockNode.body[i+1]
        if (isLabelOrJump(node)) {
            var stateJump = getJumpNodeState(node, i);
        }
        if (!stateJump || stateJump.isJump)
        {
            arrayRemoveAt(blockNode.body, i+1)
            return true
        }
    }

    return false;
}

function simplifyGotosInBlock(blockNode) {
    do {
        var canSimplify = simplifyConsecutiveLabels(blockNode)
        canSimplify |= removeUnreferencedLabels(blockNode)
        canSimplify |= removeGotoNextLine(blockNode)
        canSimplify |= removeSecondConsecutiveGoto(blockNode)

        canSimplify |= removeRowAfterReturnIfNotLabel(blockNode)

    } while (canSimplify)
}

export function simplifyGotos(program) {
    visitEveryBlock(program, simplifyGotosInBlock)
}
