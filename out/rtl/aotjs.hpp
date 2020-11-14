#pragma once

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
    };

    JsVal _val(int val);
    bool isTruish(JsVal jsVal);

    JsVal add(JsVal left, JsVal right);
    JsVal sub(JsVal left, JsVal right);
    JsVal mul(JsVal left, JsVal right);
    JsVal lessThan(JsVal left, JsVal right);
}
