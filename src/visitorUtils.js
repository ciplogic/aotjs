export function findExpressionInBlock(node, nodeType, cb) {
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
        for (var i = 0; i < arr.length; i++) {
            var childNode = arr[i]
            findExpressionInBlock(childNode, nodeType, cb);
            if (childNode.type !== nodeType) {
                continue;
            }
            cb(childNode, node, i)
        }
        return;
    }
    Object.keys(node)
        .forEach(key => {
            var childNode = node[key]
            if (!childNode || !childNode.type)
                return;
            findExpressionInBlock(childNode, nodeType, cb)
        })
}