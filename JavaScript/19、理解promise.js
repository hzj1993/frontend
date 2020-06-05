/**
 * Promise
 * 具体API有：then、catch、finally、all、race、try、allSettled、resolve、reject、any
 * promise一共有3个状态：pending、fulfilled、rejected
 *
 * promise解决了回调地狱的问题
 */

// 经典红绿灯问题
// 题目：红灯3秒亮一次，绿灯1秒亮一次，黄灯2秒亮一次；如何让三个灯不断交替重复亮灯？（用 Promise 实现）
function red() {
    console.log('red');
}

function green() {
    console.log('green');
}

function yellow() {
    console.log('yellow');
}

// 解答：
function light(callback, time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            callback();
            resolve();
        }, time);
    });
}

function step() {
    Promise.resolve().then(() => {
        return light(red, 3000);
    }).then(() => {
        return light(green, 1000);
    }).then(() => {
        return light(yellow, 2000);
    }).then(() => {
        step();
    });
}

step();

/* ====================================================================================== */

// 实现promisify，将callback类型转成promise实现
// 假设callback函数第一个参数时错误信息，没有错误时为null
function promisify(original) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            args.push(function callback(err, ...values) {
                if (err) return reject(err);
                return resolve(...values);
            });
            original.call(this, ...args);
        });
    };
}

// var getID = promisify(fetchID);
// getID('123').then(res => {/* ... */});

/** ============================================================================================================= **/

// 实现一个简单的promise

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromiseSimple(fn) {
    const self = this;
    self.value = null;
    self.error = null;
    self.state = PENDING;
    self.resolvedCallbacks = [];
    self.rejectedCallbacks = [];

    const resolve = value => {
        setTimeout(function () {
            if (self.state === PENDING) {
                self.state = FULFILLED;
                self.value = value;
                self.resolvedCallbacks.map(cb => cb(self.value));
            }
        });
    };

    const reject = error => {
        setTimeout(function () {
            if (self.state === PENDING) {
                self.state = REJECTED;
                self.error = error;
                self.rejectedCallbacks.map(cb => cb(self.error));
            }
        });
    };

    fn(resolve, reject);
}

MyPromiseSimple.prototype.then = function (onFulfilled, onRejected) {
    const self = this;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {
        throw r;
    };
    if (self.state === PENDING) {
        self.resolvedCallbacks.push(onFulfilled);
        self.rejectedCallbacks.push(onRejected);
    } else if (self.state === FULFILLED) {
        onFulfilled(self.value);
    } else if (self.state === REJECTED) {
        onRejected(self.error);
    }
    return self;
};

/** ============================================================================================================== **/

// 实现一个符合 Promise/A+ 规范的 Promise
// 以下代码理解可能会比较困难（理解这段代码我用了三天...），建议一边参考规范一边看
// Promise/A+ 规范地址：https://www.ituring.com.cn/article/66566

