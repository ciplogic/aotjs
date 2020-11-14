//
// Created by ciprian on 11/14/20.
//

#include <stdexcept>
#include "aotjs.hpp"
using namespace aotJs;

JsVal _valOf(int val) {
    JsVal result;
    result.typeId = aotJs::Int;
    result._intValue = val;
    return result;
}

bool isTruish(JsVal jsVal) {
    switch (jsVal.typeId) {
        case Undefined: return false;
        case Int: return jsVal._intValue;
        default:
            throw std::runtime_error("Unhandled jsVal type");

    }
    return false;
}

JsVal add(JsVal left, JsVal right) {
    return JsVal();
}

JsVal sub(JsVal left, JsVal right) {
    return JsVal();
}

JsVal mul(JsVal left, JsVal right) {
    return JsVal();
}

JsVal lessThan(JsVal left, JsVal right) {
    return JsVal();
}
