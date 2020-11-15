#pragma once

#include <string>

namespace aotJs {
    enum JsValType{
        Undefined,
        Int,
        Double,
        Ref,
    };
    struct JsVal {
        int typeId;
        union {
            int _intValue;
            double _doubleValue;
        };
        JsVal() = default;
        JsVal(int iVal);

        JsVal invoke(JsVal jsValArr);
        JsVal operator()(int v = 0);
    };

    JsVal _val(int val);
    bool isTruish(JsVal jsVal);

    JsVal add(JsVal left, JsVal right);
    JsVal sub(JsVal left, JsVal right);
    JsVal mul(JsVal left, JsVal right);
    JsVal lessThan(JsVal left, JsVal right);
    JsVal lessOrEqThan(JsVal left, JsVal right);

    JsVal jsReadField(JsVal obj, const std::string& property);
}
