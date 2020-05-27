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
// 以下代码理解可能会比较困难（理解这段代码我卡了两天...），建议一边参考规范一边看
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



























