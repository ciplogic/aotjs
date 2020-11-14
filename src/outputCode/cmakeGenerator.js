import {writeFile} from '../utilities.js'

export function writeCmakeFileInDid(targetDir, targetCppFile) {
    var templateCode = `cmake_minimum_required(VERSION 3.17)
project(AppMin)

set(CMAKE_CXX_STANDARD 17)

add_executable(AppMin rtl/aotjs.cpp ${targetCppFile})
`
    writeFile(targetDir + '/CMakeLists.txt', templateCode)

}
