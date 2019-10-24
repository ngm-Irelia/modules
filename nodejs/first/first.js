let a = "aaa";
console.log(a);

//console.log(global)

// __filename 当前文件的绝对路径
console.log(__filename)
// __filename 当前文件的路径
console.log(__dirname)

/**
 * ---------  模块加载 ---------
 * 模块加载机制： 相对路径 / 绝对路径
 * 
 * 模块对象：module
 * require 和 export 两个变量
 * 
 */
/* let module2 = require('./2.js');

console.log(module2);
console.log(module2.page) */

/**
 * --------- process 对象 ------------
 * 是一个全局对象
 * 
 * 输入输出流
 * 默认情况下，输入流是关闭的，要想监听接收输入流数据，首先要开启输入流
 * 
 */

/*  console.log(process);

 let process = {
    argv:"第一个参数是node, 第二个参数是当前文件的路径, 接下来的元素是命令行 依次传入的参数",
    env:{},//系统相关的环境变量
    pid:"当前进程的进程号",
    title:'进程名，默认值为"node"，可以自定义该值',
    arch: "当前 CPU 的架构：'arm'、'ia32' 或者 'x64'",
    platform:"运行程序所在的平台系统'darwin','freebsd','linux','sunos' 或 'win32'"
  } */

process.stdin.setEncoding('utf-8');

process.stdout.write("请输入第一个值：");

process.stdin.on('readable',()=>{
  let chunk;
  //使用循环，确保我们读取所有可用的数据
  while((chunk = process.stdin.read()) !== null ){
    process.stdout.write(`数据：${chunk}`);
  }
});

process.stdin.on("end", ()=>{
  process.stdout.write("结束");
})


