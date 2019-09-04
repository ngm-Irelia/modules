/**
 * Created by ngm on 2017/10/25.
 */
var ArcGisNgm = window.ArcGisNgm = ArcGisNgm || {};
/*
* 备注：
* sign种类：marker polyline text polylinetext
*
*现有图层： 地图省份划分图层mapAreaGraphicLayer   所有线条图层lineGraphicLayer
*         图标图层graphicLayer                 聚合图层clusterLayer
*         区域统计图层aSGraphicLayer(areaStatistics) 重点区域图层 keyAreaLayer
*         !! 图层顺序暂时不能变更，暂时未找到解决方法
*
* */
(function() {
    ArcGisNgm.arcGisNgm = arcGisNgm;
    function arcGisNgm() {
        let map, mapAreaGraphicLayer, lineGraphicLayer, graphicLayer, editToolbar, clusterLayer,keyAreaLayer, bayonetLayer, aSGraphicLayer;
        let arcgisSetSign = false,//判断设置菜单显示隐藏
            arcgisToolSign = false,
            mapthemeType = "blue",//判断地图主题
            mapHeatSign = false,//热力图
            mapSmallSign = false,//点状图
            mapFontStatus = true,// 文字显示
            mapLineStatus = true,// 线条显示
            mapPathSgin = false,//地图轨迹标志
            markerClustererSign = false,//聚合标志
            bayonetSign=false,//卡口 显示状态
            arcGisStep = [],//保存上一步数据
            arcGisType = [],//保存上一步操作类型
            arcGisStepNum = 0,//保存上一步操作顺序数组的长度
            keyAreaSign = false, // 重点区域标志
            areaStatisticsSign = false,// 区域统计标志
            areaStatisticsData = [],
            clusterLayerSign = false,
            shiftSign = false,
            mapdisk = false,//圆环菜单
            mapUseType = "demo",//根据类型，选择点线等样式  demo开发，use实际使用
            timelineIntervalSign = true,
            allEdit = [], //存放所有edit的点
            shiftGraphic = [],// 存放shift状态下graphic的信息
            noGisPoints = [],
            lineShowHideTime = [],
            mapLineColor = ["#f99070", "#ce1e1e", "#a1f480", "#70f9ee", "#ff780c", "#3dbcc2"],
            lineNames = [];//线条关系数组
        let mapstyle = mapCommonPart.getCookie("theme");
        window.mapCommon = {
            mapWorkMarker:[],
            mapWorkArea:{},
            mapKeyArea:{}
        };//存放正在操作的点
        window.mapAdvanceSearchFlag = localStorage.mapAdvanceSearchFlag ? localStorage.mapAdvanceSearchFlag : "false";//高级搜索标志

        //图形还原or选中 mapGraphicRestoreChecked
        /**
         * 
         * @param {*} RC         { restore | checked } 还原 选中
         * @param {*} graphicId  覆盖物的id
         */
        function mapGraphicRC(RC, graphicId){
            if(RC === "restore"){
                let mapGraphics = graphicLayer.graphics;
                for(var k=0;k<mapGraphics.length;k++){//判断是一个点.且选中
                    if(mapGraphics[k].attributes.hasOwnProperty("addnode")&&mapGraphics[k].symbol.clickSign === "true"){
                        mapSetSymbol(mapGraphics[k], "base");
                    }
                    if(mapGraphics[k].attributes.sign === "text"){//文字标签
                        let textSymbol =  new esri.symbol.TextSymbol(mapGraphics[k].attributes.name);
                        if(mapUseType === "use" || mapstyle === "white"){
                            textSymbol.setColor(new esri.Color([51,208,255,1]));
                        }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                        }
                        textSymbol.setOffset(35, 10);
                        mapGraphics[k].setSymbol(textSymbol);
                    }
                }
            }

            if(RC === "checked"){
                let graphics = graphicLayer.graphics;
                for (var k = 0; k < graphics.length; k++) {
                    if (graphics[k].attributes.hasOwnProperty("addnode") && graphics[k].symbol.clickSign !== "move") {
                        graphics[k].attributes.id === graphicId ? mapSetSymbol(graphics[k], "click") : mapSetSymbol(graphics[k], "base");
                    }
                    if (graphics[k].attributes.sign === "text") {//点的名称 颜色还原
                        let textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                        if(graphics[k].attributes.id === graphicId){
                            textSymbol.setColor(new esri.Color([255,39,10,1]));
                        }else{ //点的名称
                            if(mapUseType === "use" || mapstyle === "white"){
                                textSymbol.setColor(new esri.Color([51,208,255,1]));
                            }else{
                                textSymbol.setColor(new esri.Color([255,255,255,1]));
                            }
                        }
                        textSymbol.setOffset(35, 10);
                        graphics[k].setSymbol(textSymbol);
                    }
                }



            }
        }
        //修改点的样式
        /**
         * 
         * @param {*} graphic 覆盖物
         * @param {*} sign     { base | click | hover | move } 样式 :基本 选中 悬停 移动
         */
        function mapSetSymbol(graphic, sign){
            let symbol;
            let clickSign;
            if(sign === "base"){
                symbol = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
                clickSign = "false";
            }else if(sign === "click"){
                symbol = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-click.svg", 25, 30);
                clickSign = "true";
            }else if(sign === "hover"){
                symbol = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-hover.svg", 25, 30);
                clickSign = "false";
            }else if(sign === "move"){
                symbol = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-move.svg", 25, 30);
                clickSign = "move";
            }
            symbol.clickSign = clickSign;
            graphic.setSymbol(symbol);
        }
        //加载地图
        this.run = function () {
            require([
                "esri/map", "esri/geometry/Circle", "esri/symbols/SimpleFillSymbol",
                "esri/graphic", "esri/layers/GraphicsLayer","esri/toolbars/edit","esri/toolbars/draw",
                "dojo/dom", "dojo/dom-attr",
                "dojo/parser", "dijit/registry",


                "dojo/ready",
                "dojo/_base/array",
                "esri/Color",
                "dojo/dom-style",
                "dojo/query",

                "esri/dijit/Scalebar",
                "esri/request",
                "esri/graphic",
                "esri/geometry/Extent",

                "esri/symbols/SimpleMarkerSymbol",
                "esri/symbols/PictureMarkerSymbol",
                "esri/renderers/ClassBreaksRenderer",

                "esri/SpatialReference",
                "esri/dijit/PopupTemplate",
                "esri/geometry/Point",
                "esri/geometry/webMercatorUtils",


                "esri/layers/WebTiledLayer",
                "dijit/layout/BorderContainer",
                "dijit/layout/ContentPane",

                "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
                "dijit/form/Button", "dijit/WidgetSet", "dojo/domReady!"
            ], function(
                Map, Circle, SimpleFillSymbol,
                Grahpic, GraphicsLayer,Edit,Draw,
                dom, domAttr,
                parser, registry,

                ready, arrayUtils, Color, domStyle, query,Scalebar,
                 esriRequest, Graphic, Extent,
                SimpleMarkerSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
                SpatialReference, PopupTemplate, Point, webMercatorUtils,
                WebTiledLayer

            ){
              //"extras/ClusterLayer",  ClusterLayer,
                if(mapstyle === "white"){
                    if(EPMUI.context.gis.server === "null"){
                      map = new Map("basemap", {
                        basemap: "streets",//gray  streets-night-vector  streets  dark-gray
                        center: [100.741, 40.39],
                        slider: false,
                        zoom:4,
                        isClickRecenter:false
                      });
                    }else if(EPMUI.context.gis.server === "arcgis_off_line"){ // 在这使用离线地图
                      map = new Map("basemap", {
                        "spatialReference":{"wkid":4326},
                        center: [110.985, 40.822],
                        zoom: 5,
                        maxZoom:7,
                        minZoom:1
                      });

                      let pngurl = "host-172-16-11-146:8080";
                      let strpngurl = pngurl.toString();
                      var baseMap = new WebTiledLayer("http://"+strpngurl+"/arcgis/china/bmap/{level}/{col}/{row}.png", {
                        "copyright": "aaa",
                        "id": "aaa",
                        "subDomains": ["t0", "t1", "t2"]
                      });
                      map.addLayer(baseMap);

                    }else if(EPMUI.context.gis.server !== "null"){
                      map = new Map("basemap", {
                        //center: new Point(1714791.187457787, 2194882.166227445, new SpatialReference({ wkid: 5936 }))
                        center: [106.237202,38.470519],
                        scale:64674.579737842505
                      });
                      let tiled = new esri.layers.ArcGISDynamicMapServiceLayer(EPMUI.context.gis.server);
                      map.addLayer(tiled);
                    }
                }else{
                    if(EPMUI.context.gis.server === "null"){
                      map = new Map("basemap", {
                        basemap: "dark-gray",//gray  streets-night-vector  streets  dark-gray
                        center: [100.741, 50.39],
                        slider: false,
                        zoom:4,
                        isClickRecenter:false
                      });
                    }else if(EPMUI.context.gis.server === "arcgis_off_line"){
                      map = new Map("basemap", {
                        "spatialReference":{"wkid":4326},
                        center: [110.985, 40.822],
                        zoom: 5,
                        maxZoom:7,
                        minZoom:1
                      });

                      let pngurl = "host-172-16-11-146:8080";
                      let strpngurl = pngurl.toString();
                      var baseMap = new WebTiledLayer("http://"+strpngurl+"/arcgis/china/bmap/{level}/{col}/{row}.png", {
                        "copyright": "aaa",
                        "id": "aaa",
                        "subDomains": ["t0", "t1", "t2"]
                      });
                      map.addLayer(baseMap);

                    }else if(EPMUI.context.gis.server !== "null"){
                      map = new Map("basemap", {
                        //center: new Point(1714791.187457787, 2194882.166227445, new SpatialReference({ wkid: 5936 }))
                        center: [106.237202,38.470519],
                        scale:64674.579737842505
                      });
                      let tiled = new esri.layers.ArcGISDynamicMapServiceLayer(EPMUI.context.gis.server);
                      map.addLayer(tiled);
                    }
                }

                //创建地图区域图层
                mapAreaGraphicLayer = new GraphicsLayer();
                //把图层添加到地图上
                map.addLayer(mapAreaGraphicLayer);
                map.setMapCursor("pointer");
                //setMapArea();

                //创建线条专门图层
                lineGraphicLayer = new GraphicsLayer();
                map.addLayer(lineGraphicLayer);
                map.setMapCursor("pointer");

                //创建重点区域图层
                keyAreaLayer = new GraphicsLayer();
                map.addLayer(keyAreaLayer);
                map.setMapCursor("pointer");

                //区域统计图层
                aSGraphicLayer = new GraphicsLayer();
                map.addLayer(aSGraphicLayer);
                map.setMapCursor("pointer");

                //创建图标图层
                graphicLayer = new GraphicsLayer();
                map.addLayer(graphicLayer);
                map.setMapCursor("pointer");

                //创建卡口图层
                bayonetLayer = new GraphicsLayer();
                map.addLayer(bayonetLayer);
                map.setMapCursor("pointer");


                //添加比例尺
                var scalebar = new Scalebar({
                    map: map,
                    scalebarUnit: "dual"
                });
                //初始一个覆盖物
                var textattr = { sign:"no" };
                var textpt = new esri.geometry.Point(1, 1);
                var textSymbol =  new esri.symbol.TextSymbol(" ");
                var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);//创建图像
                graphicLayer.add(textGraphic);//把图像添加到刚才创建的图层上

                editToolbar = new esri.toolbars.Edit(map);//工具

                mapload = true;

                map.disableRubberBandZoom();//不允许shift相关默认操作
                map.disableClickRecenter();//不允许shift相关默认操作
                map.disableShiftDoubleClickZoom();//不允许shift相关默认操作

                map.on("mouse-drag-start",function(){
                    $("#basemap_layers").children("svg").css("cursor","pointer");
                    $(".map_select_btn_div").css("width","0px");
                    $(".map_select_btn").css("width","0px");
                    //ngm里面的内容也需要修改
                    let val = $("#map_select_input").val();
                    if(val){
                        $(".map_select_resultDiv").css("height","0px");
                        $(".map_select_resultDivSmall").css("height","40px");
                    }else {
                        $(".map_select_resultDiv").css("height","0px");
                        $(".map_select_resultDivSmall").css("height","0px");
                    }

                    if(mapPathSgin){
                        $(".map_path").css("height","40px").css("overflow","hidden");
                    }

                });
                map.on("mouse-drag",function(e){//拖动时，asDiv也要随动
                     let $asdiv = $("#asDiv");
                     let x = parseInt($asdiv.css("left"));
                     let y = parseInt($asdiv.css("top"));
                     $asdiv.css("left",parseInt(e.movementX)+x+"px").css("top",parseInt(e.movementY)+y+"px");

                });
                map.on("zoom-start",function(){
                    if(areaStatisticsSign){
                        $("#asDiv").remove();
                        d3.selectAll(".aSGraphic").remove();
                    }
                });
                map.on("zoom-end",function(){
                    $("#asDiv").remove();
                    d3.selectAll(".aSGraphic").remove();
                    setTimeout(function(){
                        areaStatistics(areaStatisticsData);
                    },500);
                });
                map.on("dbl-click",function(){
                });
                map.on("click",function(){
                    $("#asDiv").remove();
                });
                // 多选点
                map.on("key-down",function(event){
                    if (event.keyCode == 16) { //shift
                        shiftSign = true;
                    }
                });
                map.on("key-up",function(event){
                    if (event.keyCode == 16) { //shift
                        shiftSign = false;
                        shiftGraphic = [];
                    }
                });

                pointEvent(); //图层点 事件
                addLocalStorageMarker();//添加localStorage中的点

                setTimeout(function(){
                    $(".esriControlsBR").hide();
                    $("#basemap_layers").children("svg").css("cursor","pointer");
                    $("#basemap_zoom_slider").css("display","none");
                    $(".actionsPane").css("display","none");
                },500);

                //地理坐标，墨托卡坐标等的转换
                window.turnSpace = function (point,sign) {
                    let returndata;
                    if(sign === "lngLatToXY"){//经纬度转化为墨托卡
                        returndata = webMercatorUtils.lngLatToXY(point.x, point.y);
                    }
                    if(sign === "xyToLngLat"){//墨托卡转化为经纬度
                        returndata = webMercatorUtils.xyToLngLat(point.x, point.y);
                    }
                    if(sign === "toScreen"){//经纬度转化为屏幕坐标
                        returndata = map.toScreen( point );
                    }
                    return returndata;
                };

                //聚合的方法
                window.addClusters = function(photodata) {
                    //首先处理数据
                    var photoInfo = {};
                    var wgs = new SpatialReference({
                        "wkid": 4326
                    });

                    photoInfo.data = arrayUtils.map(photodata, function(p) {
                        var latlng = new  Point(parseFloat(p.attributes.gis.lon), parseFloat(p.attributes.gis.lat), wgs);
                        var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
                        var attributes = {
                            "attr": p.attributes
                        };
                        return {
                            "x": webMercator.x,
                            "y": webMercator.y,
                            "attributes": attributes
                        };
                    });


                    parser.parse();
                    // cluster layer that uses OpenLayers style clustering
                    /*clusterLayer = new ClusterLayer({
                        "data": photoInfo.data,
                        "distance": 100,
                        "id": "clusters",
                        "labelColor": "#fff",
                        "labelOffset": 10,
                        "resolution": map.extent.getWidth() / map.width,
                        "singleColor": "#888"
                    });*/
                    var defaultSym = new SimpleMarkerSymbol().setSize(4);
                    var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

                    var blue = new PictureMarkerSymbol("../../../image/gis/circle.svg", 1, 1).setOffset(0, 110);
                    var green = new PictureMarkerSymbol("../../../image/gis/circle-green.svg", 40, 40).setOffset(0, 15);
                    var red = new PictureMarkerSymbol("../../../image/gis/circle-red.svg", 40, 40).setOffset(0, 15);
                    renderer.addBreak(0, 1, blue);
                    renderer.addBreak(2, 200, green);
                    renderer.addBreak(200, 10001, red);

                    /*clusterLayer.setRenderer(renderer);
                    map.addLayer(clusterLayer);*/


                    clusterLayerSign = true;

                };
            });
        };
        //添加localStorage()中的点
        function addLocalStorageMarker(){
            let historyDatas = localStorage.mapOverlays ? JSON.parse(localStorage.mapOverlays): "false";//跳转时保存的缓存数据
            if(historyDatas !== "false" ){
                createMarkerLine(historyDatas.overlaysMarker, historyDatas.overlaysLine);
            }

            let localStorageMarker = localStorage.searchAddNode ? JSON.parse(localStorage.searchAddNode) : "false";
            if(localStorageMarker !== "false"){
                let localStorageMarkerId = [];
                let localStorageMarkerType = [];
                for (var i = 0; i < localStorageMarker.length; i++) {//循环，加点
                    localStorageMarkerId.push(localStorageMarker[i].id);
                    localStorageMarkerType.push(localStorageMarker[i].type);
                }
                mapCommonPart.getmapGis(localStorageMarker, localStorageMarkerId, localStorageMarkerType, false);// 获取gis信息
            }
        }
        //高级搜索功能 加载地图
        this.searchArcGisRun = function () {
            require([
                "esri/map", "esri/geometry/Circle", "esri/symbols/SimpleFillSymbol",
                "esri/graphic", "esri/layers/GraphicsLayer","esri/toolbars/edit","esri/toolbars/draw",
                "dojo/dom", "dojo/dom-attr",
                "dojo/parser", "dijit/registry",
                "dojo/ready",
                "dojo/_base/array",
                "esri/Color",
                "dojo/dom-style",
                "dojo/query",
                "esri/request",
                "esri/graphic",
                "esri/geometry/Extent",
                "esri/symbols/SimpleMarkerSymbol",
                "esri/symbols/PictureMarkerSymbol",
                "esri/renderers/ClassBreaksRenderer",
                "esri/SpatialReference",
                "esri/dijit/PopupTemplate",
                "esri/geometry/Point",
                "esri/geometry/webMercatorUtils",
                "dijit/layout/BorderContainer",
                "dijit/layout/ContentPane",
                "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
                "dijit/form/Button", "dijit/WidgetSet", "dojo/domReady!public/js/public/arcGis/arcGisNgm"
            ], function(
                Map, Circle, SimpleFillSymbol,
                Grahpic, GraphicsLayer,Edit,Draw,
                dom, domAttr,
                parser, registry,

                ready, arrayUtils, Color, domStyle, query,
                esriRequest, Graphic, Extent,
                SimpleMarkerSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
                SpatialReference, PopupTemplate, Point, webMercatorUtils

            ){
                if(mapstyle === "white"){
                    if(EPMUI.context.gis.server !== "null"){
                        map = new Map("searchMap", {
                            center: new Point(1714791.187457787, 2194882.166227445, new SpatialReference({ wkid: 5936 }))
                        });
                        let tiled = new esri.layers.ArcGISDynamicMapServiceLayer(EPMUI.context.gis.server);
                        map.addLayer(tiled);
                    }else if(EPMUI.context.gis.server === "null"){
                        map = new Map("searchMap", {
                            basemap: "streets",//gray  streets-night-vector  streets  dark-gray
                            center: [100.741, 40.39],
                            slider: false,
                            zoom:4
                        });
                    }
                }else{
                    if(EPMUI.context.gis.server !== "null"){
                        map = new Map("searchMap", {
                            center: new Point(1714791.187457787, 2194882.166227445, new SpatialReference({ wkid: 5936 }))
                        });
                        let tiled = new esri.layers.ArcGISDynamicMapServiceLayer(EPMUI.context.gis.server);
                        map.addLayer(tiled);
                    }else if(EPMUI.context.gis.server === "null"){
                        map = new Map("searchMap", {
                            basemap: "dark-gray",//gray  streets-night-vector  streets  dark-gray
                            center: [100.741, 50.39],
                            slider: false,
                            zoom:4
                        });
                    }
                }

                //创建图层
                graphicLayer = new GraphicsLayer();
                //把图层添加到地图上
                map.addLayer(graphicLayer);
                map.setMapCursor("pointer");

                //初始一个覆盖物
                let textattr = { sign:"no" };
                let textpt = new esri.geometry.Point(1, 1);
                let textSymbol =  new esri.symbol.TextSymbol(" ");
                let textGraphic = new esri.Graphic(textpt, textSymbol,textattr);//创建图像
                graphicLayer.add(textGraphic);//把图像添加到刚才创建的图层上

                setTimeout(function(){
                    $(".esriControlsBR").hide();
                    $("#basemap_layers").children("svg").css("cursor","pointer");
                    $("#basemap_zoom_slider").css("display","none");
                    $("#searchMap_zoom_slider").css("display","none");
                    $(".actionsPane").css("display","none");
                },200);

                arcGisSelectArea();

            });

        };
        //高级搜索功能 选区操作
        function arcGisSelectArea() {
            //添加一个选区的div
            var container = document.createElement("div");
            container.className = "BMapLib_Drawing";
            //用来设置外层边框阴影
            var panel = this.panel = document.createElement("div");
            panel.className = "BMapLib_Drawing_panel";

            var panelattr = document.createAttribute("data-dojo-type");
            panelattr.value = "dijit/layout/ContentPane";
            panel.setAttributeNode(panelattr);

            var pattr = document.createAttribute("data-dojo-props");
            pattr.value = "region:'top'";
            panel.setAttributeNode(pattr);

            if (this.drawingToolOptions && this.drawingToolOptions.scale) {
                this._setScale(this.drawingToolOptions.scale);
            }
            container.appendChild(panel);

            var htmldata = '<a class="BMapLib_box BMapLib_circle" data-dojo-type="dijit/form/Button" drawingType="circle"'+
                ' href="javascript:void(0)" title="圆形选区" onfocus="this.blur()">'+
                '<span class="icon-circle"></span></a><br>'+
                '<a class="BMapLib_box BMapLib_polygon" data-dojo-type="dijit/form/Button" drawingType="polygon"'+
                ' href="javascript:void(0)" title="多边选区" onfocus="this.blur()">'+
                '<span class="icon-polygon-o"></span></a><br>';
            // 添加内容
            panel.innerHTML = htmldata;
            // 添加DOM元素到地图中
            $(container).appendTo($("#searchMap_root"));//basemap_container  basemap_root

            //样式的调整
            //$(".BMapLib_Drawing_panel").css("right","10px");
            $(".BMapLib_Drawing_panel").css("top","28px").css("left","10px");

            $(".BMapLib_box").on('click', function (e) {
                var drawingType = $(this).attr('drawingType');
                var boxs = $(".BMapLib_box").children("button").prevObject;

                for (var i = 0, len = boxs.length; i < len; i++) {
                    var box = boxs[i];
                    if (box.getAttribute('drawingType') === drawingType) {
                        var classStr = "BMapLib_box BMapLib_" + drawingType + "_hover";
                        if (i == len - 1) {
                            classStr += " BMapLib_last";
                        }
                        box.className = classStr;
                    } else {
                        box.className = box.className.replace(/_hover/, "");
                    }
                }

                activateTool(drawingType);
            });

            var toolbar = new esri.toolbars.Draw(map);
            toolbar.on("draw-complete", addToMapSelect);//draw-end

            function activateTool(drawingType) {
                if(drawingType === "circle"){//new esri.symbol.
                    var symbolCircle =  new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
                            new esri.Color([7,26,68,0.6]), 2),new esri.Color([7,26,68,0.5])
                    );
                    toolbar.setFillSymbol(symbolCircle);
                    toolbar.activate(esri.toolbars.Draw["CIRCLE"]);
                    map.hideZoomSlider();

                }
                if( drawingType === "polygon"){
                    var symbolPolygon =  new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new esri.Color([7,26,68,0.6]), 2),
                        new esri.Color([7,26,68,0.5]));
                    toolbar.setFillSymbol(symbolPolygon);

                    toolbar.activate(esri.toolbars.Draw["POLYGON"]);
                    map.hideZoomSlider();

                }
            }

            function addToMapSelect(evt) {

                var symbol;
                toolbar.deactivate();
                map.showZoomSlider();
                switch (evt.geometry.type) {
                    case "point":
                    case "multipoint":
                        symbol = new esri.symbol.SimpleMarkerSymbol();
                        break;
                    case "polyline":
                        symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([7,26,68,0.6]), 2),
                            new esri.Color([7,26,68,0.5]));
                        break;
                    default:
                        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([7,26,68,0.6]), 2),
                            new esri.Color([7,26,68,0.5]));
                        break;
                }
                var attr = {
                    sign:"toolbar",
                    multipleEntity:"null"
                };
                var graphic = new esri.Graphic(evt.geometry, symbol,attr);
                graphicLayer.add(graphic);

                //添加选区点击删除菜单
                graphicLayer.on("dbl-click", function (evt) {
                    map.disableDoubleClickZoom();   //禁用双击放大
                    if(evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign=="toolbar"){
                        $("#newDivdelMarker").remove();
                        var div = document.createElement("div");
                        div.setAttribute("id", "newDiv");
                        div.style.position = "absolute";
                        div.style.left = evt.clientX+15 + "px";
                        div.style.top = evt.clientY-50 + "px";
                        div.style.fontSize = "12px";

                        var svg = $("<div id='newDivdelMarker' class='newDivdelMarker'>删除选区</div>").appendTo(div);
                        $(div).appendTo($("#searchMap_container"));

                        $("#newDivdelMarker").bind("click",function () {
                            graphicLayer.remove(evt.graphic);
                            map.enableDoubleClickZoom();   //禁用双击放大
                            $("#newDivdelMarker").remove();
                        })
                    }
                })

                //把选区信息保存
                var geographicGeometry = evt.geographicGeometry;
                var lenUse = geographicGeometry.rings[0];
                var lonUse = [];
                var latUse = [];
                if(lenUse.length>3){
                    for(var i=0;i<lenUse.length-1;i++){
                        lonUse.push(parseFloat(lenUse[i][0]));
                        latUse.push(parseFloat(lenUse[i][1]));
                    }
                    lonUse.push(parseFloat(lenUse[0][0]));
                    latUse.push(parseFloat(lenUse[0][1]));
                }

                var selectAreaValue = {
                    "lon":lonUse,
                    "lat":latUse
                };
                mapAreaValue = [];//默认只能保留一个选区的信息
                mapAreaValue.push(selectAreaValue);

            }
        }
        //删除重点区域
        /**
         * @param delids 需要删除的区域的id数组
         */
        this.deleteOverlay = function (delids) {
          let areas = keyAreaLayer.graphics;
          let delarea = [];
          for(let d=0;d<delids.length;d++){
            for(let i=0;i<areas.length;i++){
              if(areas[i].attributes.hasOwnProperty("id")&&areas[i].attributes.id === delids[d]){
                delarea.push(areas[i]);
              }
            }
          }

          for(let i=0;i<delarea.length;i++){
            keyAreaLayer.remove(delarea[i]);//删除
          }

        };
        //卡口图层bayonetLayer
        this.bayonet = function(){
          if(bayonetSign){//隐藏 卡口图层
            bayonetLayer.clear();

            bayonetSign = false;
          }else{//显示卡口图层
            bayonetLayer.clear();//删除原来的卡口图层信息

            $.ajax({
              url: EPMUI.context.url + '/object/all/bayonet',
              type: 'POST',
              data: {

              },
              dataType: 'json',
              success: function (data) {
                if (data.code == "200") {
                  let addData = data.magicube_interface_data;
                  for(let k=0;k<addData.length;k++){
                    let bayonet = addMapOverlays(addData[k], "bayonet");
                  }
                }
              }
            });


            /*let returnBayonetData = [
              {
                gis: {
                  lon: 106.185281,
                  lat: 38.449092
                },
                address: "哈尔滨工业大学",
                id: "273F534A64EEB25B211565C5DEF3FEA2",
                name:"华容路卡口",
                nodeId:"68936086",
                objectType: "entity",
                page_type:"entity",
                type :"JKSB"
              },
              {
                gis: {
                  lon: 106.285281,
                  lat: 38.409092
                },
                address: "哈尔滨工业大学",
                id: "273F534A64EEB25B211565C5DEF3FEA2",
                name:"迎泽路卡口",
                nodeId:"68936086",
                objectType: "entity",
                page_type:"entity",
                type :"JKSB"
              },
              {
                gis: {
                  lon: 106.195281,
                  lat: 38.499092
                },
                address: "哈尔滨工业大学",
                id: "273F534A64EEB25B211565C5DEF3FEA2",
                name:"五一路卡口",
                nodeId:"68936086",
                objectType: "entity",
                page_type:"entity",
                type :"JKSB"
              }
            ];

            for(let k=0;k<returnBayonetData.length;k++){
              let bayonet = addMapOverlays(returnBayonetData[k], "bayonet");
            }*/

            bayonetSign = true;
          }

        };
        //表格加点
        this.addTablePoint = function(points){
          createMarkerLine(points, []);
        };
        // 加点功能
        this.addPoint = function (gisnodes,gislinks) {
            graphicLayer.clear();
            lineGraphicLayer.clear();
            createMarkerLine(gisnodes,gislinks);
        };
        //拖拽加点
        this.addOnePoint = function (gisDatas) {
            var arcGisStepValue = []; //保存该步骤所有数据变化
            if(gisDatas && gisDatas.hasOwnProperty("gis")){
                if(gisDatas.gis != null ){//&& !gisDatas.hasOwnProperty("nogis")
                    var haveMarker = mapRepeat(gisDatas,"marker");//去重
                    if(!haveMarker){
                        var conf = { type: "drag"};
                        var graphic = addMapOverlays(gisDatas, "addMarker", conf);//加点
                        var textGraphic = addMapOverlays(gisDatas,"addText",conf);//加文字标签
                        arcGisStepValue.push(graphic);
                        arcGisStepValue.push(textGraphic);

                        arcGisStep.push(arcGisStepValue);//保存上一步数据
                        arcGisType.push("add");//保存上一步操作类型
                        arcGisStepNum++;//保存上一步操作顺序数组的长度
                        //pointEvent();//给点添加事件
                        arcgisSetAggregation("reset");
                        //mapSaveLocalStorage();
                    }else{//存在该点，高亮该点
                        mapGraphicRC("checked", gisDatas.id);
                    }
                }else {
                    noGisPoints.push(gisDatas);
                }
            }
        };
        
        /**
         * 过滤器
         * @param relationArr
         * @param sign 根据sign选择过滤方式 relation：按照关系过滤  node 按照节点过滤
         */
        this.filterMapMarker = function (relationArr,sign){
            if(sign === "relation"){
                var selectedId = [];
                for(var j=0;j<relationArr.length;j++){
                    var linegraphics = lineGraphicLayer.graphics;
                    for(var i=0;i<linegraphics.length;i++){
                        if(linegraphics[i].hasOwnProperty("attributes")&&linegraphics[i].attributes.sign === "polyline"){//判断是一个线
                            if(relationArr[j] === linegraphics[i].attributes.relationTypeName){
                                selectedId.push(linegraphics[i].attributes.source.id);
                                selectedId.push(linegraphics[i].attributes.target.id);
                            }
                        }
                    }
                }
                //所有点都还原
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign === "true"){//判断是一个点.且选中
                        mapSetSymbol(graphics[k], "base");
                    }
                    if(graphics[k].attributes.sign === "text"){//点的名称
                        var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                        if(mapUseType === "use" || mapstyle === "white"){
                            textSymbol.setColor(new esri.Color([51,208,255,1]));
                        }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                        }
                        textSymbol.setOffset(35, 10);
                        graphics[k].setSymbol(textSymbol);

                    }
                }
                //选中
                for(var j=0;j<selectedId.length;j++){
                    for(var i=0;i<graphics.length;i++){
                        if(graphics[i].hasOwnProperty("attributes")){
                            if(graphics[i].attributes.hasOwnProperty("addnode")&&graphics[i].attributes.id === selectedId[j]){
                                mapSetSymbol(graphics[i], "click");
                            }
                            if(graphics[i].attributes.sign === "text"&&graphics[i].attributes.id === selectedId[j]){//点的名称
                                if(graphics[i].attributes.id === selectedId[j]){
                                    var textSymbol =  new esri.symbol.TextSymbol(graphics[i].attributes.name);
                                    textSymbol.setColor(new esri.Color([255,39,10,1]));
                                    textSymbol.setOffset(35, 10);
                                    graphics[i].setSymbol(textSymbol);
                                }
                            }
                        };
                    }
                }

                //节点过滤
            }else if(sign === "node"){
                //把所有点还原
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign === "true"){//判断是一个点.且选中
                        mapSetSymbol(graphics[k], "base");
                    }
                    if(graphics[k].attributes.sign === "text"){//文字标签
                        var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                        if(mapUseType === "use" || mapstyle === "white"){
                            textSymbol.setColor(new esri.Color([51,208,255,1]));
                        }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                        }
                        textSymbol.setOffset(35, 10);
                        graphics[k].setSymbol(textSymbol);
                    }
                }
                //选中
                for(var j=0;j<relationArr.length;j++){
                    for(var i=0;i<graphics.length;i++){
                        if(graphics[i].attributes.hasOwnProperty("addnode")){
                            if(graphics[i].attributes.id === relationArr[j]){
                                mapSetSymbol(graphics[i], "click");
                            }
                        };
                        if(graphics[i].attributes.sign === "text"){//点的名称
                            if(graphics[i].attributes.id === relationArr[j]){
                                var textSymbol =  new esri.symbol.TextSymbol(graphics[i].attributes.name);
                                textSymbol.setColor(new esri.Color([255,39,10,1]));
                                textSymbol.setOffset(35, 10);
                                graphics[i].setSymbol(textSymbol);
                            }
                        }
                    }
                }
            }

        }
        //后退功能
        this.backStep = function (){
            /*var arcGisStep = [];//保存上一步数据
             var arcGisType = [];//保存上一步操作类型
             var arcGisStepNum = 0;//保存上一步操作顺序数组的长度*/

            if(arcGisStepNum>0){
                if(arcGisType[arcGisStepNum-1] === "add"){//删除对应点
                    //backStep();//工作台联动
                    var del = arcGisStep[arcGisStepNum-1];
                    for(var i=0;i<del.length;i++){
                        graphicLayer.remove(del[i]);
                    }
                    for(var i=0;i<del.length;i++){
                        if(del[i].attributes.hasOwnProperty("sign")&&(del[i].attributes.sign === "polyline")){
                            lineGraphicLayer.remove(del[i]);
                        }
                    }
                    // 数组变化
                    arcGisStep.splice(arcGisStepNum-1,1);
                    arcGisType.splice(arcGisStepNum-1,1);
                    arcGisStepNum = arcGisStepNum-1;
//graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign == "polyline"||graphics[k].attributes.sign == "polylinetext"
                }else if(arcGisType[arcGisStepNum-1]==="dragadd"){//删除拖拽点
                    var del = arcGisStep[arcGisStepNum-1];
                    for(var i=0;i<del.length;i++){
                        graphicLayer.remove(del[i]);
                    }
                    // 数组变化
                    arcGisStep.splice(arcGisStepNum-1,1);
                    arcGisType.splice(arcGisStepNum-1,1);
                    arcGisStepNum = arcGisStepNum-1;

                }else if(arcGisType[arcGisStepNum-1]==="del"){//还原对应点 线
                    //backStep();//工作台联动
                    var del = arcGisStep[arcGisStepNum-1];
                    for(var i=0;i<del.length;i++){
                        if(del[i].attributes.hasOwnProperty("sign")&&(del[i].attributes.sign !== "polyline")){
                            graphicLayer.add(del[i]);
                        }
                    }
                    for(var i=0;i<del.length;i++){
                        if(del[i].attributes.hasOwnProperty("sign")&&(del[i].attributes.sign === "polyline")){
                            lineGraphicLayer.add(del[i]);
                        }
                    }
                    // 数组变化
                    arcGisStep.splice(arcGisStepNum-1,1);
                    arcGisType.splice(arcGisStepNum-1,1);
                    arcGisStepNum = arcGisStepNum-1;

                }

            }

            arcgisSetAggregation("reset");  //聚合
            //mapSaveLocalStorage();
        };
        //清屏功能
        this.resetscreen = function (){
            arcgisSetAggregation("del");//关闭聚合
            graphicLayer.clear();
            bayonetLayer.clear();
            lineGraphicLayer.clear();
            keyAreaLayer.clear();
            aSGraphicLayer.clear();
            areaStatisticsData = [];
            if(clusterLayerSign){
                //map.removeLayer(clusterLayer);
            }
            localStorage.removeItem("mapOverlays");

        };
        //搜索后，点的颜色变化
        this.searchNodes = function (){

            var graphics = graphicLayer.graphics;
            let val = $(".map_nodes_find").val();
            let markers = [];

            let searchnodes = "no";

            if(val){
              graphics.forEach(lay => {
                if(lay.attributes.hasOwnProperty("addnode")){
                  markers.push(lay);
                }
              });

              searchnodes = markers.filter(function(d){
                return d.attributes.name.indexOf(val)>-1?true:false;
              });
            }

            if(searchnodes === "no"){
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign !== "move"){//判断是一个点.且选中
                        mapSetSymbol(graphics[k], "base");
                    }
                    if(graphics[k].attributes.sign === "text"){//点的名称
                        //文字标签
                        var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                        if(mapUseType === "use" || mapstyle === "white"){
                            textSymbol.setColor(new esri.Color([51,208,255,1]));
                        }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                        }
                        textSymbol.setOffset(35, 10);
                        graphics[k].setSymbol(textSymbol);
                    }
                }
            }else {
                //还原
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign !== "move"){//判断是一个点
                        mapSetSymbol(graphics[k], "base");
                    }
                    if(graphics[k].attributes.sign === "text"){//点的名称
                        //文字标签
                        var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                        if(mapUseType === "use" || mapstyle === "white"){
                            textSymbol.setColor(new esri.Color([51,208,255,1]));
                        }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                        }
                        textSymbol.setOffset(35, 10);
                        graphics[k].setSymbol(textSymbol);
                    }
                }

                for(var k=0;k<graphics.length;k++){
                    for(var j=0;j<searchnodes.length;j++){
                        if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign !== "move") {//判断是一个点
                            if(graphics[k].attributes.id===searchnodes[j].attributes.id){
                                var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-click.svg", 25, 30);
                                symbol1.clickSign = "true";
                                graphics[k].setSymbol(symbol1);
                            }
                        }

                        if(graphics[k].attributes.sign === "text"){//点的名称
                            if(graphics[k].attributes.id === searchnodes[j].attributes.id){
                                var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                                textSymbol.setColor(new esri.Color([255,39,10,1]));
                                textSymbol.setOffset(35, 10);
                                graphics[k].setSymbol(textSymbol);
                            }
                        }
                    }

                }
            }

        };
        //重点区域表确定点击后添加重点区域
        this.gisTableKeyArea = function (returnData){
          let styleOptions = {
            strokeColor:"#A52A2A",    //边线颜色。#33d0ff#EEEEE0 #5c7a96
            fillColor:"#A52A2A",      //填充颜色。当参数为空时，圆形将没有填充效果。 B22222  A52A2A 8B1A1A
            strokeWeight: 2,       //边线的宽度，以像素为单位。
            strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
            fillOpacity: 0.7,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid' //边线的样式，solid或dashed。
          };
          //点击显示重点区域
          for(let i=0;i<returnData.length;i++){
            if(returnData[i].shape === "polygon"){//画方形 //"circle"  "polygon"
              let myPolygon = {
                "geometry":{
                  "rings":[returnData[i].gisPointsStr],
                  "spatialReference":{
                    "wkid":4326
                  }
                },
                "symbol":{
                  "color":[165,42,42,64],
                  "outline":{
                    "color":[165,42,42,255],
                    "width":1,
                    "type":"esriSLS",
                    "style":"esriSLSSolid"
                  },
                  "type":"esriSFS",
                  "style":"esriSFSSolid"
                }
              };
              let keyAreaGraphic = new esri.Graphic(myPolygon);
              let attr = {
                "peopleMove":false,
                "analyse":false,
                "id":returnData[i].id,
                "gisPointsStr":returnData[i].gisPointsStr,
                "type": returnData[i].shape

              };
              keyAreaGraphic.setAttributes(attr);
              keyAreaLayer.add(keyAreaGraphic);
              keyAreaEvent();
            }
          }

        };

        //地图区域划分
        function setMapArea(){
            for(var j=0;j<1;j++){//mapJson.length
                var features = mapJson[j].features;
                for(var k=0;k<features.length;k++){
                    var mapAreaDatas = features[k].geometry.coordinates[0];

                    for(var i=1;i<mapAreaDatas.length;i++){
                        var polylineJson = {
                            "paths":[[
                                [mapAreaDatas[i][0],mapAreaDatas[i][1]],
                                [mapAreaDatas[i-1][0],mapAreaDatas[i-1][1]]
                            ]]
                        };

                        //"spatialReference":{"wkid":4326}
                        var polyline = new esri.geometry.Polyline(polylineJson);

                        var lineSymbol = new esri.symbol.SimpleLineSymbol();
                        lineSymbol.setColor(new esri.Color([32,43,51,0.6]));
                        lineSymbol.setWidth(0.6);

                        var lineAttr = {
                            sign:"mapArea"
                        }

                        var graphicLine = new esri.Graphic(polyline, lineSymbol, lineAttr);
                        mapAreaGraphicLayer.add(graphicLine);
                    }
                }
            }

        }
        //左侧搜索框
        window.mapSearchResult = function (datasetid) {
          if(!mapSmallSign&&!mapHeatSign) {
            mapGraphicRC("checked", datasetid);
          }
        };
        //加点，加线，加文字标签，设置点图标样式
        function addMapOverlays(overlays, sign, conf){
            if(overlays.name === "大黄蜂攻击机" || overlays.name === "CVN-76航母"){
              overlays.gis.lon = 129.9053299;
              overlays.gis.lat = 24.9099573;
            }
            if(sign === "addMarker"){
                var gisnodes = overlays;
                var pt = new esri.geometry.Point(gisnodes.gis.lon, gisnodes.gis.lat);
                //设置标注显示的图标
                var symbol1;
                if(conf.type === "add"){
                    symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
                    symbol1.clickSign = "false";
                }else if(conf.type === "drag"){
                    //所有点都还原
                    mapGraphicRC("restore");
                    symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-click.svg", 25, 30);
                    symbol1.clickSign = "true";
                }

                //要在模版中显示的参数
                var attr = {
                    addnode:true,
                    gis:gisnodes.gis,
                    id:gisnodes.id,
                    name:gisnodes.name,
                    nodeId:gisnodes.nodeId,
                    objectType:gisnodes.objectType,
                    page_type:gisnodes.page_type,
                    type:gisnodes.type,
                    sign:"marker",
                    baseMsg:gisnodes
                };
                //创建图像
                var graphic = new esri.Graphic(pt, symbol1,attr);
                //把图像添加到刚才创建的图层上
                graphicLayer.add(graphic);
                return graphic;
            }
            if(sign === "addText"){
                var gisnodes = overlays;
                //加文字标签
                var textattr = {
                    gis:gisnodes.gis,
                    id:gisnodes.id,
                    name:gisnodes.name,
                    nodeId:gisnodes.nodeId,
                    page_type:gisnodes.page_type,
                    objectType:gisnodes.objectType,
                    type:gisnodes.type,
                    sign:"text"
                };
                var textpt = new esri.geometry.Point(gisnodes.gis.lon, gisnodes.gis.lat);
                var textSymbol =  new esri.symbol.TextSymbol(gisnodes.name);
                if(mapUseType === "use" || mapstyle !== "black"){
                    textSymbol.setColor(new esri.Color([255,39,10,1]));
                }else{
                    textSymbol.setColor(new esri.Color([255,39,10,1]));
                }
                if(conf.type === "drag"){
                    textSymbol.setColor(new esri.Color([255,39,10,1]));
                }
                textSymbol.setOffset(35, 10);
                //创建图像
                var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);
                //把图像添加到刚才创建的图层上
                graphicLayer.add(textGraphic);
                !mapFontStatus ? textGraphic.hide() : null;
                return textGraphic;
            }
            if(sign === "addLine"){
                var gislinks = overlays;
                var curvepath = mapCommonPart.getCurveByTwoPoints(gislinks.source, gislinks.target, conf.lineSizeNum);
                var paths = [];
                for(var i=0;i<curvepath.length;i++){
                    var newpath = [curvepath[i].lon,curvepath[i].lat];
                    paths.push(newpath);
                }

                var polylineJson = {
                    "paths":[paths],
                    "spatialReference":{"wkid":4326}
                };

                var polyline = new esri.geometry.Polyline(polylineJson);
                var strokeColor = lineNames.length > 1 ? mapLineColor[lineNames.indexOf(overlays.relationParentType)]:'#A5ABB6';
                //let linestyle = {strokeColor:strokeColor, strokeWeight:1, strokeOpacity:0.8};
                var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_LONGDASH,
                    new esri.Color(strokeColor),
                    1);//[253,221,155,1]
                if(mapUseType === "use" || mapstyle === "white"){
                    lineSymbol.setColor(new esri.Color(strokeColor));//[0,51,153,1]
                }else{
                    lineSymbol.setColor(new esri.Color(strokeColor));//[253,221,155,1]
                }
                lineSymbol.setWidth(1);

                var lineAttr = {
                    relationId:gislinks.relationId,
                    relationParentType:gislinks.relationParentType,
                    relationTypeName: gislinks.relationTypeName,
                    time:gislinks.time,
                    source:gislinks.source,
                    target:gislinks.target,
                    tag:gislinks.tag,
                    sign:"polyline",
                    lineSizeNum:conf.lineSizeNum
                };

                var graphicLine = new esri.Graphic(polyline, lineSymbol, lineAttr);
                lineGraphicLayer.add(graphicLine);

                //加文字标签
                var centerNum = parseInt(curvepath.length/2);
                var lineCenter = curvepath[centerNum];

                var textattr = {
                    relationTypeName: gislinks.relationTypeName,
                    time:gislinks.time,
                    source:gislinks.source,
                    target:gislinks.target,
                    sign:"polylinetext",
                    polyline:graphicLine,
                    relationId:gislinks.relationId

                };

                var textpt = new esri.geometry.Point(lineCenter.lon, lineCenter.lat);
                var textSymbol =  new esri.symbol.TextSymbol(gislinks.relationTypeName);
                if(mapUseType === "use" || mapstyle === "white"){
                    textSymbol.setColor(new esri.Color([0,51,153,1]));
                }else{
                    textSymbol.setColor(new esri.Color([255,255,255,1]));
                }
                textSymbol.setAlign(esri.symbol.Font.ALIGN_START);
                textSymbol.setFont( new esri.symbol.Font("12pt"));

                //创建图像
                var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);
                //把图像添加到刚才创建的图层上
                graphicLayer.add(textGraphic);

                var returndata = {
                    graphicLine:graphicLine,
                    textGraphic:textGraphic
                };
                !mapLineStatus ? graphicLine.hide() : null;
                !mapFontStatus ? textGraphic.hide() : null;
                return returndata;
            }
            if(sign === "bayonet"){
              var gisnodes = overlays;
              var pt = new esri.geometry.Point(gisnodes.gis.lon, gisnodes.gis.lat);
              //设置标注显示的图标
              var symbol1;
              symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
              symbol1.clickSign = "false";

              //要在模版中显示的参数
              var attr = {
                addnode:true,
                gis:gisnodes.gis,
                id:gisnodes.id,
                name:gisnodes.name,
                nodeId:gisnodes.nodeId,
                page_type:gisnodes.page_type,
                objectType:gisnodes.objectType,
                type:gisnodes.type,
                sign:"marker",
                baseMsg:gisnodes
              };
              //创建图像
              var graphic = new esri.Graphic(pt, symbol1,attr);
              //把图像添加到刚才创建的图层上
              graphicLayer.add(graphic);

              //加文字标签
              var textattr = {
                gis:gisnodes.gis,
                id:gisnodes.id,
                name:gisnodes.name,
                nodeId:gisnodes.nodeId,
                objectType:gisnodes.objectType,
                type:gisnodes.type,
                sign:"text"
              };
              var textpt = new esri.geometry.Point(gisnodes.gis.lon, gisnodes.gis.lat);
              var textSymbol =  new esri.symbol.TextSymbol(gisnodes.name);
              if(mapUseType === "use" || mapstyle !== "black"){
                textSymbol.setColor(new esri.Color([255,39,10,1]));
              }else{
                textSymbol.setColor(new esri.Color([255,39,10,1]));
              }
              textSymbol.setOffset(35, 10);
              //创建图像
              var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);
              //把图像添加到刚才创建的图层上
              graphicLayer.add(textGraphic);
              !mapFontStatus ? textGraphic.hide() : null;

              return graphic;
            }
            if(sign === "bayonetMV"){

              let XYdata = turnSpace(new esri.geometry.Point(overlays.gis.lon, overlays.gis.lat),"toScreen");// 屏幕距离

              let areaContent = `<div class="gis-bayonet-table-surveillance-show">
                      <div> 
                        <div>
                          <div style="margin-left: 0px">
                              <video width="298px" height="140" controls="controls">
                                <source src="/image/gis/ssjk1.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                          </div>
                        </div>
                        <div>
                          <div>
                            <div class="gis-bayonet-table-surveillance-show-btn" id="gis-bayonet-table-surveillance-show-btn">x</div>
                          </div>
                        </div>
                      </div>
                     </div>`;

              //添加div
              var div = document.createElement("div");
              div.setAttribute("id", "bayonetMVDiv");
              div.style.position = "absolute";
              div.style.left = XYdata.x + "px";
              div.style.top = XYdata.y + "px";
              div.style.fontSize = "12px";

              $(div).append(areaContent);
              $(div).appendTo($("#basemap_container"));

              $(".gis-bayonet-table-surveillance-show").css("width", "320px").css("height", "160px").css("display", "block");
              $(".gis-bayonet-table-surveillance-show-btn").css("position", "absolute").css("top", "2px").css("right", "2px");
              //关闭实时监控
              $(".gis-bayonet-table-surveillance-show-btn").unbind("click").bind("click",function () {
                $(this).parent().parent().parent().parent().remove();
                map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
                map.enableDoubleClickZoom();//启用鼠标双击放大
                map.enablePan();//允许平移地图
              });

              //移动条
              $(".gis-bayonet-table-surveillance-show").mousedown(function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).css('position','absolute');
                mapCommonPart.surveillanceDragBar(this, event);
              });

            }
        }
        //去重
        function mapRepeat(lay,sign){
            if(sign === "marker"){
                var graphics = graphicLayer.graphics;
                var haveMarker = false;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                        if(graphics[k].attributes.id === lay.id){
                            haveMarker = true;
                        }
                    }
                }
                return haveMarker;
            }

            if(sign === "line"){
                var graphics = lineGraphicLayer.graphics;
                var haveLine = false;//去重
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline"){//判断是一个线
                        if((graphics[k].attributes.source.id === lay.source.id&&graphics[k].attributes.target.id === lay.target.id)||(graphics[k].attributes.source.id == lay.target.id&&graphics[k].attributes.target.id == lay.source.id)){
                            haveLine = true;
                        }
                    }
                }
                return haveLine;
            }

            if(sign === "curve"){
                var graphics = lineGraphicLayer.graphics;
                /*var haveLine = false;//去重
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign == "polyline"){//判断是一个线
                        if((graphics[k].attributes.source.id == lay.source.id&&graphics[k].attributes.target.id == lay.target.id)&&graphics[k].attributes.relationTypeName == lay.relationTypeName){
                            haveLine = true;
                        }
                    }
                }
                return haveLine;*/

                var lineAll = [];
                var haveCurve = false;
                for(var j=0;j<graphics.length;j++) {
                    if (graphics[j].hasOwnProperty("attributes")&&graphics[j].attributes.hasOwnProperty("sign")&&graphics[j].attributes.sign === "polyline") {
                        if((graphics[j].attributes.source.id === lay.source.id&&graphics[j].attributes.target.id === lay.target.id)||(graphics[j].attributes.source.id === lay.target.id&&graphics[j].attributes.target.id === lay.source.id)){
                            //id相同时，比较关系名称是否相同
                            haveCurve = true;
                            lineAll.push(graphics[j]);
                        }
                    }
                }

                if(haveCurve && lay.hasOwnProperty("relationName")){
                    for(var n=0;n<lineAll.length;n++){
                        if((lineAll[n].attributes.source.id === lay.source.id&&lineAll[n].attributes.target.id === lay.target.id)&&lineAll[n].attributes.relationTypeName === lay.relationTypeName){
                            return "have";
                        }
                    }
                    return lineAll;
                }
                if(haveCurve && lay.hasOwnProperty("relationTypeName")){
                    for(var n=0;n<lineAll.length;n++){
                        if((lineAll[n].attributes.source.id === lay.source.id&&lineAll[n].attributes.target.id === lay.target.id)&&lineAll[n].attributes.relationTypeName === lay.relationTypeName){
                            return "have";
                        }
                    }
                    return lineAll;
                }

                return false;
            }

        }
        //加点 线
        function createMarkerLine(gisnodes,gislinks){
            gislinks.forEach(link => lineNames.push(link.relationParentType));
            lineNames = [...new Set(lineNames)];
            var arcGisStepValue = []; //保存该步骤所有数据变化
            for(var i=0;i<gisnodes.length;i++){
                var haveMarker = mapRepeat(gisnodes[i],"marker");//去重
                if(!haveMarker){
                    if(gisnodes[i].gis != null){// && !gisnodes[i].hasOwnProperty("nogis")
                        var conf = { type: "add"};
                        var graphic;
                        var textGraphic;
                        if(gisnodes[i].type === EPMUI.context.gis.bayonet){
                          graphic = addMapOverlays(gisnodes[i],"bayonet");//加点
                        }else{
                          graphic = addMapOverlays(gisnodes[i],"addMarker",conf);//加点
                          textGraphic = addMapOverlays(gisnodes[i],"addText",conf);//加文字标签
                        }

                        arcGisStepValue.push(graphic);
                        arcGisStepValue.push(textGraphic);
                    }else{
                        noGisPoints.push(gisnodes[i]);
                    }
                }
            }
            //加连线
            for(var i=0;i<gislinks.length;i++){
                //var haveLine = mapRepeat(gislinks[i],"line");//去重
                var haveLine = mapRepeat(gislinks[i],"curve");//去重
                var lineSizeNum = haveLine ? haveLine.length : 170;//根据这个 判断线条是直线还是曲线，直线数值170
                if(haveLine !== "have"){
                    var conf = { lineSizeNum : lineSizeNum };
                    if((gislinks[i].source.gis != null)&&(gislinks[i].target.gis != null)){// && !gislinks[i].hasOwnProperty("nogis")
                        var returndata = addMapOverlays(gislinks[i],"addLine", conf);//加线
                        arcGisStepValue.push(returndata.graphicLine);
                        arcGisStepValue.push(returndata.textGraphic);
                    }
                }
            }
            arcGisStep.push(arcGisStepValue);//保存上一步数据
            arcGisType.push("add");//保存上一步操作类型
            arcGisStepNum++;//保存上一步操作顺序数组的长度
        }
        //删除点 -线
        function deleteMarker(delgraphic){
            var  arcGisStepValue = [];//保存该步骤数据的操作
            var ids = [];
            for(var n=0;n<delgraphic.length;n++){
                ids.push(delgraphic[n].attributes.id);

                var delCurveText = [];
                var delText = [];
                arcGisStepValue.push(delgraphic[n]);
                var graphics = graphicLayer.graphics;
                for(var i=0;i<graphics.length;i++){
                    if(graphics[i].attributes.hasOwnProperty("sign")){
                        if(graphics[i].attributes.sign === "polylinetext"){
                            if(graphics[i].attributes.source.id === delgraphic[n].attributes.id || graphics[i].attributes.target.id === delgraphic[n].attributes.id){
                                delCurveText.push(graphics[i]);
                                arcGisStepValue.push(graphics[i]);
                            }
                        }
                        if(graphics[i].attributes.sign === "text"){
                            if(graphics[i].attributes.id === delgraphic[n].attributes.id){
                                delText.push(graphics[i]);
                                arcGisStepValue.push(graphics[i]);
                            }
                        }
                    }
                }

                var graphics = lineGraphicLayer.graphics;
                var delcurve = [];
                for(var i=0;i<graphics.length;i++){
                    if(graphics[i].attributes.hasOwnProperty("sign")&&graphics[i].attributes.sign === "polyline"){
                        if(graphics[i].attributes.source.id===delgraphic[n].attributes.id||graphics[i].attributes.target.id===delgraphic[n].attributes.id){
                            delcurve.push(graphics[i]);//把需要删除的线，放数组中
                            arcGisStepValue.push(graphics[i]);
                        }
                    }
                }

                var graphics = bayonetLayer.graphics;
                var delbayonet = [];
                for(var i=0;i<graphics.length;i++){
                  if(graphics[i].attributes.hasOwnProperty("id")&&graphics[i].attributes.id === delgraphic[n].attributes.id){
                    delbayonet.push(graphics[i]);//把需要删除的卡口，放数组中
                    arcGisStepValue.push(graphics[i]);
                  }
                }

                //删除点上文字
                for(var i=0;i<delText.length;i++){
                    graphicLayer.remove(delText[i]);//删除点上文字
                }
                //删除线上文字
                for(var i=0;i<delCurveText.length;i++){
                    graphicLayer.remove(delCurveText[i]);//删除线上文字
                }
                //删除线
                for(var i=0;i<delcurve.length;i++){
                    lineGraphicLayer.remove(delcurve[i]);
                }
                //删除卡口
                for(var i=0;i<delbayonet.length;i++){
                    bayonetLayer.remove(delbayonet[i]);
                }
                //删除点
                graphicLayer.remove(delgraphic[n]);

            }

            //工作台nodes移除
            //globalFuction.deleteMapNode(ids);

            arcGisStep.push(arcGisStepValue);//保存上一步数据
            arcGisType.push("del");//保存上一步操作类型
            arcGisStepNum++;//保存上一步操作顺序数组的长度

        }
        //覆盖物的操作事件
        function pointEvent() {
            graphicLayer.on("mouse-over", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if(!mapSmallSign&&!mapHeatSign){
                    if (evt.graphic.attributes.hasOwnProperty("addnode")&&evt.graphic.symbol.clickSign == "false") {
                        mapSetSymbol(evt.graphic, "hover");
                    }
                    if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                        var lineHide = setTimeout(function(){
                            var lineGraphics = lineGraphicLayer.graphics;
                            for(var k=0;k<lineGraphics.length;k++){
                                var attr = lineGraphics[k].attributes;
                                if(attr.hasOwnProperty("sign")&&(attr.sign === "polyline")&&mapLineStatus){
                                    if(attr.source.id===evt.graphic.attributes.id||attr.target.id===evt.graphic.attributes.id){
                                        lineGraphics[k].show();
                                    }else{
                                        lineGraphics[k].hide();
                                    }
                                }
                            }
                            var graphics = graphicLayer.graphics;
                            for(var k=0;k<graphics.length;k++){
                                var graphAttr = graphics[k].attributes;
                                if(graphAttr.hasOwnProperty("sign")&&(graphAttr.sign === "polylinetext")&&mapFontStatus&&mapLineStatus){
                                    if(graphAttr.source.id===evt.graphic.attributes.id||graphAttr.target.id===evt.graphic.attributes.id){
                                        graphics[k].show();
                                    }else{
                                        graphics[k].hide();
                                    }
                                }
                            }
                        },1000);
                        lineShowHideTime.push(lineHide);
                    }
                }
            });
            graphicLayer.on("mouse-out", function (evt) {
                if(!mapSmallSign&&!mapHeatSign){
                    if (evt.graphic.attributes.hasOwnProperty("addnode")&&evt.graphic.symbol.clickSign === "false") {
                        mapSetSymbol(evt.graphic, "base");
                    }
                    if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                        lineShowHideTime.forEach(linetime => clearTimeout(linetime));
                        var graphics = lineGraphicLayer.graphics;
                        for(var k=0;k<graphics.length;k++){
                            var lineGraphic = graphics[k].attributes;
                            if(lineGraphic.hasOwnProperty("sign")&&lineGraphic.sign === "polyline"&&mapLineStatus){//直线显示
                                graphics[k].show();
                            }
                        }
                        var graphics = graphicLayer.graphics;
                        for(var k=0;k<graphics.length;k++){
                            var gra = graphics[k].attributes;
                            if(gra.hasOwnProperty("sign")&&(gra.sign === "text") && mapFontStatus ){//文字显示
                                graphics[k].show();
                            }
                            if(gra.hasOwnProperty("sign")&&(gra.sign === "polylinetext") && mapFontStatus && mapLineStatus){//线上文字显示
                                graphics[k].show();
                            }
                        }
                    }
                    if(evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign === "CurvePoint") {//判断是轨迹点
                        setTimeout(function(){
                            $(".address_indiv").css("width","20px").css("height","20px");
                        },100);
                        setTimeout(function(){
                            $("#newDiv").remove();
                        },600);
                    }
                }
            });
            graphicLayer.on("click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                    getBaseMessage(true,evt.graphic.attributes.id, evt.graphic.attributes.type, true);//基础信息展示
                }
                // 如果是shift 状态， 保存graphic
                if(!mapSmallSign&&!mapHeatSign){
                    if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                        //所有点都还原
                        var graphics = graphicLayer.graphics;
                        for(var k=0;k<graphics.length;k++){//判断是一个点.且选中
                            if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign === "true"){
                               if(shiftSign){// shift 状态，让其 shiftGraphic 的图标选中
                                    var haveInShift = false;
                                    for(var n=0;n<shiftGraphic.length;n++){
                                        if(shiftGraphic[n].attributes.id === graphics[k].attributes.id){
                                            haveInShift = true;
                                        }
                                    }
                                    haveInShift ? mapSetSymbol(graphics[k], "click") : mapSetSymbol(graphics[k], "base");
                               }else{
                                    mapSetSymbol(graphics[k], "base");
                               }
                            }
                            if(graphics[k].attributes.sign === "text"){//点的名称
                                //$(evt.target.nextElementSibling).parent().children("text").css("fill","white");
                                if(graphics[k].attributes.id === evt.graphic.attributes.id){
                                    var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                                    textSymbol.setColor(new esri.Color([0,0,255,1]));
                                    textSymbol.setOffset(35, 10);
                                    graphics[k].setSymbol(textSymbol);
                                }else{
                                    //文字标签
                                    var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                                    if(mapUseType === "use" || mapstyle !== "black"){
                                        textSymbol.setColor(new esri.Color([255,39,10,1]));
                                    }else{
                                        textSymbol.setColor(new esri.Color([255,255,255,1]));
                                    }
                                    textSymbol.setOffset(35, 10);
                                    graphics[k].setSymbol(textSymbol);
                                }
                            }
                        }
                        if(evt.graphic.symbol.clickSign !== "move"){
                            mapSetSymbol(evt.graphic, "click");
                            if(shiftSign){
                                //去重
                                var haveShiftGraphic = false;
                                for(var y=0;y<shiftGraphic.length;y++){
                                    if(shiftGraphic[y].attributes.id === evt.graphic.attributes.id){
                                        haveShiftGraphic = true;
                                    }
                                }
                                if(!haveShiftGraphic){
                                    shiftGraphic.push(evt.graphic);
                                }
                            }
                        }
                    }
                    if(evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign === "CurvePoint"){//判断是轨迹点
                        /*var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle.png", 20, 20);
                        symbol1.clickSign = "false";
                        evt.graphic.setSymbol(symbol1);*/
                        evt.graphic.show();
                        $("#newDiv").remove();
                        var content = "<div class='address_indiv'>"+
                            "坐标信息：<div class='address_div' >"+ evt.graphic.attributes.address +"</div> "+
                            "<div class='dbl_topleft'></div><div class='address_bottomright'></div></div>";

                        var div = document.createElement("div");
                        div.setAttribute("id", "newDiv");
                        div.style.position = "absolute";
                        div.style.left = evt.clientX+20 + "px";
                        div.style.top = evt.clientY-45 + "px";
                        div.style.fontSize = "12px";

                        var svg = $(content).appendTo(div);

                        $(div).appendTo($("#basemap_container"));

                        $(".address_indiv").css("height","20px").css("width","20px");
                        setTimeout(function(){
                            $(".address_indiv").css("width","150px").css("height","60px");
                        },100);

                    }
                }

            });
            graphicLayer.on("dbl-click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (!mapSmallSign&&!mapHeatSign&&evt.graphic.attributes.hasOwnProperty("addnode")) {
                    mapdisk = true;
                    var conf = {
                        thisMarker:evt,//这个还是问题
                        markerId:evt.graphic.attributes.id,
                        gis:evt.graphic.attributes.gis,
                        nodeId:evt.graphic.attributes.nodeId,
                        nodeType:evt.graphic.attributes.type,
                        page_type:evt.graphic.attributes.page_type,
                        objectType:evt.graphic.attributes.objectType,
                        getLeft:evt.clientX - 217 - 30,
                        getTop:evt.clientY - 269 - 27
                    };

                    d3.selectAll("#newDiv").remove();
                    setmapProperty("null","zoom-false","dbl-false");

                    mapCommon.mapWorkMarker = [];
                    mapCommon.mapWorkMarker.push(evt);
                    mapCommonPart.topomenu(conf);


                    map.disableScrollWheelZoom();//禁用鼠标滚轮
                    map.disableDoubleClickZoom();//禁用双击放大
                    map.disablePan();//禁止平移地图

                    if(evt.graphic.attributes.type === EPMUI.context.gis.bayonet){
                      mapCommonPart.topomenu(conf,"kkmenu");
                    }else{
                      mapCommonPart.topomenu(conf,"topomenu");
                    }

                }
                //是选区的时候操作
                if(!mapSmallSign&&!mapHeatSign&&evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign==="toolbar"){
                    d3.selectAll("#newDiv").remove();
                    map.disableScrollWheelZoom();//禁止鼠标滚轮
                    map.disableDoubleClickZoom();//禁止双击放大
                    map.disablePan();//禁止平移地图

                    var conf = {
                        thisClick:evt,
                        areaLays:evt
                    };
                    mapCommon.mapWorkArea = {};
                    mapCommon.mapWorkArea = {
                        thisClick:evt,
                        areaLays:evt
                    };
                    mapCommonPart.menu(conf,"areamenu");
                    //if end ...
                }
            });

            bayonetLayer.on("mouse-over", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if(!mapSmallSign&&!mapHeatSign){
                  if (evt.graphic.attributes.hasOwnProperty("addnode")&&evt.graphic.symbol.clickSign === "false") {
                    mapSetSymbol(evt.graphic, "hover");
                  }
                  if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                    var lineHide = setTimeout(function(){
                      var lineGraphics = lineGraphicLayer.graphics;
                      for(var k=0;k<lineGraphics.length;k++){
                        var attr = lineGraphics[k].attributes;
                        if(attr.hasOwnProperty("sign")&&(attr.sign === "polyline")&&mapLineStatus){
                          if(attr.source.id===evt.graphic.attributes.id||attr.target.id===evt.graphic.attributes.id){
                            lineGraphics[k].show();
                          }else{
                            lineGraphics[k].hide();
                          }
                        }
                      }
                      var graphics = bayonetLayer.graphics;
                      for(var k=0;k<graphics.length;k++){
                        var graphAttr = graphics[k].attributes;
                        if(graphAttr.hasOwnProperty("sign")&&(graphAttr.sign === "polylinetext")&&mapFontStatus&&mapLineStatus){
                          if(graphAttr.source.id===evt.graphic.attributes.id||graphAttr.target.id===evt.graphic.attributes.id){
                            graphics[k].show();
                          }else{
                            graphics[k].hide();
                          }
                        }
                      }
                    },1000);
                    lineShowHideTime.push(lineHide);
                  }
                }
              });
            bayonetLayer.on("mouse-out", function (evt) {
                if(!mapSmallSign&&!mapHeatSign){
                  if (evt.graphic.attributes.hasOwnProperty("addnode")&&evt.graphic.symbol.clickSign === "false") {
                    mapSetSymbol(evt.graphic, "base");
                  }
                  if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                    lineShowHideTime.forEach(linetime => clearTimeout(linetime));
                    var graphics = lineGraphicLayer.graphics;
                    for(var k=0;k<graphics.length;k++){
                      var lineGraphic = graphics[k].attributes;
                      if(lineGraphic.hasOwnProperty("sign")&&lineGraphic.sign === "polyline"&&mapLineStatus){//直线显示
                        graphics[k].show();
                      }
                    }
                    var graphics = bayonetLayer.graphics;
                    for(var k=0;k<graphics.length;k++){
                      var gra = graphics[k].attributes;
                      if(gra.hasOwnProperty("sign")&&(gra.sign === "text") && mapFontStatus ){//文字显示
                        graphics[k].show();
                      }
                      if(gra.hasOwnProperty("sign")&&(gra.sign === "polylinetext") && mapFontStatus && mapLineStatus){//线上文字显示
                        graphics[k].show();
                      }
                    }
                  }
                  if(evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign === "CurvePoint") {//判断是轨迹点
                    setTimeout(function(){
                      $(".address_indiv").css("width","20px").css("height","20px");
                    },100);
                    setTimeout(function(){
                      $("#newDiv").remove();
                    },600);
                  }
                }
              });
            bayonetLayer.on("click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                  getBaseMessage(true,evt.graphic.attributes.id, evt.graphic.attributes.type, true);//基础信息展示
                }
                // 如果是shift 状态， 保存graphic
                if(!mapSmallSign&&!mapHeatSign){
                  if (evt.graphic.attributes.hasOwnProperty("addnode")) {
                    //所有点都还原
                    var graphics = bayonetLayer.graphics;
                    for(var k=0;k<graphics.length;k++){//判断是一个点.且选中
                      if(graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign === "true"){
                        if(shiftSign){// shift 状态，让其 shiftGraphic 的图标选中
                          var haveInShift = false;
                          for(var n=0;n<shiftGraphic.length;n++){
                            if(shiftGraphic[n].attributes.id === graphics[k].attributes.id){
                              haveInShift = true;
                            }
                          }
                          haveInShift ? mapSetSymbol(graphics[k], "click") : mapSetSymbol(graphics[k], "base");
                        }else{
                          mapSetSymbol(graphics[k], "base");
                        }
                      }
                      if(graphics[k].attributes.sign === "text"){//点的名称
                        //$(evt.target.nextElementSibling).parent().children("text").css("fill","white");
                        if(graphics[k].attributes.id === evt.graphic.attributes.id){
                          var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                          textSymbol.setColor(new esri.Color([0,0,255,1]));
                          textSymbol.setOffset(35, 10);
                          graphics[k].setSymbol(textSymbol);
                        }else{
                          //文字标签
                          var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                          if(mapUseType === "use" || mapstyle !== "black"){
                            textSymbol.setColor(new esri.Color([255,39,10,1]));
                          }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                          }
                          textSymbol.setOffset(35, 10);
                          graphics[k].setSymbol(textSymbol);
                        }
                      }
                    }
                    if(evt.graphic.symbol.clickSign !== "move"){
                      mapSetSymbol(evt.graphic, "click");
                      if(shiftSign){
                        //去重
                        var haveShiftGraphic = false;
                        for(var y=0;y<shiftGraphic.length;y++){
                          if(shiftGraphic[y].attributes.id === evt.graphic.attributes.id){
                            haveShiftGraphic = true;
                          }
                        }
                        if(!haveShiftGraphic){
                          shiftGraphic.push(evt.graphic);
                        }
                      }
                    }
                  }
                  if(evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign === "CurvePoint"){//判断是轨迹点
                    var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle.png", 20, 20);
                    symbol1.clickSign = "false";
                    evt.graphic.setSymbol(symbol1);
                    evt.graphic.show();
                    $("#newDiv").remove();
                    var content = "<div class='address_indiv'>"+
                      "坐标信息：<div class='address_div' >"+ evt.graphic.attributes.address +"</div> "+
                      "<div class='dbl_topleft'></div><div class='address_bottomright'></div></div>";

                    var div = document.createElement("div");
                    div.setAttribute("id", "newDiv");
                    div.style.position = "absolute";
                    div.style.left = evt.clientX+20 + "px";
                    div.style.top = evt.clientY-45 + "px";
                    div.style.fontSize = "12px";

                    var svg = $(content).appendTo(div);

                    $(div).appendTo($("#basemap_container"));

                    $(".address_indiv").css("height","20px").css("width","20px");
                    setTimeout(function(){
                      $(".address_indiv").css("width","150px").css("height","60px");
                    },100);

                  }
                }

              });
            bayonetLayer.on("dbl-click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (!mapSmallSign&&!mapHeatSign&&evt.graphic.attributes.hasOwnProperty("addnode")) {
                  mapdisk = true;
                  var conf = {
                    thisMarker:evt,//这个还是问题
                    markerId:evt.graphic.attributes.id,
                    gis:evt.graphic.attributes.gis,
                    nodeId:evt.graphic.attributes.nodeId,
                    nodeType:evt.graphic.attributes.type,
                    objectType:evt.graphic.attributes.objectType,
                    getLeft:evt.clientX - 217 - 30,
                    getTop:evt.clientY - 269 - 27
                  };

                  d3.selectAll("#newDiv").remove();
                  setmapProperty("null","zoom-false","dbl-false");

                  mapCommon.mapWorkMarker = [];
                  mapCommon.mapWorkMarker.push(evt);
                  mapCommonPart.topomenu(conf);


                  map.disableScrollWheelZoom();//禁用鼠标滚轮
                  map.disableDoubleClickZoom();//禁用双击放大
                  map.disablePan();//禁止平移地图

                  if(evt.graphic.attributes.type === EPMUI.context.gis.bayonet){
                    mapCommonPart.topomenu(conf,"kkmenu");
                  }else{
                    mapCommonPart.topomenu(conf,"topomenu");
                  }

                }
                //是选区的时候操作
                if(!mapSmallSign&&!mapHeatSign&&evt.graphic.attributes.hasOwnProperty("sign")&&evt.graphic.attributes.sign=="toolbar"){
                  d3.selectAll("#newDiv").remove();
                  map.disableScrollWheelZoom();//禁止鼠标滚轮
                  map.disableDoubleClickZoom();//禁止双击放大
                  map.disablePan();//禁止平移地图

                  var conf = {
                    thisClick:evt,
                    areaLays:evt
                  };
                  mapCommon.mapWorkArea = {};
                  mapCommon.mapWorkArea = {
                    thisClick:evt,
                    areaLays:evt
                  };
                  mapCommonPart.menu(conf,"areamenu");
                  //if end ...
                }
              });
        }
        //轨迹设置
        $("#map_path_ensure").bind("click",function(){
            $(".map_path").css("height","40px").css("overflow","hidden");

            var startTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[0].trim() : "";
            var endTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[1].trim() : "";
            // 轨迹类型
            var trackStatues = [];
            $("input[name='mapPath']").each(function(){
              if( $(this).attr("checked")){
                trackStatues.push($(this).val());
              }
            });
            var Id = mapCommon.mapWorkMarker[0].graphic.attributes.id;
            var nodeType = mapCommon.mapWorkMarker[0].graphic.attributes.type;
            var nodeId = mapCommon.mapWorkMarker[0].graphic.attributes.nodeId;
            var basePoint = {
                gis: {
                    lon: mapCommon.mapWorkMarker[0].graphic.attributes.gis.lon,
                    lat: mapCommon.mapWorkMarker[0].graphic.attributes.gis.lat
                },
                id:Id
            };
            // 删除 原来有的轨迹
            var graphics = graphicLayer.graphics;
            var delgraphics = [];
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")){//判断是一个点
                    if(graphics[k].attributes.sign == "Curveline"||graphics[k].attributes.sign == "CurvePoint"){
                        if(graphics[k].attributes.id == Id){
                            //graphicLayer.remove(graphics[k]);
                            delgraphics.push(graphics[k]);
                        }
                    }
                }
            }
            for(var j=0;j<delgraphics.length;j++){
                graphicLayer.remove(delgraphics[j]);
            }
            var graphics = lineGraphicLayer.graphics;
            var delgraphics = [];
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")){//判断是一个点
                    if(graphics[k].attributes.sign == "Curveline"){
                        if(graphics[k].attributes.id == Id){
                            delgraphics.push(graphics[k]);
                        }
                    }
                }
            }
            for(var j=0;j<delgraphics.length;j++){
                lineGraphicLayer.remove(delgraphics[j]);
            }

            //后台请求，获得轨迹的数据   请求缺少两个参数startTime  endTime
            for(var i=0;i<trackStatues.length;i++){
                /*if(trackStatues[i] == "pathAppearSite"){//出现地点
                    $.ajax({
                        url: EPMUI.context.url + '/object/path/gis',
                        type: 'get',
                        data: {
                            objectId: Id,
                            objectType: nodeType,
                            beginTime: startTime,
                            endTime:endTime,
                            pathType:"pathAppearSite"
                        },
                        dataType: 'json',
                        success: function (data) {
                            if (data.code == "200") {
                                var addData = [
                                    {
                                        tripMode:"car",
                                        gis: {
                                            lon: 106.213773,
                                            lat: 38.507709
                                        },
                                        address: "银川九中"
                                    },
                                    {
                                        tripMode:"car",
                                        gis: {
                                            lon: 106.274139,
                                            lat: 38.481276
                                        },
                                        address: "中山公园"
                                    },
                                    {
                                        tripMode:"car",
                                        gis: {
                                            lon: 106.181146,
                                            lat: 38.498334
                                        },
                                        address: "宁夏回族自治区银川市火车站"
                                    }
                                ];
                                var mapStepOverlays = [];
                                for (var k = 0; k < addData.length; k++) {
                                    var linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addData[k]);
                                    addCurve(linePoints,basePoint,addData[k],"base");
                                    //轨迹动画
                                    curveAnimation(linePoints,basePoint,"place", addData[k].tripMode, k);
                                }
                            }
                        }
                    });
                }*/
                if(trackStatues[i] == "pathMigratory"){//迁徙轨迹
                  if(mapCommon.mapWorkMarker[0].graphic.attributes.name === "大黄蜂攻击机" || mapCommon.mapWorkMarker[0].graphic.attributes.name === "CVN-76航母"){
                    var data = {
                      "code": 200,
                      "message": "成功",
                      "magicube_interface_data": [
                        {
                          "gis": [
                            121.7425337,
                            20.4195612
                          ],
                          "tripMode": "airplane",
                          "name": "[121.7425337,20.4195612]",
                          "time": "T1"
                        },
                        {
                          "gis": [
                            116.6098338,
                            16.7158791
                          ],
                          "tripMode": "airplane",
                          "name": "[116.6098338,16.7158791]",
                          "time": "T2"
                        },
                        {
                          "gis": [
                            114.9187130,
                            12.3840818
                          ],
                          "tripMode": "airplane",
                          "name": "[114.9187130,12.3840818]",
                          "time": "T3"
                        },
                        {
                          "gis": [
                            111.7633487,
                            8.5435468
                          ],
                          "tripMode": "airplane",
                          "name": "[111.7633487,8.5435468]",
                          "time": "T4"
                        }
                      ]
                    };

                    if(mapCommon.mapWorkMarker[0].graphic.attributes.name === "CVN-76航母"){
                      data = {
                        "code": 200,
                        "message": "成功",
                        "magicube_interface_data": [
                          {
                            "gis": [
                              121.7425337,
                              20.4195612
                            ],
                            "tripMode": "boat",
                            "name": "[121.7425337,20.4195612]",
                            "time": "T1"
                          },
                          {
                            "gis": [
                              116.6098338,
                              16.7158791
                            ],
                            "tripMode": "boat",
                            "name": "[116.6098338,16.7158791]",
                            "time": "T2"
                          },
                          {
                            "gis": [
                              114.9187130,
                              12.3840818
                            ],
                            "tripMode": "boat",
                            "name": "[114.9187130,12.3840818]",
                            "time": "T3"
                          },
                          {
                            "gis": [
                              111.7633487,
                              8.5435468
                            ],
                            "tripMode": "boat",
                            "name": "[111.7633487,8.5435468]",
                            "time": "T4"
                          }
                        ]
                      };
                    }

                    var addData = data.magicube_interface_data;
                    var curveAnimationPoints = [];

                    let lushulen = lushuNum.length+1;
                    let lushuName = "l"+lushulen;
                    lushuNum.push({ name: lushuName, size: 0, lushu:[] });

                    window.tripData = addData;
                    for(var k=0;k<addData.length;k++){
                      if(k==0){
                        var addDataFirst = {
                          time:addData[0].time,
                          tripMode:addData[0].tripMode,
                          address: addData[0].name,
                          gis: {
                            lon: addData[0].gis[0],
                            lat: addData[0].gis[1]
                          }
                        }
                        var linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addDataFirst,200);
                        addCurve(linePoints,basePoint,addDataFirst,"base");
                        for(var l=0;l<linePoints.length;l++){
                          curveAnimationPoints.push(linePoints[l]);
                        }
                        //轨迹动画
                        //curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                        runCurveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k, lushuName);
                      }
                      if(k>0){
                        var addDataFirst = {
                          time:addData[k-1].time,
                          tripMode:addData[k-1].tripMode,
                          address: addData[k-1].name,
                          gis: {
                            lon: addData[k-1].gis[0],
                            lat: addData[k-1].gis[1]
                          }
                        };

                        var addDataSecond = {
                          time:addData[k].time,
                          tripMode:addData[k].tripMode,
                          address: addData[k].name,
                          gis: {
                            lon: addData[k].gis[0],
                            lat: addData[k].gis[1]
                          }
                        };
                        var linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst,addDataSecond,200);
                        if(k == addData.length-1){
                          addCurve(linePoints,basePoint,addDataSecond,"last");
                        }else {
                          addCurve(linePoints,basePoint,addDataSecond,"base");
                        }
                        for(var l=0;l<linePoints.length;l++){
                          curveAnimationPoints.push(linePoints[l]);
                        }
                        //轨迹动画
                        //curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                        runCurveAnimation(linePoints,basePoint,"track", addDataSecond.tripMode, k, lushuName);
                      }
                    }
                    //预测区域 点 线 增加轨迹动态效果
                    if(addData){
                      //预测的
                      let expectPoint = {
                        "gis": [
                          109.7633487,
                          5.5435468
                        ],
                        "tripMode": "airplane",
                        "name": "[109.7633487,5.5435468]",
                        "time": "2017-11-13 04:22:00"
                      };

                      let l = addData.length;
                      var addDataFirst = {
                        time:addData[l-1].time,
                        tripMode:addData[l-1].tripMode,
                        address: addData[l-1].name,
                        gis: {
                          lon: addData[l-1].gis[0],
                          lat: addData[l-1].gis[1]
                        }
                      };

                      var addDataSecond = {
                        time:expectPoint.time,
                        tripMode:expectPoint.tripMode,
                        address: expectPoint.name,
                        gis: {
                          lon: expectPoint.gis[0],
                          lat: expectPoint.gis[1]
                        }
                      };
                      var linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst,addDataSecond,200);
                      //addCurve(linePoints,basePoint,addDataSecond,"dashed","dashed");
                      for(let lp=0;lp<linePoints.length;lp++){
                        curveAnimationPoints.push(linePoints[lp]);
                      }
                      //轨迹动画  预测点 不加飞行效果
                      runCurveAnimation(linePoints,basePoint,"track", "no", l, lushuName);
                    }
                    return '';
                  }
                  if(mapCommon.mapWorkMarker[0].graphic.attributes.name === "田雪"){
                    var data = {
                      "code": 200,
                      "message": "成功",
                      "magicube_interface_data": [
                        {
                          "gis": [
                            121.7425337,
                            20.4195612
                          ],
                          "tripMode": "airplane",
                          "name": "[121.7425337,20.4195612]",
                          "time": "T1"
                        },
                        {
                          "gis": [
                            116.6098338,
                            16.7158791
                          ],
                          "tripMode": "airplane",
                          "name": "[116.6098338,16.7158791]",
                          "time": "T2"
                        },
                        {
                          "gis": [
                            114.9187130,
                            12.3840818
                          ],
                          "tripMode": "airplane",
                          "name": "[114.9187130,12.3840818]",
                          "time": "T3"
                        },
                        {
                          "gis": [
                            111.7633487,
                            8.5435468
                          ],
                          "tripMode": "airplane",
                          "name": "[111.7633487,8.5435468]",
                          "time": "T4"
                        }
                      ]
                    };

                    var addData = data.magicube_interface_data;
                    var curveAnimationPoints = [];

                    let lushulen = lushuNum.length+1;
                    let lushuName = "l"+lushulen;
                    lushuNum.push({ name: lushuName, size: 0, lushu:[] });

                    window.tripData = addData;
                    for(var k=0;k<addData.length;k++){
                      if(k==0){
                        var addDataFirst = {
                          time:addData[0].time,
                          tripMode:addData[0].tripMode,
                          address: addData[0].name,
                          gis: {
                            lon: addData[0].gis[0],
                            lat: addData[0].gis[1]
                          }
                        }
                        var linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addDataFirst,200);
                        addCurve(linePoints,basePoint,addDataFirst,"base");
                        for(var l=0;l<linePoints.length;l++){
                          curveAnimationPoints.push(linePoints[l]);
                        }
                        //轨迹动画
                        //curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                        runCurveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k, lushuName);
                      }
                      if(k>0){
                        var addDataFirst = {
                          time:addData[k-1].time,
                          tripMode:addData[k-1].tripMode,
                          address: addData[k-1].name,
                          gis: {
                            lon: addData[k-1].gis[0],
                            lat: addData[k-1].gis[1]
                          }
                        };

                        var addDataSecond = {
                          time:addData[k].time,
                          tripMode:addData[k].tripMode,
                          address: addData[k].name,
                          gis: {
                            lon: addData[k].gis[0],
                            lat: addData[k].gis[1]
                          }
                        };
                        var linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst,addDataSecond,200);
                        if(k == addData.length-1){
                          addCurve(linePoints,basePoint,addDataSecond,"last");
                        }else {
                          addCurve(linePoints,basePoint,addDataSecond,"base");
                        }
                        for(var l=0;l<linePoints.length;l++){
                          curveAnimationPoints.push(linePoints[l]);
                        }
                        //轨迹动画
                        //curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                        runCurveAnimation(linePoints,basePoint,"track", addDataSecond.tripMode, k, lushuName);
                      }
                    }
                    return '';
                  }
                  if(nodeType === "JDCXX" || nodeType === "CHE"){
                    let carPathType = 1;
                    $.ajax({
                      url: EPMUI.context.url + '/object/path/gis',
                      type: 'get',
                      data: {
                        objectId: Id,
                        objectType: nodeType,
                        beginTime: startTime,
                        endTime:endTime,
                        pathType:carPathType
                      },
                      dataType: 'json',
                      success: function (data) {
                        /*var data = {
                         "code": 200,
                         "message": "成功",
                         "magicube_interface_data": [
                         {
                         "gis": [ 106.243239,38.491276 ],
                         "tripMode": "airplane",
                         "address": "银川市宁夏博物馆",
                         "time": "2017-03-20 12:02:33"
                         }
                         ]
                         };*/
                        if (data.code == "200") {
                          var addData = data.magicube_interface_data;
                          addPath(addData, basePoint, 0 );
                        }
                      }
                    });
                  }else{
                    $.ajax({
                      url: EPMUI.context.url + '/object/path/gis',
                      type: 'get',
                      data: {
                        objectId: Id,
                        objectType: nodeType,
                        beginTime: startTime,
                        endTime:endTime,
                        pathType:1
                      },
                      dataType: 'json',
                      success: function (data) {
                        if (data.code == "200") {
                          var addData = data.magicube_interface_data;
                          addPath(addData, basePoint, 0 );
                        }
                      }
                    });
                  }

                }
            }

        })
        $("#map_path_cancel").bind("click",function(){
            $(".map_path").hide();
        })

      //工具栏菜单-设置
      //显示设置！
      this.baseSetting = function (coverage){
        //图层设置 去掉1
        if(coverage==="defaultmap"){//默认图
          if(mapHeatSign){//热力图==默认图
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(mapLineStatus&&graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign == "polyline") ){
                graphics[k].show();
              }
            }

            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(mapLineStatus&&graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "polylinetext") ){
                graphics[k].show();
              }

              if(mapFontStatus&&graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign == "polylinetext")){
                graphics[k].show();
              }

              if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//转换为标准图标
                var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
                symbol1.clickSign = "false";
                graphics[k].setSymbol(symbol1);
              }
            }
            mapSmallSign = false;
            mapHeatSign = false;
          }
          if(mapSmallSign){//小点图==》默认图
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(mapLineStatus&&graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "polyline") ){
                graphics[k].show();
              }
            }
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(mapLineStatus&&graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "polylinetext") ){
                graphics[k].show();
              }

              if(mapFontStatus&&graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign == "polylinetext")){
                graphics[k].show();
              }

              if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//转换为标准图标
                var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
                symbol1.clickSign = "false";
                graphics[k].setSymbol(symbol1);
              }
            }
            mapSmallSign = false;
            mapHeatSign = false;
          }
        }else if(coverage==="heatmap"){//热力图
          if(!mapHeatSign){
            arcgisSetAggregation("del");//关闭聚合
            mapHeatSign = true;

            //清除原来的点类型
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              //隐藏 字 和线
              if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline" ){
                graphics[k].hide();
              }
            }
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              //隐藏 字 和线
              if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign === "polylinetext")){
                graphics[k].hide();
              }

              if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//转换为热力图标
                var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle-heat.svg", 22, 22);
                symbol1.clickSign = "false";
                graphics[k].setSymbol(symbol1);
              }
            }

            mapSmallSign = false;
          }
        }else if(coverage==="smallPointmap"){//小点图
          if(mapHeatSign){//热力图==》小点图
            mapHeatSign = false;
          }
          arcgisSetAggregation("del");//关闭聚合

          //清除原来的点类型
          var graphics = lineGraphicLayer.graphics;
          for(var k=0;k<graphics.length;k++){
            //隐藏 字 和线
            if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline" ){
              graphics[k].hide();
            }
          }
          var graphics = graphicLayer.graphics;
          for(var k=0;k<graphics.length;k++){
            //隐藏 字 和线
            if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign == "polylinetext")){
              graphics[k].hide();
            }

            if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//转换为小点
              var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-small.svg", 8, 8);
              symbol1.clickSign = "false";
              graphics[k].setSymbol(symbol1);
            }
          }
          mapSmallSign = true;
        }

      };
      //点线设置
      this.fontlineSetting = function (fontlineStatues){
        if(fontlineStatues.length==0&&!mapHeatSign&&!mapSmallSign){//显示线 字
          var graphics = lineGraphicLayer.graphics;
          for(var k=0;k<graphics.length;k++){
            if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline" ){//判断是直线 显示
              graphics[k].show();
            }
          }
          var graphics = graphicLayer.graphics;
          for(var k=0;k<graphics.length;k++){
            if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign === "polylinetext")){//判断是文字  显示
              graphics[k].show();
            }
          }
          mapFontStatus = true;
          mapLineStatus = true;
        }else if(fontlineStatues.length==1&&!mapHeatSign&&!mapSmallSign){
          if(fontlineStatues[0] === "hideline"){//隐藏连线and线上文字 显示文字
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "polyline")){
                graphics[k].hide();
              }
            }
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "polylinetext")){
                graphics[k].hide();
              }
              if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "text" ){
                graphics[k].show();
              }
            }
            mapFontStatus = true;
            mapLineStatus = false;
          }else if(fontlineStatues[0] == "hidefont"){//隐藏文字 显示连线
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline" ){
                graphics[k].show();
              }
            }
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
              if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign === "polylinetext")){
                graphics[k].hide();
              }
            }
            mapFontStatus = false;
            mapLineStatus = true;
          }
        }else if(fontlineStatues.length==2&&!mapHeatSign&&!mapSmallSign){
          var graphics = lineGraphicLayer.graphics;
          for(var k=0;k<graphics.length;k++){
            if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline" ){
              graphics[k].hide();
            }
          }
          var graphics = graphicLayer.graphics;
          for(var k=0;k<graphics.length;k++){
            if(graphics[k].attributes.hasOwnProperty("sign")&&(graphics[k].attributes.sign === "text"||graphics[k].attributes.sign === "polylinetext")){
              graphics[k].hide();
            }
          }
          mapFontStatus = false;
          mapLineStatus = false;
        }
      };
      //聚合设置
      this.aggregationSetting = function (mapAggregation){
        if(mapAggregation === "aggregation"&&!mapHeatSign&&!mapSmallSign){
          //聚合方法
          arcgisSetAggregation("add");
        }else if(mapAggregation !== "aggregation"){
          arcgisSetAggregation("del");
        }
      };
      //图层设置
      this.showSetting = function (showSettings){
        //卡口图层
        if(showSettings && showSettings.indexOf("bayonet") > -1){
          if( !bayonetSign ){
            bayonetLayer.clear();//删除原来的卡口图层信息

            $.ajax({
              url: EPMUI.context.url + '/object/all/bayonet',
              type: 'POST',
              data: {

              },
              dataType: 'json',
              success: function (data) {
                if (data.code == "200") {
                  let addData = data.magicube_interface_data;
                  for(let k=0;k<addData.length;k++){
                    let bayonet = addMapOverlays(addData[k], "bayonet");
                  }
                }
              }
            });

            /*let returnBayonetData = [
             {
             gis: {
             lon: 106.185281,
             lat: 38.449092
             },
             address: "哈尔滨工业大学",
             id: "273F534A64EEB25B211565C5DEF3FEA2",
             name:"华容路卡口",
             nodeId:"68936086",
             objectType: "entity",
             page_type:"entity",
             type :"JKSB"
             },
             {
             gis: {
             lon: 106.285281,
             lat: 38.409092
             },
             address: "哈尔滨工业大学",
             id: "273F534A64EEB25B211565C5DEF3FEA2",
             name:"迎泽路卡口",
             nodeId:"68936086",
             objectType: "entity",
             page_type:"entity",
             type :"JKSB"
             },
             {
             gis: {
             lon: 106.195281,
             lat: 38.499092
             },
             address: "哈尔滨工业大学",
             id: "273F534A64EEB25B211565C5DEF3FEA2",
             name:"五一路卡口",
             nodeId:"68936086",
             objectType: "entity",
             page_type:"entity",
             type :"JKSB"
             }
             ];

             for(let k=0;k<returnBayonetData.length;k++){
             let bayonet = addMapOverlays(returnBayonetData[k], "bayonet");
             }*/

            bayonetSign = true;

          }
        }else{
          bayonetLayer.clear();
          bayonetSign = false;
        }
        //重点人相关
        if(showSettings && showSettings.indexOf("keyPerson") > -1){

        }else{

        }

      };
      //区域设置
      this.areaSetting = function (areaSettings){
        //重点区域 显示隐藏
        if(areaSettings && areaSettings.indexOf("keyArea") > -1){
          if( !keyAreaSign ){
            showKeyArea();
            keyAreaSign = true;
          }
        }else{
          keyAreaLayer.clear();
          keyAreaSign = false;
        }
      };
      //绘制区域设置
      this.drawAreaSetting = function(drawArea){
        var toolbar = new esri.toolbars.Draw(map);
        toolbar.on("draw-complete", addToMap);//draw-end

        activateTool(drawArea);

        function activateTool(drawingType) {
          if(drawingType === "circle"){//new esri.symbol.
            var symbolCircle =  new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
              new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
                new esri.Color([7,26,68,0.6]), 2),new esri.Color([7,26,68,0.5])
            );
            toolbar.setFillSymbol(symbolCircle);
            toolbar.activate(esri.toolbars.Draw["CIRCLE"]);
            map.hideZoomSlider();
          }
          if( drawingType === "polygon"){
            var symbolPolygon =  new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
              new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
                new esri.Color([7,26,68,0.6]), 2),new esri.Color([7,26,68,0.5])
            );
            toolbar.setFillSymbol(symbolPolygon);

            toolbar.activate(esri.toolbars.Draw["POLYGON"]);
            map.hideZoomSlider();
          }
          if( drawingType === "rectangle"){
            var symbolPolygon =  new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
              new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
                new esri.Color([7,26,68,0.6]), 2),new esri.Color([7,26,68,0.5])
            );
            toolbar.setFillSymbol(symbolPolygon);

            toolbar.activate(esri.toolbars.Draw["RECTANGLE"]);
            map.hideZoomSlider();
          }

        }

        function addToMap(evt) {
          var symbol;
          toolbar.deactivate();
          map.showZoomSlider();
          switch (evt.geometry.type) {
            case "point":
            case "multipoint":
              symbol = new esri.symbol.SimpleMarkerSymbol();
              break;
            case "rectangle":
              symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([7,26,68,0.6]), 2),
                new esri.Color([7,26,68,0.5]));
              break;
            case "polyline":
              symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([7,26,68,0.6]), 2),
                new esri.Color([7,26,68,0.5]));
              break;
            default:
              symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([7,26,68,0.6]), 2),
                new esri.Color([7,26,68,0.5]));
              break;
          }
          var attr = {
            sign:"toolbar",
            multipleEntity:"null"
          };
          var graphic = new esri.Graphic(evt.geometry, symbol,attr);
          graphicLayer.add(graphic);
          //后台发送请求
          toolBarSetData(evt,graphic);
        }
      };
      //添加告警人员行动轨迹
      this.addWarningMovePath = function(addData,basepoint){
        var setbasePoint = {
          gis: {
            lon: basepoint.lon,
            lat: basepoint.lat
          },
          id:basepoint.id,
          time:basepoint.time
        };
        addPath(addData, setbasePoint, 0 );

        //计算所有的轨迹的时间分布
        let lineGraphics = lineGraphicLayer.graphics;

        let newLine = lineGraphics.filter( ( item, index ) => {
          return item.attributes.hasOwnProperty("sign") && item.attributes.sign === "Curveline"
        } );

        let timeLines = [];
        for(let n=0;n<newLine.length;n++){
          let lineStr = {relationName: "轨迹", time: newLine[n].attributes.time, y: 1};
          timeLines.push(lineStr);
        }
        mapCommonPart.addTimeLineData(timeLines);

      };
      //添加轨迹
      function addPath(addData, basePoint, curveLevel){
        timelineIntervalSign = true;
        let curveAnimationPoints = [];

        let lushulen = lushuNum.length+1;
        let lushuName = "l"+lushulen;
        lushuNum.push({ name: lushuName, size: 0, lushu:[] });

        window.tripData = addData;
        for(let k=0;k<addData.length;k++){
          if(k==0){
            let tripMode = addData[0].tripMode ? addData[0].tripMode : "car";
            let addDataFirst = {
              time:addData[0].time,
              tripMode:tripMode,
              address: addData[0].name,
              gis: {
                lon: addData[0].gis[0],
                lat: addData[0].gis[1]
              }
            };
            let linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addDataFirst,curveLevel);
            addCurve(linePoints,basePoint,addDataFirst,"base");
            for(let l=0;l<linePoints.length;l++){
              curveAnimationPoints.push(linePoints[l]);
            }
            //轨迹动画
            runCurveAnimation(linePoints,basePoint,"track", tripMode, k, lushuName);
          }
          if(k>0){
            let tripModePre = addData[k-1].tripMode ? addData[k-1].tripMode : "car";
            let tripModeNow = addData[k].tripMode ? addData[k].tripMode : "car";
            let addDataFirst = {
              time:addData[k-1].time,
              tripMode:tripModePre,
              address: addData[k-1].name,
              gis: {
                lon: addData[k-1].gis[0],
                lat: addData[k-1].gis[1]
              }
            };

            let addDataSecond = {
              time:addData[k].time,
              tripMode:tripModeNow,
              address: addData[k].name,
              gis: {
                lon: addData[k].gis[0],
                lat: addData[k].gis[1]
              }
            };
            let linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst,addDataSecond,curveLevel);
            addCurve(linePoints,basePoint,addDataSecond,"base");
            for(let l=0;l<linePoints.length;l++){
              curveAnimationPoints.push(linePoints[l]);
            }
            //轨迹动画
            runCurveAnimation(linePoints,basePoint,"track", addDataSecond.tripMode, k, lushuName);
          }
        }
      }

        //跨省人员流动
        $("#map_people_move").click(function () {
            peopleMove();
        });
        //区域统计
        $("#map_area_statistics").click(function () {
            if(keyAreaSign){// 关闭重点区域
                /*var allOverlays = map.getOverlays();
                for(var k=0;k<allOverlays.length;k++) {
                    if (allOverlays[k].hasOwnProperty("addattr")&&allOverlays[k].addattr.sign == "keyarea") {
                        map.removeOverlay(allOverlays[k]);
                    }
                    if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type == "areaMarker") {//清除区域分析
                        map.removeOverlay(allOverlays[k]);
                    }
                }
                //清除人员流动
                removePeopleMove();
                var allOverlays = map.getOverlays();*/

                keyAreaSign = false;
            }else{//显示重点区域
                showKeyArea();
                keyAreaSign = true;
            }

            return 0;

            if(areaStatisticsSign){// 关闭统计功能
                $("#asDiv").remove();
                d3.selectAll(".aSGraphic").remove();
                areaStatisticsSign = false;
                areaStatisticsSignClick = false;
            }else{//未统计，开始统计
                areaStatistics();
                if(map.getZoom()<5){
                    map.setZoom(5);
                }

                areaStatisticsSign = true;
                areaStatisticsSignClick = true;
            }
        });
        /**
         * 添加点和线
         * @param gisExpandData 扩展的点的信息
         * @param basemarker:{根节点,false}   false表示单纯加点 而不添加线
         */
        window.addMapPointLine = function (gisNodesData,basemarker,multiSign) {
            var arcGisStepValue = [];
            for (var i = 0; i < gisNodesData.length; i++) {
                //先去重
                var haveMarker = mapRepeat(gisNodesData[i],"marker");//去重
                var graphics = graphicLayer.graphics;
                if(!haveMarker){
                    if(gisNodesData[i].gis != null ){//&& !gisNodesData[i].hasOwnProperty("nogis")
                        var conf = { type: "add"};
                        var graphic = addMapOverlays(gisNodesData[i],"addMarker",conf);//加点
                        var textGraphic = addMapOverlays(gisNodesData[i],"addText",conf);//加文字标签
                        arcGisStepValue.push(graphic);
                        arcGisStepValue.push(textGraphic);
                    }else {
                        noGisPoints.push(gisNodesData[i]);
                    }
                }
                if(basemarker){//是拓展-加连接线
                    gisNodesData.forEach(link => lineNames.push(link.relationParentType));
                    lineNames = [...new Set(lineNames)];

                    var basemarkerId;
                    var basemarkerGis;
                    var trueBaseMarker;
                    if(multiSign){
                        trueBaseMarker = gisNodesData[i].source;
                        basemarkerId = gisNodesData[i].source.id;
                        basemarkerGis = gisNodesData[i].source.gis;
                    }else{
                        trueBaseMarker = basemarker[0];
                        basemarkerId = basemarker[0].id;
                        basemarkerGis = basemarker[0].gis;
                    }

                    var gislinks;
                    if(gisNodesData[i].tag == "-20"){
                        gislinks = {
                            relationId:gisNodesData[i].relationId,
                            relationParentType:gisNodesData[i].relationParentType,
                            relationTypeName: gisNodesData[i].relationTypeName,
                            time: gisNodesData[i].time,
                            tag: gisNodesData[i].tag,
                            target: trueBaseMarker,
                            source: {
                                addnode: true,
                                gis: gisNodesData[i].gis,
                                id: gisNodesData[i].id,
                                name: gisNodesData[i].name,
                                nodeId: gisNodesData[i].nodeId,
                                objectType: gisNodesData[i].objectType,
                                type: gisNodesData[i].type
                            }
                        };
                    }else{ // gisNodesData[i].tag == "20" 或者不存在
                        gislinks = {
                            relationId:gisNodesData[i].relationId,
                            relationParentType:gisNodesData[i].relationParentType,
                            relationTypeName: gisNodesData[i].relationTypeName,
                            time: gisNodesData[i].time,
                            tag: gisNodesData[i].tag,
                            source: trueBaseMarker,
                            target: {
                                addnode: true,
                                gis: gisNodesData[i].gis,
                                id: gisNodesData[i].id,
                                name: gisNodesData[i].name,
                                nodeId: gisNodesData[i].nodeId,
                                objectType: gisNodesData[i].objectType,
                                type: gisNodesData[i].type
                            }
                        };
                    }

                    //先去重
                    var haveLine = mapRepeat(gislinks,"curve");//去重
                    var lineSizeNum = haveLine ? haveLine.length : 170;//根据这个 判断线条是直线还是曲线，直线数值170

                    if(haveLine != "have"){
                        var conf = { lineSizeNum : lineSizeNum };
                        if((gislinks.source.gis != null)&&(gislinks.target.gis != null) ){//&& !gisNodesData[i].hasOwnProperty("nogis")
                            var returndata = addMapOverlays(gislinks,"addLine", conf);//加线
                            arcGisStepValue.push(returndata.graphicLine);
                            arcGisStepValue.push(returndata.textGraphic);
                        }
                    }

                    /*
                     STYLE_DOT	这条线是由点组成的。
                     STYLE_LONGDASH	线由一系列破折号构成。
                     STYLE_LONGDASHDOT	线由一系列短划线构成。
                     STYLE_NULL	该行没有符号。
                     STYLE_SHORTDASH	线由一系列短划线构成。
                     STYLE_SHORTDASHDOT	线由短划线和点组成。
                     STYLE_SHORTDASHDOTDOT	线由一系列的短划线和两个点构成。
                     STYLE_SHORTDOT	线由一系列短点构成。
                     STYLE_SOLID
                     */

                }
            }

            arcGisStep.push(arcGisStepValue);//保存上一步数据
            arcGisType.push("add");//保存上一步操作类型
            arcGisStepNum++;//保存上一步操作顺序数组的长度
            //pointEvent();
           arcgisSetAggregation("reset");//聚合的
            //mapSaveLocalStorage();
        }
        //操作选区
        function mapOperateArea(data, action){
        }
        //显示重点区域
        function showKeyArea(){
          const url = EPMUI.context.url + '/object/getKeyAreaGisList';
          let data = null;
          let completed = function (){ return false; };
          let succeed = function(returnData) {
            var styleOptions = {
              strokeColor:"#A52A2A",    //边线颜色。#33d0ff#EEEEE0 #5c7a96
              fillColor:"#A52A2A",      //填充颜色。当参数为空时，圆形将没有填充效果。 B22222  A52A2A 8B1A1A
              strokeWeight: 2,       //边线的宽度，以像素为单位。
              strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
              fillOpacity: 0.7,      //填充的透明度，取值范围0 - 1。
              strokeStyle: 'solid' //边线的样式，solid或dashed。
            }
            //点击显示重点区域
            for(var i=0;i<returnData.length;i++){
              if(returnData[i].shape === "polygon"){//画方形
                var myPolygon = {
                  "geometry":{
                    "rings":[JSON.parse(returnData[i].gisPointsStr)],
                    "spatialReference":{
                      "wkid":4326
                    }
                  },
                  "symbol":{
                    "color":[165,42,42,64],
                    "outline":{
                      "color":[165,42,42,255],
                      "width":1,
                      "type":"esriSLS",
                      "style":"esriSLSSolid"
                    },
                    "type":"esriSFS",
                    "style":"esriSFSSolid"
                  }
                };
                var keyAreaGraphic = new esri.Graphic(myPolygon);
                var attr = {
                  "peopleMove":false,
                  "analyse":false,
                  "id":returnData[i].id,
                  "gisPointsStr":returnData[i].gisPointsStr,
                  "type":"polygon"

                };
                keyAreaGraphic.setAttributes(attr);
                keyAreaLayer.add(keyAreaGraphic);
                keyAreaEvent();
              }
              if(returnData[i].shape === "circle_bak"){//画圆
                /*var symbol = new SimpleFillSymbol().setColor(null).outline.setColor("blue");
                 var gl = new GraphicsLayer({ id: "circles" });
                 //var geodesic = dom.byId("geodesic");
                 map.addLayer(gl);
                 var radius = map.extent.getWidth() / 10;
                 var circle = new Circle({
                 center: e.mapPoint,
                 /!*geodesic: domAttr.get(geodesic, "checked"),*!/
                 radius: radius
                 });
                 var graphic = new Graphic(circle, symbol);
                 gl.add(graphic);*/


                var myPolygon = {
                  "geometry":{
                    "rings":[returnData[i].gisPointsStr],
                    "spatialReference":{
                      "wkid":4326
                    }
                  },
                  "symbol":{
                    "color":[165,42,42,64],
                    "outline":{
                      "color":[165,42,42,255],
                      "width":1,
                      "type":"esriSLS",
                      "style":"esriSLSSolid"
                    },
                    "type":"esriSFS",
                    "style":"esriSFSSolid"
                  }
                };
                var keyAreaGraphic = new esri.Graphic(myPolygon);
                var attr = {
                  "peopleMove":false,
                  "analyse":false,
                  "id":returnData[i].id,
                  "gisPointsStr":returnData[i].gisPointsStr,
                  "type":"circle"//测试用

                };
                keyAreaGraphic.setAttributes(attr);
                keyAreaLayer.add(keyAreaGraphic);
                keyAreaEvent();

              }
            }
          };
          let judgment = function() { return false; };
          mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);
        }
        function keyAreaEvent(){
            keyAreaLayer.on("dbl-click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                map.disableScrollWheelZoom();//禁用鼠标滚轮
                map.disableDoubleClickZoom();//禁用双击放大
                map.disablePan();//禁止平移地图
                //setmapProperty("null", "zoom-false", "dbl-false", "pan-false");
                mapCommon.mapKeyArea = {};
                mapCommon.mapKeyArea = {
                    thisClick:evt,
                    areaLays:evt
                };
                var conf = {
                    thisClick:evt,
                    areaLays:evt,
                };
                mapCommonPart.menu(conf,"keyAreamenu");
            });
        }
        //聚合
        function arcgisSetAggregation(sign){
            if((sign==="add")&&(markerClustererSign==false)){
                //汇聚功能 整理成所需数据
                var clusterData = [];
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点

                        clusterData.push(graphics[k]);
                    }
                }

                addClusters(clusterData);
                markerClustererSign = true;
            }else if((sign==="del")&&(markerClustererSign==true)){
                //map.removeLayer(clusterLayer);
                markerClustererSign = false;
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                        graphics[k].show();
                    }
                }
            }else if(sign === "reset"&&(markerClustererSign==true)){
               // map.removeLayer(clusterLayer);

                //汇聚功能 整理成所需数据
                var clusterData = [];
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                        graphics[k].show();
                        clusterData.push(graphics[k]);
                    }
                }
                addClusters(clusterData);
                markerClustererSign = true;
            }

        }
        //跨省人员流动效果
        function peopleMove(returnData){
            //添加动画的线条
            for(var i=0;i<returnData.length;i++){
                var symbolcolor;
                if(returnData[i].populationSize<2222){
                    symbolcolor = new esri.Color([0,169,236,0.6]);
                }else if(returnData[i].populationSize>=2222&&returnData[i].populationSize<5555){
                    symbolcolor = new esri.Color([233,240,29,0.6]);
                }else if(returnData[i].populationSize>=5555){
                    symbolcolor = new esri.Color([235,63,47,0.6]);
                }
                var pMovePoints = mapCommonPart.getCurveByTwoPoints(returnData[i].source,returnData[i].target);

                for(var k=1;k<pMovePoints.length;k++){
                    var polylineJson = {
                        "paths":[[
                            [pMovePoints[k-1].lon,pMovePoints[k-1].lat],
                            [pMovePoints[k].lon,pMovePoints[k].lat]
                        ]],
                        "spatialReference":{"wkid":4326}
                    };

                    var polyline = new esri.geometry.Polyline(polylineJson);

                    var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DOT,
                        symbolcolor,
                        0.6);

                    var lineAttr = {
                        sign:"peopleMoveLine"
                    }

                    var graphicLine = new esri.Graphic(polyline, lineSymbol, lineAttr);
                    lineGraphicLayer.add(graphicLine);
                }

            }

            peopleMoveSetTime(returnData);

            var peopleMoveTimeNum = 0;
            var peopleMoveTime = setInterval(function () {

                if(peopleMoveTimeNum>2){
                    clearInterval(peopleMoveTime);

                    //标志线条 也要去掉
                    var delPMoveLine =[];
                    var graphics = lineGraphicLayer.graphics;
                    for(var i=0;i<graphics.length;i++){
                        if(graphics[i].attributes.hasOwnProperty("sign")&&graphics[i].attributes.sign === "peopleMoveLine"){
                                delPMoveLine.push(graphics[i]);
                        }
                    }
                    for(var i=0;i<delPMoveLine.length;i++){
                        lineGraphicLayer.remove(delPMoveLine[i]);//删除线
                    }

                }else{
                    peopleMoveSetTime(returnData);
                    peopleMoveTimeNum ++;
                }
            },3000);

        }
        //人员轨迹 定时
        function peopleMoveSetTime(returnData){

            for(var i=0;i<returnData.length;i++){
                runPeopleMove(returnData[i].source,returnData[i].target,returnData[i].populationSize);
            }
        }
        //人员轨迹开始
        function runPeopleMove(point1,point2,populationSize){
            var pMovePoints = mapCommonPart.getCurveByTwoPoints(point1,point2);

            var numPMP = 0;
            var numPMPSize = [10,9,8,7,6,5,4,3,2,1];
            var runPMP = setInterval(function () {
                if(numPMP<9){
                    peopleMoveCurveAnimation(pMovePoints,numPMPSize[numPMP],populationSize);
                    numPMP++;
                }else{
                    clearInterval(runPMP);
                }
            },10);
        }
        //人员出入 轨迹动画
        function peopleMoveCurveAnimation(points,size,populationSize) {
            var pt = new esri.geometry.Point(points[0].lon, points[0].lat);

            //设置标注显示的图标
            //var symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[2], size, size);
            var symbol1;
            if(populationSize<2222){
                symbol1 = new esri.symbol.PictureMarkerSymbol(gisPeopleMoveImages[1], size, size);
            }else if(populationSize>=2222&&populationSize<5555){
                symbol1 = new esri.symbol.PictureMarkerSymbol(gisPeopleMoveImages[3], size, size);
            }else if(populationSize>=5555){
                symbol1 = new esri.symbol.PictureMarkerSymbol(gisPeopleMoveImages[5], size, size);
            }
            /*if(mapUseType === "use" || mapstyle === "white"){
                symbol1.setColor(new esri.Color([0,51,153,1]));
            }else{
                symbol1.setColor(new esri.Color([253,221,155,1]));
            }*/
            symbol1.clickSign = "false";

            //要在模版中显示的参数
            var attr = {
                sign:"curveAnimationPoint"
            };

            //创建图像
            var graphic = new esri.Graphic(pt, symbol1,attr);
            //把图像添加到刚才创建的图层上
            graphicLayer.add(graphic);

            var cAsize = 0;//记录走过的位置
            var cA = setInterval(function () {
                if(cAsize<points.length){
                    var geometry = new esri.geometry.Point(points[cAsize].lon, points[cAsize].lat);
                    graphic.setGeometry(geometry);
                    /*if(cAsize>0){
                        //动图角度调整
                        var angle = setAnimationRotation(points[cAsize-1],points[cAsize]);
                        //graphic.symbol.setAngle(angle);
                        graphic.symbol.setAngle(angle-90);
                        var addCurveData = [];
                        addCurveData.push(points[cAsize-1]);
                        addCurveData.push(points[cAsize]);
                    }*/
                    cAsize++;
                }else{

                    clearInterval(cA);
                    //图标也要去掉了
                    var symbol1;
                    if(populationSize<2222){
                        symbol1 = new esri.symbol.PictureMarkerSymbol(gisPeopleMoveImages[0], 21-size*2, 21-size*2);
                    }else if(populationSize>=2222&&populationSize<5555){
                        symbol1 = new esri.symbol.PictureMarkerSymbol(gisPeopleMoveImages[2], 21-size*2, 21-size*2);
                    }else if(populationSize>=5555){
                        symbol1 = new esri.symbol.PictureMarkerSymbol(gisPeopleMoveImages[4], 21-size*2, 21-size*2);
                    }
                    graphic.setSymbol(symbol1);
                    setTimeout(function(){
                        graphicLayer.remove(graphic);
                    },500);

                }
            },10);

        }
        //区域统计 显示图层
        function areaStatistics(data){
            for(var i=0;i<data.length;i++){
                // ---  不创建图标，直接加 柱状图
                var XYdata = turnSpace(new esri.geometry.Point(data[i].gis.lon, data[i].gis.lat),"toScreen");// 屏幕距离

                var dataset = data[i].classifyValue;
                //var dataset = [50,35,25,24,86,75,43,10];
                //svg的大小
                var width = 100;
                var height = 100;
                let idsize = i+1;
                //父元素的偏移量ngm写
                var fx = $("#basemap_gc").css("transform").replace(/[^0-9\-,]/g,'').split(',')[4];
                var fy = $("#basemap_gc").css("transform").replace(/[^0-9\-,]/g,'').split(',')[5];
                if(fx == null){fx = 0;}
                if(fy == null){fy = 0;}
                var svg = d3.select("#graphicsLayer2_layer")//.attr("transform","translate("+e.clientX+","+e.clientY+")")
                    .append("svg")
                    .attr("width",width)
                    .attr("height",height)
                    .attr("x",parseFloat(XYdata.x)-30-fx) //应该获得父类svg的translate 进行计算  or map点击测试 e.srcElement.attributes.y.value
                    .attr("y",parseFloat(XYdata.y)-45-fy)
                    .attr("class","aSGraphic testa "+data[i].areaId)
                    .attr("id","aSGraphic"+data[i].areaId+idsize+"a")
                    .attr("data",i)
                    .on("dblclick",function(){
                        map.disableDoubleClickZoom(); //禁用双击放大
                        //删除div
                        $("#asDiv").remove();
                        var asnum = parseInt($(this).attr("data"));
                        showASSvg(data[asnum]);
                    })

                //定义 矩形的边距
                var padding = {top:5,right:5,left:10,bottom:10};
                //矩形所占的宽度-包括空白
                var rectStep = 20;
                //矩形所占的宽度-不包括空白
                var rectWidth = 20;
                //x轴宽度
                var xAxisWidth = 90;
                //y轴宽度
                var yAxisWidth = 90;
                //比例尺
                var xScale = d3.scale.ordinal()
                // *  重点在这里   通过方法，把数组设置为从 1 开始
                    .domain(markData())
                    .rangeRoundBands([0,xAxisWidth],0.2);//间隔 0.2

                function markData(){// 自己写的方法，变成数组 从1开始的
                    var dataX = d3.range(dataset.length);
                    for(k=0;k<dataX.length;k++){
                        dataX[k]=dataX[k]+1;
                    }
                    return dataX;
                }

                var yScale = d3.scale.linear()
                    .domain([0,d3.max(dataset)])
                    .range([0,yAxisWidth]);

                var rect = svg.selectAll("rect")
                    .data(dataset)
                    .enter()
                    .append("rect")
                    .attr("fill","steelblue")
                    .attr("x",function(d,k){
                        // * 重点在这里  添加了 1
                        return padding.left + xScale(k+1);
                    })
                    .attr("y",function(d){
                        return height-padding.bottom-yScale(d);
                    })
                    .attr("width",xScale.rangeBand())
                    .attr("height",function(d){
                        return yScale(d);
                    });

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");

                yScale.range([yAxisWidth,0]);

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");

                // svg中添加包含坐标轴的g元素
                var gAxis = svg.append("g")
                    .attr("class","axis") //坐标轴的样式
                    .attr("transform","translate("+ padding.left + "," + (height-padding.bottom+2) + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class","axis") //坐标轴的样式 padding.left  (padding.top+padding.bottom)
                    .attr("transform","translate("+ 9 + "," + 2 + ")")
                    .call(yAxis);
            }

        }
        //区域统计 放大显示详情
        function showASSvg(data){
            var XYdata = turnSpace(new esri.geometry.Point(data.gis.lon, data.gis.lat),"toScreen");// 屏幕距离
            //添加div
            var div = document.createElement("div");
            div.setAttribute("id", "asDiv");
            div.style.position = "absolute";
            div.style.left = XYdata.x + "px";
            div.style.top = XYdata.y + "px";
            div.style.fontSize = "12px";
            var inDivHtml = "<div class='asDiv_top'>"+
                                "<div class='asDiv_name'>"+ data.area +"</div>"+
                                //"<div class='asDiv_classify'>标志"+"</div>"+
                                "<div class='asDiv_func'>"+
                                    "<div class='asDiv_close'>×</div>"+
                                "</div>"+
                            "</div>"+
                            "<div class='asDiv_svg'></div>"+
                            "<div class='asDiv_foot'><div class='asDiv_footTip'></div></div>";
            $(div).append(inDivHtml);
            $(div).appendTo($("#basemap_container"));

            var dataClassifyUnit = data.classifyUnit;
            var dataset = data.classifyValue;
            //svg的大小
            var width = 478;
            var height = 230;

            var svg = d3.select(".asDiv_svg")
                .append("svg")
                .attr("width",width)
                .attr("height",height)
                .attr("class","asSvg")
                .attr("id","asSvg");

            var dataNum = parseInt(data.classifyValue.length);
            //定义 矩形的边距
            var padding = {top:10,right:10,left:20,bottom:20};
            //矩形所占的宽度-包括空白
            var rectStep = 20;//440/dataNum
            //矩形所占的宽度-不包括空白
            var rectWidth = 20;
            //x轴宽度
            var xAxisWidth = 350;
            //y轴宽度
            var yAxisWidth = 160;
            //比例尺
            var xScale = d3.scale.ordinal()
            // *  重点在这里   通过方法，把数组设置为从 1 开始
                .domain(markData())
                .rangeRoundBands([0,xAxisWidth],0.2);//间隔 0.2

            function markData(){// 自己写的方法，变成数组 从1开始的
                var dataX = d3.range(dataset.length);
                for(l=0;l<dataX.length;l++){
                    dataX[l]=dataX[l]+1;
                }
                return dataX;
            }

            var yScale = d3.scale.linear()
                .domain([0,d3.max(dataset)])
                .range([0,yAxisWidth]);

            var rect = svg.selectAll("rect")//.netrect  这里如何写无所谓，我们只是要一个空集
                .data(dataset)
                .enter()
                .append("rect")
                .attr("fill","steelblue") //颜色 设置为 steelblue
                .attr("x",function(d,k){
                    // * 重点在这里  添加了 1
                    return padding.left+xScale(k+1);
                })
                .attr("y",function(d){
                    return height-padding.bottom-padding.top-yScale(d);
                })
                .attr("width",xScale.rangeBand())
                .attr("height",function(d){
                    return yScale(d);
                });

            var text = svg.selectAll("text")
                .data(dataset)
                .enter()
                .append("text")
                .attr("x",function(d,k){
                    return padding.left+xScale(k+1);
                })
                .attr("y",function(d){
                    return height-padding.bottom-padding.top-yScale(d);
                })
                .attr("dy", function(d) { return "12px" })
                .attr("dx", function(d) { return "16px" })
                .text(function(d,i) {
                    return d+dataClassifyUnit[i]; });

            var xScaleName = d3.scale.ordinal()
            // *  重点在这里   通过方法，把数组设置为从 1 开始
                .domain(markName())
                .rangeRoundBands([0,xAxisWidth],0.2);//间隔 0.2

            function markName(){// 自己写的方法，变成数组 从1开始的
                var dataX = d3.range(dataset.length);
                for(var l=0;l<dataX.length;l++){
                    dataX[l]=data.classify[l];
                }
                return dataX;
            }

            var xAxis = d3.svg.axis()
                .scale(xScaleName)
                .tickValues(data.classify)
                .orient("bottom");

            yScale.range([yAxisWidth,0]);

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

            // svg中添加包含坐标轴的g元素
            var gAxis = svg.append("g")
                .attr("class","asAxis") //坐标轴的样式
                .attr("transform","translate("+ padding.left + "," + (height-padding.bottom-padding.top) + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class","asAxis") //坐标轴的样式 padding.left
                .attr("transform","translate("+ padding.left + "," + (padding.top+padding.bottom+10) + ")")
                .call(yAxis);


            $(".asDiv_close").bind("click",function () {
                $("#asDiv").remove();
            })
        }
        //画图获取后端信息
        function toolBarSetData(evt,areaGraphic){
            var mapMarkersid = [];
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                    mapMarkersid.push(graphics[k].attributes.id);
                }
            }

            var geographicGeometry = evt.geographicGeometry;
            var lenUse = geographicGeometry.rings[0];
            var lonUse = [];
            var latUse = [];
            if(lenUse.length>3){
                for(var i=0;i<lenUse.length-1;i++){
                    lonUse.push(parseFloat(lenUse[i][0]));
                    latUse.push(parseFloat(lenUse[i][1]));
                }
                lonUse.push(parseFloat(lenUse[0][0]));
                latUse.push(parseFloat(lenUse[0][1]));
            }

            var shapeData = {
                "lon":lonUse,
                "lat":latUse,
                id:mapMarkersid
            };
            //在这给该 选区areaGraphic赋值 选区内点数组
            let attr = {
              sign:"toolbar",
              "lon":lonUse,
              "lat":latUse
            };
            areaGraphic.setAttributes(attr);

            $.ajax({
                url: EPMUI.context.url + '/object/shape/polygon',
                type: 'post',
                data: shapeData,
                dataType: 'json',
                traditional: true,//这里设置为true
                success: function (data) {
                    //查询成功
                    let retMarker = arcgisMarkerColor(data);
                    areaGraphic.setAttributes.multipleEntity = retMarker;

                }
            });


        }
        //改变选区内外点颜色
        function arcgisMarkerColor(data){
            var multipleEntity = []; // 选区选中的多个实体 marker
            if(!mapSmallSign) {
                //先把所有点颜色还原
                var graphics = graphicLayer.graphics;
                for (var k = 0; k < graphics.length; k++) {
                    if (graphics[k].attributes.hasOwnProperty("sign") && graphics[k].attributes.sign == "marker") {//判断是一个点
                        var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
                        symbol1.clickSign = "false";
                        graphics[k].setSymbol(symbol1);
                    }
                    if(graphics[k].attributes.hasOwnProperty("sign") && graphics[k].attributes.sign == "text"){//文字标签
                        var textSymbol =  new esri.symbol.TextSymbol(graphics[k].attributes.name);
                        if(mapUseType == "use" || mapstyle == "white"){
                            textSymbol.setColor(new esri.Color([51,208,255,1]));
                        }else{
                            textSymbol.setColor(new esri.Color([255,255,255,1]));
                        }
                        textSymbol.setOffset(35, 10);
                        graphics[k].setSymbol(textSymbol);

                    }

                }

                if (data.magicube_interface_data.hasOwnProperty("entity")) {
                    var graphics = graphicLayer.graphics;
                    for (var k = 0; k < graphics.length; k++) {
                        for (var j = 0; j < data.magicube_interface_data.entity.length; j++) {
                            if (graphics[k].attributes.hasOwnProperty("sign") && graphics[k].attributes.sign === "marker") {//判断是一个点
                                if (graphics[k].attributes.id === data.magicube_interface_data.entity[j].id) {
                                    var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-click.svg", 25, 30);
                                    symbol1.clickSign = "true";
                                    graphics[k].setSymbol(symbol1);
                                    multipleEntity.push(graphics[k]);
                                }
                            }
                        }
                    }
                }

            }
            return multipleEntity;
        }
        // 修改：轨迹路径 和 动画分离
        function runCurveAnimation(points,basePoint,sign,tripMode,tripNum, lushuName){
            let lushu = mapCommonPart.getLuShuByName(lushuName);

            if(tripNum==0){
                curveAnimation(points,basePoint,sign,tripMode,tripNum, lushuName);
            }else{
                var stopnum = 0;
                var lushuSetInt = setInterval(function(){
                    stopnum++;
                    if(tripNum==lushu.size){
                        curveAnimation(points,basePoint,sign,tripMode,tripNum, lushuName);
                        clearInterval(lushuSetInt);
                    }
                    if(stopnum>150){
                        clearInterval(lushuSetInt);
                    }
                },500);
                lushu.lushu.push(lushuSetInt); // 把定时器存到相关的数据下
            }
        }
        //轨迹动画
        function curveAnimation(points,basePoint,sign,tripMode,tripNum,lushuName) {
            let lushu = mapCommonPart.getLuShuByName(lushuName);
            var pt = new esri.geometry.Point(points[0].lon, points[0].lat);

            //设置标注显示的图标
            var symbol1;
            if(tripMode === "car"){
                symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[1], 20, 25);
            }else if(tripMode === "airplane"){
                symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[0], 30, 30);
            }else if(tripMode === "train"){
                symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[2], 20, 25);
            }else if(tripMode === "boat"){
              symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[3], 30, 35);
            }else if(tripMode === "no"){
              symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[3], 1, 1);
            }else{
              symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[1], 20, 25);
            }
            symbol1.setColor(new esri.Color([	220,20,60,1]))
            symbol1.clickSign = "false";

            //要在模版中显示的参数
            var attr = {
                sign:"curveAnimationPoint"
            };

            //创建图像
            var graphic = new esri.Graphic(pt, symbol1,attr);
            //把图像添加到刚才创建的图层上
            graphicLayer.add(graphic);

            var cAsize = 0;//记录走过的位置
            var cA = setInterval(function () {
                if(cAsize<points.length){
                    var geometry = new esri.geometry.Point(points[cAsize].lon, points[cAsize].lat);
                    graphic.setGeometry(geometry);
                    if(cAsize>0){
                        //动图角度调整
                        var angle = setAnimationRotation(points[cAsize-1],points[cAsize]);

                        //graphic.symbol.setAngle(angle);
                        graphic.symbol.setAngle(angle-90);
                        var addCurveData = [];
                        addCurveData.push(points[cAsize-1]);
                        addCurveData.push(points[cAsize]);
                        //addCurve(addCurveData,basePoint,points[0],sign); // 小车跑过路线变色
                    }
                    cAsize++;
                }else{
                  lushu.size = lushu.size+1;
                  clearInterval(cA);
                  //图标也要去掉了
                  graphicLayer.remove(graphic);

                  var tripDataSize = tripData.length+1;
                  if(tripData && tripDataSize == lushu.size){//添加预测区域
                    let expectPoint = {
                      "gis": [
                        109.7633487,
                        5.5435468
                      ],
                      "tripMode": "airplane",
                      "name": "[109.7633487,5.5435468]",
                      "time": "2017-11-13 04:22:00"
                    };

                    let l = tripData.length;
                    var addFirst = {
                      time:tripData[l-1].time,
                      tripMode:tripData[l-1].tripMode,
                      address: tripData[l-1].name,
                      gis: {
                        lon: tripData[l-1].gis[0],
                        lat: tripData[l-1].gis[1]
                      }
                    };

                    var addSecond = {
                      time:expectPoint.time,
                      tripMode:expectPoint.tripMode,
                      address: expectPoint.name,
                      gis: {
                        lon: expectPoint.gis[0],
                        lat: expectPoint.gis[1]
                      }
                    };
                    var addlinePoints = mapCommonPart.getCurveByTwoPoints(addFirst,addSecond);
                    var bPoint = {
                       gis: {
                        lon: mapCommon.mapWorkMarker[0].graphic.attributes.gis.lon,
                        lat: mapCommon.mapWorkMarker[0].graphic.attributes.gis.lat
                       },
                       id:mapCommon.mapWorkMarker[0].graphic.attributes.id
                     };

                    addCurve(addlinePoints,bPoint,addSecond,"dashed","dashed");

                  }

                }
            },100);

        }
        //动画角度调整 在每个点的真实步骤中设置小车转动的角度
        function setAnimationRotation(curPos,targetPos){
            var me = this;
            var deg = 0;

            if(targetPos.lon != curPos.lon){
                var tan = (targetPos.lat - curPos.lat)/(targetPos.lon - curPos.lon),
                    atan  = Math.atan(tan);
                deg = atan*360/(2*Math.PI);
                //degree  correction;
                if(targetPos.lon < curPos.lon){
                    deg = -deg;

                } else {// 这个地方有问题
                    deg = 180-deg;
                }
                return deg;
            }else {
                var disy = targetPos.lat- curPos.lat ;
                var bias = 0;
                disy > 0 ? bias=-1 : bias = 1;
                return -bias * 90;
            }
            return;
        }
        //添加弧线路径
        function addCurve(points,baseP,lastP,sign,CurveType){
          var color;
          if(sign==="place"){
              color = new esri.Color([127,255,0,1]);//127,255,0
          }else if(sign==="track"){
              color = new esri.Color([253,175,0,1]);//253,175,0
          }else if(sign==="base" || sign==="last"){
              color = new esri.Color([34,179,255,1]);//170,33,22
          }else{
              color = new esri.Color([34,179,255,1]);//127,255,0
          }

          if(sign === "dashed"){ // 预测区域不加点
            var pt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
            //设置标注显示的图标
            var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/twinkle.gif", 50, 50);
            symbol1.clickSign = "false";
            //要在模版中显示的参数
            var attr = {
              sign:"CurvePoint",
              address:lastP.address,
              id:baseP.id
            };
            //创建图像
            var graphic = new esri.Graphic(pt, symbol1,attr);
            //把图像添加到刚才创建的图层上
            graphicLayer.add(graphic);

            setTimeout(function () {
              //加文字标签
              var textattr = {
                address:lastP.name,
                id:baseP.id,
                sign:"text"
              };
              var textpt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
              var textSymbol =  new esri.symbol.TextSymbol("预测区域");
              textSymbol.setColor(new esri.Color([255,255,0,1]));
              textSymbol.setOffset(0, -50);
              //创建图像
              var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);
              //把图像添加到刚才创建的图层上
              graphicLayer.add(textGraphic);

              //添加一个预测区域 ----
              var symbolC = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SHORTDASHDOT);
              symbolC.setColor([220,20,60,0.3]).outline.setColor([220,20,60,0.4]);

              var circleC = new esri.geometry.Circle({
                "center": [lastP.gis.lon,lastP.gis.lat],
                "radius": 120000
              });
              var circleattr = {
                address:lastP.name,
                id:baseP.id,
                sign:"circle"
              };
              var circleGraphic = new esri.Graphic(circleC, symbolC,circleattr);
              graphicLayer.add(circleGraphic);
            },1000)

            return '';
          }

          for(var i=1;i<points.length;i++){
              var polylineJson = {
                  "paths":[[
                      [points[i].lon,points[i].lat],
                      [points[i-1].lon,points[i-1].lat]
                  ]],
                  "spatialReference":{"wkid":4326}
              };

              var polyline = new esri.geometry.Polyline(polylineJson);

              var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID);
              lineSymbol.setColor(color);
              if(CurveType === "dashed"){
                lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDASHDOT);
                lineSymbol.setColor([220,20,60,1]);
              }

              lineSymbol.setWidth(1);
              let time = lastP.time ? lastP.time : "";
              var lineAttr = {
                  sign:"Curveline",
                  id:baseP.id,
                  time:time
              }

              var graphicLine = new esri.Graphic(polyline, lineSymbol, lineAttr);
              lineGraphicLayer.add(graphicLine);
          }
          if(sign === "base"){
             //在最后位置加点
             var pt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
             //设置标注显示的图标
             var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle.png", 20, 20);
             symbol1.clickSign = "false";
             //要在模版中显示的参数
             var attr = {
                 sign:"CurvePoint",
                 address:lastP.address,
                 id:baseP.id
             };
             //创建图像
             var graphic = new esri.Graphic(pt, symbol1,attr);
             //把图像添加到刚才创建的图层上
             graphicLayer.add(graphic);

            //加文字标签
            var textattr = {
              time:lastP.time,
              id:baseP.id,
              sign:"text"
            };
            var textpt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
            var textSymbol =  new esri.symbol.TextSymbol(lastP.address);
            textSymbol.setColor(new esri.Color([255,25,0,1]));
            textSymbol.setOffset(0, 10);
            //创建图像
            var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);
            //把图像添加到刚才创建的图层上
            graphicLayer.add(textGraphic);

          }else if(sign === "last"){
            //在最后位置加点
            var pt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
            //设置标注显示的图标
            var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle.png", 20, 20);
            symbol1.clickSign = "false";
            //要在模版中显示的参数
            var attr = {
              sign:"CurvePoint",
              address:lastP.address,
              id:baseP.id
            };
            //创建图像
            var graphic = new esri.Graphic(pt, symbol1,attr);
            //把图像添加到刚才创建的图层上
            graphicLayer.add(graphic);

            //加文字标签
            var textattr = {
              time:lastP.time,
              id:baseP.id,
              sign:"text"
            };
            var textpt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
            var textSymbol =  new esri.symbol.TextSymbol(lastP.address);
            textSymbol.setColor(new esri.Color([255,25,0,1]));
            textSymbol.setOffset(0, 10);
            //创建图像
            var textGraphic = new esri.Graphic(textpt, textSymbol,textattr);
            //把图像添加到刚才创建的图层上
            graphicLayer.add(textGraphic);

          }

        }
        //设置地图基本属性 --
        window.setmapProperty = function (drag, zoom, dblClick, pan){
            if(drag === "drag-true"){

            }else if(drag === "drag-false"){

            }

            if(zoom === "zoom-true"){
                map.enableScrollWheelZoom(); //启用滚轮放大缩小，默认禁用
            }else if(zoom === "zoom-false"){
                map.disableScrollWheelZoom(); //禁用 滚轮放大缩小
            }

            if(dblClick === "dbl-true"){
                map.enableDoubleClickZoom(); //启用鼠标双击放大
            }else if(dblClick === "dbl-false"){
                map.disableDoubleClickZoom(true);   //禁用双击放大
            }

            if(pan === "pan-true"){
                map.enablePan(); //启用鼠标双击放大
            }else if(pan === "pan-false"){
                map.disablePan(true);   //禁用双击放大
            }


        };
        //隐藏picturelayer中的点
        window.arcgisHidePoint = function(points,areas) {
            //让所有的显示，判断符合条件的显示
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                     graphics[k].show();
                }
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "text"&&mapFontStatus){//判断是点上字
                    graphics[k].show();

                }
            }

            for(var i=0;i<points.length;i++){
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                        if(graphics[k].attributes.id === points[i].attributes.attr.id){
                            graphics[k].hide();
                        }
                    }
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "text"){//判断是点上字
                        if(graphics[k].attributes.id === points[i].attributes.attr.id){
                            graphics[k].hide();
                        }
                    }
                }
            }

            for(var i=0;i<areas.length;i++){
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                        if(graphics[k].attributes.id === areas[i].attributes.ps.attr.id){
                            graphics[k].hide();
                        }
                    }
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "text"){//判断是点上字
                        if(graphics[k].attributes.id === areas[i].attributes.ps.attr.id){
                            graphics[k].hide();
                        }
                    }
                }
            }



        };
        //地图点线还原
        window.arcgisOpacity = function(sign){
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline"){//判断是线
                    var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH,
                        new esri.Color([253,221,155,1]),
                        1);
                    lineSymbol.setColor(new esri.Color([253,221,155,1]));
                    graphics[k].setSymbol(lineSymbol);
                }
            }
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")){//判断是点
                    if(graphics[k].attributes.sign === "marker"&&graphics[k].attributes.hasOwnProperty("addnode")&&graphics[k].symbol.clickSign !== "move"){
                        var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker.svg", 25, 25);
                        symbol1.clickSign = "false";
                        graphics[k].setSymbol(symbol1);
                    }
                    if(graphics[k].attributes.sign === "text"){//点的名称
                        //$(graphics[k]._shape.rawNode).css("fill","white");
                        //$("#graphicsLayer4_layer text").css("fill","white");
                        graphics[k].setAttributes( {"fill":"white !important"});
                        //$(evt.target.nextElementSibling).parent().children("text").css("fill","white");
                    }
                }
            }

        }
        //时间轴
        window.gisTimeLine = function(times){
          /*if(timelineIntervalSign){
            //为了操作效果，只要动了时间轴，就禁止轨迹小车等的移动
            for(let l=0;l<lushuNum.length;l++){
              let lushus = lushuNum[l].lushu;
              for(let k=0;k<lushus.length;k++){
                clearInterval(lushus[k]);
              }
            }
            timelineIntervalSign = false;
          }*/


          let baseLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([34,179,255,1]), 1);
          baseLineSymbol.setColor(new esri.Color([34,179,255,1]));
          let lineGraphics = lineGraphicLayer.graphics;
          //所有线还原，再判断符合要求的线//活动选择时间段，对应点线 选中
          if(times.length <= 0){
            for(let k=0;k<lineGraphics.length;k++){
              if(lineGraphics[k].attributes.hasOwnProperty("sign") && lineGraphics[k].attributes.sign === "Curveline"){//判断是曲线
                lineGraphics[k].setSymbol(baseLineSymbol);
              }
            }
          }

          let selectedLines = [];

          for(let t=0;t<times.length;t++){
            for(let k=0;k<lineGraphics.length;k++){
              if(lineGraphics[k].attributes.hasOwnProperty("sign") && lineGraphics[k].attributes.sign === "Curveline"){//判断是曲线
                lineGraphics[k].setSymbol(baseLineSymbol);
                if(lineGraphics[k].attributes.time == times[t]){
                  //线条颜色变化STYLE_DASH
                  selectedLines.push(lineGraphics[k]);

                }
              }
            }
          }

          let lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([170,33,22,1]), 1);
          lineSymbol.setColor(new esri.Color([170,33,22,1]));
          for(let k=0;k<selectedLines.length;k++){
            selectedLines[k].setSymbol(lineSymbol);
          }

            //活动选择时间段，对应点线 选中
            /*var selectedId = [];

            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline"){//判断是线
                    if(graphics[k].attributes.time == time){
                        selectedId.push(graphics[k].attributes.source.id);
                        selectedId.push(graphics[k].attributes.target.id);
                        //线条颜色变化

                        var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH,
                            new esri.Color([45,165,218,1]),
                            1);
                        lineSymbol.setColor(new esri.Color([45,165,218,1]));
                        graphics[k].setSymbol(lineSymbol);

                    }
                }
            }

            var graphics = graphicLayer.graphics;
            //点变化颜色
            for(var j=0;j<selectedId.length;j++){
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")){//判断是点
                        if(graphics[k].attributes.sign === "marker"&&graphics[k].attributes.id === selectedId[j]){
                            var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-click.svg", 25, 30);
                            symbol1.clickSign = "true";
                            graphics[k].setSymbol(symbol1);
                        }
                        if(graphics[k].attributes.sign === "text"&&graphics[k].attributes.id === selectedId[j]){//点的名称
                            graphics[k].attr("fill","red !important");
                            graphics[k].setAttributes( {"fill":"red !important"});
                            //$(graphics[k]._shape.rawNode).css("fill","red");
                        }
                    }

                }
            }*/

        }
        //地图信息保存
        window.mapSaveLocalStorage = function () {
            localStorage.removeItem("mapOverlays");
            var mapOverlaysMarker = [];
            var mapOverlaysLine = [];
            var graphics = graphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "marker"){//判断是一个点
                    var obj = {
                        id: graphics[k].attributes.id,
                        type: graphics[k].attributes.type,
                        objectType: graphics[k].attributes.objectType,
                        name: graphics[k].attributes.name,
                        nodeId: graphics[k].attributes.nodeId,
                        addnode: graphics[k].attributes.addnode,
                        gis: graphics[k].attributes.gis
                    };

                    mapOverlaysMarker.push(obj);
                }
            }
            var graphics = lineGraphicLayer.graphics;
            for(var k=0;k<graphics.length;k++){
                if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline"){//判断是一个线
                    var obj = {
                        relationId:graphics[k].attributes.relationId,
                        relationParentType:graphics[k].attributes.relationParentType,
                        relationTypeName: graphics[k].attributes.relationTypeName,
                        time:graphics[k].attributes.time,
                        source:graphics[k].attributes.source,
                        target:graphics[k].attributes.target,
                        sign:"polyline"
                    }

                    mapOverlaysLine.push(obj);
                }
            }

            var setMapOverlaysMarker = mapOverlaysMarker?mapOverlaysMarker:"false";
            var setMapOverlaysLine = mapOverlaysLine?mapOverlaysLine:"false";

            var localMapOverlays = {
                overlaysMarker:setMapOverlaysMarker,
                overlaysLine:setMapOverlaysLine
            };

            localStorage.setItem("mapOverlays", JSON.stringify(localMapOverlays) );
        };
        //对应地图Menu的方法：
        window.mapOwnFun = {
            /**
             * mapAddTopoMenu           : 添加div到地图
             * mapShowBayonetMenu       : 菜单-实时监控按钮
             * mapRemoveTopoMenu        : 菜单上删除按钮 --ok
             * mapMoveTopoMenu          : 移动功能 --ok
             * mapSaveTopoMenu          : 存点功能 --ok
             * mapCheckTopoMenu         : 查看功能 --ok
             * mapOffTopoMenu           : 取消功能  -- ok
             * mapExtendTopoMenu        : 扩展功能 --ok
             * mapMoreExtendTopoMenu    : 更多
             * mapPathTopoMenu          : 轨迹功能  --ok
             * mapRemovePathTopoMenu    : 移除轨迹 --ok
             * mapAddAreaMenu           : 添加选区到地图
             * mapClickAreaMenu         :
             * mapExtendAreaMenu        : 地图选区 - 拓展菜单
             * mapRemoveAreaMenu        : 地图选区 - 删除菜单
             * mapAddKeyAreaMenu        : 地图选区 - 添加重点区域菜单
             */
            mapAddTopoMenu:function(div){
                $(div).appendTo($("#basemap_container"));
            },
            mapShowBayonetMenu:function(warningData){
              if(warningData){
                warningData.forEach(wd => {
                  addMapOverlays(wd,"bayonetMV");
                });
              }else{
                let markerData = mapCommon.mapWorkMarker[0].graphic.attributes;
                addMapOverlays(markerData,"bayonetMV");
              }

            },
            mapRemoveTopoMenu:function(){
                d3.select("#newDiv").remove();
                mapdisk = false;
                map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
                map.enableDoubleClickZoom();//启用鼠标双击放大
                map.enablePan();//允许平移地图

                var delmarkers = [];
                if(shiftSign){
                    for (var t=0;t<shiftGraphic.length;t++){
                        delmarkers.push(shiftGraphic[t]);
                    }
                    deleteMarker(delmarkers);
                    // 终止shift
                    shiftSign = false;
                    shiftGraphic = [];
                }else{
                    delmarkers.push(mapCommon.mapWorkMarker[0].graphic);
                    deleteMarker(delmarkers);
                }
            },
            mapMoveTopoMenu:function(evt){
                d3.select("#newDiv").remove();
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/marker-move.svg", 25, 30);
                symbol1.clickSign = "move";
                evt.graphic.setSymbol(symbol1);

                //editToolbar.activate(esri.toolbars.Edit.MOVE , evt.graphic);
                let newEdit = new esri.toolbars.Edit(map);//工具
                newEdit.activate(esri.toolbars.Edit.MOVE , evt.graphic);
                allEdit.push(newEdit);

                //相关的文字，线条随动
                let moveText;
                var graphics = graphicLayer.graphics;
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "text"){//判断是字
                        if(graphics[k].attributes.id === evt.graphic.attributes.id){
                            moveText = graphics[k];
                        }
                    }
                }
                newEdit.on('graphic-move',function(event){
                    //进行了三种坐标的转化
                    let XYdata = map.toScreen( new esri.geometry.Point(event.graphic.geometry.x, event.graphic.geometry.y) )
                    let LngLatdataMap = map.toMap(new esri.geometry.ScreenPoint(XYdata.x+event.transform.dx, XYdata.y+event.transform.dy));
                    let xyToLngLat = {
                        x:LngLatdataMap.x,
                        y:LngLatdataMap.y
                    };
                    let LngLatdata = turnSpace(xyToLngLat,"xyToLngLat");//返回值是数组

                    let pt = new esri.geometry.Point(LngLatdata[0], LngLatdata[1]);
                    moveText.setGeometry(pt);//移动文字
                    var graphics = lineGraphicLayer.graphics;

                    //console.log("================一个循环==============");
                    for(var k=0;k<graphics.length;k++){
                        var sourcePoint,targetPoint;
                        var paths = [];
                        if(graphics[k].attributes.hasOwnProperty("sign")&&graphics[k].attributes.sign === "polyline"){//判断是线
                            if(graphics[k].attributes.source.id === evt.graphic.attributes.id ){
                                sourcePoint = {
                                    gis:{
                                        lon:LngLatdata[0],
                                        lat:LngLatdata[1]
                                    }
                                };
                                targetPoint = {
                                    gis:{
                                        lon:graphics[k].attributes.target.gis.lon,
                                        lat:graphics[k].attributes.target.gis.lat
                                    }
                                };
                                var curvepath = mapCommonPart.getCurveByTwoPoints(sourcePoint, targetPoint, graphics[k].attributes.lineSizeNum);

                                for(var i=0;i<curvepath.length;i++){
                                    var newpath = [curvepath[i].lon,curvepath[i].lat];
                                    paths.push(newpath);
                                }

                                var polylineJson = {
                                    "paths":[paths],
                                    "spatialReference":{"wkid":4326}
                                };

                                var polyline = new esri.geometry.Polyline(polylineJson);
                                graphics[k].setGeometry(polyline);//移动连线
                                graphics[k].attributes.source.gis = sourcePoint.gis;//测试
                                //对应文字移动
                                var textgraphics = graphicLayer.graphics;
                                for(var l=0;l<textgraphics.length;l++){
                                  if(textgraphics[l].attributes.hasOwnProperty("sign")&&textgraphics[l].attributes.sign === "polylinetext"){//判断是线上字
                                    if(textgraphics[l].attributes.relationId === graphics[k].attributes.relationId && textgraphics[l].attributes.relationTypeName === graphics[k].attributes.relationTypeName ){
                                      var centerNum = parseInt(curvepath.length/2);
                                      var lineCenter = curvepath[centerNum];
                                      var textpt = new esri.geometry.Point(lineCenter.lon, lineCenter.lat);
                                      textgraphics[l].setGeometry(textpt);//移动线上字
                                    }
                                  }
                                }
                            }
                            if(graphics[k].attributes.target.id === evt.graphic.attributes.id ){
                                 sourcePoint = {
                                    gis:{
                                        lon:graphics[k].attributes.source.gis.lon,
                                        lat:graphics[k].attributes.source.gis.lat
                                    }
                                };
                                 targetPoint = {
                                    gis:{
                                        lon:LngLatdata[0],
                                        lat:LngLatdata[1]
                                    }
                                };
                                var curvepath = mapCommonPart.getCurveByTwoPoints(sourcePoint, targetPoint, graphics[k].attributes.lineSizeNum);

                                for(var i=0;i<curvepath.length;i++){
                                    var newpath = [curvepath[i].lon,curvepath[i].lat];
                                    paths.push(newpath);
                                }

                                var polylineJson = {
                                    "paths":[paths],
                                    "spatialReference":{"wkid":4326}
                                };

                                var polyline = new esri.geometry.Polyline(polylineJson);
                                graphics[k].setGeometry(polyline);//移动连线
                                graphics[k].attributes.target.gis = targetPoint.gis;//测试
                                //对应文字移动
                                var textgraphics = graphicLayer.graphics;
                                for(var l=0;l<textgraphics.length;l++){
                                    if(textgraphics[l].attributes.hasOwnProperty("sign")&&textgraphics[l].attributes.sign === "polylinetext"){//判断是线上字
                                        if(textgraphics[l].attributes.relationId === graphics[k].attributes.relationId && textgraphics[l].attributes.relationTypeName === graphics[k].attributes.relationTypeName ){
                                            var centerNum = parseInt(curvepath.length/2);
                                            var lineCenter = curvepath[centerNum];
                                            var textpt = new esri.geometry.Point(lineCenter.lon, lineCenter.lat);
                                            textgraphics[l].setGeometry(textpt);//移动线上字
                                        }
                                    }
                                }


                            }
                        }
                    }
                });

            },
            mapSaveTopoMenu:function(evt){
                d3.select("#newDiv").remove();
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                for(var i=0;i<allEdit.length;i++){
                    if(evt.graphic.attributes.id === allEdit[i].getCurrentState().graphic.attributes.id){
                        allEdit[i].deactivate();
                    }
                }

                //把点的经纬度传给后端
                $.get(EPMUI.context.url + '/object/gis/property', {objectType: evt.graphic.attributes.type}, function (reData) {
                  if (!reData) {
                    return false;
                  }
                  let gistypeData = JSON.parse(reData);
                  let gistype;
                  let propertyName;

                  if (parseInt(gistypeData.code) === 200) {

                    gistype = gistypeData.magicube_interface_data;
                    propertyName = gistype;

                  }else{
                    showAlert("提示!", "获取经纬度字段失败", "#ffc000");
                    return false;
                  }

                  //把点的经纬度传给后端
                  var editObject = {
                    "modify": [
                      {
                        "propertyName": propertyName,
                        "value": [
                          evt.graphic.geometry.x,
                          evt.graphic.geometry.y
                        ]
                      }
                    ]
                  };

                  $.post(EPMUI.context.url + '/object/detailInformation', {modifyJson: JSON.stringify(editObject), id: evt.graphic.attributes.id, type: evt.graphic.attributes.type}, function (data) {
                    if (!data) {
                      return false;
                    }
                    var datas = JSON.parse(data);

                    if (parseInt(datas.code) === 200) {
                      thisMarker.disableDragging();   // 不可拖拽thisMarker.enableDragging(false);
                      //设置marker点的经纬度信息
                      thisMarker.gis.lon = thisMarker.point.lng;
                      thisMarker.gis.lat =   thisMarker.point.lat;
                      thisMarker.baseMsg.gis.lon = thisMarker.point.lng;
                      thisMarker.baseMsg.gis.lat =   thisMarker.point.lat;
                      mapSetIcon(thisMarker, markerPathPeople, 0.6, 0, 'red', 20, 42);
                      showAlert("提示!", datas.message, "#33d0ff");
                    } else {
                      showAlert("提示!", datas.message, "#ffc000");
                    }
                  })

                });

            },
            mapCheckTopoMenu:function(){
                d3.select("#newDiv").remove();
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                mapSaveLocalStorage();
            },
            mapOffTopoMenu:function(){
                $("svg[type='system']").css("cursor","pointer");
                d3.select("#newDiv").remove();
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
            },
            mapExtendTopoMenu:function(thisMarker, extendSign,extendUrl){
                var Id = thisMarker.graphic.attributes.id;
                var nodeType = thisMarker.graphic.attributes.type;
                var nodeId = thisMarker.graphic.attributes.nodeId;
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                if(shiftSign){
                    Id = [];
                    nodeType = [];
                    nodeId = [];
                    var mapMainRadrawMarkers = [];
                    for (var t=0;t<shiftGraphic.length;t++){
                        //给工作台的标志点
                        var baseMsg = shiftGraphic[t].attributes;
                        var newMarker = {
                            addnode: true,
                            gis: shiftGraphic[t].attributes.gis,
                            id: shiftGraphic[t].attributes.id,
                            name: shiftGraphic[t].attributes.name,
                            nodeId: shiftGraphic[t].attributes.nodeId,
                            objectType: shiftGraphic[t].attributes.objectType,
                            type: shiftGraphic[t].attributes.type,
                            baseMsg: baseMsg
                        };
                        Id.push(shiftGraphic[t].attributes.id);
                        nodeType.push(shiftGraphic[t].attributes.type);
                        nodeId.push(shiftGraphic[t].attributes.nodeId);
                        mapMainRadrawMarkers.push(newMarker);
                    }
                    mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "multi", Id, nodeType, nodeId, extendSign,extendUrl);
                    Id = [];
                    nodeType = [];
                    nodeId = [];
                    setTimeout(function () {
                        shiftSign = false;
                        shiftGraphic = [];
                    },1000);
                }else{
                    //给工作台的标志点
                    var baseMsg = mapCommon.mapWorkMarker[0].graphic.attributes;
                    var marker = {
                        addnode: true,
                        gis: mapCommon.mapWorkMarker[0].graphic.attributes.gis,
                        id: mapCommon.mapWorkMarker[0].graphic.attributes.id,
                        name: mapCommon.mapWorkMarker[0].graphic.attributes.name,
                        nodeId: mapCommon.mapWorkMarker[0].graphic.attributes.nodeId,
                        objectType: mapCommon.mapWorkMarker[0].graphic.attributes.objectType,
                        type: mapCommon.mapWorkMarker[0].graphic.attributes.type,
                        baseMsg: baseMsg
                    };

                    var mapMainRadrawMarkers = [];
                    mapMainRadrawMarkers.push(marker);
                    mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", Id, nodeType, nodeId, extendSign,extendUrl);
                }


            },
            mapMoreExtendTopoMenu:function(mapMainRadrawMarkers, Id, nodeType, nodeId, systemId){
                var manyMarkers = [];
                for(var i=0;i<mapMainRadrawMarkers.length;i++){
                    manyMarkers.push(mapMainRadrawMarkers[i].graphic.attributes);
                }
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                mapCommonPart.mapMainRadraw(manyMarkers, "single", Id, nodeType, nodeId, systemId,'/leaves/');
            },
            mapPathTopoMenu:function(marker){
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                mapPathSgin = true;
            },
            mapRemovePathTopoMenu:function(Id){
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                $(".map_path").hide();
                mapPathSgin = false;
                var graphics = graphicLayer.graphics;
                var delgraphics = [];
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")){//判断是一个点
                        if(graphics[k].attributes.sign === "Curveline"||graphics[k].attributes.sign === "CurvePoint"||graphics[k].attributes.sign === "circle"){
                            if(graphics[k].attributes.id === mapCommon.mapWorkMarker[0].graphic.attributes.id){
                                delgraphics.push(graphics[k]);
                            }
                        }
                    }
                }
                for(var j=0;j<delgraphics.length;j++){
                    graphicLayer.remove(delgraphics[j]);
                }
                var graphics = lineGraphicLayer.graphics;
                var delgraphics = [];
                for(var k=0;k<graphics.length;k++){
                    if(graphics[k].attributes.hasOwnProperty("sign")){
                        if(graphics[k].attributes.sign === "Curveline"){
                            if(graphics[k].attributes.id === mapCommon.mapWorkMarker[0].graphic.attributes.id){
                                delgraphics.push(graphics[k]);
                            }
                        }
                    }
                }
                for(var j=0;j<delgraphics.length;j++){
                    lineGraphicLayer.remove(delgraphics[j]);
                }
            },
            mapAddAreaMenu:function(a){
                var div = document.createElement("div");
                div.setAttribute("id", "newDiv");
                div.style.position = "absolute";
                div.style.left = a.clientX - 250 + "px";
                div.style.top = a.clientY - 300 + "px";
                div.style.fontSize = "12px";

                var svg = $("<svg class='complexCustomOverlay' style='width: 500px;height: 500px; cursor:pointer;'> </svg>").appendTo(div);
                $(div).appendTo($("#basemap_container"));
            },
            mapClickAreaMenu:function(e, sign){
                var multipleEntity = e.graphic.attributes.multipleEntity;
                //选区统计
                var allNodeId = {
                    ids: [],
                    types: []
                };
                for(var k=0;k<multipleEntity.length;k++){
                    allNodeId.ids.push(multipleEntity[k].attributes.id);
                    allNodeId.types.push(multipleEntity[k].attributes.type);
                }
                getTotalMessage(allNodeId); //统计信息

                d3.select("#newDiv").remove();
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
            },
            mapClickKeyAreaMenu:function(sign){
              setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
              let areaAttr = mapCommon.mapKeyArea.areaLays.graphic.attributes;
              if(sign === "delete"){
                const url = EPMUI.context.url + '/object/deleteKeyArea';
                let data = {"areaId":areaAttr.id};
                let completed = function (){ return false; };
                let succeed = function(returnData) {
                  if (!returnData) {
                    return false;
                  }
                  let datas = returnData;
                  if (parseInt(datas.code) === 200) {
                    keyAreaLayer.remove(mapCommon.mapKeyArea.areaLays.graphic);
                    showAlert("提示!", datas.message, "#33d0ff");
                  } else {
                    showAlert("提示!", datas.message, "#ffc000");
                  }
                };
                let judgment = function() { return false; };
                mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);
              }
              if(sign === "peoplemove"){
                  var returnData = [
                    {
                      populationSize: 1000,
                      source:{
                        gis: {
                          lon: 116.4551,
                          lat: 40.2539
                        },
                        address: "北京"

                      },
                      target:{
                        gis: {
                          lon: 76.9043,
                          lat: 41.001
                        },
                        address: "贵州省贵阳市南明区花果园大街1号"
                      }
                    },
                    {
                      populationSize: 3000,
                      source:{
                        gis: {
                          lon: 116.4551,
                          lat: 40.2539
                        },
                        address: "北京"

                      },
                      target:{
                        gis: {
                          lon: 105.9961,
                          lat: 37.3096
                        },
                        address: "宁夏市南明区花果园大街1号"
                      }
                    },
                    {
                      populationSize: 9900,
                      source:{
                        gis: {
                          lon: 116.4551,
                          lat: 40.2539
                        },
                        address: "北京"

                      },
                      target:{
                        gis: {
                          lon: 120.498,
                          lat: 29.0918
                        },
                        address: "浙江省南明区花果园大街1号"
                      }
                    },
                    {
                      populationSize: 1000,
                      source:{
                        gis: {
                          lon: 116.4551,
                          lat: 40.2539
                        },
                        address: "北京"

                      },
                      target:{
                        gis: {
                          lon: 117.2461,
                          lat: 32.0361
                        },
                        address: "贵州省贵阳市南明区花果园大街1号"
                      }
                    },
                    {
                      populationSize: 1000,
                      source:{
                        gis: {
                          lon: 116.4551,
                          lat: 40.2539
                        },
                        address: "北京"

                      },
                      target:{
                        gis: {
                          lon: 122.3438,
                          lat: 41.0889
                        },
                        address: "辽宁省贵阳市南明区花果园大街1号"
                      }
                    },
                    {
                      populationSize: 1000,
                      source:{
                        gis: {
                          lon: 121.4648,
                          lat: 31.2891
                        },
                        address: "上海市果园大街1号"

                      },
                      target:{
                        gis: {
                          lon: 101.8652,
                          lat: 25.1807
                        },
                        address: "贵州省贵阳市南明区花果园大街1号"
                      }
                    }
                  ];
                  peopleMove(returnData);
              }
              if(sign === "analyse"){
                  if(areaAttr.analyse){// 关闭统计功能
                      $("#asDiv").remove();
                      $("."+areaAttr.id).remove();
                      areaAttr.analyse = false;
                  }else{//未统计，开始统计
                      //请求后端，获得数据
                      areaStatisticsData = [
                          {
                              "areaId":areaAttr.id,
                              area:"金凤区",
                              gis:{
                                  lon: 106.228217,
                                  lat: 38.497279
                              },
                              classify:["危险事件","犯罪人员","车祸报告","险情信息","涉疆人员"],
                              classifyValue:[23,55,76,55,146],
                              classifyUnit:["件","人","条","条","人"]
                          },
                          {
                              "areaId":areaAttr.id,
                              area:"湖滨西街",
                              gis:{
                                  lon: 109.272773,
                                  lat: 32.483666
                              },
                              classify:["危险事件","犯罪人员","涉疆人员"],
                              classifyValue:[23,55,76],
                              classifyUnit:["件","人","人"]
                          }
                      ];
                      var areadata = areaStatisticsData;
                      areaStatistics(areadata);
                      areaAttr.analyse = true;
                  }
              }
              if(sign === "payonet"){
                let areaIds = [];
                areaIds.push(areaAttr.id);
                $.ajax({
                  url: EPMUI.context.url + '/gis/keyArea/searchbyId',
                  type: 'POST',
                  data: {
                    "areaIds": areaIds
                  },
                  dataType: 'json',
                  success: function (data) {
                    if (data.code == "200"){
                      let returnData = data.magicube_interface_data;
                      if(returnData[0].bayonetIds.length>0){
                        $.ajax({
                          url: EPMUI.context.url + '/gis/bayonet/id',
                          type: 'post',
                          data: {
                            id: returnData[0].bayonetIds
                          },
                          success: function(data) {
                            let gisData = JSON.parse(data).magicube_interface_data;
                            let warningData = [];
                            for(let i=0;i<gisData.length;i++){
                              let obj = {
                                id: gisData[i].id,
                                type: gisData[i].type,
                                objectType: gisData[i].objectType,
                                page_type:gisData[i].pageType,
                                name: gisData[i].name,
                                nodeId: gisData[i].nodeId,
                                gis:{
                                  lon:gisData[i].gis.lon,
                                  lat:gisData[i].gis.lat
                                }
                              };
                              warningData.push(obj);
                            }
                            if(warningData.length > 0){
                              createMarkerLine(warningData,[]);
                            }else{
                              showAlert("提示!", "暂无数据", "#33d0ff");
                            }
                          }
                        });
                      }else{
                        showAlert("提示!", "暂无数据", "#33d0ff");
                      }


                    }
                  }
                });

              }
            },
            mapExtendAreaMenu:function(e, sign){
                var thir = "multi";
                var Id = [];
                var nodeType = [];
                var nodeId = [];
                var multipleEntity = e.graphic.attributes.multipleEntity;
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");

                var mapMainRadrawMarkers = [];
                for (var i=0;i<multipleEntity.length;i++){
                    //给工作台的标志点
                    var baseMsg = {
                        nodeId: multipleEntity[i].attributes.nodeId
                    };
                    var marker = {
                        addnode: true,
                        gis: multipleEntity[i].attributes.gis,
                        id: multipleEntity[i].attributes.id,
                        name: multipleEntity[i].attributes.name,
                        nodeId: multipleEntity[i].attributes.nodeId,
                        objectType: multipleEntity[i].attributes.objectType,
                        type: multipleEntity[i].attributes.type,
                        baseMsg: baseMsg
                    };
                    Id.push(multipleEntity[i].attributes.id);
                    nodeType.push(multipleEntity[i].attributes.type);
                    nodeId.push(multipleEntity[i].attributes.nodeId);
                    mapMainRadrawMarkers.push(marker);
                }

                mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, thir, Id, nodeType, nodeId, sign,'/leaves/');
                Id = [];
                nodeType = [];
                nodeId = [];
            },
            mapRemoveAreaMenu:function(evt, sign){
                if(sign == 0){
                    graphicLayer.remove(evt.graphic);
                }
                if (sign == 1) {// 删除内点
                    var multipleEntity = evt.graphic.attributes.multipleEntity;
                    var delmarkers = [];
                    for(var k=0;k<multipleEntity.length;k++){
                        delmarkers.push(multipleEntity[k]);
                    }
                    deleteMarker(delmarkers);
                }
                if (sign == 2) {// 删除外点
                    var multipleEntity = evt.graphic.attributes.multipleEntity;
                    var delmarkers = [];
                    var graphics = graphicLayer.graphics;
                    for(var t=0;t<graphics.length;t++){
                        if(graphics[t].attributes.hasOwnProperty("sign")&&graphics[t].attributes.sign === "marker"){
                            var delSign = true;
                            for(var k=0;k<multipleEntity.length;k++){
                                if(graphics[t].attributes.id === multipleEntity[k].attributes.id){
                                    delSign = false;
                                }
                            }
                            if(delSign){
                                delmarkers.push(graphics[t]);
                            }
                        }
                    }
                    deleteMarker(delmarkers);
                }
                d3.select("#newDiv").remove();
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                $("svg[type='system']").css("cursor","pointer");
            },
            mapAddKeyAreaMenu:function(){
                setmapProperty("null", "zoom-true", "dbl-true", "pan-true");
                var clickArea = mapCommon.mapWorkArea.areaLays.graphic;
                let name = $("#gis-add-keyarea-name").val();
                let level = $("#gis-add-keyarea-level").val();
                let address = $("#gis-add-keyarea-address").val();
                let areadata = {
                      "name": name,
                      "level": level,
                      "address": address,
                      "shape": "polygon",
                      "lon": clickArea.attributes.lon,
                      "lat": clickArea.attributes.lat
                    };
                let areaurl = EPMUI.context.url + '/object/savePolygonGis';
                let completed = function (){ return false; };
                let succeed = function(data) {
                  if (!data) {
                    return false;
                  }
                  if (parseInt(data.code) === 200) {
                    graphicLayer.remove(clickArea);
                    $("#gis-add-keyarea").css("display","none");
                    showAlert("提示!", data.message, "#33d0ff");
                  } else {
                    showAlert("提示!", data.message, "#ffc000");
                  }
                };
                let judgment = function() { return false; };
                mapCommonPart.ajaxAppMap(areaurl,'POST',areadata,completed,succeed,judgment,null,true);
            },
            getFilterIdType:function(){
                var allOverlays = map.getOverlays();
                let filters = [];
                for(var j=0;j<allOverlays.length;j++){
                    if(allOverlays[j].hasOwnProperty("addnode")){
                        var obj = {
                            id:allOverlays[j].id,
                            type:allOverlays[j].type
                        };
                        filters.push(obj);
                    }
                }

                return filters;
            },
            getFilterLinks:function(){
                window.filterLinks = [];
                var allOverlays = map.getOverlays();
                for(var j=0;j<allOverlays.length;j++){
                    if(allOverlays[j].hasOwnProperty("polylineid")){
                        var obj = {
                            relationTypeName:allOverlays[j].relationTypeName,
                            relationId:allOverlays[j].relationId,
                            relationParentType:allOverlays[j].relationParentType
                        };
                        window.filterLinks.push(obj);
                    }
                }
            },
            mapSaveTopoNodes:function(){
              mapSaveLocalStorage();
            },
            bayonetAreaMenu:function () {

            }
        }

    //arcgis end
    }
})();