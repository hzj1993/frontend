/**
 * 偏函数（局部应用）类似于柯里化
 * 柯里化是将一个多参数函数转换成多个单参数函数，也就是将一个 n 元函数转换成 n 个一元函数。
 * 局部应用则是固定一个函数的一个或者多个参数，也就是将一个 n 元函数转换成一个 n - x 元函数。
 */

function partial1(fn) {
    var args = [].slice.call(arguments, 1);
    return function () {
        return fn.apply(this, args.concat([].slice.call(arguments)));
    };
}

// 使用示例：
// function add(a, b, c) {
//     return a + b + c;
// }
// add(1, 2, 3);
// var addPartial = partial(add, 1);
// addPartial(2,3);


// 实现占位符功能
var _ = {};
function partial2(fn) {
    var args = [].slice.call(arguments, 1);
    return function () {
        var index = 0;
        for (var i = 0; i < args.length; i++) {
            if (args[i] === _) {
                args[i] = arguments[index++];
            }
        }
        while (index < arguments.length) {
            args.push(arguments[index++]);
        }
        return fn.apply(this, args);
    };
}
// 使用示例：
// function add(a, b, c) {
//     return a + b + c;
// }
// var addPartial = partial(add, _, 1);
// addPartial(2,3);