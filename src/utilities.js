import {readFileSync} from "fs";

export function readFile(fileName) {
    return readFileSync(fileName, 'utf8')
}

export function arrayInsertAt(arr, idx, value) {
    arr.splice(idx, 0, value);
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
        if (Array.isArray(arr)) {
            result = result.concat(arr)
        } else {
            result.push(arr)
        }
    }
    return result
}