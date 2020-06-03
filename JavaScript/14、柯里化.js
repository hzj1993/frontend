/**
 * 柯里化：
 * 将多个参数的函数转化为一系列一个参数的函数
 *
 * 如何理解柯里化？
 * 用闭包把参数保存起来，当参数的数量足够执行函数了，就开始执行函数
 *
 * 举例：
 * function add(a, b) {
 *   return a + b;
 * }
 *
 * 执行 add 函数，一次传入两个参数即可
 * add(1, 2) // 3
 *
 * 假设有一个 curry 函数可以做到柯里化
 * var addCurry = curry(add);
 * addCurry(1)(2) // 3
 */

// 简单版
function curry1(fn) {
    var args = [].slice.call(arguments, 1);
    return function () {
        var newArgs = args.concat([].slice.call(arguments));
        return fn.apply(this, newArgs);
    };
}
// 使用示例：
// function add(a, b, c) {
//     return a + b + c;
// }
// add(1, 2, 3);
// var addCurry = curry1(add, 1);
// addCurry(2,3);



// 第二版
function subCurry(fn) {
    var args = [].slice.call(arguments, 1);

    return function () {
        return fn.apply(this, args.concat([].slice.call(arguments)));
    }
}

function curry2(fn, length) {
    // fn.length为fn形参个数
    length = length || fn.length;

    return function () {
        var args = [].slice.call(arguments);

        if (args.length < length) {
            return curry2(subCurry.apply(this, [fn].concat(args)), length - args.length);
        } else {
            // 我在调试的时候，一直得到的是undefined，原因是少加了return，没有返回最终结果，一定要记得
            return fn.apply(this, args);
        }
    };
}
// 使用示例：
// function add(a, b, c) {
//     return a + b + c;
// }
// add(1, 2, 3);
// var addCurry = curry2(add);
// addCurry(1)(2)(3);
// addCurry(1, 2)(3);


// 第三版
function curry3(fn, arg) {
    arg = arg || [];
    var length = fn.length;

    return function () {
        var newArgs = arg.concat([].slice.call(arguments));

        if (newArgs.length < length) {
            return curry3.call(this, fn, newArgs);
        } else {
            return fn.apply(this, newArgs);
        }
    };
}

// segmentfault 的@大笑平 补充的牛逼写法
var curry4 = fn =>
    judge = (...args) =>
        args.length === fn.length
            ? fn(...args)
            : (arg) => judge(...args, ...arg)

// 变形
var curry5 = (fn, ...args) =>
    fn.length <= args.length
        ? fn(...args)
        : curry5.bind(null, fn, ...args)