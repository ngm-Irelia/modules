components 

# 我们能做什么？

# 1.把它做成我们自己的ui框架。开发样式统一~

# 2.组件化开发，开发效率提高~

# 3.推荐用原生js，es6，es7+ 去实现~ 无法实现再用jquery


# 使用方式 ， 引入 Components.js 和 Components.css 即可



# 使用人员 说明
引入 Components.js 和 Components.css 即可
提供的方法有：

浏览器打开 demo/first.html 



因人员不足，说明文档并不详细；




#开发人员 说明

阅读 Components.js 吧 ~

扩展新功能de方法 :

Components.extend({});     //在这独立扩展工具方法
Components.ct.extend({});  //在这独立扩展实例方法

#  todo~~  Components.css  中存放通用的样式， 暂定 必须以 casia-* 格式定义名称

写的代码尽量能够通用成方法，放到Components.js中，
即使 在项目的js文件中写通用的方法，也最好是挂在 window.Components命名空间下， 
而不是window新增一个属性