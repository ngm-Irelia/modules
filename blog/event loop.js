首先，要知道javascript是 异步，单线程的。

那么既然是单线程的，怎么能够实现异步的呢？  主要原因是 浏览器是多线程的，js实现异步，也是依靠浏览器的帮助

js是单线程的原因： 因为js有操作DOM的能力，如果是多线程的，同一时间若有多个线程都操作了一个DOM， 那到底应该听谁的呢？ 这个处理就很复杂。所以，简单为主，js就是单线程的。

既然是单线程的，那所有的任务，肯定是按照某个顺序，按序执行的。

这就用到了 js中的 任务队列 

js将任务 分为了 同步任务 和 异步任务。

主线程从 任务队列 中读取事件,这个过程是循环不断的,所以这个运行机制称为: 事件循环 Event Loop

事件循环 Event Loop

*事件循环可能有几种任务任务队列。唯一的两个限制是同一个任务源中的事件必须属于同一个队列

Image

如图,主线程运行时候,产生 堆(heap)栈(stack)

分为 执行栈  和 任务队列  两部分
只有当执行栈运行完成后,才会去读取任务队列中的内容 .

微任务 和 宏任务
microtask和task事件的方法
microtasks:
	process.nextTick
	promise
	Object.observe
	MutationObserver
tasks:
	setTimeout
	setInterval
	setImmediate
	I/O
	UI渲染


大体介绍:  js运行机制. 代码分为了执行栈 和 任务队列. 代码运行的时候,放入到执行栈中, 
遇到异步操作,会放到任务队列中,等所有的执行栈中操作,完成后. 通过event loop 去读取任务队列中的任务执行.
同时 会监控 执行栈中,当然任务队列的任务完成后,,如果执行栈中加入新的操作. 会首先运行 执行栈中的功能