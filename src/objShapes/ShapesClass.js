var shapesTree = [new Shape([], 0, -1)]

export class Shape {
    constructor(fields, shapeIndex, parentShapeIndex) {
        this.fields = fields
        this.shapeIndex = shapeIndex
        this.parentShapeIndex = parentShapeIndex
        this.children = new Map()
    }
    index() {
        return this.shapeIndex
    }
    addChildShape(fieldName){
        var childFields = [...this.fields, fieldName]
        var addedShape = new Shape(childFields, shapesTree.length, this.index())
        this.children.set(fieldName, addedShape)
        return addedShape
    }
}

export function rootShape(){
    return shapesTree[0]
}
