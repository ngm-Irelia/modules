/**
 * Created by ngm on 2017/12/5.
 *
 * 演示修改  mapLineColor 线条颜色  marker-move.svg 颜色   点的title颜色
 */
var PGIS = window.PGIS = PGIS || {};

(function() {
  PGIS.pgis = pgis;
  function pgis() {
    var map,
      bayonetLayer, //卡口图层
      bayonetGroupLayer,// 卡口 图层组
      bayonetSign=false,//卡口 显示状态
      loadBayonetSign = false, // 是否加载卡口数据
      mapShowSign = false,//判断设置菜单显示隐藏
      mapthemeType = "blue",//判断地图主题
      mapHeatSign = false,//热力图
      mapSmallSign = false,//点状图
      mapFontStatus = true,// 文字显示
      mapLineStatus = true,// 线条显示
      gisToolSign = false,// 选区标志
      gisDrawingType = '', //绘制选区类型
      mapdisk = false,
      markerClusterer, //聚合
      trackInterval = [],//轨迹的所有计时器
      overOutInterval = [], //marker over&out计时器
      mapPathSgin = false,//地图轨迹标志
      mapPathBasePoint,//地图轨迹基本点信息
      keyAreaSign = false,//重点区域标志
      areaStatisticsSign = false,//区域统计的标志
      areaStatisticsSignClick = false,//区域统计 是否点击标志
      markerClustererSign = false,//聚合标志
      shiftSign = false,
      noGisPoints = [],//存放无经纬度的点
      shiftGraphic = [],// 存放shift状态下graphic的信息
      mapLineColor = ["#000", "#000", "#000", "#000", "#000", "#000"],//["#f99070", "#ce1e1e", "#a1f480", "#70f9ee", "#ff780c", "#3dbcc2"],
      lineNames = [],//线条关系数组
      mapStep = [],//保存上一步数据
      mapType = [],//保存上一步操作类型
      mapStepNum = 0;//保存上一步操作顺序数组的长度
    window.mapCommon = {
      mapWorkMarker:[],
      mapWorkArea:{},
      mapKeyArea:{}
    };//存放正在操作的点
    window.mapAdvanceSearchFlag = localStorage.mapAdvanceSearchFlag ? localStorage.mapAdvanceSearchFlag : "false";

    window.circleSize = 0;//计算圆的个数
    window.dblx = 0;
    window.dbly = 0;

    //加载地图
    this.run = function () {
      //$("#map_gis_table").css("display","none");
      //$("#map_area_statistics").css("display","none");
      //$("#map_event_visual").css("display","none");
      mapload = true;
      map = new EzMap(document.getElementById("basemap"));//构造地图控件对象，用于装载地图
      map.initialize();//初始化地图，并显示地图
      //map.showMapControl();//显示左侧导航工具条
      $("#div").css("width","100%").children("div").css("width","100%");
      $(".map_select_title").css("width","66px");
      this.mapLeftSelect();//左侧搜索框
      // 多选点 shift
      $(document).keydown(function(event){
        if (event.keyCode == 16) {
          shiftSign = true;
        }
      });
      $(document).keyup(function(event){
        if (event.keyCode == 16) {
          shiftSign = false;
          shiftGraphic = [];
        }
      });
      //移动地图事件
      map.addMapEventListener(EzEvent.MAP_PAN, function(e) {
        d3.selectAll("#newDiv").remove();
        setTitle();
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
      //点击地图事件
      map.addMapEventListener(EzEvent.MAP_CLICK, function(e) {
        //!mapdisk ? map.enableDoubleClickZoom(true) : null;//启用鼠标双击放大
      });
      //双击地图事件
      map.addMapEventListener(EzEvent.MAP_DBLCLICK, function(e) { });
      //地图缩放
      map.addMapEventListener(EzEvent.MAP_ZOOMEND,function(){
        d3.selectAll("#newDiv").remove();
        setTitle();
        d3.selectAll("#asDiv").remove();
      });
      //地图加载完毕
      map.addMapEventListener(EzEvent.MAP_READY, function(e) { });
      //this.addLocalStorageMarker();//添加localstorage中点

      // let aa = new EzServerClient.Layer();  // 不行，看源码里面直接为空？

      /*bayonetLayer = new EzLayer(new QueryObject());



       let picon = new Icon();
       let pTitle;//点上文字

       picon.image = "../../image/gis/marker-move.svg";
       picon.height = 25;
       picon.width = 25;
       pTitle = new Title("我是测试点！！",12,7,"宋体","#000","#0099ff","#0099ff",0.1);


       let point = new Point(106.123, 33.123);
       let marker = new Marker(point, picon, pTitle);

       bayonetLayer.setFeatures([marker]);


       bayonetGroupLayer = new EzServerClient.GroupLayer("bayonetLayer", bayonetLayer);

       map.addGroupLayer(bayonetGroupLayer);

       setTimeout(function(){
       console.log(" map.getGroupLayer() -- - - - -- - ");
       console.log( map.getGroupLayer());


       console.log(" bayonetLayer -- - - - -- - ");
       console.log( bayonetLayer);
       },2000);*/

    };
    // 添加localStorage()中的点,历史保留点
    this.addLocalStorageMarker = function (){
      let historyDatas = localStorage.mapOverlays ? JSON.parse(localStorage.mapOverlays): "false";//跳转出保存的缓存数据
      if(historyDatas !== "false" ){
        addMapMarkerLine(historyDatas.overlaysMarker,historyDatas.overlaysLine,"topo");
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
    //加点和线功能
    this.addPoint = function (gisnodes,gislinks) {
      mapStep = [];
      mapType = [];
      mapStepNum = 0;
      addMapMarkerLine(gisnodes,gislinks,"topo");
      setTitle();
    };
    //拖拽加点
    this.addOnePoint = function (gisDatas) {
      let mapStepOverlays = [];//用于放入mapStep
      if(gisDatas.hasOwnProperty("gis") && gisDatas.gis !== null){
        let haveMarker = mapRepeat(gisDatas,"marker");
        if(!haveMarker){//不重复，才加点
          changeMarkerType();
          let conf = { type: "drag"};
          let marker = addMapOverlays(gisDatas, "marker", conf);
          let step = {
            data:marker,
            type:"marker"
          };
          mapStepOverlays.push(step);
          mapStep.push(mapStepOverlays);
          mapType.push("dragadd");
          mapStepNum++;
        }else{//重复，高亮该点
          let pointArr = [];
          pointArr.push(gisDatas.id);
          changeMarkerType(pointArr);
        }
      }
      if(gisDatas.hasOwnProperty("gis") && gisDatas.gis == null){
        noGisPoints.push(gisDatas);
        mapCommonPart.mapTooltip();//提示信息
      }
      //mapSetAggregation("reset");
      setTitle();
      map.refresh();
    };
    //左侧搜索框
    this.mapLeftSelect = function () {
      let mapSet = mapCommonPart.addSearchModule();//建立dom元素
      $("#basemap").append(mapSet);// 添加DOM元素到地图中
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
    //清屏功能
    this.resetscreen = function () {
      map.clearOverlays();//删除所有点
      localStorage.removeItem("mapOverlays");
    };
    //后退
    this.backStep = function () {
      if(mapStepNum>0){
        let del = mapStep[mapStepNum-1];
        if(mapType[mapStepNum-1] === "add"){//删除对应点
          for(let i=0;i<del.length;i++){
            let allOverlays = map.getOverlays();
            if(del[i].type === "marker"){
              for(let j=0;j<allOverlays.length;j++){
                if(allOverlays[j].hasOwnProperty("id")&&allOverlays[j].id===del[i].data.id){
                  map.removeOverlay(allOverlays[j]);
                }
              }
            }else if(del[i].type === "polyline"){//删除线
              for(let j=0;j<allOverlays.length;j++){
                if(allOverlays[j].hasOwnProperty("polylineid")){
                  if((allOverlays[j].sourceid===del[i].data.sourceid&&allOverlays[j].targetid===del[i].data.targetid)||(allOverlays[j].targetid===del[i].data.sourceid&&allOverlays[j].sourceid===del[i].data.targetid)){
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
        }else if(mapType[mapStepNum-1] === "dragadd"){//删除拖拽点
          for(let i=0;i<del.length;i++){
            let allOverlays = map.getOverlays();
            if(del[i].type === "marker"){
              for(let j=0;j<allOverlays.length;j++){
                if(allOverlays[j].hasOwnProperty("id")&&allOverlays[j].id===del[i].data.id){
                  map.removeOverlay(allOverlays[j]);
                }
              }
            }
          }
          // 数组变化
          mapStep.splice(mapStepNum-1,1);
          mapType.splice(mapStepNum-1,1);
          mapStepNum = mapStepNum-1;
        }else if(mapType[mapStepNum-1]==="del"){//还原对应点 线
          for(let i=0;i<del.length;i++){
            if(del[i].type === "marker"){
              let marker = del[i].data;
              markerEvent(marker);
              map.addOverlay(del[i].data);     //添加点到地图上

            }
          }
          for(var i=0;i<del.length;i++){
            if(del[i].type === "polyline"){
              map.addOverlay(del[i].data);     //添加折线到地图上
              //添加标注关系
              var polyline = del[i].data;
              var line = polyline.getPoints();
              var centerNum = parseInt(line.length/2);
              var lineCenter = line[centerNum];
              var conf = {
                lineCenter : lineCenter,
                polyline : polyline
              };
              marker = addMapOverlays(polyline, "curveMarker", conf);
            }
          }
          // 数组变化
          mapStep.splice(mapStepNum-1,1);
          mapType.splice(mapStepNum-1,1);
          mapStepNum = mapStepNum-1;
        }else if(mapType[mapStepNum-1]==="addCurve"){//删除对应 轨迹 点和线
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
      setTitle();
      map.refresh();
    };
    //过滤器
    this.filterMapMarker = function (relationArr,sign){
      if(sign === "relation"){
        var allOverlays = map.getOverlays();
        var selectedId = [];
        for(var j=0;j<relationArr.length;j++){
          for(var i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("polylineid")&&allOverlays[i].relationTypeName==relationArr[j]){
              selectedId.push(allOverlays[i].sourceid);
              selectedId.push(allOverlays[i].targetid);
            }
          }
        }
        changeMarkerType(selectedId);
      }else if(sign === "node"){ //节点过滤
        changeMarkerType(relationArr);
      }
    };
    //搜索
    this.searchNodes = function (searchnodes){
      if(searchnodes === "no"){
        changeMarkerType();
      }else{
        let dataId = [];
        searchnodes.forEach( d => {  dataId.push(d.id); } );
        changeMarkerType(dataId);
      }
    };
    //卡口信息图层
    this.bayonet = function(){
      if(bayonetSign){//隐藏 卡口图层
        var allOverlays = map.getOverlays();
        for(var i=0;i<allOverlays.length;i++){
          if(allOverlays[i].hasOwnProperty("type")&&allOverlays[i].type === "KKXX"){
            map.removeOverlay(allOverlays[i]);
          }
        }

        map.refresh();
        bayonetSign = false;
      }else{//显示卡口图层
        /* let returnBayonetData = [
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
         ];*/

        /*for(let k=0;k<returnBayonetData.length;k++){
         let bayonet = addMapOverlays(returnBayonetData[k], "bayonet");
         }*/

        var allOverlays = map.getOverlays();
        for(var i=0;i<allOverlays.length;i++){
          if(allOverlays[i].hasOwnProperty("type")&&allOverlays[i].type === "KKXX"){
            map.removeOverlay(allOverlays[i]);
          }
        }

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

        map.refresh();
        bayonetSign = true;
      }
    };
    //经纬度信息表
    this.showGisTable = function (){
      var gisTableHtml = '';
      var eventdata = ["飞机出行","住宿事件","通话事件","火车出行","住宿事件","通话事件","通话事件","火车出行","住宿事件","通话事件","通话事件","火车出行","住宿事件"];
      for(var i=1;i<=10;i++){
        gisTableHtml+= '<tr>'+
          '<td id="gis_table_property_num" class="gis_table_property">'+
          '<span>'+ i +'</span>'+
          '</td>'+
          '<td id="gis_table_property_type" class="gis_table_property">'+
          '<span>实体</span>'+
          '</td>'+
          '<td id="gis_table_property_name" class="gis_table_property">'+
          '<span>赵东来</span>'+
          '</td>'+
          '<td id="gis_table_property_address" class="gis_table_property">'+
          '<span>福建省福州市</span>'+
          '</td>'+
          '<td id="gis_table_property_event" class="gis_table_property">'+
          '<span>'+eventdata[i]+'</span>'+
          '</td>'+
          '<td id="gis_table_property_time" class="gis_table_property">'+
          '<span>2017-11-09</span>'+
          '</td>'+
          '</tr>';
      }
      $(".gis_table_tbody").html(gisTableHtml);

      //分页功能 100 换为 数组的长度
      var mapTablePages = 234100/10;
      var totalpages = mapTablePages.toFixed(0);
      $(".gis-table-page").mappagination(totalpages, {
        callback : mapTableCallback,
        prev_text : '< 上一页',
        next_text: '下一页 >',
        num_display_entries : 5,
        current_page: 0,
        num_edge_entries : 1
      });

      //分页回掉
      function mapTableCallback(index){
        //判断是不是高级搜索
        mapTableSearch(index);
        $(".current").css("background","#299ABD");
        $(".current").css("color","#fff");

      }

      // 找到对应数组中数据，显示
      function mapTableSearch(index){
        //console.log(index);
      }

    };
    //marker的操作事件
    function markerEvent(marker) {
      marker.addListener("click", function(e){
        if(marker.type === "KKXX"){
          return '';
        }else{
          getBaseMessage(true,marker.id, marker.type, true);//基础信息展示
          let gisDatasArr = [];
          gisDatasArr.push(marker.id);
          changeMarkerType(gisDatasArr);
        }
      });
      marker.addListener("dblclick", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if(!mapSmallSign){
          mapdisk = true;
          var conf = {
            thisMarker:marker,
            markerId:marker.id,
            gis:marker.gis,
            nodeId:marker.baseMsg.nodeId,
            nodeType:marker.baseMsg.type,
            objectType:marker.baseMsg.objectType,
            page_type:marker.baseMsg.page_type,
            getLeft:parseFloat(e.x)-238-10, //-327
            getTop:parseFloat(e.y)-238-58//-248
          };
          d3.selectAll("#newDiv").remove();
          setmapProperty("null","zoom-false","dbl-false");
          mapCommon.mapWorkMarker = [];
          mapCommon.mapWorkMarker.push(marker);
          mapCommonPart.topomenu(conf);

          if(marker.type === "KKXX"){
            mapCommonPart.topomenu(conf,"kkmenu");
          }else{
            mapCommonPart.topomenu(conf,"topomenu");
          }

        }
      });
      marker.addListener("mouseover", function(e) {
        if(marker.showType === "marker"){
          let markImg  = marker.div;
          $(markImg).attr("src","../../image/gis/marker-hover.svg")
        }
        var overInterval = setTimeout(function () {
          var thisMarker = marker;
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            var hideOverCurve = true;
            var hideOverCurveTitle = true;
            if(allOverlays[i].hasOwnProperty("sourceid")){
              if((allOverlays[i].sourceid==thisMarker.id || allOverlays[i].targetid==thisMarker.id)){
                hideOverCurve = false;
              }
              hideOverCurve ? allOverlays[i].setOpacity(0) : null;
            }
            if(allOverlays[i].hasOwnProperty("curveTitle")){
              if(thisMarker.id == allOverlays[i].source.id || thisMarker.id == allOverlays[i].target.id){
                hideOverCurveTitle = false;
              }
              hideOverCurveTitle ? allOverlays[i].hideTitle() : null;
            }
          }
          setTitle();
          map.refresh();
        },1000);
        overOutInterval.push(overInterval);
      });
      marker.addListener("mouseout", function(e) {
        if(marker.showType === "marker"){
          let markImg  = marker.div;
          $(markImg).attr("src","../../image/gis/marker.svg")
        }
        overOutInterval.forEach(ooi => clearTimeout(ooi));
        if(!mapHeatSign && !mapSmallSign){//不是热力图和小点图
          setTimeout(function(){
            var allOverlays = map.getOverlays();
            for(var i=0;i<allOverlays.length;i++){
              //显示原来线条和关系
              if(allOverlays[i].hasOwnProperty("sourceid")){
                allOverlays[i].setOpacity(1);
              }
              if(allOverlays[i].hasOwnProperty("curveTitle")){
                allOverlays[i].showTitle();
              }
            }
            setTitle();
            map.refresh();
          },10);
        }
      });
    }
    //添加覆盖物
    function addMapOverlays(overlays, sign, conf){

      if(sign === "marker"){
        let showType;
        let nogis = false;
        let picon = new Icon();
        let pTitle;//点上文字
        //加点
        if(overlays.hasOwnProperty("nogis") && overlays.nogis){
          showType = "move";
          nogis = true;
          noGisPoints.push(overlays);
          picon.image = "../../image/gis/marker.svg";
          picon.height = 25;
          picon.width = 25;
          pTitle = new Title(overlays.name,12,7,"宋体","#000","#0099ff","#0099ff",0.1);
        }else{
          if(conf.type === "add"){
            showType = "marker";
            picon.image = "../../image/gis/marker.svg";
            picon.height = 25;
            picon.width = 25;
            pTitle = new Title(overlays.name,12,7,"宋体","#000","#fff","blue",0.1);
          }
          if(conf.type === "move"){
            showType = "move";
            picon.image = "../../image/gis/marker.svg";
            picon.height = 25;
            picon.width = 25;
            pTitle = new Title(overlays.name,12,7,"宋体","#000","#0099ff","#0099ff",0.1);
          }
          if(conf.type === "hover"){
            showType = "hover";
            picon.image = "../../image/gis/marker-hover.svg";
            picon.height = 25;
            picon.width = 25;
            pTitle = new Title(overlays.name,12,7,"宋体","#000","#fff","black",0.1);
          }
          if(conf.type === "click"){
            showType = "click";
            picon.image = "../../image/gis/marker-click.svg";
            picon.height = 25;
            picon.width = 25;
            pTitle = new Title(overlays.name,12,7,"宋体","#000","#fff","red",0.1);
          }
          if(conf.type === "drag"){
            showType = "click";
            picon.image = "../../image/gis/marker-click.svg";
            picon.height = 25;
            picon.width = 25;
            pTitle = new Title(overlays.name,12,7,"宋体","#000","#fff","red",0.1);
          }if(conf.type === "keyarea"){
            showType = "click";
            picon.image = "../../image/gis/marker-click.svg";
            picon.height = 25;
            picon.width = 25;
            pTitle = new Title(overlays.name,12,7,"宋体","#000","#fff","red",0.1);
          }
        }

        let point = new Point(overlays.gis.lon, overlays.gis.lat);
        let marker = new Marker(point, picon, pTitle);

        map.addOverlay(marker);

        marker.type= overlays.type;
        marker.name= overlays.name;
        marker.id= overlays.id;
        marker.gis= overlays.gis;
        marker.addnode= true;
        marker.baseMsg = overlays;
        marker.ableDrag = "false";
        marker.showType = showType;
        if(nogis){ marker.nogis= true; }
        mapFontStatus ? marker.showTitle() : marker.hideTitle();
        function moveFunc(e) {
          //移动后，对应线条位置移动
          var thisMarker = marker;
          marker.gis = {
            lon:thisMarker.point.x,
            lat:thisMarker.point.y
          };
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("sourceid")){
              if((allOverlays[i].sourceid==thisMarker.id)){
                var allOver = map.getOverlays();
                for(var k=0;k<allOver.length;k++){
                  if(allOver[k].hasOwnProperty("curveTitle")){
                    if((allOver[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid))&&allOver[k].relationTypeName == allOverlays[i].relationTypeName){
                      map.removeOverlay(allOver[k]);
                    }
                  }
                }

                var obj = {
                  polylineid : allOverlays[i].polylineid,
                  sourceid :allOverlays[i].sourceid,
                  targetid : allOverlays[i].targetid,
                  relationId : allOverlays[i].relationId,
                  relationParentType : allOverlays[i].relationParentType,
                  relationTypeName : allOverlays[i].relationTypeName,
                  time : allOverlays[i].time,
                  source :allOverlays[i].source,
                  target : allOverlays[i].target,
                  tag : allOverlays[i].tag,
                  targetgis : allOverlays[i].targetgis,
                  sourcegis : allOverlays[i].sourcegis,
                  linesize : allOverlays[i].linesize
                };
                obj.source.gis = {
                  lon:thisMarker.point.x,
                  lat:thisMarker.point.y
                };
                var conf = { linesizeNum : allOverlays[i].linesize };
                var polyline = addMapOverlays(obj, "curve", conf);
                // --
                var line = polyline.getPoints();
                var linelength = line.length;
                var markerCurve;
                if(linelength>3){
                  var centerNum = parseInt(linelength/2);
                  var centerLine = line[centerNum];

                  var conf = {
                    lineCenter : centerLine,
                    polyline : polyline
                  };
                  markerCurve = addMapOverlays(polyline, "curveMarker", conf);
                }
                map.removeOverlay(allOverlays[i]);
              }
              if((allOverlays[i].targetid==thisMarker.id)){
                var allOver = map.getOverlays();
                for(var k=0;k<allOver.length;k++){
                  if(allOver[k].hasOwnProperty("curveTitle")){
                    if((allOver[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid))&&allOver[k].relationTypeName == allOverlays[i].relationTypeName){
                      map.removeOverlay(allOver[k]);
                    }
                  }
                }

                var obj = {
                  polylineid : allOverlays[i].polylineid,
                  sourceid :allOverlays[i].sourceid,
                  targetid : allOverlays[i].targetid,
                  relationId : allOverlays[i].relationId,
                  relationParentType : allOverlays[i].relationParentType,
                  relationTypeName : allOverlays[i].relationTypeName,
                  time : allOverlays[i].time,
                  source :allOverlays[i].source,
                  target : allOverlays[i].target,
                  tag : allOverlays[i].tag,
                  targetgis : allOverlays[i].targetgis,
                  sourcegis : allOverlays[i].sourcegis,
                  linesize : allOverlays[i].linesize
                };
                obj.target.gis = {
                  lon:thisMarker.point.x,
                  lat:thisMarker.point.y
                };
                var conf = { linesizeNum : allOverlays[i].linesize };
                var polyline = addMapOverlays(obj, "curve", conf);

                var line = polyline.getPoints();
                var linelength = line.length;
                var markerCurve;
                if(linelength>3){
                  var centerNum = parseInt(linelength/2);
                  var centerLine = line[centerNum];

                  var conf = {
                    lineCenter : centerLine,
                    polyline : polyline
                  };
                  markerCurve = addMapOverlays(polyline, "curveMarker", conf);
                }
                map.removeOverlay(allOverlays[i]);
              }
            }

          }

          setTitle();
          map.refresh();

        }
        if(marker.showType === "move"){
          marker.startMove(moveFunc);
        }
        markerEvent(marker);
        return marker;
      }
      if(sign === "curve"){
        var points = [];
        var pointStr = "";
        var returnPoints = mapCommonPart.getCurveByTwoPoints(overlays.source, overlays.target, conf.linesizeNum);
        if(returnPoints){
          pointStr += returnPoints[0].lon +","+ returnPoints[0].lat;
        }
        for(var k=1;k<returnPoints.length;k++){
          pointStr += ","+ returnPoints[k].lon +","+ returnPoints[k].lat;
        }
        var strokeColor = lineNames.length > 1 ? mapLineColor[lineNames.indexOf(overlays.relationParentType)]:'#000';
        var polyline = new Polyline(pointStr,strokeColor, 1,1);// 构造一个多义线对象

        polyline.polylineid = overlays.source.id;
        polyline.sourceid = overlays.source.id;
        polyline.targetid = overlays.target.id;
        polyline.relationTypeName = overlays.relationTypeName;
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

        map.addOverlay(polyline);     //添加折线到地图上

        if(mapLineStatus){//显示该线
          polyline.setOpacity(1);
        }else{//隐藏该线
          polyline.setOpacity(0);
        }

        return polyline;
      }
      if(sign === "curveMarker"){
        var picon = new Icon();
        picon.image = "../../image/gis/marker.svg";
        picon.height = 0.1;
        picon.width = 0.1;
        var point = new Point(conf.lineCenter.x,conf.lineCenter.y);
        //加点上文字
        var pTitle = new Title(overlays.relationTypeName,10,0,"宋体","#fff","#000","#000",0.2);
        var marker = new Marker(point, picon, pTitle);

        marker.id = conf.polyline.source.id + conf.polyline.target.id;
        marker.relationTypeName = conf.polyline.relationTypeName;
        marker.relationId = conf.polyline.relationId;
        marker.relationParentType = conf.polyline.relationParentType;
        marker.target = conf.polyline.target;
        marker.source = conf.polyline.source;
        marker.curveTitle= true;//作为标志

        map.addOverlay(marker);

        if(mapFontStatus && mapLineStatus){
          marker.showTitle();
        }else{
          marker.hideTitle();
        }

        return marker;
      }
      if(sign === "track"){
        var pointStr = "";
        var returnPoints = mapCommonPart.getCurveByTwoPoints(overlays.firstPoint, overlays.secondPoint);
        if(returnPoints){
          pointStr += returnPoints[0].lon +","+ returnPoints[0].lat;
        }
        for(var k=1;k<returnPoints.length;k++){
          pointStr += ","+ returnPoints[k].lon +","+ returnPoints[k].lat;
        }
        var strokeColor = '#0099ff';
        var polyline = new Polyline(pointStr,strokeColor, 1,1);// 构造一个多义线对象

        polyline.trackid = mapPathBasePoint.id;

        map.addOverlay(polyline);     //添加折线到地图上


        var picon = new Icon();//加点
        picon.image = "../../image/gis/circle.png";
        picon.height = 10;
        picon.width = 10;
        var point = new Point(overlays.secondPoint.gis.lon, overlays.secondPoint.gis.lat);
        var pTitle = new Title(overlays.secondPoint.address,12,7,"宋体","#000","#fff","blue",0.1);
        var marker = new Marker(point, picon, pTitle);

        map.addOverlay(marker);
        marker.trackid= mapPathBasePoint.id;
        return polyline;
      }
      if(sign === "peopleMove"){
        var picon = new Icon();
        if(overlays.populationSize<2222){
          picon.image = "../../image/gis/circle.svg";
        }else if(overlays.populationSize>=2222&&overlays.populationSize<5555){
          picon.image = "../../image/gis/circle-green.svg";
        }else if(overlays.populationSize>=5555){
          picon.image = "../../image/gis/circle-red.svg";
        }
        picon.height = conf.size;
        picon.width = conf.size;
        /*populationSize: 1000,
         source:{
         gis: {
         lon: 116.4551,
         lat: 40.2539
         },
         address: "北京"

         },*/
        var point = new Point(overlays.source.gis.lon, overlays.source.gis.lat);
        var marker = new Marker(point, picon);
        map.addOverlay(marker);

        var pointStr = "";
        var returnPoints = mapCommonPart.getCurveByTwoPoints(overlays.source, overlays.target, 0, 90);
        if(returnPoints){
          pointStr += returnPoints[0].lon +","+ returnPoints[0].lat;
        }
        for(var k=1;k<returnPoints.length;k++){
          pointStr += ","+ returnPoints[k].lon +","+ returnPoints[k].lat;
        }

        marker.setInterval(100);// 设置推演的时间间隔为200毫秒,即按路线推演时时间间隔为200毫秒
        marker.setRepeat(false);// 设置推演为不重复推演状态
        marker.setPath(0,returnPoints.length-1,pointStr);// 此函数的意思为：整个路线被设定为10*200毫秒，推演的起始

        marker.addDispStatus(returnPoints.length-1, returnPoints.length-1, 2);
        marker.play();
        /*testTimeout(overlays, marker, returnPoints, conf.size);
         function testTimeout (lays, mark, rPoint, size){
         setTimeout(function () {
         mark.setOpacity(0);
         var testconf = {
         size:size,
         x:rPoint[90].lon,
         y:rPoint[90].lat
         };
         addMapOverlays(lays,"test",testconf)
         },9000)
         }*/
      }
      if(sign === "keyArea"){
        var gisArea;
        var rdgStr;
        var pointStr;
        if(overlays.shape === "circle"){
          pointStr = overlays.centerPoint[0] +","+ overlays.centerPoint[1]+","+ overlays.radius;
          gisArea = new Circle(pointStr,"#A52A2A",1,0.5,"#A52A2A");// 构造一个圆形对象
          gisArea.type = "circle";
        }
        if( overlays.shape === "polygon"){
          rdgStr = overlays.gisPointsStr;
          pointStr = rdgStr[0][0] +","+ rdgStr[0][1];
          for(var k=1;k<rdgStr.length;k++){
            pointStr += ","+ rdgStr[k][0] +","+ rdgStr[k][1];
          }

          gisArea = new Polygon(pointStr,"#A52A2A", 1,0.5,"#A52A2A");// 构造一个多边形对象
          gisArea.type = "polygon";
        }
        if( overlays.shape === "rectangle"){
          rdgStr = overlays.gisPointsStr;
          pointStr = rdgStr[0][0] +","+ rdgStr[0][1];
          for(var k=1;k<rdgStr.length;k++){
            pointStr += ","+ rdgStr[k][0] +","+ rdgStr[k][1];
          }
          gisArea = new Rectangle(pointStr,"#A52A2A", 1,0.5,"#A52A2A");// 构造一个矩形对象
          gisArea.type = "rectangle";
        }
        gisArea.id = overlays.id;
        gisArea.sign = "keyArea";
        map.addOverlay(gisArea);

        gisArea.addListener("dblclick", function(e) {
          e.preventDefault();
          e.stopPropagation();
          mapCommon.mapKeyArea = {};
          mapCommon.mapKeyArea = {
            thisClick:e,
            areaLays:gisArea
          };
          var conf = {
            thisClick:e,
            areaLays:gisArea,
          };
          mapCommonPart.menu(conf,"keyAreamenu");

        });
      }
      if(sign === "bayonet"){
        let showType;
        let nogis = false;
        let picon = new Icon();
        let pTitle;//点上文字
        //加点
        picon.image = "../../image/gis/marker.svg";
        picon.height = 30;
        picon.width = 30;
        pTitle = new Title(overlays.name,12,7,"宋体","#000","#0099ff","#0099ff",0.1);


        let point = new Point(overlays.gis.lon, overlays.gis.lat);
        let marker = new Marker(point, picon, pTitle);

        map.addOverlay(marker);

        marker.type= overlays.type;
        marker.name= overlays.name;
        marker.id= overlays.id;
        marker.gis= overlays.gis;
        marker.baseMsg = overlays;
        marker.ableDrag = "false";
        mapFontStatus ? marker.showTitle() : marker.hideTitle();

        markerEvent(marker);
        return marker;

      }
      if(sign === "test"){
        var picon = new Icon();
        if(overlays.populationSize<2222){
          picon.image = "../../image/gis/circle-ring.svg";
        }else if(overlays.populationSize>=2222&&overlays.populationSize<5555){
          picon.image = "../../image/gis/circle-green-ring.svg";
        }else if(overlays.populationSize>=5555){
          picon.image = "../../image/gis/circle-red-ring.svg";
        }
        picon.height = conf.size*5;
        picon.width = conf.size*5;

        var point = new Point(conf.x, conf.y);
        var marker = new Marker(point, picon);
        map.addOverlay(marker);
        var pointStr = conf.x +","+ conf.y +","+ conf.x +","+ conf.y;
        marker.setInterval(100);// 设置推演的时间间隔为200毫秒,即按路线推演时时间间隔为200毫秒
        marker.setRepeat(false);// 设置推演为不重复推演状态
        marker.setPath(0,1,pointStr);// 此函数的意思为：整个路线被设定为10*200毫秒，推演的起始
        marker.addDispStatus(1, 1, 2);
        marker.play();
        setTimeout(function () {
          marker.setOpacity(0);
        },1000);

      }
    }
    //添加点线
    function addMapMarkerLine(gisnodes,gislinks,topoSign){
      gislinks.forEach(link => lineNames.push(link.relationParentType));
      lineNames = [...new Set(lineNames)];
      var mapTooltipSign = false;//用于判断 提示信息是否显示
      if(topoSign == "topo"){
        map.clearOverlays();//删除所有点
      }
      var gisAllSearchDatas = gisnodes;
      var mapStepOverlays = [];//用于放入mapStep
      for (var i = 0; i < gisAllSearchDatas.length; i ++) {
        if(gisAllSearchDatas[i].hasOwnProperty("nogis")){
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
      if(gislinks != "no"){
        for(var i=0;i<gislinks.length;i++){
          var haveLine = mapRepeat(gislinks[i],"polyline");
          if((gislinks[i].source.gis != null) && (gislinks[i].target.gis != null) ){
            var lineSizeNum = haveLine ? haveLine.length : 170;
            if(haveLine != "have"){
              var conf = { linesizeNum : lineSizeNum };
              var polyline = addMapOverlays(gislinks[i], "curve", conf);

              var line = polyline.getPoints();
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

      setTitle();
      map.refresh();
      //mapSetAggregation("reset");
    }
    //删除点线
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
              }
              mapStepOverlays.push(step);
              //删除对应的点
              map.removeOverlay(allOverlays[i]);
            };
          };
          if(allOverlays[i].hasOwnProperty("polylineid")){
            if(allOverlays[i].sourceid==markerId[n]||allOverlays[i].targetid==markerId[n]){
              var stepM = {
                data:allOverlays[i],
                type:"polyline",
                relationTypeName:allOverlays[i].relationTypeName
              }
              mapStepOverlays.push(stepM);
              map.removeOverlay(allOverlays[i]);

              var lays = map.getOverlays();
              for(var k=0;k<lays.length;k++){
                if(lays[k].hasOwnProperty("curveTitle")){
                  if(lays[k].id == (allOverlays[i].sourceid + allOverlays[i].targetid)){
                    var stepML = {
                      data:lays[k],
                      type:"marker"
                    }
                    //mapStepOverlays.push(stepML);
                    map.removeOverlay(lays[k]);
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
    //改变点的显示样式
    function changeMarkerType(id){
      let allOverlays = map.getOverlays();
      for(var i=0;i<allOverlays.length;i++){//原选中点恢复
        if(allOverlays[i].showType === "click"){
          let markImg = allOverlays[i].div;
          $(markImg).attr("src","../../image/gis/marker.svg");
          allOverlays[i].showType = "marker";
          let markTitle = allOverlays[i].titleDiv;
          $(markTitle).css("border-color","blue");
          $(markTitle).css("color","#000");
        }
      }
      if(id){
        for(var j=0;j<id.length;j++){//对应点选中
          for(var i=0;i<allOverlays.length;i++){
            if(allOverlays[i].hasOwnProperty("addnode") && allOverlays[i].id === id[j]){
              if(allOverlays[i].hasOwnProperty("nogis") && allOverlays[i].nogis){
              }else {
                let clickMarkImg = allOverlays[i].div;
                $(clickMarkImg).attr("src","../../image/gis/marker-click.svg");
                allOverlays[i].showType = "click";
                let clickMarkTitle = allOverlays[i].titleDiv;
                $(clickMarkTitle).css("border-color","red");
                $(clickMarkTitle).css("color","red");
              }
            }
          }
        }
      }
      setTitle();
      map.refresh();
    }
    //去重 点or线
    function mapRepeat(lays,type){
      var allOverlays = map.getOverlays();
      switch (type) {
        case "marker":
          var haveMarker = false;
          for(var j=0;j<allOverlays.length;j++){
            if(allOverlays[j].hasOwnProperty("id")&&allOverlays[j].id==lays.id){
              allOverlays[j].setOpacity(1);
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
          if(haveCurve && lays.hasOwnProperty("relationTypeName")){
            for(var n=0;n<lineAll.length;n++){
              if((lineAll[n].sourceid==lays.source.id&&lineAll[n].targetid==lays.target.id)&&(lays.relationTypeName == lineAll[n].relationTypeName)){
                return "have";
              }
            }
            return lineAll;
          }

          return false;
      }

    }
    //修改title的样式
    function setTitle() {
      $("#divPaint>[title]").css("width", "");
      let allOverlays = map.getOverlays();
      for(var k=0;k<allOverlays.length;k++){
        if(allOverlays[k].hasOwnProperty("addnode")){
          let moveDiv = allOverlays[k].div.nextElementSibling;
          $(moveDiv).css("margin-left", "26px").css("width", "");
        }
      }
    }
    //画图获取后端信息
    function toolBarSetData(areaGraphic){
      var url;
      var shapeData;
      var lonUse = [];
      var latUse = [];
      var mapMarkersid = [];
      var mapMarkers = [];
      var allOverlays = map.getOverlays();
      for(var k=0;k<allOverlays.length;k++){
        if(allOverlays[k].hasOwnProperty("addnode")){
          mapMarkersid.push(allOverlays[k].id);
          mapMarkers.push(allOverlays[k]);
        }
      }

      if(areaGraphic.type === "circle"){
        url = EPMUI.context.url + '/object/shape/circle';
        shapeData = {
          radius:areaGraphic.radius,
          lon:areaGraphic.center.x,
          lat:areaGraphic.center.y,
          id:mapMarkersid
        };
      }
      if(areaGraphic.type === "polygon"){
        url = EPMUI.context.url + '/object/shape/polygon';
        var polygonPoints = areaGraphic.points;

        for(var i=0;i<polygonPoints.length;i++){
          lonUse.push(parseFloat(polygonPoints[i].x));
          latUse.push(parseFloat(polygonPoints[i].y));
        }

        shapeData = {
          "lon":lonUse,
          "lat":latUse,
          id:mapMarkersid
        };
      }
      if(areaGraphic.type === "rectangle"){
        url = EPMUI.context.url + '/object/shape/polygon';
        var rectPoints = areaGraphic.points;
        lonUse = [rectPoints[0].x,rectPoints[1].x,rectPoints[1].x,rectPoints[0].x,rectPoints[0].x];
        latUse = [rectPoints[0].y,rectPoints[0].y,rectPoints[1].y,rectPoints[1].y,rectPoints[0].y];

        shapeData = {
          "lon":lonUse,
          "lat":latUse,
          id:mapMarkersid
        };
      }
      areaGraphic.multipleEntity = [];
      if(!mapMarkersid){
        return '';
      }
      $.ajax({
        url: url,
        type: 'post',
        data: shapeData,
        dataType: 'json',
        traditional: true,//这里设置为true
        success: function (data) {
          if(data.magicube_interface_data.hasOwnProperty("entity")){
            var dataMultipleEntity = [];
            for (var i = 0; i < mapMarkers.length; i++) {
              for (var j = 0; j < data.magicube_interface_data.entity.length; j++) {
                if (mapMarkers[i].id == data.magicube_interface_data.entity[j].id) {
                  dataMultipleEntity.push(mapMarkers[i]);
                }
              }
            }
            areaGraphic.multipleEntity = dataMultipleEntity;
            //changeMarkerColor(data.magicube_interface_data.entity);
          }
        }
      });
    }
    //地图选区菜单功能
    function mapSelectArea(data, action) {
      var ids = [];
      if(action === "Statistics"){//统计
        mapStatistics(data);
      }else if(action === "delInPoint"){//删除内点
        var allOverlays = map.getOverlays();
        for(var i=0;i<allOverlays.length;i++){
          if(allOverlays[i].hasOwnProperty("id")){
            for(var j=0;j<data.length;j++){
              if(allOverlays[i].id === data[j].id){
                ids.push(allOverlays[i].id);
              }
            }
          }
        }
        deleteMarker(ids);
      }else if(action === "delOutPoint"){// 删除外点
        var allOverlays = map.getOverlays();
        for(var i=0;i<allOverlays.length;i++){
          var delSign = true;
          if(allOverlays[i].hasOwnProperty("id")){
            for(var j=0;j<data.length;j++){
              if(allOverlays[i].id === data[j].id){
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
    //选区-统计菜单
    function mapStatistics(data) {
      var allOverlays = map.getOverlays();
      var allNodeId = {
        ids: [],
        types: []
      };
      for(var i=0;i<allOverlays.length;i++){
        if(allOverlays[i].hasOwnProperty("id") && data){
          for(var j=0;j<data.length;j++){
            if(allOverlays[i].id === data[j].id){
              allNodeId.ids.push(allOverlays[i].id);
              allNodeId.types.push(allOverlays[i].type);
            }
          }
        }
      }
      getTotalMessage(allNodeId); //统计信息
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
          if(tripNum==lushunum){
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
      var pt = points[0];
      var picon = new Icon();
      //加点
      var pimage = "../../image/gis/"+ tripMode +".svg";
      picon.image = "../../image/gis/"+ tripMode +".svg";
      picon.height = 25;
      picon.width = 25;
      var pTitle = new Title("",0,0,"宋体","#fff","#fff","#fff",0);
      var marker = new Marker(pt, picon,pTitle);
      marker.trackid= mapPathBasePoint.id;
      map.addOverlay(marker);
      /*strPath = "125.193329,28.119158,125.293329,28.219158,125.393329,28.319158,125.393329,28.419158,125.493329,28.419158,125.593329,28.519158,125.693329,28.619158"
       marker.setInterval(1100);// 设置推演的时间间隔为200毫秒,即按路线推演时时间间隔为200毫秒
       marker.setRepeat(false);// 设置推演为不重复推演状态
       marker.setPath(0,10,strPath);// 此函数的意思为：整个路线被设定为10*200毫秒，推演的起始
       marker.play();*/

      var cAsize = 0;//记录走过的位置
      var cA = setInterval(function () {
        trackInterval.push(cA);
        if(cAsize<points.length){
          marker.setPoint(points[cAsize]);
          if(cAsize>0){
            //动图角度调整
            var angle = setAnimationRotation(points[cAsize-1],points[cAsize]);
            angle = 180-angle;
            if(tripMode === "airplane"){
              angle = angle -45;
            }
            $("#divPaint [src='"+ pimage +"']").css("transform","rotate("+ angle +"deg)");
          }
          cAsize++;
        }else{
          lushunum = lushunum+1;
          clearInterval(cA);
          //图标也要去掉了
          map.removeOverlay(marker);
        }
      },100);

    }
    //动画角度调整 在每个点的真实步骤中设置小车转动的角度
    function setAnimationRotation(curPos,targetPos){
      var me = this;
      var deg = 0;

      if(targetPos.y != curPos.y){
        var tan = (targetPos.x - curPos.x)/(targetPos.y - curPos.y),
          atan  = Math.atan(tan);
        deg = atan*360/(2*Math.PI);
        //degree  correction;
        if(targetPos.y < curPos.y){
          deg = -deg;

        } else {// 这个地方有问题
          deg = 180-deg;
        }
        return deg;
      }else {
        var disy = targetPos.x- curPos.x ;
        var bias = 0;
        disy > 0 ? bias=-1 : bias = 1;
        return -bias * 90;
      }
      return;
    }
    //gisExpandData 扩展的点的信息 basemarker 是拓展根节点 =false表示单纯加点 而不添加线
    window.addMapPointLine = function (gisNodesData,basemarker,multiSign) {
      var mapStepOverlays = [];
      var mapTooltipSign = false;
      for (var i = 0; i < gisNodesData.length; i++) {
        var haveMarker = mapRepeat(gisNodesData[i],"marker");
        if (!haveMarker) {//不重复，在这进行加点操作：
          if (gisNodesData[i].hasOwnProperty("gis") && gisNodesData[i].gis != null && !gisNodesData[i].hasOwnProperty("nogis")) {
            var conf = { type: "add"};
            var marker = addMapOverlays(gisNodesData[i], "marker", conf);
            var step = {data: marker, type: "marker"}
            mapStepOverlays.push(step);
          }
          if(gisNodesData[i].hasOwnProperty("gis") && gisNodesData[i].hasOwnProperty("nogis")){
            noGisPoints.push(gisNodesData[i]);
            mapTooltipSign = true;
            var conf = { type: "add"};
            var marker = addMapOverlays(gisNodesData[i], "marker", conf);
            var step = {data: marker, type: "marker"}
            mapStepOverlays.push(step);
          }
        }
        if(basemarker){
          gisNodesData.forEach(link => lineNames.push(link.relationParentType));
          lineNames = [...new Set(lineNames)];

          var basemarkerId;
          var basemarkerGis;
          var basemarkerMsg;
          var gislinks;
          if(multiSign){
            basemarkerId = gisNodesData[i].source.id;
            basemarkerGis = gisNodesData[i].source.gis;
            basemarkerMsg = gisNodesData[i].source
            //basemarkerMsg = gisNodesData[i].baseMsg;
          }else{
            basemarkerId = basemarker[0].id;
            basemarkerGis = basemarker[0].gis;
            basemarkerMsg = basemarker[0].baseMsg;
          }

          if(gisNodesData[i].tag == "-20"){
            gislinks = {
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
                page_type: basemarkerMsg.page_type,
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
          }else{ // gisNodesData[i].tag == "20" 或者不存在
            gislinks = {
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
          }
          var haveLine = mapRepeat(gislinks,"polyline");
          var lineSizeNum = haveLine ? haveLine.length : 170;//根据这个 判断线条是直线还是曲线，直线数值170
          if(haveLine != "have"){
            var conf = { linesizeNum : lineSizeNum };
            var polyline = addMapOverlays(gislinks, "curve", conf);

            var line = polyline.getPoints();
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

            var stepM = {data: polyline, type: "polyline"}
            var stepLM = {data: markerCurve, type: "marker"}
            mapStepOverlays.push(stepM);
            mapStepOverlays.push(stepLM);
          }
        }
      }
      mapTooltipSign ? mapCommonPart.mapTooltip():null;//提示信息
      mapStep.push(mapStepOverlays);
      mapType.push("add");
      mapStepNum++;

      setTitle();
      map.refresh();
      //mapSetAggregation("reset");
    }
    //设置地图基本属性
    window.setmapProperty = function (drag, zoom, dblClick){
      if(drag == "drag-true"){

      }else if(drag == "drag-false"){

      }

      if(zoom == "zoom-true"){
        map.enableMouseZoom(); //启用滚轮放大缩小，默认禁用
      }else if(zoom == "zoom-false"){
        map.disableMouseZoom(); //禁用 滚轮放大缩小
      }

      if(dblClick == "dbl-true"){

      }else if(dblClick == "dbl-false"){

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
              addnode: allOverlays[j].addnode,
              gis: allOverlays[j].gis,
              nogis: allOverlays[j].nogis,
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
              addnode: allOverlays[j].addnode,
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
            relationTypeName: allOverlays[j].relationTypeName,
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
    //改变圆内外点颜色
    window.changeMarkerColor = function(data){
      var dataId = [];
      if(!mapSmallSign) {
        data.forEach( d => {  dataId.push(d.id); } );
      }
      changeMarkerType(dataId);
    };
    //地图点还原
    window.mapOpacity = function(sign){
      changeMarkerType();
    };
    //轨迹设置
    $("#map_path_ensure").bind("click",function(){
      trackInterval.forEach( ti => { clearInterval(ti) } );
      var allOverlays = map.getOverlays();
      for(var j=0;j<allOverlays.length;j++){
        if(allOverlays[j].hasOwnProperty("trackid") && allOverlays[j].trackid == Id ){
          map.removeOverlay(allOverlays[j]);
        }
      }
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

      var basePoint = new Point(mapPathBasePoint.gis.lon, mapPathBasePoint.gis.lat);
      var Id = mapPathBasePoint.id;
      var nodeType = mapPathBasePoint.baseMsg.type;
      var nodeId = mapPathBasePoint.baseMsg.nodeId;

      // 删除mapPathBasePoint 原来有的轨迹
      mapOwnFun.mapRemovePathTopoMenu(mapCommon.mapWorkMarker[0].id);

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
        if(trackStatues[i] === "xxxpathAppearSite"){//出现地点

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
                var addData = data.magicube_interface_data;
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
                  var retpath = curve.getPoints();
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
          let pathMigratoryType = $(".map_path_type_name").html();
          if(pathMigratoryType === "过车信息"){

          }else if(nodeType == "JDCXX"){
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
                  var points = "";
                  var mapStepOverlays = [];
                  var firstPoint = basePoint;//这个用来存放两点中的起点

                  window.lushunum = 0;
                  var addData = [];
                  for(var l=0;l<setAddData.length;l++){
                    if(setAddData[l].gis[1]>0 && setAddData[l].gis[0]>0){
                      addData.push(setAddData[l]);
                    }
                  }

                  for(var k=0;k<addData.length;k++){
                    if(k==0){
                      var addDataFirst = {
                        time:addData[0].time,
                        tripMode:'car',
                        address: addData[0].name,
                        gis: {
                          lon: addData[0].gis[1],
                          lat: addData[0].gis[0]
                        }
                      };
                      var linkPoints = {
                        firstPoint: mapPathBasePoint,
                        secondPoint: addDataFirst
                      };
                      var polyline = addMapOverlays(linkPoints, "track");
                      //轨迹动画
                      runCurveAnimation(polyline.getPoints(),basePoint,"track", 'car', k);
                    }
                    if(k>0){
                      var addDataFirst = {
                        time:addData[k-1].time,
                        tripMode:'car',
                        address: addData[k-1].name,
                        gis: {
                          lon: addData[k-1].gis[1],
                          lat: addData[k-1].gis[0]
                        }
                      };

                      var addDataSecond = {
                        time:addData[k].time,
                        tripMode:'car',
                        address: addData[k].name,
                        gis: {
                          lon: addData[k].gis[1],
                          lat: addData[k].gis[0]
                        }
                      };
                      var linkPoints = {
                        firstPoint: addDataFirst,
                        secondPoint: addDataSecond
                      }
                      var polyline = addMapOverlays(linkPoints, "track");
                      //轨迹动画
                      runCurveAnimation(polyline.getPoints(),basePoint,"track", 'car', k);
                    }

                  }
                }
              }
            });

          }else{
            let carPathType = "pathAppearSite";
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
                  var addData = data.magicube_interface_data;
                  var points = "";
                  var mapStepOverlays = [];
                  var firstPoint = basePoint;//这个用来存放两点中的起点

                  window.lushunum = 0;

                  for(var k=0;k<addData.length;k++){
                    var setTripMode = "car";

                    if(k==0){
                      if(addData[0].hasOwnProperty("tripMode")){
                        setTripMode = addData[0].tripMode;
                      }
                      var addDataFirst = {
                        time:addData[0].time,
                        tripMode:setTripMode,
                        address: addData[0].address,
                        gis: {
                          lon: addData[0].gis[0],
                          lat: addData[0].gis[1]
                        }
                      }
                      var linkPoints = {
                        firstPoint: mapPathBasePoint,
                        secondPoint: addDataFirst
                      }
                      var polyline = addMapOverlays(linkPoints, "track");
                      //轨迹动画
                      runCurveAnimation(polyline.getPoints(),basePoint,"track", addData[k].tripMode, k);
                    }
                    if(k>0){

                      if(addData[k-1].hasOwnProperty("tripMode")){
                        setTripMode = addData[k-1].tripMode;
                      }

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
                      var linkPoints = {
                        firstPoint: addDataFirst,
                        secondPoint: addDataSecond
                      }
                      var polyline = addMapOverlays(linkPoints, "track");
                      //轨迹动画
                      runCurveAnimation(polyline.getPoints(),basePoint,"track", addDataSecond.tripMode, k);
                    }
                  }
                  /*var step = {one: Id, two: "first"}
                   mapStepOverlays.push(step);
                   mapStep.push(mapStepOverlays);
                   mapType.push("addCurve");
                   mapStepNum++;*/
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
      //trackInterval.forEach( ti => { clearInterval(ti) } );
    });
    //鼠标选区操作 按钮控制
    $("#map_tool").click(function(){
      //添加一个选区的div
      var container = this.container = document.createElement("div");
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

      var htmldata = '<a class="BMapLib_box BMapLib_hander_hover icon-arrows" drawingType="hander" href="javascript:void(0)" '+
        'title="拖拽地图" onfocus="this.blur()"> 拖拽地图</a><br>'+
        '<a class="BMapLib_box BMapLib_circle icon-circle-o" data-dojo-type="dijit/form/Button" drawingType="circle"'+
        ' href="javascript:void(0)" title="圆形选区" onfocus="this.blur()"> 圆形选区</a><br>'+
        '<a class="BMapLib_box BMapLib_polygon icon-polygon-o" data-dojo-type="dijit/form/Button" drawingType="polygon"'+
        ' href="javascript:void(0)" title="多边选区" onfocus="this.blur()"> 多边选区</a><br>'+
        '<a class="BMapLib_box BMapLib_rectangle icon-square-o-big" data-dojo-type="dijit/form/Button" drawingType="rectangle"'+
        ' href="javascript:void(0)" title="方形选区" onfocus="this.blur()"> 方形选区</a><br>';
      // 添加内容
      panel.innerHTML = htmldata;
      // 添加DOM元素到地图中
      $(container).appendTo($("#basemap"));//basemap_container  basemap_root
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

      function activateTool(drawingType) {
        gisDrawingType = drawingType;
        if(drawingType === "circle"){
          map.changeDragMode("drawCircle", null, null, addMapTool);
        }
        if( drawingType === "polygon"){
          map.changeDragMode("drawPolygon", null, null, addMapTool);
        }
        if( drawingType === "rectangle"){
          map.changeDragMode("drawRect", null, null, addMapTool);
        }
      }

      function addMapTool (evt){
        var gdt = gisDrawingType;
        var gisArea;
        if(gdt === "circle"){
          gisArea = new Circle(evt,"#071A44",1,0.5,"#071A44");// 构造一个圆形对象
          gisArea.type = "circle";
        }
        if( gdt === "polygon"){
          gisArea = new Polygon(evt,"#071A44", 1,0.5,"#071A44");// 构造一个多边形对象
          gisArea.type = "polygon";
        }
        if( gdt === "rectangle"){
          gisArea = new Rectangle(evt,"#071A44", 1,0.5,"#071A44");// 构造一个矩形对象
          gisArea.type = "rectangle";
        }
        map.addOverlay(gisArea);

        map.changeDragMode("drawRect", null, null, null);
        map.changeDragMode("pan");
        setTimeout(function () { $("#realtive").css("cursor","pointer"); },500);
        gisArea.addListener("dblclick", function(e) {
          e.preventDefault();
          e.stopPropagation();
          var conf = {
            thisClick:e,
            areaLays:gisArea
          };
          mapCommon.mapWorkArea = {};
          mapCommon.mapWorkArea = conf;
          mapCommonPart.menu(conf,"areamenu");
        });
        toolBarSetData(gisArea);
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
      if(!gisToolSign){
        gisToolSign=true;
        $(".BMapLib_Drawing_panel").show();
      }else{
        gisToolSign=false;
        $(".BMapLib_Drawing_panel").hide();
      }
    });
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
      }
    });
    //工具栏菜单-设置确定
    $("#set_btn").click(function () {
      mapShowSign=false;
      $("#mapsetddiv").hide();
      $("#mapsetddiv").css("height","20px");
      var coverage = $("input[name='coverage']:checked").val();//确认设置，获得各设置项
      //图层设置
      /*if(coverage === "defaultmap"){//默认图
       if(mapHeatSign){//热力图==》默认图
       mapSmallSign = false;
       mapHeatSign = false;
       }
       if(mapSmallSign){//小点图==》默认图
       mapSmallSign = false;
       mapHeatSign = false;
       }
       }else if(coverage === "heatmap"){//热力图
       if(!mapHeatSign){
       //mapSetAggregation("del");//关闭聚合
       mapHeatSign = true;
       mapSmallSign = false;
       }
       }else if(coverage=="smallPointmap"){//小点图
       if(mapHeatSign){//热力图==》小点图
       mapHeatSign = false;
       }
       //mapSetAggregation("del");//关闭聚合
       mapSmallSign = true;
       }*/
      //显示设置
      /*var fontlineStatues = [];
       $("input[name='fontline']:checked").each(function(){
       fontlineStatues.push($(this).val());
       });*/

      var fontlineStatues = [];
      $("input[name='fontline']").each(function(){
        if( $(this).attr("checked")){
          fontlineStatues.push($(this).val());
        }
      });

      if(fontlineStatues.length==0&&!mapHeatSign&&!mapSmallSign){//显示线 字
        var allOverlays = map.getOverlays();
        for(var i=0;i<allOverlays.length;i++){
          //显示文字
          if(allOverlays[i].hasOwnProperty("addnode")){// 点
            allOverlays[i].showTitle();
          }
          //显示连线
          if(allOverlays[i].hasOwnProperty("polylineid")){
            allOverlays[i].setOpacity(1);
          }
          if(allOverlays[i].hasOwnProperty("curveTitle")){//线上文字
            allOverlays[i].showTitle();
          }

        }
        mapFontStatus = true;
        mapLineStatus = true;
      }else if(fontlineStatues.length==1&&!mapHeatSign&&!mapSmallSign){
        if(fontlineStatues[0] === "hideline"){//隐藏连线 显示文字
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            //显示文字
            if(allOverlays[i].hasOwnProperty("addnode")){//点
              allOverlays[i].showTitle();
            }
            //隐藏连线
            if(allOverlays[i].hasOwnProperty("polylineid")){
              allOverlays[i].setOpacity(0);
            }
            if(allOverlays[i].hasOwnProperty("curveTitle")){//线上文字
              allOverlays[i].hideTitle();
            }
          }
          mapFontStatus = true;
          mapLineStatus = false;
        }else if(fontlineStatues[0] == "hidefont"){//隐藏文字 显示连线
          var allOverlays = map.getOverlays();
          for(var i=0;i<allOverlays.length;i++){
            //隐藏文字
            if(allOverlays[i].hasOwnProperty("addnode")){//点
              allOverlays[i].hideTitle();
            }
            //显示连线
            if(allOverlays[i].hasOwnProperty("polylineid")){
              allOverlays[i].setOpacity(1);
            }
            if(allOverlays[i].hasOwnProperty("curveTitle")){//线上文字
              allOverlays[i].hideTitle();
            }
          }
          mapFontStatus = false;
          mapLineStatus = true;
        }
      }else if(fontlineStatues.length==2&&!mapHeatSign&&!mapSmallSign){
        var allOverlays = map.getOverlays();
        for(var i=0;i<allOverlays.length;i++){
          //隐藏文字
          if(allOverlays[i].hasOwnProperty("addnode")){//点
            allOverlays[i].hideTitle();
          }
          //隐藏连线
          if(allOverlays[i].hasOwnProperty("polylineid")){
            allOverlays[i].setOpacity(0);
          }
          if(allOverlays[i].hasOwnProperty("curveTitle")){//线上文字
            allOverlays[i].hideTitle();
          }
        }
        mapFontStatus = false;
        mapLineStatus = false;
      }

      //聚合设置
      /*var mapAggregation = $("input[name='setAggregation']:checked").val();
       if(mapAggregation === "aggregation"&&!mapHeatSign&&!mapSmallSign){
       //聚合方法
       mapSetAggregation("add");
       }else if(mapAggregation !== "aggregation"){
       mapSetAggregation("del");
       }*/

      //主题设置
      //var maptheme = $("input[name='maptheme']:checked").val();

      /*if(maptheme == "blue"&&mapthemeType!=maptheme){
       map.setMapStyle({styleJson:mapJsonStyle});
       mapthemeType=maptheme;
       }else if(maptheme == "black"&&mapthemeType!=maptheme){
       map.setMapStyle({style:'midnight'});
       mapthemeType=maptheme;
       }else if(maptheme == "white"&&mapthemeType!=maptheme){
       map.setMapStyle({style:'normal'});
       mapthemeType=maptheme;
       }*/


      map.refresh();
    })
    //工具栏菜单-设置取消
    $("#ret_btn").click(function () {//取消设置
      mapShowSign=false;
      $("#mapsetddiv").hide();
      $("#mapsetddiv").css("height","20px");
    })
    //重点区域
    $("#map_area_statistics").click(function () {
      if(keyAreaSign){// 关闭重点区域
        var allOverlays = map.getOverlays();
        for(var k=0;k<allOverlays.length;k++) {
          if (allOverlays[k].hasOwnProperty("sign")&&allOverlays[k].sign == "keyArea") {
            map.removeOverlay(allOverlays[k]);
          }
        }
        d3.select("#newDiv").remove();
        keyAreaSign = false;
      }else{//显示重点区域
        addKeyArea();
        keyAreaSign = true;
      }
    });
    //显示重点区域
    function addKeyArea(){
      //后端返回值： type 和 gisPointsStr
      var returnData = [{
        "shape":"polygon",
        "gisPointsStr":[[112.229389, 40.783175],[112.229389, 39.317373],[116.808178, 39.317373],[116.808178, 40.783175]],
        "id":"area1"
      },{
        "shape":"circle",
        "centerPoint":[120, 25],
        "radius":1.5468,
        "id":"area2"
      }];
      returnData.forEach( rd => addMapOverlays(rd, "keyArea") );
      return '';

      let url = EPMUI.context.url + '/object/getKeyAreaGisList';
      let data = null;
      let completed = function (){ return false; };
      let succeed = function(returnData) {
        returnData.forEach( rd => addMapOverlays(rd, "keyArea") );
      };
      let judgment = function() { return false; };
      mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);
    }


    //显示区域分析
    function areaStatistics(returnData){
      var areadiv = function(areadata,size){
        //svg的大小
        var width = 100;
        var height = 100;
        d3.select("#aSGraphicarea"+ size + "a")
          .attr("data",areadata)
          .attr("areadata",JSON.stringify(areadata))
          .on("dblclick",function(){
            map.disableDoubleClickZoom(); //禁用双击放大
            var areaAsnum = $(this).attr("areadata");
            var asid = "aSGraphicarea"+ size + "a";
            showASSvg(asid,JSON.parse(areaAsnum));
          });
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

        function markData(){//ngm方法，变成数组从1开始的
          var dataX = d3.range(areadata.classifyValue.length);
          for(var k=0;k<dataX.length;k++){
            dataX[k]=dataX[k]+1;
          }
          return dataX;
        }

        var yScale = d3.scale.linear()
          .domain([0,d3.max(areadata.classifyValue)])
          .range([0,yAxisWidth]);

        var rect = d3.select("#aSGraphicarea"+ size + "a").selectAll("rect")
          .data(areadata.classifyValue)
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
        var gAxis = d3.select("#aSGraphicarea"+ size + "a").append("g")
          .attr("class","axis") //坐标轴的样式
          .attr("transform","translate("+ padding.left + "," + (height-padding.bottom+2) + ")")
          .call(xAxis);

        d3.select("#aSGraphicarea"+ size + "a").append("g")
          .attr("class","axis") //坐标轴的样式 padding.left  (padding.top+padding.bottom)
          .attr("transform","translate("+ 9 + "," + 2 + ")")
          .call(yAxis);
      };
      for(var n=0;n<returnData.length;n++){
        var pointNEW = new BMap.Point(returnData[n].gis.lon,returnData[n].gis.lat);

        var marker = new BMap.Marker(pointNEW);
        mapSetIcon(marker, markerPathPeople, 0, 0, 'rgba(0,0,0,0)', 1, 1);
        map.addOverlay(marker);

        var areaContent = "<svg class='aSGraphicarea' id='aSGraphicarea"+ mapCommon.mapKeyArea.areaLays.addattr.id +n+"a' style='width: 100px;height: 100px;background-color:rgba(0,0,0,0) '></svg>";

        var label = new BMap.Label(areaContent,{offset:new BMap.Size(20,-10)});
        label.setStyle({backgroundColor: "rgba(0,0,0,0)",border:"#5E7489"});//#5E7489背景色
        marker.setLabel(label);
        marker.enableDragging(true);           // 不可拖拽
        marker.type = "areaMarker";
        marker.asid = "aSGraphicarea"+ mapCommon.mapKeyArea.areaLays.addattr.id+ n +"a";
        marker.areaid = mapCommon.mapKeyArea.areaLays.addattr.id;
      }
      setTimeout(function(){
        for(var n=0;n<returnData.length;n++){
          var centerN = mapCommon.mapKeyArea.areaLays.id + n;
          areadiv(returnData[n],centerN);
        }
      },100);
    }
    //区域统计 放大显示详情
    function showASSvg(asid, data){
      d3.selectAll("#asDiv").remove();
      var allOverlays = map.getOverlays();

      var showASMarker;
      for(var k=0;k<allOverlays.length;k++) {
        if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type == "areaMarker") {
          if(allOverlays[k].asid == asid){
            showASMarker = allOverlays[k];
          }
        };
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
        "<div class='asDiv_name'>"+ data.area +"</div>"+
        //"<div class='asDiv_classify'>标志"+"</div>"+
        "<div class='asDiv_func'>"+
        "<div class='asDiv_close'>×</div>"+
        "</div>"+
        "</div>"+
        "<div class='asDiv_svg'></div>"+
        "<div class='asDiv_foot'><div class='asDiv_footTip'></div></div>";
      $(div).append(inDivHtml);

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
        for(var l=0;l<dataX.length;l++){
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
        for(l=0;l<dataX.length;l++){
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

    //加载高级搜索用地图
    this.searchMapRun = function(){
      $(".search_map_return").css("color","black");
      //添加一个选区的div
      /*var pgisContainer = document.createElement("div");
       pgisContainer.className = "pgisMap";
       pgisContainer.id = "pgisMap";

       $("#searchPGIS").appendChild(pgisContainer);
       $("#pgisMap").css("width","100%").css("height","100%");
       mapload = true;*/
      map = new EzMap(document.getElementById("searchPGIS"));//1） ********构造地图控件对象，用于装载地图
      map.initialize();//2）********初始化地图，并显示地图
      $("#div").css("width","100%").children("div").css("width","100%");
      //画区域功能
      localStorage.setItem("selectMap", "true");
      //鼠标 点线面工具
      selectMapTool();
      //移动地图事件
      map.addMapEventListener(EzEvent.MAP_PAN, function(e) {
        $("#newDiv").remove();
        $("#newDivdelMarker").remove();
      });
    };
    //高级搜索 地图划区域功能
    function selectMapTool(){
      //添加一个选区的div
      var container = document.createElement("div");
      container.className = "BMapLib_Drawing";
      //用来设置外层边框阴影
      var panel = document.createElement("div");
      panel.className = "BMapLib_Drawing_panel";

      var panelattr = document.createAttribute("data-dojo-type");
      panelattr.value = "dijit/layout/ContentPane";
      panel.setAttributeNode(panelattr);

      var pattr = document.createAttribute("data-dojo-props");
      pattr.value = "region:'top'";
      panel.setAttributeNode(pattr);

      container.appendChild(panel);

      var htmldata = '<a class="BMapLib_box BMapLib_hander_hover icon-arrows" drawingType="hander" href="javascript:void(0)" '+
        'title="拖拽地图" onfocus="this.blur()"></a><br>'+
        '<a class="BMapLib_box BMapLib_circle icon-circle-o" data-dojo-type="dijit/form/Button" drawingType="circle"'+
        ' href="javascript:void(0)" title="圆形选区" onfocus="this.blur()"></a><br>'+
        '<a class="BMapLib_box BMapLib_rectangle icon-square-o-big" data-dojo-type="dijit/form/Button" drawingType="rectangle"'+
        ' href="javascript:void(0)" title="方形选区" onfocus="this.blur()"></a><br>';
      // 添加内容
      panel.innerHTML = htmldata;
      // 添加DOM元素到地图中
      $(container).appendTo($("#searchPGIS"));

      //样式的调整
      $(".BMapLib_Drawing_panel").css("top","28px");
      $(".BMapLib_Drawing_panel").css("left","10px");

      $(".BMapLib_box").on('click', function (e) {
        var drawingType = $(this).attr('drawingType');
        selectActivateTool(drawingType);
      });

      function selectActivateTool(drawingType) {
        gisDrawingType = drawingType;
        if(drawingType === "circle"){
          map.changeDragMode("drawCircle", null, null, selectMapTool);
        }
        if( drawingType === "polygon"){
          //map.changeDragMode("drawPolygon", null, null, addMapTool);
          map.changeDragMode("drawRect", null, null, selectMapTool);
        }
        if( drawingType === "rectangle"){
          map.changeDragMode("drawRect", null, null, selectMapTool);
        }
      }

      function selectMapTool (evt){
        var gdt = gisDrawingType;
        var gisArea;
        if(gdt === "circle"){
          //把选区信息保存
          let circleData = evt.split(",");
          let circlevalue= {
            radius:circleData[2],
            lon:circleData[0],
            lat:circleData[1]
          };
          mapAreaValue = [];//默认只能保留一个选区的信息
          mapAreaValue.push(circlevalue);

          gisArea = new Circle(evt,"#071A44",1,0.5,"#071A44");// 构造一个圆形对象
          gisArea.type = "circle";
        }
        if( gdt === "polygon"){
          /*gisArea = new Polygon(evt,"#071A44", 1,0.5,"#071A44");// 构造一个多边形对象
           gisArea.type = "polygon";*/
          gisArea = new Rectangle(evt,"#071A44", 1,0.5,"#071A44");// 构造一个矩形对象
          gisArea.type = "rectangle";
          //把选区信息保存
          let polygonData = evt.split(",");
          let polygonLon = [polygonData[0],polygonData[2],polygonData[2],polygonData[0],polygonData[0]];
          let polygonLat = [polygonData[1],polygonData[1],polygonData[3],polygonData[3],polygonData[1]];
          let polygonValue= {
            lon:polygonLon,
            lat:polygonLat
          };
          mapAreaValue = [];//默认只能保留一个选区的信息
          mapAreaValue.push(polygonValue);
        }
        if( gdt === "rectangle"){
          gisArea = new Rectangle(evt,"#071A44", 1,0.5,"#071A44");// 构造一个矩形对象
          gisArea.type = "rectangle";
          //把选区信息保存
          let polygonData = evt.split(",");
          let polygonLon = [polygonData[0],polygonData[2],polygonData[2],polygonData[0],polygonData[0]];
          let polygonLat = [polygonData[1],polygonData[1],polygonData[3],polygonData[3],polygonData[1]];
          let polygonValue= {
            lon:polygonLon,
            lat:polygonLat
          };
          mapAreaValue = [];//默认只能保留一个选区的信息
          mapAreaValue.push(polygonValue);
        }
        map.addOverlay(gisArea);

        map.changeDragMode("drawRect", null, null, null);
        map.changeDragMode("pan");
        setTimeout(function () { $("#realtive").css("cursor","pointer"); },500);
        gisArea.addListener("dblclick", function(e) {
          e.preventDefault();
          e.stopPropagation();
          $("#newDiv").remove();
          $("#newDivdelMarker").remove();
          var div = document.createElement("div");
          div.setAttribute("id", "newDiv");
          div.style.position = "absolute";
          div.style.left = e.clientX+15 + "px";
          div.style.top = e.clientY-50 + "px";
          div.style.fontSize = "12px";

          var svg = $("<div id='newDivdelMarker' class='newDivdelMarker'>删除选区</div>").appendTo(div);
          $(div).appendTo($("#searchPGIS"));

          $("#newDivdelMarker").bind("click",function () {
            map.removeOverlay(gisArea);
            $("#newDiv").remove();
            $("#newDivdelMarker").remove();
            map.enableMouseZoom(); //启用滚轮放大缩小，默认禁用
          })
        });
      }


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
    //时间轴
    window.mapTime = function(time){
      //活动选择时间段，对应点线 选中
      var selectedId = [];
      var allOverlays = map.getOverlays();
      for(var i=0;i<allOverlays.length;i++){
        if(allOverlays[i].hasOwnProperty("polylineid")&&allOverlays[i].hasOwnProperty("time")){
          if(allOverlays[i].time == time){
            selectedId.push(allOverlays[i].sourceid);
            selectedId.push(allOverlays[i].targetid);
            allOverlays[i].setStrokeColor("#33D0FF");
          }
        }
      }
      changeMarkerType(selectedId);
    };
    //对应地图TopoMenu的方法：
    window.mapOwnFun = {
      /**
       * mapAddTopoMenu           : 添加菜单div到地图
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
       * mapRemoveAreaMenu        : 选区菜单-删除
       * mapAddKeyAreaMenu        : 添加重点区域菜单
       *
       */
      mapAddTopoMenu:function(div){
        div.style.zIndex = "9999";
        map.getMapContainer().appendChild(div);
      },
      mapRemoveTopoMenu:function(){
        d3.select("#newDiv").remove();
        mapdisk = false;
        setmapProperty("null","zoom-true","dbl-true");
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
      mapMoveTopoMenu:function(aaa){
        var thisMarker = mapCommon.mapWorkMarker[0];
        d3.select("#newDiv").remove();
        setmapProperty("null","zoom-true","dbl-true");
        map.removeOverlay(thisMarker);
        var conf = { type: "move"};
        addMapOverlays(thisMarker.baseMsg, "marker", conf);

        setTitle();
        map.refresh();
      },
      mapSaveTopoMenu:function(){
        var thisMarker = mapCommon.mapWorkMarker[0];
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
            //设置marker点的经纬度信息
            thisMarker.gis.lon = thisMarker.point.x;
            thisMarker.gis.lat =   thisMarker.point.y;
            thisMarker.baseMsg.gis.lon = thisMarker.point.x;
            thisMarker.baseMsg.gis.lat =   thisMarker.point.y;
            map.removeOverlay(thisMarker);
            thisMarker.nogis = false;
            var conf = { type: "click"};
            addMapOverlays(thisMarker.baseMsg, "marker", conf);
            showAlert("提示!", datas.message, "#33d0ff");
          } else {
            showAlert("提示!", datas.message, "#ffc000");
          }
        })
        d3.select("#newDiv").remove();
        setmapProperty("null","zoom-true","dbl-true");
        setTitle();
        map.refresh();
      },
      mapCheckTopoMenu:function(){
        d3.select("#newDiv").remove();
        setmapProperty("null","zoom-true","dbl-true");
        mapSaveLocalStorage();
      },
      mapOffTopoMenu:function(){
        d3.select("#newDiv").remove();
        setmapProperty("null","zoom-true","dbl-true");
      },
      mapExtendTopoMenu:function(aaaa, extendSign){
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
          //mapRadrawAxis(true, Id, nodeId, "All");//时间轴
        }

      },
      mapMoreExtendTopoMenu:function(mapMainRadrawMarkers, Id, nodeType, nodeId, systemId){
        d3.selectAll("#newDiv").remove();//先把圆环删除咯
        setmapProperty("null","zoom-true","dbl-true");
        mapCommonPart.mapMainRadraw(mapMainRadrawMarkers, "single", Id, nodeType, nodeId, systemId);
      },
      mapPathTopoMenu:function(aaaa){
        d3.selectAll("#newDiv").remove();//先把圆环删除咯
        setmapProperty("null","zoom-true","dbl-true");
        mapPathBasePoint = mapCommon.mapWorkMarker[0];

        if(mapPathBasePoint.type === "KKXX"){
          $(".map_path_type_name").html("过车信息");
        }

        mapPathSgin = true;
      },
      mapRemovePathTopoMenu:function(aaaa){
        var Id = mapCommon.mapWorkMarker[0].id;
        d3.selectAll("#newDiv").remove();//先把圆环删除咯
        setmapProperty("null","zoom-true","dbl-true");
        //还应该清除计时器

        $(".map_path").hide();
        mapPathSgin = false;
        trackInterval.forEach( ti => { clearInterval(ti) } );
        var allOverlays = map.getOverlays();
        for(var j=0;j<allOverlays.length;j++){
          if(allOverlays[j].hasOwnProperty("trackid") && allOverlays[j].trackid == Id ){
            map.removeOverlay(allOverlays[j]);
          }
        }
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
        mapSelectArea(e.overlay.multipleEntity, sign);
      },
      mapClickAreaSearchMenu:function(sign){
        /*let oldPoints = mapCommon.mapWorkArea.areaLays.points;
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
         mapStatistics(asMarkers);*/

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
        var thir = "multi";
        var Id = [];
        var nodeType = [];
        var nodeId = [];
        var multipleEntity = mapCommon.mapWorkArea.areaLays.multipleEntity;
        d3.selectAll("#newDiv").remove();//先把圆环删除咯
        setmapProperty("null","zoom-true","dbl-true");
        if(!multipleEntity){ return ''; }
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
      mapRemoveAreaMenu:function(aaaa, sign){
        var areaL = mapCommon.mapWorkArea.areaLays;
        if(sign == 0){
          map.removeOverlay(areaL);
        }
        if (sign == 1) {// 删除内点
          mapSelectArea(areaL.multipleEntity,"delInPoint");
        }
        if (sign == 2) {// 删除外点
          mapSelectArea(areaL.multipleEntity,"delOutPoint");
        }
        d3.select("#newDiv").remove();
        setmapProperty("null","zoom-true","dbl-true");
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
      bayonetAreaMenu:function () {
        let areaGraphic = mapCommon.mapWorkArea.areaLays;

        if(areaGraphic.type === "circle"){
          url = EPMUI.context.url + '/object/circle/bayonet';
          shapeData = {
            radius:areaGraphic.radius,
            lon:areaGraphic.center.x,
            lat:areaGraphic.center.y
          };
        }
        if(areaGraphic.type === "polygon"){
          url = EPMUI.context.url + '/object/polygon/bayonet';
          var polygonPoints = areaGraphic.points;

          for(var i=0;i<polygonPoints.length;i++){
            lonUse.push(parseFloat(polygonPoints[i].x));
            latUse.push(parseFloat(polygonPoints[i].y));
          }

          shapeData = {
            "lon":lonUse,
            "lat":latUse
          };
        }
        if(areaGraphic.type === "rectangle"){
          url = EPMUI.context.url + '/object/polygon/bayonet';
          var rectPoints = areaGraphic.points;
          lonUse = [rectPoints[0].x,rectPoints[1].x,rectPoints[1].x,rectPoints[0].x,rectPoints[0].x];
          latUse = [rectPoints[0].y,rectPoints[0].y,rectPoints[1].y,rectPoints[1].y,rectPoints[0].y];

          shapeData = {
            "lon":lonUse,
            "lat":latUse
          };
        }

        $.ajax({
          url: url,
          type: 'post',
          data: shapeData,
          dataType: 'json',
          traditional: true,//这里设置为true
          success: function (data) {
            var dataMultipleEntity = areaGraphic.multipleEntity;

            if (data.code == "200") {
              let addData = data.magicube_interface_data;
              for(let k=0;k<addData.length;k++){
                let bayonet = addMapOverlays(addData[k], "bayonet");
              }
            }

            if(data.magicube_interface_data.hasOwnProperty("entity")){
              for (var j = 0; j < data.magicube_interface_data.entity.length; j++) {
                dataMultipleEntity.push(data.magicube_interface_data.entity[j]);
              }
              areaGraphic.multipleEntity = dataMultipleEntity;
            }
          }
        });

      }

    }
    //Map END!!
  }
})();