import {Parser} from 'acorn'
import astring from 'astring'
import {isNodeOfType} from "./nodeTypeUtilities.js";

export const parseJs =
    jsCode => Parser.parse(jsCode, {ecmaVersion: 2020});


export const getStatement =
    jsCode => parseJs(jsCode).body[0];

export const parseJsExpression =
    jsCode => getStatement(jsCode).expression;

export const buildLiteralNode =
    literal => {
        if (typeof literal === "number")
            return parseJsExpression('' + literal)
        if (typeof literal === "string")
            return parseJsExpression('"' + literal + '"')
        if (typeof literal === "boolean")
            return parseJsExpression(literal ? 'true' : 'false')
        throw new Error("Not expected literal type" + (typeof literal))
    }

export function wrapNodeInBlock(node) {
    var statement = getStatement('if (1) {}')
    var blockStatement = statement.consequent
    blockStatement.body.push(node)

    return blockStatement
}


export function wrapNodeInBlockIfNeeded(parent, objKey) {
    var node = parent[objKey]
    if(!isNodeOfType(node, 'BlockStatement')) {
        parent[objKey] = wrapNodeInBlock(node)
    }
}

export const printAst =
    astTree => astring.generate(astTree)

export const logAst =
    astTree => console.log(printAst(astTree))

export const getNewScope = () => parseJs('if(true){}')

