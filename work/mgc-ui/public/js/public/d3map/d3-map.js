/**
 * Created by ngm on 2017/12/20.
 */
function dGIS(baseId, w, h){

    let width = w;//"510"
    let height = h;//"496"

    if(baseId === "cMagnify"){
      width = $("#cMagnify").width();
      height = $("#cMagnify").height();
    }

    let gisPoint;//d3加点
    let gisNodes;//获得的点
    let gis;
    let zoom;
    let centered;
      // 是否获取json数据
    let dataFlag = false;
    let mousedown_gis = null;
    let mouseup_gis = null;
    //拖动连线
    var gis_drag_line;

    var svg = d3.select("#"+baseId+" div")
        .append("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("class","ctrl svgBorder");

    var g = svg.append("g");

    // 定义 地图的投影
    var projection = d3.geo.mercator()
        .center([107,31])
        .scale(width/2)
        .translate([width/2, height/1.8]);

    // 定义地理路径生成器
    var path = d3.geo.path()
        .projection(projection); //设定投影

    // 颜色 比例尺//var color = d3.scale.category20();  "#546d82", #3696b3  ,"#252b30" "#21282d",
    let mapstyle = gisGetCookie("theme");
    let color;
    if(mapstyle === "black"){
      color = ["#293742","#304453","#384651","#415362","#31404b", "#1d3549"];
    }else{
      color = ["#05F0FF","#9FE6FF","#81DEFF","#5DD5FF","#25C6FF", "#00B0F0"];
    }

    d3.select("#"+baseId+" div").on("mousedown",gis_mousedown).on("mousemove",gis_mousemove)//托动连线
        .on('mouseup',gis_mouseup);



    this.run = function(){
        dataFlag = true;
        show();
    }

    this.moveAndZoom = function (bool){
        if(bool){
            if(dataFlag){

                var initTran = projection.translate();
                var initScale = projection.scale();


                //定义缩放
                zoom = d3.behavior.zoom()
                    .scaleExtent([0.3,10])
                    .on("zoom",function(d){
                        //更新投影函数的平移量
                        projection.translate(
                            [
                                initTran[0] + d3.event.translate[0],
                                initTran[1] + d3.event.translate[1]
                            ]);

                        //更新投影函数的缩放量
                        projection.scale( initScale*d3.event.scale);
                        // 重绘地图
                        gis.attr("d",path);

                        // 重绘点
                        d3.selectAll(".gisimage").remove();

                        gisPoint = svg.selectAll(".gisimage")
                            .data(gisNodes)
                            .enter()
                            .append("image")
                            .attr("class","gisimage")
                            .attr("x",function (d,i) {
                                var peking = d;
                                var proPeking = projection(peking);
                                return proPeking[0]-15;//让图片移动到中间
                            })
                            .attr("y",function (d,i) {
                                var peking = d;
                                var proPeking = projection(peking);
                                return proPeking[1]-15;
                            })
                            .attr("width",30)
                            .attr("height",30)
                            .attr("xlink:href","../../image/gis/point.png")

                        //重绘南海诸岛
                        d3.selectAll(".southChinaSeaaa").remove();
                        var southSeaPeking = [121.0254+5,23.5986+5];
                        var southSeaProPeking = projection(southSeaPeking);
                        //加上南海
                        svg.append("image")
                            .attr("class","southChinaSeaaa")
                            .attr("x",southSeaProPeking[0])
                            .attr("y",southSeaProPeking[1])
                            .attr("width",54*d3.event.scale*1.8)
                            .attr("height",70*d3.event.scale*1.8)
                            .attr("xlink:href","../../image/gis/nanhai.svg");


                    })

                // svg中添加一个透明的矩形，用来捕捉事件
                svg.append("rect")
                    .attr("class","overlay")
                    .attr("x",0)
                    .attr("y",0)
                    .attr("width",width)
                    .attr("height",height)
                    .call(zoom);


                //d3.selectAll(".point").call(zoom);

                // IF dataJson END !!
            }



            //IF bool END !!
        }
        /*FUN moveAndZoom END!!*/
    }

    this.addManyPoint = function (nodes){
        if(dataFlag){
            gisNodes = nodes;
            //需要对nodes做一系列的处理。。。
            gisPoint = svg.selectAll(".gisimage")
                .data(nodes)
                .enter()
                .append("image")
                .attr("class","gisimage")
                .attr("x",function (d,i) {
                    var peking = [d.gis.lon, d.gis.lat];
                    var proPeking = projection(peking);
                    return proPeking[0]-15;//让图片移动到中间
                })
                .attr("y",function (d,i) {
                    var peking = [d.gis.lon, d.gis.lat];
                    var proPeking = projection(peking);
                    return proPeking[1]-15;
                })
                .attr("width",30)
                .attr("height",30)
                .attr("xlink:href","../../image/gis/point.png")


            // IF dataJson END !!
        }

    }

    this.clickAddRealPoint = function (sign){
        if(sign){
            if(dataFlag){
                d3.select(".svgBorder")
                    .on("click",function(d){
                        var selectPoint = [];
                        var point =[];

                        var peking;
                        var proPeking;
                        for(var lon = 73.4;lon<136.0;lon+=0.1){
                            for(var lat = 3.5;lat<54.0;lat+=0.1){
                                point = [lon,lat];
                                peking = point;
                                proPeking = projection(peking);
                                if(Math.abs(proPeking[0]-(d3.event.x-10))<0.8&&Math.abs(proPeking[1]-(d3.event.y-83))<0.8){
                                    selectPoint.push(point);
                                }

                            }
                        }
                        var len = selectPoint.length;
                        var lonSum = 0;
                        var latSum = 0;
                        if(len>=1){
                            for(var i=0;i<len;i++){
                                lonSum += selectPoint[i][0];
                                latSum += selectPoint[i][1];
                            }
                            point = [lonSum/len,latSum/len];
                            peking = point;
                            proPeking = projection(peking);

                            svg.append("image")
                                .attr("class","clickPoint")
                                .attr("x",proPeking[0])
                                .attr("y",proPeking[1])
                                .attr("width",30)
                                .attr("height",30)
                                .attr("xlink:href","../../image/gis/point.png");

                        }
                        //click }） end
                    })
                /* if dataFlag end */
            }

            /* if end */
        }
    }

    this.addSelectArea = function (sign,style){
        if(sign){

            var areaArr =[];
            var point;
            var areaArrLen = 0;
            if(dataFlag){

                d3.selectAll(".overlay").call(d3.behavior.zoom().on("zoom",null));
                d3.selectAll(".overlay").remove();

                if(style=="rect"){

                    d3.select(".svgBorder")
                        .on("mousedown",function(d){ // dragstart监听器
                            point = [d3.event.offsetX,d3.event.offsetY];
                            areaArr.push(point);
                            areaArrLen = areaArr.length;

                            svg.append("rect")
                                .attr("x",point[0])
                                .attr("y",point[1])
                                .attr("width",0)
                                .attr("height",0)
                                .attr("class","area rectArea"+areaArrLen)
                                .style("fill","#33d0ff")
                                .attr("opacity",0.5)

                            d3.select(".svgBorder").on("mousemove",function(d){ // drag 监听器
                                d3.select(".rectArea"+areaArrLen) //选择当前被拖拽的元素
                                //将d3.event.x 赋值给被绑定的数据 ，再将 cx 属性设置为该值
                                    .attr("width",d3.event.offsetX-point[0]>0?d3.event.offsetX-point[0]:point[0]-d3.event.offsetX)
                                    //将d3.event.y 赋值给被绑定的数据 ，再将 cy 属性设置为该值
                                    .attr("height",d3.event.offsetY-point[1]>0?d3.event.offsetY-point[1]:point[1]-d3.event.offsetY);

                            })

                        })

                        .on("mouseup",function(d){ // dragend 监听器
                            d3.select(this).on('mousemove', null)
                        })
                }else if(style=="circle"){
                    d3.select(".svgBorder")
                        .on("mousedown",function(d){ // dragstart监听器

                            point = [d3.event.offsetX,d3.event.offsetY];
                            areaArr.push(point);
                            areaArrLen = areaArr.length;

                            svg.append("rect")
                                .attr("x",point[0])
                                .attr("y",point[1])
                                .attr("width",0)
                                .attr("height",0)
                                .attr("class","rectArea"+areaArrLen)
                                .style("fill","#33d0ff")
                                .attr("opacity",0.5)

                            d3.select(".svgBorder").on("mousemove",function(d){ // drag 监听器

                                d3.select(".rectArea"+areaArrLen) //选择当前被拖拽的元素
                                //将d3.event.x 赋值给被绑定的数据 ，再将 cx 属性设置为该值
                                    .attr("width",d3.event.offsetX-point[0]>0?d3.event.offsetX-point[0]:point[0]-d3.event.offsetX)
                                    //将d3.event.y 赋值给被绑定的数据 ，再将 cy 属性设置为该值
                                    .attr("height",d3.event.offsetY-point[1]>0?d3.event.offsetY-point[1]:point[1]-d3.event.offsetY);

                            })

                        })

                        .on("mouseup",function(d){ // dragend 监听器
                            d3.select(this).on('mousemove', null)
                        })
                    /*if IF END !!*/
                }

                // IF   END !!
            }


            /*IF END !!*/
        }else{
            svg.append("rect")
                .attr("class","overlay")
                .attr("x",0)
                .attr("y",0)
                .attr("width",width)
                .attr("height",height)
                .call(zoom);

            d3.selectAll(".svgBorder").on("mousedown",null);
            d3.selectAll(".svgBorder").on("mousemove",null);

            d3.selectAll(".area").remove();
        }
        /*addSelectArea END !!*/
    }

    this.allowLine = function (sign) {
        if(sign){
            if(dataFlag){
                /*****************************************************************************
                 * 若实现连线功能，应该连先后，把数据保存---读取数据加点，应该改为 ： 读取数据加 点 线
                 *************************************************************************/

                d3.selectAll(".overlay").call(d3.behavior.zoom().on("zoom",null));
                d3.selectAll(".overlay").remove();
                gisPoint.on("mousedown",function(d,i){
                    //d3.select(this).classed("selected",true);

                    mousedown_gis = projection(d);
                    // 重置线
                    gis_drag_line.classed('hidden', false)
                        .attr('d', 'M' + mousedown_gis[0] + ',' + mousedown_gis[1] + 'L' + mousedown_gis[0] + ',' + mousedown_gis[1]);
                })
                    .on('mouseup', function(d) {
                        if(!mousedown_gis) return;
                        gis_drag_line.classed('hidden', true).style('marker-end', '');
                        // 检查终点是不是自身
                        mouseup_gis = projection(d);
                        //if(mouseup_node === mousedown_node) { resetMouseVars();return;};
                        if(mouseup_gis === mousedown_gis) { return;};
                        //添加新的线
                        var source, target;
                        source = mousedown_gis;
                        target = mouseup_gis;

                        var gislinePath = d3.svg.line();

                        svg.append("path")
                            .attr("class","gisline")
                            .attr("d",'M' + source[0] + ',' + source[1] + 'L' + target[0] + ',' + target[1])
                            .attr("stroke","#33D0FF")
                            .attr("stroke-width","3px");

                        resetGisMouseVars();

                    })



                // IF dataJson END !!
            }

            /*if end */
        }else{
            svg.append("rect")
                .attr("class","overlay")
                .attr("x",0)
                .attr("y",0)
                .attr("width",width)
                .attr("height",height)
                .call(zoom);

            gisPoint.on("mousedown",null);

            d3.selectAll(".gisline").remove();
        }

        /*function end*/
    }

    function show(){
      gis =g.attr("id", "states").selectAll(".gispath")//g.append("g").attr("id", "states")
        .data(dataJson.features)
        .enter()
        .append("path")
        .style("fill",function(d,i){
          //TODO 在这可以获取后端数据（对应每个省的数量，根据数量，显示对应的颜色）
          //现 暂时使用i区分不同颜色
          var lenColor = color.length;
          var l = i%lenColor;
          return color[l];
        })
        .attr("class","province")
        .attr("d",path)// 使用路径生成器
        .on("click",clicked)

      //添加连接线
      gis_drag_line = svg.append("svg:path")
        .attr("class",'links dragline hidden')
        .attr("d", "M0,0L0,0");
      /*d3.xml("../../image/gis/nanhai.svg", function(error,xmlDocument){
       svg.html(function(d){
       return d3.select(this).html()+xmlDocument.getElementsByTagName("g")[0].outerHTML;
       });

       d3.select("#southchinasea")
       .attr("x",100)
       .attr("y",100)
       .attr("transform","translate(540,410)scale(1)")
       .attr("class","southChinaSea");
       })*/


      var southSeaPeking = [121.0254+5,23.5986+5];
      var southSeaProPeking = projection(southSeaPeking);

      //加上南海
      svg.append("image")
        .attr("class","southChinaSeaaa")
        .attr("x",southSeaProPeking[0])
        .attr("y",southSeaProPeking[1])
        .attr("xlink:href","../../image/gis/nanhai.svg");
    }

    //点击地图变色
    function clicked(d){
      var x, y, k;
      if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
      } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
      }

      g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

      /*g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");*/

    }

    function gisGetCookie(cname){
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++)
      {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
      return "";
    }

    function gis_mousedown() {

    }
    //拖动连接线
    function gis_mousemove() {
        if(!mousedown_gis) return;
        mouseup_gis = d3.mouse(this);
        gis_drag_line.attr('d', 'M' + mousedown_gis[0] + ',' + mousedown_gis[1] + 'L' + (d3.mouse(this)[0]) + ',' + (d3.mouse(this)[1]));
    }
    //放开鼠标进行连线
    function gis_mouseup() {
        if(mousedown_gis) {
            // 隐藏线
            gis_drag_line.classed('hidden',true).style('marker-end','');
            // 清除
            resetGisMouseVars();
        }
    };
    //清空拖动连线的数据
    function resetGisMouseVars() {
        mousedown_gis = null;
    };

    /*ALL IN UNDER!!*/
}
