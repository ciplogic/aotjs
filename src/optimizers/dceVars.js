import {visitEveryBlock} from "../visitorUtils.js";

export function dceVars(node) {
    var declarations = new Map()
    var usages = new Map()


    var result = false
    visitEveryBlock(node, blockNode => {
        blockNode.body.forEach(childNode => {
            result = applyConstantsInRightHand(childNode, constantsMap) || result
        })
    })
    result = true;
}
