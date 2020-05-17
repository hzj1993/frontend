// 第一版
function new1() {
    var obj = {},
        Constructor = [].shift.apply(arguments);

    obj.__proto__ = Constructor.prototype;

    Constructor.apply(obj, arguments);

    return obj;
}
// 第一版改进版
function new2() {
    var obj = {},
        Constructor = [].shift.apply(arguments);

    Object.setPrototypeOf(obj, Constructor.prototype);

    Constructor.apply(obj, arguments);

    return obj;
}

// 第二版
function new3() {
    var obj = {},
        Constructor = [].shift.apply(arguments);

    // obj.__proto__ = Constructor.prototype;
    Object.setPrototypeOf(obj, Constructor.prototype);

    var ret = Constructor.apply(obj, arguments);

    return typeof ret === 'object' ? ret : obj;
}
// 使用范例：
// function Parent(name) {
//     this.name = name;
// }
// var child = new3(Parent, 'Jack');
// console.log(child.name); // Jack