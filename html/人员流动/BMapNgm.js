/**
 * Created by 牛贵敏(ngm) on 2017/8/2.
 *
 *
 * @fileoverview 基于百度地图实现的部分功能
 * 基于Baidu Map API 2.0
 *
 * @author ngm
 * @version 1.0
 */

/**
 * @namespace ngm 基于百度地图实现功能的所有类均放在BMapNgm命名空间下
 */
var BMapNgm = window.BMapNgm = BMapNgm || {};
(function() {

    BMapNgm.bMapNgm = bMapNgm;

    function bMapNgm() {
        var map,
            drawingManager,
            mapToolSign = false,
            mapShowSign = false,//判断设置菜单显示隐藏
            mapthemeType = "blue",//判断地图主题
            bayonetSign=false,//卡口 显示状态
            loadBayonetSign = false, // 是否加载卡口数据
            mapHeatSign = false,//热力图
            mapSmallSign = false,//点状图
            mapFontStatus = true,// 文字显示
            mapLineStatus = true,// 线条显示
            mapdisk = false,
            markerClusterer,
            mapPathSgin = false,    //地图轨迹标志
            mapPathBasePoint,       //地图轨迹基本点信息
            peopleMoveSign = false, //跨省人员流动标志
            keyAreaSign = false,
            areaStatisticsSign = false,      //区域统计的标志
            areaStatisticsSignClick = false, //区域统计 是否点击标志
            markerClustererSign = false,     //聚合标志
            shiftSign = false,
            noGisPoints = [],//存放无经纬度的点
            shiftGraphic = [],// 存放shift状态下graphic的信息
            lineShowHideTime = [],
            timelineIntervalSign = true, //计时器标识
            mapLineColor = ["#f99070", "#ce1e1e", "#a1f480", "#70f9ee", "#ff780c", "#3dbcc2"],
            lineNames = [],   //线条关系数组
            mapStep = [],     //保存上一步数据
            mapType = [],     //保存上一步操作类型
            mapStepNum = 0;   //保存上一步操作顺序数组的长度
        window.mapCommon = {
            mapWorkMarker:[],
            mapWorkArea:{},
            mapKeyArea:{}
        };//存放正在操作的点
        window.mapAdvanceSearchFlag = localStorage.mapAdvanceSearchFlag ? localStorage.mapAdvanceSearchFlag : "false";

        window.circleSize = 0;//计算圆的个数
        window.dblx = 0;
        window.dbly = 0;

        let markerPath = 'M10.1,0C5.2,0,2.1,3.4,2.7,8.2C3.2,12,9.3,18.8,10.3,20c1.4-1.5,6.7-8,7-11.8C17.8,3.3,14.9,0,10.1,0z M16.3,8.3c-0.2,2.3-4.9,8.6-5.9,10c-1.2-1.4-5.9-7.5-6.5-10c-0.8-4.1,2.4-7.1,6.5-7.1C14.4,1.2,16.5,4.1,16.3,8.3z M10.1,12.4V8.2l3.3-1.7v4L10.1,12.4z M6.6,6.3L10,4.5l3.5,1.7L10,8L6.6,6.3z M9.9,12.4l-3.3-1.9v-4l3.3,1.7V12.4z';
        let markerPathPeople = 'M19.1,0C7.1,0-0.7,8.6,0.8,20.5C2.1,30,17.2,47,19.8,50c3.4-3.7,16.8-20,17.5-29.5C38.5,8.2,31.2,0,19.1,0z'+
            'M34.6,20.7c-0.4,5.8-12.3,21.6-14.9,25c-3-3.4-14.9-18.8-16.2-25C1.7,10.6,9.6,3,19.8,3C29.9,3,35.3,10.3,34.6,20.7z M15.8,10.1'+
            'c0.9-0.6,2-0.9,3.1-0.9c0.6,0,1.2,0.1,1.7,0.4c0.2,0.1,0.3,0.3,0.5,0.4c0.5,0.1,1,0.3,1.4,0.6c0.5,0.5,0.8,1.3,0.9,2'+
            'c0.1,1.2-0.1,2.5-0.5,3.7c0.3,0.3,0.4,0.6,0.4,1c0,0.4-0.1,0.9-0.3,1.2c-0.1,0.2-0.3,0.3-0.5,0.3c-0.1,0.6-0.3,1.2-0.6,1.8'+
            'c-0.2,0.3-0.3,0.5-0.5,0.7c0,0.7,0,1.5,0.1,2.2c0.2,0.5,0.6,0.9,1.1,1.1c1.4,0.8,3,1.1,4.3,2c0.7,0.4,1.2,1,1.6,1.7'+
            'c0.2,0.4,0.3,1,0.3,1.5c-6.5,0-13,0-19.5,0c0.1-0.8,0.3-1.6,0.7-2.2c0.3-0.5,0.9-0.9,1.4-1.2c1.1-0.7,2.5-1,3.7-1.7'+
            'c0.5-0.3,1.1-0.7,1.4-1.3c0.1-0.7,0.1-1.5,0.1-2.2c-0.3-0.2-0.4-0.5-0.6-0.8c-0.3-0.5-0.5-1.1-0.5-1.7c-0.3-0.1-0.5-0.3-0.7-0.6'+
            'c-0.2-0.3-0.2-0.7-0.3-1c0-0.3,0.1-0.7,0.4-0.9c-0.5-1-0.7-2.1-0.6-3.1c0-0.7,0.2-1.3,0.4-1.9C15,10.9,15.3,10.4,15.8,10.1'+
            'L15.8,10.1z';
        let mapJsonStyle = [
            {
                "featureType": "land",
                "elementType": "geometry",
                "stylers": {
                    "color": "#303d47"
                }
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": {
                    "color": "#536981"
                }
            },
            {
                "featureType": "green",
                "elementType": "all",
                "stylers": {
                    "color": "#b0d3dd"
                }
            },
            {
                "featureType": "highway",
                "elementType": "geometry.fill",
                "stylers": {
                    "color": "#d2eef0"
                }
            },
            {
                "featureType": "highway",
                "elementType": "geometry.stroke",
                "stylers": {
                    "color": "#7dabb3"
                }
            },
            {
                "featureType": "arterial",
                "elementType": "geometry.fill",
                "stylers": {
                    "color": "#d6e4e5"
                }
            },
            {
                "featureType": "arterial",
                "elementType": "geometry.stroke",
                "stylers": {
                    "color": "#b0d5d4"
                }
            },
            {
                "featureType": "local",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#7a959a"
                }
            },
            {
                "featureType": "local",
                "elementType": "labels.text.stroke",
                "stylers": {
                    "color": "#d6e4e5"
                }
            },
            {
                "featureType": "arterial",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#3d85c6"
                }
            },
            {
                "featureType": "highway",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#374a46"
                }
            },
            {
                "featureType": "highway",
                "elementType": "labels.text.stroke",
                "stylers": {
                    "color": "#6aa84f"
                }
            },
            {
                "featureType": "manmade",
                "elementType": "geometry",
                "stylers": {
                    "color": "#1d3549"
                }
            },
            {
                "featureType": "building",
                "elementType": "geometry.fill",
                "stylers": {
                    "color": "#415362"
                }
            },
            {
                "featureType": "railway",
                "elementType": "all",
                "stylers": {
                    "color": "#bf9000"
                }
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#3d85c6",
                    "weight": "3.1",
                    "lightness": -46,
                    "saturation": 93
                }
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.stroke",
                "stylers": {
                    "color": "#ffffff"
                }
            },
            {
                "featureType": "label",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#ffffff"
                }
            },
            {
                "featureType": "label",
                "elementType": "labels.text.stroke",
                "stylers": {
                    "color": "#022338"
                }
            }
        ];
        //加载选区工具
        this.myTool = function (){
            let overlays = [];
            let overlaycomplete = function(e,ee){
                e.overlay.addEventListener("dblclick",function(a){
                    let conf = {
                        thisClick:a,
                        areaLays:e
                    };
                    mapCommon.mapWorkArea = {};
                    mapCommon.mapWorkArea = {
                        thisClick:a,
                        areaLays:e
                    };
                    mapCommonPart.menu(conf,"areamenu");
                });
                overlays.push(e.overlay);
            };
            let styleOptions = {
                strokeColor:"#071A44",    //边线颜色。#33d0ff#EEEEE0 #5c7a96
                fillColor:"#071A44",      //填充颜色。当参数为空时，圆形将没有填充效果。#33d0ff#F0F8FF#DBDBDB#FFFAFA #566f87
                strokeWeight: 2,       //边线的宽度，以像素为单位。
                strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
                fillOpacity: 0.7,      //填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid' //边线的样式，solid或dashed。
            };
            //实例化鼠标绘制工具
            drawingManager = new BMapLib.DrawingManager(map, {
                isOpen: false, //是否开启绘制模式
                enableDrawingTool: true, //是否显示工具栏
                drawingToolOptions: {
                    anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                    offset: new BMap.Size(5, 5), //偏离值
                },
                circleOptions: styleOptions, //圆的样式
                polylineOptions: styleOptions, //线的样式
                polygonOptions: styleOptions, //多边形的样式
                rectangleOptions: styleOptions //矩形的样式
            });
            //添加鼠标绘制工具监听事件，用于获取绘制结果
            drawingManager.addEventListener('overlaycomplete', overlaycomplete);
            $(".BMapLib_Drawing_panel").hide();
            function clearAll() {
                for(var i = 0; i < overlays.length; i++){
                    map.removeOverlay(overlays[i]);
                }
                overlays.length = 0
            }
            function clear(e) {
                map.removeOverlay(overlays);
            }

        };
        // 添加localStorage()中的点,历史保留点
        this.addLocalStorageMarker = function (){
            let historyDatas = localStorage.mapOverlays ? JSON.parse(localStorage.mapOverlays): "false";//跳转出保存的缓存数据
            if(historyDatas !== "false" ){
                addMapMarkerLine(historyDatas.overlaysMarker,historyDatas.overlaysLine);
            }
        };
        //卡口信息图层
        this.bayonet = function(){
            if(bayonetSign){//隐藏 卡口图层
              var allOverlays = map.getOverlays();
              for(var i=0;i<allOverlays.length;i++){
                if(allOverlays[i].hasOwnProperty("type")&&allOverlays[i].type === bayonetName){
                  map.removeOverlay(allOverlays[i]);
                }
              }

              bayonetSign = false;
            }else{//显示卡口图层
              var allOverlays = map.getOverlays();
              for(var i=0;i<allOverlays.length;i++){
                if(allOverlays[i].hasOwnProperty("type")&&allOverlays[i].type === bayonetName){
                  map.removeOverlay(allOverlays[i]);
                }
              }

              /*$.ajax({
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
              });*/


              let returnBayonetData = [
               {
                 gis: {
                 lon: 100.237056,
                 lat: 24.789903
                 },
               address: "哈尔滨工业大学",
               id: "273F534A64EEB25B211565C5DEF3FEA2",
               name:"华容路卡口",
               nodeId:"68936086",
               objectType: "entity",
                 page_type:"entity",
               type :"KKXX"
               },
               {
                 gis: {
                 lon: 120.50871,
                 lat: 30.244821
                 },
               address: "哈尔滨工业大学",
               id: "273F534A64EEB25B211565C5DEF3FEA2",
               name:"迎泽路卡口",
               nodeId:"68936086",
               objectType: "entity",
                 page_type:"entity",
               type :"KKXX"
               },
               {
                 gis: {
                 lon: 122.639351,
                 lat: 45.749688
                 },
               address: "哈尔滨工业大学",
               id: "273F534A64EEB25B211565C5DEF3FEA2",
               name:"五一路卡口",
               nodeId:"68936086",
               objectType: "entity",
                 page_type:"entity",
               type :"KKXX"
               }
               ];

              for(let k=0;k<returnBayonetData.length;k++){
                let bayonet = addMapOverlays(returnBayonetData[k], "bayonet");
              }


              bayonetSign = true;
            }
        };

        //加载地图
        this.run = function(){
            let mapstyle = mapCommonPart.getCookie("theme");
            mapload = true;
            map = new BMap.Map("basemap",{enableMapClick: false});    // 创建Map实例
            mapstyle === "black" ? map.setMapStyle({styleJson:mapJsonStyle}) : map.setMapStyle({style:'normal'});
            map.centerAndZoom(new BMap.Point(106.24, 39.915), 5);  // 初始化地图,设置中心点坐标和地图级别43.24, 57.915  106.24, 39.915
            map.addControl(new BMap.OverviewMapControl());
            map.setCurrentCity("北京");           //设置地图显示的城市
            map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
            map.enableDoubleClickZoom();         //启用鼠标双击放大
            map.disablePinchToZoom(true);        //禁用双指操作缩放
            map.enableAutoResize();
            map.setDefaultCursor("pointer");
            let scaleMap = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT,offset: new BMap.Size(311, 30)});
            map.addControl(scaleMap);

            map.addEventListener("movestart",function(){
                $(".map_select_btn_div").css("width","0px");
                $(".map_select_btn").css("width","0px");
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
            map.addEventListener("click",function(){
                !mapdisk ? map.enableDoubleClickZoom(true) : null;//启用鼠标双击放大
            });
            // 多选点
            $(document).keydown(function(event){
                if (event.keyCode == 16) { //shift
                    shiftSign = true;
                }
            });
            $(document).keyup(function(event){
                if (event.keyCode == 16) { //shift
                    shiftSign = false;
                    shiftGraphic = [];
                }
            });

            map.addEventListener("rightclick",function(){
                d3.selectAll("#hot-point-div").remove();//删除热力图点信息框
                if(!mapSmallSign&&!mapHeatSign){
                    var allOverlays = map.getOverlays();
                    for(var i=0;i<allOverlays.length;i++){
                        if(allOverlays[i].hasOwnProperty("addnode")){
                            if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                                allOverlays[i].setTop(false);//不能置顶
                                allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                            }
                        }
                        if(allOverlays[i].hasOwnProperty("polylineid")&&mapLineStatus){
                            allOverlays[i].show();//显示线

                            for(let k=0;k<allOverlays.length;k++){
                                if(allOverlays[k].hasOwnProperty("linkmarker")&&mapFontStatus){
                                    allOverlays[k].show();//显示文字
                                }
                            }
                        }
                    }
                }
            });
            map.addEventListener("tilesloaded",function(){
                $("svg[type='system']").css("cursor","pointer");
                $("img[src='http://api0.map.bdimg.com/images/copyright_logo.png']").css("display",'none');
                $("a[href='http://www.openstreetmap.org/']").parent().parent().parent().css("display",'none');
                setTimeout(function () {
                    $("a[href='http://www.openstreetmap.org/']").parent().css("display",'none');
                },1000);
            });
            map.addEventListener("zoomend",function(){
                d3.selectAll("#asDiv").remove();
                if(map.getZoom()<5){
                    if(areaStatisticsSign){// 关闭统计功能
                        var allOverlays = map.getOverlays();
                        for(var k=0;k<allOverlays.length;k++) {
                            if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type === "areaMarker") {
                                map.removeOverlay(allOverlays[k]);
                            }
                        }
                        areaStatisticsSign = false;// 在这areaStatisticsSignClick不会变化！！
                    }
                }else if(map.getZoom()>5){
                    /*if(areaStatisticsSignClick && !areaStatisticsSign){// 关闭统计功能
                        areaStatistics();
                        areaStatisticsSign = true;
                    }*/
                }
            });
            this.myTool();//加载选区工具

            this.addLocalStorageMarker();//添加localstorage中点
        };
        //加载高级搜索用地图
        this.searchMapRun = function(){
            // 百度地图API功能
            map = new BMap.Map("searchMap",{enableMapClick: false});    // 创建Map实例
            map.setMapStyle({styleJson:mapJsonStyle});
            var mapstyle = mapCommonPart.getCookie("theme");
            if(mapstyle === "black"){
              map.setMapStyle({styleJson:mapJsonStyle});
            }else{
              map.setMapStyle({style:'normal'});
            }
            map.centerAndZoom(new BMap.Point(57.24, 57.915), 5);  // 初始化地图,设置中心点坐标和地图级别43.24, 57.915
            map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
            map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
            map.enableDoubleClickZoom();        //启用鼠标双击放大
            map.disablePinchToZoom(true);  //禁用双指操作缩放
            map.enableAutoResize();

            var scaleMap = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT,offset: new BMap.Size(111, 30)});
            map.addControl(scaleMap);
            map.setDefaultCursor("pointer");
            //画区域功能
            localStorage.setItem("selectMap", "true");
            //鼠标 点线面工具
            selectMapTool();
            $("#searchMap").children("div").children("div").children("div").children("div").css("cursor","pointer");//双击结束，鼠标恢复

            map.addEventListener("mouseover",function(){
                $("svg[type='system']").css("cursor","pointer");//双击结束，鼠标恢复
                map.setDefaultCursor("pointer");
                map.setDraggingCursor("pointer");
            });
            map.addEventListener("tilesloaded",function(){
                $("svg[type='system']").css("cursor","pointer");//双击结束，鼠标恢复
                $("img[src='http://api0.map.bdimg.com/images/copyright_logo.png']").css("display",'none');
                $("a[href='http://www.openstreetmap.org/']").parent().parent().parent().css("display",'none');
                setTimeout(function () {
                    $("svg[type='system']").css("cursor","pointer");//双击结束，鼠标恢复
                    $("a[href='http://www.openstreetmap.org/']").parent().css("display",'none');
                },1000);

            });
        };
        //高级搜索 地图划区域功能
        function selectMapTool(){
            var overlays = [];
            var overlaycomplete = function(e,ee){

                e.overlay.addEventListener("dblclick",function(a){//rightclick
                    map.disableDoubleClickZoom(true);   //禁用双击放大
                    var allOverlays = map.getOverlays();
                    for(var i=0;i<allOverlays.length;i++){
                        if(allOverlays[i].hasOwnProperty("dblmarker")){
                            //删除
                            map.removeOverlay(allOverlays[i]);
                        };
                    }
                    var pointNEW = new BMap.Point(a.point.lng,a.point.lat);
                    var marker = new BMap.Marker(pointNEW, {
                        // 指定Marker的icon属性为
                        icon: new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
                            scale: 0.1,//图标缩放大小
                            rotation: 0,//顺时针旋转0度
                            fillColor: '#071A44',
                            fillOpacity: 0.8,
                            anchor:{width:13,height:20},
                            strokeColor: '#071A44',
                            strokeWeight: 0.1//线宽
                        })
                    });

                    map.addOverlay(marker);
                    var content = '<div id="newDivdelMarker" class="newDivdelMarker">删除选区</div>';
                    var label = new BMap.Label(content,{offset:new BMap.Size(5,5)});
                    label.setStyle({backgroundColor: "rgba(0,0,0,0)",border:"#1E262F"});
                    marker.setLabel(label);
                    marker.disableDragging();           // 不可拖拽
                    marker.dblmarker = true;
                    marker.setTop(true);

                    $(".newDivdelMarker").bind("click",function (event) {
                        var allOverlays = map.getOverlays();
                        for(var i=0;i<allOverlays.length;i++){
                            if(allOverlays[i].hasOwnProperty("dblmarker")){
                                //删除
                                map.removeOverlay(allOverlays[i]);
                            };
                        }
                        var allOverlays = map.getOverlays();
                        for(var i=0;i<allOverlays.length;i++){
                            if(allOverlays[i].hasOwnProperty("circle")){
                                if(allOverlays[i].circle==e.overlay){
                                    //删除
                                    map.removeOverlay(allOverlays[i]);
                                };
                            };
                        }
                        map.enableDoubleClickZoom();   //启用双击放大
                        map.removeOverlay(e.overlay);
                    });


                })

                overlays.push(e.overlay);
            };
            var styleOptions = {
                strokeColor:"#071A44",    //边线颜色。#33d0ff#EEEEE0 #5c7a96
                fillColor:"#071A44",      //填充颜色。当参数为空时，圆形将没有填充效果。#33d0ff#F0F8FF#DBDBDB#FFFAFA #566f87
                strokeWeight: 2,       //边线的宽度，以像素为单位。
                strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
                fillOpacity: 0.7,      //填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid' //边线的样式，solid或dashed。
            }
            //实例化鼠标绘制工具
            var selctmapDrawingManager = new BMapLib.DrawingManager(map, {
                isOpen: true, //是否开启绘制模式
                enableDrawingTool: true, //是否显示工具栏
                drawingToolOptions: {
                    anchor: BMAP_ANCHOR_TOP_LEFT, //位置
                    offset: new BMap.Size(5, 5), //偏离值
                },
                circleOptions: styleOptions, //圆的样式
                polylineOptions: styleOptions, //线的样式
                polygonOptions: styleOptions, //多边形的样式
                rectangleOptions: styleOptions //矩形的样式
            });
            //添加鼠标绘制工具监听事件，用于获取绘制结果
            selctmapDrawingManager.addEventListener('overlaycomplete', overlaycomplete);
            //$(".BMapLib_Drawing_panel").hide();
            /*function clearAll() {
             for(var i = 0; i < overlays.length; i++){
             map.removeOverlay(overlays[i]);
             }
             overlays.length = 0
             }
             function clear(e) {
             map.removeOverlay(overlays);
             }*/

            //开启选择区域
            selctmapDrawingManager.open();

        }
        //从表格把点添加到地图
        this.addTablePoint = function(points){
          addMapMarkerLine(points,[]);
        };
        //加点和线功能
        this.addPoint = function (gisnodes,gislinks) {
            mapStep = [];
            mapType = [];
            mapStepNum = 0;
            addMapMarkerLine(gisnodes,gislinks);
        };
        //拖拽加点
        this.addOnePoint = function (gisDatas) {
            var mapStepOverlays = [];//用于放入mapStep
            if(gisDatas && gisDatas.hasOwnProperty("gis") && gisDatas.gis != null){
                var allOverlays = map.getOverlays();
                var haveMarker = mapRepeat(gisDatas,"marker");
                if(!haveMarker){//不重复，才加点
                    var conf = { type: "drag"};
                    var marker = addMapOverlays(gisDatas, "marker", conf);
                    var step = { data:marker, type:"marker" };
                    mapStepOverlays.push(step);
                    mapStep.push(mapStepOverlays);
                    mapType.push("dragadd");
                    mapStepNum++;
                }else{//重复，高亮该点
                    /*if(mapFontStatus){
                     mapSetIcon(marker, markerPathPeople, 0.6, 0, 'red', 20, 42);
                     label.setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                     }else{
                     label.setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                     }*/
                    var allOverlays = map.getOverlays();
                    for(var i=0;i<allOverlays.length;i++){
                        if((allOverlays[i].hasOwnProperty("addnode"))&&allOverlays[i].getIcon().style.fillColor != "yellow") {
                            if(allOverlays[i].id == gisDatas.id){
                                mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                allOverlays[i].setTop(true);
                                allOverlays[i].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                            }else{
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                                allOverlays[i].setTop(false);
                                allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                            }
                        }
                    }
                }
            }
            if(gisDatas.hasOwnProperty("gis") && gisDatas.gis == null){
                noGisPoints.push(gisDatas);
                //mapCommonPart.mapTooltip();//提示信息
            }
            mapSetAggregation("reset");
        };
        //清屏功能
        this.resetscreen = function () {
            mapSetAggregation("del");
            map.clearOverlays();
        };
        //后退
        this.backStep = function () {
            if(mapStepNum>0){
                if(mapType[mapStepNum-1]=="add"){//删除对应点
                    var del = mapStep[mapStepNum-1];
                    for(var i=0;i<del.length;i++){

                        var allOverlays = map.getOverlays();
                        if(del[i].type == "marker"){
                            for(var j=0;j<allOverlays.length;j++){
                                if(allOverlays[j].hasOwnProperty("id")){
                                    if(allOverlays[j].id==del[i].data.id){
                                        map.removeOverlay(allOverlays[j]);
                                    }

                                }
                            }
                        }else if(del[i].type == "polyline"){//删除线
                            for(var j=0;j<allOverlays.length;j++){
                                if(allOverlays[j].hasOwnProperty("polylineid")){
                                    if((allOverlays[j].sourceid==del[i].data.sourceid&&allOverlays[j].targetid==del[i].data.targetid)||(allOverlays[j].targetid==del[i].data.sourceid&&allOverlays[j].sourceid==del[i].data.targetid)){
                                        map.removeOverlay(allOverlays[j]);
                                    }
                                }
                            }
                        }
                    }
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapType[mapStepNum-1]=="dragadd"){//删除拖拽点
                    var del = mapStep[mapStepNum-1];
                    for(var i=0;i<del.length;i++){

                        var allOverlays = map.getOverlays();
                        if(del[i].type == "marker"){
                            for(var j=0;j<allOverlays.length;j++){
                                if(allOverlays[j].hasOwnProperty("id")){
                                    if(allOverlays[j].id==del[i].data.id){
                                        map.removeOverlay(allOverlays[j]);
                                    }

                                }
                            }
                        }else if(del[i].type == "polyline"){//删除线
                            for(var j=0;j<allOverlays.length;j++){
                                if(allOverlays[j].hasOwnProperty("polylineid")){
                                    if((allOverlays[j].sourceid==del[i].data.sourceid&&allOverlays[j].targetid==del[i].data.targetid)||(allOverlays[j].targetid==del[i].data.sourceid&&allOverlays[j].sourceid==del[i].data.targetid)){
                                        map.removeOverlay(allOverlays[j]);
                                    }
                                }
                            }
                        }

                    }
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;

                }else if(mapType[mapStepNum-1]=="del"){//还原对应点 线
                    var del = mapStep[mapStepNum-1];
                    for(var i=0;i<del.length;i++){
                        if(del[i].type == "marker"){
                            var marker = del[i].data;
                            markerEvent(marker);
                            var label = new BMap.Label(del[i].data.baseMsg.name,{offset:new BMap.Size(20,-10)});
                            label.setStyle({backgroundColor: "#5B7085",border:"#D7EFFF"});
                            marker.setLabel(label);
                            map.addOverlay(del[i].data);     //添加点到地图上
                        }
                    }

                    for(var i=0;i<del.length;i++){
                        if(del[i].type == "polyline"){

                            map.addOverlay(del[i].data);     //添加折线到地图上
                            //添加标注关系
                            var polyline = del[i].data;
                            var line = polyline.getPath();
                            if (line.length == 2) {
                                var centerlng = (parseFloat(line[0].lng) + parseFloat(line[1].lng) + "000") / 2;
                                var centerlat = (parseFloat(line[0].lat) + parseFloat(line[1].lat)) / 2;
                                var center = new BMap.Point(centerlng, centerlat);
                                markerline = new BMap.Marker(center, {
                                    // 指定Marker的icon属性为Symbol
                                    icon: new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
                                        scale: 0.1,//图标缩放大小
                                        fillColor: "#FF9933",//填充颜色
                                        fillOpacity: 0.1//填充透明度
                                    })
                                });
                                map.addOverlay(markerline);

                                markerline.id = polyline.sourceid + polyline.targetid;
                                markerline.linkmarker = true;
                                markerline.name = polyline.relationName;
                                var label = new BMap.Label(polyline.relationName, {offset: new BMap.Size(-20, -10)});
                                if(mapFontStatus){
                                    label.setStyle({backgroundColor:"rgba(0, 0, 0, 0)",border:"#FFC62E",color:"#FFC62E" });
                                }else{
                                    label.setStyle({backgroundColor:"rgba(0, 0, 0, 0)",border:"#FFC62E",color:"#FFC62E",display:"none" });
                                }
                                markerline.setLabel(label);
                                markerline.disableDragging();           // 不可拖拽
                            }
                            if(line.length>3){
                                var centerNum = parseInt(line.length/2);
                                var centerLine = line[centerNum];

                                var center = new BMap.Point(centerLine.lng,centerLine.lat);

                                markerCurve = new BMap.Marker(center, {
                                    // 指定Marker的icon属性为Symbol
                                    icon: new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
                                        scale: 0.1,//图标缩放大小
                                        fillColor: "#FF9933",//填充颜色
                                        fillOpacity: 0.5//填充透明度
                                    })
                                });
                                markerCurve.id = polyline.sourceid + polyline.targetid;
                                markerCurve.linkmarker= true;
                                markerCurve.name = polyline.relationName;
                                //markerCurve.relationName = gislinks[i].relationTypeName;
                                map.addOverlay(markerCurve);
                                //markerCurve.setOffset(new BMap.Size(2, 14));
                                var label = new BMap.Label(polyline.relationName,{offset:new BMap.Size(-20,-10)});
                                if(mapFontStatus){
                                    label.setStyle({backgroundColor:"rgba(0, 0, 0, 0)",border:"#FFC62E",color:"#FFC62E" });
                                }else{
                                    label.setStyle({backgroundColor:"rgba(0, 0, 0, 0)",border:"#FFC62E",color:"#FFC62E",display:"none" });
                                }
                                markerCurve.setLabel(label);
                                markerCurve.disableDragging();           // 不可拖拽
                            }

                        }
                    }
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapType[mapStepNum-1]=="addCurve"){//删除对应 轨迹 点和线
                    var del = mapStep[mapStepNum-1];
                    for(var i=0;i<del.length;i++){
                        var allOverlays = map.getOverlays();
                        for(var j=0;j<allOverlays.length;j++){
                            if(allOverlays[j].hasOwnProperty("twoId")){
                                if(allOverlays[j].twoId.one==del[i].one&&allOverlays[j].twoId.two==del[i].two){
                                    map.removeOverlay(allOverlays[j]);
                                }
                            }
                        }
                    }
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }

            }

            mapSetAggregation("reset");
        };
        //过滤器
        this.filterMapMarker = function (relationArr,sign){
            if(sign === "relation"){
                var allOverlays = map.getOverlays();
                var selectedId = [];
                for(var j=0;j<relationArr.length;j++){
                    for(var i=0;i<allOverlays.length;i++){
                        if(allOverlays[i].hasOwnProperty("polylineid")&&allOverlays[i].relationName === relationArr[j]){
                            selectedId.push(allOverlays[i].sourceid);
                            selectedId.push(allOverlays[i].targetid);
                        }
                    }
                }
                //先把所有点还原
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("addnode")&&allOverlays[i].getIcon().style.fillColor !== "yellow"){
                        mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                        allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                    }
                }
                //选中
                for(var j=0;j<selectedId.length;j++){
                    for(var i=0;i<allOverlays.length;i++){
                        if(allOverlays[i].hasOwnProperty("addnode")&&allOverlays[i].getIcon().style.fillColor !== "yellow"){
                            if(allOverlays[i].id === selectedId[j]){
                                mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                allOverlays[i].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                            }
                        }
                    }
                }

                //节点过滤
            }else if(sign === "node"){
                var allOverlays = map.getOverlays();
                //先把所有点还原
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("addnode")&&allOverlays[i].getIcon().style.fillColor !== "yellow"){
                        mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                        allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                    }
                }
                //选中
                for(var j=0;j<relationArr.length;j++){
                    for(var i=0;i<allOverlays.length;i++){
                        if(allOverlays[i].hasOwnProperty("addnode")){
                            if(allOverlays[i].id === relationArr[j]){
                                mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                allOverlays[i].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                            }
                        }
                    }
                }
            }

        };
        //搜索后，点的颜色变化
        this.searchNodes = function (){
            let val = $(".map_nodes_find").val();
            let allOverlays = map.getOverlays();
            let markers = [];
            if(val){
                allOverlays.forEach(lay => {
                    if(lay.hasOwnProperty("addnode")){
                        markers.push(lay);
                    }
                });

                let sn = markers.filter(function(d){
                    return d.name.indexOf(val)>-1?true:false;
                });

                if(sn){
                    for(var i=0;i<allOverlays.length;i++){
                        if((allOverlays[i].hasOwnProperty("type"))&&allOverlays[i].hasOwnProperty("id")) {
                            //先把该图标颜色复原
                            if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                            }
                            allOverlays[i].setTop(false);
                            allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                            for(var j=0;j<sn.length;j++){
                                if(allOverlays[i].id === sn[j].id){
                                    allOverlays[i].setTop(true);
                                    if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                                        mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                        allOverlays[i].getLabel().setStyle({backgroundColor: "#E2382A", border: "#FFC62E",color:"#fff"});
                                    }
                                }
                            }
                        }
                    }
                }else{
                    for(var i=0;i<allOverlays.length;i++){
                        if((allOverlays[i].hasOwnProperty("type"))&&allOverlays[i].hasOwnProperty("id")) {
                            //先把图标颜色复原((allOverlays[i].type == "TRAIN_TRAVEL")||(allOverlays[i].type == "PERSON"))
                            if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                            }
                            allOverlays[i].setTop(false);
                            allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                        }
                    }
                }
            }else{
                for(var i=0;i<allOverlays.length;i++){
                    if((allOverlays[i].hasOwnProperty("type"))&&allOverlays[i].hasOwnProperty("id")) {
                        if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                            mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                        }
                        allOverlays[i].setTop(false);
                        allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                    }

                }
            }
        };
        //重点区域表，确定按钮 点击后添加重点区域
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
            if(returnData[i].shape === "polygon"){//画正方形
              let polygonPoints = [];
              let gisStr = returnData[i].gisPointsStr;
              let setlonUse = [];
              let setlatUse = [];
              for(let j=0;j<gisStr.length;j++){
                polygonPoints.push(new BMap.Point(gisStr[j][0],gisStr[j][1]));
                setlonUse.push(gisStr[j][0]);
                setlatUse.push(gisStr[j][1]);
              }
              let polygon = new BMap.Polygon(polygonPoints, styleOptions);  //创建多边形
              polygon.addattr = {
                "id":returnData[i].id,
                "type":"polygon",
                "sign":"keyarea",
                "peopleMove":false,
                "analyse":false
              };
              polygon.id = returnData[i].id;
              polygon.points = gisStr;
              polygon.lonUse = setlonUse;
              polygon.latUse = setlatUse;
              map.addOverlay(polygon);           //增加多边形
              keyAreaEvent(polygon)
            }
            if(returnData[i].shape === "circle"){//画圆
              let gisCenterP = returnData[i].centerPoint;
              let circlePoint = new BMap.Point(gisCenterP[0], gisCenterP[1]);
              let circle = new BMap.Circle(circlePoint,returnData[i].radius,styleOptions); //创建圆
              circle.addattr = {
                "id":returnData[i].id,
                "type":"circle",
                "sign":"keyarea",
                "peopleMove":false,
                "analyse":false
              };
              circle.id = returnData[i].id;
              map.addOverlay(circle); //增加圆
              keyAreaEvent(circle);
            }
          }
        };
        //删除点
        this.deleteOverlay = function (ids) {
          deleteMarker(ids);
        };
        /**
         * 添加点和线 --
         * @param gisNodesData 扩展的点的信息
         * @param basemarker   是拓展根节点 or false表示单纯加点 而不添加线
         * @param multiSign    是否是多选
         */
        window.addMapPointLine = function (gisNodesData,basemarker,multiSign) {
            var mapStepOverlays = [];
            var mapTooltipSign = false;
            for (var i = 0; i < gisNodesData.length; i++) {
                var haveMarker = mapRepeat(gisNodesData[i],"marker");
                if (!haveMarker) {//不重复，在这进行加点操作：
                    if(gisNodesData[i].hasOwnProperty("gis")){
                        if(gisNodesData[i].hasOwnProperty("nogis") && gisNodesData[i].nogis){
                            noGisPoints.push(gisNodesData[i]);
                            mapTooltipSign = true;
                        }
                        var conf = { type: "add"};
                        var marker = addMapOverlays(gisNodesData[i], "marker", conf);
                        var step = {data: marker, type: "marker"};
                        mapStepOverlays.push(step);
                    }
                }
                if(basemarker){
                    gisNodesData.forEach(link => lineNames.push(link.relationParentType));
                    lineNames = [...new Set(lineNames)];

                    let basemarkerId;
                    let basemarkerGis;
                    let basemarkerMsg;
                    let gislinks;
                    let gislinksSource;
                    let gislinksTarget;
                    if(multiSign){
                        basemarkerId = gisNodesData[i].source.id;
                        basemarkerGis = gisNodesData[i].source.gis;
                        basemarkerMsg = gisNodesData[i].source
                        //basemarkerMsg = gisNodesData[i].baseMsg;
                    }else{
                        basemarkerId = basemarker[0].id;
                        basemarkerGis = mapCommon.mapWorkMarker[0].gis;//basemarker[0].gis;
                        basemarker[0].baseMsg.gis = mapCommon.mapWorkMarker[0].gis;
                        basemarkerMsg = basemarker[0].baseMsg;
                    }
                    /*gislinksTarget = { // page_type的用处是？
                        addnode: true,
                        gis: basemarkerMsg.gis,
                        id: basemarkerMsg.id,
                        name: basemarkerMsg.name,
                        nodeId: basemarkerMsg.nodeId,
                        objectType: basemarkerMsg.objectType,
                        page_type: basemarkerMsg.page_type,
                        type: basemarkerMsg.type
                    };*/
                    if(gisNodesData[i].tag == "-20"){
                        gislinksTarget = initGislinksSourceTarget(basemarkerMsg);
                        gislinksSource = initGislinksSourceTarget(gisNodesData[i]);
                    }else{ // gisNodesData[i].tag == "20" 或者不存在
                        gislinksTarget = initGislinksSourceTarget(gisNodesData[i]);
                        gislinksSource = initGislinksSourceTarget(basemarkerMsg);
                    }
                    gislinks = {
                        relationTypeName: gisNodesData[i].relationTypeName,
                        relationId:gisNodesData[i].relationId,
                        relationParentType:gisNodesData[i].relationParentType,
                        time: gisNodesData[i].time,
                        tag: gisNodesData[i].tag,
                        source: gislinksSource,
                        target: gislinksTarget
                    };

                    let haveLine = mapRepeat(gislinks,"polyline");

                    let lineSizeNum = haveLine ? haveLine.length : 170;//根据这个 判断线条是直线还是曲线，直线数值170
                    if(haveLine !== "have"){
                        var conf = { linesizeNum : lineSizeNum };
                        var polyline = addMapOverlays(gislinks, "curve", conf);

                        var line = polyline.getPath();
                        var linelength = line.length;
                        var markerCurve;
                        if(linelength>3){
                            var centerNum = parseInt(linelength/2);
                            var centerLine = line[centerNum];

                            var conf = {
                                lineCenter : centerLine,
                                polyline : polyline
                            };
                            markerCurve = addMapOverlays(gislinks, "curveMarker", conf);
                        }

                        var stepM = {data: polyline, type: "polyline"};
                        var stepLM = {data: markerCurve, type: "marker"};
                        mapStepOverlays.push(stepM);
                        mapStepOverlays.push(stepLM);
                    }
                }
            }

            if(mapTooltipSign){
                mapCommonPart.mapTooltip();//提示信息
            }

            mapStep.push(mapStepOverlays);
            mapType.push("add");
            mapStepNum++;

            setTimeout(function () {
                $("svg[type='system']").css("cursor", "pointer");
            }, 50);

            mapSetAggregation("reset");
        };
        //修改gislinks的source和target
        function initGislinksSourceTarget(data){
            return {
                addnode: true,
                gis: data.gis,
                id: data.id,
                name: data.name,
                nodeId: data.nodeId,
                objectType: data.objectType,
                type: data.type
            };
        }
        //marker的操作事件
        function markerEvent(marker) {
            marker.addEventListener("click", function(e){
                let _thisMid = this.id,
                    _thisType = this.type;
                if(marker.type === bayonetName){
                  return '';
                }else{
                  getBaseMessage(true,_thisMid, _thisType, true);//基础信息展示
                }

                this.setTop(true);
                var thisIconColor = this.getIcon().style.fillColor;// orange or blue

                var allOverlays = map.getOverlays();
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("addnode")&&allOverlays[i].getIcon().style.fillColor != "yellow"){
                        if(shiftSign){// shift 状态，让其 shiftGraphic 的图标选中
                            var haveInShift = false;
                            for(var n=0;n<shiftGraphic.length;n++){//判断 是shift状态选中的点，颜色选中
                                if(shiftGraphic[n].id == allOverlays[i].id){
                                    haveInShift = true;
                                }
                            }
                            if(haveInShift){//选中
                                mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                allOverlays[i].setTop(true);//点击点置顶
                                allOverlays[i].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                            }else{
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                                allOverlays[i].setTop(false);//不能置顶
                                allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                            }
                        }else{
                            mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                            allOverlays[i].setTop(false);//不能置顶
                            allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                        }
                    };
                }

                if(thisIconColor !== "yellow"){
                    mapSetIcon(this, markerPathPeople, 0.6, 0, 'red', 20, 42);
                    this.setTop(true);//点击点置顶
                    this.getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});

                    if(shiftSign){
                        var haveShiftGraphic = false;
                        for(var y=0;y<shiftGraphic.length;y++){
                            if(shiftGraphic[y].id == this.id){
                                haveShiftGraphic = true;
                            }
                        }
                        !haveShiftGraphic ? shiftGraphic.push(this) : null;
                    }
                }
            });
            marker.addEventListener("mouseover", function(e){
                var thisId = this.id;
                var IconColor = this.getIcon().style.fillColor;
                this.setTop(true);//点置顶
                if(IconColor === "#33D0FF"){
                    mapSetIcon(this, markerPathPeople, 0.6, 0, 'orange', 20, 42);
                }

                if(!mapHeatSign && !mapSmallSign){
                    var lineHide = setTimeout(function(){
                        var allOverlays = map.getOverlays();
                        for(var i=0;i<allOverlays.length;i++){
                            //隐藏原来线条和关系
                            if(allOverlays[i].hasOwnProperty("linkmarker")){
                                allOverlays[i].hide();
                            }
                            if(allOverlays[i].hasOwnProperty("polylineid")){
                                allOverlays[i].hide();
                            }
                        }
                        for(var i=0;i<allOverlays.length;i++){
                            if(allOverlays[i].hasOwnProperty("polylineid")&&mapLineStatus){
                                if(allOverlays[i].sourceid == thisId||allOverlays[i].targetid == thisId){
                                    allOverlays[i].show();//显示线
                                    for(var k=0;k<allOverlays.length;k++){
                                        if(allOverlays[k].hasOwnProperty("linkmarker") && mapFontStatus && mapLineStatus){
                                            if(allOverlays[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid)){
                                                allOverlays[k].show();//显示文字
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },1000);

                    lineShowHideTime.push(lineHide);
                }

            });
            marker.addEventListener("mouseout", function(e){
                var IconColor = this.getIcon().style.fillColor;
                IconColor === "orange" ? mapSetIcon(this, markerPath, 1, 0, '#33D0FF', 10, 20) : null;
                lineShowHideTime.forEach(linetime => clearTimeout(linetime));

                if(!mapHeatSign && !mapSmallSign){//不是热力图和小点图
                    setTimeout(function(){
                        var allOverlays = map.getOverlays();
                        for(var i=0;i<allOverlays.length;i++){
                            //显示原来线条和关系
                            if(mapLineStatus && mapFontStatus && allOverlays[i].hasOwnProperty("linkmarker")){
                                allOverlays[i].show();
                            }
                            if(mapLineStatus && allOverlays[i].hasOwnProperty("polylineid")){
                                allOverlays[i].show();
                            }
                        }
                    },10);
                }

            });
            marker.addEventListener("dragging",function(e){
                var thisMarker = this;
                var allOverlays = map.getOverlays();
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("sourceid")){

                        if((allOverlays[i].sourceid === thisMarker.id)){
                            if(allOverlays[i].linetype === "curve"){
                                var obj = {
                                    polylineid : allOverlays[i].polylineid,
                                    sourceid :allOverlays[i].sourceid,
                                    targetid : allOverlays[i].targetid,
                                    relationId : allOverlays[i].relationId,
                                    relationParentType : allOverlays[i].relationParentType,
                                    relationTypeName : allOverlays[i].relationName,
                                    time : allOverlays[i].time,
                                    source :allOverlays[i].source,
                                    target : allOverlays[i].target,
                                    tag : allOverlays[i].tag,
                                    targetgis : allOverlays[i].targetgis,
                                    sourcegis : allOverlays[i].sourcegis,
                                    linesize : allOverlays[i].linesize
                                };
                                obj.source.gis = {
                                    lon:e.point.lng,
                                    lat:e.point.lat
                                };
                                var conf = { linesizeNum : allOverlays[i].linesize };
                                var polyline = addMapOverlays(obj, "curve", conf);
                                //找到其标注关系，也要跟着动
                                for(var k=0;k<allOverlays.length;k++){
                                    if(allOverlays[k].hasOwnProperty("linkmarker")){
                                        if((allOverlays[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid))&&allOverlays[k].name == allOverlays[i].relationName){
                                            var points = allOverlays[i].getPath();
                                            var linelength = points.length;
                                            if(linelength>3){
                                                var centerNum = parseInt(linelength/2);
                                                var centerLine = points[centerNum];
                                                var center = new BMap.Point(centerLine.lng,centerLine.lat);
                                                allOverlays[k].setPosition(center);
                                            }
                                        }
                                    }
                                }

                                map.removeOverlay(allOverlays[i]);
                            }
                        }
                        if((allOverlays[i].targetid === thisMarker.id)){
                            if(allOverlays[i].linetype === "curve"){
                                var obj = {
                                    polylineid : allOverlays[i].polylineid,
                                    sourceid :allOverlays[i].sourceid,
                                    targetid : allOverlays[i].targetid,
                                    relationId : allOverlays[i].relationId,
                                    relationParentType : allOverlays[i].relationParentType,
                                    relationTypeName : allOverlays[i].relationName,
                                    time : allOverlays[i].time,
                                    source :allOverlays[i].source,
                                    target : allOverlays[i].target,
                                    tag : allOverlays[i].tag,
                                    targetgis : allOverlays[i].targetgis,
                                    sourcegis : allOverlays[i].sourcegis,
                                    linesize : allOverlays[i].linesize
                                };
                                obj.target.gis = {
                                    lon:e.point.lng,
                                    lat:e.point.lat
                                };
                                var conf = { linesizeNum : allOverlays[i].linesize };
                                var polyline = addMapOverlays(obj, "curve", conf);


                                //找到其标注关系，也要跟着动
                                for(var k=0;k<allOverlays.length;k++){
                                    if(allOverlays[k].hasOwnProperty("linkmarker")){
                                        if((allOverlays[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid))&& allOverlays[k].name == allOverlays[i].relationName){
                                            var points = allOverlays[i].getPath();
                                            var linelength = points.length;
                                            if(linelength>3){
                                                var centerNum = parseInt(linelength/2);
                                                var centerLine = points[centerNum];
                                                var center = new BMap.Point(centerLine.lng,centerLine.lat);
                                                allOverlays[k].setPosition(center);
                                            }

                                        }
                                    }
                                }

                                map.removeOverlay(allOverlays[i]);

                            }


                        }
                    }

                }

            });
            marker.addEventListener("dblclick", function(e) {
                if(!mapSmallSign){
                    mapdisk = true;
                    var conf = {
                        thisMarker:this,
                        markerId:this.id,
                        gis:{lat:this.point.lat,lon:this.point.lng},
                        nodeId:this.baseMsg.nodeId,
                        nodeType:this.baseMsg.type,
                        objectType:this.baseMsg.objectType,
                        page_type:this.baseMsg.page_type,
                        getLeft:this.V.offsetLeft - 238,
                        getTop:this.V.offsetTop - 236
                    };

                    d3.selectAll("#newDiv").remove();
                    setmapProperty("null","zoom-false","dbl-false");

                    mapCommon.mapWorkMarker = [];
                    mapCommon.mapWorkMarker.push(this);
                    mapCommon.mapWorkMarker[0].gis = {lat:this.point.lat,lon:this.point.lng};

                    if(marker.type === bayonetName){
                      mapCommonPart.topomenu(conf,"kkmenu");
                    }else{
                      mapCommonPart.topomenu(conf,"topomenu");
                    }
                }
            });
        }
        /**
         *
         * 添加覆盖物
         * @param overlays 必要 覆盖物
         * @param sign     必要 覆盖物类型
         * @param conf     可选 配置信息
         * marker      --   conf 无
         * curve       --   conf = { linesizeNum : linesizeNum };
         * curveMarker --   conf = { lineCenter : lineCenter, polyline : polyline };
         * @returns {*}
         */
        function addMapOverlays(overlays, sign, conf){
            if(sign === "marker"){
                var pointNEW = new BMap.Point(overlays.gis.lon,overlays.gis.lat);
                var marker = new BMap.Marker(pointNEW);

                if(overlays.hasOwnProperty("nogis") && overlays.nogis){
                    mapSetIcon(marker, markerPathPeople, 0.6, 0, 'yellow', 20, 42);
                    marker.enableDragging(true);           // 不可拖拽
                    marker.nogis= true;
                }else{
                    if(conf.type === "add"){
                        mapSetIcon(marker, markerPath, 1, 0, '#33D0FF', 10, 20);
                        marker.disableDragging();           // 不可拖拽
                    }else if(conf.type === "drag"){
                        var lays = map.getOverlays();
                        for(var t=0;t<lays.length;t++){
                            if(lays[t].hasOwnProperty("addnode")&&lays[t].getIcon().style.fillColor !== "yellow"){
                                mapSetIcon(lays[t], markerPath, 1, 0, '#33D0FF', 10, 20);
                                lays[t].setTop(false);
                                lays[t].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                            }
                        }
                        mapSetIcon(marker, markerPathPeople, 0.6, 0, 'red', 20, 42);
                        marker.disableDragging();           // 不可拖拽
                    }else if(conf.type === "keyarea"){
                        mapSetIcon(marker, markerPathPeople, 0.6, 0, 'red', 20, 42);
                        marker.disableDragging();
                    }
                }

                map.addOverlay(marker);
                var labelName;
                overlays.name ? labelName = overlays.name : labelName = "";
                var label = new BMap.Label(labelName,{offset:new BMap.Size(20,-10)});
                //label.setStyle({backgroundColor: "#5B7085",border:"#5E7489"});//#5E7489背景色
                if(conf.type === "add"){
                    mapFontStatus ? label.setStyle({backgroundColor: "#5B7085",border:"#5E7489" }) : label.setStyle({backgroundColor: "#5B7085",border:"#5E7489",display:"none" });
                }else if(conf.type === "drag"){
                    mapFontStatus ? label.setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"}) : label.setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                }else if(conf.type === "keyarea"){
                    mapFontStatus ? label.setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"}) : label.setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                }

                marker.setLabel(label);
                marker.type= overlays.type;
                marker.id= overlays.id;
                marker.gis= overlays.gis;
                marker.addnode= true;//overlays.addnode
                marker.baseMsg = overlays;
                marker.ableDrag = "false";
                marker.name = overlays.name;

                markerEvent(marker);
                return marker;
            }
            if(sign === "curve"){
                var points = [];
                var targetpoint = new BMap.Point(overlays.target.gis.lon, overlays.target.gis.lat);
                var sourcepoint = new BMap.Point(overlays.source.gis.lon, overlays.source.gis.lat);

                points.push(targetpoint);
                points.push(sourcepoint);
                var curvePoints = mapCommonPart.bmapGetCurveLine(points, conf.linesizeNum);

                var strokeColor = lineNames.length > 1 ? mapLineColor[lineNames.indexOf(overlays.relationParentType)]:'#A5ABB6';
                let linestyle = {strokeColor:strokeColor, strokeWeight:1, strokeOpacity:0.8};//"#FF9933"
                var polyline = new BMap.Polyline(curvePoints, linestyle);
                map.addOverlay(polyline);     //添加折线到地图上
                polyline.polylineid = overlays.source.id;
                polyline.sourceid = overlays.source.id;
                polyline.targetid = overlays.target.id;
                polyline.relationName = overlays.relationTypeName;
                polyline.relationId = overlays.relationId;
                polyline.relationParentType = overlays.relationParentType;
                polyline.target = overlays.target;
                polyline.source = overlays.source;
                if(overlays.time){
                    polyline.time = overlays.time.split(",").join("-");
                }else{
                    polyline.time = overlays.time;
                }
                polyline.tag = overlays.tag;
                polyline.targetgis = overlays.target.gis;
                polyline.sourcegis = overlays.source.gis;
                polyline.linetype = "curve";
                polyline.linesize = conf.linesizeNum;

                mapLineStatus ? polyline.show() : polyline.hide();
                return polyline;
            }
            if(sign === "curveMarker"){
                var center = new BMap.Point(conf.lineCenter.lng,conf.lineCenter.lat);
                var marker = new BMap.Marker(center, {
                    // 指定Marker的icon属性为Symbol
                    icon: new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
                        scale: 0.1,//图标缩放大小
                        fillColor: "#FF9933",//填充颜色
                        fillOpacity: 0.5//填充透明度
                    })
                });
                marker.id = conf.polyline.sourceid + conf.polyline.targetid;
                marker.linkmarker= true;
                marker.name = overlays.relationTypeName;
                //marker.relationName = gislinks[i].relationTypeName;
                map.addOverlay(marker);
                //marker.setOffset(new BMap.Size(2, 14));
                var label = new BMap.Label(overlays.relationTypeName,{offset:new BMap.Size(-20,-10)});
                if(mapFontStatus && mapLineStatus){
                    label.setStyle({backgroundColor:"rgba(0, 0, 0, 0)",border:"#FFC62E",color:"#FFC62E" });
                }else{
                    label.setStyle({backgroundColor:"rgba(0, 0, 0, 0)",border:"#FFC62E",color:"#FFC62E",display:"none" });
                }
                marker.setLabel(label);
                marker.disableDragging();           // 不可拖拽

                return marker;
            }
            if(sign === "bayonet"){
              var pointNEW = new BMap.Point(overlays.gis.lon,overlays.gis.lat);
              var marker = new BMap.Marker(pointNEW);

              if(overlays.hasOwnProperty("nogis")){
                mapSetIcon(marker, markerPathPeople, 0.6, 0, 'yellow', 20, 42);
                marker.enableDragging(true);           // 不可拖拽
                marker.nogis= true;
              }else{
                mapSetIcon(marker, markerPath, 1, 0, '#33D0FF', 10, 20);
                marker.disableDragging();           // 不可拖拽
              }

              map.addOverlay(marker);
              var labelName;
              overlays.name ? labelName = overlays.name : labelName = "";
              var label = new BMap.Label(labelName,{offset:new BMap.Size(20,-10)});
              mapFontStatus ? label.setStyle({backgroundColor: "#5B7085",border:"#5E7489" }) : label.setStyle({backgroundColor: "#5B7085",border:"#5E7489",display:"none" });

              marker.setLabel(label);
              marker.type= overlays.type;
              marker.id= overlays.id;
              marker.gis= overlays.gis;
              marker.addnode= true;//overlays.addnode
              marker.baseMsg = overlays;
              marker.ableDrag = "false";
              marker.name = overlays.name;

              markerEvent(marker);
              return marker;
            }
            if(sign === "bayonetMV"){
              var pointNEW = new BMap.Point(overlays.gis.lon,overlays.gis.lat);
              var marker = new BMap.Marker(pointNEW);

              mapSetIcon(marker, markerPathPeople, 0.01, 0, '#33D0FF', 1, 1);
              marker.disableDragging();           // 不可拖拽

              map.addOverlay(marker);
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

              var label = new BMap.Label(areaContent,{offset:new BMap.Size(20,-10)});
              mapFontStatus ? label.setStyle({backgroundColor: "#5B7085",border:"#5E7489" }) : label.setStyle({backgroundColor: "#5B7085",border:"#5E7489",display:"none" });

              marker.setLabel(label);
              marker.type= overlays.type;
              marker.id= overlays.id;
              marker.gis= overlays.gis;
              marker.addnode= true;//overlays.addnode
              marker.baseMsg = overlays.baseMsg;
              marker.ableDrag = "false";
              marker.name = overlays.name;

              $(".gis-bayonet-table-surveillance-show").css("width", "320px").css("height", "160px").css("display", "block");
              $(".gis-bayonet-table-surveillance-show-btn").css("position", "absolute").css("top", "2px").css("right", "2px");
              //关闭实时监控
              $(".gis-bayonet-table-surveillance-show-btn").unbind("click").bind("click",function (e) {
                $(this).parent().parent().parent().parent().remove();
              });

              //移动条
              $(".gis-bayonet-table-surveillance-show").mousedown(function (event) {
                $(this).css('position','absolute');
                mapCommonPart.surveillanceDragBar(this, event);
              });

              return marker;
            }
        }
        //添加点线
        function addMapMarkerLine(gisnodes,gislinks){
            gislinks.forEach(link => lineNames.push(link.relationParentType));
            lineNames = [...new Set(lineNames)];
            var mapTooltipSign = false;//用于判断 提示信息是否显示
            var gisAllSearchDatas = gisnodes;
            var mapStepOverlays = [];//用于放入mapStep
            for (var i = 0; i < gisAllSearchDatas.length; i ++) {
                if(gisAllSearchDatas[i].hasOwnProperty("nogis") && gisAllSearchDatas[i].nogis){
                    noGisPoints.push(gisAllSearchDatas[i]);
                    mapTooltipSign = true;
                }
                var haveMarker = mapRepeat(gisAllSearchDatas[i],"marker");
                if(!haveMarker){//如果不存在，才加点
                    var conf = { type:"add" };
                    var marker = addMapOverlays(gisAllSearchDatas[i], "marker", conf);
                    var step = {
                        data:marker,
                        type:"marker"
                    };
                    mapStepOverlays.push(step);
                }
            }
            if(gislinks !== "no"){
                for(var i=0;i<gislinks.length;i++){
                    var haveLine = mapRepeat(gislinks[i],"polyline");
                    let linkSourceId = gislinks[i].source.id;
                    let linkTargetId = gislinks[i].target.id;

                    if(getGisByMarkerId(linkSourceId)){
                        gislinks[i].source.gis = getGisByMarkerId(linkSourceId);
                    }
                    if(getGisByMarkerId(linkTargetId)){
                        gislinks[i].target.gis = getGisByMarkerId(linkTargetId);
                    }

                    if((gislinks[i].source.gis != null) && (gislinks[i].target.gis != null) ){
                        var lineSizeNum = haveLine ? haveLine.length : 170;
                        if(haveLine !== "have"){
                            var conf = { linesizeNum : lineSizeNum };
                            var polyline = addMapOverlays(gislinks[i], "curve", conf);

                            var line = polyline.getPath();
                            var linelength = line.length;
                            var marker;
                            if(linelength>3){
                                var centerNum = parseInt(linelength/2);
                                var lineCenter = line[centerNum];
                                var conf = {
                                    lineCenter : lineCenter,
                                    polyline : polyline
                                };
                                marker = addMapOverlays(gislinks[i], "curveMarker", conf);
                            }
                            var step = {
                                data:marker,
                                type:"marker"
                            };
                            var stepM = {
                                data:polyline,
                                type:"polyline"
                            };
                            mapStepOverlays.push(step);
                            mapStepOverlays.push(stepM);
                        }
                    }

                }
            }

            if(mapTooltipSign){
                mapCommonPart.mapTooltip();//提示信息
            }
            mapStep.push(mapStepOverlays);
            mapType.push("add");
            mapStepNum++;

            mapSetAggregation("reset");
        }
        //根据点的id，获得对应的经纬度信息
        function getGisByMarkerId(markerId){
            let markers = getMapMarkers();
            markers.forEach( ms => {
                if(ms.hasOwnProperty("addnode") && ms.id === markerId){
                    return ms.gis
                }
            });
        }

        /**
         * 设置点图标
         * @param {*} overlays 覆盖物
         * @param {*} icon     图标
         * @param {*} scale    比例
         * @param {*} rotation 旋转角度
         * @param {*} color    颜色
         * @param {*} width    宽度
         * @param {*} height   高度
         */
        function mapSetIcon(overlays, icon, scale, rotation, color, width, height){
            overlays.setIcon(
                new BMap.Symbol(icon, {
                    scale: scale,//图标缩放大小
                    rotation: rotation,//顺时针旋转0度
                    fillColor: color,
                    anchor:{width:width,height:height},
                    fillOpacity: 0.8,
                    strokeColor: color,
                    strokeWeight: 1//线宽
                })
            );
        };

        /**
         * 去重 点or线
         * @param {*} lays 覆盖物（点or线）
         * @param {*} type { marker | line } 判断去重覆盖物的类型
         */
        function mapRepeat(lays,type){
            var allOverlays = map.getOverlays();
            switch (type) {
                case "marker":
                    var haveMarker = false;
                    for(var j=0;j<allOverlays.length;j++){
                        if(allOverlays[j].hasOwnProperty("id")&&allOverlays[j].id==lays.id){
                            haveMarker = true;
                        }
                    }
                    return haveMarker;
                    break;
                case "line":
                    var haveLine = false;//去重
                    for(var j=0;j<allOverlays.length;j++) {
                        if (allOverlays[j].hasOwnProperty("polylineid")) {
                            if((allOverlays[j].sourceid==lays.sourceid&&allOverlays[j].targetid==lays.targetid)||(allOverlays[j].sourceid==lays.targetid&&allOverlays[j].targetid==lays.sourceid)){
                                haveLine = true;
                            }
                        }
                    }
                    return haveLine;
                    break;
                case "polyline":
                    var lineAll = [];
                    var haveCurve = false;
                    for(var j=0;j<allOverlays.length;j++) {
                        if (allOverlays[j].hasOwnProperty("polylineid")) {
                            if((allOverlays[j].source.id==lays.source.id&&allOverlays[j].target.id==lays.target.id)||(allOverlays[j].source.id==lays.target.id&&allOverlays[j].target.id==lays.source.id)){
                                //id相同时，比较关系名称是否相同
                                haveCurve = true;
                                lineAll.push(allOverlays[j]);
                            }
                        }
                    }

                    if(haveCurve && lays.hasOwnProperty("relationName")){
                        for(var n=0;n<lineAll.length;n++){
                            if((lineAll[n].sourceid==lays.source.id&&lineAll[n].targetid==lays.target.id)&&(lays.relationName == lineAll[n].relationName)){
                                return "have";
                            }
                        }
                        return lineAll;
                    }
                    if(haveCurve && lays.hasOwnProperty("relationTypeName")){
                        for(var n=0;n<lineAll.length;n++){
                            if((lineAll[n].sourceid==lays.source.id&&lineAll[n].targetid==lays.target.id)&&(lays.relationTypeName == lineAll[n].relationName)){
                                return "have";
                            }
                        }
                        return lineAll;
                    }

                    return false;
            }

        }

        /**
         * 删除点
         * @param {*} markerId 需要删除的覆盖物的id
         */
        function deleteMarker(markerId){
            var mapStepOverlays = [];//存放删除的数据
            for(var n = 0;n<markerId.length;n++){
                var allOverlays = map.getOverlays();
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("id")){
                        if(allOverlays[i].id==markerId[n]){
                            //存入到后退数组中~
                            var step = {
                                data:allOverlays[i],
                                type:"marker"
                            };
                            mapStepOverlays.push(step);
                            //删除对应的点
                            map.removeOverlay(allOverlays[i]);
                        }
                    }
                    if(allOverlays[i].hasOwnProperty("polylineid")){
                        if(allOverlays[i].sourceid==markerId[n]||allOverlays[i].targetid==markerId[n]){
                            var stepM = {
                                data:allOverlays[i],
                                type:"polyline",
                                relationName:allOverlays[i].relationName
                            };
                            mapStepOverlays.push(stepM);
                            map.removeOverlay(allOverlays[i]);

                            for(var k=0;k<allOverlays.length;k++){
                                if(allOverlays[k].hasOwnProperty("linkmarker")){
                                    if(allOverlays[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid)){
                                        //var stepML = { data:allOverlays[k], type:"marker" };
                                        //mapStepOverlays.push(stepML);
                                        map.removeOverlay(allOverlays[k]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //工作台nodes移除
            //globalFuction.deleteMapNode(markerId);

            mapStep.push(mapStepOverlays);
            mapType.push("del");
            mapStepNum++;
        }
        //聚合
        function mapSetAggregation(sign){
            if((sign=="add")&&(markerClustererSign==false)){
                //汇聚功能
                var markers = [];
                var allOverlays = map.getOverlays();
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("addnode")){
                        markers.push(allOverlays[i]);
                    };
                }
                //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
                markerClusterer = new BMapLib.MarkerClusterer(map, {markers:markers});
                markerClustererSign = true;
            }else if((sign=="del")&&(markerClustererSign==true)){
                markerClusterer.stopClusterer();
                markerClusterer = null;
                markerClustererSign = false;
            }else if(sign == "reset"&&(markerClustererSign==true)){

                markerClusterer.stopClusterer();
                markerClusterer = null;
                markerClustererSign = false;


                // 重新进行汇聚功能
                var markers = [];
                var allOverlays = map.getOverlays();
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("addnode")){
                        markers.push(allOverlays[i]);
                    };
                }
                //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
                markerClusterer = new BMapLib.MarkerClusterer(map, {markers:markers});
                markerClustererSign = true;

            }

        }

        /**
         * 路书lushu开始方法
         * @param {*} Id        开始点的id
         * @param {*} retpath   路书的轨迹信息
         * @param {*} iconImg   移动覆盖物的图标
         * @param {*} num       第几段路书
         * @param {*} lushuName 路书的名字
         */
        function lushuStart(Id,retpath,iconImg,num,lushuName){

          let lushuSize = mapCommonPart.getLuShuByName(lushuName);
            if(num==0){
                var lushu = new BMapLib.LuShu(lushuSize.name, map,Id,retpath,{
                    defaultContent:"",//"从天安门到百度大厦"
                    autoView:true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                    icon  : new BMap.Icon(iconImg,
                        new BMap.Size(33,33),{anchor : new BMap.Size(16, 16)}),
                    speed: 450000,
                    enableRotation:true//是否设置marker随着道路的走向进行旋转
                });

                lushu.start();
            }else{
                var stopnum = 0;
                var lushuSetInt = setInterval(function(){
                    stopnum++;
                    if(num==lushuSize.size){
                        var lushu = new BMapLib.LuShu(lushuSize.name, map,Id,retpath,{
                            defaultContent:"",//"从天安门到百度大厦"
                            autoView:true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                            icon  : new BMap.Icon(iconImg,
                                new BMap.Size(33,33),{anchor : new BMap.Size(16, 16)}),
                            speed: 450000,
                            enableRotation:true//是否设置marker随着道路的走向进行旋转
                        });
                        lushu.start();
                        clearInterval(lushuSetInt);
                    }
                    if(stopnum>150){
                        clearInterval(lushuSetInt);
                    }
                },500);
                lushuSize.lushu.push(lushuSetInt); // 把定时器存到相关的数据下
            }

        }

        /**
         * 地图选区菜单功能
         * @param {*} data    选区内的点 数据
         * @param {*} action  操作类型 { Statistics | delInPoint | delOutPoint}
         */
        function mapSelectArea(data, action) {
            if(action == "Statistics"){//统计
                mapStatistics(data);
            }else if(action == "delInPoint"){//删除内点
                var allOverlays = map.getOverlays();
                var ids = [];
                for(var i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("id")){
                        for(var j=0;j<data.length;j++){
                            if(allOverlays[i].id == data[j].id){
                                ids.push(allOverlays[i].id);
                            }
                        }
                    }
                }
                deleteMarker(ids);
            }else if(action == "delOutPoint"){// 删除外点
                var allOverlays = map.getOverlays();
                var ids = [];
                for(var i=0;i<allOverlays.length;i++){
                    var delSign = true;
                    if(allOverlays[i].hasOwnProperty("id")){
                        for(var j=0;j<data.length;j++){
                            if(allOverlays[i].id == data[j].id){
                                delSign = false;
                            }
                        }
                    }
                    if(delSign&&allOverlays[i].hasOwnProperty("addnode")){
                        ids.push(allOverlays[i].id);
                    }
                }
                deleteMarker(ids);
            }

        }
        
        /**
         * 地图选区菜单-统计功能
         * @param {*} data    选区内的点 数据
         */
        function mapStatistics(data) {
            var allOverlays = map.getOverlays();
            var allNodeId = {
                ids: [],
                types: []
            };
            for(var i=0;i<allOverlays.length;i++){
                if(allOverlays[i].hasOwnProperty("id") && data){
                    for(var j=0;j<data.length;j++){
                        if(allOverlays[i].id == data[j].id){
                            allNodeId.ids.push(allOverlays[i].id);
                            allNodeId.types.push(allOverlays[i].type);
                        }
                    }
                }
            }
            getTotalMessage(allNodeId); //统计信息
        }
        //轨迹设置-确定按钮
        $("#map_path_ensure").bind("click",function(){
            $(".map_path").css("height","40px").css("overflow","hidden");

            var startTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[0].trim() : "";
            var endTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[1].trim() : "";

            // 轨迹类型
            var trackStatues = [];
            /*$("input[name='mapPath']:checked").each(function(){
                trackStatues.push($(this).val());
            });*/

            $("input[name='mapPath']").each(function(){
                if( $(this).attr("checked")){
                    trackStatues.push($(this).val());
                }
            });

            var basePoint = new BMap.Point(mapPathBasePoint.gis.lon, mapPathBasePoint.gis.lat);
            var Id = mapPathBasePoint.id;
            var nodeType = mapPathBasePoint.baseMsg.type;
            var nodeId = mapPathBasePoint.baseMsg.nodeId;

            // 删除mapPathBasePoint 原来有的轨迹
            var allOverlays = map.getOverlays();
            for(var j=0;j<allOverlays.length;j++){
                if(allOverlays[j].hasOwnProperty("twoId")){
                    if(allOverlays[j].twoId.one===Id&&allOverlays[j].twoId.two === "first"){
                        map.removeOverlay(allOverlays[j]);
                    }
                }
                if(allOverlays[j].hasOwnProperty("sign")&&allOverlays[j].sign === "lushu"){
                    if(allOverlays[j].id===Id){
                        map.removeOverlay(allOverlays[j]);
                    }
                }
            }

            //后台请求，获得轨迹的数据
            for(var i=0;i<trackStatues.length;i++){
                if(trackStatues[i] === "pathAppearSite"){//出现地点
                    $.ajax({//pathType:"pathAppearSite"
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
                                var addData = [
                                    {
                                        gis: {
                                            lon: 106.237056,
                                            lat: 29.789903
                                        },
                                        address: "重庆市鹅岭正街176号"
                                    },
                                    {
                                        gis: {
                                            lon: 121.50871,
                                            lat: 31.244821
                                        },
                                        address: "浦东新区陆家嘴环路1388号"
                                    },
                                    {
                                        gis: {
                                            lon: 126.639351,
                                            lat: 45.749688
                                        },
                                        address: "哈尔滨工业大学"
                                    }
                                ];
                                var points = [];
                                var mapStepOverlays = [];

                                for (var k = 0; k < addData.length; k++) {
                                    var point = new BMap.Point(addData[k].gis.lon, addData[k].gis.lat);
                                    points.push(basePoint);
                                    points.push(point);
                                    var twoId = {
                                        one: Id,
                                        two: "first",
                                        address: addData[k].address
                                    };
                                    var curve = new BMapLib.CurveLine(twoId, "first", points, {
                                        strokeColor: "yellow",
                                        strokeWeight: 1,
                                        strokeOpacity: 0.9
                                    }); //创建弧线对象
                                    map.addOverlay(curve); //添加到地图中
                                    curve.enableEditing(); //开启编辑功能
                                    points = [];

                                    var allPathLUSHU = [];
                                    var retpath = curve.getPath();
                                    for(var p=0;p<retpath.length;p++){
                                        allPathLUSHU.push(retpath[p]);
                                    }
                                }
                                var step = {one: Id, two: "first"}
                                mapStepOverlays.push(step);
                                mapStep.push(mapStepOverlays);
                                mapType.push("addCurve");
                                mapStepNum++;
                            }
                        }
                    });
                }
                if(trackStatues[i] === "pathMigratory"){//迁徙轨迹
                  if(nodeType === "JDCXX" || nodeType === "CAR"){
                    let carPathType = 1;
                    $.ajax({
                      url: EPMUI.context.url + '/object/path/gis',
                      type: 'GET',
                      data: {
                        objectId: Id,
                        objectType: nodeType,
                        beginTime: startTime,
                        endTime:endTime,
                        pathType:carPathType
                      },
                      dataType: 'json',
                      success: function (data) {
                        if (data.code == "200") {
                          var setAddData = data.magicube_interface_data;
                          var addData = [];
                          for(var l=0;l<setAddData.length;l++){
                            if(setAddData[l].gis[1]>0 && setAddData[l].gis[0]>0){
                              addData.push(setAddData[l]);
                            }
                          }
                          addPath(addData,basePoint,Id);
                        }
                      }
                    });

                  }else {
                    let carPathType = "pathAppearSite";
                    $.ajax({//pathType:"pathMigratory"
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
                          addPath(data.magicube_interface_data,basePoint,Id);
                        }else{
                          if( mapPathBasePoint.name === "田雪"){
                            let addData = [
                              {
                                gis: [113.63774, 34.753677],
                                address: "郑州",
                                id: "273F534A64EEB25B211565C5DEF3FEA2",
                                name:"郑州",
                                nodeId:"68934486",
                                objectType: "entity",
                                page_type:"entity",
                                type :"KKXX"
                              },
                              {
                                gis: [101.78962, 36.625007] ,
                                address: "西宁",
                                id: "273F534A64EEB25B212365C5DEF3FEA2",
                                name:"西宁",
                                nodeId:"68933386",
                                objectType: "entity",
                                page_type:"entity",
                                type :"KKXX"
                              },
                              {
                                gis: [106.556712, 29.569247],
                                address: "重庆",
                                id: "273F534A64EEB25B2115qweDEF3FEA2",
                                name:"重庆",
                                nodeId:"68932286",
                                objectType: "entity",
                                page_type:"entity",
                                type :"KKXX"
                              },
                              {
                                gis: [87.615239,  43.830555],
                                address: "乌鲁木齐",
                                id: "273F534A64EEB25B21156q1wEF3FEA2",
                                name:"乌鲁木齐",
                                nodeId:"68931186",
                                objectType: "entity",
                                page_type:"entity",
                                type :"KKXX"
                              }
                            ];
                            addPath(addData,basePoint,Id);
                          }
                        }
                      }
                    });
                  }
                }
            }

        });
        //轨迹取消
        $("#map_path_cancel").bind("click",function(){
            $(".map_path").hide();
        });
        //鼠标 选区 工具按钮控制
        $("#map_tool").click(function(){
            //调整div的位置
            if(mapRight){
                var _width = $("#topology_message").css('width');
                $(".BMapLib_Drawing_panel").css("right",parseInt(_width)+ 26 + 'px');
            }else{
                $(".BMapLib_Drawing_panel").css("right",26 + 'px');
            }
            if(!mapToolSign){
                mapToolSign=true;
                drawingManager.open();
                $(".BMapLib_Drawing_panel").show();
            }else{
                mapToolSign=false;
                drawingManager.close();
                $(".BMapLib_Drawing_panel").hide();
                $("svg[type='system']").css("cursor","pointer");
            }
        });

      //工具栏菜单-设置
      /**
       * 显示设置！
       * @param coverage 地图点的显示类型 { defaultmap | heatmap | smallPointmap }
       */
      this.baseSetting = function (coverage){
        if(coverage==="defaultmap"){//默认图
          if(mapHeatSign){//热力图==》默认图
            closeHeatmap();
            var allOverlays = map.getOverlays();
            for(var i=0;i<allOverlays.length;i++){
              if(allOverlays[i].hasOwnProperty("addnode")){
                allOverlays[i].show();
                if(allOverlays[i].hasOwnProperty("nogis")){
                  if(allOverlays[i].nogis){
                    mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'yellow', 20, 42);
                    allOverlays[i].getLabel().setStyle({display: "block"});
                  }else{
                    mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                    allOverlays[i].getLabel().setStyle({display: "block"});
                  }
                }else{
                  mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                  allOverlays[i].getLabel().setStyle({display: "block"});
                }
              }
              if(allOverlays[i].hasOwnProperty("linkmarker")){
                allOverlays[i].show();
              }
              if(allOverlays[i].hasOwnProperty("polylineid")){
                allOverlays[i].show();
              }
            }
            mapSmallSign = false;
            mapHeatSign = false;
          }
          if(mapSmallSign){//小点图==》默认图
            var allOverlays = map.getOverlays();
            for(var i=0;i<allOverlays.length;i++){
              if(allOverlays[i].hasOwnProperty("addnode")){
                if(allOverlays[i].hasOwnProperty("nogis")){
                  if(allOverlays[i].nogis){
                    mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'yellow', 20, 42);
                    allOverlays[i].getLabel().setStyle({display: "block"});
                  }else{
                    mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                    allOverlays[i].getLabel().setStyle({display: "block"});
                  }
                }else{
                  mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                  allOverlays[i].getLabel().setStyle({display: "block"});
                }
              }
              if(allOverlays[i].hasOwnProperty("linkmarker")){
                allOverlays[i].show();
              }
              if(allOverlays[i].hasOwnProperty("polylineid")){
                allOverlays[i].show();
              }
            }
            mapSmallSign = false;
            mapHeatSign = false;
          }
        }else if(coverage==="heatmap"){//热力图
          if(!mapHeatSign){
            mapSetAggregation("del");//关闭聚合
            if(true){//!mapSmallSign
              mapHeatSign = true;
              function setGradient(){
                var gradient = {};
                var colors = document.querySelectorAll("input[type='color']");
                colors = [].slice.call(colors,0);
                colors.forEach(function(ele){
                  gradient[ele.getAttribute("data-key")] = ele.value;
                });
                heatmapOverlay.setOptions({"gradient":gradient});
              }
              //判断浏览区是否支持canvas
              function isSupportCanvas(){
                var elem = document.createElement('canvas');
                return !!(elem.getContext && elem.getContext('2d'));
              }

              var points = [];
              var allOverlays = map.getOverlays();
              for(var i=0;i<allOverlays.length;i++){
                if(allOverlays[i].hasOwnProperty("addnode")){
                  var point = {
                    "lng":allOverlays[i].gis.lon,
                    "lat":allOverlays[i].gis.lat,
                    "count":28,
                    "marker":allOverlays[i]
                  };
                  points.push(point);
                }
              }
              //清除原来的点类型
              for(var i=0;i<allOverlays.length;i++){
                if(allOverlays[i].hasOwnProperty("addnode")){
                  allOverlays[i].hide();
                }else if(allOverlays[i].hasOwnProperty("linkmarker")){
                  allOverlays[i].hide();
                }else if(allOverlays[i].hasOwnProperty("polylineid")){
                  allOverlays[i].hide();
                }
              }

              if(!isSupportCanvas()){
                alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
              }
              var heatmapOverlay = new BMapLib.HeatmapOverlay({"radius":20});
              map.addOverlay(heatmapOverlay);
              heatmapOverlay.setDataSet({data:points,max:100});

              function openHeatmap(){
                heatmapOverlay.show();
              }
              window.closeHeatmap = function(){
                heatmapOverlay.hide();
                var delHotMark = [];
                var allOverlays = map.getOverlays();
                for(var i=0;i<allOverlays.length;i++){
                  if(allOverlays[i].hasOwnProperty("hotPoint")){
                    delHotMark.push(allOverlays[i]);
                  }
                }
                for(var j=0;j<delHotMark.length;j++){
                  map.removeOverlay(delHotMark[j]);
                }

              }
            }

            mapSmallSign = false;
          }
        }else if(coverage==="smallPointmap"){//小点图
          if(mapHeatSign){//热力图==》小点图
            closeHeatmap();
            mapHeatSign = false;
          }
          mapSetAggregation("del");//关闭聚合
          var allOverlays = map.getOverlays();
          //清除原来的点类型
          for(var i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("addnode")){
              mapSetIcon(allOverlays[i], BMap_Symbol_SHAPE_STAR, 0.3, 0, 'yellow', 2, 2);
              allOverlays[i].show();
              allOverlays[i].getLabel().setStyle({display: "none"});
            }
            if(allOverlays[i].hasOwnProperty("linkmarker")){
              allOverlays[i].hide();
            }
            if(allOverlays[i].hasOwnProperty("polylineid")){
              allOverlays[i].hide();
            }
          }

          mapSmallSign = true;
        }
      };

      /**
       * 点线设置
       * @param fontlineStatues 点线设置参数数组 [ hideline | hidefont | smallPointmap ] 
       */
      this.fontlineSetting = function (fontlineStatues){
        if(fontlineStatues.length==0&&!mapHeatSign&&!mapSmallSign){//显示线 字
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            //显示文字
            if(allOverlays[i].hasOwnProperty("addnode")){
              allOverlays[i].getLabel().setStyle({display: "block"});
            }
            if(allOverlays[i].hasOwnProperty("linkmarker")){
              allOverlays[i].getLabel().setStyle({display: "block"});
            }
            //显示连线
            if(allOverlays[i].hasOwnProperty("polylineid")){
              allOverlays[i].show();
            }
            if(allOverlays[i].hasOwnProperty("linkmarker")){
              allOverlays[i].show();
            }
          }
          mapFontStatus = true;
          mapLineStatus = true;
        }else if(fontlineStatues.length==1&&!mapHeatSign&&!mapSmallSign){
          if(fontlineStatues[0] == "hideline"){//隐藏连线 显示文字
            var allOverlays = map.getOverlays();
            for(var i=0;i<allOverlays.length;i++){
              //显示文字
              if(allOverlays[i].hasOwnProperty("addnode")){
                allOverlays[i].getLabel().setStyle({display: "block"});
              }
              if(allOverlays[i].hasOwnProperty("linkmarker")){
                allOverlays[i].getLabel().setStyle({display: "block"});
              }
              //隐藏连线
              if(allOverlays[i].hasOwnProperty("polylineid")){
                allOverlays[i].hide();
              }
              if(allOverlays[i].hasOwnProperty("linkmarker")){
                allOverlays[i].hide();
              }
            }
            mapFontStatus = true;
            mapLineStatus = false;
          }else if(fontlineStatues[0] === "hidefont"){//隐藏文字 显示连线
            var allOverlays = map.getOverlays();
            for(var i=0;i<allOverlays.length;i++){
              //隐藏文字
              if(allOverlays[i].hasOwnProperty("addnode")){
                allOverlays[i].getLabel().setStyle({display: "none"});
              }
              if(allOverlays[i].hasOwnProperty("linkmarker")){
                allOverlays[i].getLabel().setStyle({display: "none"});
              }
              //显示连线
              if(allOverlays[i].hasOwnProperty("polylineid")){
                allOverlays[i].show();
              }
              if(allOverlays[i].hasOwnProperty("linkmarker")){
                allOverlays[i].show();
              }
            }
            mapFontStatus = false;
            mapLineStatus = true;
          }
        }else if(fontlineStatues.length==2&&!mapHeatSign&&!mapSmallSign){
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            //隐藏文字
            if(allOverlays[i].hasOwnProperty("addnode")){
              allOverlays[i].getLabel().setStyle({display: "none"});
            }
            if(allOverlays[i].hasOwnProperty("linkmarker")){
              allOverlays[i].getLabel().setStyle({display: "none"});
            }
            //隐藏连线
            if(allOverlays[i].hasOwnProperty("polylineid")){
              allOverlays[i].hide();
            }
            if(allOverlays[i].hasOwnProperty("linkmarker")){
              allOverlays[i].hide();
            }
          }
          mapFontStatus = false;
          mapLineStatus = false;
        }
      };

      /**
       * 聚合设置
       * @param mapAggregation 是否聚合的参数
       */
      this.aggregationSetting = function (mapAggregation){
        if(mapAggregation === "aggregation"&&!mapHeatSign&&!mapSmallSign){
          //聚合方法
          mapSetAggregation("add");
        }else if(mapAggregation !== "aggregation"){
          mapSetAggregation("del");
        }
      };

      /**
       * 图层设置
       * @param showSettings 图层参数 { bayonet(卡口) }  
       */
      this.showSetting = function (showSettings){
        //卡口图层
        if(showSettings && showSettings.indexOf("bayonet") > -1){
          if( !bayonetSign ){
            var allOverlays = map.getOverlays();
            for(var i=0;i<allOverlays.length;i++){
              if(allOverlays[i].hasOwnProperty("type")&&allOverlays[i].type === bayonetName){
                map.removeOverlay(allOverlays[i]);
              }
            }

            $.ajax({
               url: EPMUI.context.url + '/object/all/bayonet',
               type: 'POST',
               data: {},
               dataType: 'json',
               success: function (data) {
               if (data.code == "200") {
                 let addData = data.magicube_interface_data;
                 for(let k=0;k<addData.length;k++){
                  let bayonet = addMapOverlays(addData[k], "bayonet");
                 }

                 bayonetSign = true;
               }

               }
            });

            /*let returnBayonetData = [
              {
                gis: {
                  lon: 100.237056,
                  lat: 24.789903
                },
                address: "哈尔滨工业大学",
                id: "273F534A64EEB25B211565C5DEF3FEA2",
                name:"华容路卡口",
                nodeId:"68936086",
                objectType: "entity",
                page_type:"entity",
                type :"KKXX"
              },
              {
                gis: {
                  lon: 120.50871,
                  lat: 30.244821
                },
                address: "哈尔滨工业大学",
                id: "273F534A64EEB25B211565C5DEF3FEA2",
                name:"迎泽路卡口",
                nodeId:"68936086",
                objectType: "entity",
                page_type:"entity",
                type :"KKXX"
              },
              {
                gis: {
                  lon: 122.639351,
                  lat: 45.749688
                },
                address: "哈尔滨工业大学",
                id: "273F534A64EEB25B211565C5DEF3FEA2",
                name:"五一路卡口",
                nodeId:"68936086",
                objectType: "entity",
                page_type:"entity",
                type :"KKXX"
              }
            ];

            for(let k=0;k<returnBayonetData.length;k++){
              let bayonet = addMapOverlays(returnBayonetData[k], "bayonet");
            }

            bayonetSign = true;*/
          }
        }else{
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("type")&&allOverlays[i].type === bayonetName){
              map.removeOverlay(allOverlays[i]);
            }
          }

          bayonetSign = false;
        }
        //重点人相关
        if(showSettings && showSettings.indexOf("keyPerson") > -1){

        }else{

        }

      };

      /**
       * 区域设置
       * @param areaSettings 区域设置参数 { keyArea }
       */
      this.areaSetting = function (areaSettings){
        //重点区域 显示隐藏
        if(areaSettings && areaSettings.indexOf("keyArea") > -1){
          if( !keyAreaSign ){
            addKeyArea();
            keyAreaSign = true;
          }
        }else{
          var allOverlays = map.getOverlays();
          for(var k=0;k<allOverlays.length;k++) {
            if (allOverlays[k].hasOwnProperty("addattr")&&allOverlays[k].addattr.sign === "keyarea") {
              map.removeOverlay(allOverlays[k]);
            }
            if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type === "areaMarker") {//清除区域分析
              map.removeOverlay(allOverlays[k]);
            }
          }
          //清除人员流动
          removePeopleMove();
          keyAreaSign = false;
        }
      };

      /**
       * 绘制区域设置
       * @param drawArea 绘制区域的类型
       */
      this.drawAreaSetting = function (drawArea){
         if(drawArea){
           drawingManager.open();
           drawingManager.setDrawingMode(drawArea);
         }
      };

      /**
       * 添加告警人员行动轨迹
       * @param addData   轨迹数据
       * @param basepoint 开始点
       * @param linecolor 轨迹线条颜色
       */
      this.addWarningMovePath = function(addData,basepoint,linecolor){
        addPath(addData, new BMap.Point(basepoint.lon,basepoint.lat),basepoint.id ,linecolor);
        //计算所有的轨迹的时间分布
        /*let allOverlays = map.getOverlays();
        let newLine = allOverlays.filter( ( item, index ) => {
          return item.hasOwnProperty("twoId") && item.hasOwnProperty("time")
        } );

        let timeLines = [];
        for(let n=0;n<newLine.length;n++){
          let lineStr = {relationName: "轨迹", time: newLine[n].time, y: 1};
          timeLines.push(lineStr);
        }
        mapCommonPart.addTimeLineData(timeLines);*/

      };

      /**
       * 添加告警人员同行分析
       * @param addData   轨迹数据
       * @param linecolor 轨迹线条颜色
       */
      this.addPathMergeAnalysis = function(addData,linecolor){
        //addPath(addData, new BMap.Point(basepoint.lon,basepoint.lat),basepoint.id );
        let lc = linecolor? linecolor : "#FF0000";

        if(addData.length < 1){
          return ;
        }
        timelineIntervalSign = true;

        
        let mapStepOverlays = [];

        let lushulen = lushuNum.length+1;
        let lushuName = "l"+lushulen;
        lushuNum.push({ name: lushuName, size: 0, lushu:[] });

        for (let k = 0; k < addData.length; k++) {
          let firstPoint = new BMap.Point(addData[k].beginGislon, addData[k].beginGislat);
          let point = new BMap.Point(addData[k].endGislon, addData[k].endGislat);
          let points = [];
          points.push(firstPoint);
          points.push(point);
          let twoId = {
            one: addData[k].idCardFirst,
            two: "first",
            address: '',
            time: addData[k].startTime,
            firstPoint:firstPoint,
            lastPoint:point
          };

          let curve = new BMapLib.CurveLine(twoId, "txcurve", points, {
            strokeColor: lc,//D75C22
            strokeWeight: 5,
            strokeOpacity: 0.7
          }); //创建弧线对象
          map.addOverlay(curve); //添加到地图中
          curve.enableEditing(); //开启编辑功能

        }
        let step = {one: addData[0].idCardFirst, two: "first"};
        mapStepOverlays.push(step);
        mapStep.push(mapStepOverlays);
        mapType.push("addCurve");
        mapStepNum++;

      };

      //获得地图上所有点
      window.getMapMarkers = function(){
          return map.getOverlays();
      };

      /**
       * 改变圆内外点颜色
       * @param data 需要修改的点
       */
      window.changeMarkerColor = function(data){
          var multipleEntity = []; // 选区选中的多个实体 marker
          if(!mapSmallSign) {
              var allOverlays = map.getOverlays();
              for (var i = 0; i < allOverlays.length; i++) {
                  if (allOverlays[i].hasOwnProperty("addnode") && allOverlays[i].getIcon().style.fillColor !== "yellow") {
                      mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                      allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085", border: "#D7EFFF",color:"black"});
                  }
              }

              for (var i = 0; i < allOverlays.length; i++) {
                  if (allOverlays[i].hasOwnProperty("id")) {
                      for (var j = 0; j < data.length; j++) {
                          if (allOverlays[i].id == data[j].id) {
                              mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                              allOverlays[i].getLabel().setStyle({backgroundColor: "#E2382A", border: "#FFC62E",color:"#fff"});
                              //把id存起来，用做扩展多个实体时使用
                              multipleEntity.push(allOverlays[i]);
                          }
                      }
                  }
              }

          }

      };

      /**
       * 地图点还原为 未选中 状态
       */
      window.mapOpacity = function(sign){
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
              if(sign){//改为未选中状态
                  if(allOverlays[i].hasOwnProperty("addnode")){
                      if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                          mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                          allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                      }
                  }
              }
          }
      };
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


          //所有线还原，再判断符合要求的线 ; 活动选择时间段，对应点线 选中
        let selectedLines = [];
        let allOverlays = map.getOverlays();
        if(times.length <= 0){
          for(let i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("twoId") && allOverlays[i].hasOwnProperty("time")){
              allOverlays[i].setStrokeColor("#33D0FF");
              allOverlays[i].setStrokeOpacity(1);
              allOverlays[i].setStrokeWeight(1);
            }
          }
        }
        for(let t=0;t<times.length;t++){
          for(let i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("twoId") && allOverlays[i].hasOwnProperty("time")){
              allOverlays[i].setStrokeColor("#33D0FF");
              allOverlays[i].setStrokeOpacity(0.7);
              allOverlays[i].setStrokeWeight(1);
              if(allOverlays[i].time == times[t]){
                selectedLines.push(allOverlays[i]);
              }
            }
          }
        }

        for(let k=0;k<selectedLines.length;k++){
          selectedLines[k].setStrokeColor("#E2382A");
          selectedLines[k].setStrokeOpacity(1);
          selectedLines[k].setStrokeWeight(2);
        }

      };
      //地图信息保存
      window.mapSaveLocalStorage = function () {
          localStorage.removeItem("mapOverlays");
          var allOverlays = map.getOverlays();
          //保存所有点和线
          var mapOverlaysMarker = [];
          var mapOverlaysLine = [];
          for(var j=0;j<allOverlays.length;j++) {
              if (allOverlays[j].hasOwnProperty("id")&&allOverlays[j].hasOwnProperty("addnode")) {
                  var obj;
                  if(allOverlays[j].hasOwnProperty("nogis")){
                      obj = {
                          id: allOverlays[j].id,
                          type: allOverlays[j].type,
                          objectType: allOverlays[j].baseMsg.objectType,
                          page_type: allOverlays[j].baseMsg.page_type,
                          name: allOverlays[j].baseMsg.name,
                          nodeId: allOverlays[j].baseMsg.nodeId,
                          //addnode: allOverlays[j].addnode,
                          gis: allOverlays[j].gis,
                          nogis: true,
                          addnode: true
                      };
                  }else{
                      obj = {
                          id: allOverlays[j].id,
                          type: allOverlays[j].type,
                          objectType: allOverlays[j].baseMsg.objectType,
                          page_type: allOverlays[j].baseMsg.page_type,
                          name: allOverlays[j].baseMsg.name,
                          nodeId: allOverlays[j].baseMsg.nodeId,
                          //addnode: allOverlays[j].addnode,
                          gis: allOverlays[j].gis,
                          addnode: true
                      };
                  }

                  mapOverlaysMarker.push(obj);
              }
              if (allOverlays[j].hasOwnProperty("polylineid")) {
                  var obj = {
                      relationId:allOverlays[j].relationId,
                      relationParentType:allOverlays[j].relationParentType,
                      id: allOverlays[j].polylineid,
                      relationTypeName: allOverlays[j].relationName,
                      time: allOverlays[j].time,
                      target: allOverlays[j].target,
                      source: allOverlays[j].source,
                      tag:allOverlays[j].tag
                  };
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

      /**
       * 设置地图基本属性
       * @param drag     是否允许拖拽
       * @param zoom     是否允许缩放
       * @param dblClick 是否允许双击
       */
      window.setmapProperty = function (drag, zoom, dblClick){
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
      };

      /**
       * 左侧搜索框点击一列，地图中对应点 变化
       * @param datasetid 点击的数据id
       */
      window.mapSearchResult = function (datasetid) {
        if(!mapSmallSign&&!mapHeatSign){
          //所有点都还原
          let allOverlays = map.getOverlays();
          for(let i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("addnode")){
              if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                if(allOverlays[i].id === datasetid ){//选中
                  mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                  allOverlays[i].setTop(true);//点击点置顶
                  allOverlays[i].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                }else{
                  mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                  allOverlays[i].setTop(false);//不能置顶
                  allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                }
              }
            }
          }
        }
      };


      
      //清除跨省人员流动效果
      function removePeopleMove(){
          var allOverlays = map.getOverlays();
          for(var k=0;k<allOverlays.length;k++) {
              if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type === "peopleMoveLine") {
                  map.removeOverlay(allOverlays[k]);
              }
          }
      }

      /**
       * 跨省人员流动效果
       * @param {*} returnData 人员流动数据
       */
      function peopleMove(returnData){
          //把其他所有点线 隐藏 有两点，根据产生弧线方法得到paths 加点的graphic，然后移动graphic
          //添加动画的线条
          for(var i=0;i<returnData.length;i++){
              var symbolcolor;
              if(returnData[i].populationSize<2222){
                  symbolcolor = "#00A9EC";
              }else if(returnData[i].populationSize>=2222&&returnData[i].populationSize<5555){
                  symbolcolor = "#E9F01D";
              }else if(returnData[i].populationSize>=5555){
                  symbolcolor = "#EB3F2F";
              }
              var pMovePoints = peopleMoveGetCurveByTwoPoints(returnData[i].source,returnData[i].target);

              var newPoints = [];
              for(var k=1;k<pMovePoints.length;k++){
                  var pointNEW = new BMap.Point(pMovePoints[k-1].lon, pMovePoints[k-1].lat);
                  newPoints.push(pointNEW);
              }

              var polyline = new BMap.Polyline(newPoints, {strokeColor:symbolcolor, strokeWeight:1, strokeOpacity:0.6,strokeStyle:"dashed"});
              polyline.type="peopleMoveLine";
              map.addOverlay(polyline);
          }

          peopleMoveSetTime(returnData);

      }
      //人员轨迹
      function peopleMoveSetTime(returnData){
          for(var i=0;i<returnData.length;i++){
              runPeopleMove(returnData[i].source,returnData[i].target,returnData[i].populationSize);
          }
      }

      /**
       * 人员流动 效果开始
       * @param {*} point1         起点
       * @param {*} point2         终点
       * @param {*} populationSize 流动的数量
       */
      function runPeopleMove(point1,point2,populationSize){
          let pMovePoints = peopleMoveGetCurveByTwoPoints(point1,point2);
          let numPMP = 0;
          let numPMPSize = [10,9,8,7,6,5,4,3,2,1]
          let runPMP = setInterval(function () {
              if(numPMP<9){
                  peopleMoveCurveAnimation(pMovePoints,numPMPSize[numPMP],populationSize);
                  numPMP++;
              }else{
                  clearInterval(runPMP);
              }
          },5);
      }

      /**
       * 人员流动 动画
       * @param {*} points          轨迹点数据
       * @param {*} size            动画点的大小
       * @param {*} populationSize  流动的数量
       */
      function peopleMoveCurveAnimation(points,size,populationSize) {
          var pt = new BMap.Point(points[0].lon, points[0].lat);

          var pmMarker;
          if(populationSize<2222){

              pmMarker = new BMap.Marker(pt);
              pmMarker.setIcon(new BMap.Icon(gisPeopleMoveImages[1],new BMap.Size(size,size),{anchor : new BMap.Size(0, 0)}));

          }
          else if(populationSize>=2222&&populationSize<5555){

              pmMarker = new BMap.Marker(pt);
              pmMarker.setIcon(new BMap.Icon(gisPeopleMoveImages[3],new BMap.Size(size,size),{anchor : new BMap.Size(0, 0)}));

          }else if(populationSize>=5555){
              pmMarker = new BMap.Marker(pt);
              pmMarker.setIcon(new BMap.Icon(gisPeopleMoveImages[5],new BMap.Size(size,size),{anchor : new BMap.Size(0, 0)}));
          }


          map.addOverlay(pmMarker);

          var cAsize = 0;//记录走过的位置
          var cA = setInterval(function () {
              if(cAsize<points.length){
                  var geometry = new BMap.Point(points[cAsize].lon, points[cAsize].lat);
                  pmMarker.setPosition(geometry);
                  cAsize++;
              }else{
                  clearInterval(cA);
                  //图标也要去掉了
                  var pmIcon;
                  if(populationSize<2222){
                      pmIcon = new BMap.Icon(gisPeopleMoveImages[0],new BMap.Size(21-size*2,21-size*2),{anchor : new BMap.Size(-size+10, -size+10)})
                  }else if(populationSize>=2222&&populationSize<5555){
                      pmIcon = new BMap.Icon(gisPeopleMoveImages[2],new BMap.Size(21-size*2,21-size*2),{anchor : new BMap.Size(-size+10, -size+10)})
                  }else if(populationSize>=5555){
                      pmIcon = new BMap.Icon(gisPeopleMoveImages[4],new BMap.Size(21-size*2,21-size*2),{anchor : new BMap.Size(-size+10, -size+10)});
                  }
                  pmMarker.setIcon(pmIcon);
                  setTimeout(function(){
                      map.removeOverlay(pmMarker);
                  },500);

              }
          },5);

      }

      /**
       * 人员流动 根据两点，计算弧线路径
       * @param {*} obj1 起点
       * @param {*} obj2 终点
       * @param {*} sign 标志 暂留
       */
      function peopleMoveGetCurveByTwoPoints(obj1, obj2,sign) {
          var lat1 = parseFloat(obj1.gis.lat);
          var lat2 = parseFloat(obj2.gis.lat);
          var lng1 = parseFloat(obj1.gis.lon);
          var lng2 = parseFloat(obj2.gis.lon);


          var B1 = function(x) {
              return 1 - 2 * x + x * x;
          };
          var B2 = function(x) {
              return 2 * x - 2 * x * x;
          };
          var B3 = function(x) {
              return x * x;
          };

          var curveCoordinates = [];

          //计算count个数 根据经纬度
          var lineX = (lat1-lat2 >0?lat1-lat2:lat2-lat1);
          var lineY = (lng1-lng2 >0?lng1-lng2:lng2-lng1);
          var sqrtXY = Math.sqrt(lineX*lineX + lineY*lineY);
          var count=parseInt(sqrtXY*10); // 曲线是由一些小的线段组成的，这个表示这个曲线所有到的折线的个数

          var isFuture=false;
          var t, h, h2, lat3, lng3, j, t2;
          var LnArray = [];
          var i = 0;
          var inc = 0;

          if (typeof(obj2) == "undefined") {
              if (typeof(curveCoordinates) != "undefined") {
                  curveCoordinates = [];
              }
              return;
          }

          // 计算曲线角度的方法
          if (lng2 > lng1) {
              if (parseFloat(lng2-lng1) > 180) {
                  if (lng1 < 0) {
                      lng1 = parseFloat(180 + 180 + lng1);
                  }
              }
          }

          if (lng1 > lng2) {
              if (parseFloat(lng1-lng2) > 180) {
                  if (lng2 < 0) {
                      lng2 = parseFloat(180 + 180 + lng2);
                  }
              }
          }
          j = 0;
          t2 = 0;
          if (lat2 == lat1) {
              t = 0;
              h = lng1 - lng2;
          } else if (lng2 == lng1) {
              t = Math.PI / 2;
              h = lat1 - lat2;
          } else {
              t = Math.atan((lat2 - lat1) / (lng2 - lng1));
              h = (lat2 - lat1) / Math.sin(t);
          }
          if (t2 == 0) {
              t2 = (t + (Math.PI / 5));
          }
          h2 = h / 2;
          lng3 = h2 * Math.cos(t2) + lng1;
          lat3 = h2 * Math.sin(t2) + lat1;

          for (i = 0; i < count + 1; i++) {
              /*curveCoordinates.push(new BMap.Point(
                (lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
                (lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc))
                ));*/
              curveCoordinates.push({
                      "lon":(lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
                      "lat":(lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc))
                  }
              );
              inc = inc + (1 / count);
          }

          return curveCoordinates;
      }

      //显示重点区域
      function addKeyArea(){
            const url = EPMUI.context.url + '/object/getKeyAreaGisList';
            let data = null;
            let completed = function (){ return false; };
            let succeed = function(returnData) {
                //后端返回值： type 和 gisPointsStr
                /*var returnData = [{
                    "type":"polygon",
                    "gisPointsStr":[[102.229389, 45.783175],[102.229389, 39.317373],[126.808178, 39.317373],[126.808178, 45.783175]],
                    "id":"area1"
                },{
                    "type":"circle",
                    "centerPoint":[120, 25],
                    "radius":500000,
                    "id":"area2"
                }];*/

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
                    if(returnData[i].shape == "polygon"){//画正方形
                        var polygonPoints = [];
                        var gisStr = JSON.parse(returnData[i].gisPointsStr);
                        var setlonUse = [];
                        var setlatUse = [];
                        for(var j=0;j<gisStr.length;j++){
                            polygonPoints.push(new BMap.Point(gisStr[j][0],gisStr[j][1]));
                            setlonUse.push(gisStr[j][0]);
                            setlatUse.push(gisStr[j][1]);
                        }
                        var polygon = new BMap.Polygon(polygonPoints, styleOptions);  //创建多边形
                        polygon.addattr = {
                            "id":returnData[i].id,
                            "type":"polygon",
                            "sign":"keyarea",
                            "peopleMove":false,
                            "analyse":false
                        };
                        polygon.id = returnData[i].id;
                        polygon.points = gisStr;
                        polygon.lonUse = setlonUse;
                        polygon.latUse = setlatUse;
                        map.addOverlay(polygon);           //增加多边形
                        keyAreaEvent(polygon)
                    }
                    if(returnData[i].shape == "circle"){//画圆
                        var gisCenterP = JSON.parse(returnData[i].centerPoint);
                        var circlePoint = new BMap.Point(gisCenterP[0], gisCenterP[1]);
                        var circle = new BMap.Circle(circlePoint,returnData[i].radius,styleOptions); //创建圆
                        circle.addattr = {
                            "id":returnData[i].id,
                            "type":"circle",
                            "sign":"keyarea",
                            "peopleMove":false,
                            "analyse":false
                        };
                        circle.id = returnData[i].idl;

                        map.addOverlay(circle); //增加圆
                        keyAreaEvent(circle);
                    }


                }
            };
            let judgment = function() { return false; };
            mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);


      }

      /**
       * 
       * @param {*} keyArea 重点区域覆盖物
       */
      function keyAreaEvent(keyArea){
          keyArea.addEventListener("dblclick",function(a){
              mapCommon.mapKeyArea = {};
              mapCommon.mapKeyArea = {
                  thisClick:a,
                  areaLays:keyArea
              };
              var conf = {
                  thisClick:a,
                  areaLays:keyArea,
              };
              mapCommonPart.menu(conf,"keyAreamenu");
          });
      }

      /**
       * 显示区域统计
       * @param {*} data 统计的数据
       */
      function areaStatistics(data){
        let areadiv = function(areadata,size){
          let margin = {
            top: 20,
            right: 5,
            bottom: 30,
            left:1
          };

          let svgWidth = 100;
          let svgHeight = 100;

          //创建各个面的颜色数组
          let mainColorList = ['#f6e242', '#ebec5b', '#d2ef5f', '#b1d894', '#97d5ad', '#82d1c0', '#70cfd2', '#63c8ce', '#50bab8', '#38a99d'];
          let topColorList = ['#e9d748', '#d1d252', '#c0d75f', '#a2d37d', '#83d09e', '#68ccb6', '#5bc8cb', '#59c0c6', '#3aadab', '#2da094'];
          let rightColorList = ['#dfce51', '#d9db59', '#b9d54a', '#9ece7c', '#8ac69f', '#70c3b1', '#65c5c8', '#57bac0', '#42aba9', '#2c9b8f'];

          let svg = d3.select("#aSGraphicarea"+ size + "a");
          //svg的大小
          d3.select("#aSGraphicarea"+ size + "a")
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr("data",areadata)
            .attr("areadata",JSON.stringify(areadata))
            .on("dblclick",function(){
                map.disableDoubleClickZoom(); //禁用双击放大
                var areaAsnum = $(this).attr("areadata");
                var asid = "aSGraphicarea"+ size + "a";
                showASSvg(asid,JSON.parse(areaAsnum));
            });

          let yLinearScale;
          function addXAxis() {
            let transform = d3.geo.transform({
              point: function(x, y) {
                this.stream.point(x, y)
              }
            });
            //定义几何路径
            let path = d3.geo.path()
              .projection(transform);

            let xLinearScale = d3.scale.linear()
              .domain(data.map(function(d) {
                return d.name;
              }))
              .range([0, svgWidth - margin.right - margin.left], 0.2);
            let xAxis = d3.svg.axis().scale(xLinearScale)
              .ticks(data.length).orient("bottom");
            //绘制X轴
            let xAxisG = svg.append("g") // x轴的总 g
              .call(xAxis)
              .attr("transform", "translate(" + (margin.left-10) + "," + (svgHeight - margin.bottom) + ")");

            //删除原X轴
            xAxisG.select("path").remove();
            xAxisG.selectAll('line').remove();
            //绘制新的立体X轴   x轴下面的黑条~~
            xAxisG.append("path")
              .datum({
                type: "Polygon",
                coordinates: [
                  [
                    [20, 0],
                    [0, 15],
                    [svgWidth - margin.right - margin.left, 15],
                    [svgWidth + 20 - margin.right - margin.left, 0],
                    [20, 0]
                  ]
                ]
              })
              .attr("d", path)
              .attr('fill', 'rgba(30,30,30,0.5)');
            xAxisG.selectAll('text')
              .attr('font-size', '18px')
              .attr('fill', '#646464')
              .attr('transform', 'translate(0,20)');

            dataProcessing(xLinearScale); //核心算法
          }

          //创建y轴的比例尺渲染y轴
          function addYScale() {
            yLinearScale = d3.scale.linear()
              .domain([0, d3.max(data, function(d, i) {
                return d.value * 1;
              }) * 1.2])
              .range([svgHeight - margin.top - margin.bottom, 0]);

            //定义Y轴比例尺以及刻度
            let yAxis = d3.svg.axis()
              .scale(yLinearScale)
              .ticks(7)
              .orient("left");

            //绘制Y轴
            let yAxisG = svg.append("g")
              .call(yAxis)
              .attr('transform', 'translate(' + (margin.left + 10) + "," + margin.top + ")");
            yAxisG.selectAll('text')
              .attr('font-size', '18px')
              .attr('fill', '#636363');
            //删除原Y轴路径和tick
            yAxisG.select("path").remove();
            yAxisG.selectAll('line').remove();
          }
          // 作用是修改了 初始data的值，d=data，仅仅是指向变了，并没有新复制一份数据！！！！！！
          function dataProcessing(xLinearScale) {
            let angle = Math.PI / 2.3;
            for(let i = 0; i < data.length; i++) {
              let d = data[i];
              let depth = 10;
              d.ow = 15;         //xLinearScale.bandwidth() * 0.7;
              d.ox = 20*i+1;     //xLinearScale(d.name);
              d.oh = 5;
              d.p1 = {
                x: Math.cos(angle) * d.ow,
                y: -Math.sin(angle) - depth
              };
              d.p2 = {
                x: d.p1.x + d.ow,
                y: d.p1.y
              };
              d.p3 = {
                x: d.p2.x,
                y: d.p2.y + d.oh
              };
            }
          }
          //添加数据path
          function addColumn() {

            var g = svg.selectAll('.g')
              .data(data)
              .enter()
              .append('g')
              //.on("mouseover", clumnMouseover)
              //.on("mouseout", clumnMouseout)
              .attr('transform', function(d) {

                return "translate(" + (d.ox+margin.left + 5) + "," + (svgHeight - margin.bottom + 5) + ")"
              });
            g.transition()
              .duration(1500)
              .attr("transform", function(d) {
                return "translate(" + (d.ox+margin.left + 5) + ", " + (yLinearScale(d.value) + margin.bottom - 5) + ")"
              });

            g.append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr("class", "transparentPath")
              .attr('width', function(d, i) {
                return d.ow;
              })
              .attr('height', function(d) {
                return d.oh;
              })
              .style('fill', function(d, i) {
                return mainColorList[i]
              })
              .transition()
              .duration(1500)
              .attr("height", function(d, i) {
                return svgHeight - margin.bottom - margin.top - yLinearScale(d.value);
              });

            g.append('path')
              .attr("class", "transparentPath")
              .attr('d', function(d) {
                return "M0,0 L" + d.p1.x + "," + d.p1.y + " L" + d.p2.x + "," + d.p2.y + " L" + d.ow + ",0 L0,0";
              })
              .style('fill', function(d, i) {
                return topColorList[i]
              });

            g.append('path')
              .attr("class", "transparentPath")
              .attr('d', function(d) {
                return "M" + d.ow + ",0 L" + d.p2.x + "," + d.p2.y + " L" + d.p3.x + "," + d.p3.y + " L" + d.ow + "," + d.oh + " L" + d.ow + ",0"
              })
              .style('fill', function(d, i) {
                return rightColorList[i]
              })
              .transition()
              .duration(1500)
              .attr("d", function(d, i) {
                return "M" + d.ow + ",0 L" + d.p2.x + "," + d.p2.y + " L" + d.p3.x + "," + (d.p3.y + svgHeight - margin.top - margin.bottom - yLinearScale(d.value)) + " L" + d.ow + "," + (svgHeight - margin.top - margin.bottom - yLinearScale(d.value)) + " L" + d.ow + ",0"
              });
          }

          addXAxis();
          addYScale();
          addColumn();
        };

        for(let n=0;n<data.length;n++){
          let thisClickPoint = {
            lon:mapCommon.mapKeyArea.thisClick.point.lng,
            lat:mapCommon.mapKeyArea.thisClick.point.lat
          };

          let pointNEW = new BMap.Point(thisClickPoint.lon,thisClickPoint.lat);
          let marker = new BMap.Marker(pointNEW);
          mapSetIcon(marker, markerPathPeople, 0, 0, 'rgba(0,0,0,0)', 1, 1);
          map.addOverlay(marker);
          let areaContent = "<svg class='aSGraphicarea' id='aSGraphicarea"+ mapCommon.mapKeyArea.areaLays.addattr.id +n+"a' style='width: 100px;height: 100px;background-color:rgba(0,0,0,0) '></svg>";

          let label = new BMap.Label(areaContent,{offset:new BMap.Size(20,-10)});
          label.setStyle({backgroundColor: "rgba(0,0,0,0)",border:"#5E7489"});//#5E7489背景色
          marker.setLabel(label);
          marker.enableDragging(true);           // 不可拖拽
          marker.type = "areaMarker";
          marker.asid = "aSGraphicarea"+ mapCommon.mapKeyArea.areaLays.addattr.id+ n +"a";
          marker.areaid = mapCommon.mapKeyArea.areaLays.addattr.id;
        }
        setTimeout(function(){
          for(let n=0;n<data.length;n++){
            let centerN = mapCommon.mapKeyArea.areaLays.addattr.id + n;
            areadiv(data,centerN);
          }
        },100);
      }

      /**
       * 区域统计 弹框放大显示详情
       * @param {*} asid 弹框id
       * @param {*} data 显示数据
       */
      function showASSvg(asid, data){
        d3.selectAll("#asDiv").remove();
        var allOverlays = map.getOverlays();

        var showASMarker;
        for(var k=0;k<allOverlays.length;k++) {
            if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type == "areaMarker") {
                if(allOverlays[k].asid == asid){
                    showASMarker = allOverlays[k];
                }
            }
        }

        var getLeft = showASMarker.V.offsetLeft;
        var getTop = showASMarker.V.offsetTop;
        var div = document.createElement("div");
        div.setAttribute("id", "asDiv");
        div.style.position = "absolute";
        div.style.left = getLeft+60 + "px";
        div.style.top = getTop+80 + "px";
        div.style.fontSize = "12px";
        map.getPanes().labelPane.appendChild(div);
        var inDivHtml = "<div class='asDiv_top'>"+
            "<div class='asDiv_name'>"+ "区域统计" +"</div>"+
            //"<div class='asDiv_classify'>标志"+"</div>"+
            "<div class='asDiv_func'>"+
            "<div class='asDiv_close'>×</div>"+
            "</div>"+
            "</div>"+
            "<div class='asDiv_svg'></div>"+
            "<div class='asDiv_foot'><div class='asDiv_footTip'></div></div>";
        $(div).append(inDivHtml);

        //svg的大小
        var width = 478;
        var height = 230;

        var svg = d3.select(".asDiv_svg")
            .append("svg")
            .attr("width",width)
            .attr("height",height)
            .attr("class","asSvg")
            .attr("id","asSvg");

        let margin = {
          top: 20,
          right: 50,
          bottom: 50,
          left:1
        };

        let svgWidth = 450;
        let svgHeight = 230;

        //创建各个面的颜色数组
        let mainColorList = ['#f6e242', '#ebec5b', '#d2ef5f', '#b1d894', '#97d5ad', '#82d1c0', '#70cfd2', '#63c8ce', '#50bab8', '#38a99d'];
        let topColorList = ['#e9d748', '#d1d252', '#c0d75f', '#a2d37d', '#83d09e', '#68ccb6', '#5bc8cb', '#59c0c6', '#3aadab', '#2da094'];
        let rightColorList = ['#dfce51', '#d9db59', '#b9d54a', '#9ece7c', '#8ac69f', '#70c3b1', '#65c5c8', '#57bac0', '#42aba9', '#2c9b8f'];

        let yLinearScale;
        function addXAxis() {
          let transform = d3.geo.transform({
            point: function(x, y) {
              this.stream.point(x, y)
            }
          });
          //定义几何路径
          let path = d3.geo.path()
            .projection(transform);

          let xLinearScale = d3.scale.linear()
            .domain(data.map(function(d) {
              return d.name;
            }))
            .range([0, svgWidth - margin.right - margin.left], 0.2);
          let xAxis = d3.svg.axis().scale(xLinearScale)
            .ticks(data.length).orient("bottom");
          //绘制X轴
          let xAxisG = svg.append("g") // x轴的总 g
            .call(xAxis)
            .attr("transform", "translate(" + (margin.left) + "," + (svgHeight - margin.bottom) + ")");

          //删除原X轴
          xAxisG.select("path").remove();
          xAxisG.selectAll('line').remove();
          //绘制新的立体X轴   x轴下面的黑条~~
          xAxisG.append("path")
            .datum({
              type: "Polygon",
              coordinates: [
                [
                  [20, 0],
                  [0, 15],
                  [svgWidth - margin.right - margin.left, 15],
                  [svgWidth + 20 - margin.right - margin.left, 0],
                  [20, 0]
                ]
              ]
            })
            .attr("d", path)
            .attr('fill', 'rgba(30,30,30,0.5)');
          xAxisG.selectAll('text')
            .attr('font-size', '18px')
            .attr('fill', '#646464')
            .attr('transform', 'translate(0,20)');

          dataProcessing(xLinearScale); //核心算法
        }

        //创建y轴的比例尺渲染y轴
        function addYScale() {
          yLinearScale = d3.scale.linear()
            .domain([0, d3.max(data, function(d, i) {
              return d.value * 1;
            }) * 1.2])
            .range([svgHeight - margin.top - margin.bottom, 0]);

          //定义Y轴比例尺以及刻度
          let yAxis = d3.svg.axis()
            .scale(yLinearScale)
            .ticks(7)
            .orient("left");

          //绘制Y轴
          let yAxisG = svg.append("g")
            .call(yAxis)
            .attr('transform', 'translate(' + (margin.left + 10) + "," + (margin.top) + ")");
          yAxisG.selectAll('text')
            .attr('font-size', '18px')
            .attr('fill', '#636363');
          //删除原Y轴路径和tick
          //yAxisG.select("path").remove();
          //yAxisG.selectAll('line').remove();
        }
          // 作用是修改了 初始data的值，d=data，仅仅是指向变了，并没有新复制一份数据！！！！！！
        function dataProcessing(xLinearScale) {
          var angle = Math.PI / 2.3;
          for(var i = 0; i < data.length; i++) {
            var d = data[i];
            var depth = 10;
            d.ow = 40;//xLinearScale.bandwidth() * 0.7;
            d.ox = 60*i+40//xLinearScale(d.name);
            d.oh = 1;
            d.p1 = {
              x: Math.cos(angle) * d.ow,
              y: -Math.sin(angle) - depth
            };
            d.p2 = {
              x: d.p1.x + d.ow,
              y: d.p1.y
            };
            d.p3 = {
              x: d.p2.x,
              y: d.p2.y + d.oh
            };
          }
        }

        function addColumn() {

          var g = svg.selectAll('.g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function(d) {
              return "translate(" + (d.ox+margin.left + 20) + "," + (svgHeight - margin.bottom + 15) + ")"
            });
          g.transition()
            .duration(1500)
            .attr("transform", function(d) {
              return "translate(" + (d.ox+margin.left + 20) + ", " + (yLinearScale(d.value) + margin.bottom - 15) + ")"
            });

          g.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr("class", "transparentPath")
            .attr('width', function(d, i) {
              return d.ow;
            })
            .attr('height', function(d) {
              return d.oh;
            })
            .style('fill', function(d, i) {
              return mainColorList[i]
            })
            .transition()
            .duration(1500)
            .attr("height", function(d, i) {
              return svgHeight - margin.bottom - margin.top - yLinearScale(d.value);
            });

          g.append('path')
            .attr("class", "transparentPath")
            .attr('d', function(d) {
              return "M0,0 L" + d.p1.x + "," + d.p1.y + " L" + d.p2.x + "," + d.p2.y + " L" + d.ow + ",0 L0,0";
            })
            .style('fill', function(d, i) {
              return topColorList[i]
            });

          g.append('path')
            .attr("class", "transparentPath")
            .attr('d', function(d) {
              return "M" + d.ow + ",0 L" + d.p2.x + "," + d.p2.y + " L" + d.p3.x + "," + d.p3.y + " L" + d.ow + "," + d.oh + " L" + d.ow + ",0"
            })
            .style('fill', function(d, i) {
              return rightColorList[i]
            })
            .transition()
            .duration(1500)
            .attr("d", function(d, i) {
              return "M" + d.ow + ",0 L" + d.p2.x + "," + d.p2.y + " L" + d.p3.x + "," + (d.p3.y + svgHeight - margin.top - margin.bottom - yLinearScale(d.value)) + " L" + d.ow + "," + (svgHeight - margin.top - margin.bottom - yLinearScale(d.value)) + " L" + d.ow + ",0"
            });
        }

        addXAxis();
        addYScale();
        addColumn();

        $(".asDiv_close").bind("click",function () {
            $("#asDiv").remove();
        })
      }

      /**
       * 改变点的显示样式
       * @param {*} selectOverlays 覆盖物数组
       */
      function changeMarkerType(selectOverlays){
        let allOverlays = map.getOverlays();
        allOverlays.forEach( allo => {
          if(allo.hasOwnProperty("addnode")&& !overlays.hasOwnProperty("nogis")){
            mapSetIcon(allo, markerPath, 1, 0, '#33D0FF', 10, 20);
            allo.setTop(false);//不能置顶
            allo.getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
          }
        });
        if(selectOverlays){
          selectOverlays.forEach( selectOverlay => {
            allOverlays.forEach( allo => {
              if(allo.hasOwnProperty("addnode") && allo.id === selectOverlay.id){
                if(!allo.hasOwnProperty("nogis") && !allo.nogis){
                  mapSetIcon(allo, markerPathPeople, 0.6, 0, 'red', 20, 42);
                  allo.setTop(true);//点击点置顶
                  allo.getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                }
              }
            });
          } );
        }
      }
      
      /**
       * 添加轨迹
       * @param {*} addData      轨迹各节点数据
       * @param {*} basePoint    起点
       * @param {*} basePointId  起点id
       * @param {*} linecolor    轨迹线条颜色
       */
      function addPath(addData, basePoint, basePointId,linecolor){
        let lc = linecolor ? linecolor : "#33d0ff";
        timelineIntervalSign = true;

        let points = [];
        let mapStepOverlays = [];
        let firstPoint = basePoint;//这个用来存放两点中的起点

        let allPathLUSHU = [];//给路书的所有path

        let lushulen = lushuNum.length+1;
        let lushuName = "l"+lushulen;
        lushuNum.push({ name: lushuName, size: 0, lushu:[] });

        for (let k = 0; k < addData.length; k++) {

          let point = new BMap.Point(addData[k].gis[0], addData[k].gis[1]);
          points.push(firstPoint);
          points.push(point);
          let twoId = {
            one: basePointId,
            two: "first",
            address: addData[k].address,
            time: addData[k].time
          };
          let curve = new BMapLib.CurveLine(twoId, "first", points, {
            strokeColor: lc,//D75C22
            strokeWeight: 1,
            strokeOpacity: 0.9
          }); //创建弧线对象
          map.addOverlay(curve); //添加到地图中
          curve.enableEditing(); //开启编辑功能
          points = [];
          firstPoint = point;

          let retpath = curve.getPath();
          for(let p=0;p<retpath.length;p++){
            allPathLUSHU.push(retpath[p]);
          }
          let iconImg;
          if(addData[k].hasOwnProperty("tripMode")){
            if(addData[k].tripMode === "car"){
              iconImg = gisMoveImages[1];
            }
            if(addData[k].tripMode === "airplane"){
              iconImg = gisMoveImages[0];
            }
            if(addData[k].tripMode === "train"){
              iconImg = gisMoveImages[2];
            }else{
              iconImg = gisMoveImages[1];
            }
          }else{
            iconImg = gisMoveImages[1];
          }
          lushuStart(basePointId,retpath,iconImg,k,lushuName);
        }
        let step = {one: basePointId, two: "first"};
        mapStepOverlays.push(step);
        mapStep.push(mapStepOverlays);
        mapType.push("addCurve");
        mapStepNum++;
      }
      
      //对应地图TopoMenu的方法：
      window.mapOwnFun = {
          /**
           * mapAddTopoMenu           : 添加菜单div到地图
           * mapShowBayonetMenu       : 菜单-实时监控按钮
           * mapRemoveTopoMenu        : 菜单-删除按钮
           * mapMoveTopoMenu          : 菜单-移动按钮
           * mapSaveTopoMenu          : 菜单-存点按钮
           * mapCheckTopoMenu         : 菜单-查看按钮
           * mapOffTopoMenu           : 菜单-取消按钮
           * mapExtendTopoMenu        : 菜单-扩展按钮
           * mapMoreExtendTopoMenu    : 菜单-更多按钮
           * mapPathTopoMenu          : 菜单-轨迹按钮
           * mapRemovePathTopoMenu    : 菜单-移出轨迹按钮
           * mapAddAreaMenu           : 添加选区菜单
           * mapClickAreaMenu         : 点击选区菜单
           * mapClickAreaSearchMenu   : 选区菜单-检索功能
           * mapClickKeyAreaMenu      : 重点区域菜单
           * mapExtendAreaMenu        : 选区菜单-扩展
           * mapRemoveAreaMenu        : 选区菜单-取消
           * mapAddKeyAreaMenu        : 添加重点区域菜单
           * mapSaveTopoNodes         : 保存给工作台使用的点线
           * getFilterIdType          : 或得所有点的id type
           */
          mapAddTopoMenu:function(div){
              map.getPanes().labelPane.appendChild(div);
          },
          mapShowBayonetMenu:function(warningData){
            if(warningData){
              warningData.forEach(wd => {
                addMapOverlays(wd,"bayonetMV");
              });
            }else{
              let markerData = mapCommon.mapWorkMarker[0];
              addMapOverlays(markerData,"bayonetMV");
            }
            mapOwnFun.mapOffTopoMenu();
          },
          mapRemoveTopoMenu:function(){
              d3.select("#newDiv").remove();
              mapdisk = false;
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
              var markerId = mapCommon.mapWorkMarker[0].id;

              var ids = [];
              if(shiftSign){
                  for (var t=0;t<shiftGraphic.length;t++){
                      ids.push(shiftGraphic[t].baseMsg.id);
                  }
                  deleteMarker(ids);
              }else{
                  ids.push(markerId);
                  deleteMarker(ids);
              }
          },
          mapMoveTopoMenu:function(thisMarker){
              d3.select("#newDiv").remove();
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
              thisMarker.enableDragging(true);
              mapSetIcon(thisMarker, markerPathPeople, 0.6, 0, 'yellow', 20, 42);
          },
          mapSaveTopoMenu:function(thisMarker){
            //发送请求获得gis字段名称
            $.get(EPMUI.context.url + '/object/gis/property', {objectType: thisMarker.type}, function (reData) {
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
                      thisMarker.point.lng,
                      thisMarker.point.lat
                    ]
                  }
                ]
              };

              $.post(EPMUI.context.url + '/object/detailInformation', {modifyJson: JSON.stringify(editObject), id: thisMarker.id, type: thisMarker.type}, function (data) {
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

            d3.select("#newDiv").remove();
            map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
            map.enableDoubleClickZoom();//启用鼠标双击放大

          },
          mapCheckTopoMenu:function(){
              d3.select("#newDiv").remove();
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
              mapSaveLocalStorage();
          },
          mapOffTopoMenu:function(){
              d3.select("#newDiv").remove();
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
          },
          mapExtendTopoMenu:function(thisMarker, extendSign, extendUrl){
              var confId = [];
              var confNodeType = [];
              var confNodeId = [];
              confId.push(mapCommon.mapWorkMarker[0].id);
              confNodeType.push(mapCommon.mapWorkMarker[0].baseMsg.type);
              confNodeId.push(mapCommon.mapWorkMarker[0].baseMsg.nodeId);
              var conf = {
                  Id:confId,
                  nodeId:confNodeId,
                  nodeType:confNodeType
              };

              var Id = conf.Id;
              var nodeType = conf.nodeType;
              var nodeId = conf.nodeId;
              d3.selectAll("#newDiv").remove();//先把圆环删除咯
              setmapProperty("null","zoom-true","dbl-true");
              if(shiftSign){
                  Id = [];
                  nodeType = [];
                  nodeId = [];
                  var mapMainRadrawMarkers = [];
                  for (var t=0;t<shiftGraphic.length;t++){
                      //给工作台的标志点
                      var baseMsg = shiftGraphic[t].baseMsg;
                      var newMarker = {
                          addnode: true,
                          gis: shiftGraphic[t].baseMsg.gis,
                          id: shiftGraphic[t].baseMsg.id,
                          name: shiftGraphic[t].baseMsg.name,
                          nodeId: shiftGraphic[t].baseMsg.nodeId,
                          objectType: shiftGraphic[t].baseMsg.objectType,
                          page_type: shiftGraphic[t].baseMsg.page_type,
                          type: shiftGraphic[t].baseMsg.type,
                          baseMsg: baseMsg
                      };
                      Id.push(shiftGraphic[t].baseMsg.id);
                      nodeType.push(shiftGraphic[t].baseMsg.type);
                      nodeId.push(shiftGraphic[t].baseMsg.nodeId);

                      mapMainRadrawMarkers.push(newMarker);
                  }
                  mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "multi", Id, nodeType, nodeId, extendSign, extendUrl);
                  Id = [];
                  nodeType = [];
                  nodeId = [];
                  setTimeout(function () {
                      shiftGraphic = [];
                  },1000);
              }else{
                  var mapMainRadrawMarkers = [];
                  mapMainRadrawMarkers.push(thisMarker);
                  mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", Id, nodeType, nodeId, extendSign, extendUrl);
                  //mapRadrawAxis(true, Id, nodeId, "All");//时间轴
              }

          },
          mapMoreExtendTopoMenu:function(mapMainRadrawMarkers, Id, nodeType, nodeId, systemId){
              d3.selectAll("#newDiv").remove();//先把圆环删除咯
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
              mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", Id, nodeType, nodeId, systemId, '/leaves/');
          },
          mapPathTopoMenu:function(mapPathPoint){
              d3.selectAll("#newDiv").remove();//先把圆环删除咯
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
              mapPathBasePoint = mapPathPoint;
              mapPathSgin = true;
          },
          mapRemovePathTopoMenu:function(Id){
              d3.selectAll("#newDiv").remove();//先把圆环删除咯
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大

              $(".map_path").hide();
              mapPathSgin = false;
              var allOverlays = map.getOverlays();
              for(var j=0;j<allOverlays.length;j++){
                  if(allOverlays[j].hasOwnProperty("twoId")){
                      if(allOverlays[j].twoId.one==Id&&allOverlays[j].twoId.two=="first"){
                          map.removeOverlay(allOverlays[j]);
                      }
                  }
                  if(allOverlays[j].hasOwnProperty("sign")&&allOverlays[j].sign == "lushu"){
                      if(allOverlays[j].id==Id){
                          map.removeOverlay(allOverlays[j]);
                      }
                  }
              }
          },
          mapAddAreaMenu:function(a){
              map.disableDoubleClickZoom(true);   //禁用双击放大
              var allOverlays = map.getOverlays();
              for(var i=0;i<allOverlays.length;i++){
                  if(allOverlays[i].hasOwnProperty("dblmarker")){
                      map.removeOverlay(allOverlays[i]);//删除
                  };
              }
              var pointNEW = new BMap.Point(a.point.lng,a.point.lat);
              var marker = new BMap.Marker(pointNEW, {
                  // 指定Marker的icon属性为
                  icon: new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
                      scale: 0.1,//图标缩放大小
                      rotation: 0,//顺时针旋转0度
                      fillColor: '#071A44',
                      fillOpacity: 0.8,
                      anchor:{width:13,height:20},
                      strokeColor: '#071A44',
                      strokeWeight: 0.1//线宽
                  })
              });

              map.addOverlay(marker);
              var content = '<div id="newDiv" class="newDiv"><svg class="complexCustomOverlay" style="width: 500px;height: 500px;cursor:pointer;" > </svg></div>';
              var label = new BMap.Label(content,{offset:new BMap.Size(-250,-250)});
              label.setStyle({backgroundColor: "rgba(0,0,0,0)",border:"#1E262F"});
              marker.setLabel(label);
              marker.disableDragging();           // 不可拖拽
              marker.dblmarker = true;
              marker.setTop(true);
          },
          mapClickAreaMenu:function(e, sign){
              mapSelectArea(e.overlay.multipleEntity, sign);
          },
          mapClickAreaSearchMenu:function(sign){
              let oldPoints = mapCommon.mapWorkArea.areaLays.overlay.points;
              let oldLat = [];
              let oldLon = [];
              function sortNumber(a,b){
                  return a - b
              }
              oldPoints.forEach(op => {
                  oldLat.push(op[1]);
                  oldLon.push(op[0]);
              });
              oldLat = [...new Set(oldLat)].sort(sortNumber);
              oldLon = [...new Set(oldLon)].sort(sortNumber);
              function getLonLat(ol){ //在一个长方形区域内随机生成点
                  let numl = new Number( ol[0] + ((ol[1]-ol[0]) * Math.random()) );
                  return numl.toFixed(6);
              }

              let asMarkers = [
                  {
                      id: "asdqwrewtwqrqw",
                      type: "PERSON",
                      objectType: "entity",
                      page_type:"entity",
                      name: "赵卫国",
                      nodeId: "452879",
                      addnode: true,
                      gis: {
                          lon: getLonLat(oldLon),
                          lat: getLonLat(oldLat)
                      },
                  },
                  {
                      id: "asdqwqwedfdfqrqw",
                      type: "PERSON",
                      objectType: "entity",
                      page_type:"entity",
                      name: "陈生",
                      nodeId: "425279",
                      addnode: true,
                      gis: {
                          lon: getLonLat(oldLon),
                          lat: getLonLat(oldLat)
                      },
                  },
                  {
                      id: "asdqwrewhjrqw",
                      type: "PERSON",
                      objectType: "entity",
                      page_type:"entity",
                      name: "李广",
                      nodeId: "422879",
                      addnode: true,
                      gis: {
                          lon: getLonLat(oldLon),
                          lat: getLonLat(oldLat)
                      },
                  },
                  {
                      id: "asdqwrewtwqeerqw",
                      type: "PERSON",
                      objectType: "entity",
                      page_type:"entity",
                      name: "郑平",
                      nodeId: "454479",
                      addnode: true,
                      gis: {
                          lon: getLonLat(oldLon),
                          lat: getLonLat(oldLat)
                      },
                  }
              ];
              //地图上点还原
              let allOverlays = map.getOverlays();
              for(let i=0;i<allOverlays.length;i++){
                  if(allOverlays[i].hasOwnProperty("addnode")){
                      if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                          mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                          allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                      }
                  }
              }
              //从datas 添加重点人，去重， 状态为选中
              let mapStepOverlays = [];
              for (let i = 0; i < asMarkers.length; i++) {
                  let haveMarker = mapRepeat(asMarkers[i],"marker");
                  if (!haveMarker) {//不重复，在这进行加点操作：
                      let conf = { type: "keyarea"};
                      let marker = addMapOverlays(asMarkers[i], "marker", conf);
                      let step = {data: marker, type: "marker"};
                      mapStepOverlays.push(step);
                  }else{
                      //重复的，改为选中状态
                      let lays = map.getOverlays();
                      for(let t=0;t<lays.length;t++){
                          if(lays[t].hasOwnProperty("addnode")&&lays[t].getIcon().style.fillColor != "yellow"){
                              if(asMarkers[i].id === lays[t].id){
                                  mapSetIcon(lays[t], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                  lays[t].setTop(true);//点击点置顶
                                  if(mapFontStatus){
                                      lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                                  }else{
                                      lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                                  }
                              }
                          }
                      }
                  }
              }

              if(mapStepOverlays){
                  mapStep.push(mapStepOverlays);
                  mapType.push("add");
                  mapStepNum++;
              }

              $(".topology_message_tab_active").removeClass("topology_message_tab_active");
              $("#topo_total_title").addClass("topology_message_tab_active");
              $(".topo_message").hide();
              $("#topology_search_loading").hide();
              $("#topology_message_total").show();
              mapStatistics(asMarkers);

              return '';

              let areaurl;
              let areadata;
              var clickArea = mapCommon.mapWorkArea.areaLays.overlay;
              if(clickArea.type=="circle"){
                  areadata = {
                      "shape": "circle",
                      "radius": clickArea.radius,
                      "lon": clickArea.centerPoint[0],
                      "lat": clickArea.centerPoint[1],
                      "searchType":sign
                  };
                  areaurl = EPMUI.context.url + '/object/areaSearch/saveCircleGis';
              }else if(clickArea.type=="polygon"){
                  areadata = {
                      "shape": "polygon",
                      "lon": clickArea.lonUse,
                      "lat": clickArea.latUse,
                      "searchType":sign
                  };
                  areaurl = EPMUI.context.url + '/object/areaSearch/savePolygonGis';
              }

              let completed = function (){ return false; };
              let succeed = function(data) {
                  if (!data) {  return false; }
                  let asMarkers = data.magicube_interface_data;
                  //地图上点还原
                  let allOverlays = map.getOverlays();
                  for(let i=0;i<allOverlays.length;i++){
                      if(allOverlays[i].hasOwnProperty("addnode")){
                          if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                              mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                              allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                          }
                      }
                  }
                  //从datas 添加重点人，去重， 状态为选中
                  let mapStepOverlays = [];
                  for (let i = 0; i < asMarkers.length; i++) {
                      let haveMarker = mapRepeat(asMarkers[i],"marker");
                      if (!haveMarker) {//不重复，在这进行加点操作：
                          let conf = { type: "keyarea"};
                          let marker = addMapOverlays(asMarkers[i], "marker", conf);
                          let step = {data: marker, type: "marker"};
                          mapStepOverlays.push(step);
                      }else{
                          //重复的，改为选中状态
                          let lays = map.getOverlays();
                          for(let t=0;t<lays.length;t++){
                              if(lays[t].hasOwnProperty("addnode")&&lays[t].getIcon().style.fillColor != "yellow"){
                                  if(asMarkers[i].id === lays[t].id){
                                      mapSetIcon(lays[t], markerPathPeople, 0.6, 0, 'red', 20, 42);
                                      lays[t].setTop(true);//点击点置顶
                                      if(mapFontStatus){
                                          lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                                      }else{
                                          lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                                      }
                                  }
                              }
                          }
                      }
                  }

                  if(mapStepOverlays){
                      mapStep.push(mapStepOverlays);
                      mapType.push("add");
                      mapStepNum++;
                  }


                  /*id : "750992ae-1e3e-4c48-9894-ac8d961fa1e4"
                  mark : false
                  markIcons : []
                  nodeId : "710155"
                  objectType : "entity"
                  page_type : "entity"
                  target : "6001"
                  type : "A_RY_HXX"*/

              };
              let judgment = function() { return false; };
              mapCommonPart.ajaxAppMap(areaurl,'POST',areadata,completed,succeed,judgment,null,true);
          },
          mapClickKeyAreaMenu:function(type, sign){
              var areaAttr = mapCommon.mapKeyArea.areaLays.addattr;
              if(type === "delete"){
                  const url = EPMUI.context.url + '/object/deleteKeyArea';
                  let data = {"areaId":areaAttr.id};
                  let completed = function (){ return false; };
                  let succeed = function(returnData) {
                      if (!returnData) {
                          return false;
                      }
                      var datas = returnData;
                      if (parseInt(datas.code) === 200) {
                          //再次请求
                          //$("#map_area_statistics").click();
                          let delid = [];
                          delid.push(areaAttr.id);
                          deleteMarker(delid);
                          showAlert("提示!", datas.message, "#33d0ff");
                      } else {
                          showAlert("提示!", datas.message, "#ffc000");
                      }
                  };
                  let judgment = function() { return false; };
                  mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);
              }
              if(type === "peoplemove"){
                  if(!areaAttr.peopleMove){
                      removePeopleMove();//清除下之前的轨迹。
                      //同时要恢复之前选区的标志信息
                      /*var allOverlays = map.getOverlays();
                      for(var k=0;k<allOverlays.length;k++) {
                          if (allOverlays[k].hasOwnProperty("addattr")&&allOverlays[k].addattr.sign == "keyarea") {
                              map.removeOverlay(allOverlays[k]);
                          }
                          if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type == "areaMarker") {//清除区域分析
                              map.removeOverlay(allOverlays[k]);
                          }
                      }*/



                      areaAttr.peopleMove = true;
                      //请求后端，获得数据
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

                  }else{
                      removePeopleMove();
                      areaAttr.peopleMove = false;
                  }
              }
              if(type === "analyse"){
                  if(areaAttr.analyse){// 关闭统计功能
                      var allOverlays = map.getOverlays();
                      for(var k=0;k<allOverlays.length;k++) {
                          if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type == "areaMarker") {//在这写判断，并且id要和对应选区相同
                              if(allOverlays[k].hasOwnProperty("areaid")&&allOverlays[k].areaid == areaAttr.id){
                                  map.removeOverlay(allOverlays[k]);
                              }
                          }
                      }
                      areaAttr.analyse = false;
                      areaStatisticsSignClick = false;
                  }else{//未统计，开始统计
                      //请求后端，获得数据
                      var areadata = [];
                      if (areaAttr.type == "polygon"){
                        areadata = [
                          {
                            "name": "重点人员",
                            "category": "0",
                            "value": "242.00"
                          }, {
                            "name": "出行人数",
                            "category": "0",
                            "value": "222.00"
                          }, {
                            "name": "进入人数",
                            "category": "0",
                            "value": "185.00"
                          }, {
                            "name": "重点事件",
                            "category": "0",
                            "value": "99.00"
                          }
                        ];
                      }else {
                        areadata = [
                          {
                            "name": "鸭蛋",
                            "category": "0",
                            "value": "242.00"
                          }, {
                            "name": "红薯",
                            "category": "0",
                            "value": "222.00"
                          }, {
                            "name": "白菜",
                            "category": "0",
                            "value": "185.00"
                          }, {
                            "name": "鸡肉",
                            "category": "0",
                            "value": "99.00"
                          }
                        ];
                      }

                      areaStatistics(areadata);

                      areaAttr.analyse = true;
                      areaStatisticsSignClick = true;
                  }
              }
              if(type === "show"){
                let oldPoints = mapCommon.mapKeyArea.areaLays.points;
                let oldLat = [];
                let oldLon = [];
                function sortNumber(a,b){
                  return a - b
                }
                oldPoints.forEach(op => {
                  oldLat.push(op[1]);
                  oldLon.push(op[0]);
                });
                oldLat = [...new Set(oldLat)].sort(sortNumber);
                oldLon = [...new Set(oldLon)].sort(sortNumber);
                function getLonLat(ol){ //在一个长方形区域内随机生成点
                  let numl = new Number( ol[0] + ((ol[1]-ol[0]) * Math.random()) );
                  return numl.toFixed(6);
                }

                let asMarkers = [
                  {
                    id: "asdqwrewtwqrqw",
                    type: "PERSON",
                    objectType: "entity",
                    page_type:"entity",
                    name: "赵卫国",
                    nodeId: "452879",
                    addnode: true,
                    gis: {
                      lon: getLonLat(oldLon),
                      lat: getLonLat(oldLat)
                    },
                  },
                  {
                    id: "asdqwqwedfdfqrqw",
                    type: "PERSON",
                    objectType: "entity",
                    page_type:"entity",
                    name: "陈生",
                    nodeId: "425279",
                    addnode: true,
                    gis: {
                      lon: getLonLat(oldLon),
                      lat: getLonLat(oldLat)
                    },
                  },
                  {
                    id: "asdqwrewhjrqw",
                    type: "PERSON",
                    objectType: "entity",
                    page_type:"entity",
                    name: "李广",
                    nodeId: "422879",
                    addnode: true,
                    gis: {
                      lon: getLonLat(oldLon),
                      lat: getLonLat(oldLat)
                    },
                  },
                  {
                    id: "asdqwrewtwqeerqw",
                    type: "PERSON",
                    objectType: "entity",
                    page_type:"entity",
                    name: "郑平",
                    nodeId: "454479",
                    addnode: true,
                    gis: {
                      lon: getLonLat(oldLon),
                      lat: getLonLat(oldLat)
                    },
                  }
                ];
                //地图上点还原
                let allOverlays = map.getOverlays();
                for(let i=0;i<allOverlays.length;i++){
                  if(allOverlays[i].hasOwnProperty("addnode")){
                    if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                      mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                      allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                    }
                  }
                }
                //从datas 添加重点人，去重， 状态为选中
                let mapStepOverlays = [];
                for (let i = 0; i < asMarkers.length; i++) {
                  let haveMarker = mapRepeat(asMarkers[i],"marker");
                  if (!haveMarker) {//不重复，在这进行加点操作：
                    let conf = { type: "keyarea"};
                    let marker = addMapOverlays(asMarkers[i], "marker", conf);
                    let step = {data: marker, type: "marker"};
                    mapStepOverlays.push(step);
                  }else{
                    //重复的，改为选中状态
                    let lays = map.getOverlays();
                    for(let t=0;t<lays.length;t++){
                      if(lays[t].hasOwnProperty("addnode")&&lays[t].getIcon().style.fillColor != "yellow"){
                        if(asMarkers[i].id === lays[t].id){
                          mapSetIcon(lays[t], markerPathPeople, 0.6, 0, 'red', 20, 42);
                          lays[t].setTop(true);//点击点置顶
                          if(mapFontStatus){
                            lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                          }else{
                            lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                          }
                        }
                      }
                    }
                  }
                }

                if(mapStepOverlays){
                  mapStep.push(mapStepOverlays);
                  mapType.push("add");
                  mapStepNum++;
                }

                /* $(".topology_message_tab_active").removeClass("topology_message_tab_active");
                $("#topo_total_title").addClass("topology_message_tab_active");
                $(".topo_message").hide();
                $("#topology_search_loading").hide();
                $("#topology_message_total").show();
                mapStatistics(asMarkers);*/

                return '';

                let areaurl;
                let areadata;
                var clickArea = mapCommon.mapWorkArea.areaLays.overlay;
                if(clickArea.type=="circle"){
                  areadata = {
                    "shape": "circle",
                    "radius": clickArea.radius,
                    "lon": clickArea.centerPoint[0],
                    "lat": clickArea.centerPoint[1],
                    "searchType":sign
                  };
                  areaurl = EPMUI.context.url + '/object/areaSearch/saveCircleGis';
                }else if(clickArea.type=="polygon"){
                  areadata = {
                    "shape": "polygon",
                    "lon": clickArea.lonUse,
                    "lat": clickArea.latUse,
                    "searchType":sign
                  };
                  areaurl = EPMUI.context.url + '/object/areaSearch/savePolygonGis';
                }

                let completed = function (){ return false; };
                let succeed = function(data) {
                  if (!data) {  return false; }
                  let asMarkers = data.magicube_interface_data;
                  //地图上点还原
                  let allOverlays = map.getOverlays();
                  for(let i=0;i<allOverlays.length;i++){
                    if(allOverlays[i].hasOwnProperty("addnode")){
                      if(allOverlays[i].getIcon().style.fillColor !== "yellow"){
                        mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                        allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                      }
                    }
                  }
                  //从datas 添加重点人，去重， 状态为选中
                  let mapStepOverlays = [];
                  for (let i = 0; i < asMarkers.length; i++) {
                    let haveMarker = mapRepeat(asMarkers[i],"marker");
                    if (!haveMarker) {//不重复，在这进行加点操作：
                      let conf = { type: "keyarea"};
                      let marker = addMapOverlays(asMarkers[i], "marker", conf);
                      let step = {data: marker, type: "marker"};
                      mapStepOverlays.push(step);
                    }else{
                      //重复的，改为选中状态
                      let lays = map.getOverlays();
                      for(let t=0;t<lays.length;t++){
                        if(lays[t].hasOwnProperty("addnode")&&lays[t].getIcon().style.fillColor != "yellow"){
                          if(asMarkers[i].id === lays[t].id){
                            mapSetIcon(lays[t], markerPathPeople, 0.6, 0, 'red', 20, 42);
                            lays[t].setTop(true);//点击点置顶
                            if(mapFontStatus){
                              lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                            }else{
                              lays[t].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff",display:"none" });
                            }
                          }
                        }
                      }
                    }
                  }

                  if(mapStepOverlays){
                    mapStep.push(mapStepOverlays);
                    mapType.push("add");
                    mapStepNum++;
                  }


                  /*id : "750992ae-1e3e-4c48-9894-ac8d961fa1e4"
                    mark : false
                    markIcons : []
                    nodeId : "710155"
                    objectType : "entity"
                    page_type : "entity"
                    target : "6001"
                    type : "A_RY_HXX"*/

                };
                let judgment = function() { return false; };
                mapCommonPart.ajaxAppMap(areaurl,'POST',areadata,completed,succeed,judgment,null,true);
              }
              if(type === "payonet"){
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
                              addMapMarkerLine(warningData,[]);
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
              var multipleEntity = e.overlay.multipleEntity;

              d3.selectAll("#newDiv").remove();//先把圆环删除咯
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大

              if(!multipleEntity){
                  return '';
              }

              for (var i=0;i<multipleEntity.length;i++){
                  Id.push(multipleEntity[i].id);
                  nodeType.push(multipleEntity[i].baseMsg.type);
                  nodeId.push(multipleEntity[i].baseMsg.nodeId);
              }
              mapCommonPart.mapMainRadraw(multipleEntity, thir, Id, nodeType, nodeId, sign, '/leaves/');
              Id = [];
              nodeType = [];
              nodeId = [];

          },
          mapRemoveAreaMenu:function(e, sign){
              if(sign == 0){
                  map.removeOverlay(e.overlay);
                  var allOverlays = map.getOverlays();
                  for(var i=0;i<allOverlays.length;i++){
                      if(allOverlays[i].hasOwnProperty("circle")){
                          if(allOverlays[i].circle==e.overlay){
                              //删除
                              map.removeOverlay(allOverlays[i]);
                          };
                      };
                  }
              }
              if (sign == 1) {// 删除内点
                  if(e.overlay.hasOwnProperty("radius")){
                      mapSelectArea(e.overlay.multipleEntity,"delInPoint");
                  }
                  if(e.overlay.hasOwnProperty("Polygon")){
                      mapSelectArea(e.overlay.multipleEntity,"delInPoint");
                  }
              }
              if (sign == 2) {// 删除外点
                  if(e.overlay.hasOwnProperty("radius")){
                      mapSelectArea(e.overlay.multipleEntity,"delOutPoint");
                  }
                  if(e.overlay.hasOwnProperty("Polygon")){
                      mapSelectArea(e.overlay.multipleEntity,"delOutPoint");
                  }
              }
              d3.select("#newDiv").remove();
              map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
              map.enableDoubleClickZoom();//启用鼠标双击放大
              $("svg[type='system']").css("cursor","pointer");

          },
          mapAddKeyAreaMenu:function(){
              let name = $("#gis-add-keyarea-name").val();
              let level = $("#gis-add-keyarea-level").val();
              let address = $("#gis-add-keyarea-address").val();
              let areaurl;
              let areadata;
              let clickArea = mapCommon.mapWorkArea.areaLays.overlay;
              if(clickArea.type === "circle"){
                  areadata = {
                      "name": name,
                      "level": level,
                      "address": address,
                      "shape": "circle",
                      "radius": clickArea.radius,
                      "lon": clickArea.centerPoint[0],
                      "lat": clickArea.centerPoint[1]
                  };
                  areaurl = EPMUI.context.url + '/object/saveCircleGis';
              }else if(clickArea.type === "polygon"){
                  areadata = {
                      "name": name,
                      "level": level,
                      "address": address,
                      "shape": "polygon",
                      "lon": clickArea.lonUse,
                      "lat": clickArea.latUse
                  };
                  areaurl = EPMUI.context.url + '/object/savePolygonGis';
              }

              let completed = function (){ return false; };
              let succeed = function(data) {
                  if (!data) {
                      return false;
                  }
                  if (parseInt(data.code) === 200) {
                      map.removeOverlay(clickArea);
                      $("#gis-add-keyarea").css("display","none");
                      showAlert("提示!", data.message, "#33d0ff");
                  } else {
                      showAlert("提示!", data.message, "#ffc000");
                  }
              };
              let judgment = function() { return false; };
              mapCommonPart.ajaxAppMap(areaurl,'POST',areadata,completed,succeed,judgment,null,true);
          },
          mapSaveTopoNodes:function(){
              /*let mapNodes = [];
              let mapLinks = [];
              let allOverlays = map.getOverlays();
              for(let j=0;j<allOverlays.length;j++) {
                  if (allOverlays[j].hasOwnProperty("id")&&allOverlays[j].hasOwnProperty("addnode")) {
                      let mapNode = {
                          "id":allOverlays[j].id,
                          "name":allOverlays[j].baseMsg.name,
                          "type":allOverlays[j].type,
                          "nodeId":allOverlays[j].baseMsg.nodeId,
                          "objectType":allOverlays[j].baseMsg.objectType,
                          "markIcons":[ ],
                          "nodeWeight":0,
                          "display":"block",
                          "fill":"#0088b1",
                          "stroke":"#33d0ff",
                          "index":0,
                          "weight":1,
                          "fixed":true,
                          "selected":false,
                          "children":[  ]
                      };
                      mapNodes.push(mapNode);
                  }
                  if (allOverlays[j].hasOwnProperty("polylineid")) {
                      let allLinesAttrs = allOverlays[j];
                      let maplink = {
                          "id":allLinesAttrs.source.id,
                          "relationId":allLinesAttrs.relationId,
                          "relationTypeName":allLinesAttrs.relationTypeName,
                          "source":{
                              "name":allLinesAttrs.source.name,
                              "type":allLinesAttrs.source.type,
                              "id":allLinesAttrs.source.id,
                              "nodeWeight":0,
                              "objectType":allLinesAttrs.source.objectType,
                              "relationTypeName":allLinesAttrs.relationTypeName,
                              "nodeId":allLinesAttrs.source.nodeId,
                              "markIcons":[ ],
                              "fill":"#0088b1",
                              "stroke":"#33d0ff",
                              "display":"block",
                              "index":1,
                              "weight":5,
                              "fixed":true,
                              "selected":false,
                              "children":[ ]
                          },
                          "tag":allLinesAttrs.tag,
                          "target":{
                              "id":allLinesAttrs.target.id,
                              "name":allLinesAttrs.target.name,
                              "type":allLinesAttrs.target.type,
                              "nodeId":allLinesAttrs.target.nodeId,
                              "objectType":allLinesAttrs.target.objectType,
                              "markIcons":[ ],
                              "nodeWeight":0,
                              "display":"block",
                              "fill":"#0088b1",
                              "stroke":"#33d0ff",
                              "index":0,
                              "weight":1,
                              "fixed":true,
                              "selected":false,
                              "children":[ ]
                          },
                          "type":allLinesAttrs.source.type,
                          "size":1,
                          "linknum":1,
                          "nodeWeight":0,
                          "relationWeight":0
                      };
                      mapLinks.push(maplink);
                  }
              }
              let toponodes = {
                  "nodes":mapNodes,
                  "links":mapLinks,
                  "filterNodeId":[],
                  "timeDatas":[],
                  "totalHtml":""
              };
              //保存
              localStorage.setItem("topoNodes", JSON.stringify(toponodes) );*/


              mapSaveLocalStorage();

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
                          relationTypeName:allOverlays[j].relationName,
                          relationId:allOverlays[j].relationId,
                          relationParentType:allOverlays[j].relationParentType
                      };
                      window.filterLinks.push(obj);
                  }
              }
          },
          bayonetAreaMenu:function () {

          }
      }
      //bMapNgm END!!
    }

})();