/**
 * Created by ngm on 2017/12/5.
 */
var SuperMapNgm = window.SuperMapNgm = SuperMapNgm || {};

(function() {
    SuperMapNgm.superMapNgm = superMapNgm;
    function superMapNgm() {
        let map, layer, markerlayer, curveTextLayer,imgLayer,
            vectorLayer, lineLayer, strategy,curveTextStrategy, popup, selectFeature,
            url =  "http://support.supermap.com.cn:8090/iserver/services/map-world/rest/maps/World";
         //url = "http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China";

        let noGisPoints = [];//存放无经纬度的点
        let mapHeatSign = false;//热力图
        let mapSmallSign = false;//点状图
        let arcgisToolSign = false;//选区标志
        let mapdisk = false;
        let shiftSign = false;
        let lineNames = [];//线条关系数组
        let mapShowSign = false;//判断设置菜单显示隐藏
        let mapFontStatus = true;// 文字显示
        let mapLineStatus = true;// 线条显示

        let mapStep = [];//保存上一步数据
        let mapStepType = [];//保存上一步操作类型
        let mapStepNum = 0;//保存上一步操作顺序数组的长度
        window.mapCommon = {
            mapWorkMarker:[],
            mapWorkArea:{},
            mapKeyArea:{}
        };//存放正在操作的点

        var drawingManager;
        var mapToolSign = false;
        var mapthemeType = "blue";//判断地图主题
        var markerClusterer ;
        var mapPathSgin = false;//地图轨迹标志
        var mapPathBasePoint;//地图轨迹基本点信息
        var peopleMoveSign = false;//跨省人员流动标志
        var areaStatisticsSign = false;//区域统计的标志
        var areaStatisticsSignClick = false;//区域统计 是否点击标志
        var markerClustererSign = false;//聚合标志

        var shiftGraphic = [];// 存放shift状态下graphic的信息
        window.mapAdvanceSearchFlag = localStorage.mapAdvanceSearchFlag ? localStorage.mapAdvanceSearchFlag : "false";

        //加载地图
        this.run = function () {
            mapload = true;
            map = new SuperMap.Map("basemap", {
                controls: [
                    new SuperMap.Control.Navigation()
                ]
            });
            layer = new SuperMap.Layer.TiledDynamicRESTLayer("World", url, null, {maxResolution: "auto"});

            markerlayer = new SuperMap.Layer.Markers("markerLayer");
            lineLayer = new SuperMap.Layer.Vector("lineLayer");//线条图层 Vector
            imgLayer = new SuperMap.Layer.Vector("imgLayer");//线条图层 Vector
            //新建一个策略
            strategy = new SuperMap.Strategy.GeoText();
            //设置标签的样式transform: "translate(30px, 12px)",
            strategy.style = {
                "margin-left":"22px",
                fontColor: "#000",
                fontWeight: "bolder",
                fontSize: "14px",
                fill: true,
                fillColor: "#FFFFFF",
                fillOpacity: 0,
                stroke: true,
                strokeColor: "#8B7B8B",
                labelXOffset:30,
                labelYOffset:20
                /*,
                 graphicXOffset:20,
                 graphicYOffset:40,
                 backgroundXOffset:20,
                 backgroundYOffset:40*/
            };
            //新建一个标签专题图层
            vectorLayer = new SuperMap.Layer.Vector("Label", {strategies: [strategy],clipFeature:false});

            curveTextStrategy = new SuperMap.Strategy.GeoText();
            curveTextStrategy.style = {
                "margin-left":"22px",
                fontColor: "#1536DE",
                fontWeight: "bolder",
                fontSize: "14px",
                fill: true,
                fillColor: "#FFFFFF",
                fillOpacity: 0,
                stroke: false,
                strokeColor: "#8B7B8B"
            };
            curveTextLayer = new SuperMap.Layer.Vector("Label", {strategies: [curveTextStrategy],clipFeature:false});

            layer.events.on({ // layer也仅仅是一个图层，和map还是不同的
                "layerInitialized": addLayer
            });

            function mapMove (){
                $(".map_select_btn_div").css("width","0px");
                $(".map_select_btn").css("width","0px");
                var val = $("#map_select_input").val();
                if(val){
                    $(".map_select_resultDiv").css("height","0px");
                    $(".map_select_resultDivSmall").css("height","40px");
                }else {
                    $(".map_select_resultDiv").css("height","0px");
                    $(".map_select_resultDivSmall").css("height","0px");
                }
                if(mapPathSgin){
                    $(".map_path").css("height","40px");
                    $(".map_path").css("overflow","hidden");
                }
            };
            function mapzoomend(){
                d3.selectAll("#newDiv").remove();
            };
            map.events.register("move", map, mapMove);
            map.events.register("zoomend", map, mapzoomend);

            addMapLocalStorage();
            this.mapLeftSelect();//左侧搜索框
            $("#map_usual_tools").css("z-index","10000");

            setTimeout(function () {
                $("#basemap svg").addClass("active");
                var supermapCursor = $("#basemap").css("cursor");
                $("#basemap svg").css("cursor", supermapCursor);
            },500);
            setTimeout(function () {
                $("#basemap svg").addClass("active");
                var supermapCursor = $("#basemap").css("cursor");
                $("#basemap svg").css("cursor", supermapCursor);
            },1500);
        };
        //拖拽加点
        this.addOnePoint = function (gisDatas) {
            var mapStepOverlays = [];//用于放入mapStep
            if(gisDatas.hasOwnProperty("gis") && gisDatas.gis != null){
                var haveMarker = mapRepeat(gisDatas,"marker");
                if(!haveMarker){//不重复，才加点
                    var conf = { type: "add"};
                    var marker = addMapOverlays(gisDatas, "marker", conf);
                    var markerText = addMapOverlays(gisDatas, "markerText", conf);
                    var step = { data:marker, type:"marker" };
                    var stepMText = { data:markerText, type:"markerText" };
                    mapStepOverlays.push(step);
                    mapStepOverlays.push(stepMText);
                    addMapBackStep(mapStepOverlays,"dragadd");
                }else{//重复，高亮该点
                    var gisDatasArr = [];
                    gisDatasArr.push(gisDatas.id);
                    changeMarkerType(gisDatasArr);
                }
            }
            if(gisDatas.hasOwnProperty("gis") && gisDatas.gis == null){
                noGisPoints.push(gisDatas);
                mapCommonPart.mapTooltip();//提示信息
            }
        };
        //跳转到地图的加点线
        this.addPoint = function (gisnodes, gislinks) {
            mapStep = [];
            mapStepType = [];
            mapStepNum = 0;
            /*if(sourcetype === "topo"){
                markerlayer.clearMarkers();//删除所有点 -- 逻辑变化，直接删除点
                lineLayer.removeAllFeatures();
                vectorLayer.removeAllFeatures();
            }*/
            addMapMarkerLine(gisnodes,gislinks);
        };
        //左侧搜索框
        this.mapLeftSelect = function () {
            var mapSet = mapCommonPart.addSearchModule();//建立dom元素
            $("#basemap").append(mapSet);// 添加DOM元素到地图中
            $(".map_select").css("z-index","10000");
            var mapstyle = mapCommonPart.getCookie("theme");
            if(mapstyle == "white"){
                $(".map_select_btn").removeClass("map_select_btn_background");
                $(".map_select_btn").css("background","#fff");
                $(".map_select_btn").css("border","1px soloid #23b9e7");
            }
            mapCommonPart.searchModuleEvent();//搜索框绑定事件
            // 左侧搜索框点击选中
            window.mapSearchResult = function (datasetid) {
                if(!mapSmallSign&&!mapHeatSign){
                    var gisDatasArr = [];
                    gisDatasArr.push(datasetid);
                    changeMarkerType(gisDatasArr);
                }
            };
        };
        // 左侧搜索框返回结果
        this.mapSearchResult = function (datasetid) {
            if(!mapSmallSign&&!mapHeatSign){
                //所有点都还原
                console.log("所有点都还原")
                /*var allOverlays = map.getOverlays();
                 for(var i=0;i<allOverlays.length;i++){
                 if(allOverlays[i].hasOwnProperty("addnode")){
                 if(allOverlays[i].getIcon().style.fillColor != "yellow"){
                 if(allOverlays[i].id == datasetid ){//选中
                 mapSetIcon(allOverlays[i], markerPathPeople, 0.6, 0, 'red', 20, 42);
                 allOverlays[i].setTop(true);//点击点置顶
                 allOverlays[i].getLabel().setStyle({backgroundColor:"#E2382A",border:"#FFC62E",color:"#fff"});
                 }else{
                 mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                 allOverlays[i].setTop(false);//不能置顶
                 allOverlays[i].getLabel().setStyle({backgroundColor: "#5B7085",border:"#5E7489",color:"black"});
                 }
                 }
                 };
                 }*/
            }
        };
        //过滤器
        this.filterMapMarker = function (relationArr,sign){
            if(sign == "relation"){ //关系过滤
                var allLines = lineLayer.features;
                var selectedId = [];
                for(var j=0;j<relationArr.length;j++){
                    for(var k=0;k<allLines.length;k++) {
                        var allLinesAttrs = allLines[k].attrs;
                        if (allLinesAttrs.relationTypeName == relationArr[j]) {
                            selectedId.push(allLinesAttrs.source.id);
                            selectedId.push(allLinesAttrs.target.id);
                        }
                    }
                }
                selectedId = [...new Set(selectedId)];
                changeMarkerType(selectedId);
            }else if(sign == "node"){ //节点过滤
                changeMarkerType(relationArr);
            }
        };
        //后退
        this.backStep = function () {
            if(mapStepNum>0){
                if(mapStepType[mapStepNum-1]=="add"){//删除对应点
                    var del = mapStep[mapStepNum-1];
                    var delMarker = [];//删除对应点
                    var delmtext = [];//删除文字
                    var delLine = [];//删除线条
                    var delctext = [];//删除线上文字
                    var markers = markerlayer.markers;
                    var mtext = vectorLayer.features;
                    var line = lineLayer.features;
                    var ctext = curveTextLayer.features;
                    for(var n = 0;n<del.length;n++){
                        if(del[n].type == "marker"){
                            for(var i=0;i<markers.length;i++){
                                markers[i].id == del[n].data.id ? delMarker.push(markers[i]) : null;
                            }
                        }
                        if(del[n].type == "markerText"){
                            for(var i=0;i<mtext.length;i++){
                                mtext[i].data.id == del[n].data.data.id ? delmtext.push(mtext[i]) : null;
                            }
                        }
                        if(del[n].type == "curve"){
                            for(var i=0;i<line.length;i++){
                                var lineSid= line[i].attrs.source.id;
                                var lineTid= line[i].attrs.target.id;
                                if(lineSid == del[n].data.attrs.source.id || lineTid == del[n].data.attrs.target.id){
                                    delLine.push(line[i]);
                                }
                            }
                        }
                        if(del[n].type == "curveText"){
                            for(var i=0;i<ctext.length;i++){
                                var ctextSid= ctext[i].data.source.id;
                                var ctextTid= ctext[i].data.target.id;
                                if(ctextSid == del[n].data.data.source.id || ctextTid == del[n].data.data.target.id){
                                    delctext.push(ctext[i]);
                                }
                            }
                        }
                    }
                    //进行删除
                    for(var j=0;j<delMarker.length;j++){
                        markerlayer.removeMarker(delMarker[j]);
                    }
                    vectorLayer.removeFeatures(delmtext);
                    lineLayer.removeFeatures(delLine);
                    curveTextLayer.removeFeatures(delctext);

                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapStepType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapStepType[mapStepNum-1]=="dragadd"){//删除拖拽点
                    var del = mapStep[mapStepNum-1];
                    var delMarker = [];//删除对应点
                    var delmtext = [];//删除文字
                    var markers = markerlayer.markers;
                    var mtext = vectorLayer.features;
                    for(var n = 0;n<del.length;n++){
                        for(var i=0;i<markers.length;i++){
                            markers[i].id == del[n].data.id ? delMarker.push(markers[i]) : null;
                        }
                        for(var i=0;i<mtext.length;i++){
                            mtext[i].data.id == del[n].data.id ? delmtext.push(mtext[i]) : null;
                        }
                    }
                    //进行删除
                    for(var j=0;j<delMarker.length;j++){
                        markerlayer.removeMarker(delMarker[j]);
                    }
                    vectorLayer.removeFeatures(delmtext);
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapStepType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapStepType[mapStepNum-1]=="del"){//还原对应点线
                    var del = mapStep[mapStepNum-1];
                    for(var i=0;i<del.length;i++){
                        if(del[i].type == "marker"){//还原点
                            markerlayer.addMarker(del[i].data);
                        }else if(del[i].type == "markerText"){//还原点上字
                            var labelFeas = [];
                            labelFeas.push(del[i].data);
                            vectorLayer.addFeatures(labelFeas);
                        }else if(del[i].type == "curve"){//还原线
                            var labelFeas = [];
                            labelFeas.push(del[i].data);
                            lineLayer.addFeatures(labelFeas);
                        }else if(del[i].type == "curveText"){//还原线上字
                            var labelFeas = [];
                            labelFeas.push(del[i].data);
                            curveTextLayer.addFeatures(labelFeas);
                        }
                    }
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapStepType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapStepType[mapStepNum-1]=="addCurve"){//删除对应 轨迹 点和线
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
                    mapStepType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }

            }

        };
        //清屏功能
        this.resetscreen = function () {
            markerlayer.clearMarkers();//删除所有点 -- 逻辑变化，直接删除点
            lineLayer.removeAllFeatures();
            vectorLayer.removeAllFeatures();
            curveTextLayer.removeAllFeatures();
            localStorage.removeItem("mapOverlays");
        };
        //搜索
        this.searchNodes = function (searchnodes){
            if(searchnodes != "no"){
                var nodesIdArr = [];
                for(var j=0;j<searchnodes.length;j++){
                    nodesIdArr.push(searchnodes[j].id);
                }
                changeMarkerType(nodesIdArr);
            }else{
                changeMarkerType(false);
            }
        };
        //map 搜索功能  这是gis页面独立出来后应该的写法
        /*$(".map_nodes_find").keydown(function(event){
            if (event.keyCode == 13) {
                $(".search_nodes_modalBox_btn_map").click();
            };
        });
        $(".search_nodes_modalBox_btn_map").click(function(){
            var val = $(".map_nodes_find").val();
            if(!val){
                searchNodes("no");
                return '';
            }
            // 获取地图上所有点
            var markers = markerlayer.markers;
            var n = markers.filter(function(d){
                return d.baseMsg.name.indexOf(val)>-1?true:false;
            });
            if (n.length>0) {
                searchNodes(n);
            }else {
                searchNodes("no");
            }
        });*/

        //添加图层
        function addLayer() {
            map.addLayer(layer);
            map.addLayer(markerlayer);
            map.addLayer(curveTextLayer);
            map.addLayer(vectorLayer);
            map.addLayer(lineLayer);
            map.addLayer(imgLayer);

            //map.addLayers([ markerlayer, lineLayer, vectorLayer]);
            map.setCenter(new SuperMap.LonLat(106.3, 39.9), 3);//显示地图范围
            map.allOverlays = true;
            //用于标签分组的属性字段名称
            strategy.groupField = "dataStrategy";
            //标签分组数组
            strategy.styleGroups = [
                {
                    start: 200000,
                    end: 500000,
                    style: {
                        fontColor: "#FF4500",
                        fontWeight: "bolder",
                        fontSize: "18px"
                    }
                },
                {
                    start: 500000,
                    end: 1000000,
                    style: {
                        transform: "translate(30px, 12px)",
                        fontColor: "#FF00ff",
                        fontWeight: "bolder",
                        fontSize: "22px"
                    }
                },
                {
                    start: 1000000,
                    end: 2000000,
                    style: {
                        fontColor: "#EE0000",
                        fontWeight: "bolder",
                        fontSize: "26px"
                    }
                },
                {
                    start: 2000000,
                    end: 100000000,
                    style: {
                        fontColor: "#CD0000",
                        fontWeight: "bolder",
                        fontSize: "30px"
                    }
                }
            ];
            //通过selectFeature控件为标签添加点击事件
            var callbacks = {};
            //实例化 selectFeature 控件
            selectFeature = new SuperMap.Control.SelectFeature(vectorLayer, {callbacks: callbacks});
            //map上添加控件
            map.addControl(selectFeature);
            //激活控件
            selectFeature.activate();
        };
        //marker点的事件
        function clickMarker(){
            getBaseMessage(true,this.id, this.type, true);//基础信息展示
            var gisDatasArr = [];
            gisDatasArr.push(this.id);
            changeMarkerType(gisDatasArr);
        };
        function dblclickMarker(e){
            if(!mapSmallSign){
                mapdisk = true;
                var conf = {
                    thisMarker:this,
                    markerId:this.id,
                    gis:this.gis,
                    nodeId:this.baseMsg.nodeId,
                    nodeType:this.baseMsg.type,
                    objectType:this.baseMsg.objectType,
                    getLeft:parseFloat(e.element.style.left)-238, //-327
                    getTop:parseFloat(e.element.style.top)-238//-248
                };

                d3.selectAll("#newDiv").remove();
                setmapProperty("null","zoom-false","dbl-false");

                mapCommon.mapWorkMarker = [];
                mapCommon.mapWorkMarker.push(this);
                mapCommonPart.topomenu(conf);
            }
        };
        function mouseoverMarker(e){
            var oldMarker = this;
            if(oldMarker.showType == "marker"){
                oldMarker.icon.setUrl("/image/gis/marker-hover.svg");
            }
        };
        function mouseoutMarker(){
            var oldMarker = this;
            if(oldMarker.showType == "marker"){
                oldMarker.icon.setUrl("/image/gis/marker.svg");
            }
        };
        //添加点线等覆盖物
        function addMapOverlays(overlays, sign, conf){
            if(sign == "marker"){
                var size, offset, icon, marker, showType;

                if(overlays.hasOwnProperty("nogis")){
                    showType = "move";
                    noGisPoints.push(overlays);
                    size = new SuperMap.Size(25,30);
                    offset = new SuperMap.Pixel(-(size.w/2), -size.h+5);
                    icon = new SuperMap.Icon("/image/gis/marker-move.svg", size, offset);
                }else {
                    if(conf.type == "add"){
                        showType = "marker";
                        size = new SuperMap.Size(21,25);
                        offset = new SuperMap.Pixel(-(size.w/2), -size.h+5);
                        icon = new SuperMap.Icon("/image/gis/marker.svg", size, offset);//106.3, 39.9
                    }
                    if(conf.type == "hover"){
                        showType = "hover";
                        size = new SuperMap.Size(25,30);
                        offset = new SuperMap.Pixel(-(size.w/2), -size.h+5);
                        icon = new SuperMap.Icon("/image/gis/marker-hover.svg", size, offset);//106.3, 39.9
                    }
                    if(conf.type == "click"){
                        showType = "click";
                        size = new SuperMap.Size(25,30);
                        offset = new SuperMap.Pixel(-(size.w/2), -size.h+5);
                        icon = new SuperMap.Icon("/image/gis/marker-click.svg", size, offset);//106.3, 39.9
                    }
                }

                marker = new SuperMap.Marker(new SuperMap.LonLat(overlays.gis.lon, overlays.gis.lat),icon);
                markerlayer.addMarker(marker);

                marker.type= overlays.type;
                marker.id= overlays.id;
                marker.gis= overlays.gis;
                marker.addnode= overlays.addnode;
                marker.baseMsg = overlays;
                marker.ableDrag = "false";
                marker.showType = showType;

                marker.events.on({
                    "click":clickMarker,
                    "dblclick":dblclickMarker,
                    "mouseover":mouseoverMarker,
                    "mouseout":mouseoutMarker,
                    "scope": marker
                });

                return marker;
            }
            if(sign == "markerText"){
                var newdata = {
                    attributes:{
                        addnode:overlays.addnode,
                        gis:overlays.gis,
                        id:overlays.id,
                        name:overlays.name,
                        nodeId:overlays.nodeId,
                        objectType:overlays.objectType,
                        type:overlays.type
                    }
                };
                //新建GeoText对象（文本标签）
                var label = new SuperMap.Geometry.GeoText(overlays.gis.lon, overlays.gis.lat, newdata.attributes.name);
                var textVector = new SuperMap.Feature.Vector(label, newdata.attributes);
                var labelFeas = [];
                labelFeas.push(textVector);
                vectorLayer.addFeatures(labelFeas);
                return textVector;
            }
            if(sign == "curve"){
                var points = [];
                var returnPoints = mapCommonPart.getCurveByTwoPoints(overlays.source, overlays.target, conf.linesizeNum);
                for(var k=0;k<returnPoints.length;k++){
                    points.push(new SuperMap.Geometry.Point(returnPoints[k].lon, returnPoints[k].lat));
                }
                var line = new SuperMap.Geometry.LineString(points);
                var linecVector = new SuperMap.Feature.Vector(line);
                linecVector.style = { strokeColor: "#7B68EE", strokeWidth: 1 };
                linecVector.attrs = overlays;
                //lineLayer.drawFeature(linecVector);
                var linecVectors = [];
                linecVectors.push(linecVector);
                lineLayer.addFeatures(linecVectors);

                var centerNum = parseInt(returnPoints.length/2);
                var lineCenter = returnPoints[centerNum];
                var returnData = {
                    linecVector:linecVector,
                    lineCenter:lineCenter
                };

                return returnData;
            }
            if(sign == "curveText"){ //加线上文字
                var label = new SuperMap.Geometry.GeoText(conf.lineCenter.lon, conf.lineCenter.lat, overlays.relationTypeName);
                var textVector = new SuperMap.Feature.Vector(label, overlays);
                var labelFeas = [];
                labelFeas.push(textVector);
                curveTextLayer.addFeatures(labelFeas);
                if(true){//显示文字标志判断
                }
                return textVector;
            }
        };
        //添加进后退队列
        function addMapBackStep(mapStepOverlays, steptype) {
            mapStep.push(mapStepOverlays);
            mapStepType.push(steptype);
            mapStepNum++;
        }
        //去重 点or线
        function mapRepeat(lays,type){
            switch (type) {
                case "marker":
                    var haveMarker = false;
                    var markers = markerlayer.markers;
                    for(var i=0;i<markers.length;i++){
                        if(markers[i].id == lays.id){
                            haveMarker = true;
                        }
                    }
                    return haveMarker;
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
                case "polyline":
                    var lineAll = [];
                    var haveCurve = false;
                    var allOverlays = lineLayer.features;
                    for(var j=0;j<allOverlays.length;j++) {
                        var overlayAttr = allOverlays[j].attrs;
                        var laysTId = lays.target.id;
                        var laysSId = lays.source.id;
                        var oAttrTId = overlayAttr.target.id;
                        var oAttrSId = overlayAttr.source.id;
                        if (overlayAttr.hasOwnProperty("relationId")) {
                            if((oAttrSId==laysSId&&oAttrTId==laysTId)||(oAttrSId==laysTId&&oAttrTId==laysSId)){
                                //id相同时，比较关系名称是否相同
                                haveCurve = true;
                                lineAll.push(overlayAttr);
                            }
                        }
                    }

                    if(haveCurve && lays.hasOwnProperty("relationTypeName")){
                        for(var n=0;n<lineAll.length;n++){
                            if(lineAll[n].relationId == lays.relationId){
                                return "have";
                            }
                        }
                        return lineAll;
                    }
                    if(haveCurve && lays.hasOwnProperty("relationTypeName")){
                        for(var n=0;n<lineAll.length;n++){
                            if(lineAll[n].relationId == lays.relationId){
                                return "have";
                            }
                        }
                        return lineAll;
                    }

                    return false;
            }

        };
        //删除点线
        function deleteMarker(markerId){
            var mapStepOverlays = [];//存放删除的数据
            var delMarker = [];//删除对应点
            var delmtext = [];//删除文字
            var delLine = [];//删除线条
            var delctext = [];//删除线上文字
            var markers = markerlayer.markers;
            var mtext = vectorLayer.features;
            var line = lineLayer.features;
            var ctext = curveTextLayer.features;
            for(var n = 0;n<markerId.length;n++){
                for(var i=0;i<markers.length;i++){
                    if(markers[i].id == markerId[n]){
                        var step = { data:markers[i], type:"marker" };//存入到后退数组中
                        mapStepOverlays.push(step);
                        delMarker.push(markers[i]);
                    }
                }
                for(var i=0;i<mtext.length;i++){
                    if(mtext[i].data.id == markerId[n]){
                        delmtext.push(mtext[i]);
                        var step = { data:mtext[i], type:"markerText" };
                        mapStepOverlays.push(step);
                    }
                }
                for(var i=0;i<line.length;i++){
                    if(line[i].attrs.source.id == markerId[n] || line[i].attrs.target.id == markerId[n]){
                        delLine.push(line[i]);
                        var step = { data:line[i], type:"curve" };
                        mapStepOverlays.push(step);
                    }
                }
                for(var i=0;i<ctext.length;i++){
                    if(ctext[i].data.source.id == markerId[n] || ctext[i].data.target.id == markerId[n]){
                        delctext.push(ctext[i]);
                        var step = { data:ctext[i], type:"curveText" };
                        mapStepOverlays.push(step);
                    }
                }
            }
            //进行删除
            for(var j=0;j<delMarker.length;j++){
                markerlayer.removeMarker(delMarker[j]);
            }
            vectorLayer.removeFeatures(delmtext);
            lineLayer.removeFeatures(delLine);
            curveTextLayer.removeFeatures(delctext);

            addMapBackStep(mapStepOverlays,"del");
        };
        //地图历史覆盖物显示
        function addMapLocalStorage () {
            var historyDatas = localStorage.mapOverlays ? JSON.parse(localStorage.mapOverlays): "false";//保存的缓存数据
            if(historyDatas != "false" ){
                var addOverlaysMarker = historyDatas.overlaysMarker;
                var addOverlaysLine = historyDatas.overlaysLine;
                addMapMarkerLine(addOverlaysMarker,addOverlaysLine);
            }

            var localStorageMarker = localStorage.searchAddNode ? JSON.parse(localStorage.searchAddNode) : "false";
            if(localStorageMarker != "false"){
                var localStorageMarkerId = [];
                var localStorageMarkerType = [];
                //循环，加点
                for (var i = 0; i < localStorageMarker.length; i++) {
                    localStorageMarkerId.push(localStorageMarker[i].id);
                    localStorageMarkerType.push(localStorageMarker[i].type);
                }
                mapCommonPart.getmapGis(localStorageMarker, localStorageMarkerId, localStorageMarkerType, false);// 获取gis信息
            }
        };
        //添加点线
        function addMapMarkerLine(gisnodes,gislinks){
            console.log(gislinks);
            gislinks.forEach(link => lineNames.push(link.relationParentType));
            lineNames = [...new Set(lineNames)];
            var mapTooltipSign = false;//用于判断 提示信息是否显示
            var gisAllSearchDatas = gisnodes;
            var mapStepOverlays = [];//用于放入mapStep
            for (var i = 0; i < gisAllSearchDatas.length; i ++) {
                if(gisAllSearchDatas[i].hasOwnProperty("nogis")){
                    noGisPoints.push(gisAllSearchDatas[i]);
                    mapTooltipSign = true;
                }
                var haveMarker = mapRepeat(gisAllSearchDatas[i],"marker");
                if(!haveMarker){//如果不存在，才加点
                    if (gisAllSearchDatas[i].gis != null && !gisAllSearchDatas[i].hasOwnProperty("nogis")) {
                        var conf = { type:"add" };
                        var marker = addMapOverlays(gisAllSearchDatas[i], "marker", conf);
                        var markerText = addMapOverlays(gisAllSearchDatas[i], "markerText", conf);
                        var step = { data:marker, type:"marker" };
                        var stepMText = { data:markerText, type:"markerText" };
                        mapStepOverlays.push(step);
                        mapStepOverlays.push(stepMText);
                    }
                    if(gisAllSearchDatas[i].hasOwnProperty("nogis")){//留用，若无经纬度不显示
                        var conf = { type:"add" };
                        var marker = addMapOverlays(gisAllSearchDatas[i], "marker", conf);
                        var markerText = addMapOverlays(gisAllSearchDatas[i], "markerText", conf);
                        var step = { data:marker, type:"marker" };
                        var stepMText = { data:markerText, type:"markerText" };
                        mapStepOverlays.push(step);
                        mapStepOverlays.push(stepMText);
                    }
                }
            }

            if(gislinks != "no"){
                for(var i=0;i<gislinks.length;i++){
                    var haveLine = mapRepeat(gislinks[i],"polyline");
                    if((gislinks[i].source.gis != null) && (gislinks[i].target.gis != null) ){
                        var lineSizeNum = haveLine ? haveLine.length : 170;
                        if(haveLine != "have"){
                            var conf = { linesizeNum : lineSizeNum };
                            var returnData = addMapOverlays(gislinks[i], "curve", conf);
                            var curve = returnData.linecVector;
                            var curveTextConf = {lineCenter:returnData.lineCenter};
                            var curveText = addMapOverlays(gislinks[i], "curveText", curveTextConf);

                            var stepM = { data:curve, type:"curve" };
                            var step = { data:curveText, type:"curveText" };
                            mapStepOverlays.push(stepM);
                            mapStepOverlays.push(step);
                        }
                    }

                }
            }

            if(mapTooltipSign){
                mapCommonPart.mapTooltip();//提示信息
            }
            addMapBackStep(mapStepOverlays,"add");
        };
        //改变点的显示样式
        function changeMarkerType(id){
            var oldMarker = markerlayer.markers;
            var restoreMark = [];//要还原点数组
            var oldMarker = markerlayer.markers;
            for(var i=0;i<oldMarker.length;i++){//对应点选中，原选中点恢复
                if(oldMarker[i].showType == "click"){
                    restoreMark.push(oldMarker[i]);
                }
            }
            for(var i=0;i<restoreMark.length;i++){
                var mark = restoreMark[i].baseMsg;
                restoreMark[i].icon.setUrl("/image/gis/marker.svg");
                restoreMark[i].showType = "marker";
                /*markerlayer.removeMarker(restoreMark[i]);
                var conf = { type:"add" };
                addMapOverlays(mark,"marker",conf);*/
            }
            if(id){
                for(var j=0;j<id.length;j++){//对应点选中
                    oldMarker = markerlayer.markers;
                    for(var i=0;i<oldMarker.length;i++){
                        if(oldMarker[i].id == id[j]){
                            var mark = oldMarker[i].baseMsg;
                            oldMarker[i].icon.setUrl("/image/gis/marker-click.svg");
                            oldMarker[i].showType = "click";
                            /*markerlayer.removeMarker(oldMarker[i]);//删除点
                            var conf = { type:"click" };
                            addMapOverlays(mark,"marker",conf);*/
                        }
                    }
                }
            }

        }

        //工具栏菜单-设置
        $("#map_event_visual").click(function(){
            if(!mapShowSign){
                mapShowSign=true;
                $("#mapsetddiv").css("height","20px");
                $("#mapsetddiv").show();
                setTimeout(function(){
                    $("#mapsetddiv").css("height","260px");
                },20);

            }else{
                mapShowSign=false;
                $("#mapsetddiv").hide();
                $("#mapsetddiv").css("height","20px");
                $("svg[type='system']").css("cursor","pointer");
            }

            $("#set_btn").click(function () {
                mapShowSign=false;
                $("#mapsetddiv").hide();
                $("#mapsetddiv").css("height","20px");
                $("svg[type='system']").css("cursor","pointer");
                //确认设置，获得各设置项
                var coverage = $("input[name='coverage']:checked").val();

                //图层设置
                if(coverage=="defaultmap"){//默认图
                    if(mapHeatSign){//热力图==》默认图
                        closeHeatmap();
                        var allOverlays = map.getOverlays();
                        for(var i=0;i<allOverlays.length;i++){
                            if(allOverlays[i].hasOwnProperty("addnode")){
                                allOverlays[i].show();
                            };
                            if(allOverlays[i].hasOwnProperty("linkmarker")){
                                allOverlays[i].show();
                            };
                            if(allOverlays[i].hasOwnProperty("polylineid")){
                                allOverlays[i].show();
                            };
                        }
                        var allOverlays = map.getOverlays();
                        //清除原来的点类型
                        for(var i=0;i<allOverlays.length;i++){
                            if(allOverlays[i].hasOwnProperty("addnode")){
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                                allOverlays[i].getLabel().setStyle({display: "block"});
                            };
                            if(allOverlays[i].hasOwnProperty("linkmarker")){
                                allOverlays[i].show();
                            };
                            if(allOverlays[i].hasOwnProperty("polylineid")){
                                allOverlays[i].show();
                            };
                        }
                        mapSmallSign = false;
                        mapHeatSign = false;
                    }
                    if(mapSmallSign){//小点图==》默认图
                        var allOverlays = map.getOverlays();
                        //清除原来的点类型
                        for(var i=0;i<allOverlays.length;i++){
                            if(allOverlays[i].hasOwnProperty("addnode")){
                                mapSetIcon(allOverlays[i], markerPath, 1, 0, '#33D0FF', 10, 20);
                                allOverlays[i].getLabel().setStyle({display: "block"});
                            };
                            if(allOverlays[i].hasOwnProperty("linkmarker")){
                                allOverlays[i].show();
                            };
                            if(allOverlays[i].hasOwnProperty("polylineid")){
                                allOverlays[i].show();
                            };
                        }
                        mapSmallSign = false;
                        mapHeatSign = false;
                    }
                }else if(coverage=="heatmap"){//热力图
                    if(!mapHeatSign){
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
                                    var point = {"lng":allOverlays[i].gis.lon,"lat":allOverlays[i].gis.lat,"count":28};
                                    points.push(point);
                                };
                            }
                            //清除原来的点类型
                            for(var i=0;i<allOverlays.length;i++){
                                if(allOverlays[i].hasOwnProperty("addnode")){
                                    allOverlays[i].hide();
                                };
                                if(allOverlays[i].hasOwnProperty("linkmarker")){
                                    allOverlays[i].hide();
                                };
                                if(allOverlays[i].hasOwnProperty("polylineid")){
                                    allOverlays[i].hide();
                                };
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
                            }
                        }
                        mapSmallSign = false;
                    }
                }else if(coverage=="smallPointmap"){//小点图
                    if(mapHeatSign){//热力图==》小点图
                        closeHeatmap();
                        mapHeatSign = false;
                    }
                    var allOverlays = map.getOverlays();
                    //清除原来的点类型
                    for(var i=0;i<allOverlays.length;i++){
                        if(allOverlays[i].hasOwnProperty("addnode")){
                            mapSetIcon(allOverlays[i], BMap_Symbol_SHAPE_STAR, 0.3, 0, 'yellow', 2, 2);
                            allOverlays[i].show();
                            allOverlays[i].getLabel().setStyle({display: "none"});
                        };
                        if(allOverlays[i].hasOwnProperty("linkmarker")){
                            allOverlays[i].hide();
                        };
                        if(allOverlays[i].hasOwnProperty("polylineid")){
                            allOverlays[i].hide();
                        };
                    }
                    mapSmallSign = true;
                }
                //显示设置
                var fontlineStatues = [];
                $("input[name='fontline']:checked").each(function(){
                    fontlineStatues.push($(this).val());
                });

                if(fontlineStatues.length==0&&!mapHeatSign&&!mapSmallSign){//显示线 字
                    curveTextLayer.setVisibility(true);
                    vectorLayer.setVisibility(true);
                    lineLayer.setVisibility(true);
                    mapFontStatus = true;
                    mapLineStatus = true;
                }else if(fontlineStatues.length==1&&!mapHeatSign&&!mapSmallSign){
                    if(fontlineStatues[0] == "hideline"){//隐藏连线 显示文字
                        curveTextLayer.setVisibility(true);
                        vectorLayer.setVisibility(true);
                        lineLayer.setVisibility(false);
                        mapFontStatus = true;
                        mapLineStatus = false;
                    }else if(fontlineStatues[0] == "hidefont"){//隐藏文字 显示连线
                        curveTextLayer.setVisibility(false);
                        vectorLayer.setVisibility(false);
                        lineLayer.setVisibility(true);
                        mapFontStatus = false;
                        mapLineStatus = true;
                    }
                }else if(fontlineStatues.length==2&&!mapHeatSign&&!mapSmallSign){
                    /*curveTextLayer.display(false);
                    vectorLayer.display(false);
                    lineLayer.display(false);*/
                    curveTextLayer.setVisibility(false);
                    vectorLayer.setVisibility(false);
                    lineLayer.setVisibility(false);

                    mapFontStatus = false;
                    mapLineStatus = false;
                }

                //聚合设置
                /*var mapAggregation = $("input[name='setAggregation']:checked").val();
                if(mapAggregation == "aggregation"&&!mapHeatSign&&!mapSmallSign){
                    //聚合方法
                    mapSetAggregation("add");
                }else if(mapAggregation != "aggregation"){
                    mapSetAggregation("del");
                }*/

                //主题设置
                /*var maptheme = $("input[name='maptheme']:checked").val();

                if(maptheme == "blue"&&mapthemeType!=maptheme){
                    map.setMapStyle({styleJson:mapJsonStyle});
                    mapthemeType=maptheme;
                }else if(maptheme == "black"&&mapthemeType!=maptheme){
                    map.setMapStyle({style:'midnight'});
                    mapthemeType=maptheme;
                }else if(maptheme == "white"&&mapthemeType!=maptheme){
                    map.setMapStyle({style:'normal'});
                    mapthemeType=maptheme;
                }*/

            })
            $("#ret_btn").click(function () {//取消设置
                mapShowSign=false;
                $("#mapsetddiv").hide();
                $("#mapsetddiv").css("height","20px");
                $("svg[type='system']").css("cursor","pointer");
            })

        });
        //轨迹设置
        $("#map_path_ensure").bind("click",function(){
            $(".map_path").css("height","40px");
            $(".map_path").css("overflow","hidden");

            var startTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[0].trim() : "";
            var endTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[1].trim() : "";

            // 轨迹类型
            var trackStatues = [];
            $("input[name='mapPath']:checked").each(function(){
                trackStatues.push($(this).val());
            });

            var basePoint = new BMap.Point(mapPathBasePoint.gis.lon, mapPathBasePoint.gis.lat);
            var Id = mapPathBasePoint.id;
            var nodeType = mapPathBasePoint.baseMsg.type;
            var nodeId = mapPathBasePoint.baseMsg.nodeId;

            // 删除mapPathBasePoint 原来有的轨迹
            /*var allOverlays = map.getOverlays();
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
            }*/

            //后台请求，获得轨迹的数据
            for(var i=0;i<trackStatues.length;i++){
                if(trackStatues[i] == "pathAppearSite"){//出现地点
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
                if(trackStatues[i] == "pathMigratory"){//迁徙轨迹
                    $.ajax({
                        url: EPMUI.context.url + '/object/path/gis',
                        type: 'get',
                        data: {
                            objectId: Id,
                            objectType: nodeType,
                            beginTime: startTime,
                            endTime:endTime,
                            pathType:"pathMigratory"
                        },
                        dataType: 'json',
                        success: function (data) {
                            if (data.code == "200") {
                                console.log("需要实现轨迹操作")
                                return '';
                                var addData = data.magicube_interface_data;
                                var points = [];
                                var mapStepOverlays = [];
                                var firstPoint = basePoint;//这个用来存放两点中的起点

                                var allPathLUSHU = [];//给路书的所有path
                                window.lushunum = 0;
                                for (var k = 0; k < addData.length; k++) {

                                    var point = new BMap.Point(addData[k].gis[0], addData[k].gis[1]);
                                    points.push(firstPoint);
                                    points.push(point);
                                    var twoId = {
                                        one: Id,
                                        two: "first",
                                        address: addData[k].address
                                    };
                                    var curve = new BMapLib.CurveLine(twoId, "first", points, {
                                        strokeColor: "#D75C22",
                                        strokeWeight: 1,
                                        strokeOpacity: 0.9
                                    }); //创建弧线对象
                                    map.addOverlay(curve); //添加到地图中
                                    curve.enableEditing(); //开启编辑功能
                                    points = [];
                                    firstPoint = point;

                                    var retpath = curve.getPath();
                                    for(var p=0;p<retpath.length;p++){
                                        allPathLUSHU.push(retpath[p]);
                                    }
                                    var iconImg;
                                    if(addData[k].hasOwnProperty("tripMode")){
                                        if(addData[k].tripMode == "car"){
                                            iconImg = gisMoveImages[1];
                                        }
                                        if(addData[k].tripMode == "airplane"){
                                            iconImg = gisMoveImages[0];
                                        }
                                        if(addData[k].tripMode == "train"){
                                            iconImg = gisMoveImages[2];
                                        }
                                    }
                                    lushuStart(Id,retpath,iconImg,k);
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
            }

        });
        //轨迹取消
        $("#map_path_cancel").bind("click",function(){
            $(".map_path").hide();
        });
        //鼠标选区操作 按钮控制
        $("#map_tool").click(function(){
            $("#map_tool_div").remove();
            //添加一个选区的div
            var container = document.createElement("div");
            container.className = "BMapLib_Drawing";
            container.id = "map_tool_div";
            //用来设置外层边框阴影
            var panel = document.createElement("div");
            panel.className = "BMapLib_Drawing_panel";

            var panelattr = document.createAttribute("data-dojo-type");
            panelattr.value = "dijit/layout/ContentPane";
            panel.setAttributeNode(panelattr);

            var pattr = document.createAttribute("data-dojo-props");
            pattr.value = "region:'top'";
            panel.setAttributeNode(pattr);

            /*if (this.drawingToolOptions && this.drawingToolOptions.scale) {
             this._setScale(this.drawingToolOptions.scale);
             }*/
            container.appendChild(panel);

            var htmldata = '<a class="BMapLib_box BMapLib_hander_hover icon-arrows" drawingType="hander" href="javascript:void(0)" '+
                'title="拖拽地图" onfocus="this.blur()"> 拖拽地图</a><br>'+
                '<a class="BMapLib_box BMapLib_circle icon-circle-o" data-dojo-type="dijit/form/Button" drawingType="circle"'+
                ' href="javascript:void(0)" title="圆形选区" onfocus="this.blur()"> 圆形选区</a><br>'+
                '<a class="BMapLib_box BMapLib_polygon icon-polygon-o" data-dojo-type="dijit/form/Button" drawingType="polygon"'+
                ' href="javascript:void(0)" title="多边选区" onfocus="this.blur()"> 多边选区</a><br>';
            // 添加内容
            panel.innerHTML = htmldata;
            // 添加DOM元素到地图中
            $(container).appendTo($("#basemap"));
            $(".BMapLib_Drawing_panel").css("z-index","10000");
            $(".BMapLib_box").on('click', function (e) {
                var drawingType = $(this).attr('drawingType');
                var boxs = $(".BMapLib_box").children("button").prevObject;

                for (var i = 0, len = boxs.length; i < len; i++) {
                    var box = boxs[i];
                    if (box.getAttribute('drawingType') == drawingType) {
                        if(drawingType == "circle"){
                            var classStr = 'BMapLib_box BMapLib_' + drawingType +'_hover icon-circle-o';
                        }else if(drawingType == "polygon"){
                            var classStr = 'BMapLib_box BMapLib_' + drawingType +'_hover icon-polygon-o';
                        }else if(drawingType == "rectangle"){
                            var classStr = 'BMapLib_box BMapLib_' + drawingType +'_hover icon-square-o-big';
                        }else if(this.drawingType == "hander"){
                            var classStr = 'BMapLib_box BMapLib_' + drawingType +' icon-arrows';
                        }else {
                            var classStr = 'BMapLib_box BMapLib_' + drawingType +'_hover icon-arrows';
                        }
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


            //var toolbar = new esri.toolbars.Draw(map);
            //toolbar.on("draw-complete", addToMap);//draw-end

            function activateTool(drawingType) {
                if(drawingType == "circle"){//new esri.symbol.

                }
                if( drawingType == "polygon"){

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

                //把右侧控制的选项调回拖拽地图
                var changeDrawingType = "hander";
                var boxs = $(".BMapLib_box").children("button").prevObject;

                for (var i = 0, len = boxs.length; i < len; i++) {
                    var box = boxs[i];
                    if (box.getAttribute('drawingType') == changeDrawingType) {
                        var classStr = "BMapLib_box BMapLib_" + changeDrawingType + "_hover icon-arrows";
                        if (i == len - 1) {
                            classStr += " BMapLib_last";
                        }
                        box.className = classStr;
                    } else {
                        box.className = box.className.replace(/_hover/, "");
                    }
                }

            }


            //调整div的位置
            $(".BMapLib_Drawing_panel").css("height","75px");
            if(mapRight){
                var _width = $("#topology_message").css('width');
                $(".BMapLib_Drawing_panel").css("right",parseInt(_width)+ 26 + 'px');
            }else{
                $(".BMapLib_Drawing_panel").css("right",26 + 'px');
            }
            if(!arcgisToolSign){
                arcgisToolSign=true;

                $(".BMapLib_Drawing_panel").show();

            }else{
                arcgisToolSign=false;

                $(".BMapLib_Drawing_panel").hide();
                $("svg[type='system']").css("cursor","pointer");
            }
        });
        //设置地图基本属性
        window.setmapProperty = function (drag, zoom, dblClick){
            if(drag == "drag-true"){
            }else if(drag == "drag-false"){
            }
            /*if(zoom == "zoom-true"){
                map.enableScrollWheelZoom(); //启用滚轮放大缩小，默认禁用
            }else if(zoom == "zoom-false"){
                map.disableScrollWheelZoom(); //禁用 滚轮放大缩小
            }
            if(dblClick == "dbl-true"){
                map.enableDoubleClickZoom(); //启用鼠标双击放大
            }else if(dblClick == "dbl-false"){
                map.disableDoubleClickZoom(true);   //禁用双击放大
            }*/
        };
        //添加点和线
        window.addMapPointLine = function (gisNodesData,basemarker,multiSign) {
            var mapTooltipSign = false;
            var gislinks = [];
            for (var i = 0; i < gisNodesData.length; i++) {
                if(basemarker){
                    var basemarkerId;
                    var basemarkerGis;
                    var basemarkerMsg;
                    if(multiSign){
                        basemarkerId = gisNodesData[i].source.id;
                        basemarkerGis = gisNodesData[i].source.gis;
                        basemarkerMsg = gisNodesData[i].source;
                    }else{
                        basemarkerId = basemarker[0].id;
                        basemarkerGis = basemarker[0].gis;
                        basemarkerMsg = basemarker[0].baseMsg;
                    }

                    if(gisNodesData[i].tag == "-20"){
                        var gislink = {
                            relationTypeName: gisNodesData[i].relationTypeName,
                            relationId:gisNodesData[i].relationId,
                            relationParentType:gisNodesData[i].relationParentType,
                            time: gisNodesData[i].time,
                            tag: gisNodesData[i].tag,
                            target: {
                                addnode: true,
                                gis: basemarkerMsg.gis,
                                id: basemarkerMsg.id,
                                name: basemarkerMsg.name,
                                nodeId: basemarkerMsg.nodeId,
                                objectType: basemarkerMsg.objectType,
                                type: basemarkerMsg.type
                            },
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
                        gislinks.push(gislink);
                    }else{ // gisNodesData[i].tag == "20" 或者不存在
                        var gislink = {
                            relationTypeName: gisNodesData[i].relationTypeName,
                            relationId:gisNodesData[i].relationId,
                            relationParentType:gisNodesData[i].relationParentType,
                            time: gisNodesData[i].time,
                            tag: gisNodesData[i].tag,
                            source: {
                                addnode: true,
                                gis: basemarkerMsg.gis,
                                id: basemarkerMsg.id,
                                name: basemarkerMsg.name,
                                nodeId: basemarkerMsg.nodeId,
                                objectType: basemarkerMsg.objectType,
                                type: basemarkerMsg.type
                            },
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
                        gislinks.push(gislink);
                    }
                }
            }
            addMapMarkerLine(gisNodesData,gislinks);
            if(mapTooltipSign){
                mapCommonPart.mapTooltip();//提示信息
            }
        };
        //地图信息保存
        window.mapSaveLocalStorage = function () {
            localStorage.removeItem("mapOverlays");
            var allOverlays = markerlayer.markers;
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
                            name: allOverlays[j].baseMsg.name,
                            nodeId: allOverlays[j].baseMsg.nodeId,
                            addnode: allOverlays[j].addnode,
                            gis: allOverlays[j].gis,
                            nogis: true,
                            addnode: true
                        };
                    }else{
                        obj = {
                            id: allOverlays[j].id,
                            type: allOverlays[j].type,
                            objectType: allOverlays[j].baseMsg.objectType,
                            name: allOverlays[j].baseMsg.name,
                            nodeId: allOverlays[j].baseMsg.nodeId,
                            addnode: allOverlays[j].addnode,
                            gis: allOverlays[j].gis,
                            addnode: true
                        };
                    }

                    mapOverlaysMarker.push(obj);
                }
            }

            var allLines = lineLayer.features;
            for(var k=0;k<allLines.length;k++) {
                var allLinesAttrs = allLines[k].attrs;
                if (allLinesAttrs.hasOwnProperty("relationId")) {
                    var obj = {
                        relationId:allLinesAttrs.relationId,
                        relationParentType:allLinesAttrs.relationParentType,
                        id: allLinesAttrs.polylineid,
                        relationTypeName: allLinesAttrs.relationTypeName,
                        time: allLinesAttrs.time,
                        target: allLinesAttrs.target,
                        source: allLinesAttrs.source,
                        tag:allLinesAttrs.tag
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
        //对应地图TopoMenu的方法：
        window.mapOwnFun = {
            /**
             * mapAddTopoMenu        : 添加操作菜单div到地图
             * mapRemoveTopoMenu     : 菜单-删除 功能
             * mapMoveTopoMenu       :
             * mapSaveTopoMenu       :
             * mapCheckTopoMenu      : 菜单-查看 功能
             * mapOffTopoMenu        : 菜单-取消 功能
             * mapExtendTopoMenu     : 菜单-扩展 功能
             * mapMoreExtendTopoMenu : 菜单-扩展-更多 功能
             * mapPathTopoMenu       : 菜单-轨迹设置
             */
            mapAddTopoMenu:function(div){
                div.style.zIndex = "9999";
                $(div).appendTo(markerlayer.div);
            },
            mapRemoveTopoMenu:function(ck){
                d3.select("#newDiv").remove();
                mapdisk = false;
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
                d3.select("#newDiv").remove();     //markerlayer
                let nowMarker = mapCommon.mapWorkMarker[0];
                nowMarker.events.on({
                    "mousemove":nowMarkerMarker,
                    /*"move":nowMarkerMarker,*/
                    "scope": nowMarker
                });
            },
            mapSaveTopoMenu:function(thisMarker){
                var propertyName;
                if(thisMarker.type == "PERSON"){
                    propertyName = "PERSONAL_GISINFO";
                }else{
                    propertyName = thisMarker.type + "_GISINFO";
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
                    ],
                    "id": thisMarker.id,
                    "type": thisMarker.type
                };

                $.post(EPMUI.context.url + '/object/detailInformation', {modifyJson: JSON.stringify(editObject)}, function (data) {
                    if (!data) {
                        return false;
                    }
                    var datas = JSON.parse(data);

                    if (parseInt(datas.code) === 200) {
                        thisMarker.disableDragging();   // 不可拖拽thisMarker.enableDragging(false);
                        mapSetIcon(thisMarker, markerPathPeople, 0.6, 0, 'red', 20, 42);
                        showAlert("提示!", datas.message, "#33d0ff");
                    } else {
                        showAlert("提示!", datas.message, "#ffc000");
                    }
                })
                d3.select("#newDiv").remove();
                map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
                map.enableDoubleClickZoom();//启用鼠标双击放大

            },
            mapCheckTopoMenu:function(){
                d3.select("#newDiv").remove();
                mapSaveLocalStorage();
            },
            mapOffTopoMenu:function(){
                d3.select("#newDiv").remove();
            },
            mapExtendTopoMenu:function(thisMarker, extendSign){
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
                            type: shiftGraphic[t].baseMsg.type,
                            baseMsg: baseMsg
                        };
                        Id.push(shiftGraphic[t].baseMsg.id);
                        nodeType.push(shiftGraphic[t].baseMsg.type);
                        nodeId.push(shiftGraphic[t].baseMsg.nodeId);

                        mapMainRadrawMarkers.push(newMarker);
                    }
                    mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "multi", Id, nodeType, nodeId, extendSign);
                    Id = [];
                    nodeType = [];
                    nodeId = [];
                    setTimeout(function () {
                        shiftGraphic = [];
                    },1000);
                }else{
                    var mapMainRadrawMarkers = [];
                    mapMainRadrawMarkers.push(thisMarker);
                    mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", Id, nodeType, nodeId, extendSign);
                }
            },
            mapMoreExtendTopoMenu:function(mapMainRadrawMarkers, Id, nodeType, nodeId, systemId){
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", Id, nodeType, nodeId, systemId);
            },
            mapPathTopoMenu:function(mapPathPoint){
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
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
                var content = '<div id="newDiv" class="newDiv"><svg class="complexCustomOverlay" style="cursor:pointer;" > </svg></div>';
                var label = new BMap.Label(content,{offset:new BMap.Size(-211,-209)});
                label.setStyle({backgroundColor: "rgba(0,0,0,0)",border:"#1E262F"});
                marker.setLabel(label);
                marker.disableDragging();           // 不可拖拽
                marker.dblmarker = true;
                marker.setTop(true);
            },
            mapClickAreaMenu:function(e, sign){
                if(e.overlay.hasOwnProperty("radius")){
                    mapSelectArea(e.overlay.multipleEntity,"circle", sign);
                }
                if(e.overlay.hasOwnProperty("Polygon")){
                    mapSelectArea(e.overlay.multipleEntity,"Polygon", sign);
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
                for (var i=0;i<multipleEntity.length;i++){
                    Id.push(multipleEntity[i].id);
                    nodeType.push(multipleEntity[i].baseMsg.type);
                    nodeId.push(multipleEntity[i].baseMsg.nodeId);
                }
                mapCommonPart.mapMainRadraw(multipleEntity, thir, Id, nodeType, nodeId, sign);
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
                        mapSelectArea(e.overlay.multipleEntity,"circle","delInPoint");
                    }
                    if(e.overlay.hasOwnProperty("Polygon")){
                        mapSelectArea(e.overlay.multipleEntity,"Polygon","delInPoint");
                    }
                }
                if (sign == 2) {// 删除外点
                    if(e.overlay.hasOwnProperty("radius")){
                        mapSelectArea(e.overlay.multipleEntity,"circle","delOutPoint");
                    }
                    if(e.overlay.hasOwnProperty("Polygon")){
                        mapSelectArea(e.overlay.multipleEntity,"Polygon","delOutPoint");
                    }
                }
                d3.select("#newDiv").remove();
                map.enableScrollWheelZoom();	//启用滚轮放大缩小，默认禁用
                map.enableDoubleClickZoom();//启用鼠标双击放大
                $("svg[type='system']").css("cursor","pointer");

            }

        }

        function getNum(s){
            return s.replace(/[^0-9]/ig,"")
        }

        function nowMarkerMarker(e){
            let ex = e.movementX;
            let ey = e.movementY;

            let oldLeft = getNum($(e.element).css("left"));
            let oldTop = getNum($(e.element).css("top"));

            console.log("eeeeeeeee  == = == = ");
            console.log(e);
            console.log("oldLeft ==="+oldLeft);
            console.log("oldTop ==="+oldTop);

            $(e.element).css("left",ex+oldLeft+"px").css("top",ey+oldTop+"px");

        }


        //加载在线地图
        this.runOnline = function () {
            // jsx中导入 dist/include-openlayers.js 该js文件
            map = new ol.Map({
                target: 'basemap',
                controls: ol.control.defaults({attributionOptions: {collapsed: false},zoom: false}),
                view: new ol.View({
                    center: [116, 40],
                    zoom: 5,
                    projection: 'EPSG:4326'
                })
            });
            var layer = new ol.layer.Tile({
                source: new ol.source.TileSuperMapRest({
                    url: url,
                    wrapX: true
                }),
                projection: 'EPSG:4326'
            });
            map.addLayer(layer);

            addPointOnline();

        }
        //加点
        function addPointOnline(){
            //添加点图层
            var addPointsSource = new ol.source.Vector({
                wrapX: false
            });
            addPointsLayer = new ol.layer.Vector({
                source: addPointsSource,
            });

            map.addLayer(addPointsLayer);

            console.log("加点功能supermap。");
            var point = [101 , 22];
            var geomPoint = new ol.geom.Point(point);
            geomPoint.set("name","hello");
            var pointFeature = new ol.Feature(geomPoint);
            pointFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: [255, 0, 0, 0.5]
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'red',
                        width: 2
                    }),
                    radius: 8
                })
            }));

            pointFeature.on('click',function () {
                console.log("1112344")
                console.log(this);
                console.log(this.get("name"));
            })


            pointFeature.setProperties({POP: 1, CAPITAL: 'test'});
            //判断添加点图层已添加到地图，避免重复添加图层，只对一个图层进行数据更新操作：
            addPointsSource.addFeature(pointFeature);


        }



    }
})();