$(function(){ 
  window.startFunction = function(thisNode,domName,hideMenu){
      const width = $(domName).width();
      const height = $(domName).height();
      const linkColorArray = d3.scale.category20();
      const drawdraglinknode = new Drawdraglinknode();
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
      var magicTopoEvents = {
        //功能：双击节点的事件
        nodeDblclick: function() {
          return function(d) {
            if (d.nodeType === 0){
                let texts = [ "跳转","查看", "取消"];
                let imageType = [["none","jump"],["none","checkout"], ["none","cancele"]];
                let nodeArray = [d.id, d.nodeId, d.type, d.objectType,d.page_type];
                const itemNumber = [1,2,3];
                let config = {
                  arc: [45, 105, 105, 115],
                  angle:2,
                  text: texts,
                  imageName: imageType,
                  itemNumber:itemNumber,
                  className: 'ol_menu',
                  position: [d.x, d.y],
                  nodeArray: nodeArray,
                  groupNodes: d.grouped ? d.grouped : null
                };
                resetMenu.oneTopoMenus(config);
            } 
          }
        }
      };
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
          this.removeduplicate(myNoRepeatRelationIdArray);
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
                icon : link.icon || null,
                page_type: link.page_type,
                nodeWeight: link.nodeWeight,
                quantity:link.quantity,//(虚拟点的数量)
                nodeType: link.nodeType,
                objectType: link.objectType,
                //relationParentType: link.relationParentType, //关系的父类
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
        this.mergeDatas = function(reqNodes, reqLinks) {
          let lastNodes = new Set(); //集合
          myNodes.map(node => lastNodes.add(node.nodeId));
          const newHouses = []; // 去重后，需要新添加的节点
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
            links[i].size = linkmap[key];
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
          if (type == 'self') {
            maxLinkNumber = group.length;
          } else {
            maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length + 1) / 2;
          }
          //如果两个方向的关系数量一样多，直接分别设置编号即可
          if (linksA.length == linksB.length) {
            let startLinkNumber = 1;
            for (let i = 0; i < linksA.length; i++) {
              linksA[i].linknum = startLinkNumber++;
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
              smallerLinks[i].linknum = startLinkNumber--;
            }
            let tmpNumber = startLinkNumber;

            startLinkNumber = 1;
            let p = 0;
            while (startLinkNumber <= maxLinkNumber) {
              biggerLinks[p++].linknum = startLinkNumber++;
            }
            //开始负编号
            startLinkNumber = 0 - tmpNumber;
            for (let i = p; i < biggerLinks.length; i++) {
              biggerLinks[i].linknum = startLinkNumber++;
            }
          }
        },
        //关系去重
        this.removeduplicate = (link) => {
          let count = 1;
          for (let i = 0; i < link.length - 1; i++) {
            if ((link[i].id === link[i+1].id && link[i].source === link[i+1].source) && link[i].relationTypeName === link[i+1].relationTypeName) {
              link[i].relationNumber = ++count;
              link.splice(i+1,1);
              i--;
            } else {
              count = 1;
            }
          }
        }
      }
      //功能：扩展的时候，调用此函数进行数据请求
      function getDatatoDraw(thisNode) {
          try {
              if (!thisNode.nodeId) {
                throw ("nodeId");
              }
              if (!thisNode.id) {
                throw ("id");
              }
              if (!thisNode.type) {
                throw ("type");
              }
          } catch(e){
              console.error(e + '有问题');
          }
          //单个节点的扩展请求
          let url = EPMUI.context.url + "/leaves/" + thisNode.id + "/" + thisNode.objectType + "/" + thisNode.nodeId + "/" + "All";
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
            linksTypeName.push(links[i].relationTypeName);
            if (links[i].tag == '-20') {
              let temp = links[i].target;
              links[i].target = links[i].source;
              links[i].source = temp;
              links[i].tag = '20';
            }
          }
          let creatFilterList = function(){
            $(".topo-filter-ul").empty();
            linksTypeName = [...new Set(linksTypeName)];
            for(let i = 0, p;i < linksTypeName.length;i++){
              if(i === 1){
                p = "<li class='linksTypeName liborder'>"+ linksTypeName[i] +"</li>";
                
              } else{
                p = "<li class='linksTypeName'>"+ linksTypeName[i] +"</li>";
              }
              let $topoFilter = $(".topo-filter");
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
        const arc = (innerRadius, outerRadius) => {
          const arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(360)
            .padAngle(0);
          return arc;
        };
        pathUpdate = pathUpdate.data(links, function(d) {
          return d.relationId;
        });
        pathUpdate.enter().append("g")
          .attr("class", "outlink")
          .style("display",function(d){
            return d.source.display === 'none' || d.target.display === 'none' ? 'none' : 'block';
          })
          .each(function(d) {
            d3.select(this).append("path")
              .attr("class", "link")
              .style("stroke", "none")
              .attr('id', function(d) {
                return d.id;
              });
            d3.select(this).append("text")
              .attr("text-anchor", "middle")
              .attr("class", "outword")
              .style("font", "10px 微软雅黑")
              .text(function(d) {
                  if (d.number && d.relationNumber > 1) {
                    return d.relationTypeName + d.number + "次" + "x" + d.relationNumber;
                  } else if (d.relationNumber > 1) {
                    return d.relationTypeName + "x" + d.relationNumber;
                  } else {
                    return d.relationTypeName;
                  }
              });
            // if (d.relationWeight) {
            //   d3.select(this).append("text")
            //     .attr("class", "outwieght")
            //     .style("font", "10px 微软雅黑")
            //     .style("fill", "#ce1e1e")
            //     .text(function(d) {
            //         return':' + d.relationWeight;
            //     });
            // }
            d3.select(this).append("path")
              .attr("class", "overlay")
              .style("fill", "#A5ABB6")
              .style("stroke", "none")
              .style("opacity", 0)
              .attr("id", function(d) {
                return d.relationId;
              });
          });
        drawdraglinknode.drawLinks(pathUpdate, duration, 1);
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
          .on("dblclick", hideMenu ? null : magicTopoEvents.nodeDblclick())
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
              .style("stroke-dasharray",function(d){
                return d.nodeType ? (5,5) : (0,0);
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
            //         return "../../image/mark/"+ mark + ".svg";
            //       });
            //   })
            // }
            d3.select(this).append("image")
              .attr("class", "nodeimg")
              .attr("width", 24 + d.nodeWeight)
              .attr("height", 24 + d.nodeWeight)
              //.attr("xlink:href",d => "../../image/typeicon/" + d.objectType.toLowerCase() + ".svg")
              .attr("xlink:href", d => {
								return d.icon || "../../image/typeicon/" + d.objectType.toLowerCase() + ".svg"
							})
              .attr("x", (-24 - d.nodeWeight) / 2)
              .attr("y", (-24 - d.nodeWeight) / 2);
            d3.select(this).append("path")
							.attr("class", "raduisImage")
							.style('fill',d.fill)
							.attr("d",(d,i) => arc(17.5, 12)());
            d3.select(this).append("text")
              .attr("class", "nodetext")
              .attr("dy", 3.5 + d.nodeWeight / 5.5 + 'em')
              .attr("text-anchor", "middle")
              .style("font", "10px 微软雅黑")
              .text(function(d) {
                return d.name;
              });
          });
        drawdraglinknode.drawNodes(enterNodes,duration);
        enterNodes.exit().remove();
      }
      //绘制线和节点一节拖动节点函数集合
      function Drawdraglinknode(){
        //返回曲线
        this.arcArrow = function (startRadius, endRadius, endCentre, deflection, arrowWidth, headWidth, headLength) {
          let angleTangent,arcRadius,c1,c2,coord,cx,cy,deflectionRadians,endAngle,endAttach,endNormal,endOverlayCorner,endTangent,
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
          shaftLength,
          midShaftPoint,
          coordy;
          square = l => l * l;
          deflectionRadians = deflection * Math.PI / 180;
          startAttach = {
            x: Math.cos(deflectionRadians) * startRadius,
            y: Math.sin(deflectionRadians) * startRadius
          };
          radiusRatio = startRadius / (endRadius + headLength), 
          homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio);
          intersectWithOtherCircle = function(fixedPoint, radius, xCenter, polarity) {
            let A, B, C, gradient, hc, intersection;
            return gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter),
            hc = fixedPoint.y - gradient * fixedPoint.x, A = 1 + square(gradient),
            B = 2 * (gradient * hc - xCenter), C = square(hc) + square(xCenter) - square(radius),
            intersection = {
              x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
            }, intersection.y = (intersection.x - homotheticCenter) * gradient, intersection
          };
          endAttach = intersectWithOtherCircle(startAttach, endRadius + headLength, endCentre, -1);
          g1 = -startAttach.x / startAttach.y;
          c1 = startAttach.y + square(startAttach.x) / startAttach.y;
          g2 = -(endAttach.x - endCentre) / endAttach.y;
          c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y;
          cx = (c1 - c2) / (g2 - g1);
          cy = g1 * cx + c1;
          arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y));
          startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y);
          endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y);
          sweepAngle = endAngle - startAngle, deflection > 0 && (sweepAngle = 2 * Math.PI - sweepAngle);
          shaftLength = sweepAngle * arcRadius, startAngle > endAngle && (shaftLength = 0);
          midShaftAngle = (startAngle + endAngle) / 2, deflection > 0 && (midShaftAngle += Math.PI);
          midShaftPoint = {
            x: cx + arcRadius * Math.sin(midShaftAngle),
            y: cy - arcRadius * Math.cos(midShaftAngle)
          };
          startTangent = function(dr) {
            let dx, dy;
            return dx = (0 > dr ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1))), dy = g1 * dx, {
              x: startAttach.x + dx,
              y: startAttach.y + dy
            }
          };
          endTangent = function(dr) {
            let dx, dy;
            return dx = (0 > dr ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2))), dy = g2 * dx, {
              x: endAttach.x + dx,
              y: endAttach.y + dy
            }
          };
          angleTangent = function(angle, dr) {
            return {
              x: cx + (arcRadius + dr) * Math.sin(angle),
              y: cy - (arcRadius + dr) * Math.cos(angle)
            }
          };
          endNormal = function(dc) {
            let dx, dy;
            return dx = (0 > dc ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2))), dy = dx / g2, {
              x: endAttach.x + dx,
              y: endAttach.y - dy
            }
          };
          endOverlayCorner = (dr, dc) => {
            let arrowTip, shoulder;
            return shoulder = endTangent(dr), arrowTip = endNormal(dc), {
              x: shoulder.x + arrowTip.x - endAttach.x,
              y: shoulder.y + arrowTip.y - endAttach.y
            }
          };
          coord = point => point.x + "," + point.y;
          coordy = point => point.y;
          shaftRadius = arrowWidth / 2;
          headRadius = headWidth / 2;
          positiveSweep = startAttach.y > 0 ? 0 : 1;
          negativeSweep = startAttach.y < 0 ? 0 : 1;
          let outext = function(shortCaptionLength) {
            let captionSweep, endBreak, startBreak, dy;
              captionSweep = shortCaptionLength / arcRadius;
              deflection > 0 && (captionSweep *= -1);
              startBreak = midShaftAngle - captionSweep / 2;
              endBreak = midShaftAngle + captionSweep / 2;
            return dy = coordy(angleTangent(startBreak, shaftRadius)) + 3;
          };
          let outline = function(shortCaptionLength) {
            let captionSweep, endBreak, startBreak, dy;
              captionSweep = shortCaptionLength / arcRadius;
              deflection > 0 && (captionSweep *= -1);
              startBreak = midShaftAngle - captionSweep / 2;
              endBreak = midShaftAngle + captionSweep / 2;
            return ["M", coord(startTangent(shaftRadius)), "L", coord(startTangent(-shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(angleTangent(startBreak, -shaftRadius)), "L", coord(angleTangent(startBreak, shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius)), "Z", "M", coord(angleTangent(endBreak, shaftRadius)), "L", coord(angleTangent(endBreak, -shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), "L", coord(endTangent(-headRadius)), "L", coord(endNormal(headLength)), "L", coord(endTangent(headRadius)), "L", coord(endTangent(shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(angleTangent(endBreak, shaftRadius))].join(" ");
          };
          let overlay = minWidth => {
            let radius;
            return radius = Math.max(minWidth / 2, shaftRadius), ["M", coord(startTangent(radius)), "L", coord(startTangent(-radius)), "A", arcRadius - radius, arcRadius - radius, 0, 0, positiveSweep, coord(endTangent(-radius)), "L", coord(endOverlayCorner(-radius, headLength)), "L", coord(endOverlayCorner(radius, headLength)), "L", coord(endTangent(radius)), "A", arcRadius + radius, arcRadius + radius, 0, 0, negativeSweep, coord(startTangent(radius))].join(" ")
          };
          return {
            outext:outext,
            outline:outline,
            overlay:overlay
          };
        },
        //返回直线
        this.straightArrow = function (startRadius, endRadius, centreDistance, shaftWidth, headWidth, headHeight) {
          let length,shaftLength,endArrow, endShaft, headRadius, shaftRadius, startArrow,midShaftPoint;
          length = centreDistance - (startRadius + endRadius);
          shaftLength = length - headHeight;
          startArrow = startRadius;
          endShaft = startArrow + shaftLength;
          endArrow = startArrow + length;
          shaftRadius = shaftWidth / 2;
          headRadius = headWidth / 2;
          midShaftPoint = {
            x: startArrow + shaftLength / 2,
            y: 0
          };
          let outline = function(shortCaptionLength) {
            let endBreak, startBreak;
            startBreak = startArrow + (shaftLength - shortCaptionLength) / 2;
            endBreak = endShaft - startBreak + startRadius + 8;
            return ["M", startRadius, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", startRadius, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", endShaft, shaftRadius, "L", endShaft, headRadius, "L", endArrow, 0, "L", endShaft, -headRadius, "L", endShaft, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" ");
          };
          let overlay = function(minWidth) {
            let radius;
            return radius = Math.max(minWidth / 2, shaftRadius), ["M", startRadius, radius, "L", endArrow, radius, "L", endArrow, -radius, "L", startRadius, -radius, "Z"].join(" ")
          };
          return {
            outline:outline,
            overlay:overlay
          };
        },
        //实例化生成曲线和直线
        this.arcPath = function (d, strokeWidth, weight,textlength) {
          let square = num => num * num;
          let xDist = d.source.x - d.target.x;
          let yDist = d.source.y - d.target.y;
          let edgeHalfLength = Math.sqrt(square(xDist) + square(yDist)); //两点之间的距离
          let midpoint = 10;//控制多条关系得拱形大小的阀值
          let arcCaptionLenght = textlength + 10;//关系名得长度
          let deflection = d.linknum > 0 ? (d.id !== d.target.id) ? (midpoint * -d.linknum) : (midpoint * d.linknum) : (d.id !== d.target.id) ? (midpoint * -d.linknum) : midpoint * d.linknum;
          let arcArrowed = this.arcArrow(weight, weight, edgeHalfLength, deflection, strokeWidth, weight / 2 , weight / 2);
          let straightArrowed = this.straightArrow(weight, weight, edgeHalfLength, strokeWidth, weight / 2, weight / 2);
          let outline = d.linknum !== 1 ? arcArrowed.outline(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outline(arcCaptionLenght) : straightArrowed.outline(arcCaptionLenght);
          let dy = d.linknum !== 1 ? arcArrowed.outext(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outext(arcCaptionLenght) : 3;
          let overline = d.linknum !== 1 ? arcArrowed.overlay(10) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.overlay(10) : straightArrowed.overlay(10);
          return [outline,dy,overline];
        },
        //更新links的位置
        this.drawLinks = function (topoLinks, durations, strokeWidth) {
          topoLinks.attr("transform", function(d) {
            let	xDist = d.target.x - d.source.x;
            let	yDist = d.target.y - d.source.y;
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
            let lineColors = (edgeLength < 50 ) ? 'none' : linkColorArray(d.relationTypeName);//距离太近拉近两个点的时候线会很难看
            let dx = (d.linknum !== 1) ? (edgeLength / 2 - 4) : (d.size % 2 === 0) ? (edgeLength / 2 - 4) : (edgeLength / 2);
            const nodewight = (d.nodeWeight > 10) ? 10 : d.nodeWeight < 0 ? 0 : d.nodeWeight;
            const weight = 18 + parseInt(nodewight);//节点的半径
            const relationWeight = d.relationWeight > 5 ? 5 : d.relationWeight < 0 ? 1 : d.relationWeight;
            const _strokeWidth = relationWeight + strokeWidth;//线的粗细
            const textlength = d3.select(this).selectAll('.outword').node().getBBox().width;
            let dy = drawdraglinknode.arcPath(d,_strokeWidth,weight,textlength)[1];
            let linkPath = drawdraglinknode.arcPath(d,_strokeWidth,weight,textlength)[0];
            let overline = drawdraglinknode.arcPath(d,_strokeWidth,weight,textlength)[2];
            d3.select(this).selectAll("path.link")
              .transition()
              .duration(durations)
              .attr("d",linkPath)
              .style("fill",lineColors);
            d3.select(this).selectAll('text')
              .attr("transform", function(){
                return naturalAngle < 90 || naturalAngle > 270 ? "rotate(180 " + dx + " " + (dy - 3) + ")" : null;
              })
              .style("fill",lineColors);
            // d3.select(this).selectAll('.outwieght')
            // 	.attr('x', textlength)
            // 	.style("fill", opacity3)
            // 	.attr("y", dy);
            d3.select(this).selectAll('.outword')
              .attr('x', dx)
              .attr("y", dy);
            d3.select(this).selectAll("path.overlay")
              .attr("d", overline);
          });
        },
        //更新nodes的位置
        this.drawNodes = function (topoNode, durations) {
          topoNode.transition().duration(durations).attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
        },
        //拖动的时候匹配关系一起联动
        this.dragNodeandLink = function (d) {
          var source = magicGraph.pathUpdate.filter(function(l) {
              return l.source.id === d.id;
            })
            .each(function(l) {
              l.source.x = d.x;
              l.source.y = d.y;
            });
          this.drawLinks(source, 0, magicGraph.strokeWidth);
          var targrt = magicGraph.pathUpdate.filter(function(l) {
              return l.target.id === d.id;
            })
            .each(function(l) {
              l.target.x = d.x;
              l.target.y = d.y;
            });
          this.drawLinks(targrt, 0, magicGraph.strokeWidth);
        }
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
            })
            .on("mouseleave", function (d, i) {
              d3.selectAll(".topoMenu_inring")
                .attr("class", "topoMenu_inring");
              d3.selectAll(".topoMenu_outring")
                .attr("class", "topoMenu_outring");
            })
            .on("click",  (d) => {
              if (d[1] === 'cancele') {
                this.remove();
              }
              if (d[1] === 'checkout') {
                location.href = '/' + config.nodeArray[4] + '?id=' + config.nodeArray[0] + '&type=' + config.nodeArray[3]; //跳转到详细页面
                this.remove();
              }
              if (d[1] === "jump") {
                localStorage.setItem("topologyType", "topo");
                goTopoAddNode(config.nodeArray[0],config.nodeArray[3]);
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
