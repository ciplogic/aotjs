import {visitEveryBlock} from "../../visitorUtils.js";
import {parseJsExpression, printAst} from "../../parseUtils.js";
import {arrayRemoveAt, reverseForEach} from "../../utilities.js";
import {extractJumpNodes, updateTarget} from './labelUtilities.js'

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
            if (nextlabel.isJump)
                return
            if (labelNode.idx + 1 !== nextlabel.idx)
                return
            console.log("Movign gotos from: ", labelNode.targetId, ' to ', nextlabel.targetId)

            var gotos = jumpNodes.filter(it => it.isJump)
            gotos.forEach(node => {
                updateTarget(node, labelNode.targetId, nextlabel.targetId)
            })
            result = true;

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

function simplifyGotosInBlock(blockNode) {
    do {
        var canSimplify = simplifyConsecutiveLabels(blockNode)
        canSimplify |= removeUnreferencedLabels(blockNode)
        canSimplify |= removeGotoNextLine(blockNode)

    } while (canSimplify)
}

export function simplifyGotos(program) {
    visitEveryBlock(program, simplifyGotosInBlock)
}
