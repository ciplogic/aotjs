export function visitEveryBlock(node, cb) {
    var arr
    switch (node.type) {
        case 'Program':
            arr = node.body
            break;
        case 'BlockStatement':
            arr = node.body
            break;
    }
    if (arr) {
        cb(node)
        for (var i = 0; i < arr.length; i++) {
            visitEveryBlock(arr[i], cb);
        }
        return;
    }
    Object.keys(node)
        .forEach(key => {
            var childNode = node[key]
            if (childNode && childNode.type) {
                visitEveryBlock(childNode, cb)
            }
        })
}

export function findExpressionInBlock(node, nodeType, cb) {
    visitEveryBlock(node, blockNode=>{
        var arr = blockNode.body
        for (var i = 0; i < arr.length; i++) {
            var childNode = arr[i]
            findExpressionInBlock(childNode, nodeType, cb);
            if (childNode.type !== nodeType) {
                continue;
            }
            cb(childNode, blockNode, i)
        }
    })
}
