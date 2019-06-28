importScripts("d3.min.js");

var force = d3.layout.force()
    .nodes([])
    .links([])
    .linkStrength(10)
    .alpha(0);
var nodes = force.nodes();
var links = force.links();
function reset(width, height) {
  const nodeNums = nodes.length;//数据点的数量
  const mxaNums = Math.max(30, nodeNums);//设置一个数据阀值
  const wh = width * height;
  const m = mxaNums / 10;
  const n = mxaNums * 7.5;
  const z = wh * m;
  const h = n / z;
  const k = Math.sqrt(h);
  const linkDistance = mxaNums / (16 * k);
  const charge = -15 / k;
  force.size([width, height])
    .linkDistance(linkDistance)//决定线的长度
    .charge(charge);//决定点之间的距离
  force.start();
  for (let i = 1; i < 95; ++i) {
    postMessage({
      type: "tick",
      progress: i / 95
    });
    force.tick();
  }
  force.stop();
}
//整合关系里面的时间数据，得到一个包含关系名字，关系时间的数组对象
// const getTimesFromLinks = (data) => {
//   let timedatas = data;
//   let objtiems = [];
//   for (let index = 0; index < timedatas.length; index++) {
//     const element = timedatas[index];
//     let objtimeschild = {};
//     if (element.time) {
//         objtimeschild.relationName = element.relationTypeName;
//         objtimeschild.time = element.time.slice(0, 10);//.replace(/,/g, "-");
//         objtimeschild.y = 1;
//         objtiems.push(objtimeschild);
//     }
//   }
//   objtiems.sort(compare("time"));
//   for (let index = 1; index < objtiems.length; index++) {
//       const element1 = objtiems[index];
//       const element2 = objtiems[index - 1];
//       //对时间和关系名字一样的数据进行合并
//       if (element1.time === element2.time && element1.relationName === element2.relationName) {
//           element2.y = element1.y + element2.y;
//           objtiems.splice(index, 1);
//           index--;
//       }
//   }
//   return objtiems;
// }
//数组对象由大到小排序
function compare(prop) {
  return function (a, b) {
      let values1 = a[prop];
      let values2 = b[prop];
      return values1 > values2 ? 1 : -1;
  }
}

self.onmessage = function (event) {
  let {svgWidth, svgHeight, allNodes, allLinks, nodesLength, isLayout, isHistory, layoutIndex} = event.data;
  
  let n = nodes.length;
  let l = links.length;
  let setNodes = allNodes.slice(nodesLength);
  nodes.splice(0, n);
  links.splice(0, l);
  nodes.push(...allNodes);
  links.push(...allLinks);

  if (links.length) {//如果只是单纯的从搜索页面进来，没有关系数据，不需要继续判断了
    // 从数据集里面拉出来的点 重新建立children与nodes的对应关系
    for (let j = 0; j < nodes.length; j++) {
      if (nodes[j].children) {
        for (let i = 0; i < nodes[j].children.length; i++) {
          for (let l = 0; l < nodes.length; l++) {
            if (nodes[j].children[i].nodeId === nodes[l].nodeId) {
              nodes[j].children[i] = nodes[l];
            }
          }
        }
      }
    }
    for (let i = 0; i < links.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].nodeId === links[i].target.nodeId) {
          links[i].target = nodes[j];
        }
        if (nodes[j].nodeId === links[i].source.nodeId) {
          links[i].source = nodes[j];
        }
      }
    }
  }

  reset(svgWidth-200, svgHeight);
  rePosition(layoutIndex, setNodes);
 
  // let timeresultdata = getTimesFromLinks(links);

  postMessage({
      type: "end",
      nodes: nodes,
      links: links
      //timedatas: timeresultdata
  });
};

var LayoutUtil = {
  theMostCoordinate: function (xAxises, yAxises) {
    return {
      xMax: Math.max.apply(Math, xAxises),
      xMin: Math.min.apply(Math, xAxises),
      yMax: Math.max.apply(Math, yAxises),
      yMin: Math.min.apply(Math, yAxises)
    };
  }
};

function rePosition(layoutIndex, nodes) {
  // 选中节点初始化信息处理
  let xAxis = [],
    yAxis = []; // 被选中节点的所有x轴、y轴坐标
  nodes.forEach(function (item) {
    xAxis.push(item.x);
    yAxis.push(item.y);
  });
  const coords = LayoutUtil.theMostCoordinate(xAxis, yAxis);

  switch (layoutIndex) {
    case 0:  //环形布局
      let circle = {a: 0, b: 0, r: 180}, // 圆心坐标及半径
        n = nodes.length; // 被选节点的个数
      circle.a = (coords.xMax + coords.xMin) / 2;
      circle.b = (coords.yMax + coords.yMin) / 2;
      const preRadius = Math.ceil(18 * n / Math.PI);
      circle.r = preRadius > 180 ? preRadius : 180;  // 根据节点数量计算半径：2 * π * r =节点数量 * 节点直径

      // 修改被选节点的坐标
      nodes.forEach(function (item, i) {
        item.fixed = true;
        item.px = circle.a + circle.r * Math.cos(i * 2 * Math.PI / n);
        item.x = item.px;
        item.py = circle.b + circle.r * Math.sin(i * 2 * Math.PI / n);
        item.y = item.py;
      });
      break;

    case 2:  //默认布局
    default:
  }
}
