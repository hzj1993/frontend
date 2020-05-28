/**
 * Generator 的自动执行
 * 这个模块的内容跟 Promise 一样，对于我来说也是很难理解的，但是一旦理解了，水平必定有所提升，奥利给！
 * 生成器函数返回一个遍历器对象
 */
// 先看看基本用法
(function () {
    var fetch = require('node-fetch');

    function* gen() {
        var url = 'https://api.github.com/users/github';
        var result = yield fetch(url);
        console.log(result.name);
    }

    var g = gen();
    var result = g.next();
    result.value.then(data => {
        g.next(data.json());
    });
})();

// 升级一下
(function () {
    function* gen() {
        var r1 = yield fetch('https://api.github.com/users/github');
        var r2 = yield fetch('https://api.github.com/users/github/followers');
        var r3 = yield fetch('https://api.github.com/users/github/repos');

        console.log([r1.bio, r2[0].login, r3[0].full_name].join('\n'));
    }

    var g = gen();
    var res = g.next();
    res.value.then(data => {
        return data.json();
    }).then(data => {
        return g.next(data).value;
    }).then(data => {
        return data.json();
    }).then(data => {
        return g.next(data).value;
    }).then(data => {
        return data.json();
    }).then(data => {
        g.next(data);
    });

    // 优化一下上述代码
    function run(gen) {
        var g = gen();

        function next(data) {
            var result = g.next(data);
            if (result.done) return;
            result.value
                .then(data => data.json())
                .then(data => {
                    next(data);
                });
        }

        next();
    }

    run(gen);
})();

// 上述代码简化
(function () {
    function* gen() {
        var r1 = yield fetch('https://api.github.com/users/github');
        var json1 = yield r1.json();
        var r2 = yield fetch('https://api.github.com/users/github/followers');
        var json2 = yield r2.json();
        var r3 = yield fetch('https://api.github.com/users/github/repos');
        var json3 = yield r3.json();

        console.log([json1.bio, json2[0].login, json3[0].full_name].join('\n'));
    }

    // 优化一下上述代码
    function run(gen) {
        var g = gen();

        function next(data) {
            var result = g.next(data);
            if (result.done) return;
            result.value.then(data => {
                next(data);
            });
        }

        next();
    }

    run(gen);
})();

// 以上是通过 Promise 实现 Generator 函数的自动执行，如果换成回调函数，如下例子
(function () {
    function fetchUrl(url) {
        return function (cb) {
            setTimeout(function () {
                cb()
            }, 2000);
        }
    }

    function* gen() {
        var r1 = yield fetchUrl('www.111.com');
        var r2 = yield fetchUrl('www.222.com');
        console.log([r1.data, r2.data].join('\n'));
    }

    function run(gen) {
        var g = gen();

        function next(data) {
            var result = g.next(data);
            if (result.done) return;
            result.value(next);
        }

        next();
    }

    run(gen);
})();

// 将promise和回调函数的方式结合起来
(function () {
    function run(gen) {
        var g = gen();

        function next(data) {
            var result = g.next(data);
            if (result.done) return;
            if (isPromise(result.value)) {
                result.value.then(data => {
                    next(data);
                });
            } else {
                result.value(next);
            }
        }

        next();
    }

    function isPromise(obj) {
        return obj && typeof obj.then === 'function';
    }

    module.exports = run;
})();

// 再把上面的函数改进一下，使其可以捕获生成器函数的错误，并且获得它的返回值
(function () {
    function run(gen) {
        var g = gen();
        return new Promise((resolve, reject) => {
            function next(data) {
                try {
                    var result = g.next(data);
                } catch (e) {
                    reject(e);
                }
                if (result.done) {
                    resolve(result.value);
                }
                var value = toPromise(result.value);

                value.then(data => {
                    next(data);
                }).catch(e => {
                    reject(e);
                })
            }

        });
    }
    function isPromise(obj) {
        return obj && typeof obj.then === 'function';
    }
    function toPromise(obj) {
        if (isPromise(obj)) return obj;
        if (typeof obj === 'function') return thunkToPromise(obj);
        return obj;
    }
    // 将回调函数转换成 Promise 形式
    function thunkToPromise(fn) {
        return new Promise((resolve, reject) => {
            fn(function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
})();

// 在上面的基础上简化一下
(function () {
    function run(gen) {

    }
    function isPromise(obj) {
        return typeof obj.then === 'function';
    }
    function toPromise(obj) {
        if (isPromise(obj)) return obj;
        if (typeof obj === 'function') return thunkToPromise(obj);
        return obj;
    }
    function thunkToPromise(fn) {
        return new Promise((resolve, reject) => {
            fn(function (err, data) {
                if (err) reject(err);
                resolve(data);
            });
        });
    }
})();

