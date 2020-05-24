/**
 * Symbol特性：
 *
 * 1、Symbol 值通过 Symbol 函数生成，使用 typeof，结果为 "symbol"
 * 2、Symbol 函数前不能使用 new 命令，否则会报错。这是因为生成的 Symbol 是一个原始类型的值，不是对象。
 * 3、instanceof 结果为 false
 * 4、Symbol 函数可以接受一个字符串作为参数，表示对 Symbol 实例的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。
 * 5、如果 Symbol 的参数是一个对象，就会调用该对象的 toString 方法，将其转为字符串，然后才生成一个 Symbol 值。
 * 6、Symbol 函数的参数只是表示对当前 Symbol 值的描述，相同参数的 Symbol 函数的返回值是不相等的。
 * 7、Symbol 值不能与其他类型的值进行运算，会报错。
 * 8、Symbol 值可以显式转为字符串。
 * 9、Symbol 值可以作为标识符，用于对象的属性名，可以保证不会出现同名的属性。
 * 10、Symbol 作为属性名，该属性不会出现在 for...in、for...of 循环中，也不会被 Object.keys()、Object.getOwnPropertyNames()、
 *     JSON.stringify() 返回。但是，它也不是私有属性，有一个 Object.getOwnPropertySymbols 方法，可以获取指定对象的所有 Symbol 属性名。
 * 11、如果我们希望使用同一个 Symbol 值，可以使用 Symbol.for。它接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值。
 *     如果有，就返回这个 Symbol 值，否则就新建并返回一个以该字符串为名称的 Symbol 值。
 * 12、Symbol.keyFor 方法返回一个已登记的 Symbol 类型值的 key。
 *
 *
 * 规范中调用 Symbol 时做了以下工作：
 *
 * 1、如果使用 new ，就报错
 * 2、如果 description 是 undefined，让 descString 为 undefined
 * 3、否则 让 descString 为 ToString(description)
 * 4、如果报错，就返回
 * 5、返回一个新的唯一的 Symbol 值，它的内部属性 [[Description]] 值为 descString
 */

// 第一版
(function () {
    var root = this;

    var symbolPolyfill = function Symbol(description) {

        // 实现特性2：不能使用new
        if (this instanceof symbolPolyfill) {
            throw new TypeError('Symbol is not a constructor');
        }

        // 实现特性5：如果symbol参数是对象，则调用对象的toString方法，如果不传description或者传undefined，则为undefined
        var descString = description === undefined ? undefined : String(description);

        var symbol = Object.create(null);

        Object.defineProperties(symbol, {
            '__Description': {
                value: descString,
                writable: false,
                enumerable: false,
                configurable: false
            }
        });

        // 实现特性6：因为description相同的symbol互不相同，所以这里返回新对象，只要引用不同，也能实现不同
        return symbol;
    };

    root.symbolPolyfill = symbolPolyfill;
})();


// 第二版
(function () {
    var root = this;

    var generateName = (function () {
        var postfix = 0;
        return function (descString) {
            postfix++;
            return '@@' + descString + '_' + postfix;
        }
    })();

    var symbolPolyfill = function Symbol(description) {

        if (this instanceof symbolPolyfill) {
            throw new TypeError('Symbol is not a constructor');
        }

        var descString = description === undefined ? undefined : String(description);

        var symbol = Object.create({
            // 显示转换字符串，作为对象属性值时是一个唯一值
            toString: function () {
                return this.__Name__;
            },
            // 考虑到有可能显式调用valueOf方法，与特性7冲突，所以此处选择返回自身
            valueOf: function () {
                return this;
            }
        });

        Object.defineProperties(symbol, {
            '__Description__': {
                value: descString,
                writable: false,
                enumerable: false,
                configurable: false
            },
            '__Name__': {
                value: generateName(descString),
                writable: false,
                enumerable: false,
                configurable: false
            }
        });

        return symbol;
    };

    root.symbolPolyfill = symbolPolyfill;
})();

// 最终版
(function () {
    var root = this;

    var generateName = (function () {
        var postfix = 0;
        return function (descString) {
            postfix++;
            return '@@' + descString + '_' + postfix;
        }
    })();

    var symbolPolyfill = function Symbol(description) {

        if (this instanceof symbolPolyfill) {
            throw new TypeError('Symbol is not a constructor');
        }

        var descString = description === undefined ? undefined : String(description);

        var symbol = Object.create({
            toString: function () {
                return this.__Name__;
            },
            valueOf: function () {
                return this;
            }
        });

        Object.defineProperties(symbol, {
            '__Description__': {
                value: descString,
                writable: false,
                enumerable: false,
                configurable: false
            },
            '__Name__': {
                value: generateName(descString),
                writable: false,
                enumerable: false,
                configurable: false
            }
        });

        return symbol;
    };

    var forMap = {};

    Object.defineProperties(symbolPolyfill, {
        'for': {
            value: function (description) {
                var descString = description === undefined ? undefined : String(description);
                return forMap[descString] ? forMap[descString] : forMap[descString] = symbolPolyfill(descString);
            },
            writable: true,
            enumerable: false,
            configurable: true
        },
        'keyFor': {
            value: function (symbol) {
                for (var key in forMap) {
                    if (forMap[key] === symbol) return key;
                }
            },
            writable: true,
            enumerable: false,
            configurable: true
        }
    });

    root.symbolPolyfill = symbolPolyfill;
})();

// 无法实现的特性有：1、4、7、8、10




















