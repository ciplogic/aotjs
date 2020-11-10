import * as walk from "acorn-walk";

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

    var result = {name, args, body, usesThis}

    return result;
}
