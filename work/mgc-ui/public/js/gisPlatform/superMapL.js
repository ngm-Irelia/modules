/**
 * Created by ngm on 2017/12/5.
 */
var SuperMapNgm = window.SuperMapNgm = SuperMapNgm || {};

(function() {
    SuperMapNgm.superMapNgm = superMapNgm;
    function superMapNgm() {
        let map,
            markerGroup,//点图层
            curveGroup,//线条图层
            areaGroup,//区域图层
            trackGroup,//轨迹图层
            textLayer,//点上文字图层
            curveTextLayer;//线上文字图层

        let layer, markerlayer,imgLayer,
            vectorLayer, lineLayer, strategy,curveTextStrategy,
            //url =  "http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/ChinaDark";
            //url =  "http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China";
            //url = "http://117.122.248.69:8090/iserver/services/map-world/rest/maps/世界地图_Gray";
            url = "http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326";
            //url =  "http://support.supermap.com.cn:8090/iserver/services/map-world/rest/maps/World";

        let noGisPoints = [];//存放无经纬度的点
        let mapHeatSign = false;//热力图
        let mapSmallSign = false;//点状图
        let lineShowHideTime = [];//鼠标悬停计数器
        let allCurveText = [];//所有线上文字
        let hideCurveText = [];//隐藏的线上文字
        let hideText = [];//隐藏的文字
        let drawControl; //选区控件
        let arcgisToolSign = false;//选区标志
        let mapdisk = false;
        let shiftSign = false;
        let lineNames = [];//线条关系数组
        let mapShowSign = false;//判断设置菜单显示隐藏
        let mapFontStatus = true;// 文字显示
        let mapLineStatus = true;// 线条显示
        let mapPathSgin = false;//地图轨迹标志
        let mapPathBasePoint;//地图轨迹基本点信息
        let trackMarker;//轨迹移动的点
        let trackInterval = [];//轨迹的所有计时器
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

        var peopleMoveSign = false;//跨省人员流动标志
        var areaStatisticsSign = false;//区域统计的标志
        var areaStatisticsSignClick = false;//区域统计 是否点击标志
        var markerClustererSign = false;//聚合标志

        var shiftGraphic = [];// 存放shift状态下graphic的信息
        window.mapAdvanceSearchFlag = localStorage.mapAdvanceSearchFlag ? localStorage.mapAdvanceSearchFlag : "false";

        //加载地图
        this.run = function () {
            mapload = true;
            map = L.map('basemap', {
                crs: L.CRS.EPSG4326,
                preferCanvas: true,
                center: {lon: 106, lat: 41},
                maxZoom: 15,
                zoom: 4,
                zoomControl:false
            });
            L.supermap.tiledMapLayer(url).addTo(map);
            markerGroup = L.featureGroup().addTo(map);
            curveGroup = L.featureGroup().addTo(map);
            areaGroup = L.featureGroup().addTo(map);
            trackGroup = L.featureGroup().addTo(map);

            addLayer("textLayer");
            addLayer("curveTextLayer");

            map.on("drag",function(e){
                d3.selectAll("#newDiv").remove();

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

            });
            map.on("dblclick",function(){
                //d3.selectAll("#newDiv").remove();
            });
            map.on("zoomstart",function(){
                d3.selectAll("#newDiv").remove();
            });

            this.mapLeftSelect();
            this.addLocalStorageMarker();//添加localstorage中点
        };
        //添加搜索页面地图
        this.searchMapRun = function () {
            mapload = true;
            map = L.map('searchMap', {
                crs: L.CRS.EPSG4326,
                preferCanvas: true,
                center: {lon: 106, lat: 41},
                maxZoom: 15,
                zoom: 4,
                zoomControl:false
            });
            L.supermap.tiledMapLayer(url).addTo(map);
            markerGroup = L.featureGroup().addTo(map);
            curveGroup = L.featureGroup().addTo(map);
            areaGroup = L.featureGroup().addTo(map);
            trackGroup = L.featureGroup().addTo(map);

            addLayer("textLayer");
            addLayer("curveTextLayer");

            map.on("drag",function(e){
                d3.selectAll("#newDiv").remove();

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
                    $(".map_path").css("height","40px").css("overflow","hidden");
                }

            });
            map.on("dblclick",function(){
                //d3.selectAll("#newDiv").remove();
            });
            map.on("zoomstart",function(){
                d3.selectAll("#newDiv").remove();
            });

            window.searchMapSize = function(){
                map.invalidateSize(this);
            };
            searchMapAddDraw();
        };
        //添加画选区的功能
        function searchMapAddDraw(){
            let options = {
                position: 'topleft',
                draw: {
                    polyline: false,
                    polygon: {
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    circle: {
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    rectangle: {
                        shapeOptions: {
                            clickable: false
                        }
                    },
                    circlemarker:false,
                    marker: false
                },
                edit: false
            };
            drawControl = new L.Control.Draw(options);
            map.addControl(drawControl);

            $(".leaflet-draw-draw-circle").addClass("icon-circle-o");
            $(".leaflet-draw-draw-rectangle").addClass("icon-square-o-big");
            $(".leaflet-draw-draw-polygon").addClass("icon-polygon-o");

            map.on('draw:drawstop', function (e) {
                $(".leaflet-draw-draw-circle span").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-circle").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-rectangle span").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-rectangle").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-polygon span").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-polygon").removeClass("supermap_draw_active");
            });
            map.on('draw:drawstart', function (e) {
                $(".leaflet-draw-actions").css("display","none");
                switch (e.layerType){
                    case "polygon":
                        $(".leaflet-draw-draw-polygon span").addClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon").addClass("supermap_draw_active");

                        $(".leaflet-draw-draw-rectangle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-rectangle").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle").removeClass("supermap_draw_active");
                        break;
                    case "rectangle":
                        $(".leaflet-draw-draw-rectangle span").addClass("supermap_draw_active");
                        $(".leaflet-draw-draw-rectangle").addClass("supermap_draw_active");

                        $(".leaflet-draw-draw-polygon span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle").removeClass("supermap_draw_active");
                        break;
                    case "circle":
                        $(".leaflet-draw-draw-circle span").addClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle").addClass("supermap_draw_active");

                        $(".leaflet-draw-draw-rectangle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-rectangle").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon").removeClass("supermap_draw_active");
                        break;
                }
            });

            //修改操作栏的样式
            $(".leaflet-top").css("top",30 + 'px');
            //$(".leaflet-draw-toolbar-top").css("width",100 + 'px');
            /*$(".leaflet-draw-draw-polygon span").removeClass("sr-only").addClass("supermap_draw").html("多边形");
            $(".leaflet-draw-draw-rectangle span").removeClass("sr-only").addClass("supermap_draw").html("正方形");
            $(".leaflet-draw-draw-circle span").removeClass("sr-only").addClass("supermap_draw").html("圆形");*/

            //操作栏tab切换
            $(".message_tab_list").off().on('click', function () {
                var index = $(this).index();
                $(this).addClass("topology_message_tab_active").siblings().removeClass("topology_message_tab_active");
                $(".topo_message").css("display", "none").eq(index).css("display", "block");
            });

            handleMapEvent(drawControl._container, map);
            map.on(L.Draw.Event.CREATED, function (e) {
                let type = e.layerType,
                    layer = e.layer;
                layer.areaType = type;
                areaGroup.addLayer(layer);
                layer.on({
                    "click":searchMapClickDraw,
                    "mouseover":searchMapMouseoverDraw,
                    "mouseout":searchMapMouseoutDraw
                });

                if(type === "circle"){
                    let selectMapCricle = {
                        radius:layer._mRadius,
                        lon:layer._latlng.lng,
                        lat:layer._latlng.lat
                    };
                    mapAreaValue.push(selectMapCricle);
                }else{
                    let latlngs = layer._latlngs[0];
                    let lats = [];
                    let lngs = [];
                    latlngs.forEach(ll => {
                        lats.push(ll.lat);
                        lngs.push(ll.lng);
                    });

                    let selectMapSquare = {
                        lon:lngs,
                        lat:lats
                    };

                    mapAreaValue.push(selectMapSquare);
                }
            });

            function handleMapEvent(div, map) {
                if (!div || !map) {
                    return;
                }
                div.addEventListener('mouseover', function () {
                    map.scrollWheelZoom.disable();
                    map.doubleClickZoom.disable();
                });
                div.addEventListener('mouseout', function () {
                    map.scrollWheelZoom.enable();
                    map.doubleClickZoom.enable();
                });
            }

            function searchMapClickDraw(e){
                console.log("e ---this ")
                console.log(e);
                console.log(this);
                let _that = this;
                $("#newDiv").remove();
                $("#newDivdelMarker").remove();
                var div = document.createElement("div");
                div.setAttribute("id", "newDiv");
                div.style.position = "absolute";
                div.style.left = e.x+15 + "px";
                div.style.top = e.y-50 + "px";
                div.style.fontSize = "12px";

                var svg = $("<div id='newDivdelMarker' class='newDivdelMarker'>删除选区</div>").appendTo(div);
                $(div).appendTo($("#searchMap"));

                $("#newDivdelMarker").bind("click",function () {
                    areaGroup.removeLayer(_that);
                    $("#newDiv").remove();
                    $("#newDivdelMarker").remove();
                    map.doubleClickZoom.enable();
                })
            }
            function searchMapMouseoverDraw(e){
                map.doubleClickZoom.disable();
            }
            function searchMapMouseoutDraw(e){
                map.doubleClickZoom.enable();
            }
        }
        // 添加localStorage()中的点,历史保留点
        this.addLocalStorageMarker = function (){
            let historyDatas = localStorage.mapOverlays ? JSON.parse(localStorage.mapOverlays): "false";//跳转出保存的缓存数据
            if(historyDatas !== "false" ){
                addMapMarkerLine(historyDatas.overlaysMarker,historyDatas.overlaysLine);
            }
            let localStorageMarker = localStorage.searchAddNode ? JSON.parse(localStorage.searchAddNode) : "false";
            if(localStorageMarker !== "false"){
                let localStorageMarkerId = [];
                let localStorageMarkerType = [];
                //循环，加点
                for (let i = 0; i < localStorageMarker.length; i++) {
                    localStorageMarkerId.push(localStorageMarker[i].id);
                    localStorageMarkerType.push(localStorageMarker[i].type);
                }
                mapCommonPart.getmapGis(localStorageMarker, localStorageMarkerId, localStorageMarkerType, false);// 获取gis信息
            }
        };
        //左侧搜索框
        this.mapLeftSelect = function () {
            let mapSet = mapCommonPart.addSearchModule();//建立dom元素
            $("#basemap").append(mapSet);// 添加DOM元素到地图中
            $(".map_select").css("z-index","999");
            let mapstyle = mapCommonPart.getCookie("theme");
            if(mapstyle === "white"){
                $(".map_select_btn").removeClass("map_select_btn_background").css("background","#fff").css("border","1px soloid #23b9e7");
            }
            mapCommonPart.searchModuleEvent();//搜索框绑定事件
            // 左侧搜索框点击选中
            window.mapSearchResult = function (datasetid) {
                if(!mapSmallSign&&!mapHeatSign){
                    let idArr = [datasetid];
                    changeMarkerType(idArr);
                }
            };
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

                    let addMarkerText = [];
                    if(textLayer.hasOwnProperty("labelFeatures")){
                        for(let i=0;i<textLayer.labelFeatures.length;i++){
                            let oldattr = textLayer.labelFeatures[i].attributes;
                            let oldF = L.supermap.themeFeature([oldattr.gis.lat, oldattr.gis.lon, oldattr.name], oldattr);
                            addMarkerText.push(oldF);
                        }
                    }
                    addMarkerText.push(markerText);
                    map.hasLayer(textLayer) ? map.removeLayer(textLayer) : null;//删除图层
                    addLayer("textLayer");
                    textLayer.addFeatures(addMarkerText);
                    map.panTo(map.getCenter());

                    var step = { data:marker, type:"marker" };
                    var stepMText = { data:markerText, type:"markerText" };
                    mapStepOverlays.push(step);
                    mapStepOverlays.push(stepMText);
                    addMapBackStep(mapStepOverlays,"dragadd");

                    if(gisDatas.hasOwnProperty("nogis")){
                        mapCommonPart.mapTooltip();//提示信息
                    }

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

            map.dragging.enable();
        };
        this.addPoint = function (gisnodes, gislinks){
            mapStep = [];
            mapStepType = [];
            mapStepNum = 0;
            addMapMarkerLine(gisnodes,gislinks);
        };
        //过滤器
        this.filterMapMarker = function (relationArr,sign){
            if(sign === "relation"){ //关系过滤
                var allLines = curveGroup.getLayers();
                console.log("获取地图上所有线条:");
                console.log(allLines);
                var selectedId = [];
                for(let j=0;j<relationArr.length;j++){
                    for(let k=0;k<allLines.length;k++) {
                        let allLinesAttrs = allLines[k].attrs;
                        if (allLinesAttrs.relationTypeName === relationArr[j]) {
                            selectedId.push(allLinesAttrs.source.id);
                            selectedId.push(allLinesAttrs.target.id);
                        }
                    }
                }
                selectedId = [...new Set(selectedId)];
                changeMarkerType(selectedId);
            }else if(sign === "node"){ //节点过滤
                changeMarkerType(relationArr);
            }
        };
        //搜索
        this.searchNodes = function (){
            let val = $(".map_nodes_find").val();
            if(val){
                let markers = markerGroup.getLayers();// 获取地图上所有点
                let n = markers.filter(function(d){
                    return d.baseMsg.name.indexOf(val)>-1?true:false;
                });
                if (n.length>0) {
                    let nodesIdArr = [];
                    for(let j=0;j<n.length;j++){
                        nodesIdArr.push(n[j].id);
                    }
                    changeMarkerType(nodesIdArr);
                }else {
                    changeMarkerType(false);
                }
            }else{
                changeMarkerType(false);
            }
        };
        //清屏功能
        this.resetscreen = function () {
            let allLines = curveGroup.getLayers();
            console.log(allLines)

            curveGroup.clearLayers();
            markerGroup.clearLayers();

            map.removeLayer(curveTextLayer);
            map.removeLayer(textLayer);
            addLayer("curveTextLayer");
            addLayer("textLayer");
            //清空后退数组
            mapStep = [];
            mapStepType = [];
            mapStepNum = 0;
            localStorage.removeItem("topoNodes");
        };
        //后退
        this.backStep = function () {
            if(mapStepNum>0){
                if(mapStepType[mapStepNum-1] === "add"){//删除对应点
                    let del = mapStep[mapStepNum-1];
                    let delMarker = [];//删除对应点
                    let delmtext = [];//删除文字
                    let delLine = [];//删除线条
                    let delctext = [];//删除线上文字
                    let markers = markerGroup.getLayers();// 获取地图上所有点
                    let mtext = textLayer.hasOwnProperty("labelFeatures") ? textLayer.labelFeatures : [];
                    let line = curveGroup.getLayers();
                    let ctext = curveTextLayer.hasOwnProperty("labelFeatures") ? curveTextLayer.labelFeatures : [];

                    let restText = [],//剩余文字
                        restCurveText = [];//剩余线上文字*/
                    for(let n = 0;n<del.length;n++){
                        if(del[n].type === "marker"){
                            for(let i=0;i<markers.length;i++){
                                markers[i].id === del[n].data.id ? delMarker.push(markers[i]) : null;
                            }
                        }
                        if(del[n].type === "markerText"){
                            for(let i=0;i<mtext.length;i++){
                                mtext[i].attributes.id === del[n].data.attributes.id ? delmtext.push(mtext[i]) : null;
                            }
                        }
                        if(del[n].type === "curve"){
                            for(let i=0;i<line.length;i++){
                                let lineSid= line[i].attrs.source.id;
                                let lineTid= line[i].attrs.target.id;
                                if(lineSid === del[n].data.attrs.source.id || lineTid === del[n].data.attrs.target.id){
                                    delLine.push(line[i]);
                                }
                            }
                        }
                        if(del[n].type === "curveText"){
                            for(let i=0;i<ctext.length;i++){
                                let ctextSid= ctext[i].attributes.source.id;
                                let ctextTid= ctext[i].attributes.target.id;
                                if(ctextSid === del[n].data.attributes.source.id || ctextTid === del[n].data.attributes.target.id){
                                    delctext.push(ctext[i]);
                                }
                            }
                        }
                    }
                    //获得保留下来的 mtext和ctext
                    for(let i=0;i<mtext.length;i++){
                        let restTextSign = true;
                        let oldattr = mtext[i].attributes;
                        for(let j=0;j<delmtext.length;j++){
                            let delmtextAttr = delmtext[j].attributes;
                            if(oldattr.id === delmtextAttr.id){
                                restTextSign = false;
                            }
                        }
                        if(restTextSign){
                            restText.push(mtext[i]);
                        }
                    }
                    for(let i=0;i<ctext.length;i++){
                        let restCurveTextSign = true;
                        let oldattr = ctext[i].attributes;
                        for(let j=0;j<delctext.length;j++){
                            let delctextAttr = delctext[j].attributes;
                            if(oldattr.source.id === delctextAttr.source.id && oldattr.target.id === delctextAttr.target.id){
                                restCurveTextSign = false;
                            }
                        }
                        if(restCurveTextSign){
                            restCurveText.push(ctext[i]);
                        }
                    }
                    //进行删除
                    delMarker.forEach( delm => markerGroup.removeLayer(delm) );
                    delLine.forEach( dell => curveGroup.removeLayer(dell) );
                    map.hasLayer(curveTextLayer) ? map.removeLayer(curveTextLayer) : null;//删除图层
                    addLayer("curveTextLayer");
                    curveTextLayer.addFeatures(restCurveText);
                    map.hasLayer(textLayer) ? map.removeLayer(textLayer) : null;//删除图层
                    addLayer("textLayer");
                    textLayer.addFeatures(restText);
                    map.panTo(map.getCenter());
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapStepType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapStepType[mapStepNum-1] === "dragadd"){//删除拖拽点
                    let del = mapStep[mapStepNum-1];
                    let delMarker = [];//删除对应点
                    let delmtext = [];//删除文字
                    let markers = markerGroup.getLayers();// 获取地图上所有点
                    let mtext = textLayer.hasOwnProperty("labelFeatures") ? textLayer.labelFeatures : [];
                    console.log(mtext);
                    console.log(del);
                    let restText = [];//剩余文字
                    for(let n = 0;n<del.length;n++){
                        if(del[n].type === "marker"){
                            for(let i=0;i<markers.length;i++){
                                markers[i].id === del[n].data.id ? delMarker.push(markers[i]) : null;
                            }
                        }
                        if(del[n].type === "markerText"){
                            for(let i=0;i<mtext.length;i++){
                                mtext[i].attributes.id === del[n].data.attributes.id ? delmtext.push(mtext[i]) : null;
                            }
                        }
                    }
                    //获得保留下来的 mtext
                    for(let i=0;i<mtext.length;i++){
                        let restTextSign = true;
                        let oldattr = mtext[i].attributes;
                        for(let j=0;j<delmtext.length;j++){
                            if(oldattr.id === delmtext[j].attributes.id){
                                restTextSign = false;
                            }
                        }
                        if(restTextSign){
                            restText.push(mtext[i]);
                        }
                    }
                    //进行删除
                    delMarker.forEach( delm => markerGroup.removeLayer(delm) );
                    map.hasLayer(textLayer) ? map.removeLayer(textLayer) : null;//删除图层
                    addLayer("textLayer");
                    textLayer.addFeatures(restText);
                    map.panTo(map.getCenter());
                    // 数组变化
                    mapStep.splice(mapStepNum-1,1);
                    mapStepType.splice(mapStepNum-1,1);
                    mapStepNum = mapStepNum-1;
                }else if(mapStepType[mapStepNum-1] === "del"){//还原对应点线
                    let del = mapStep[mapStepNum-1];
                    let mtext = textLayer.hasOwnProperty("labelFeatures") ? textLayer.labelFeatures : [];
                    let ctext = curveTextLayer.hasOwnProperty("labelFeatures") ? curveTextLayer.labelFeatures : [];
                    let backText = mtext;
                    let backCurveText = ctext;
                    for(let i=0;i<del.length;i++){
                        if(del[i].type === "marker"){//还原点
                            markerGroup.addLayer(del[i].data);
                        }else if(del[i].type === "markerText"){//还原点上字
                            backText.push(del[i].data);
                        }else if(del[i].type === "curve"){//还原线
                            curveGroup.addLayer(del[i].data);
                        }else if(del[i].type === "curveText"){//还原线上字
                            backCurveText.push(del[i].data);
                        }
                    }
                    map.hasLayer(curveTextLayer) ? map.removeLayer(curveTextLayer) : null;//删除图层
                    addLayer("curveTextLayer");
                    curveTextLayer.addFeatures(backCurveText);
                    map.hasLayer(textLayer) ? map.removeLayer(textLayer) : null;//删除图层
                    addLayer("textLayer");
                    textLayer.addFeatures(backText);
                    map.panTo(map.getCenter());
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
        // 左侧搜索框点击选中
        window.mapSearchResult = function (datasetid) {
            if(!mapSmallSign&&!mapHeatSign){
                var gisDatasArr = [];
                gisDatasArr.push(datasetid);
                changeMarkerType(gisDatasArr);
            }
        };
        //添加画选区的功能
        function addDraw(){
            let options = {
                position: 'topright',
                draw: {
                    polyline: false,
                    polygon: {
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    circle: {
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    rectangle: {
                        shapeOptions: {
                            clickable: false
                        }
                    },
                    circlemarker:false,
                    marker: false
                },
                edit: false
            };
            drawControl = new L.Control.Draw(options);
            map.addControl(drawControl);
            map.on('draw:drawstop', function (e) {
                $(".leaflet-draw-draw-circle span").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-circle").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-rectangle span").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-rectangle").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-polygon span").removeClass("supermap_draw_active");
                $(".leaflet-draw-draw-polygon").removeClass("supermap_draw_active");
            });
            map.on('draw:drawstart', function (e) {
                $(".leaflet-draw-actions").css("display","none");
                switch (e.layerType){
                    case "polygon":
                        $(".leaflet-draw-draw-polygon span").addClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon").addClass("supermap_draw_active");

                        $(".leaflet-draw-draw-rectangle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-rectangle").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle").removeClass("supermap_draw_active");
                        break;
                    case "rectangle":
                        $(".leaflet-draw-draw-rectangle span").addClass("supermap_draw_active");
                        $(".leaflet-draw-draw-rectangle").addClass("supermap_draw_active");

                        $(".leaflet-draw-draw-polygon span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle").removeClass("supermap_draw_active");
                        break;
                    case "circle":
                        $(".leaflet-draw-draw-circle span").addClass("supermap_draw_active");
                        $(".leaflet-draw-draw-circle").addClass("supermap_draw_active");

                        $(".leaflet-draw-draw-rectangle span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-rectangle").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon span").removeClass("supermap_draw_active");
                        $(".leaflet-draw-draw-polygon").removeClass("supermap_draw_active");
                        break;
                }
            });

            //修改操作栏的样式
            if(mapRight){
                let _width = $("#topology_message").css('width');
                $(".leaflet-draw-section").css("top","240px").css("right",parseInt(_width)+ 26 + 'px');
            }else{
                $(".leaflet-draw-section").css("right",26 + 'px');
            }
            $(".leaflet-draw-toolbar-top").css("width",100 + 'px');
            $(".leaflet-draw-draw-polygon span").removeClass("sr-only").addClass("supermap_draw").html("多边形");
            $(".leaflet-draw-draw-rectangle span").removeClass("sr-only").addClass("supermap_draw").html("正方形");
            $(".leaflet-draw-draw-circle span").removeClass("sr-only").addClass("supermap_draw").html("圆形");

            //操作栏tab切换
            $(".message_tab_list").off().on('click', function () {
                var index = $(this).index();
                $(this).addClass("topology_message_tab_active").siblings().removeClass("topology_message_tab_active");
                $(".topo_message").css("display", "none").eq(index).css("display", "block");
            });

            handleMapEvent(drawControl._container, map);
            map.on(L.Draw.Event.CREATED, function (e) {
                let type = e.layerType,
                    layer = e.layer;
                layer.areaType = type;
                areaGroup.addLayer(layer);
                layer.on({
                    "click":clickDraw,
                    "dblclick":dblclickDraw,
                    "mouseover":mouseoverDraw,
                    "mouseout":mouseoutDraw
                });
                let mapMarkers = markerGroup.getLayers();
                let mapMarkersid = [];
                for(let k=0;k<mapMarkers.length;k++){
                    mapMarkersid.push(mapMarkers[k].id);
                }
                let shapeData;
                let drawUrl;
                if(!mapMarkersid){
                    layer.multipleEntity = [];
                    return '';
                }
                if(type === "circle"){
                    drawUrl = EPMUI.context.url + '/object/shape/circle';
                    shapeData = {
                        radius:layer._mRadius,
                        lon:layer._latlng.lng,
                        lat:layer._latlng.lat,
                        id:mapMarkersid
                    };
                }else{
                    let latlngs = layer._latlngs[0];
                    let lats = [];
                    let lngs = [];
                    latlngs.forEach(ll => {
                        lats.push(ll.lat);
                        lngs.push(ll.lng);
                    });
                    drawUrl = EPMUI.context.url + '/object/shape/polygon';
                    shapeData = {
                        lon:lngs,
                        lat:lats,
                        id:mapMarkersid
                    };
                }

                $.ajax({
                    url: drawUrl,
                    type: 'post',
                    data: shapeData,
                    dataType: 'json',
                    traditional: true,//这里设置为true
                    success: function (data) {
                        if(data.magicube_interface_data){
                            let mid = data.magicube_interface_data;
                            let dataMultipleEntity = [];
                            for (let key in mid) {
                                let dataOne = mid[key];
                                for (let i = 0; i < mapMarkers.length; i++) {
                                    if (mapMarkers[i].hasOwnProperty("id")) {
                                        for (let j = 0; j < dataOne.length; j++) {
                                            if (mapMarkers[i].id === dataOne[j].id) {
                                                dataMultipleEntity.push(mapMarkers[i]);
                                                if(mapMarkers[i].showType !== "move"){
                                                    mapSetIcon(mapMarkers[i],"marker-click");
                                                    mapMarkers[i].showType = "click";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            layer.multipleEntity = dataMultipleEntity;
                        }
                    }
                });
            });

            function handleMapEvent(div, map) {
                if (!div || !map) {
                    return;
                }
                div.addEventListener('mouseover', function () {
                    map.scrollWheelZoom.disable();
                    map.doubleClickZoom.disable();
                });
                div.addEventListener('mouseout', function () {
                    map.scrollWheelZoom.enable();
                    map.doubleClickZoom.enable();
                });
            }
        }
        //选区事件
        function clickDraw(e){
            map.doubleClickZoom.disable();
        }
        function dblclickDraw(e){
            mapCommon.mapWorkArea = {};
            mapCommon.mapWorkArea = {
                thisClick:e,
                areaLays:this
            };

            mapdisk = true;
            var conf = {
                thisClick:e,
                areaLays:this
            };
            /*let conf = {
                getLeft:parseFloat(e.containerPoint.x)-250,
                getTop:parseFloat(e.containerPoint.y)-250
            };
            let texts = ["删除", "扩展", "统计", "重点区域", "检索","取消"];
            let imageType = ["delete", "extend", "statistics", "keyarea", "areasearch", "cancele"];
            */
            //mapCommonPart.addmenu(conf, texts, imageType, 11);

            mapCommonPart.menu(conf,"areamenu");
        }
        function mouseoverDraw(e){
            map.doubleClickZoom.disable();
        }
        function mouseoutDraw(e){
            map.doubleClickZoom.enable();
        }
        //marker点的事件
        function dragEndMarker(e){
            let lonlat = {
                gis:{
                    lon: e.target._latlng.lng,
                    lat: e.target._latlng.lat
                }
            };
            this.gis = lonlat.gis;
            this.baseMsg.gis = lonlat.gis;

            //对应线上文字移动
            for(let i=0;i<allCurveText.length;i++){
                let points = [];
                if(allCurveText[i].attributes.source.id === this.id){
                    let returnPoints = mapCommonPart.getCurveByTwoPoints(lonlat, allCurveText[i].attributes.target, allCurveText[i].attributes.lineSizeNum);
                    returnPoints.forEach( rp => points.push([rp.lat, rp.lon]) );
                    let centerNum = parseInt(points.length/2);
                    let lineCenter = points[centerNum];
                    allCurveText[i] = L.supermap.themeFeature([lineCenter[0], lineCenter[1], allCurveText[i].attributes.relationTypeName], allCurveText[i].attributes);
                }
                if(allCurveText[i].attributes.target.id === this.id){
                    let returnPoints = mapCommonPart.getCurveByTwoPoints(allCurveText[i].attributes.source, lonlat, allCurveText[i].attributes.lineSizeNum);
                    returnPoints.forEach( rp => points.push([rp.lat, rp.lon]) );
                    let centerNum = parseInt(points.length/2);
                    let lineCenter = points[centerNum];
                    allCurveText[i] = L.supermap.themeFeature([lineCenter[0], lineCenter[1], allCurveText[i].attributes.relationTypeName], allCurveText[i].attributes);
                }
            }
            map.hasLayer(curveTextLayer) ? map.removeLayer(curveTextLayer) : null;//删除图层
            addLayer("curveTextLayer");
            curveTextLayer.addFeatures(allCurveText);
            map.panTo(map.getCenter());
        }
        function dragMarker(e){
            if(map.hasLayer(curveTextLayer) && curveTextLayer.hasOwnProperty("labelFeatures")){
                allCurveText = curveTextLayer.labelFeatures;
                map.removeLayer(curveTextLayer);//删除图层
            }
            let lonlat = {
                gis:{
                    lon: e.latlng.lng,
                    lat: e.latlng.lat
                }
            };
            // 对应线条移动，对应点移动
            let curves = curveGroup.getLayers();
            curves.forEach(curve => {
                let points = [];
                if(curve.attrs.source.id === this.id){
                    let returnPoints = mapCommonPart.getCurveByTwoPoints(lonlat, curve.attrs.target, curve.attrs.lineSizeNum);
                    returnPoints.forEach( rp => points.push([rp.lat, rp.lon]) );
                    curve.attrs.source.gis = lonlat.gis;
                    curve.setLatLngs(points);
                }
                if(curve.attrs.target.id === this.id){
                    let returnPoints = mapCommonPart.getCurveByTwoPoints(curve.attrs.source, lonlat, curve.attrs.lineSizeNum);
                    returnPoints.forEach( rp => points.push([rp.lat, rp.lon]) );
                    curve.attrs.target.gis = lonlat.gis;
                    curve.setLatLngs(points);
                }
                curve.redraw();
            });
            //对应点文字移动
            let mtext = textLayer.labelFeatures;
            let dragHideText = [];//原来不变的点文字
            let changeText = [];//需要改变的点文字
            if(textLayer.hasOwnProperty("labelFeatures")){
                mtext.forEach(mt => {
                    mt.attributes.id === this.id ? changeText.push(mt) : dragHideText.push(mt)
                });
                if(changeText){
                    let ctAttrs = changeText[0].attributes;
                    ctAttrs.gis = lonlat.gis;
                    let changeT = L.supermap.themeFeature([e.latlng.lat, e.latlng.lng, ctAttrs.name], ctAttrs);
                    dragHideText.push(changeT);
                    map.removeLayer(textLayer);//删除图层-添加图层-添加元素
                    addLayer("textLayer");
                    textLayer.addFeatures(dragHideText);
                    map.panTo(map.getCenter());
                }
            }
        }
        function clickMarker(){
            getBaseMessage(true,this.id, this.type, true);//基础信息展示
            var gisDatasArr = [];
            gisDatasArr.push(this.id);
            changeMarkerType(gisDatasArr);
        }
        function dblclickMarker(e){
            if(!mapSmallSign){
                mapdisk = true;
                let conf = {
                    thisMarker:this,
                    markerId:this.id,
                    gis:this.gis,
                    nodeId:this.baseMsg.nodeId,
                    nodeType:this.baseMsg.type,
                    pageType:this.baseMsg.pageType,
                    objectType:this.baseMsg.objectType,
                    getLeft:parseFloat(e.containerPoint.x)-250,
                    getTop:parseFloat(e.containerPoint.y)-250
                };
                mapCommon.mapWorkMarker = [];
                mapCommon.mapWorkMarker.push(this);
                mapCommonPart.topomenu(conf);
            }
        }
        function mouseoverMarker(e){
            let oldMarker = this;
            hideCurveText = curveTextLayer.labelFeatures;
            oldMarker.showType === "marker"?mapSetIcon(oldMarker,"marker-hover") : null;
        }
        function mouseoutMarker(){
            let oldMarker = this;
            oldMarker.showType==="marker" ? mapSetIcon(oldMarker,"marker") : null;
        }
        //添加图层
        function addLayer(layerName) {
            let styleGroups =  [
                {
                    style: {
                        fillColor: "#fff",
                        fontSize: "10px"
                    }
                }
            ];
            if(layerName === "textLayer"){
                textLayer = L.supermap.labelThemeLayer("textLayer",{isOverLay:false}).addTo(map);
                /*textLayer = L.supermap.labelThemeLayer("ThemeLayer",{isOverLay:false});
                textGroup.addLayer(textLayer);*/
                $(".textLayer").css("z-index","10");
                if(!mapFontStatus){
                    $(".textLayer").css("display","none");
                }
                textLayer.style = new SuperMap.ThemeStyle({
                    labelRect: true,
                    fontColor: "#000",
                    fontWeight: "normal",
                    fontSize: "10px",
                    fill: true,
                    fillColor: "#FFFFFF",
                    fillOpacity: 1,
                    stroke: false,
                    strokeColor: "#8B7B8B",
                    labelXOffset:24,
                    labelYOffset:12
                });
                textLayer.themeField = "name";//用于专题图的属性字段名称
                textLayer.styleGroups = styleGroups;//风格数组，设定值对应的样式
            }
            if(layerName === "curveTextLayer"){
                curveTextLayer = L.supermap.labelThemeLayer("curveTextLayer",{isOverLay:false}).addTo(map);
                /*curveTextLayer = L.supermap.labelThemeLayer("curveTextLayer",{isOverLay:false});
                textGroup.addLayer(curveTextLayer);*/
                $(".curveTextLayer").css("z-index","10");
                if(!mapFontStatus){
                    $(".curveTextLayer").css("display","none");
                }
                curveTextLayer.style = new SuperMap.ThemeStyle({
                    labelRect: false,
                    fontColor: "#000",
                    fontWeight: "normal",
                    fontSize: "10px",
                    fill: true,
                    fillColor: "#f99070",
                    fillOpacity: 1,
                    stroke: false,
                    strokeColor: "#f99070"
                });
                curveTextLayer.themeField = "relationTypeName"; //用于专题图的属性字段名称
                curveTextLayer.styleGroups = styleGroups; //风格数组，设定值对应的样式
            }
        }
        //去重 点or线
        function mapRepeat(lays,type){
            switch (type) {
                case "marker":
                    let haveMarker = false;
                    let markers = markerGroup.getLayers();
                    markers.forEach(ms => ms.id === lays.id?haveMarker = true : null );
                    return haveMarker;
                case "polyline":
                    var lineAll = [];
                    var haveCurve = false;
                    var allOverlays = curveGroup.getLayers();
                    for(var j=0;j<allOverlays.length;j++) {
                        var overlayAttr = allOverlays[j].attrs;
                        var laysTId = lays.target.id;
                        var laysSId = lays.source.id;
                        var oAttrTId = overlayAttr.target.id;
                        var oAttrSId = overlayAttr.source.id;
                        if((oAttrSId===laysSId&&oAttrTId===laysTId)||(oAttrSId===laysTId&&oAttrTId===laysSId)){
                            haveCurve = true;//id相同时，比较关系名称是否相同
                            lineAll.push(overlayAttr);
                        }
                    }

                    if(haveCurve && lays.hasOwnProperty("relationTypeName")){
                        for(var n=0;n<lineAll.length;n++){
                            if(lineAll[n].relationId === lays.relationId){
                                return "have";
                            }
                        }
                        return lineAll;
                    }

                return false;
            }

        }
        //添加点线
        function addMapMarkerLine(gisnodes,gislinks){
            gislinks.forEach(link => lineNames.push(link.relationParentType));
            lineNames = [...new Set(lineNames)];
            let mapTooltipSign = false;//用于判断 提示信息是否显示
            let gisAllSearchDatas = gisnodes;
            let mapStepOverlays = [];//用于放入mapStep
            let addMarkerText = [];//存放要新添加到地图的点文字
            let addCurveText = [];//存放要新添加到地图的线文字
            for (let i = 0; i < gisAllSearchDatas.length; i ++) {
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
                        addMarkerText.push(markerText);
                        var step = { data:marker, type:"marker" };
                        var stepMText = { data:markerText, type:"markerText" };
                        mapStepOverlays.push(step);
                        mapStepOverlays.push(stepMText);
                    }
                    if(gisAllSearchDatas[i].hasOwnProperty("nogis")){//留用，若无经纬度不显示
                        var conf = { type:"add" };
                        var marker = addMapOverlays(gisAllSearchDatas[i], "marker", conf);
                        var markerText = addMapOverlays(gisAllSearchDatas[i], "markerText", conf);
                        addMarkerText.push(markerText);
                        var step = { data:marker, type:"marker" };
                        var stepMText = { data:markerText, type:"markerText" };
                        mapStepOverlays.push(step);
                        mapStepOverlays.push(stepMText);
                    }
                }
            }

            if(gislinks !== "no"){
                for(let i=0;i<gislinks.length;i++){
                    let haveLine = mapRepeat(gislinks[i],"polyline");
                    if((gislinks[i].source.gis != null) && (gislinks[i].target.gis != null) ){
                        let lineSizeNum = haveLine ? haveLine.length : 170;
                        if(haveLine !== "have"){
                            let conf = { lineSizeNum : lineSizeNum };
                            let returnData = addMapOverlays(gislinks[i], "curve", conf);
                            let curve = returnData.polyline;
                            let curveTextConf = {lineCenter:returnData.lineCenter,lineSizeNum:returnData.lineSizeNum};
                            let curveText = addMapOverlays(gislinks[i], "curveText", curveTextConf);
                            addCurveText.push(curveText);
                            let stepM = { data:curve, type:"curve" };
                            let step = { data:curveText, type:"curveText" };
                            mapStepOverlays.push(stepM);
                            mapStepOverlays.push(step);
                        }
                    }

                }
            }

            if(textLayer.hasOwnProperty("labelFeatures")){
                for(let i=0;i<textLayer.labelFeatures.length;i++){
                    let oldattr = textLayer.labelFeatures[i].attributes;
                    let oldF = L.supermap.themeFeature([oldattr.gis.lat, oldattr.gis.lon, oldattr.name], oldattr);
                    addMarkerText.push(oldF);
                }
            }

            if(curveTextLayer.hasOwnProperty("labelFeatures")){
                for(let i=0;i<curveTextLayer.labelFeatures.length;i++){
                    let oldattr = curveTextLayer.labelFeatures[i].attributes;
                    let oldF = L.supermap.themeFeature([oldattr.gis.lat, oldattr.gis.lon, oldattr.relationTypeName], oldattr);
                    addCurveText.push(oldF);
                }
            }

            map.hasLayer(curveTextLayer) ? map.removeLayer(curveTextLayer) : null;//删除图层
            addLayer("curveTextLayer");
            curveTextLayer.addFeatures(addCurveText);
            map.hasLayer(textLayer) ? map.removeLayer(textLayer) : null;//删除图层
            addLayer("textLayer");
            textLayer.addFeatures(addMarkerText);
            map.panTo(map.getCenter());

            if(mapTooltipSign){
                mapCommonPart.mapTooltip();//提示信息
            }
            addMapBackStep(mapStepOverlays,"add");
        }
        //改变点的显示样式
        function changeMarkerType(id){
            let oldMarker = markerGroup.getLayers();
            for(let i=0;i<oldMarker.length;i++){//对应点选中，原选中点恢复
                if(oldMarker[i].showType === "click"){
                    mapSetIcon(oldMarker[i],"marker");
                    oldMarker[i].showType = "marker";
                }
            }

            if(id){
                for(let j=0;j<id.length;j++){//对应点选中
                    oldMarker = markerGroup.getLayers();
                    for(let i=0;i<oldMarker.length;i++){
                        if(oldMarker[i].id === id[j] && oldMarker[i].showType !== "move"){
                            mapSetIcon(oldMarker[i],"marker-click");
                            oldMarker[i].showType = "click";
                        }
                    }
                }
            }

        }
        //添加点线等覆盖物
        function addMapOverlays(overlays, sign, conf){
            switch (sign){
                case "marker" :
                    let myIcon, marker, showType;
                    if(overlays.hasOwnProperty("nogis")){
                        //showType = "move";
                        showType = "marker";
                        noGisPoints.push(overlays);
                        myIcon = L.icon({iconUrl: '/image/gis/marker-move.svg',iconSize: [25, 40]});
                    }else {
                        if(conf.type === "add"){
                            showType = "marker";
                            myIcon = L.icon({iconUrl: '/image/gis/marker.svg',iconSize: [25, 40]});
                        }
                        if(conf.type === "hover"){
                            showType = "hover";
                            myIcon = L.icon({iconUrl: '/image/gis/marker-hover.svg',iconSize: [25, 40]});
                        }
                        if(conf.type === "click"){
                            showType = "click";
                            myIcon = L.icon({iconUrl: '/image/gis/marker-click.svg',iconSize: [25, 40]});
                        }
                    }

                    marker = L.marker([overlays.gis.lat, overlays.gis.lon], {icon: myIcon,alt:"aaaaa"});

                    markerGroup.addLayer(marker);
                    markerGroup.addTo(map);

                    marker.type= overlays.type;
                    marker.id= overlays.id;
                    marker.gis= overlays.gis;
                    marker.addnode= overlays.addnode;
                    marker.baseMsg = overlays;
                    marker.ableDrag = "false";
                    marker.showType = showType;
                    marker.on({
                        "drag":dragMarker,
                        "dragend":dragEndMarker,
                        "click":clickMarker,
                        "dblclick":dblclickMarker,
                        "mouseover":mouseoverMarker,
                        "mouseout":mouseoutMarker
                    });

                    return marker;
                case "markerText" :
                    return L.supermap.themeFeature([overlays.gis.lat, overlays.gis.lon, overlays.name], overlays);
                case "curve" :
                    let points = [];
                    let returnPoints = mapCommonPart.getCurveByTwoPoints(overlays.source, overlays.target, conf.lineSizeNum);
                    /*console.log("overlays   returnPoints==== ");
                    console.log(overlays);
                    console.log(returnPoints)*/
                    for(let k=0;k<returnPoints.length;k++){
                        points.push([returnPoints[k].lat, returnPoints[k].lon]);
                    }
                    let lineOption;
                    if(mapLineStatus){
                        lineOption = {
                            color: "#f99070",
                            weight:1
                        }
                    }else{
                        lineOption = {
                            color: "#f99070",
                            weight:0
                        }
                    }

                    let polyline = L.polyline(points, lineOption);
                    overlays.lineSizeNum = conf.lineSizeNum;
                    polyline.attrs = overlays;
                    curveGroup.addLayer(polyline);
                    curveGroup.addTo(map);

                    let centerNum = parseInt(returnPoints.length/2);
                    let lineCenter = returnPoints[centerNum];

                    return {
                        polyline:polyline,
                        lineCenter:lineCenter,
                        lineSizeNum:conf.lineSizeNum
                    };
                case "curveText" :
                    overlays.gis = conf.lineCenter;
                    overlays.lineSizeNum = conf.lineSizeNum;
                    return L.supermap.themeFeature([conf.lineCenter.lat, conf.lineCenter.lon, overlays.relationTypeName], overlays);
            }
        }
        //修改点的样式
        function mapSetIcon(marker, sign){
            marker.setIcon(L.icon({iconUrl: '/image/gis/'+sign+'.svg',iconSize: [25, 40]}));
        }
        //添加进后退队列
        function addMapBackStep(mapStepOverlays, steptype) {
            mapStep.push(mapStepOverlays);
            mapStepType.push(steptype);
            mapStepNum++;
        }
        //删除点线
        function deleteMarker(markerId){
            let mapStepOverlays = [],//存放删除的数据
                delMarker = [],//删除对应点
                delmtext = [],//删除文字
                delLine = [],//删除线条
                delctext = [],//删除线上文字
                restText = [],//剩余文字
                restCurveText = [],//剩余线上文字
                markers = markerGroup.getLayers(),
                mtext = textLayer.hasOwnProperty("labelFeatures") ? textLayer.labelFeatures : [],
                line = curveGroup.getLayers(),
                ctext = curveTextLayer.hasOwnProperty("labelFeatures") ? curveTextLayer.labelFeatures : [];
            for(let n = 0;n<markerId.length;n++){
                for(var i=0;i<markers.length;i++){
                    if(markers[i].id === markerId[n]){
                        var step = { data:markers[i], type:"marker" };//存入到后退数组中
                        mapStepOverlays.push(step);
                        delMarker.push(markers[i]);
                    }
                }
                for(var i=0;i<mtext.length;i++){
                    var oldattr = mtext[i].attributes;
                    if(oldattr.id === markerId[n]){
                        delmtext.push(mtext[i]);
                        var step = { data:mtext[i], type:"markerText" };
                        mapStepOverlays.push(step);
                    }
                }
                for(var i=0;i<line.length;i++){
                    if(line[i].attrs.source.id === markerId[n] || line[i].attrs.target.id === markerId[n]){
                        delLine.push(line[i]);
                        var step = { data:line[i], type:"curve" };
                        mapStepOverlays.push(step);
                    }
                }
                for(var i=0;i<ctext.length;i++){
                    var oldattr = ctext[i].attributes;
                    if(oldattr.source.id === markerId[n] || oldattr.target.id === markerId[n]){
                        delctext.push(ctext[i]);
                        var step = { data:ctext[i], type:"curveText" };
                        mapStepOverlays.push(step);
                    }
                }
            }
            //获得保留下来的 mtext和ctext
            for(let i=0;i<mtext.length;i++){
                let restTextSign = true;
                let oldattr = mtext[i].attributes;
                for(let j=0;j<delmtext.length;j++){
                    let delmtextAttr = delmtext[j].attributes;
                    if(oldattr.id === delmtextAttr.id){
                        restTextSign = false;
                    }
                }
                if(restTextSign){
                    restText.push(mtext[i]);
                }
            }
            for(let i=0;i<ctext.length;i++){
                let restCurveTextSign = true;
                let oldattr = ctext[i].attributes;
                for(let j=0;j<delctext.length;j++){
                    let delctextAttr = delctext[j].attributes;
                    if(oldattr.source.id === delctextAttr.source.id && oldattr.target.id === delctextAttr.target.id){
                        restCurveTextSign = false;
                    }
                }
                if(restCurveTextSign){
                    restCurveText.push(ctext[i]);
                }
            }
            //进行删除
            delMarker.forEach( delm => markerGroup.removeLayer(delm) );
            delLine.forEach( dell => curveGroup.removeLayer(dell) );

            map.hasLayer(curveTextLayer) ? map.removeLayer(curveTextLayer) : null;//删除图层
            addLayer("curveTextLayer");
            curveTextLayer.addFeatures(restCurveText);
            map.hasLayer(textLayer) ? map.removeLayer(textLayer) : null;//删除图层
            addLayer("textLayer");
            textLayer.addFeatures(restText);
            map.panTo(map.getCenter());
            addMapBackStep(mapStepOverlays,"del");
        }
        //地图选区菜单功能 删除内点delInPoint，删除外点delOutPoint
        function mapSelectArea(data, action) {
            if(action === "delInPoint"){//删除内点
                let ids = [];
                let markers = markerGroup.getLayers();
                for(let i=0;i<markers.length;i++){
                    for(let j=0;j<data.length;j++){
                        if(markers[i].id === data[j].id){
                            ids.push(markers[i].id);
                        }
                    }
                }
                deleteMarker(ids);
            }else if(action === "delOutPoint"){// 删除外点
                let markers = markerGroup.getLayers();
                let ids = [];
                for(let i=0;i<markers.length;i++){
                    let delSign = true;
                    if(markers[i].hasOwnProperty("id")){
                        for(let j=0;j<data.length;j++){
                            if(markers[i].id === data[j].id){
                                delSign = false;
                            }
                        }
                    }
                    if(delSign){
                        ids.push(markers[i].id);
                    }
                }
                deleteMarker(ids);
            }

        }
        //选区-统计菜单
        function mapStatistics(data) {
            let allOverlays = markerGroup.getLayers();
            let allNodeId = {
                ids: [],
                types: []
            };
            for(let i=0;i<allOverlays.length;i++){
                if(allOverlays[i].hasOwnProperty("id")){
                    for(let j=0;j<data.length;j++){
                        if(allOverlays[i].id === data[j].id){
                            allNodeId.ids.push(allOverlays[i].id);
                            allNodeId.types.push(allOverlays[i].type);
                        }
                    }
                }
            }
            if(allNodeId){
                getTotalMessage(allNodeId); //统计信息
            }
        }
        //添加弧线路径
        function addCurve(points,baseP,lastP,sign){
            let color;
            if(sign==="place"){
                color = "#f99070";//new esri.Color([127,255,0,1]);//127,255,0
            }else if(sign==="track"){
                color = "#f99070";//new esri.Color([253,175,0,1]);//253,175,0
            }else if(sign==="base"){
                color = "#f99070";//new esri.Color([170,33,22,1]);//253,175,0
            }

            let polyline = L.polyline(points, {color: color,weight:1});
            //polyline.attrs = overlays;
            trackGroup.addLayer(polyline);

            if(sign === "base"){
                let myIcon = L.icon({iconUrl: '../../../image/gis/circle.png',iconSize: [20, 20]});
                let marker = L.marker([lastP.gis.lat, lastP.gis.lon], {icon: myIcon,alt:"null"});

                trackGroup.addLayer(marker);
                marker.attr = {
                    sign:"CurvePoint",
                    address:lastP.address,
                    id:baseP.id
                };
                marker.on("click",function (e) {
                    $("#newDiv").remove();
                    var content = "<div class='address_indiv'>"+
                        "地址：<div class='address_div' >"+ this.attr.address +"</div> "+
                        "<div class='dbl_topleft'></div><div class='address_bottomright'></div></div>";

                    var div = document.createElement("div");
                    div.setAttribute("id", "newDiv");
                    div.style.position = "absolute";
                    div.style.left = parseFloat(e.containerPoint.x) + "px";
                    div.style.top = parseFloat(e.containerPoint.y) + "px";
                    div.style.fontSize = "12px";
                    div.style.zIndex = "9999";
                    var svg = $(content).appendTo(div);
                    $(div).appendTo(map.getContainer());

                    $(".address_indiv").css("height","20px");
                    $(".address_indiv").css("width","20px");
                    setTimeout(function(){
                        $(".address_indiv").css("width","150px");
                        $(".address_indiv").css("height","60px");
                    },100);
                });
            }
        }
        // 修改：轨迹路径 和 动画分离
        function runCurveAnimation(points,basePoint,sign,tripMode,tripNum){
            if(tripNum==0){
                curveAnimation(points,basePoint,sign,tripMode,tripNum);
            }else{
                var stopnum = 0;
                var lushuSetInt = setInterval(function(){
                    trackInterval.push(lushuSetInt);
                    stopnum++;
                    if(tripNum==lushunum){//其实一直在循环判断
                        curveAnimation(points,basePoint,sign,tripMode,tripNum);
                        clearInterval(lushuSetInt);
                    }
                    if(stopnum>150){
                        clearInterval(lushuSetInt);
                    }
                },500);
            }
        }
        //轨迹动画
        function curveAnimation(points,basePoint,sign,tripMode,tripNum) {
            //let myIcon = L.icon({iconUrl: '/image/gis/marker-click.svg',iconSize: [25, 40]});
            //添加一个移动的点（显示出行工具）
            trackGroup.removeLayer(trackMarker);
            let myIcon = L.divIcon({
                className: 'my-div-icon',
                html:'<img src="/image/gis/'+ tripMode +'.svg" class="div-icon-img" alt="aaaaa" tabindex="0" style="margin-left: -12.5px; margin-top: -20px; width: 25px; height: 40px; z-index: 633;">'
             });
            trackMarker = L.marker([points[0].lat, points[0].lon], {icon: myIcon});
            trackMarker.type = "trackMarker";
            trackGroup.addLayer(trackMarker);

            let cAsize = 0;//记录走过的位置
            let cA = setInterval(function () {
                trackInterval.push(cA);
                if(cAsize<points.length){
                    trackMarker.setLatLng([points[cAsize].lat, points[cAsize].lon]);
                    if(cAsize>0){
                        //动图角度调整
                        let angle = setAnimationRotation(points[cAsize-1],points[cAsize]);
                        let ang = angle-90;
                        if(tripMode==="airplane"){
                            ang = ang - 45;
                        }
                        $(".div-icon-img").css("transform","rotate("+ang+"deg)");
                        let addCurveData = [];
                        addCurveData.push(points[cAsize-1]);
                        addCurveData.push(points[cAsize]);
                    }
                    cAsize++;
                }else{
                    lushunum = lushunum+1;//这一句是重点
                    clearInterval(cA);
                    trackGroup.removeLayer(trackMarker);//图标也要去掉了
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
        //选区工具
        $("#map_tool").click(function(){
            if(arcgisToolSign){
                //隐藏选区工具栏
                map.removeControl(drawControl);
                arcgisToolSign = false;
            }else{
                //显示选区工具栏
                addDraw();
                arcgisToolSign = true;
            }
        });
        //轨迹设置
        $("#map_path_ensure").bind("click",function(){
            trackInterval.forEach(ti => { clearInterval(ti); });
            trackGroup.clearLayers();

            $(".map_path").css("height","40px").css("overflow","hidden");
            let startTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[0].trim() : "";
            let endTime = $("#map_path_time").val().trim() ? $("#map_path_time").val().split("~")[1].trim() : "";
            // 轨迹类型
            let trackStatues = [];
            /*$("input[name='mapPath']:checked").each(function(){
                trackStatues.push($(this).val());
            });*/

            $("input[name='mapPath']").each(function(){
                if( $(this).attr("checked")){
                    trackStatues.push($(this).val());
                }
            });

            let basePoint = {
                gis: {
                    lon: mapCommon.mapWorkMarker[0].gis.lon,
                    lat: mapCommon.mapWorkMarker[0].gis.lat
                },
                id: mapCommon.mapWorkMarker[0].id
            };
            let Id = mapPathBasePoint.id;
            let nodeType = mapPathBasePoint.baseMsg.type;
            let nodeId = mapPathBasePoint.baseMsg.nodeId;

            //后台请求，获得轨迹的数据
            for(var i=0;i<trackStatues.length;i++){
                if(trackStatues[i] === "pathAppearSite"){//出现地点
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


                                for (let a = 0;a<addData.length;a++){
                                    let addDataFirst = {
                                        address: addData[a].address,
                                        gis: {
                                            lon: addData[a].gis.lon,
                                            lat: addData[a].gis.lat
                                        }
                                    };
                                    let linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addDataFirst);
                                    addCurve(linePoints,basePoint,addDataFirst,"base");
                                }
                            }
                        }
                    });
                }
                if(trackStatues[i] === "pathMigratory"){//迁徙轨迹
                    if (true) {
                        //let addData = data.magicube_interface_data;
                        let addData = [
                            {
                                "gis": [
                                    101.708848,
                                    36.654032
                                ],
                                "tripMode": "airplane",
                                "address": "西宁市城西区青海海湖体育中心",
                                "time": "2017-03-20 12:02:33"
                            },
                            {
                                "gis": [
                                    106.237056,
                                    29.789903
                                ],
                                "tripMode": "train",
                                "address": "重庆市鹅岭正街176号",
                                "time": "2017-07-13 04:22:00"
                            },
                            {
                                "gis": [
                                    121.508711,
                                    31.244821
                                ],
                                "tripMode": "car",
                                "address": "浦东新区陆家嘴环路1388号",
                                "time": "2017-09-13 04:22:55"
                            },
                            {
                                "gis": [
                                    126.639351,
                                    45.749688
                                ],
                                "tripMode": "train",
                                "address": "哈尔滨工业大学",
                                "time": "2017-11-13 04:22:00"
                            }
                        ];
                        let curveAnimationPoints = [];
                        window.lushunum = 0;
                        for(let k=0;k<addData.length;k++){
                            if(k==0){
                                let addDataFirst = {
                                    time:addData[0].time,
                                    tripMode:addData[0].tripMode,
                                    address: addData[0].address,
                                    gis: {
                                        lon: addData[0].gis[0],
                                        lat: addData[0].gis[1]
                                    }
                                };
                                let linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addDataFirst);
                                addCurve(linePoints,basePoint,addDataFirst,"base");
                                for(let l=0;l<linePoints.length;l++){
                                    curveAnimationPoints.push(linePoints[l]);
                                }
                                //轨迹动画
                                runCurveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                            }
                            if(k>0){
                                var addDataFirst = {
                                    time:addData[k-1].time,
                                    tripMode:addData[k-1].tripMode,
                                    address: addData[k-1].address,
                                    gis: {
                                        lon: addData[k-1].gis[0],
                                        lat: addData[k-1].gis[1]
                                    }
                                };

                                var addDataSecond = {
                                    time:addData[k].time,
                                    tripMode:addData[k].tripMode,
                                    address: addData[k].address,
                                    gis: {
                                        lon: addData[k].gis[0],
                                        lat: addData[k].gis[1]
                                    }
                                };
                                var linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst,addDataSecond);
                                addCurve(linePoints,basePoint,addDataSecond,"base");
                                for(var l=0;l<linePoints.length;l++){
                                    curveAnimationPoints.push(linePoints[l]);
                                }
                                //轨迹动画
                                runCurveAnimation(linePoints,basePoint,"track", addDataSecond.tripMode, k);
                            }
                        }
                        //轨迹动画
                        //curveAnimation(curveAnimationPoints,basePoint,"track");
                    }

                    return '';

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
                                //let addData = data.magicube_interface_data;
                                let addData = [
                                    {
                                        "gis": [
                                            101.708848,
                                            36.654032
                                        ],
                                        "tripMode": "airplane",
                                        "address": "西宁市城西区青海海湖体育中心",
                                        "time": "2017-03-20 12:02:33"
                                    },
                                    {
                                        "gis": [
                                            106.237056,
                                            29.789903
                                        ],
                                        "tripMode": "train",
                                        "address": "重庆市鹅岭正街176号",
                                        "time": "2017-07-13 04:22:00"
                                    },
                                    {
                                        "gis": [
                                            121.508711,
                                            31.244821
                                        ],
                                        "tripMode": "car",
                                        "address": "浦东新区陆家嘴环路1388号",
                                        "time": "2017-09-13 04:22:55"
                                    },
                                    {
                                        "gis": [
                                            126.639351,
                                            45.749688
                                        ],
                                        "tripMode": "train",
                                        "address": "哈尔滨工业大学",
                                        "time": "2017-11-13 04:22:00"
                                    }
                                ];
                                let curveAnimationPoints = [];
                                window.lushunum = 0;
                                for(let k=0;k<addData.length;k++){
                                    if(k==0){
                                        let addDataFirst = {
                                            time:addData[0].time,
                                            tripMode:addData[0].tripMode,
                                            address: addData[0].address,
                                            gis: {
                                                lon: addData[0].gis[0],
                                                lat: addData[0].gis[1]
                                            }
                                        };
                                        let linePoints = mapCommonPart.getCurveByTwoPoints(basePoint,addDataFirst);
                                        addCurve(linePoints,basePoint,addDataFirst,"base");
                                        for(let l=0;l<linePoints.length;l++){
                                            curveAnimationPoints.push(linePoints[l]);
                                        }
                                        //轨迹动画
                                        //curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                                        runCurveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                                    }
                                    if(k>0){
                                        var addDataFirst = {
                                            time:addData[k-1].time,
                                            tripMode:addData[k-1].tripMode,
                                            address: addData[k-1].address,
                                            gis: {
                                                lon: addData[k-1].gis[0],
                                                lat: addData[k-1].gis[1]
                                            }
                                        };

                                        var addDataSecond = {
                                            time:addData[k].time,
                                            tripMode:addData[k].tripMode,
                                            address: addData[k].address,
                                            gis: {
                                                lon: addData[k].gis[0],
                                                lat: addData[k].gis[1]
                                            }
                                        };
                                        var linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst,addDataSecond);
                                        addCurve(linePoints,basePoint,addDataSecond,"base");
                                        for(var l=0;l<linePoints.length;l++){
                                            curveAnimationPoints.push(linePoints[l]);
                                        }
                                        //轨迹动画
                                        //curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
                                        runCurveAnimation(linePoints,basePoint,"track", addDataSecond.tripMode, k);
                                    }
                                }
                                //轨迹动画
                                //curveAnimation(curveAnimationPoints,basePoint,"track");
                            }
                        }
                    });
                }
            }

        });
        //轨迹取消
        $("#map_path_cancel").bind("click",function(){
            $(".map_path").hide();
            trackInterval.forEach(ti => { clearInterval(ti); });
            trackGroup.clearLayers();
        });
        //设置地图基本属性
        window.setmapProperty = function (drag, zoom, dblClick){
            drag === "drag-true" ? map.dragging.enable() :  map.dragging.disable();
            zoom === "zoom-true" ? map.scrollWheelZoom.enable() :  map.scrollWheelZoom.disable();
            dblClick === "dbl-true" ? map.doubleClickZoom.enable() :  map.doubleClickZoom.disable();
        };
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

                    return '';
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

                    return '';
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
                    curveGroup.eachLayer(function(layer){
                        layer.setStyle({weight:1});
                    })
                    $(".textLayer").css("display","block");
                    $(".curveTextLayer").css("display","block");
                    mapFontStatus = true;
                    mapLineStatus = true;
                }else if(fontlineStatues.length==1&&!mapHeatSign&&!mapSmallSign){
                    if(fontlineStatues[0] == "hideline"){//隐藏连线 显示文字
                        curveGroup.eachLayer(function(layer){
                            layer.setStyle({weight:0});
                        })
                        $(".textLayer").css("display","block");
                        $(".curveTextLayer").css("display","block");
                        mapFontStatus = true;
                        mapLineStatus = false;
                    }else if(fontlineStatues[0] == "hidefont"){//隐藏文字 显示连线
                        curveGroup.eachLayer(function(layer){
                            layer.setStyle({weight:1});
                        })
                        $(".textLayer").css("display","none");
                        $(".curveTextLayer").css("display","none");
                        mapFontStatus = false;
                        mapLineStatus = true;
                    }
                }else if(fontlineStatues.length==2&&!mapHeatSign&&!mapSmallSign){
                    curveGroup.eachLayer(function(layer){
                        layer.setStyle({weight:0});
                    })
                    $(".textLayer").css("display","none");
                    $(".curveTextLayer").css("display","none");

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

                map.panTo(map.getCenter());
            })
            $("#ret_btn").click(function () {//取消设置
                mapShowSign=false;
                $("#mapsetddiv").hide();
                $("#mapsetddiv").css("height","20px");
                $("svg[type='system']").css("cursor","pointer");
            })

        });
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

        window.mapSaveLocalStorage = function () {//地图信息保存
            let allOverlays = markerGroup.getLayers();
            let allLines = curveGroup.getLayers();
            //保存所有点和线
            let mapNodes = [];
            let mapLinks = [];
            for(let j=0;j<allOverlays.length;j++) {
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
            for(let k=0;k<allLines.length;k++) {
                let allLinesAttrs = allLines[k].attrs;
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
            let toponodes = {
                "nodes":mapNodes,
                "links":mapLinks,
                "filterNodeId":[],
                "timeDatas":[],
                "totalHtml":""
            };
            //保存
            localStorage.setItem("topoNodes", JSON.stringify(toponodes) );
        };
        //对应地图TopoMenu的方法：
        window.mapOwnFun = {
            /**
             * mapAddTopoMenu        : 添加操作菜单div到地图
             * mapTopoMenu           : 点 菜单
             * mapAddAreaMenu        : 添加选区菜单-去掉
             * mapClickAreaMenu      : 选区菜单-统计 功能
             * mapExtendAreaMenu     : 选区菜单-扩展 功能   ok
             * mapRemoveAreaMenu     : 选区菜单-删除 功能   ok
             * mapSaveLocalStorage   : 保存地图信息
             */

            /**
             * mapAddTopoMenu           : 添加菜单div到地图
             * mapRemoveTopoMenu        : 菜单-删除按钮
             * mapMoveTopoMenu          : 菜单-移动按钮
             * mapSaveTopoMenu          : 菜单-存点按钮
             * mapCheckTopoMenu         : 菜单-查看按钮
             * mapOffTopoMenu           : 菜单-取消按钮
             * mapExtendTopoMenu        : 菜单-扩展按钮
             *
             * mapMoreExtendTopoMenu    : 菜单-更多按钮
             * mapPathTopoMenu          : 菜单-轨迹按钮
             * mapRemovePathTopoMenu    : 菜单-移出轨迹按钮
             * mapAddAreaMenu           : 添加选区菜单
             * mapClickAreaMenu         : 点击选区菜单
             * mapClickAreaSearchMenu   : 选区菜单-检索功能
             * mapClickKeyAreaMenu      : 重点区域菜单
             * mapExtendAreaMenu        : 选区菜单-扩展
             * mapRemoveAreaMenu        : 选区菜单-删除
             * mapAddKeyAreaMenu        : 添加重点区域菜单
             *
             */
            mapAddTopoMenu:function(div){
                div.style.zIndex = "9999";
                $(div).appendTo(map.getContainer());
            },
            mapRemoveTopoMenu:function(){
                //删除
                d3.select("#newDiv").remove();
                mapdisk = false;
                let markerId = mapCommon.mapWorkMarker[0].id;
                let ids = [];
                if(shiftSign){
                    shiftGraphic.forEach(sg => ids.push(sg.baseMsg.id) );
                    deleteMarker(ids);
                }else{
                    ids.push(markerId);
                    deleteMarker(ids);
                }
            },
            mapMoveTopoMenu:function(aaa){
                //移动
                d3.select("#newDiv").remove();
                let marker = mapCommon.mapWorkMarker[0];
                marker.dragging.enable();
                mapSetIcon(marker,"marker-move");
                marker.showType = "move";
            },
            mapSaveTopoMenu:function(){
                //存点
                let thisMarker = mapCommon.mapWorkMarker[0];
                var propertyName;
                if(thisMarker.type === "PERSON"){
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
                                thisMarker.gis.lon,
                                thisMarker.gis.lat
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
                        thisMarker.dragging.disable();
                        mapSetIcon(thisMarker,"marker");
                        thisMarker.showType = "marker";
                        showAlert("提示!", datas.message, "#33d0ff");
                    } else {
                        showAlert("提示!", datas.message, "#ffc000");
                    }
                });
                d3.select("#newDiv").remove();
            },
            mapCheckTopoMenu:function(){
                //查看
                d3.select("#newDiv").remove();
                mapSaveLocalStorage();
            },
            mapOffTopoMenu:function(){
                d3.select("#newDiv").remove();
            },
            mapExtendTopoMenu:function(aaaa, extendSign){
                //扩展
                var thisMarker = mapCommon.mapWorkMarker[0];
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
                    mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "multi", Id, nodeType, nodeId, toData);
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
                d3.selectAll("#newDiv").remove();
                mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", toData.Id, toData.nodeType, toData.nodeId, toData.systemId);
            },
            mapPathTopoMenu:function(aaaa){
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                mapPathBasePoint = mapCommon.mapWorkMarker[0];
                mapPathSgin = true;
            },
            mapRemovePathTopoMenu:function(aaaa){
                //移除轨迹
                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                map.scrollWheelZoom.enable();//启用滚轮放大缩小，默认禁用
                map.doubleClickZoom.enable();//启用鼠标双击放大

                $(".map_path").hide();
                mapPathSgin = false;
                trackInterval.forEach(ti => { clearInterval(ti); });
                trackGroup.clearLayers();
            },
            mapAddAreaMenu:function(e){
                //var e = mapCommon.mapWorkArea.thisClick;
                var div = document.createElement("div");
                div.setAttribute("id", "newDiv");
                div.style.position = "absolute";
                div.style.left = parseFloat(e.x)-248 + "px";
                div.style.top = parseFloat(e.y)-288 + "px";
                div.style.fontSize = "12px";
                div.style.zIndex = "9999";
                var svg = $("<svg class='complexCustomOverlay' style='width: 500px;height: 500px; cursor:pointer;'> </svg>").appendTo(div);
                map.getMapContainer().appendChild(div);
            },
            mapClickAreaMenu:function(e, sign){
                mapStatistics(mapCommon.mapWorkArea.areaLays.multipleEntity);
            },
            mapClickAreaSearchMenu:function(sign){
                 let oldPoints = mapCommon.mapWorkArea.areaLays.points;
                 let oldLat = [];
                 let oldLon = [];
                 function sortNumber(a,b){
                    return a - b
                 }
                 oldPoints.forEach(op => {
                 oldLon.push(op.x);
                 oldLat.push(op.y);
                 });
                 oldLon = [...new Set(oldLon)].sort(sortNumber);
                 oldLat = [...new Set(oldLat)].sort(sortNumber);
                 function getLonLat(ol){
                    let numl = new Number( ol[0] + ((ol[1]-ol[0]) * Math.random()) );
                    return numl.toFixed(6);
                 }

                 let asMarkers = [
                     {
                         id: "asdqwrewtwqrqw",
                         type: "PERSON",
                         objectType: "entity",
                         pageType:"entity",
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
                         pageType:"entity",
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
                         pageType:"entity",
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
                         pageType:"entity",
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
                 changeMarkerType();
                 //从datas 添加重点人，去重， 状态为选中
                 let mapStepOverlays = [];
                 let changeId = [];
                 for (let i = 0; i < asMarkers.length; i++) {
                 let haveMarker = mapRepeat(asMarkers[i],"marker");
                 if (!haveMarker) {//不重复，在这进行加点操作：
                 let conf = { type: "keyarea"};
                 let marker = addMapOverlays(asMarkers[i], "marker", conf);
                 let step = {data: marker, type: "marker"};
                 mapStepOverlays.push(step);
                 changeId.push(asMarkers[i].id);
                 }else{ //重复的，改为选中状态
                 changeId.push(asMarkers[i].id);
                 }
                 }

                 changeMarkerType(changeId);
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
                var clickArea = mapCommon.mapWorkArea.areaLays;
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
                    changeMarkerType(); //地图上点还原
                    //从datas 添加重点人，去重， 状态为选中
                    let mapStepOverlays = [];
                    let changeId = [];
                    for (let i = 0; i < asMarkers.length; i++) {
                        let haveMarker = mapRepeat(asMarkers[i],"marker");
                        if (!haveMarker) {//不重复，在这进行加点操作：
                            let conf = { type: "keyarea"};
                            let marker = addMapOverlays(asMarkers[i], "marker", conf);
                            let step = {data: marker, type: "marker"};
                            mapStepOverlays.push(step);
                            changeId.push(asMarkers[i].id);
                        }else{ //重复的，改为选中状态
                            changeId.push(asMarkers[i].id);
                        }
                    }
                    changeMarkerType(changeId);
                    if(mapStepOverlays){
                        mapStep.push(mapStepOverlays);
                        mapType.push("add");
                        mapStepNum++;
                    }

                };
                let judgment = function() { return false; };
                mapCommonPart.ajaxAppMap(areaurl,'POST',areadata,completed,succeed,judgment,null,true);

                setTitle();
                map.refresh();
            },
            mapClickKeyAreaMenu:function(sign){
                let areaAttr = mapCommon.mapKeyArea.areaLays;
                if(sign === "delete"){
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
                            $("#map_area_statistics").click();
                            $("#map_area_statistics").click();
                            showAlert("提示!", datas.message, "#33d0ff");
                        } else {
                            showAlert("提示!", datas.message, "#ffc000");
                        }
                    };
                    let judgment = function() { return false; };
                    mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);
                }
                if(sign === "peoplemove"){
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
                    var conf = {
                        size:5
                    };
                    returnData.forEach( rd => { testrun(rd); });

                    function testrun (rd){
                        var timerun = 0;
                        var timerunInterval = setInterval(function () {
                            conf.size = 5;
                            if(timerun<5){
                                conf.size = conf.size - timerun*0.3;
                                addMapOverlays(rd, "peopleMove",conf);
                                timerun++;
                            }else{
                                clearInterval(timerunInterval);
                            }
                        },100);
                    }

                    return '';

                    const url = EPMUI.context.url + '/object/getPeopleMove';
                    let data = {"areaId":areaAttr.id};
                    let completed = function (){ return false; };
                    let succeed = function(returnData) {
                        var conf = { size:5 };
                        returnData.forEach( rd => { testrun(rd); });

                        function testrun (rd){
                            var timerun = 0;
                            var timerunInterval = setInterval(function () {
                                if(timerun<5){
                                    addMapOverlays(rd, "peopleMove",conf);
                                    timerun++;
                                }else{
                                    clearInterval(timerunInterval);
                                }
                            },100);
                        }
                    };
                    let judgment = function() { return false; };
                    mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);

                }
                if(sign === "analyse"){//区域分析
                    return '';
                    if(areaAttr.analyse){
                        var allOverlays = map.getOverlays();
                        for(var k=0;k<allOverlays.length;k++) {
                            if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type == "areaMarker") {//在这写判断，并且id要和对应选区相同
                                if(allOverlays[k].hasOwnProperty("areaid")&&allOverlays[k].areaid == areaAttr.id){
                                    map.removeOverlay(allOverlays[k]);
                                }
                            };
                        }
                        areaAttr.analyse = false;
                        areaStatisticsSignClick = false;
                    }else{//未统计，开始统计
                        //请求后端，获得数据
                        var areadata = [];
                        if (areaAttr.type == "polygon"){
                            areadata = [
                                {
                                    area:"金凤区",
                                    gis:{
                                        lon: 106.228217,
                                        lat: 38.497279
                                    },
                                    classify:["危险事件","犯罪人员","车祸报告","险情信息","涉疆人员"],
                                    classifyValue:[23,55,76,55,146],
                                    classifyUnit:["件","人","条","条","人"]
                                }
                            ];
                        }else {
                            areadata = [
                                {
                                    area:"湖滨西街",
                                    gis:{
                                        lon: 109.272773,
                                        lat: 32.483666
                                    },
                                    classify:["危险事件","犯罪人员","涉疆人员"],
                                    classifyValue:[23,55,76],
                                    classifyUnit:["件","人","人"]
                                },
                                {
                                    area:"贺兰山路",
                                    gis:{
                                        lon: 96.239716,
                                        lat: 48.506033
                                    },
                                    classify:["危险事件","犯罪人员","涉疆人员"],
                                    classifyValue:[23,55,76],
                                    classifyUnit:["件","人","人"]
                                }
                            ];
                        }

                        areaStatistics(areadata);
                        if(map.getZoom()<5){
                            map.setZoom(5);
                        }
                        areaAttr.analyse = true;
                        areaStatisticsSignClick = true;
                    }
                }
            },

            mapExtendAreaMenu:function(e, sign){
                let thir = "multi",
                    Id = [],
                    nodeType = [],
                    nodeId = [],
                    multipleEntity = mapCommon.mapWorkArea.areaLays.multipleEntity;

                d3.selectAll("#newDiv").remove();//先把圆环删除咯
                map.scrollWheelZoom.enable();//启用滚轮放大缩小，默认禁用
                map.doubleClickZoom.enable();//启用鼠标双击放大
                for (let i=0;i<multipleEntity.length;i++){
                    Id.push(multipleEntity[i].id);
                    nodeType.push(multipleEntity[i].baseMsg.type);
                    nodeId.push(multipleEntity[i].baseMsg.nodeId);
                }
                mapCommonPart.mapMainRadraw(multipleEntity, thir, Id, nodeType, nodeId, sign);
                Id = [];
                nodeType = [];
                nodeId = [];

            },
            mapRemoveAreaMenu:function(aaaa, sign){
                let area = mapCommon.mapWorkArea.areaLays;
                if (sign === 0) {
                    areaGroup.removeLayer(area);
                }
                if (sign === 1) {// 删除内点
                    mapSelectArea(area.multipleEntity, "delInPoint");
                }
                if (sign === 2) {// 删除外点
                    mapSelectArea(area.multipleEntity, "delOutPoint");
                }
                d3.select("#newDiv").remove();
                map.scrollWheelZoom.enable();//启用滚轮放大缩小，默认禁用
                map.doubleClickZoom.enable();//启用鼠标双击放大
            },
            mapAddKeyAreaMenu:function(){
                let areaurl;
                let areadata;
                var clickArea = mapCommon.mapWorkArea.areaLays;
                if(clickArea.type==="circle"){
                    areadata = {
                        "shape": "circle",
                        "radius": clickArea.radius,
                        "lon": clickArea.center.x,
                        "lat": clickArea.center.y
                    };
                    areaurl = EPMUI.context.url + '/object/saveCircleGis';
                }else if(clickArea.type==="polygon"){
                    var polygonPoints = areaGraphic.points;
                    var lonUse = [];
                    var latUse = [];
                    for(var i=0;i<polygonPoints.length;i++){
                        lonUse.push(parseFloat(polygonPoints[i].x));
                        latUse.push(parseFloat(polygonPoints[i].y));
                    }
                    areadata = {
                        "shape": "polygon",
                        "lon": lonUse,
                        "lat": latUse
                    };
                    areaurl = EPMUI.context.url + '/object/savePolygonGis';
                }else if(clickArea.type==="rectangle"){
                    var rectPoints = clickArea.points;
                    var lonUse = [rectPoints[0].x,rectPoints[1].x,rectPoints[1].x,rectPoints[0].x,rectPoints[0].x];
                    var latUse = [rectPoints[0].y,rectPoints[0].y,rectPoints[1].y,rectPoints[1].y,rectPoints[0].y];
                    areadata = {
                        "shape": "rectangle",
                        "lon": lonUse,
                        "lat": latUse
                    };
                    areaurl = EPMUI.context.url + '/object/savePolygonGis';
                }

                let completed = function (){ return false; };
                let succeed = function(data) {
                    if (!data) {
                        return false;
                    }
                    var datas = data;
                    if (parseInt(datas.code) === 200) {
                        showAlert("提示!", datas.message, "#33d0ff");
                    } else {
                        showAlert("提示!", datas.message, "#ffc000");
                    }
                };
                let judgment = function() { return false; };
                mapCommonPart.ajaxAppMap(areaurl,'POST',areadata,completed,succeed,judgment,null,true);
            },
            getFilterIdType:function(){
                let allOverlays = markerGroup.getLayers();
                let filters = [];
                for(let j=0;j<allOverlays.length;j++){
                    let obj = {
                        id:allOverlays[j].id,
                        type:allOverlays[j].type
                    };
                    filters.push(obj);
                }
                return filters;
            },
            getFilterLinks:function(){
                window.filterLinks = [];
                let allLines = curveGroup.getLayers();
                for(let j=0;j<allLines.length;j++){
                    let allLinesAttrs = allLines[j].attrs;
                    let obj = {
                        relationTypeName:allLinesAttrs.relationTypeName,
                        relationId:allLinesAttrs.relationId,
                        relationParentType:allLinesAttrs.relationParentType
                    };
                    window.filterLinks.push(obj);
                }
            }

        }
    }
})();