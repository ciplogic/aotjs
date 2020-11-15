//
// Created by ciprian on 11/14/20.
//

#include <stdexcept>
#include "aotjs.hpp"
using namespace aotJs;
namespace aotJs {

    int _valInt(JsVal val)
    {
        return val._intValue;
    }

    JsVal _val(int val) {
        JsVal result;
        result.typeId = aotJs::Int;
        result._intValue = val;
        return result;
    }

    bool isTruish(JsVal jsVal) {
        switch (jsVal.typeId) {
            case Undefined:
                return false;
            case Int:
                return jsVal._intValue;
            default:
                throw std::runtime_error("Unhandled jsVal type");

        }
        return false;
    }

    JsVal add(JsVal left, JsVal right) {
        if (left.typeId == Int) {
            return _val(_valInt(left) + _valInt(right));
        }
        return JsVal();
    }

    JsVal sub(JsVal left, JsVal right) {
        if (left.typeId == Int) {
            return _val(_valInt(left) - _valInt(right));
        }
        return JsVal();
    }

    JsVal mul(JsVal left, JsVal right) {
        if (left.typeId == Int) {
            return _val(_valInt(left) * _valInt(right));
        }
        return JsVal();
    }

    JsVal lessThan(JsVal left, JsVal right) {
        if (left.typeId == Int) {
            return _val(_valInt(left) < _valInt(right));
        }
        return JsVal();
    }

    JsVal lessOrEqThan(JsVal left, JsVal right) {
        if (left.typeId == Int) {
            return _val(_valInt(left) <= _valInt(right));
        }
        return JsVal();
    }

    JsVal aotJs::jsReadField(JsVal obj, const std::string &property) {
        return JsVal();
    }


    JsVal::JsVal(int i) {
        *this = _val(i);
    }

    JsVal JsVal::invoke(JsVal jsValArr) {
        return JsVal();
    }

    JsVal JsVal::operator()(int v) {
        return *this;
    }
}
