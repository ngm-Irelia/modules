var i=0; 

 function timedCount(){ 
     for(var j=0,sum=0;j<100;j++){ 
         for(var i=0;i<10000;i++){ 
             sum+=i; 
         } 
     } 
     // 调用 postMessage 向主线程发送消息
     postMessage(sum); 
 } 
//console.log(window); console.log(document);   注意： 这个文件里面没有 window document 对象
 postMessage("Before computing,"+new Date()); 
 timedCount(); 
 postMessage("After computing,"+new Date());