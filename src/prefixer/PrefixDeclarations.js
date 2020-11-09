import {arrayLast} from "../utilities.js";
import {getBlockArr} from "../visitorUtils.js";
import {isNodeIdentifier, isNodeOfType} from "../nodeTypeUtilities.js";
import {logAst} from "../parseUtils.js";

var stackScopes = []

var scopes = []

function addScope(scopeName){
    if (!scopeName) {
        scopeName = 'scope'+scopes.length
    }
    var parentScope = arrayLast(stackScopes)
    var scopeInstance = {
        name: '__' + scopeName,
        parent: parentScope,
        renames: new Map(),
        usagesIdentifiers: []
    }
    scopes.push(scopeInstance)

    stackScopes.push(scopeInstance)
}

function removeScope() {
    stackScopes.pop()
}

function declareIdentifierInScope(identifierNode){
    if (!isNodeIdentifier(identifierNode))
        return
    var identifierName = identifierNode.name
    var lastScope = arrayLast(stackScopes)
    var buildScopeName = lastScope.name + '_'+identifierName
    lastScope.renames.set(identifierName, buildScopeName)
    renameUsage(identifierNode)
}

function getTargetArrayOfNode(node) {
    var targetNode = isNodeOfType(node, 'Program')? node:node.body
    var arr = getBlockArr(targetNode)
    return arr?arr:[]
}

function getRenamedName(name) {
    var lastScope = arrayLast(stackScopes)
    while (lastScope){
        var renamesMap = lastScope.renames
        var mappedName = renamesMap.get(name)
        if (mappedName)
            return mappedName
        lastScope = lastScope.parent
    }
}

function renameUsage(identifierNode){
    if (!isNodeIdentifier(identifierNode))
        return
    var getNewName = getRenamedName(identifierNode.name)
    if (getNewName)
    {
        identifierNode.name = getNewName
    }
}

function getUsagesOfNode(node) {
    if (!node)
        return
    var nodeType = node.type
    switch (nodeType)
    {
        case 'Identifier':
            return renameUsage(node)
        case 'Literal':
            return
        case 'FunctionDeclaration': {
            getUsagesOfNode(node.name)
            return
        }
        case 'ExpressionStatement': {
        getUsagesOfNode(node.expression)

        return
    }
        case 'CallExpression':
        {
            getUsagesOfNode(node.callee)
            node.arguments.forEach(getUsagesOfNode)
            return
        }
        case 'BinaryExpression':
        case 'AssignmentExpression':
        {
            getUsagesOfNode(node.left)
            getUsagesOfNode(node.right)
            return
        }
        case 'UnaryExpression':
        case 'UpdateExpression':
        case 'ReturnStatement':
        {
            getUsagesOfNode(node.argument)
            return
        }
        case 'VariableDeclaration': {
            node.declarations.forEach(
                decl => {
                    getUsagesOfNode(decl.id);
                    getUsagesOfNode(decl.init);
                }
            )

            return
        }
        case 'MemberExpression':
        {
            getUsagesOfNode(node.object)
            return
        }

        default:
            throw new Error("Unhandled")


    }
}

function extractDeclarations(node) {

    if (node.params) {
        node.params.forEach(arg=>declareIdentifierInScope(arg))
    }

    var arr = getTargetArrayOfNode(node).filter(it=>isNodeOfType(it, 'VariableDeclaration'))
    arr.forEach(varNode=>{
        varNode.declarations.forEach(decl=>{
            declareIdentifierInScope(decl.id)
        })
    })

    var functions = getTargetArrayOfNode(node).filter(it=>isNodeOfType(it, 'FunctionDeclaration'))
    functions.forEach(funNode=>{
        declareIdentifierInScope(funNode.id)
        addScope()
        extractDeclarations(funNode);
        removeScope()

    })
    getTargetArrayOfNode(node).forEach(getUsagesOfNode)
}

function handleScope(node){
    extractDeclarations(node)


}

export function prefixDeclarations(parentAst) {
    addScope('glb');
    handleScope(parentAst)
    removeScope()
}
