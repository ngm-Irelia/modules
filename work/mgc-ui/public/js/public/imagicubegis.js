function dGIS(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    var gisPoint;//d3加点
    var getGisNodes;//获得的点
    var gis;
    var zoom;
    var initScale;//投影比例
    var initTran;
    var showProvince = false;
    // 是否获取json数据
    var dataFlag = false;
    var mousedown_gis = null;
    var mouseup_gis = null;
    //拖动连线
    var gis_drag_line;

    var svg = d3.select("#basegis")
        .append("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("class","ctrl svgBorder");

    // 定义 地图的投影
    var projection = d3.geo.mercator()
        .center([107,31])
        .scale(width/2.5)
        .translate([width/2.5, height/2]);

    // 定义地理路径生成器
    var path = d3.geo.path()
        .projection(projection); //设定投影

    // 颜色 比例尺
    //var color = d3.scale.category20();  "#546d82", #3696b3  ,"#252b30" "#21282d",
    var color = ["#293742","#304453","#384651","#415362","#31404b",
                "#1d3549"];

    // 元素滤镜
    var defs = svg.append("defs");
    var gaussian = defs.append("filter").attr("id","gaussian");
    gaussian.append("feGaussianBlur").attr("in","SourceGraphic").attr("stdDeviation","1");


    d3.select("#topology_gis").on("mousedown",gis_mousedown).on("mousemove",gis_mousemove)//托动连线
        .on('mouseup',gis_mouseup);

    function show(){
         initTran = projection.translate();
         initScale = projection.scale();

        var groups = svg.append("g");
        gis =groups.selectAll(".gispath")
            .data(dataJson.features)
            .enter()
            .append("path")
            .style("fill",function(d,i){
                var lenColor = color.length;
                var l = i%lenColor;
                return color[l];
            })
            .attr("class","province")
            .attr("d",path)// 使用路径生成器
            .on("dblclick",function(d){

                svg.selectAll(".provinceText").remove();// 去掉省会名称

                projection.center(
                    [
                        d.properties.cp[0],
                        d.properties.cp[1]
                    ])
                    .translate([width/2.5-50, height/2-50]);

                initTran = projection.translate();
                projection.scale(width/1.2);
                initScale = projection.scale();
                gis.attr("d",path)

                // 重绘点
                d3.selectAll(".gisimage").remove();

                gisPoint = svg.selectAll(".gisimage")
                    .data(getGisNodes)
                    .enter()
                    //.append("image")
                    .append("circle")
                    .attr("class","gisimage")
                    .attr("id",function(d,i){
                        return d.id;
                    })
                    .attr("cx",function (d,i) {
                        var peking = [d.gis.lon,d.gis.lat];
                        var proPeking = projection(peking);
                        return proPeking[0];//让图片移动到中间
                    })
                    .attr("cy",function (d,i) {
                        var peking = [d.gis.lon,d.gis.lat];
                        var proPeking = projection(peking);
                        return proPeking[1];
                    })
                    .attr("r",3)
                    .style("fill","#FFD862")
                    .style("filter","url(#"+gaussian.attr("id")+")")
                    .on("mousedown",function(d,i){
                        d3.selectAll(".gisimage").style("fill","FFD862")
                        d3.select(this).style("fill","blue")
                        getBaseMessage(true,d.id, d.type, true);//基础信息展示
                    })

                //重绘南海诸岛
                d3.selectAll(".southChinaSeaaa").remove();
                var southSeaPeking = [121.0254+5,23.5986+5];
                var southSeaProPeking = projection(southSeaPeking);
                //加上南海
                svg.append("image")
                    .attr("class","southChinaSeaaa")
                    .attr("x",southSeaProPeking[0])
                    .attr("y",southSeaProPeking[1])
                    /*.attr("width",54+10)
                    .attr("height",70+10)*/
                    .attr("xlink:href","../../image/gis/nanhai.svg");
            })
            .on("mouseover",function(d,i){
                //显示省份
                svg.append("text")
                    .attr("class","provinceText")
                    .attr("transform",function()
                    {
                        if(d.properties.name =="河北") {//河北
                            return "translate("+(path.centroid(d)[0]-20)+","+ (path.centroid(d)[1]+30)+")";
                        }
                        return "translate("+(path.centroid(d)[0]-4)+","+ (path.centroid(d)[1]+5)+")";
                    })
                    .text(function(){
                        return d.properties.name;
                    })
                    .attr("font-size",12);


            })
            .on("mouseout",function(){
                //显隐藏省份
                svg.selectAll(".provinceText").remove();
            })


            //添加连接线
        gis_drag_line = svg.append("svg:path")
            .attr("class",'links dragline hidden')
            .attr("d", "M0,0L0,0");

        var southSeaPeking = [121.0254+5,23.5986+5];
        var southSeaProPeking = projection(southSeaPeking);

        //加上南海
        svg.append("image")
            .attr("class","southChinaSeaaa")
            .attr("x",southSeaProPeking[0])
            .attr("y",southSeaProPeking[1])
            .attr("xlink:href","../../image/gis/nanhai.svg");
    }

    this.run = function(){
           dataFlag = true;
           show();
    }

    this.moveAndZoom = function (bool){
        if(bool){
                if(dataFlag){

                     initTran = projection.translate();
                     initScale = projection.scale();

                    //定义缩放
                    zoom = d3.behavior.zoom()
                        .scaleExtent([0.3,9])
                        .on("zoom",function(d){


                            //去掉省会名称
                            svg.selectAll(".provinceText").remove();
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
                                .data(getGisNodes)
                                .enter()
                                //.append("image")
                                .append("circle")
                                .attr("class","gisimage")
                                .attr("id",function(d,i){
                                    return d.id;
                                })
                                .attr("cx",function (d,i) {
                                    var peking = [d.gis.lon,d.gis.lat];
                                    var proPeking = projection(peking);
                                    return proPeking[0];//让图片移动到中间
                                })
                                .attr("cy",function (d,i) {
                                    var peking = [d.gis.lon,d.gis.lat];
                                    var proPeking = projection(peking);
                                    return proPeking[1];
                                })
                                .attr("r",3)
                                .style("fill","#FFD862")
                                .style("filter","url(#"+gaussian.attr("id")+")")
                                .on("mousedown",function(d,i){
                                    d3.selectAll(".gisimage").style("fill","FFD862")
                                    d3.select(this).style("fill","blue")
                                    getBaseMessage(true,d.id, d.type, true);//基础信息展示
                                })

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

                            // 如果scale到达最大值，跳转到gis地图
                            if(zoom.scale()==9){
                                $("#topology_chart").hide();
                                $("#topology_topo").hide();
                                $("#topology_gis").hide();
                                $("#gis_usual_tools").hide();
                                $("#topology_map").show();
                                $("#map_usual_tools").show();
                                gis_mapSign = true;

                                var mapGIS =new mapGis();
                                mapGIS.run();
                                mapGIS.addPoint();
                                $("#topo_gis").html("GIS");

                            }

                        })

                    svg.call(zoom);

                    svg.on('dblclick.zoom',null)

                    // IF dataJson END !!
                }

            //IF bool END !!
        }
        /*FUN moveAndZoom END!!*/
    }

    this.addManyPoint = function (points){
        //对points做处理
        var dealPoints =[];
        for(var i=0;i<points.length;i++){
            if(points[i].type=="PERSON"){
                dealPoints.push(points[i]);
            }
        }

        if(dataFlag){
                //console.log(points)
                getGisNodes = dealPoints;
                d3.selectAll(".gisimage").remove();//先把以前的点去掉
                 gisPoint = svg.selectAll(".gisimage")
                    .data(dealPoints)//nodes 修改了
                    .enter()
                    //.append("image")
                    .append("circle")
                    .attr("class","gisimage")
                    .attr("id",function(d,i){
                        return d.id;
                    })
                    .attr("cx",function (d,i) {
                        //console.log(d.gis)
                        var peking = [d.gis.lon,d.gis.lat];
                        var proPeking = projection(peking);
                        return proPeking[0];//old 让图片移动到中间-15
                    })
                    .attr("cy",function (d,i) {
                        var peking = [d.gis.lon,d.gis.lat];
                        var proPeking = projection(peking);
                        return proPeking[1];
                    })
                    .attr("r",3)
                    .style("fill","#FFD862")
                    .style("filter","url(#"+gaussian.attr("id")+")")
                    /*.attr("width",30)
                    .attr("height",30)
                    .attr("xlink:href","../../image/gis/point.png")*/
                    .on("mousedown",function(d,i){
                        d3.selectAll(".gisimage").style("fill","FFD862")
                        d3.select(this).style("fill","blue")
                        getBaseMessage(true,d.id, d.type, true);//基础信息展示
                     })

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

                    svg.call(d3.behavior.zoom().on("zoom",null));

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

            svg.call(zoom);
            d3.selectAll(".svgBorder").on("mousedown",null);
            d3.selectAll(".svgBorder").on("mousemove",null);

            d3.selectAll(".area").remove();
        }
        /*addSelectArea END !!*/
    }
    //切换主题
    this.toggleTheme = function (sign) {
        if(sign){
            //设置最大值 最小值
            var maxvalue=333;// = d3.max()//365页写法 参考
            var minvalue = 0;
            //定义一个线性比例尺
            var linear = d3.scale.linear()
                .domain([minvalue,maxvalue])
                .range([0,1]);
            // 定义颜色 浅蓝-蓝
            var a = d3.rgb(0,255,255);
            var b = d3.rgb(0,0,255);
            //颜色差值函数
            var computeColor = d3.interpolate(a,b);
            //设置各省份的填充色
            /*gis.each(function(d,i){
                console.log(d)
            })*/

        /*if end */
        }
    }

    this.allowLine = function (sign) {
        if(sign){
                if(dataFlag){
                    /*****************************************************************************
                     * 若实现连线功能，应该连先后，把数据保存---读取数据加点，应该改为 ： 读取数据加 点 线
                     *************************************************************************/

                    svg.call(d3.behavior.zoom().on("zoom",null));

                    gisPoint.on("mousedown",function(d,i){
                        //d3.select(this).classed("selected",true);
                        var peking = [d.gis.lon,d.gis.lat];
                        mousedown_gis = projection(peking);
                        // 重置线
                        gis_drag_line.classed('hidden', false)
                            .attr('d', 'M' + mousedown_gis[0] + ',' + mousedown_gis[1] + 'L' + mousedown_gis[0] + ',' + mousedown_gis[1]);
                    })
                    .on('mouseup', function(d) {
                     if(!mousedown_gis) return;
                     gis_drag_line.classed('hidden', true).style('marker-end', '');
                     // 检查终点是不是自身
                     var peking = [d.gis.lon,d.gis.lat];
                     mouseup_gis = projection(peking);

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

            svg.call(zoom)
            gisPoint.on("mousedown",null);
            d3.selectAll(".gisline").remove();
        }

     /*function end*/
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



