/**
 * JavaScript 的模块加载是很重要的内容，浏览器端主要有 CMD、AMD、ES Module 等实现模块加载，而服务端（Node）主要是 CommonJS
 *
 * AMD 特点是依赖提前原则，会先加载所有需要的模块，然后再执行代码，并且支持回调函数，代表库有 require.js
 * CMD 是依赖就近原则，代码在执行时遇到加载模块代码时才进行模块加载，加载模块时同步操作，会阻塞后面代码的执行，代表库有 sea.js
 * ES Module 是 ES6 提出的模块加载的方案，通过 import 和 export 关键字进行导入导出模块，兼容性还不够好，目前需要 Babel 转为 CommonJS 使用，在编译阶段加载模块
 * CommonJS 与 CMD 规范有相似之处，都是依赖就近原则，通过 require()、module.exports 等导入导出模块
 *
 * CommonJS 与 ES Module 区别是：
 * 1、CommonJS 模块输出的是值的拷贝，而 ES Module 输出的是值的引用
 * 2、CommonJS 是运行时加载，ES Module 是编译时输出接口
 *
 * CommonJS 其他特点：
 * 1、同步执行，适合用于服务端，因为服务端的读文件比较快
 * 2、当遇到循环引用时，只输出已经执行的部分
 * 3、由于是运行时加载，所以 require 方法内可以使用变量
 */

/**
 * 参考文章：https://www.liaoxuefeng.com/wiki/1022910821149312/1023027697415616
 */
// 假设我们在 test.js 文件中有如下代码：
var s = 'Hello';
var name = 'world';
console.log(s + ' ' + name + '!');

// Node 在加载 test.js 时可以把这个文件包装一下，变成这样：
(function () {
    var s = 'Hello';
    var name = 'world';
    console.log(s + ' ' + name + '!');
})();
// s、name 变量就变成了局部变量，我们再进一步，怎么实现 module.exports
// 其实是 Node 在外部准备了一个 module 对象，对应的是该模块文件的 module 对象，如下代码：
var module = {
    id: '',
    exports: {}
};
var load = function (module) {
    // test.js 代码开始
    var s = 'Hello';
    var name = 'world';
    console.log(s + ' ' + name + '!');
    module.exports = {name: name};
    // test.js 代码结束

    return module.exports;
}
var exported = load(module);
save(module, exported); // 保存输出的 module

// require 方法也是类似的方式，是 Node 提供的一个全局方法，如下：
var module = {
    id: '',
    exports: {} // 初始化为空对象
};
var load = function (exports, module, require) {
    // test.js 代码开始
    var test2 = require('./test2.js');
    var s = 'Hello';
    var name = 'world';
    console.log(s + ' ' + name + '!');
    module.exports = {name: name};
    // test.js 代码结束

    return module.exports;
}
var exported = load(module.exports, module, require);
save(module, exported); // 保存输出的 module

// 可以注意到 test.js 内的 exports 和 module.exports 其实指向的是同一个对象，并且初始化为空对象{}，
// 在 test.js 中，不可以直接给 exports 赋值，如：exports = {aaa: aaa}，只能使用 exports.aaa = aaa，
// 原因如下：
var obj = {
    subObj: {}
};
function text(subObj) {
    subObj = {o: 1};
}
text(obj.subObj);
console.log(obj); // {subObj:{}}

// 在函数 text 创建执行上下文时，会创建一个 subObj 变量储存外部传的值，在这里 subObj 保存的是 obj.subObj 这个对象的地址，
// text 函数内部对变量 subObj 更改值，不会影响 obj.subObj 的值，除非 text 函数改为这样：
function text(subObj) {
    subObj.o = 1;
}
console.log(obj); // {subObj:{o:1}}

// 对应到上面 exports 不能直接赋值也是一样的原因。
// 看一下 Node 官方文档的代码：
function require(/* ... */) {
    const module = { exports: {} };
    ((module, exports) => {
        // 模块文件代码，在这个例子中，定义了一个函数
        function someFunc() {}
        exports = someFunc;
        // At this point, exports is no longer a shortcut to module.exports, and
        // this module will still export an empty default object.
        module.exports = someFunc;
        // At this point, the module will now export someFunc, instead of the
        // default object.
    })(module, module.exports);
    return module.exports;
}



// 深入思考：为什么浏览器不能直接使用 CommonJS 形式加载模块？
// 浏览器环境并没有提供 module、exports、require 等变量，因此无法使用。如果要使用就需要先提供这些变量，而 ES Module 使用 Babel 转码后就是变成了 CommonJS
// Babel 模拟实现了 module、exports、require 等变量


// 我们看看一份精简的 Webpack 打包后的代码，已经经过 Babel 转化为 CommonJS：
// 参考文章：https://github.com/mqyqingfeng/Blog/issues/108
(function(modules) {

    // 用于储存已经加载过的模块
    var installedModules = {};

    // Babel 实现的 require 方法
    function require(moduleName) {

        // 查看是否有缓存
        if (installedModules[moduleName]) {
            return installedModules[moduleName].exports;
        }

        var module = installedModules[moduleName] = {
            exports: {} // 初始化为空对象
        };

        // 执行对应的模块文件的代码，给模块文件注入 module、exports、require 等参数
        modules[moduleName](module, module.exports, require);

        return module.exports;
    }

    // 加载主模块
    return require("main");

})({
    "main": function(module, exports, require) {

        var addModule = require("./add");
        console.log(addModule.add(1, 1))

        var squareModule = require("./square");
        console.log(squareModule.square(3));

    },
    "./add": function(module, exports, require) {
        console.log('加载了 add 模块');

        module.exports = {
            add: function(x, y) {
                return x + y;
            }
        };
    },
    "./square": function(module, exports, require) {
        console.log('加载了 square 模块');

        var multiply = require("./multiply");
        module.exports = {
            square: function(num) {
                return multiply.multiply(num, num);
            }
        };
    },

    "./multiply": function(module, exports, require) {
        console.log('加载了 multiply 模块');

        module.exports = {
            multiply: function(x, y) {
                return x * y;
            }
        };
    }
})


