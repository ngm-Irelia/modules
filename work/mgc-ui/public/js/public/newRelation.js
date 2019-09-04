$(function(){
  window.startFunction = function(thisNode,domName,hideMenu){
    //console.log(hisNode,domName,hideMenu);
      const width = $(domName).width();
      const height = $(domName).height();
      let linksColor = ["#f99070", "#ce1e1e", "#a1f480", "#70f9ee", "#ff780c", "#3dbcc2",'#A5ABB6','#fff'];
      let linkName = [];
      var svg = d3.select(domName)
          .append("svg")
          .attr("class","ctrl")
          .attr("width",width)
          .attr("height",height)
          .attr("transform","translate(0,0)")
          .append("g")
          .attr("class","relationSvg");
      //从右边列表添加新的节点数组
      let pathUpdate = svg.append("svg:g").selectAll(".outlink");
      let enterNodes = svg.append("svg:g").selectAll("g");
      let reqLeavesApi = new ReqLeavesApi();
      var force = d3.layout.force()
          .nodes([])
          .links([])
          .linkStrength(10)
          .alpha(0);
      var nodes = force.nodes();
      var links = force.links();
      let myNodes = [thisNode];
      let myLinks = [];
      var menusg = svg.append('g');
      var zoomListener = d3.behavior.zoom()
          .scaleExtent([0.05, 3]) //缩放的倍数区间
          .on("zoom", zoom);
      //缩放函数
      function zoom(){
        d3.select("g.relationSvg")
          .attr("transform", "translate(" + d3.event.translate +")scale(" + d3.event.scale + ")");
      }
      //节点操作事件集合
    //   var magicTopoEvents = {
        //功能：双击节点的事件
        // nodeDblclick: function() {
        //   return function(d, i) {
        //     if (d.nodeType === 0){
        //         let china = d.grouped ? "拆分" : "组合";
        //         let english = d.grouped ? "disperse" : "group";
        //         let texts = [ "跳转","查看", "取消"];
        //         let imageType = [["none","jump"],["none","checkout"], ["none","cancele"]];
        //         let nodeArray = [d.id, d.nodeId, d.type, d.objectType,d.page_type];
        //         const itemNumber = [1,2,3];
        //         let config = {
        //           arc: [45, 105, 105, 115],
        //           angle:2,
        //           text: texts,
        //           imageName: imageType,
        //           itemNumber:itemNumber,
        //           className: 'ol_menu',
        //           position: [d.x, d.y],
        //           nodeArray: nodeArray,
        //           groupNodes: d.grouped ? d.grouped : null
        //         };
        //         resetMenu.oneTopoMenus(config);
        //     } 
        //   }
        // }
    //   };
      //这是对扩展请求的数据进行处理的函数
      function ReqLeavesApi(){
        //扩展的时候，对数据进行初步的处理
        this.mergeLinksNodes = function(extendData) {
          this.creatLinks(extendData);
        },
        //把请求的源数据进行处理，得到source和target数据
        this.creatLinks = function(data) {
          let reqDatas = data;
          let noRepeatNodes = [];
          let parseNodes = [];
          //给请求来的数据去重，如果按照多个点扩展，会有相同的关系
          let myNoRepeatRelationIdArray = removeRepeatArray(reqDatas, "relationId");
          this.typeLinks(myNoRepeatRelationIdArray);//对数据进行标记
          let myNoRepeatArray = removeRepeatArray(myNoRepeatRelationIdArray, "id");
          //拆分数据为节点
          myNoRepeatArray.forEach(function(link) {
            link.nodeWeight = link.nodeWeight ? parseInt(link.nodeWeight) : 0,
            link.type = link.type ? link.type : 'virtual',
            link.relationWeight = link.relationWeight ? parseInt(link.relationWeight) : 0,
            link.target = {
                name: link.target,
                type: link.type,
                id: link.id,
                page_type: link.page_type,
                nodeWeight: link.nodeWeight,
                quantity:link.quantity,//(虚拟点的数量)
                nodeType: link.nodeType,
                objectType: link.objectType,
                relationParentType: link.relationParentType, //关系的父类
                relationTypeName: link.relationTypeName,
                nodeId: link.nodeId,
                markIcons: link.markIcons, //是否标记了节点
                fill: link.mark ? "#fc311a" : "#0088b1", //是否标记了节点
                stroke: link.mark ? "#ffbcaf" : "#33d0ff", //是否标记了节点
                display: "block"
            };
            delete link.objectType;
            delete link.nodeId;
            delete link.markIcons;
            delete link.mark;
            delete link.type;
            delete link.nodeType;
            delete link.page_type;
            delete link.quantity;
            parseNodes.push(link.target);
          })
          noRepeatNodes = removeRepeatArray(parseNodes, "nodeId");
          this.mergeDatas(noRepeatNodes, myNoRepeatArray);
        },
        //对nodes和links进行交集
        this.mergeDatas = function(reqNodes, reqLinks) {
          let lastNodes = new Set(); //集合
          let lastLinks = new Set();
          let length = nodes.length;
          myNodes.map(node => lastNodes.add(node.nodeId));
          let newLinks = [],
              newHouses = []; // 去重后，需要新添加的节点
          reqNodes.map(node => lastNodes.has(node.nodeId) ? null : newHouses.push(node));
          newHouses.map(node => (lastNodes.add(node.nodeId), myNodes.push(node)));
          myLinks.push(...reqLinks);
          forceStart(myNodes, myLinks);
        },
        //关系分组
        this.typeLinks = function (links) {
          var linkGroup = {};
          //对连接线进行统计和分组，不区分连接线的方向，只要属于同两个实体，即认为是同一组
          var linkmap = {}
          for (let i = 0; i < links.length; i++) {
            let key = links[i].source < links[i].id ? links[i].source + ':' + links[i].id : links[i].id + ':' + links[i].source;
            if (!linkmap.hasOwnProperty(key)) {
              linkmap[key] = 0;
            }
            linkmap[key] += 1;
            if (!linkGroup.hasOwnProperty(key)) {
              linkGroup[key] = [];
            }
            linkGroup[key].push(links[i]);
          }
          //为每一条连接线分配size属性，同时对每一组连接线进行编号
          for (let i = 0; i < links.length; i++) {
            let key = links[i].source < links[i].id ? links[i].source + ':' + links[i].id : links[i].id + ':' + links[i].source;
            //links[i].size = linkmap[key];
            links[i].size = 1;
            links[i].repeat = linkmap[key];
            //同一组的关系进行编号
            let group = linkGroup[key];
            let keyPair = key.split(':');
            let type = 'noself'; //标示该组关系是指向两个不同实体还是同一个实体
            if (keyPair[0] == keyPair[1]) {
              type = 'self';
            }
            //给节点分配编号
            this.setLinkNumber(group, type);
          }
        },
        //给typeLinks分组的结果进行标记，打上linknum属性
        this.setLinkNumber = function(group, type) {
          if (group.length == 0) return;
          //对该分组内的关系按照方向进行分类，此处根据连接的实体ASCII值大小分成两部分
          let linksA = [],
              linksB = [];
          for (let i = 0; i < group.length; i++) {
            let link = group[i];
            if (link.source < link.id) {
              linksA.push(link);
            } else {
              linksB.push(link);
            }
          }
          //确定关系最大编号。为了使得连接两个实体的关系曲线呈现对称，根据关系数量奇偶性进行平分。
          //特殊情况：当关系都是连接到同一个实体时，不平分
          let maxLinkNumber = 0;
          let mylinknum = 1;
          if (type == 'self') {
            maxLinkNumber = group.length;
          } else {
            maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length + 1) / 2;
          }
          //如果两个方向的关系数量一样多，直接分别设置编号即可
          if (linksA.length == linksB.length) {
            let startLinkNumber = 1;
            for (let i = 0; i < linksA.length; i++) {
              //linksA[i].linknum = startLinkNumber++;
              linksA[i].linknum = mylinknum;
            }
            startLinkNumber = 1;
            for (let i = 0; i < linksB.length; i++) {
              linksB[i].linknum = startLinkNumber++;
            }
          } else { //当两个方向的关系数量不对等时，先对数量少的那组关系从最大编号值进行逆序编号，然后在对另一组数量多的关系从编号1一直编号到最大编号，再对剩余关系进行负编号
            //如果抛开负号，可以发现，最终所有关系的编号序列一定是对称的（对称是为了保证后续绘图时曲线的弯曲程度也是对称的）
            let biggerLinks, smallerLinks;
            if (linksA.length > linksB.length) {
              biggerLinks = linksA;
              smallerLinks = linksB;
            } else {
              biggerLinks = linksB;
              smallerLinks = linksA;
            }

            let startLinkNumber = maxLinkNumber;
            for (let i = 0; i < smallerLinks.length; i++) {
              //smallerLinks[i].linknum = startLinkNumber--;
              smallerLinks[i].linknum = mylinknum;
            }
            let tmpNumber = startLinkNumber;

            startLinkNumber = 1;
            let p = 0;
            // while (startLinkNumber <= maxLinkNumber) {
            //   biggerLinks[p++].linknum = startLinkNumber++;
            // }
            //开始负编号
            startLinkNumber = 0 - tmpNumber;
            for (let i = p; i < biggerLinks.length; i++) {
              biggerLinks[i].linknum = mylinknum;
            }
          }
        }
      }
      //功能：扩展的时候，调用此函数进行数据请求
      function getDatatoDraw(thisNode) {
          //单个节点的扩展请求
          let url = EPMUI.context.url + "/leaves/" + thisNode.id + "/" + thisNode.type + "/" + thisNode.nodeId + "/" + "All";
          let completed = function(){
            d3.select(".topoMenu").selectAll(".topoMenu_path").remove();
          };
          let succeed = function(data){
            // 授权验证
            if (data.code === 200) {
              var parseDatas = JSON.parse(JSON.stringify(data.magicube_interface_data));
              for (var i = 0; i < parseDatas.length; i++) {
                if (!parseDatas[i]) {
                  parseDatas.splice(i,1);
                  i--;
                }
              }
              reqLeavesApi.mergeLinksNodes(parseDatas);
            } else {
              return;
            }
          };
          let data = {};
          ajaxApp(url,'GET',data,completed,succeed);
      }
      getDatatoDraw(thisNode);
      //处理topo图
      function reset(width, height) {
          const nodeNums = nodes.length;//数据点的数量
          const mxaNums = Math.max(30, nodeNums);//设置一个数据阀值
          const wh = width * height;
          const m = mxaNums / 10;
          const n = mxaNums * 7.5;
          const z = wh * m;
          const h = n / z;
          const k = Math.sqrt(h);
          const linkDistance = mxaNums / (12 * k);
          const charge = -15 / k;
          force.size([width, height])
              .linkDistance(linkDistance)//决定线的长度
              .charge(charge);//决定点之间的距离
          force.start();
          for (let i = 1; i < 99; ++i) {
            force.tick();
          }
          force.stop();
      }
      //生成topo图
      function forceStart(myNodes,myLinks){
          let nl = nodes.length;
          let ll = links.length;
          let linksTypeName = ['筛选：','所有关系'];
          nodes.splice(0, nl);
          links.splice(0, ll);  
          nodes.push(...myNodes);
          links.push(...myLinks);
          for (let i = 0; i < links.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
              if (nodes[j].nodeId === links[i].target.nodeId) {
                links[i].target = nodes[j];
              }
              if (nodes[j].id === links[i].source) {
                links[i].source = nodes[j];
              }
            }
          }
          for (let i = 0; i < links.length; i++) {
            if (links[i].tag == '-20') {
              let temp = links[i].target;
              links[i].target = links[i].source;
              links[i].source = temp;
              links[i].tag = '20';
            }
          }
          links.forEach(link => linksTypeName.push(link.relationTypeName));
          links.forEach(link => linkName.push(link.relationParentType));
          linkName = [...new Set(linkName)];
          linksTypeName = [...new Set(linksTypeName)];
          let creatFilterList = function(){
            $(".topo-filter-ul").empty();
            for(let i = 0, p;i < linksTypeName.length;i++){
              if(i === 1){
                p = "<li class='linksTypeName liborder'>"+ linksTypeName[i] +"</li>";
                
              }else{
                p = "<li class='linksTypeName'>"+ linksTypeName[i] +"</li>";
              }
              $(".topo-filter-ul").append(p);
            }
            d3.selectAll(".linksTypeName").on("click",function(d,i){
              if(i === 1) {
                $(this).addClass('liborder').siblings().removeClass('liborder');
                d3.selectAll(".outlink,g.node").style("display", 'block');
              }
              if(i > 1) {
                $(this).addClass('liborder').siblings().removeClass('liborder');
                let linksTypeName = $(this).html();
                let includesNodes = [];
			          let sourceNode = [];
                links.forEach(function(d){
                  linksTypeName.includes(d.relationTypeName) ? (d.nodeId !== d.target.nodeId) ? (includesNodes.push(d.source.nodeId),sourceNode.push(d.target.nodeId)) : (includesNodes.push(d.target.nodeId),sourceNode.push(d.source.nodeId)) : null;
                });
                var condition = includesNodes;
                condition = [...new Set(condition)];
                d3.selectAll(".outlink,g.node").style("display", 'none');
                pathUpdate.filter(function(d, i) {
                  return linksTypeName.includes(d.relationTypeName);
                }).style("display",function(d){
                  d.display = 'block';
                  return 'block';
                });
                enterNodes.filter(function(d, i) {
                  return condition.includes(d.nodeId);
                }).style("display",function(d){
                  d.display = 'block';
                  return 'block';
                });
                enterNodes.filter(function(d, i) {
                  return sourceNode.includes(d.nodeId);
                }).style("display",function(d){
                  d.display = 'block';
                  return 'block';
                });
              }
            })
          }
          creatFilterList();
          reset(width,height);
          drawTopoMap();
      }
      forceStart(myNodes,myLinks);
      //功能：绘制图形函数
      function drawTopoMap(duration = 0) {
        pathUpdate = pathUpdate.data(links, function(d) {
          return d.relationId
        });
        pathUpdate.enter().append("g")
          .attr("class", "outlink")
          .style("display",function(d){
            return d.source.display === 'none' || d.target.display === 'none' ? 'none' : 'block';
          })
          .each(function(d) {
            let fillcolor = linkName.length > 1 ? linksColor[linkName.indexOf(d.relationParentType)]:'#A5ABB6';
            d3.select(this).append("path")
              .attr("class", "link")
              .style("fill", fillcolor)
              .style("stroke", "none")
              .attr('id', function(d) {
                return d.id;
              });
            d3.select(this).append("text")
              .attr("text-anchor", "middle")
              .attr("class", "outword")
              .style("font", "10px 微软雅黑")
              .style("fill", fillcolor)
              .text(function(d) {
                  if (d.number && d.repeat > 1) {
                    return d.relationTypeName + d.number + "次" + "x" + d.repeat;
                  } else if (d.repeat > 1) {
                    return d.relationTypeName + "x" + d.repeat;
                  } else {
                    return d.relationTypeName;
                  }
              });
            if (d.relationWeight) {
              d3.select(this).append("text")
                .attr("class", "outwieght")
                .style("font", "10px 微软雅黑")
                .style("fill", "#ce1e1e")
                .text(function(d) {
                    return':' + d.relationWeight;
                });
            }
            d3.select(this).append("path")
              .attr("class", "overlay")
              .style("fill", "#A5ABB6")
              .style("stroke", "none")
              .style("opacity", 0)
              .attr("id", function(d) {
                return d.relationId;
              });
          });
        drawLinks(pathUpdate, duration, 1);
        pathUpdate.exit().remove();
        //计算节点数据
        enterNodes = enterNodes.data(nodes, function(d) {
          return d.nodeId;
        });
        enterNodes.enter().append("g")
          .attr("class", "node")
          .attr("id", function(d) {
            return d.id;
          })
          .attr("data-id", function(d) {
            return d.nodeId;
          })
          .attr("data-type", function(d) {
            return d.type;
          })
          .style("display", function(d, i) {
            return d.display;
          })
        //   .on("dblclick", hideMenu ? null : magicTopoEvents.nodeDblclick())
          .each(function(d) {
            d3.select(this).append("circle")
              .attr("r", 20 + d.nodeWeight)
              .attr("class", "outring")
              .attr("cx", 0)
              .attr("cy", 0)
              .style("fill", function(d) {
                return d.fill;
              })
              .style("stroke", function(d) {
                return d.stroke;
              })
              .style("stroke-width", "2px")
            // if (d.markIcons && d.markIcons.length) {
            //   const self = this;
            //   d.markIcons.forEach(function(mark,i){
            //     let x = -7 + (16 + d.nodeWeight) * Math.cos(i * 2 * Math.PI / 4);
            //     let y = -4 + (16 + d.nodeWeight) * Math.sin(i * 2 * Math.PI / 4);
            //     d3.select(self).append("image")
            //       .attr("width", 15)
            //       .attr("height", 15)
            //       .attr("x", x)
            //       .attr("y", y)
            //       .attr("xlink:href", function(d, i) {
            //         return "../../image/mark/" + mark + ".svg";
            //       });
            //   })
            // }
            d3.select(this).append("image")
              .attr("class", "nodeimg")
              .attr("width", 24 + d.nodeWeight)
              .attr("height", 24 + d.nodeWeight)
              .attr("xlink:href", function(d, i) {
                return "../../image/typeicon/" + d.type.toLowerCase() + ".svg";
              })
              .attr("x", (-24 - d.nodeWeight) / 2)
              .attr("y", (-24 - d.nodeWeight) / 2);
            d3.select(this).append("text")
              .attr("class", "nodetext")
              .attr("dy", 3.5 + d.nodeWeight / 5.5 + 'em')
              .attr("text-anchor", "middle")
              .style("font", "10px 微软雅黑")
              //.style("fill", "#fff")
              .text(function(d) {
                return d.name;
              });
          });
        drawNodes(enterNodes, duration);
        enterNodes.exit().remove();
      }
      //返回曲线
      function arcArrow(startRadius, endRadius, endCentre, deflection, arrowWidth, headWidth, headLength) {
        var angleTangent,
        arcRadius,
        c1,
        c2,
        coord,
        cx,
        cy,
        deflectionRadians,
        endAngle,
        endAttach,
        endNormal,
        endOverlayCorner,
        endTangent,
        g1,
        g2,
        headRadius,
        homotheticCenter,
        intersectWithOtherCircle,
        midShaftAngle,
        negativeSweep,
        positiveSweep,
        radiusRatio,
        shaftRadius,
        square,
        startAngle,
        startAttach,
        startTangent,
        sweepAngle,
        coordy,
        œ = endCentre < 200 ? 200 : endCentre;
        this.deflection = deflection,
        square = function(l) {
          return l * l
        },
        deflectionRadians = this.deflection * Math.PI / œ,
        startAttach = {
          x: Math.cos(deflectionRadians) * startRadius,
          y: Math.sin(deflectionRadians) * startRadius
        },
        radiusRatio = startRadius / (endRadius + headLength), homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio),
        intersectWithOtherCircle = function(fixedPoint, radius, xCenter, polarity) {
          var A, B, C, gradient, hc, intersection;
          return gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter),
          hc = fixedPoint.y - gradient * fixedPoint.x, A = 1 + square(gradient),
          B = 2 * (gradient * hc - xCenter), C = square(hc) + square(xCenter) - square(radius),
          intersection = {
            x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
          }, intersection.y = (intersection.x - homotheticCenter) * gradient, intersection
        },
        endAttach = intersectWithOtherCircle(startAttach, endRadius + headLength, endCentre, -1),
        g1 = -startAttach.x / startAttach.y,
        c1 = startAttach.y + square(startAttach.x) / startAttach.y,
        g2 = -(endAttach.x - endCentre) / endAttach.y,
        c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y,
        cx = (c1 - c2) / (g2 - g1),
        cy = g1 * cx + c1,
        arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y)),
        startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y),
        endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y),
        sweepAngle = endAngle - startAngle, this.deflection > 0 && (sweepAngle = 2 * Math.PI - sweepAngle),
        this.shaftLength = sweepAngle * arcRadius, startAngle > endAngle && (this.shaftLength = 0),
        midShaftAngle = (startAngle + endAngle) / 2, this.deflection > 0 && (midShaftAngle += Math.PI),
        this.midShaftPoint = {
          x: cx + arcRadius * Math.sin(midShaftAngle),
          y: cy - arcRadius * Math.cos(midShaftAngle)
        },
        startTangent = function(dr) {
          var dx, dy;
          return dx = (0 > dr ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1))), dy = g1 * dx, {
            x: startAttach.x + dx,
            y: startAttach.y + dy
          }
        },
        endTangent = function(dr) {
          var dx, dy;
          return dx = (0 > dr ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2))), dy = g2 * dx, {
            x: endAttach.x + dx,
            y: endAttach.y + dy
          }
        },
        angleTangent = function(angle, dr) {
          return {
            x: cx + (arcRadius + dr) * Math.sin(angle),
            y: cy - (arcRadius + dr) * Math.cos(angle)
          }
        },
        endNormal = function(dc) {
          var dx, dy;
          return dx = (0 > dc ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2))), dy = dx / g2, {
            x: endAttach.x + dx,
            y: endAttach.y - dy
          }
        },
        endOverlayCorner = function(dr, dc) {
          var arrowTip, shoulder;
          return shoulder = endTangent(dr), arrowTip = endNormal(dc), {
            x: shoulder.x + arrowTip.x - endAttach.x,
            y: shoulder.y + arrowTip.y - endAttach.y
          }
        },
        coord = function(point) {
          return point.x + "," + point.y
        },
        coordy = function(point) {
          return point.y;
        },
        shaftRadius = arrowWidth / 2,
        headRadius = headWidth / 2,
        positiveSweep = startAttach.y > 0 ? 0 : 1,
        negativeSweep = startAttach.y < 0 ? 0 : 1,
        this.outext = function(shortCaptionLength) {
          var captionSweep, endBreak, startBreak, dy;
          captionSweep = shortCaptionLength / arcRadius;
          this.deflection > 0 && (captionSweep *= -1);
          startBreak = midShaftAngle - captionSweep / 2;
          endBreak = midShaftAngle + captionSweep / 2;
          return dy = coordy(angleTangent(startBreak, shaftRadius)) + 3;
        },
        this.outline = function(shortCaptionLength) {
          var captionSweep, endBreak, startBreak, dy;
          captionSweep = shortCaptionLength / arcRadius;
          this.deflection > 0 && (captionSweep *= -1);
          startBreak = midShaftAngle - captionSweep / 2;
          endBreak = midShaftAngle + captionSweep / 2;
          return ["M", coord(startTangent(shaftRadius)), "L", coord(startTangent(-shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(angleTangent(startBreak, -shaftRadius)), "L", coord(angleTangent(startBreak, shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius)), "Z", "M", coord(angleTangent(endBreak, shaftRadius)), "L", coord(angleTangent(endBreak, -shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), "L", coord(endTangent(-headRadius)), "L", coord(endNormal(headLength)), "L", coord(endTangent(headRadius)), "L", coord(endTangent(shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(angleTangent(endBreak, shaftRadius))].join(" ");
        },
        this.overlay = function(minWidth) {
          var radius;
          return radius = Math.max(minWidth / 2, shaftRadius), ["M", coord(startTangent(radius)), "L", coord(startTangent(-radius)), "A", arcRadius - radius, arcRadius - radius, 0, 0, positiveSweep, coord(endTangent(-radius)), "L", coord(endOverlayCorner(-radius, headLength)), "L", coord(endOverlayCorner(radius, headLength)), "L", coord(endTangent(radius)), "A", arcRadius + radius, arcRadius + radius, 0, 0, negativeSweep, coord(startTangent(radius))].join(" ")
        }
      }
      //返回直线
      function straightArrow(startRadius, endRadius, centreDistance, shaftWidth, headWidth, headHeight) {
        var endArrow, endShaft, headRadius, shaftRadius, startArrow;
        this.length = centreDistance - (startRadius + endRadius),
        this.shaftLength = this.length - headHeight,
        startArrow = startRadius,
        endShaft = startArrow + this.shaftLength,
        endArrow = startArrow + this.length,
        shaftRadius = shaftWidth / 2,
        headRadius = headWidth / 2,
        this.midShaftPoint = {
          x: startArrow + this.shaftLength / 2,
          y: 0
        }
        this.outline = function(shortCaptionLength) {
          var endBreak, startBreak;
          startBreak = startArrow + (this.shaftLength - shortCaptionLength) / 2;
          endBreak = endShaft - startBreak + startRadius + 8;
          return ["M", startRadius, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", startRadius, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", endShaft, shaftRadius, "L", endShaft, headRadius, "L", endArrow, 0, "L", endShaft, -headRadius, "L", endShaft, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" ");
        },
        this.overlay = function(minWidth) {
          var radius;
          return radius = Math.max(minWidth / 2, shaftRadius), ["M", startRadius, radius, "L", endArrow, radius, "L", endArrow, -radius, "L", startRadius, -radius, "Z"].join(" ")
        }
      }
      //实例化生成曲线和直线
      function arcPath(d, strokeWidth, weight,textlength) {
        let square = function(num) {
          return num * num;
        };
        let xDist = d.source.x - d.target.x;
        let yDist = d.source.y - d.target.y;
        let edgeHalfLength = Math.sqrt(square(xDist) + square(yDist)); //两点之间的距离
        let linshalfLength = textlength;
        let arcCaptionLenght = textlength + 10;
        let deflection = d.linknum > 0 ? (d.id !== d.target.id) ? (20 * -d.linknum) : (20 * d.linknum) : (d.id !== d.target.id) ? (20 * -d.linknum) : 20 * d.linknum;
        let arcArrowed = new arcArrow(weight, weight, edgeHalfLength, deflection, strokeWidth, weight / 2 , weight / 2);
        let straightArrowed = new straightArrow(weight, weight, edgeHalfLength, strokeWidth, weight / 2, weight / 2);
        let outline = d.linknum !== 1 ? arcArrowed.outline(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outline(arcCaptionLenght) : straightArrowed.outline(linshalfLength);
        let dy = d.linknum !== 1 ? arcArrowed.outext(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outext(arcCaptionLenght) : 3;
        let overline = d.linknum !== 1 ? arcArrowed.overlay(10) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.overlay(10) : straightArrowed.overlay(10);
        return [outline,dy,overline];
      }
      //更新links的位置
      function drawLinks(topoLinks, durations, strokeWidth) {
        topoLinks.attr("transform", function(d) {
          let xDist = d.target.x - d.source.x;
          let yDist = d.target.y - d.source.y;
          let naturalAngle = (Math.atan2(yDist, xDist) / Math.PI * 180 + 180) % 360;
          return "translate(" + d.source.x + "," + d.source.y + ")rotate(" + (naturalAngle + 180) + ")";
        }).each(function(d) {
          let xDist = d.source.x - d.target.x;
          let yDist = d.source.y - d.target.y;
          let yt = d.target.y - d.source.y;
          let xt = d.target.x - d.source.x;
          //两个点与x轴形成的夹角
          let naturalAngle = (180 + Math.atan2(yt, xt) / Math.PI * 180) % 360;
          //两点之间的距离
          let edgeLength = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
          let opacity = edgeLength < 50 ? 'none' : linkName.length > 1 ? linksColor[linkName.indexOf(d.relationParentType)]:'#A5ABB6';//距离太近拉近两个点的时候线会很难看
          let opacity2 = edgeLength < 50 ? 'none' : linkName.length > 1 ? linksColor[linkName.indexOf(d.relationParentType)]:'#A5ABB6';//距离太近拉近两个点的时候线会很难看
          let opacity3 = edgeLength < 50 ? 'none' : "#ce1e1e";
          let dx = d.linknum !== 1 ? edgeLength / 2 - 4 : d.size % 2 === 0 ? edgeLength / 2 - 4 : edgeLength / 2;
          const nodewight = (d.nodeWeight > 10) ? 10 : d.nodeWeight < 0 ? 0 : d.nodeWeight;
          const weight = 20 + parseInt(nodewight);
          const relationWeight = d.relationWeight > 5 ? 5 : d.relationWeight < 0 ? 1 : d.relationWeight;
          const strokeWidth = relationWeight + 1;
          const textlength = d3.select(this).selectAll('.outword').node().getBBox().width;
          let dy = arcPath(d,strokeWidth,weight,textlength)[1];
          let linkPath = arcPath(d,strokeWidth,weight,textlength)[0];
          let overline = arcPath(d,strokeWidth,weight,textlength)[2];
          d3.select(this).selectAll("path.link")
            .transition()
            .duration(durations)
            .attr("d",linkPath)
            .style("fill",opacity);
          d3.select(this).selectAll('text')
            .attr("transform", function(){
              return naturalAngle < 90 || naturalAngle > 270 ? "rotate(180 " + dx + " " + (dy - 3) + ")" : null;
            })
            .style("fill",opacity2);
          d3.select(this).selectAll('.outwieght')
            .attr('x', textlength)
            .style("fill", opacity3)
            .attr("y", dy);
          d3.select(this).selectAll('.outword')
            .attr('x', dx)
            .attr("y", dy);
          d3.select(this).selectAll("path.overlay")
            .attr("d", overline);
        });
      }
      //更新nodes的位置
      function drawNodes(topoNode, durations) {
        topoNode.transition().duration(durations).attr("transform", function(d, i) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }
      //请求接口函数
      function ajaxApp(urls, types, datas, completed, succeed, errored){
        let thisError = function() {
          // $("#page_alert").show();
          // $("#page_alert_content").html("没有数据");
          return false;
        };
        let defaultError = errored || thisError;
        $.ajax({
          url: urls,
          traditional: true, //自动解析数组
          type: types,
          data: datas,
          dataType: "json",
          complete: function() {
            completed();
          },
          success: function(data) {
            succeed(data);
          },
          error: function(error) {
            defaultError();
          }
        })
      }
      //数组对象去重
      function removeRepeatArray(parent, element) {
        let result = [];
        let temp = {};
        let child = null;
        let repeat = null;
        for (let i = 0; i < parent.length; i++) {
          child = parent[i];
          repeat = child[element];
          //如果temp里面存在了这个元素，判断条件为true，跳出此次循环
          if (temp[repeat]) {
            continue;
          }
          temp[repeat] = true;
          result.push(child);
        }
        return result;
      }
      //操作菜单
      class MagicTopoWorkMenus{
        constructor(){
          this.arc = function (innerRadius, outerRadius,items,itemNumber,angle) {
            itemNumber -= 1;
            let startAngle = angle * Math.PI / items * itemNumber,
              endAngle = startAngle + angle * Math.PI / items;
            const arc = d3.svg.arc()
              .innerRadius(innerRadius)
              .outerRadius(outerRadius)
              .startAngle(startAngle)
              .endAngle(endAngle)
              .padAngle(0);
            return arc;
          },
          //移除菜单
          this.remove = function () {
            d3.select(".topoMenu")
              .selectAll(".topoMenu_path")
              .transition()
              .duration(100)
              .attr("transform", "scale(0.6)")
              .remove();
          },
          //mouseover选中
          this.over = function (name) {
            d3.selectAll(".topoMenu_inring")
              .filter(function (d) {
                return d[1] === name;
              })
              .attr("class", "topoMenu_inring topoMenu_inring_enter");
          },
          //统一传参
          this.myConfig = function (angle,itemNumber, carc, ctext, cimageName, classNames, ctype = undefined, cdepth = undefined, cdirection = undefined, cpassShipLabel = undefined) {
            var config = {
              itemNumber:itemNumber,
              angle:angle,
              arc: carc,
              text: ctext,
              imageName: cimageName,
              className: classNames,
              type: ctype,
              depth: cdepth,
              direction: cdirection,
              passShipLabel: cpassShipLabel
            };
            return config;
          }
        }
        //功能：菜单一级生成函数，生成对应的二级菜单
        oneTopoMenus (config) {
          const selt = this;
          if (config.position) {
            menusg.attr("class", "topoMenu")
                .attr("transform", function(){
                return "translate(" + config.position[0] + "," + config.position[1] + ")";
                });
          }
          const selectedPath = menusg.selectAll("topoMenu_path").data(config.imageName);
          selectedPath.enter()
            .append("g")
            .attr("class", "topoMenu_path " + config.className)
            .attr("data-type", function (d, i) {
              return config.type ? config.type[i] : 'default'
            })
            .on("mouseenter", function (d, i) {
              d3.select(this)
                .selectAll(".topoMenu_inring")
                .attr("class", "topoMenu_inring topoMenu_inring_enter");
                // .attr("transform",(d,i) => {
                // 	const x = _that.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[0];
                // 	const y = _that.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[1];
                // 	return "translate(" + x + "," + y + ")";
                // })
              if(d[1] === 'extend'){
                let arc = [108, 168];
                let texts = ["All", "按实体", "按文档", "按事件", "按关系"];
                let imageName = [["extends","all"], ["extends","entity"], ["extends","document"], ["extends","event"], ["extends","relation"]];
                let className = 'tl_menu menu_extend';
                let itemNumber = [1,2,3,4,5,6];
                if (!$(".menu_extend").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.75,itemNumber,arc, texts, imageName, className));
                }
                d3.selectAll('.menu_model,.menu_group,.menu_show,.thrl_menu').remove();
              }
              if(d[1] === 'model'){
                let arc = [108, 168];
                let texts = ["通用模型", "技战法", "自定义"];
                let imageName = [["models","common"], ["models","warmodel"], ["models","custom"]];
                let className = 'tl_menu menu_model';
                let itemNumber = [3.25,4.25,5.25];
                if (!$(".menu_model").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.5,itemNumber,arc, texts, imageName, className));
                }
                d3.selectAll('.menu_extend,.menu_group,.menu_show,.thrl_menu').remove();
              }
              if(d[1] === 'group'){
                let arc = [108, 168];
                let texts = links.length ? ["关系", "节点"] : ["节点"];
                let imageName = links.length ? [["groups","link"], ["groups","node"]] : [["groups","node"]];
                let angle = links.length ? 0.333 : 0.25;
                let className = 'tl_menu menu_group';
                let itemNumber = links.length ? [5.25,6.25] : [4];
                if (!$(".menu_group").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(angle,itemNumber,arc, texts, imageName, className));
                }
                d3.selectAll('.menu_extend,.menu_model,.menu_show,.thrl_menu').remove();
              }
              if(d[1] === 'show'){
                let arc = [108, 168];
                let texts = ["GIS"];
                let imageName = [["shows","gis"]];//0.25 7
                let className = 'tl_menu menu_show';
                // let itemNumber = [9.75,10.75];0.3333
                let itemNumber = [7];
                if (!$(".menu_show").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.25,itemNumber,arc, texts, imageName, className));
                }
                d3.selectAll('.menu_extend,.menu_model,.menu_group,.thrl_menu').remove();
              }
              //扩展菜单部分
              if(d[1] === 'entity'){
                let arc = [170, 230];
                let texts = selt.sliceName(getMoreMenus[0], "eimore").name;
                let imageName = selt.sliceName(getMoreMenus[0], "eimore").sysname;
                let extendType = selt.sliceName(getMoreMenus[0], "eimore").id;
                let className = 'thrl_menu menu_extend_entity';
                let itemNumber = [1,2,3,4,5,6];
                if (!$(".menu_extend_entity").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.75,itemNumber,arc, texts, imageName, className, extendType));
                }
                d3.selectAll('.menu_extend_document,.menu_extend_event').remove();
              }
              if(d[1] === 'document'){
                let arc = [170, 230];
                let texts = selt.sliceName(getMoreMenus[1], "dmore").name;
                let imageName = selt.sliceName(getMoreMenus[1], "dmore").sysname;
                let extendType = selt.sliceName(getMoreMenus[1], "dmore").id;
                let className = 'thrl_menu menu_extend_document';
                let itemNumber = [1,2,3,4,5,6];
                if (!$(".menu_extend_document").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.75,itemNumber,arc, texts, imageName, className,extendType));
                }
                d3.selectAll('.menu_extend_entity,.menu_extend_event').remove();
              }
              if(d[1] === 'event'){
                var arc = [170, 230];
                var texts = selt.sliceName(getMoreMenus[2], "evmore").name;
                var imageName = selt.sliceName(getMoreMenus[2], "evmore").sysname;
                var extendType = selt.sliceName(getMoreMenus[2], "evmore").id;
                var className = 'thrl_menu menu_extend_event';
                var itemNumber = [1,2,3,4,5,6];
                if (!$(".menu_extend_event").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.75,itemNumber,arc, texts, imageName, className,extendType));
                }
                d3.selectAll('.menu_extend_entity,.menu_extend_document').remove();
              }
              //模型菜单
              if(d[1] === 'common') {
                let arc = [170, 230];
                let texts = ["最短路径", "环形路径", "分散", "汇聚"];
                let imageName = [["commons","mostShort"], ["commons","around"], ["commons","disperse"], ["commons","converge"]];
                let className = 'thrl_menu menu_model_common';
                let itemNumber = [4,5,6,7];
                if (!$(".menu_model_common").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.5,itemNumber,arc, texts, imageName, className));
                }
                d3.selectAll('.menu_model_custom,.menu_model_war').remove();
              }
              if(d[1] === 'warmodel') {
                let arc = [170, 230];
                let texts = ["同行分析", "同住分析", "同案分析"];
                let imageName = [["warmodels","together"], ["warmodels","druged"], ["warmodels","message"]];
                let className = 'thrl_menu menu_model_war';
                let itemNumber = [3.25,4.25,5.25];
                if (!$(".menu_model_war").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(0.5,itemNumber,arc, texts, imageName, className));
                }
                d3.selectAll('.menu_model_custom,.menu_model_common').remove();
              }
              if(d[1] === 'custom') {
                let arc = [170, 230];
                let texts = selt.menuDatas.txtModel; //保存自定义模型的名字
                let imageName = [["customs","more"]]; //保存自定义模型图片的名字
                for (let i = 0; i < texts.length - 1; i++) {
                  imageName.unshift(["customs","customchild"]);
                }
                let angle = selt.getAngel(texts.length).angle; //根据自定义模型数目获取郊区值
                let depth = selt.menuDatas.depth;
                let direction = selt.menuDatas.direction;
                let passShipLabel = selt.menuDatas.passShipLabel;
                let className = 'thrl_menu menu_model_custom';
                let itemNumber = selt.getAngel(texts.length).itemNumber;
                if (!$(".menu_model_custom").length) {
                  resetMenu.oneTopoMenus(selt.myConfig(angle,itemNumber,arc, texts, imageName, className, undefined, depth, direction, passShipLabel));
                }
                d3.selectAll('.menu_model_common,.menu_model_war').remove();
              }
              if (d[1] === 'all'|| d[1] === 'relation') {
                d3.selectAll('.thrl_menu').remove();
              }
              if (d[0] === 'none') {
                d3.selectAll('.tl_menu,.thrl_menu').remove();
              }
              if (d[0] === 'extends') {
                selt.over('extend');
              }
              if (d[0] === 'models') {
                selt.over('model');
              }
              if (d[0] === 'groups') {
                selt.over('group');
              }
              if (d[0] === 'shows') {
                selt.over('show');
              }
              if (d[0] === 'shows') {
                selt.over('show');
              }
              if (d[0] === 'Entity') {
                selt.over('extend');
                selt.over('entity');
              }
              if (d[0] === 'Document') {
                selt.over('extend');
                selt.over('document');
              }
              if (d[0] === 'Event') {
                selt.over('extend');
                selt.over('event');
              }
              if (d[0] === 'commons') {
                selt.over('model');
                selt.over('common');
              }
              if (d[0] === 'warmodels') {
                selt.over('model');
                selt.over('warmodel');
              }
              if (d[0] === 'customs') {
                selt.over('model');
                selt.over('custom');
              }
            })
            .on("mouseleave", function (d, i) {
              d3.selectAll(".topoMenu_inring")
                .attr("class", "topoMenu_inring");
              d3.selectAll(".topoMenu_outring")
                .attr("class", "topoMenu_outring");
            })
            .on("click",  (d, i) => {
              if (d[1] === 'cancele') {
                this.remove();
              }
              if (d[1] === 'checkout') {
                // globalFuction.saveLocalStorage();
                location.href = '/' + config.nodeArray[4] + '?id=' + config.nodeArray[0] + '&type=' + config.nodeArray[2]; //跳转到详细页面
                this.remove();
              }
              if (d[1] === "jump") {
                localStorage.setItem("topologyType", "topo");
                goTopoAddNode(config.nodeArray[0],config.nodeArray[2]);
                this.remove();
              }
            });
          const tar = selectedPath.append("path")
              .attr("class", "topoMenu_inring")
              .attr("d",(d,i) => this.arc(config.arc[0], config.arc[0],config.imageName.length,config.itemNumber[i],config.angle)());
          tar.transition()
            .duration(200)
            .attr("d",(d,i) => this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle)());
          selectedPath.exit().attr("d",(d,i) => this.arc(config.arc[0], config.arc[0],config.imageName.length,config.itemNumber[i],config.angle)()).remove();
          //菜单操作提示文字信息
          const menuText = selectedPath.append("text")
            .attr("text-anchor", "middle")
            .text( (d, i) => {
              return config.text[i];
            })
            .attr("transform", "scale(0.1)")
            .style("fill", "#fff")
            .attr("x", (d, i) => {
              var x = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[0];
              return x;
            })
            .attr("y", (d, i) => {
              var y = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[1] + 23;
              return y;
            });
          menuText.attr("transform", "scale(1)");
          //操作菜单图片
          const menuImage = selectedPath.append("image")
            .attr("xlink:href", function (d, i) {
              return "../../image/typeicon/" + d[1].toLowerCase() + ".svg";
            })
            .attr("transform", "scale(0.1)")
            .attr("x", (d, i) => {
              var x = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[0] - 15;
              return x;
            })
            .attr("y", (d, i) => {
              var y = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[1] - 20;
              return y;
            })
            .attr("width", 28)
            .attr("height", 28);
          menuImage.attr("transform", "scale(1)");
          }
      };
      const resetMenu = new MagicTopoWorkMenus();
      //对画布进行拖动和缩放
      d3.selectAll(".ctrl").call(zoomListener)
        .on("dblclick.zoom", null);//防止双击事件
  }
})
