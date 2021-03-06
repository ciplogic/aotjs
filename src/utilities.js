import {readFileSync, writeFileSync} from "fs";

export function readFile(fileName) {
    return readFileSync(fileName, 'utf8')
}
export function writeFile(fileName, text) {
    return writeFileSync(fileName, text, 'utf8')
}

export function arrayInsertAt(arr, idx, value) {
    arr.splice(idx, 0, value);
}

export function arrayRemoveAt(array, index) {
    array.splice(index, 1);
}

export function arrayLast(array) {
    return array.length?array[array.length-1]:null
}

export function reverseForEach(arr, cb){
    for(var i = arr.length-1; i>=0; i--) {
        cb(arr[i], i)
    }
}

export function subarray(arr, start, length) {
    var lookForEnd = length === undefined || length === -1
    var endIndex = lookForEnd ? arr.length - start : length
    var result = []
    for (var i = 0; i < endIndex; i++) {
        result.push(arr[start + i])
    }
    return result
}

export function joinArrays() {
    var result = []
    for (var arrIdx in arguments) {
        var arr = arguments[arrIdx]
        if (arr === null || arr === undefined) {
            continue
        }
        if (Array.isArray(arr)) {
            result = result.concat(arr)
        } else {
            result.push(arr)
        }
    }
    return result
}
