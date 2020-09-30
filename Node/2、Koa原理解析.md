# Koa原理解析

## 简介

Koa.js是一个极其轻量的Node.js服务端框架，可以快速搭建服务，提供了中间件的功能，相比Express，少了路由功能

## 洋葱模型

要理解Koa实现原理，不得不讲到洋葱原理，但我觉得直接上代码更为直接。app.use的作用为注册一个中间件。

```js
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
  console.log('1')
  await next()
  console.log('2')
})

app.use(async (ctx, next) => {
  console.log('3')
  await next()
  console.log('4')
})

app.use(async (ctx, next) => {
  console.log('5')
  await next()
  console.log('6')
})

// 打印结果：
// 1
// 3
// 5
// 6
// 4
// 2
```

通过以上代码可以很清楚的看出，中间件的执行顺序呈洋葱型，或者说是像栈的结构。await next() 前的逻辑与我们一般的理解并无不同，关键在于最后一个中间件，最后一个中间件的next为空，因为后面没有中间件了，所以在Koa源码内会进行判断，如果是最后一个直接就执行Promise.resolve()，然后await得到结果后，开始走await后面的逻辑，对应上面的例子就是开始执行 console.log('6')，然后一步步的返回给上一个中间件结果。

下面是Koa-compose的源码，也就是中间件实现的代码：

```js
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  middleware = flatten(middleware) // 将中间件数组转化为一维数组
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }


  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve() // 最后一个中间件的next为空，直接返回
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```