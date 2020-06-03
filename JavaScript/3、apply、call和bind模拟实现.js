/**
 * fn.apply(context, args);
 * fn.call(context, ...args);
 */

Function.prototype.call2 = function (context) {
    var result,
        args = [];
    context = context ? Object(context) : Window;
    context.fn = this;
    for (var i = 1; i < arguments.length; i++) {
        args.push('arguments[' + i + ']');
    }
    result = eval('context.fn(' + args + ')');
    delete context.fn;
    return result;
};

Function.prototype.apply2 = function (context, arr) {
    context = context ? Object(context) : Window;
    var args = [],
        result;
    context.fn = this;
    if (!arr) {
        result = context.fn();
    } else {
        for (var i = 0; i < arr.length; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')');
    }
    delete context.fn;
    return result;
};

Function.prototype.bind2 = function (context) {
    if (typeof this !== 'function') {
        throw new Error('调用bind的不是函数！');
    }
    var self = this,
        args = Array.prototype.slice.call(arguments, 1),
        // 新增fNOP作为中间层，避免操作通过bind2返回的函数作为构造函数创建的对象的原型会影响原本构造函数的原型对象
        fNOP = function () {},
        fBound = function () {
            var bindArgs = Array.prototype.slice.call(arguments);
            // 由于原生的bind创建的对象的this指向对象本身，此处模拟原生bind的效果
            //
            return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
        };
    fNOP.prototype = self.prototype;
    fBound.prototype = new fNOP();
    return fBound;
};