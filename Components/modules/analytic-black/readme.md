## 关系图组件  v1.0

#使用方式 ：  查看 demo ~~~ 
# 1. 引入 analytic.js 和 analytic.css ; d3.min.js 是前提，必须先引入；    存图： 引入 saveSvgAsPng.js

# 2. 调用 window.component.analytic.run(id, value);
@param id 放关系图的盒子的id 例如 "topo_network_base"
@param value 参数 (1)可以传数据的数组 -- 简单模式，没有交互操作 （2）"analytic" -- 分析模式，拥有所有的交互操作 (3) 空或其他 -- 展示模式 数据是通过js中的PageData方法获取，需要按照需求修改url即可。

# 3. 想只显示和某个节点相关的数据， 开放接口 component.analytic.showItem(data);  // @param data 需要的数据  { id : "aaaa"} ;  暂时只需要一个节点的id 

# countPosNodes.js  是webworker文件，在 analytic.js 中自动import