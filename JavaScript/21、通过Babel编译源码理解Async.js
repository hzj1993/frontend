/**
 * 此章节略难...主要是我一直弄不懂async，只得深入 Babel 编译 async 后的源码去理解，
 * 我会尽可能写出注释，帮助理解
 * 编译源代码来自 Babel 官网的 Try it out
 */

// 首先我们贴出async相关代码：
const fetchData = (data) => new Promise((resolve) => setTimeout(resolve, 1000, data + 1));

const fetchValue = async function () {
    var value1 = await fetchData(1);
    var value2 = await fetchData(value1);
    var value3 = await fetchData(value2);
    console.log(value3)
};

fetchValue();
// 大约 3s 后输出 4


// 经过Babel转换后代码如下：
"use strict";

/**
 *
 * @param gen Generator 函数执行后返回的迭代器对象
 * @param resolve _asyncToGenerator 函数返回的 Promise 对象的 resolve 方法，控制该对象的状态
 * @param reject  _asyncToGenerator 函数返回的 Promise 对象的 reject 方法，控制该对象的状态
 * @param _next
 * @param _throw
 * @param key 在这里目测只有 "next" 和 "throw" 两种，对应的就是 Generator 函数的 next 和 throw 方法
 * @param arg 迭代器每执行一遍后返回的结果的 value 值
 */
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}

// 该函数有点像co实现的自动执行，实际上就是 Generator 函数的自动执行，并返回一个 Promise 对象
// asyncGeneratorStep 函数与 _asyncToGenerator 函数配合的结果就是将传入的生成器函数 fn 一直自动执行，
// 直到最终 done 为 true，然后 resolve 最后的 value
function _asyncToGenerator(fn) {
    return function () {
        var self = this, args = arguments;
        return new Promise(function (resolve, reject) {
            var gen = fn.apply(self, args);

            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }

            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }

            _next(undefined);
        });
    };
}

var fetchData = function fetchData(data) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, 1000, data + 1);
    });
};

var fetchValue = /*#__PURE__*/function () {
    // mark 函数为了给 _callee 函数的 prototype 挂载 next，throw，return等方法
    // 下面是 mark 函数的代码，Gp上面挂载有 next(),throw(),return() 函数，
    // 我的理解是经过 mark 操作后，genFun 函数构造出的对象就拥有了 next(),throw(),return() 函数，就相当于是一个 generator 对象
    // runtime.mark = function(genFun) {
    //     genFun.__proto__ = GeneratorFunctionPrototype;
    //     genFun.prototype = Object.create(Gp);
    //     return genFun;
    // };
    // mark 函数可以简化为这样：调用 next() 相当于调用 _invoke()，_invoke() 下面会继续说到
    // runtime.mark = function(genFun) {
    //     var generator = Object.create({
    //         next: function(arg) {
    //             return this._invoke('next', arg)
    //         }
    //     });
    //     genFun.prototype = generator;
    //     return genFun;
    // };
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var value1, value2, value3;

        // wrap 函数返回了一个 generator 对象，这个对象的原型是 _callee.prototype，也就是说 generator 对象继承了 next() 等方法
        // 下面是 warp 方法，可以看出返回了一个原型是 outerFn.prototype 的对象，outerFn 就是 _callee
        // function wrap(innerFn, outerFn, self) {
        //     var generator = Object.create(outerFn.prototype);
        //     var context = new Context([]);
        //     generator._invoke = makeInvokeMethod(innerFn, self, context);
        //     return generator;
        // }
        // generator.next(arg) 相当于 运行 generator._invoke('next', arg)，又相当于运行 makeInvokeMethod(_callee$, self, context) 返回的闭包函数
        //
        // _context 是一个全局对象，如下：stop() 负责更改 done 的状态为 true，abrupt 和 complete是当原函数内有 return 语句时会调用
        // var ContinueSentinel = {};
        // var context = {
        //     done: false,
        //     method: "next",
        //     next: 0,
        //     prev: 0,
        //     abrupt: function(type, arg) {
        //         var record = {};
        //         record.type = type;
        //         record.arg = arg;
        //
        //         return this.complete(record);
        //     },
        //     complete: function(record, afterLoc) {
        //         if (record.type === "return") {
        //             this.rval = this.arg = record.arg;
        //             this.method = "return";
        //             this.next = "end";
        //         }
        //
        //         return ContinueSentinel;
        //     },
        //     stop: function() {
        //         this.done = true;
        //         return this.rval;
        //     }
        // };
        // makeInvokeMethod 的代码如下：
        // function makeInvokeMethod(innerFn, self, context) {
        //   var state = 'start';
        //
        //   return function invoke(method, arg) {
        //
        //     if (state === 'completed') {
        //       return { value: undefined, done: true };
        //     }
        //
        //     context.method = method;
        //     context.arg = arg;
        //
        //     while (true) {
        //
        //       state = 'executing';
        //
        //       var record = {
        //         type: 'normal',
        //         arg: innerFn.call(self, context)
        //       };
        //       if (record.type === "normal") {
        //
        //         state = context.done ? 'completed' : 'yield';
        //
        //         if (record.arg === ContinueSentinel) {
        //           continue;
        //         }
        //
        //         return {
        //           value: record.arg,
        //           done: context.done
        //         };
        //
        //       }
        //     }
        //   };
        // }
        // 我总结一下：makeInvokeMethod 函数返回的 invoke 是通过 state 以及 context.done 控制当前返回的数据
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return fetchData(1);

                    case 2:
                        value1 = _context.sent;
                        _context.next = 5;
                        return fetchData(value1);

                    case 5:
                        value2 = _context.sent;
                        _context.next = 8;
                        return fetchData(value2);

                    case 8:
                        value3 = _context.sent;
                        console.log(value3);

                    case 10:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee);
    }));

    return function fetchValue() {
        return _ref.apply(this, arguments);
    };
}();

fetchValue();

// 综上，async 函数 fetchValue 通过 Babel 转化后的代码的思路是这样的：
// Babel 代码实现了一个 Gp 对象，该对象是具有next()、return()、throw()函数的类似 Generator 对象，
// 然后同时也实现了一个 _asyncToGenerator 的生成器自动执行函数，将函数 fetchValue 转化为 Babel 内部实现的 Generator 函数，
// _asyncToGenerator 对 fetchValue 转化后的生成器函数做自动执行，最后返回了一个 Promise 对象。
// async原理就是：简单来说就是 Promise + Generator + 自动执行

/** **************************************************************************************************************** **/
/** **************************************************************************************************************** **/