#图片虚化组件 v1.0

#author ngm

#使用原生js实现。

# 使用方式 引入picture-virtual.js

var pv  = new Component.PictureVirtual();
pv.run("showarea", "p1.png");

#demo 中有具体例子


# 可以在first.html中随意变化box的宽高； 调用run() 测试传入不同的图片

# !!! 注意，现在要求 父盒子必须要有宽高~，后续有时间，在代码中优化下组件