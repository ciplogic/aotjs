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
}

function getTargetArrayOfNode(node) {
    var targetNode = isNodeOfType(node, 'Program')? node:node.body
    var arr = getBlockArr(targetNode)
    return arr?arr:[]
}

function renameUsage(identifierNode){

}

function extractDeclarations(node) {
    declareIdentifierInScope(node.id)

    if (node.params) {
        node.params.forEach(arg=>declareIdentifierInScope(arg))
    }

    var arr = getTargetArrayOfNode(node).filter(it=>isNodeOfType(it, 'VariableDeclaration'))
    arr .forEach(varNode=>{
        varNode.declarations.forEach(decl=>{
            declareIdentifierInScope(decl.id)
        })

    })

    var functions = getTargetArrayOfNode(node).filter(it=>isNodeOfType(it, 'FunctionDeclaration'))
    functions.forEach(funNode=>{
        addScope()
        extractDeclarations(funNode);
        removeScope()

    })
}

function handleScope(node){
    extractDeclarations(node)


}

export function prefixDeclarations(parentAst) {
    addScope('glb');
    handleScope(parentAst)
    removeScope()
}