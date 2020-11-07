import {Parser} from 'acorn'
import astring from 'astring'

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

export const printAst =
    astTree => astring.generate(astTree);

export const getNewScope = () => parseJs('if(true){}')