function MyPromise(fn) {
    const self = this;
    self.state = PENDING;
    self.value = null;
    self.resolvedCallbacks = [];
    self.rejectedCallbacks = [];

    function resolve(value) {
        // 如果resolve的参数是promise对象，返回该参数then后返回的对象
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }
        setTimeout(() => {
            if (self.state === PENDING) {
                self.state = FULFILLED;
                self.value = value;
                self.resolvedCallbacks.forEach(cb => cb(self.value));
            }
        }, 0);
    }

    function reject(error) {
        setTimeout(() => {
            if (self.state === PENDING) {
                self.state = REJECTED;
                self.value = error;
                self.rejectedCallbacks.forEach(cb => cb(self.value));
            }
        }, 0);
    }

    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
    const self = this;
    let promise2;
    // 当传入的 onFulfilled 和 onRejected 不是function时，相当于给 onFulfilled 和 onRejected 一个默认函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : err => {
        throw err;
    };
    if (self.state === PENDING) {
        // 因为then要返回一个promise对象，以便于链式调用，同时避免重复引用同一个promise对象，所以此处返回一个新的MyPromise对象
        return (promise2 = new MyPromise((resolve, reject) => {
            self.resolvedCallbacks.push(() => {
                try {
                    const x = onFulfilled(self.value);
                    // 此处对我来说是理解的难点，resolutionProcedure 其实就是对 onFulfilled(self.value) 执行后返回的结果 x 做判断，
                    // 如果返回的结果 x 是MyPromise对象，则需要对 x 进行解构，直白点就是拿到 x.then(value => {}) 中 value 的值，
                    // 如果这个值不是MyPromise对象，最终就 resolve 这个值
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
            self.rejectedCallbacks.push(() => {
                // 假如调用 then 时没指定 onRejected 方法，就会进入 catch 中，调用 promise2 的 reject 方法，将错误传递到 promise2
                // 如：xxx.then(() => {/* ... */}) 第二个参数为空，没指定 onRejected ，xxx.then(() => {/* ... */}).catch(() => {/* 接收到前一个的错误 */})
                try {
                    const x = onRejected(self.value);
                    // 解释如上
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        }));
    } else if (self.state === FULFILLED) {
        return (promise2 = new MyPromise((resolve, reject) => {
            // 由于规范规定 onFulfilled 和 onRejected 异步执行，由于原生Promise是微任务，无法模拟，所以只能用 setTimeout 模拟
            setTimeout(function () {
                try {
                    const x = onFulfilled(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        }));
    } else if (self.state === REJECTED) {
        return (promise2 = new MyPromise((resolve, reject) => {
            setTimeout(function () {
                try {
                    const x = onRejected(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        }));
    }

};

// 这里的 resolve 和 reject 都是属于 promise2，用于控制 promise2 的状态
function resolutionProcedure(promise2, x, resolve, reject) {
    // promise2 和 x 不能为同一个实例，不然会导致循环调用
    if (promise2 === x) {
        return reject(new TypeError('error'));
    }
    // 这里开始处理 x 是 MyPromise 对象的情况
    if (x instanceof MyPromise) {
        if (x.state === PENDING) {
            x.then(function (value) {
                // 通过递归调用 resolutionProcedure 去判断 value 的类型
                resolutionProcedure(promise2, value, resolve, reject);
            }, reject);
        } else {
            x.then(resolve, reject);
        }
        return;
    }

    // called 用于保证只执行一次
    let called = false;
    // 规范 2.3.3，判断 x 是否为对象或者函数
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        // 规范 2.3.3.2，如果不能取出 then，就 reject
        try {
            let then = x.then;
            // 如果 then 是函数，执行 then
            if (typeof then === 'function') {
                then.call(x, value => {
                    if (called) return;
                    called = true;
                    resolutionProcedure(promise2, value, resolve, reject);
                }, error => {
                    if (called) return;
                    called = true;
                    reject(error);
                });
            } else {
                resolve(x);
            }
        } catch (e) {
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

// 实现Promise.resolve、Promise.reject、finally、catch方法
MyPromise.resolve = function (value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve, reject) => {
        // 如果参数 value 是一个 thenable 对象，则该新的 Mypromise 对象的状态跟随 value 的状态
        if (value && typeof value.then === 'function') {
            value.then(resolve, reject);
        } else {
            resolve(value);
        }
    });
};
MyPromise.reject = function (value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve, reject) => {
        reject(value);
    });
};
MyPromise.prototype.finally = function (callback) {
    this.then(value => {
        return MyPromise.resolve(callback()).then(() => {
            return value;
        });
    }, error => {
        return MyPromise.resolve(callback()).then(() => {
            return error;
        });
    });
};
MyPromise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
};

// 实现all、race
MyPromise.all = function (list) {
    return new MyPromise((resolve, reject) => {
        let length = list.length;
        let result = [];
        if (!length) {
            resolve(result);
            return;
        }
        const handleData = function (data, i) {
            result[i] = data;
            if (i + 1 === length) {
                resolve(result);
            }
        };
        for (let i = 0; i < length; i++) {
            MyPromise.resolve(list[i]).then(data => {
                handleData(data, i);
            }).catch(error => {
                reject(error);
            });
        }
    });
};
MyPromise.race = function (list) {
    return new MyPromise((resolve, reject) => {
        const length = list.length;
        if (!length) {
            resolve();
            return;
        }
        for (let i = 0; i < length; i++) {
            MyPromise.resolve(list[i]).then(data => {
                resolve(data);
                return;
            }).catch(error => {
                reject(error);
                return;
            });
        }
    });
};

/** =============================================================================================================== **/

// Babel 怎么模拟微任务？
// 这个问题也困扰了我一段时间，直到我看到源码实现：
// https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/task.js
// 贴出关键代码：

var location = global.location;
var set = global.setImmediate;
var clear = global.clearImmediate;
var process = global.process;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
    }
};

var runner = function (id) {
    return function () {
        run(id);
    };
};

var listener = function (event) {
    run(event.data);
};

var post = function (id) {
    // old engines have not location.origin
    global.postMessage(id + '', location.protocol + '//' + location.host);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
// Node.js 0.9+ & IE10+ 支持 setImmediate，以下判断是不支持 setImmediate
if (!set || !clear) {
    // 模拟 setImmediate 方法
    set = function setImmediate(fn) {
        var args = [];
        var i = 1;
        while (arguments.length > i) args.push(arguments[i++]);
        // 将回调方法保存到 queue 队列
        queue[++counter] = function () {
            // eslint-disable-next-line no-new-func
            (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
        };
        // 异步执行回调方法
        defer(counter);
        return counter;
    };
    clear = function clearImmediate(id) {
        delete queue[id];
    };
    // Node.js 0.8-
    // 判断是否支持 process.nextTick 方法，Node环境下支持
    if (classof(process) == 'process') {
        defer = function (id) {
            process.nextTick(runner(id));
        };
        // Sphere (JS game engine) Dispatch API
        // Sphere 框架（游戏引擎）的 Dispatch
    } else if (Dispatch && Dispatch.now) {
        defer = function (id) {
            Dispatch.now(runner(id));
        };
        // Browsers with MessageChannel, includes WebWorkers
        // except iOS - https://github.com/zloirock/core-js/issues/624
    } else if (MessageChannel && !IS_IOS) {
        channel = new MessageChannel();
        port = channel.port2;
        channel.port1.onmessage = listener;
        defer = bind(port.postMessage, port, 1);
        // Browsers with postMessage, skip WebWorkers
        // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (
        global.addEventListener &&
        typeof postMessage == 'function' &&
        !global.importScripts &&
        !fails(post) &&
        location.protocol !== 'file:'
    ) {
        defer = post;
        global.addEventListener('message', listener, false);
        // IE8-
    } else if (ONREADYSTATECHANGE in createElement('script')) {
        defer = function (id) {
            html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
                html.removeChild(this);
                run(id);
            };
        };
        // Rest old browsers
    } else {
        defer = function (id) {
            setTimeout(runner(id), 0);
        };
    }
}
// babel 优先调用process.nextTick 、MessageChannel、postMessage、监听onreadystatechange，最后才调用setTimeout















