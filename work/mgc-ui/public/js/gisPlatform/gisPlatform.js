/**
 * Created by ngm on 2017/7/24.
 */
$(function(){
    let gisTableSign = false;
    let gisBayonetTableSign = false;
    let gisKeyAreaTableSign = false;

    let gisNodes = [];//存放点的信息
    let gisLinks = [];//存放点的信息
    let mapShowSign = false;//判断设置菜单显示隐藏
    let timeAxis; // 时间轴
    let surveillanceSign = false; //实时监控
    let cameraSign = false;       //摄像头
    let movePathSign = false;     //行动轨迹

    window.lushuNum = []; // 路书的名称，及其运行到第几段轨迹 { name: lushuName, size: 0 , lushu:"路书定时器名称"}
    window.mapload = false;//判断地图是否加载
    window.bayonetName = EPMUI.context.gis.bayonet; //存放context.json 里面默认的 卡口名称
    //调整pgis代码的问题！！
    if(EPMUI.context.gis.type==="PGIS"){
        setTimeout(function () {
            var themeStyle = mapCommonPart.getCookie("theme");
            if(themeStyle === "white"){
                $("BODY").css("color",'#2b363d');
            }else{
                $("BODY").css("color",'#fff');
            }
        },1000);
    }

    /**
     * 随机生成经纬度
     * @param {*} sign 两个值{lon|lat} 表示生成经度随机数，纬度随机数
     */
    function getRandomGis(sign){
      //太原：  111.236971 ；37.074711
      //银川： new Number(106.135281 + Math.random()*0.2);   new Number(38.399092 + Math.random()*0.15);
      //本地： (111.236971 + Math.random()*3);    (37.074711 + Math.random()*3);
      //15所  121.7425337, 20.4195612
      if(sign === "lon"){
        return new Number(124.7425337 + Math.random()*3);
      }else if(sign === "lat"){
        return new Number(28.4195612 + Math.random()*3);
      }
    }

    //模拟es6的map数据结构
    window.es6_Map = function () {
        var items = {};
        this.has = function(key){
            return key in items;
        },
        this.set = function(key,value){
            items[key] = value;
        },
        this.remove = function(key){
            if (this.has(key)) {
                delete items[key];
                return true;
            }
            return false;
        },
        this.get = function(key){
            return this.has(key)?items[key]:undefined;
        },
        this.values = function(){
            var values = [];
            for(var k in items){
                if (this.hasOwnProperty(k)) {
                    values.push(items[k]);
                }
            }
            return values;
        },
        this.clear = function(){
            items = {};
        },
        this.size = function(){
            return Object.Keys(items).length;
        },
        this.getItems = function(){
            return items;
        }
    }

    /**
     * Promise 动态加载js
     * @param {*} url 要加载的js
     */
    function mapLoadScriptPromise(url) {
      return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) {// ie
          script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              resolve();
            }
          };
        } else {//Others: Firefox, Safari, Chrome, and Opera
          script.onload = function () {
            resolve();
          };
        }

        if(!url){
          reject('url is error!');
        }
        script.src = url;
        document.body.appendChild(script);
      })
    }
    /**
     * 回调函数 动态加载js
     * @param {*} url 要加载的js
     * @param {*} callback 回调函数
     */
    function mapLoadScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if(typeof(callback) !== "undefined"){
            if (script.readyState) {// ie
                script.onreadystatechange = function () {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {//Others: Firefox, Safari, Chrome, and Opera
                script.onload = function () {
                    callback();
                };
            }
        }
        script.src = url;
        document.body.appendChild(script);
    }

    //各按钮事件 start

    //设置选择框的样式
    $(".map_fontline input[name='coverage']").click(function () {
        if ($(this).attr("class") === 'icon-nodot-circle-o') {
            $(this).prop('checked', true).attr('checked', true).removeClass("icon-nodot-circle-o").addClass("icon-dot-circle").parent().parent().siblings().find('input').prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
        }
    });
    $(".map_left_setting input[name='showSettings']").click(function () {
      if ($(this).attr("class") === 'icon-nodot-circle-o') {
        $(this).prop('checked', true).attr('checked', true).removeClass("icon-nodot-circle-o").addClass("icon-dot-circle").parent().parent().siblings().find('input').prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
      }else if ($(this).attr("class") === 'icon-dot-circle') {
        $(this).prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
      }
    });

    $(".map_fontline input[name='maptheme']").click(function () {
        if ($(this).attr("class") === 'icon-nodot-circle-o') {
            $(this).prop('checked', true).attr('checked', true).removeClass("icon-nodot-circle-o").addClass("icon-dot-circle").parent().parent().siblings().find('input').prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
        }
    });
    $(".map_fontline input[type='checkbox']").click(function () {
        if($(this).attr("checked")){
            $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);

        }else{
            $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
        }
    });
    $(".map_left_setting input[type='checkbox']").click(function () {
      if($(this).attr("checked")){
        $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
      }else{
        $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
      }
    });
    $(".map_fontline input[name='drawArea']").click(function () {
      if ($(this).attr("class") === 'icon-nodot-circle-o') {
        $(this).prop('checked', true).attr('checked', true).removeClass("icon-nodot-circle-o").addClass("icon-dot-circle").parent().parent().siblings().find('input').prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
      }
    });

    $("#gis-warning-table-allCheck").click(function () {
      if($(this).attr("checked")){
        $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
        //所有的子选择框 置为 未选中
        $(".gis-warning-table-check").addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
      }else{
        $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
        //所有的子选择框 置为 选中
        $(".gis-warning-table-check").addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
      }
    });
    $("#gis-bayonet-table-allCheck").click(function () {
      if($(this).attr("checked")){
        $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
        //所有的子选择框 置为 未选中
        $(".gis-bayonet-table-check").addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
      }else{
        $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
        //所有的子选择框 置为 选中
        $(".gis-bayonet-table-check").addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
      }
    });
    $("#gis-keyarea-table-allCheck").click(function () {
      if($(this).attr("checked")){
        $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
        //所有的子选择框 置为 未选中
        $(".gis-keyarea-table-check").addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
      }else{
        $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
        //所有的子选择框 置为 选中
        $(".gis-keyarea-table-check").addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
      }
    });


  //跳转到图表
  $("#topo_map").on('click', function () {
      location.href = '/Chartprobe';
      localStorage.setItem("topologyType", "chart");
      localStorage.removeItem("colleNodes"); //移除集合缓存数据
      mapOwnFun.mapSaveTopoNodes();//保存数据
  });
  //跳转到拓扑
  $("#topo_gis").on('click', function () {
      localStorage.setItem("topologyType", "topo");
      mapOwnFun.mapSaveTopoNodes();//保存数据
      location.href = '/topology';
  });
  //发布
  $("#topo_dashboard").on('click',function () {
    $(".gisPlatform_alert_title").html("GIS发布");
    $(".gisPlatform_alert_content").html("确定把GIS发布至dashboard?");
    $(".gisPlatform_alert_box").show();
  });
  //发布取消
  $(".gisPlatform_button_cancel").on('click',function () {
    $(".gisPlatform_alert_box").hide();
  });
  //发布地图到dashboard
  $(".gisPlatform_button_sure").on('click', function () {
      $(".gisPlatform_alert_box").hide();

      let gisparam = [
        {
          id: "123",
          type: "entity",
          objectType:"entity",
          name: "北京",
          nodeId: "123",
          addnode:true,
          gis:{
            lon:"114.434898",
            lat:"25.303039"
          }
        },
        {
          id: "222",
          type: "entity",
          objectType:"entity",
          name: "杭州",
          nodeId: "222",
          addnode:true,
          gis:{
            lon:"94.434898",
            lat:"42.303039"
          }
        },
        {
          id: "444",
          type: "entity",
          objectType:"entity",
          name: "天津",
          nodeId: "444",
          addnode:true,
          gis:{
            lon:"106.434898",
            lat:"38.303039"
          }
        }];

      var templateType, noFill, sPos, ePos;
      localStorage.getItem('dashboardTemplate') ? templateType = localStorage.getItem('dashboardTemplate') :
        templateType = 'A';
      //根据模板，安排模板情况
      if(templateType == 'A'){
        sPos = 0;
        ePos = 6;
        noFill = [0, 1, 2, 3, 4, 5, 6];
      }
      if(localStorage.getItem('noFill')){
        noFill = JSON.parse(localStorage.getItem('noFill'));
      }
      //dashboard有位置
      if(noFill.length > 0){
        var noFill_ = [], position;
        $.extend(true, noFill_, noFill);
        if(localStorage.getItem('posi')){
          position = parseInt(localStorage.getItem('posi'));
          for(var i=0; i<noFill_.length;i++){
            if(noFill_[i]==position){
              noFill_.splice(i,1);
            }
          }
          localStorage.removeItem('posi')
        }else{
          noFill_.splice(0,1);
          position = noFill[0];
        }

        //非第一次发布dashboard
        if(localStorage.getItem('dashboardId')){
          $.ajax({
            url: EPMUI.context.url+'/dashboard/publish',
            type: 'POST',
            data: {
              "dashboardId": localStorage.getItem('dashboardId'),
              "type": "gis",
              "param": JSON.stringify(gisparam),
              "position": position,
              "nofill": JSON.stringify(noFill_)
            },
            dataType: 'json',
            error: function(err) {
            },
            success: function (data) {
              if(data.code == 200){
                location.href = '/dashboard';
              }else{
                showAlert( '提示', data.message, '#ffc000' );
              }
            }
          })
        }else{
          var paraData = {
            "template": templateType,
            "start_pos": sPos,
            "end_pos": ePos,
            "type": 'gis',
            "param": JSON.stringify(gisparam),
            "position": position,
            "nofill" :JSON.stringify(noFill_)
          }
          $.ajax({
            url: EPMUI.context.url+'/dashboard/publish/create',
            type: 'POST',
            data: paraData,
            dataType: 'json',//异步请求返回结果是ajax请求dataType值为json，jquery就会把后端返回的字符串尝试通过JSON.parse()尝试解析为js对象
            // contentType:
            success: function (data) {
              if(data.code == 200){
                location.href = '/dashboard';
              }else{
                showAlert( '提示', data.message, '#ffc000' );
              }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            }
          })
        }
        //dashboard无位置
      }else{
        showAlert( '提示', "dashboard已占满，无位置！", '#ffc000' );
      }

  });
  //map 搜索功能 显示与隐藏搜索框
  $("#map_findnodes span").click(function() {
      $(".search_nodes_modalBox").toggle();
  });
  //map 搜索功能
  $(".map_nodes_find").keydown(function(event){
      if (event.keyCode == 13) {
          USEMAP.searchNodes();
      }
  });
  $(".search_nodes_modalBox_btn").click(function(){
      USEMAP.searchNodes();
  });
  //map 回退功能
  $("#map_back").click(function(){
      USEMAP.backStep();
  });
  //map 清屏功能
  $("#map_resetscreen").click(function(){
    USEMAP.resetscreen();
    clearTimeLineInterval();//关闭计时器
    localStorage.removeItem("mapOverlays");
    localStorage.removeItem("searchAddNode");
    localStorage.removeItem("topoNodes");
    let timeLineData = [{relationName: "", time: "", y: 0}];
    mapCommonPart.addTimeLineData(timeLineData);
  });
  //map 卡口图层
  $("#map_bayonet").click(function(){
    USEMAP.bayonet();//卡口信息图层
  });
  //map 告警信息表
  $("#map_warning_person").bind("click",function () { // 弹出 预警人员表
    gisBayonetTableSign = false;
    gisKeyAreaTableSign = false;
    $(".gis-bayonet-table").css("display","none");
    $(".gis-keyarea-table").css("display","none");
    if(!gisTableSign){
      gisTableSign = true;

      if(EPMUI.context.gis.type==="PGIS"){
        USEMAP.bayonet();//卡口信息图层
      }else{
        showGisTable();
      }
    }else{
      gisTableSign = false;

      if(EPMUI.context.gis.type==="PGIS"){
        USEMAP.bayonet();//卡口信息图层
      }else{
        $(".gis-warning-table").css("display","none");
      }
    }
  });
  //打开过滤器
  $("#map_filter").on( 'click', function() {
      mapOwnFun.getFilterLinks();
      $("#map_network_filter").show();
      //$("#topo_shade").show();
      $('#map_network_filter_object').val('全部');
  } );
  //关闭过滤器
  $("#map_filter_option_cancel").on( 'click', function() {
      $("#map_network_filter").hide();
      //$("#topo_shade").hide();
  } );
  //开始过滤
  $("#map_filter_option_ensure").on( 'click', function() {
      $("#map_network_filter").hide();
      mapCommonPart.mapFilter();
  });
  //卡口过车信息
  $("#map_passCar_ensure").on('click', function () {
      mapCommonPart.setPassCar();
  });
  //拓展 关系 确认按钮
  $("#custom_confirmed").on('click',function(){
    const extendUrl = '/leaves/complex';
    const extendRelation = [];
    $('.relation_input').each(function (d,i) {
      if ($(i).hasClass("icon-check-square-o")) {//得到选中的关系type
        extendRelation.push($(i).attr("data-systemname"));
      }
    })
    if (extendRelation.length == 0) {
      $('.select_type_li').each(function (d,i) {
        if ($(i).hasClass("selectedLi")) {//得到选中的关系type
          extendRelation.push($(i).attr("data-systemname"));
        }
      })
    }
    mapOwnFun.mapExtendTopoMenu(mapCommon.mapWorkMarker[0], extendRelation, extendUrl);
    $("#relation_extend_modalBox").hide();
  });
  //设置菜单
  $("#map_event_visual").click(function(){
    if(!mapShowSign){
      mapShowSign=true;
      $("#map_settings").css("height","20px").show();
      setTimeout(function(){
        $("#map_settings").css("height","260px");
      },20);

    }else{
      mapShowSign=false;
      $("#map_settings").hide().css("height","20px");
      $("svg[type='system']").css("cursor","pointer");
    }
  });
  //设置菜单 确定和取消 按钮
  $("#setting_btn").off("click").on('click',function () {
    mapShowSign=false;
    $("#map_settings").hide().css("height","20px");
    $("svg[type='system']").css("cursor","pointer");

    //基本设置，显示设置
    let coverage;
    $("input[name='coverage']").each(function(){
      if( $(this).attr("checked")){
        coverage = $(this).val();
      }
    });
    USEMAP.baseSetting(coverage);

    //基本设置，点线设置
    let fontlineStatues = [];
    $("input[name='fontline']").each(function(){
      if( $(this).attr("checked")){
        fontlineStatues.push($(this).val());
      }
    });
    USEMAP.fontlineSetting(fontlineStatues);

    //基本设置，聚合设置 //var mapAggregation = $("input[name='setAggregation']:checked").val();
    let mapAggregation;
    $("input[name='setAggregation']").each(function(){
      if( $(this).attr("checked")){
        mapAggregation = $(this).val();
      }
    });
    USEMAP.aggregationSetting(mapAggregation);

    // 图层设置
    let showSettings = [];
    $("input[name='showSettings']").each(function(){
      if( $(this).attr("checked")){
        if( $(this).val() === "keyArea" ){
          if(!gisKeyAreaTableSign){
            showKeyAreaTable("no");
            $(this).prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
          }else{
            gisKeyAreaTableSign = false;
            $(".gis-keyarea-table").css("display","none");
          }
        }
        if( $(this).val() === "bayonet" ){
          if(!gisBayonetTableSign){
            showBayonetTable();
            $(this).prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
          }else{
            gisBayonetTableSign = false;
            $(".gis-bayonet-table").css("display","none");
          }
        }

      }
    });

    //修改逻辑~
    //USEMAP.showSetting(showSettings);
    // 重点区域设置
    /*let areaSettings = [];
    $("input[name='areaSettings']").each(function(){
      if( $(this).attr("checked")){
        areaSettings.push($(this).val());
      }
    });
    USEMAP.areaSetting(areaSettings);*/

    //绘制区域设置
    let drawAreaSign;
    $("input[name='drawArea']").each(function(){
      if( $(this).attr("checked")){
        drawAreaSign = $(this).val();
        $(this).prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
      }
    });
    USEMAP.drawAreaSetting(drawAreaSign);

  });
  $("#ret_setting_btn").click(function () {//取消设置
    mapShowSign=false;
    $("#map_settings").hide().css("height","20px");
    $("svg[type='system']").css("cursor","pointer");
    //把绘制区域置空
    $("input[name='drawArea']").each(function(){
      if( $(this).attr("checked")){
        $(this).prop('checked', false).attr('checked', false).removeClass("icon-dot-circle").addClass("icon-nodot-circle-o");
      }
    });

  });

  

  //告警信息表 卡口设备表 重点区域表 所有事件加载
  (function (){
    //告警信息表 检索功能
    $("#gis-warning-table-search").keydown(function(event){
      if (event.keyCode == 13) {
        showGisTable($("#gis-warning-table-search").val());
      }
    });
    $("#gis-warning-table-search-btn").bind("click", function(){
      showGisTable($("#gis-warning-table-search").val());
    });
    //告警信息表 行动轨迹
    $("#gis-warning-table-movepath").bind("click", function () {
      if(movePathSign){//取消
        movePathSign = false;
        $(this).parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");
      }else{//选中
        movePathSign = true;
        $(this).parent().addClass("gis-table-right-attribute-select").removeClass("gis-table-right-attribute");
      }
    });
    //告警信息表 确定按钮
    $("#gis-warning-table-ensure").bind("click",function () {
      if(movePathSign){
        addWarningToGis("movepath");
      }else{
        addWarningToGis();
      }

    });
    //关闭信息表
    $(".map-table-close-x").click(function () {
      gisTableSign = false;
      gisBayonetTableSign = false;
      gisKeyAreaTableSign = false;
      $(".gis-warning-table").css("display","none");
      $(".gis-bayonet-table").css("display","none");
      $(".gis-keyarea-table").css("display","none");
      $("#gis-add-keyarea").css("display","none");
    });

    //卡口设备表 检索功能
    $("#gis-bayonet-table-search").keydown(function(event){
      if (event.keyCode == 13) {
        showBayonetTable($("#gis-bayonet-table-search").val());
      }
    });
    $("#gis-bayonet-table-search-btn").bind("click", function(){
      showBayonetTable($("#gis-bayonet-table-search").val());
    });
    //卡口设备 实时监控
    $("#gis-bayonet-table-surveillance").bind("click",function () {
      if(surveillanceSign){//取消
        surveillanceSign = false;
        $(this).parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");
      }else{//选中
        surveillanceSign = true;
        $(this).parent().addClass("gis-table-right-attribute-select").removeClass("gis-table-right-attribute");
      }
    });
    //卡口设备 确定按钮
    $("#gis-bayonet-table-ensure").bind("click",function () {
      if(surveillanceSign){
        surveillanceSign = false;
        $("#gis-bayonet-table-surveillance").parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");
        addPayonetToGis("surveillance");
      }else{
        addPayonetToGis(false);
      }
    });

    //重点区域表 检索功能
    $("#gis-keyarea-table-search").keydown(function(event){
      if (event.keyCode == 13) {
        showKeyAreaTable("no",$("#gis-keyarea-table-search").val());
      }
    });
    $("#gis-keyarea-table-search-btn").bind("click", function(){
      showKeyAreaTable("no",$("#gis-keyarea-table-search").val());
    });
    //重点区域表 摄像头
    $("#gis-keyarea-table-camera").bind("click",function () {
      if(cameraSign){//取消
        cameraSign = false;
        $(this).parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");
      }else{//选中
        cameraSign = true;
        $(this).parent().addClass("gis-table-right-attribute-select").removeClass("gis-table-right-attribute");
      }
    });
    //重点区域表 确定按钮
    $("#gis-keyarea-table-ensure").bind("click",function () {
      if(cameraSign){
        cameraSign = false;
        $("#gis-keyarea-table-camera").parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");
        addKeyAreaToGis(true);
      }else{
        addKeyAreaToGis(false);
      }

    });
    //添加重点区域按钮
    $("#gis-add-keyarea-ensure").bind("click",function () {
      mapOwnFun.mapAddKeyAreaMenu();
    });

  })();


  //各按钮事件 end


  /**
   * 显示 告警信息表  现在为模拟数据
   * @param {*} param 搜索关键字
   */
  function showGisTable(param){
    $(".gis-warning-table").css("display","block");

    // todo 测试
    $(".gis-bayonet-table-page").pagination(12, {
      callback : mapTableCallback,
      prev_text : '< 上一页',
      next_text: '下一页 >',
      num_display_entries : 5,
      current_page: 0,
      num_edge_entries :1
    });

    function mapTableCallback(index){
      //模拟数据
      let eventdata = [//模拟数据
        {
          "id":"i1",
          "level":"紧急",
          "name":"项少龙",
          "type":"重点人员",
          "card":"371323199403073101",
          "area_id":"12343545",
          "area_name":"北京北五环1区",
          "time":"2017-03-09"
        },
        {
          "id":"2",
          "level":"紧急",
          "name":"赵东来",
          "type":"重点人员",
          "card":"371323199403073102",
          "area_id":"12343545",
          "area_name":"北京北五环1区",
          "time":"2017-11-29"
        },
        {
          "id":"124457wdfhszf3454571135",
          "level":"紧急",
          "name":"吕不韦",
          "type":"重点人员",
          "card":"371323199403073103",
          "area_id":"12343545",
          "area_name":"北京北五环1区",
          "time":"2017-11-09"
        },{
          "id":"124457wdfhszf3422545735",
          "level":"紧急",
          "name":"赵东来",
          "type":"重点人员",
          "card":"371323199403073104",
          "area_id":"12343545",
          "area_name":"北京北五环1区",
          "time":"2017-11-09"
        },
        {
          "id":"124457wdfhszf3334545735",
          "level":"紧急",
          "name":"陈琦",
          "type":"重点人员",
          "card":"371323199403073105",
          "area_id":"12343545",
          "area_name":"北京北五环1区",
          "time":"2017-01-09"
        },
        {
          "id":"124457wdfhszf4434545735",
          "level":"紧急",
          "name":"徐来",
          "type":"重点人员",
          "card":"371323199403073106",
          "area_id":"12343545",
          "area_name":"北京北五环1区",
          "time":"2017-11-09"
        },{
          "id":"124457wdfhs55zf34545735",
          "level":"紧急",
          "name":"赵东来",
          "type":"重点人员",
          "card":"371323199403073107",
          "area_id":"12343545",
          "area_name":"北京北五环7区",
          "time":"2017-12-09"
        },
        {
          "id":"124457wdfhsz66f34545735",
          "level":"紧急",
          "name":"赵东来",
          "type":"重点人员",
          "card":"371323199403073108",
          "area_id":"12343545",
          "area_name":"北京北五环4区",
          "time":"2017-11-09"
        },
        {
          "id":"124457wdfhszf3477545735",
          "level":"普通",
          "name":"赵东来",
          "type":"普通人员",
          "card":"371323199403073109",
          "area_id":"12343545",
          "area_name":"北京北五环11区",
          "time":"2017-11-09"
        },
        {
          "id":"124457wdfhsz88f34545735",
          "level":"一般",
          "name":"诸葛文",
          "type":"重点人员",
          "card":"371323199403073109",
          "area_id":"12343545",
          "area_name":"北京北五环2区",
          "time":"2018-05-09"
        }
      ];
      let gisTableHtml = '';
      let showLevel = {//告警级别映射！！！
        '紧急':'warning-level-danger',
        '严重':'warning-level-warning',
        '一般':'warning-level-info',
        '普通':'warning-level-normal'
      };
      for(let i=0, len = eventdata.length;i<len;i++){
        let vaa = JSON.stringify(eventdata[i]);
        gisTableHtml+= '<tr>'+
          '<td class="gis_table_property_5">'+
          '<div> <input class="gis-warning-table-check icon-square-o-blue" type="checkbox" name="gis-table-check" value="'+eventdata[i]+'" '+
          ' data-id="'+eventdata[i].id+'" data-type="'+eventdata[i].objectType+'" data-objectType="'+eventdata[i].objectType+
          '" data-pageType="'+eventdata[i].page_type+'" data-name="'+eventdata[i].name+'" data-nodeId="'+eventdata[i].nodeId+'"/></div>'+
          '</td>'+
          '<td class="gis_table_property_5">'+
          '<span>'+ (i+1) +'</span>'+
          '</td>'+
          '<td class="gis_table_property_7 '+ showLevel[eventdata[i].level] +'">'+
          '<span>'+ eventdata[i].level +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span>'+ eventdata[i].name +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span>'+ eventdata[i].type +'</span>'+
          '</td>'+
          '<td class="gis_table_property_15">'+
          '<span>'+ eventdata[i].card +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10 gis_table_area gis-table-td" area_id="'+ eventdata[i].area_id +'"  >'+
          '<span>'+ eventdata[i].area_name +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span>'+ eventdata[i].time +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span class="gis_table_del_warning" >删除</span>'+
          '</td>'+
          '</tr>';
      }
      $(".gis-warning-table-tbody").html(gisTableHtml);

      $(".gis-warning-table-check").unbind("click").bind("click",function () {
        if($(this).attr("checked")){
          $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
        }else{
          $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
        }
      });

      $(".gis_table_area").unbind("click").bind("click",function () {
        gisTableSign = false;
        gisBayonetTableSign = false;
        gisKeyAreaTableSign = false;
        $(".gis-warning-table").css("display","none");
        $(".gis-bayonet-table").css("display","none");
        $(".gis-keyarea-table").css("display","none");
        showKeyAreaTable("no");
      });

      $(".current").css("background","#299ABD").css("color","#fff");
    }

    return "";

    $.ajax({
      url: EPMUI.context.url + '/warning/page/total',
      type: 'POST',
      data:  { "keyword" : param, "type":"person" },
      dataType: 'json',
      success: function (data) {
        if (data.code == "200") {

          let totalpages = parseInt(data.magicube_interface_data.total);
          $(".gis-bayonet-table-page").pagination(totalpages, {
            callback : mapTableCallback,
            prev_text : '< 上一页',
            next_text: '下一页 >',
            num_display_entries : 5,
            current_page: 0,
            num_edge_entries :1
          });
        }

        //分页回掉
        function mapTableCallback(index){
          $.ajax({
            url: EPMUI.context.url + '/warning/page',//EPMUI.context.url + '/object/getKeyAreaGisList'
            type: 'POST',
            data: {
              "keyword":param,
              "type":"person",
              "pageNo":index,
              "pageSize":10
            },
            dataType: 'json',
            success: function (data) {
              if (data.code == "200") {
                let eventdata = data.magicube_interface_data;
                let gisTableHtml = '';
                let showLevel = {//告警级别映射！！！
                  '紧急':'warning-level-danger',
                  '严重':'warning-level-warning',
                  '一般':'warning-level-info',
                  '普通':'warning-level-normal'
                };
                for(let i=0, len = eventdata.length;i<len;i++){
                  let vaa = JSON.stringify(eventdata[i]);

                  let areaName = [];
                  let areaId = [];
                  for(let j=0, alen = eventdata[i].area.length ; j<alen ; j++ ){
                    for(let areasid in eventdata[i].area[j]){
                      areaId.push(areasid);
                      areaName.push(eventdata[i].area[j][areasid]);
                    }
                  }
                  let areaNameStr = areaName.join(",");
                  let areaIdStr = areaId.join(",");

                  gisTableHtml+= '<tr>'+
                    '<td class="gis_table_property_5">'+
                    '<div> <input class="gis-warning-table-check icon-square-o-blue" type="checkbox" name="gis-table-check" value="'+eventdata[i]+'" '+
                    ' data-id="'+eventdata[i].id+'" data-type="'+eventdata[i].objectType+'" data-objectType="'+eventdata[i].objectType+
                    '" data-pageType="'+eventdata[i].page_type+'" data-name="'+eventdata[i].name+'" data-nodeId="'+eventdata[i].nodeId+'"/></div>'+
                    '</td>'+
                    '<td class="gis_table_property_5">'+
                    '<span>'+ (i+1) +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_7 '+ showLevel[eventdata[i].level] +'">'+
                    '<span>'+ eventdata[i].level +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10">'+
                    '<span>'+ eventdata[i].name +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10">'+
                    '<span>'+ eventdata[i].type +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_15">'+
                    '<span>'+ eventdata[i].card +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10 gis_table_area gis-table-td" area_id="'+ areaIdStr +'"  >'+
                    '<span>'+ areaNameStr +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10">'+
                    '<span>'+ eventdata[i].time +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10">'+
                    '<span class="gis_table_del_warning" >删除</span>'+
                    '</td>'+
                    '</tr>';
                }
                $(".gis-warning-table-tbody").html(gisTableHtml);

                $(".gis-warning-table-check").unbind("click").bind("click",function () {
                  if($(this).attr("checked")){
                    $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
                  }else{
                    $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
                  }
                });

                $(".gis_table_area").unbind("click").bind("click",function () {
                  gisTableSign = false;
                  gisBayonetTableSign = false;
                  gisKeyAreaTableSign = false;
                  $(".gis-warning-table").css("display","none");
                  $(".gis-bayonet-table").css("display","none");
                  $(".gis-keyarea-table").css("display","none");
                  showKeyAreaTable($(this).attr("area_id"));
                });

                $(".current").css("background","#299ABD").css("color","#fff");
              }

            }
          });

        }

      }
    });

  }

  /**
   * 显示 卡口设备表
   * @param {*} param  搜索关键字
   */
  function showBayonetTable(param){
    gisBayonetTableSign = true;
    $(".gis-bayonet-table").css("display","block");
    let keyword = param;// ? param : "null";
    $.ajax({
      url: EPMUI.context.url + '/gis/bayonet/page',//EPMUI.context.url + '/object/getKeyAreaGisList'
      type: 'POST',
      data: {"keyword":keyword},
      dataType: 'json',
      success: function (data) {
        if (data.code == "200") {
          let totalpages = parseInt(data.magicube_interface_data);
          $(".gis-bayonet-table-page").pagination(totalpages, {
            callback : mapTableCallback,
            prev_text : '< 上一页',
            next_text: '下一页 >',
            num_display_entries : 5,
            current_page: 0,
            num_edge_entries :1
          });
        }
        //分页回掉
        function mapTableCallback(index){
          $.ajax({
            url: EPMUI.context.url + '/gis/bayonet',//EPMUI.context.url + '/object/getKeyAreaGisList'
            type: 'POST',
            data: {
              "keyword":keyword,
              "pageNo":index,
              "pageSize":10
            },
            dataType: 'json',
            success: function (data) {
              if (data.code == "200") {
                let eventdata = data.magicube_interface_data;
                let gisTableHtml = '';
                for(let i=0, len = eventdata.length;i<len;i++){
                  eventdata[i].address = eventdata[i].address ? eventdata[i].address:"-";

                  let areaName = [];
                  let areaId = [];
                  for(let j=0, alen = eventdata[i].area.length ; j<alen ; j++ ){
                    for(let areasid in eventdata[i].area[j]){
                      areaId.push(areasid);
                      areaName.push(eventdata[i].area[j][areasid]);
                    }
                  }
                  let areaNameStr = areaName.join(",");
                  let areaIdStr = areaId.join(",");

                  gisTableHtml+= '<tr>'+
                    '<td class="gis_table_property_5">'+
                    '<div> <input class="gis-bayonet-table-check icon-square-o-blue"  type="checkbox" name="gis-table-check" value="'+eventdata[i]+'" '+
                    ' data-id="'+eventdata[i].id+'" data-type="'+eventdata[i].type+'" data-objectType="'+eventdata[i].objectType+
                    '" data-pageType="'+eventdata[i].pageType+'" data-name="'+eventdata[i].name+'" data-nodeId="'+eventdata[i].nodeId+'"/></div>'+
                    '</td>'+
                    '<td class="gis_table_property_5">'+
                    '<span>'+ (i+1) +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_15">'+
                    '<span title="'+ eventdata[i].name +'">'+ eventdata[i].name +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10 gis_table_area gis-table-td" area_id="'+ areaIdStr +'" >'+
                    '<span title="'+ areaNameStr +'">'+ areaNameStr +'</span>'+
                    '</td>'+
                    '<td class="gis_table_property_10">'+
                    '<span class="gis_table_show_path" data-id="'+ eventdata[i].id +'">标记</span>'+
                    /*'<span class="gis_table_del_warning" >删除</span>'+*/
                    '</td>'+
                    '</tr>';
                }
                $(".gis-bayonet-table-tbody").html(gisTableHtml);
                $(".gis-bayonet-table-check").unbind("click").bind("click",function () {
                  if($(this).attr("checked")){
                    $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
                  }else{
                    $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
                  }
                });

                //点击所属区域，跳转到重点区域表
                $(".gis_table_area").unbind("click").bind("click",function () {
                  gisTableSign = false;
                  gisBayonetTableSign = false;
                  gisKeyAreaTableSign = false;
                  $(".gis-warning-table").css("display","none");
                  $(".gis-bayonet-table").css("display","none");
                  $(".gis-keyarea-table").css("display","none");
                  if($(this).attr("area_id")){
                    showKeyAreaTable($(this).attr("area_id"));
                  }else{
                    showAlert("提示!", "暂无所属重点区域", "#33d0ff");
                  }

                });

                $(".current").css("background","#299ABD").css("color","#fff");
              }

            }
          });

        }

      }
    });
  }

  /**
   * 显示 重点区域表
   * @param {*} idstr 重点区域的id
   * @param {*} param 搜索关键字
   */
  function showKeyAreaTable(idstr, param){
    gisKeyAreaTableSign = true;
    $(".gis-keyarea-table").css("display","block");

    let keyword = param ? param :"null";
    if(idstr === "no"){
      let ajaxurl = EPMUI.context.url + '/gis/keyArea/search/page';
      let ajaxdata = { "keyword":keyword };
      let ajaxBackUrl = EPMUI.context.url + '/gis/keyArea/search';
      $.ajax({
        url: ajaxurl,
        type: 'POST',
        data: ajaxdata,
        dataType: 'json',
        success: function (data) {
          if (data.code == "200") {
            let totalpages = parseInt(data.magicube_interface_data);
            $(".gis-keyarea-table-page").pagination(totalpages, {
              callback : mapKeyAreaTableCallback,
              prev_text : '< 上一页',
              next_text: '下一页 >',
              num_display_entries : 5,
              current_page: 0,
              num_edge_entries : 1
            });
            //分页回掉
            function mapKeyAreaTableCallback(index){
              $.ajax({
                url: ajaxBackUrl,
                type: 'POST',
                data: {
                  "keyword":keyword,
                  "pageNo":index,
                  "pageSize":10
                },
                dataType: 'json',
                success: function (data) {
                  if (data.code == "200"){
                    setKeyAreaResult(data.magicube_interface_data);
                  }
                }
              });
            }
          }
        }
      });

    }else{
      let ajaxurl = EPMUI.context.url + '/gis/keyArea/searchbyId';
      let ajaxdata = { "areaIds":keyword };
      let ajaxBackUrl = EPMUI.context.url + '/gis/keyArea/searchbyId';
      let ajaxBackData = { "areaIds":keyword };
      let ids = idstr.split(",");
      let totalpages = ids.length;
      $(".gis-keyarea-table-page").pagination(totalpages, {
        callback : mapKeyAreaIDCallback,
        prev_text : '< 上一页',
        next_text: '下一页 >',
        num_display_entries : 5,
        current_page: 0,
        num_edge_entries : 1
      });
      //分页回掉
      function mapKeyAreaIDCallback(index){
        function getEndNum(idss,ind){
          if(idss.len < (ind+1)*10){
            return idss.len;
          }else{
            return (ind+1)*10;
          }
        }

        let end = getEndNum(ids,index);
        let kw = ids.slice(index*10,end);
        $.ajax({
          url: EPMUI.context.url + '/gis/keyArea/searchbyId',
          type: 'POST',
          data: {
            "areaIds": kw
          },
          dataType: 'json',
          success: function (data) {
            if (data.code == "200"){
              setKeyAreaResult(data.magicube_interface_data);
            }
          }
        });
      }

    }

    function setKeyAreaResult(eventdata){
      let gisTableHtml = '';

      for(let i=0, len = eventdata.length;i<len;i++){
        let idsStr = "";
        if(eventdata[i].bayonetIds){
          idsStr = eventdata[i].bayonetIds.join(",");
        }
        gisTableHtml+= '<tr>'+
          '<td class="gis_table_property_5">'+
          '<div> <input class="gis-keyarea-table-check icon-square-o-blue" type="checkbox" name="gis-table-check" '+
          ' data-id="'+eventdata[i].id+'" data-shape="'+eventdata[i].shape+'" data-name="'+eventdata[i].name+'" '+
          ' data-bayonetIds="'+idsStr+'" data-lon="'+eventdata[i].lon+'" data-lat="'+eventdata[i].lat+'" data-radius="'+eventdata[i].radius+'"/></div>'+
          '</td>'+
          '<td class="gis_table_property_5">'+
          '<span>'+ (i+1) +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span>'+ eventdata[i].name +'</span>'+
          '</td>'+
          '<td class="gis_table_property_15">'+
          '<span>'+ eventdata[i].address +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span>'+ eventdata[i].bayonets +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          '<span>'+ eventdata[i].level +'</span>'+
          '</td>'+
          '<td class="gis_table_property_10">'+
          /*'<span class="gis_table_show_path" data-id="'+ eventdata[i].id +'">标记</span>'+*/
          '<span class="gis_table_del_warning gis-keyarea-table-remove" data-id="'+ eventdata[i].id +'">删除</span>'+
          '</td>'+
          '</tr>';
      }
      $(".gis-keyarea-table-tbody").html(gisTableHtml);

      $(".gis-keyarea-table-check").click(function () {
        if($(this).attr("checked")){
          $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false).attr("checked", false);
        }else{
          $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", true).attr("checked",true);
        }
      });
      $(".current").css("background","#299ABD").css("color","#fff");
      //删除按钮
      $(".gis-keyarea-table-remove").unbind("click").bind("click",function () {
        let delid = $(this).attr("data-id");
        const url = EPMUI.context.url + '/object/deleteKeyArea';
        let data = {"areaId":delid};
        let completed = function (){ return false; };
        let succeed = function(returnData) {
          if (!returnData) { return false; }
          var datas = returnData;
          if (parseInt(datas.code) === 200) {
            let delids = [];
            delids.push(delid);
            USEMAP.deleteOverlay(delids);
            showKeyAreaTable("no");//重新加载重点区域表
            showAlert("提示!", datas.message, "#33d0ff");
          } else {
            showAlert("提示!", datas.message, "#ffc000");
          }
        };
        let judgment = function() { return false; };
        mapCommonPart.ajaxAppMap(url,'POST',data,completed,succeed,judgment);
      });

    }

  }
 
  /**
   * 
   * @param {*} warnings 预警信息
   * @param {*} mvSign { false | surveillance | movepath }  实时监控 行动轨迹
   */
  function getWarningGis(warnings,mvSign){
    //轨迹数据 模拟addData = [{ gis: [113.4, 44.7], address: "红村", id: "12", name:"红村", nodeId:"22", objectType: "eny", page_type:"eny", type :"KK", time: "2000"}];
    let warningIds = [];
    let warningTypes = [];
    for(let i=0;i<warnings.length;i++){
      warningIds.push(warnings[i].id);
      warningTypes.push(warnings[i].type);
    }
    let param = { id: warningIds, type: warningTypes };
    gisAllDatas.getObjectGis(param).then(function (data) {//获得经纬度信息
      let gisData = data.magicube_interface_data;
      let warningData = [];
      for(let i=0;i<gisData.length;i++){
        for(let j=0;j<warnings.length;j++){
          if(warnings[j].id === gisData[i].id){
            let obj = {
              id: warnings[j].id,
              type: warnings[j].type,
              objectType: warnings[j].objectType,
              page_type:warnings[j].page_type,
              name: warnings[j].name,
              nodeId: warnings[j].nodeId,
              gis:{
                lon:gisData[i].lon,
                lat:gisData[i].lat
              }
            };
            warningData.push(obj);
          }
        }
      }

      // todo 测试并行分析
      if(warningData.length <= 0 && warnings.length == 2){
        if(mvSign && mvSign === "movepath"){
          movePathSign = false;
          $("#gis-warning-table-movepath").parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");

          //请求，获得行动轨迹
          let startTime = $("#gis_movepath_time").val().trim() ? $("#gis_movepath_time").val().split("~")[0].trim() : "";
          let endTime = $("#gis_movepath_time").val().trim() ? $("#gis_movepath_time").val().split("~")[1].trim() : "";

          //先计算每个实体的单独轨迹，再请求并行分析
          for(let w=0;w<warnings.length;w++){ //测试用 warnings 正式为warningData

            if(w === 0){
              let mnData = [
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
              //加点
              let mnobj = {
                id: warnings[0].id,
                type: warnings[0].type,
                objectType: warnings[0].objectType,
                page_type:warnings[0].page_type,
                name: warnings[0].name,
                nodeId: warnings[0].nodeId,
                gis: {lon:103.615239,  lat:30.830555},
                lon:103.615239,
                lat:30.830555
              };
              USEMAP.addTablePoint([mnobj]);
              
             USEMAP.addWarningMovePath(mnData,{
               gis: {lon:103.615239,  lat:30.830555},
               lon:103.615239,
               lat:30.830555,
               address: "乌鲁木齐",
               id: "273F534A64EEB25B21156q1wEF3FEA2",
               name:"乌鲁木齐",
               nodeId:"68931186",
               objectType: "entity",
               page_type:"entity",
               type :"KKXX"
             });
            }
            if(w === 1){
              let mnData = [
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
                  gis: [87.615239,  33.830555],
                  address: "乌鲁木齐",
                  id: "273F534A64EEB25B21156q1wEF3FEA2",
                  name:"乌鲁木齐",
                  nodeId:"68931186",
                  objectType: "entity",
                  page_type:"entity",
                  type :"KKXX"
                }
              ];
              //加点
              let mnobj = {
                id: warnings[1].id,
                type: warnings[1].type,
                objectType: warnings[1].objectType,
                page_type:warnings[1].page_type,
                name: warnings[1].name,
                nodeId: warnings[1].nodeId,
                gis:{lon:108.615239,  lat:23.830555},
                lon:108.615239,
                lat:23.830555
              };
              USEMAP.addTablePoint([mnobj]);

              // {
              //   gis: {lon:108.615239,  lat:23.830555},
              //   lon:108.615239,
              //   lat:23.830555,
              //   address: "乌鲁木齐",
              //   id: "273F534A64EEB25B21156q1wEF3FEA2",
              //   name:"乌鲁木齐",
              //   nodeId:"68931186",
              //   objectType: "entity",
              //   page_type:"entity",
              //   type :"KKXX"
              //  }
              USEMAP.addWarningMovePath(mnData,mnobj,"#00ff00");
            }
          }

          let txData = [{
            "endGislon": "101.78962",
            "idCardSecond": "510821195212061234",
            "beginGislat": "34.753677",
            "idCardFirst": "140322196909042951",
            "startTime": "2017-01-10 12:12:12",
            "endGislat": "36.625007",
            "beginGislon": "113.63774"
          }, {
            "endGislon": "106.556712",
            "idCardSecond": "510821195212061234",
            "beginGislat": "36.625007",
            "idCardFirst": "140322196909042951",
            "startTime": "2017-03-20 12:02:33",
            "endGislat": "29.569247",
            "beginGislon": "101.78962"
          } ];
          //添加同行分析
          USEMAP.addPathMergeAnalysis(txData);


        }
      }


      // 正式
      if(warningData.length > 0){
        USEMAP.addTablePoint(warningData);
        if(mvSign && mvSign === "surveillance"){//实时监控
          //现在是模拟数据 ， 若真实数据，在这请求
          mapOwnFun.mapShowBayonetMenu(warningData);
        }
        if(mvSign && mvSign === "movepath"){//行动轨迹
          movePathSign = false;
          $("#gis-warning-table-movepath").parent().addClass("gis-table-right-attribute").removeClass("gis-table-right-attribute-select");

          //请求，获得行动轨迹
          let startTime = $("#gis_movepath_time").val().trim() ? $("#gis_movepath_time").val().split("~")[0].trim() : "";
          let endTime = $("#gis_movepath_time").val().trim() ? $("#gis_movepath_time").val().split("~")[1].trim() : "";

          //先计算每个实体的单独轨迹，再请求并行分析
          for(let w=0;w<warningData.length;w++){
            $.ajax({
              url: EPMUI.context.url + '/object/path/gis',
              type: 'get',
              data: {
                objectId: "83e2d2a5-3fc2-4f3d-a0cf-b37868c1821b",
                objectType: "RENXX",
                beginTime: startTime,
                endTime: endTime,
                pathType:0
              },
              dataType: 'json',
              success: function(data) {
                let gisData = data.magicube_interface_data;
                // 添加轨迹
                for(let g=0;g<gisData.length;g++){
                  USEMAP.addWarningMovePath(gisData[g],warningData[w]);
                }
              }
            });
          }

          if(warningData.length == 2){
            $.ajax({
              url: EPMUI.context.url + '/object/path/mergeAnalysis',
              type: 'post',
              data: {
                listObjectId: JSON.stringify(warningIds),
                listObjectType: JSON.stringify(warningTypes),
                beginTime: startTime,
                endTime: endTime
              },
              dataType: 'json',
              success: function(data) {
                let gisData = data.magicube_interface_data;
                // 添加轨迹
                for(let g=0;g<gisData.length;g++){
                  for(let w=0;w<warningData.length;w++){
                    if(gisData[g].id === warningData[w].id){
                      USEMAP.addPathMergeAnalysis(gisData[g]);
                    }
                  }
                }
              }
            });
          }

        }
      }
    });


  }

  /**
   * 在地图上 显示 卡口数据
   * @param {*} mvSign  { false | 实时监控 | 行动轨迹 }
   */
  function addPayonetToGis(mvSign) {
    gisBayonetTableSign = false;
    $(".gis-bayonet-table").css("display","none");
    let checkedWarnings = [];
    $(".gis-bayonet-table-check").each(function(){
      if( $(this).attr("checked")){
        let wobj = {
          id: $(this).attr("data-id"),
          nodeId: $(this).attr("data-nodeId"),
          name: $(this).attr("data-name"),
          objectType: $(this).attr("data-objectType"),
          page_type: $(this).attr("data-pageType"),
          type: $(this).attr("data-type")
        };
        checkedWarnings.push(wobj);
      }
    });
    getWarningGis(checkedWarnings,mvSign);
  }

  /**
   * 地图显示重点区域数据
   * @param {*} cameraSign { true | false } 判断是否显示 卡口设备
   */
  function addKeyAreaToGis(cameraSign) {
    gisKeyAreaTableSign = false;
    $(".gis-keyarea-table").css("display","none");
    let checkedKeyarea = [];
    let cameraArr = [];
    $(".gis-keyarea-table-check").each(function(){
      if( $(this).attr("checked")){
        let centerPoint,kobj;
        let gisPointsStr = [];
        if($(this).attr("data-bayonetIds")){
          cameraArr = cameraArr.concat($(this).attr("data-bayonetIds").split(","));
        }

        if($(this).attr("data-shape") === "circle"){
          centerPoint = [$(this).attr("data-lon"), $(this).attr("data-lat")];
          kobj = {
            id: $(this).attr("data-id"),
            shape: $(this).attr("data-shape"),
            name: $(this).attr("data-name"),
            centerPoint: centerPoint,
            radius: $(this).attr("data-radius")
          };
        }else{
          let lons = $(this).attr("data-lon").split(",");
          let lats = $(this).attr("data-lat").split(",");
          for(let k=0,lonlen = lons.length;k<lonlen;k++){
            gisPointsStr.push([lons[k],lats[k]]);
          }
          kobj = {
            id: $(this).attr("data-id"),
            shape: $(this).attr("data-shape"),
            name: $(this).attr("data-name"),
            gisPointsStr: gisPointsStr
          };
        }
        checkedKeyarea.push(kobj);
      }
    });
    USEMAP.gisTableKeyArea(checkedKeyarea);
    //添加卡口 摄像头
    if(cameraSign){
      $.ajax({
        url: EPMUI.context.url + '/gis/bayonet/id',
        type: 'post',
        data: {
          id: cameraArr
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
            USEMAP.addTablePoint(warningData);
          }
        }
      });
    }
  }

  /**
   * 地图显示预警信息
   * @param {*} pathSign { false | surveillance | movepath }  实时监控 行动轨迹
   */
  function addWarningToGis(pathSign) {
    if(pathSign === "movepath"){
      let startTime = $("#gis_movepath_time").val().trim() ? $("#gis_movepath_time").val().split("~")[0].trim() : "";
      let endTime = $("#gis_movepath_time").val().trim() ? $("#gis_movepath_time").val().split("~")[1].trim() : "";
      if(!startTime || !endTime){
        showAlert( '提示', "请选择行动轨迹时间范围", '#ffc000' );
        return " ";
      }
    }

    gisTableSign = false;
    $(".gis-warning-table").css("display","none");
    let checkedWarnings = [];
    $(".gis-warning-table-check").each(function(){
      if( $(this).attr("checked")){
        let wobj = {
          id: $(this).attr("data-id"),
          nodeId: $(this).attr("data-nodeId"),
          name: $(this).attr("data-name"),
          objectType: $(this).attr("data-objectType"),
          page_type: $(this).attr("data-pageType"),
          type: $(this).attr("data-type")
        };
        checkedWarnings.push(wobj);
      }
    });
    getWarningGis(checkedWarnings, pathSign);
    //测试
    /*//请求，获得行动轨迹
    let beginTime= "2016-01-01";
    let endTime= "2018-11-01";
    let warningIds = [];
    let warningTypes = [];
    for(let i=0;i<checkedWarnings.length;i++){
      warningIds.push(checkedWarnings[i].id);
      warningTypes.push(checkedWarnings[i].type);
    }
    $.ajax({
      url: EPMUI.context.url + '/object/path/gis/multi',
      type: 'post',
      data: {
        objectIdList: JSON.stringify(warningIds),
        objectTypeList: JSON.stringify(warningTypes),
        beginTime: beginTime,
        endTime: endTime
      },
      dataType: 'json',
      success: function(data) {
        let gisData = data.magicube_interface_data;
      }
    });*/

  }
  //清除时间轴计时器
  function clearTimeLineInterval(){ //为了操作效果，只要动了时间轴，就禁止轨迹小车等的移动
    for(let l=0;l<lushuNum.length;l++){
      let lushus = lushuNum[l].lushu;
      for(let k=0;k<lushus.length;k++){
        clearInterval(lushus[k]);
      }
    }
  }
    //gis地图的加载
    window.operationGis = function (){
      //加载时间轴
      setTimeout(function () {
        magicGraph.axisWidth = $("#topology_map").width()-150;//$("#topology_timeline_axis").width();
        magicGraph.axisHeight = $("#topology_timeline_axis").height();
        magicGraph.topoTimeLineSvg.attr("width", magicGraph.axisWidth).attr("height", magicGraph.axisHeight);

        timeAxis = new MagicTopoTimeLine();
        timeAxis.resetAxis();
      },2000);



        let gispJson = localStorage.getItem("topoNodes");
        let gisp = JSON.parse(gispJson);
        let nodedata = [];
        if(gisp && gisp.hasOwnProperty("nodes")){
            nodedata = gisp.nodes;
        }
        let searchAddNode = localStorage.getItem("searchAddNode");
        if(searchAddNode){
            let sa = JSON.parse(searchAddNode);
            nodedata.push(sa[0]);
        }
        //修改界面的div布局
        let _width = $("#topology_message").css('width');
        $(".BMapLib_Drawing_panel").css("right",parseInt(_width)+12+ 'px');
        let selectGisById =[];
        let selectGisByType =[];
        if(nodedata.length > 0){//判断是否有数据
            for(let i=0;i<nodedata.length;i++){
                selectGisById.push(nodedata[i].id);
                selectGisByType.push(nodedata[i].objectType);
            }
            if(selectGisById.length > 0){
                $.ajax({
                    url: EPMUI.context.url + '/object/gis',
                    type: 'post',
                    data: {
                        id:selectGisById,
                        type:selectGisByType
                    },
                    dataType: 'json',
                    success: function (data) {
                        // 验证授权
                        if ( !mapCommonPart.mapAuthJudgment(data) ) return;
                        toggleGisStyle(data);
                    }
                });
            }else{
                let setdata = {code: 200, message: "成功", magicube_interface_data: []};
                toggleGisStyle(setdata);
            }
        }else{
            toggleGisStyle();
        }

    };
    //高级搜索地图的加载
    window.searchOperationGis = function(){
        let searchBMap = new BMapNgm.bMapNgm();
        searchBMap.searchMapRun();
    };

    /**
     * 加载对应地图
     * @param {*} data 地图显示数据
     */
    function toggleGisStyle(data) {
        if(!mapload){
            if(EPMUI.context.gis.type==="PGIS"){
                $("#map_event_visual").css("display","none");
                $("#map_gis_table").css("display","block");
                mapLoadScript('/js/gisPlatform/PGIS.js',function () { //加载,并执行回调函数
                    window.USEMAP = new PGIS.pgis();
                    USEMAP.run();
                    if(data){ //根据返回的data-gis信息，拼接nodes数据
                        initGisNodes(data);
                    }
                });
            }else if(EPMUI.context.gis.type==="bmap"){
                $("#map_area_statistics").css("display","block");
                $("#map_gis_table").css("display","block");

                Promise.all([mapLoadScriptPromise('/js/public/gis/DrawingManager.js'),
                  mapLoadScriptPromise('/js/public/gis/LuShu.js'),
                  mapLoadScriptPromise('/js/public/gis/Heatmap.js'),
                  mapLoadScriptPromise('/js/public/gis/TextIconOverlay.js'),
                  mapLoadScriptPromise('/js/public/gis/CurveLine.js'),
                  mapLoadScriptPromise('/js/public/gis/MarkerClusterer.js'),
                  mapLoadScriptPromise('/js/gisPlatform/BMapNgm.js')
                ]).then(function(value) {
                  window.USEMAP = new BMapNgm.bMapNgm();
                  USEMAP.run();
                  if(data){ //根据返回的data-gis信息，拼接nodes数据
                    initGisNodes(data);
                  }
                });

            }else if(EPMUI.context.gis.type==="arcgis"){
                $("#map_area_statistics").css("display","block");
                $("#map_gis_table").css("display","block");
                //加载css
                $("<link>").attr({ rel: "stylesheet",type: "text/css",href: EPMUI.context.gis.cssFirst }).appendTo("head");

                if(EPMUI.context.gis.cssSecond !== "null"){
                    $("<link>").attr({ rel: "stylesheet", type: "text/css", href: EPMUI.context.gis.cssSecond }).appendTo("head");
                }

                var scriptTagtt = document.getElementById('loadScriptGis');
                var headtt = document.getElementById('topology_map');
                if(scriptTagtt) headtt.removeChild(scriptTagtt);
                var scripttt = document.createElement('script');
                scripttt.src = "/js/public/arcGis/loadCluster.js";
                scripttt.type = 'text/javascript';
                scripttt.id = 'loadScriptGis';
                headtt.appendChild(scripttt);

              Promise.all([mapLoadScriptPromise('/js/public/arcGis/mapJson.js'),
                mapLoadScriptPromise('/js/gisPlatform/arcGisNgm.js'),
                mapLoadScriptPromise(EPMUI.context.gis.js)
              ]).then(function () {
                window.USEMAP = new ArcGisNgm.arcGisNgm();
                USEMAP.run();
                if(data){//根据返回的data-gis信息，拼接nodes数据
                  initGisNodes(data);
                }
              });

            }else if(EPMUI.context.gis.type==="supermap"){
                /*
                 * topology.jsx中加
                 * <script type="text/javascript" src="http://iclient.supermap.io/web/libs/iclient8c/libs/SuperMap.Include.js" />
                 <script type="text/javascript" src="http://mapv.baidu.com/build/mapv.js"></script>
                 <script type="text/javascript" src="http://iclient.supermap.io/dist/iclient-classic.js"></script>
                 * */
                /*mapLoadScript('/js/topology/superMap.js',function(){
                 window.USEMAP = new SuperMapNgm.superMapNgm();
                 USEMAP.run();
                 //根据返回的data-gis信息，拼接nodes数据
                 if(data){//根据返回的data-gis信息，拼接nodes数据
                 initGisNodes(data);
                 }
                 });*/

                //supermap for leaflet
                $("<link>").attr({ rel: "stylesheet", type: "text/css", href: "http://cdn.bootcss.com/leaflet/1.2.0/leaflet.css" }).appendTo("head");
                $("<link>").attr({ rel: "stylesheet", type: "text/css", href: "http://cdn.bootcss.com/leaflet.draw/0.4.12/leaflet.draw.css" }).appendTo("head");
                mapLoadScript('/js/public/supermap/dist/include-leaflet.js',function(){
                    mapLoadScript('/js/public/supermap/dist/iclient9-leaflet.js',function(){
                        mapLoadScript('http://cdn.bootcss.com/leaflet.draw/0.4.12/leaflet.draw.js',function(){
                            mapLoadScript('/js/gisPlatform/superMapL.js',function(){
                                window.USEMAP = new SuperMapNgm.superMapNgm();
                                USEMAP.run();
                                //根据返回的data-gis信息，拼接nodes数据
                                if(data){//根据返回的data-gis信息，拼接nodes数据
                                    initGisNodes(data);
                                }
                            });
                        });
                    });
                });

            }
        }else{
            if(data){
                initGisNodes(data);
            }else{
                USEMAP.resetscreen(); //工作台没有点，清屏
            }
        }


        let _width = $("#topology_message").css('width');


        $("#gis_usual_tools").hide();
        $("#topo_usual_tools").hide();
        $("#topology_relative").css("right","0px");

        $("#topo_dashboard").css("right",parseInt(_width) + 'px');
        $("#map_usual_tools").show().css("z-index","10000").css("right",parseInt(_width)+8+ 'px');
        $("#topology_map").show();

        $("#topology_timeline_taggle").hide().css("transform", "rotate(180deg)");
        $("#topology_relative_network").css("bottom", 0);
        $("#topology_relative_timeline").css("height", 0);



    }

    /**
     * 构造地图需要的数据
     * @param {*} data 待处理的数据
     */
    function initGisNodes(data){
        let gispJson = localStorage.getItem("topoNodes");
        let gisp = JSON.parse(gispJson);
        let nodedata = [];
        if(gisp && gisp.hasOwnProperty("nodes")){ nodedata = gisp.nodes; }
        let searchAddNode = localStorage.getItem("searchAddNode");
        let sa = JSON.parse(searchAddNode);
        sa ? nodedata.push(sa[0]) : null;
        let gisData = data.magicube_interface_data;
        let gisNodesData = [];//gis点数据
        let gisLinksData = [];//gis连线数据

        //处理为gis需要的点数据
        for(let j=0;j<nodedata.length;j++){
            let getSign = false;//判断查询到gis信息没
            for(let i=0;i<gisData.length;i++){
                if(nodedata[j].id === gisData[i].id){
                    getSign = true;
                    let obj = {
                        id: nodedata[j].id,
                        type: nodedata[j].objectType,
                        objectType: nodedata[j].type,
                        page_type:nodedata[j].page_type,
                        name: nodedata[j].name,
                        nodeId: nodedata[j].nodeId,
                        addnode:true,
                        gis:{
                            lon:gisData[i].lon,
                            lat:gisData[i].lat
                        }
                    };
                    gisNodesData.push(obj);//放入gisNodes数组
                }
            }
            //random，用来造假数据，平时不允许显示
            if(nodedata[j].name === "田雪" && !getSign){
              let randomLon = 126.773877;
              let randomLat = 45.719088;

                let obj = {
                    id: nodedata[j].id,
                    type: nodedata[j].objectType,
                    objectType: nodedata[j].type,
                    page_type:nodedata[j].page_type,
                    name: nodedata[j].name,
                    nodeId: nodedata[j].nodeId,
                    addnode:true,
                    gis:{
                        lon:randomLon,
                        lat:randomLat
                    }
                };
                //放入gisNodes数组
                gisNodesData.push(obj);
            }

        }

        //处理为gis需要的线数据
        let linksData = [];
        if(gisp && gisp.hasOwnProperty("links")){
            linksData = gisp.links;
        }
        for(let j=0;j<linksData.length;j++){
            let sourceSign = false;
            let targetSign = false;

            for(let i=0;i<gisNodesData.length;i++){
                if(linksData[j].source.id === gisNodesData[i].id){
                    sourceSign = true;
                    linksData[j].addnode = true;
                    linksData[j].source.gis = gisNodesData[i].gis;
                }
                if(linksData[j].target.id === gisNodesData[i].id){
                    targetSign = true;
                    linksData[j].addnode = true;
                    linksData[j].target.gis = gisNodesData[i].gis;
                }
                if(targetSign&&sourceSign){
                    if(gisNodesData[i].hasOwnProperty("nogis")){
                        linksData[j].nogis = false;
                    }

                    gisLinksData.push(linksData[j]);
                    break;
                }

            }

        }
        gisNodes = gisNodesData;
        gisLinks = gisLinksData;

        let getmapLoadType = setInterval(function(){
            if(mapload){
                USEMAP.addPoint(gisNodes,gisLinks);
                clearInterval(getmapLoadType);//清除计时器
            }
        },500);
    }

    //操作菜单
    var mapWorkMenus = function() {
        this.svg = d3.select(".topoMenu")[0][0] === 'g' ? d3.select(".topoMenu") : d3.select("g.main"),
            this.menuDatas = {
                modelDataId: [0],
                txtModel: ['更多'],
                depth: ['more'],
                direction: ['more'],
                passShipLabel: ['more']
            },
            this.pie = function(a, b, c) {
                var pie = d3.layout.pie()
                    .padAngle(0)
                    .startAngle(a)
                    .endAngle(b)
                    .value(function() {
                        return c;
                    })
                    .sort(null);
                return pie;
            },
            this.arc = function(a, b) {
                var arc = d3.svg.arc()
                    .innerRadius(a)
                    .outerRadius(b);
                return arc;
            },
            this.attrTween = function(acr, staAngle) {
                var _that = this;
                return function(d) {
                    var start = {
                        startAngle: staAngle,
                        endAngle: staAngle
                    };
                    var interpolate = d3.interpolate(start, d);
                    return function(t) {
                        return acr(interpolate(t));
                    };
                }
            },
            //移除菜单
            this.remove = function() {
                d3.select(".topoMenu")
                    .selectAll(".topoMenu_path")
                    .transition()
                    .duration(100)
                    .remove();
            },
            //mouseover选中
            this.over = function(name) {
                d3.selectAll(".topoMenu_inring")
                    .filter(function(d) {
                        return d.data === name;
                    })
                    .attr("class", "topoMenu_inring topoMenu_inring_over");

                d3.selectAll(".topoMenu_outring")
                    .filter(function(d) {
                        return d.data === name;
                    })
                    .attr("class", "topoMenu_outring topoMenu_outring_over");
            },
            this.onmenu = function(name) {
                d3.selectAll(".topoMenu_inring")
                    .filter(function(d) {
                        return d.data === name;
                    })
                    .attr("class", "topoMenu_inring topoMenu_inring_onmenu");
            },
            //统一传参
            this.myConfig = function(startAngles, endAngles, carc, ctext, cimageName, classNames, cpievalue, ctype = undefined, cdepth = undefined, cdirection = undefined, cpassShipLabel = undefined) {
                var config = {
                    startAngle: startAngles,
                    endAngle: endAngles,
                    arc: carc,
                    text: ctext,
                    imageName: cimageName,
                    className: classNames,
                    pievalue: cpievalue,
                    type: ctype,
                    depth: cdepth,
                    direction: cdirection,
                    passShipLabel: cpassShipLabel
                };
                return config;
            },
            this.clickMore = function (data) {
                var moreExtend = data.name.slice(4, data.name.length);
                var extendSysName = data.id.slice(4, data.id.length);
                for (let i = 0; i < moreExtend.length; i++) {
                    let $ulTemp = i === moreExtend.length-1 ? $("<li class='extend_type_uli selected_li'></li>") : $("<li class=extend_type_uli></li>");
                    $ulTemp.append("<span id=" + extendSysName[i] + " class=extend_span_list/>" +
                        moreExtend[i] + "</span>");
                    $ulTemp.prependTo(".extend_list_ul");
                }
                $("#extend_more_modalBox").show();
                $(".extend_type_uli").click(function () {
                    if ($(this).hasClass("selected_li")) {
                        $(this).removeClass("selected_li");
                    } else {
                        $(this).addClass("selected_li").siblings().removeClass("selected_li");
                    }
                });
                $("#extend-ensured").off("click").on("click",function () {
                    const systemId = [];
                    $(".selected_li").each(function (d,i) {
                        systemId.push($(i).children().attr("id"));
                    });
                    mapOwnFun.mapExtendTopoMenu(mapCommon.mapWorkMarker[0], systemId, '/leaves/');
                    $("#extend_more_modalBox").hide();
                    $(".extend_list_ul").empty();
                });

                $("#extend-canceled").off("click").on("click",function () {
                  $("#extend_more_modalBox").hide();
                  $(".extend_list_ul").empty();
                });

            },
            //功能：加载可用的更多扩展数据
            this.getAllTypeToGroup = function(group, klass) {
                var _that = this;
                if (!links.length) return;
                var typedata = new Set();
                links.map(link => typedata.add(link.relationTypeName));
                var allTypearray = Array.from(typedata);
                for (var i = 0, len = allTypearray.length; i < len; i++) {
                    var $ulTemp = $("<li class=group_type_uli ></li>");
                    $ulTemp.append("<span class=group_span_list >" + allTypearray[i] + "</span>");
                    $ulTemp.prependTo(".group_list_ul");
                };
                this.remove();
                $(".relation_group").fadeIn();
                $(".group_type_uli").click(function() {
                    $(this).addClass("selected_li").siblings().removeClass("selected_li");
                    var $html = $(this).children().html();
                    _that.groupLinks($html)
                    $(".relation_group").hide();
                    $(".group_list_ul").empty();
                });
            },
            //对getMoreMenus()得到的数据进行处理
            this.sliceName = function(a, s) {
                var obj = {
                    name: [],
                    sysname: [],
                    id: []
                };
                var str = s;
                if (a[0].name.length > 5) {
                    var c = a[0].name.slice(0, 4);
                    var d = a[0].sysname.slice(0, 4);
                    var e = a[0].id.slice(0, 4);
                    c.push("更多");
                    d.push("more");
                    e.push(str);
                    obj.name.push(...c);
                    obj.sysname.push(...d);
                    obj.id.push(...e);
                    return obj;
                } else {
                    obj.name = a[0].name;
                    obj.sysname = a[0].sysname;
                    obj.id = a[0].id;
                    return obj;
                }
            },
            //获得实体，文档，事件的更多分类
            this.getMoreMenus = function() {
                var type = ["Entity", "Document", "Event"];
                var moreMenusData = [
                    [{
                        "name": [],
                        "sysname": [],
                        "id": []
                    }],
                    [{
                        "name": [],
                        "sysname": [],
                        "id": []
                    }],
                    [{
                        "name": [],
                        "sysname": [],
                        "id": []
                    }]
                ];
                for (var i = 0; i < type.length; i++) {
                    (function(i) {
                        const url = EPMUI.context.url + '/nextType/';
                        let data = {"objectType": type[i],"type": "topology","order": true};
                        let completed = function (){
                            return false;
                        };
                        let succeed = function(data) {
                            if (data.length) {
                                for (let j = 0; j < data.length; j++) {
                                    moreMenusData[i][0].name.push(data[j].displayName);
                                    moreMenusData[i][0].sysname.push(data[j].systemName);
                                    moreMenusData[i][0].id.push(data[j].systemName);
                                }
                            }
                        };
                        mapCommonPart.ajaxAppMap (url,'GET', data, completed, succeed);
                    })(i);
                }
                return moreMenusData;
            }
    };
    //功能：菜单一级生成函数，生成对应的二级菜单
    mapWorkMenus.prototype.oneTopoMenus = function(config,markORarea) {
        var menusg = d3.select(".complexCustomOverlay").append('g');
        var _that = this;
        menusg.attr("class", "topoMenu")
            .attr("transform", function() {
                return "translate(250,250)";
            });
        var selectedPath = menusg
            .selectAll("topoMenu_path")
            .data(this.pie(config.startAngle, config.endAngle, config.pievalue)(config.imageName))
            .enter()
            .append("g")
            .attr("class", "topoMenu_path " + config.className)
            //.attr("data-text",function(d,i){return config.imageName[i];})
            .attr("data-depth", function(d, i) {
                return config.depth ? config.depth[i] : 'default';
            })
            .attr("data-direction", function(d, i) {
                return config.direction ? config.direction[i] : 'default';
            })
            .attr("data-passShipLabel", function(d, i) {
                return config.passShipLabel ? config.passShipLabel[i] : 'default';
            })
            .attr("data-type", function(d, i) {
                return config.type ? config.type[i] : 'default'
            })
            .on("mouseenter", function(d, i) {
                d3.select(this)
                    .selectAll(".topoMenu_inring")
                    .attr("class", "topoMenu_inring topoMenu_inring_enter");
                switch (d.value) {
                    //第一次层菜单
                    case 1:
                        var arc = [115, 180];
                        d3.selectAll('.thrl_menu').remove();
                        //clearTimeout(menuTimeout);
                        d3.select(this)
                            .selectAll(".topoMenu_inring")
                            .attr("class", "topoMenu_inring topoMenu_inring_over")
                        d3.select(this)
                            .selectAll(".topoMenu_outring")
                            .attr("class", "topoMenu_outring topoMenu_outring_over");
                        if (d.data === 'extend') {
                            let texts = ["All", "按实体", "按文档", "按事件", "按关系"];
                            let imagename = ["all", "entity", "document", "event", "relation"];
                            let endAngle = Math.PI; //扩展结束角度
                            let className = 'tl_menu menu_extend';
                            if (!$(".menu_extend").length) {
                                var markConfig = _that.myConfig(0, endAngle, arc, texts, imagename, className, 2)
                                resetMenuMap.oneTopoMenus(markConfig, "mark");
                            }
                            d3.selectAll('.menu_path,.menu_show').remove();
                        }
                        if (d.data === 'path') {

                            let mapPathBasePoint = mapCommon.mapWorkMarker[0];
                            if(EPMUI.context.gis.type==="arcgis"){
                              mapPathBasePoint = mapCommon.mapWorkMarker[0].graphic.attributes;
                            }

                            if(mapPathBasePoint.type === EPMUI.context.gis.bayonet){
                                d3.selectAll('.menu_extend,.menu_show').remove();
                            }else{
                                let texts = ["轨迹设置", "删除轨迹"];
                                let imagename = ["path", "delete"];
                                let startAngle = 0.4545 * Math.PI; //显示开始角度
                                let endAngle = 0.7875 * Math.PI; //显示结束角度
                                let className = 'tl_menu menu_path';
                                if (!$(".menu_path").length) {
                                    var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 3);
                                    resetMenuMap.oneTopoMenus(markConfig, "mark");
                                }
                                d3.selectAll('.menu_extend,.menu_show').remove();
                            }

                        }
                        if (d.data === 'show') {
                            let texts = ["拓扑", "图表"];
                            let imagename = ["gis", "tabel"];
                            let startAngle = 1.4545 * Math.PI; //显示开始角度
                            let endAngle = 1.7875 * Math.PI; //显示结束角度
                            let className = 'tl_menu menu_show';
                            if (!$(".menu_show").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 4);
                                resetMenuMap.oneTopoMenus(markConfig, "mark");
                            }
                            d3.selectAll('.menu_extend,.menu_path').remove();
                        }
                        if (d.data==='delete'||d.data==='checkout'||d.data==='cancele'||d.data==='move'||d.data === 'save') {
                            d3.selectAll('.tl_menu').remove();
                        }
                        break;
                    //扩展菜单部分
                    case 2:
                        var arc = [180, 245];
                        _that.over('extend');
                        if (d.data === 'entity') {
                            let texts = _that.sliceName(getMoreMenus[0], "eimore").name;
                            let imagename = _that.sliceName(getMoreMenus[0], "eimore").sysname;
                            let extendType = _that.sliceName(getMoreMenus[0], "eimore").id;
                            let endAngle = 0.5 * Math.PI; //扩展结束角度
                            let className = 'thrl_menu menu_extend_entity';
                            if (!$(".menu_extend_entity").length) {
                                var markConfig = _that.myConfig(0, endAngle, arc, texts, imagename, className, 6, extendType);
                                resetMenuMap.oneTopoMenus(markConfig, "mark");
                            }
                            d3.selectAll('.menu_extend_document,.menu_extend_event').remove();
                        }
                        if (d.data === 'document') {
                            let texts = _that.sliceName(getMoreMenus[1], "dmore").name;
                            let imagename = _that.sliceName(getMoreMenus[1], "dmore").sysname;
                            let extendType = _that.sliceName(getMoreMenus[1], "dmore").id;
                            let startAngle = 0.162 * Math.PI; //模型第二次结束角;
                            let endAngle = 0.672 * Math.PI; //模型第二次结束角;
                            let className = 'thrl_menu menu_extend_document';
                            if (!$(".menu_extend_document").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 7, extendType);
                                resetMenuMap.oneTopoMenus(markConfig, "mark");
                            }
                            d3.selectAll('.menu_extend_entity,.menu_extend_event').remove();
                        }
                        if (d.data === 'event') {
                            let texts = _that.sliceName(getMoreMenus[2], "evmore").name;
                            let imagename = _that.sliceName(getMoreMenus[2], "evmore").sysname;
                            let extendType = _that.sliceName(getMoreMenus[2], "evmore").id;
                            let startAngle = 0.332 * Math.PI; //模型第二次结束角;
                            let endAngle = 0.842 * Math.PI; //模型第二次结束角;
                            let className = 'thrl_menu menu_extend_event';
                            if (!$(".menu_extend_event").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 8, extendType);
                                resetMenuMap.oneTopoMenus(markConfig, "mark");
                            }
                            d3.selectAll('.menu_extend_entity,.menu_extend_document').remove();
                        }
                        if (d.data === 'all' || d.data === 'relation' || d.data === 'router') {
                            d3.selectAll('.thrl_menu').remove();
                        }
                        break;
                    //轨迹菜单
                    case 3:
                        var arc = [180, 245];
                        _that.over('path');
                        break;
                    case 4:
                        _that.over('show');
                        break;
                    case 6:
                        _that.over('extend');
                        _that.onmenu('entity');
                        break;
                    case 7:
                        _that.over('extend');
                        _that.onmenu('document');
                        break;
                    case 8:
                        _that.over('extend');
                        _that.onmenu('event');
                        break;
                    //选区
                    //选区菜单-第一层
                    case 11:
                        var arc = [115, 180];
                        d3.selectAll('.thrl_menu').remove();
                        d3.select(this)
                            .selectAll(".topoMenu_inring")
                            .attr("class", "topoMenu_inring topoMenu_inring_over")
                        d3.select(this)
                            .selectAll(".topoMenu_outring")
                            .attr("class", "topoMenu_outring topoMenu_outring_over");
                        if (d.data === 'extend') {
                            let texts = ["All", "按实体", "按文档", "按事件", "按关系"];
                            let imagename = ["all", "entity", "document", "event", "relation"];
                            let endAngle = Math.PI; //扩展结束角度
                            let className = 'tl_menu menu_extend';
                            if (!$(".menu_extend").length) {
                                var markConfig = _that.myConfig(0, endAngle, arc, texts, imagename, className, 12)
                                resetMenuMap.oneTopoMenus(markConfig, "area");
                            }
                            d3.selectAll('.menu_delete,.menu_search').remove();
                        }
                        if (d.data === 'event') {//areasearch
                            /*let texts = [ "重点人", "卡口", "重点关系"];
                            let imagename = ["entity", "event", "relation"];
                            let startAngle = 0.45 * Math.PI; //显示开始角度
                            let endAngle = 1.25 * Math.PI; //扩展结束角度
                            let className = 'tl_menu menu_search';
                            if (!$(".menu_search").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 14)
                                resetMenuMap.oneTopoMenus(markConfig, "area");
                            }*/
                            d3.selectAll('.menu_delete,.menu_extend').remove();
                        }
                        if (d.data === 'delete') {
                            let texts = ["删除选区", "删除内点", "删除外点"];
                            let imagename = ["delarea", "inpoint", "outpoint"];
                            let startAngle = 0; //显示开始角度
                            let endAngle = 0.7875 * Math.PI; //显示结束角度
                            let className = 'tl_menu menu_delete';
                            if (!$(".menu_delete").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 13);
                                resetMenuMap.oneTopoMenus(markConfig, "area");
                            }
                            d3.selectAll('.menu_extend,.menu_search').remove();
                        }
                        if (d.data==='statistics'||d.data==='cancele'||d.data==='keyarea') {
                            d3.selectAll('.tl_menu').remove();
                        }
                        break;
                    case 12:
                        _that.over('extend');
                        break;
                    case 13:
                        _that.over('delete');
                        break;
                    //选区菜单-第二层
                    case 14:
                        var arc = [180, 245];
                        _that.over('areasearch');
                        if (d.data === 'entity') {
                            let texts = ["All", "吸毒", "酒驾"];
                            let imagename = ["all", "druged", "car"];//这里需要修改啊
                            let extendType = ["all", "druged", "car"];
                            //let extendType = ["asall", "asentity", "asevent", "asrelation"];
                            let startAngle = 0.4 * Math.PI; //显示开始角度
                            let endAngle = 0.95 * Math.PI; //扩展结束角度
                            let className = 'thrl_menu menu_search_entity';
                            if (!$(".menu_search_entity").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 15, extendType);
                                resetMenuMap.oneTopoMenus(markConfig, "area");
                            }
                        }
                        if (d.data==='event' || d.data==='relation') {//卡口
                            d3.selectAll('.thrl_menu').remove();
                        }
                        break;
                    case 15:
                        _that.over('areasearch');
                        _that.onmenu('entity');
                        break;
                    //重点区域菜单-第一层
                    case 21:
                        var arc = [115, 180];
                        d3.selectAll('.thrl_menu').remove();
                        d3.select(this)
                            .selectAll(".topoMenu_inring")
                            .attr("class", "topoMenu_inring topoMenu_inring_over");
                        d3.select(this)
                            .selectAll(".topoMenu_outring")
                            .attr("class", "topoMenu_outring topoMenu_outring_over");
                        if (d.data === 'extend') {
                            let texts = ["All", "重点人物", "重点事件"];
                            let imagename = ["all", "entity", "event"];
                            let startAngle = 0.1545 * Math.PI; //显示开始角度
                            let endAngle = 0.7875 * Math.PI; //显示结束角度
                            let className = 'tl_menu menu_extend';
                            if (!$(".menu_extend").length) {
                                var markConfig = _that.myConfig(startAngle, endAngle, arc, texts, imagename, className, 22)
                                resetMenuMap.oneTopoMenus(markConfig, "area");
                            }
                        }
                        if (d.data==='delete'||d.data==='statistics'||d.data==='peoplemove'||d.data==='analyse'||d.data==='cancele') {
                            d3.selectAll('.tl_menu').remove();
                        }
                        break;
                    default:
                }
            })
            .on("mouseleave", function(d, i) {
                d3.selectAll(".topoMenu_inring")
                    .attr("class", "topoMenu_inring");
                d3.selectAll(".topoMenu_outring")
                    .attr("class", "topoMenu_outring");
            })
            .on("click", function(d, i) {
                //第一层菜单
                if (d.value === 1) {
                    if (d.data === 'checkout'||d.data === 'cancele'||d.data === 'delete'||d.data === 'move'||d.data === 'node') {//取消菜单
                        _that.remove();
                    }
                    if (d.data === 'delete') {//删除
                        mapOwnFun.mapRemoveTopoMenu();
                    }
                    if( d.data === 'bayonet'){ //实时监控
                      mapOwnFun.mapShowBayonetMenu();
                    }
                    if (d.data === 'path') {//轨迹 过车信息
                        let mapPathBasePoint = mapCommon.mapWorkMarker[0];
                        if(EPMUI.context.gis.type==="arcgis"){
                          mapPathBasePoint = mapCommon.mapWorkMarker[0].graphic.attributes;
                        }
                        if(mapPathBasePoint.type === EPMUI.context.gis.bayonet){
                            // 遮罩弹框显示、弹框显示
                            $("#map_entity-shade").show();
                            $("#map_entity-alert").show().find(".cancel").click(function(){
                                $("#map_entity-shade").hide();
                                $("#map_entity-alert").hide();
                                //地图允许缩放
                                setmapProperty("null", "zoom-true", "null");
                            });
                        }
                    }
                    if (d.data === 'move') {//移动
                        mapOwnFun.mapMoveTopoMenu(mapCommon.mapWorkMarker[0]);
                    }
                    if (d.data === 'save') {//存点
                        mapOwnFun.mapSaveTopoMenu(mapCommon.mapWorkMarker[0]);
                    }
                    if (d.data === 'checkout') {//查看
                        mapOwnFun.mapCheckTopoMenu();
                        //globalFuction.saveLocalStorage(); //同步工作台
                        location.href = '/' + config.nodeArray[3] + '?id=' + config.nodeArray[0] + '&type=' + config.nodeArray[2]; //跳转到详细页面
                    }
                    if (d.data === 'cancele') {//取消
                        mapOwnFun.mapOffTopoMenu();
                    }
                    d3.selectAll("#newDiv").remove();
                }
                //第二层菜单-----扩展菜单
                if (d.value === 2) {
                    if (d.data === 'relation') {
                        _that.remove();
                        $("#relation_extend_modalBox").show();
                    } else if (d.data === 'router') {
                        magicFunctions.errors('没有数据');
                    } else {
                        var clickarr = {
                            'all': 'All',
                            'entity': 'Entity',
                            'document': 'Document',
                            'event': 'Event'
                        };
                        mapOwnFun.mapExtendTopoMenu(mapCommon.mapWorkMarker[0], clickarr[d.data], '/leaves/');
                    }
                }
                //第二层菜单-----轨迹菜单
                if (d.value === 3) {
                    if (d.data === 'path') {
                      mapOwnFun.mapPathTopoMenu(mapCommon.mapWorkMarker[0]);

                      $(".map_path").show().css("height","210px");
                      setTimeout(function(){
                        $(".map_path").css("overflow","visible");
                      },10);

                      $(".map_path").unbind("mouseover").bind("mouseover",function(){
                        $(".map_path").css("height","210px");
                        setTimeout(function(){
                          $(".map_path").css("overflow","visible");
                        },10);
                      });

                    }
                    if (d.data === 'delete') {
                        mapOwnFun.mapRemovePathTopoMenu(mapCommon.mapWorkMarker[0].id);
                    }
                }
                //第二层菜单-----显示菜单
                if (d.value === 4) {
                    if (d.data === 'tabel') {
                        location.href = '/Chartprobe';
                    }
                    if (d.data === 'gis') {
                        location.href = '/topology';
                    }
                }
                //第三层菜单-----扩展详细菜单
                if (d.value === 6 || d.value === 7 || d.value === 8) {
                    var this_type = $(this).attr("data-type");
                    switch (this_type) {
                        //对应实体，文档，事件的更多菜单
                        case "eimore":
                            _that.clickMore(getMoreMenus[0][0]);
                            break;
                        case "dmore":
                            _that.clickMore(getMoreMenus[1][0]);
                            break;
                        case "evmore":
                              _that.clickMore(getMoreMenus[2][0]);
                            break;
                        default:
                            mapOwnFun.mapExtendTopoMenu(mapCommon.mapWorkMarker[0], d.data, '/leaves/');
                            _that.remove();
                    }

                }
                //选区
                //第一层菜单
                if (d.value === 11) {
                    if (d.data === 'cancele' || d.data === 'statistics' || d.data === 'keyarea') {//取消菜单
                        _that.remove();
                    }
                    if (d.data === 'cancele') {//取消
                        mapOwnFun.mapOffTopoMenu();
                    }
                    if (d.data === 'statistics'){
                        $(".topology_message_tab_active").removeClass("topology_message_tab_active");
                        $("#topo_total_title").addClass("topology_message_tab_active");
                        $(".topo_message").hide();
                        $("#topology_search_loading").hide();
                        $("#topology_message_total").show();

                        mapOwnFun.mapClickAreaMenu(mapCommon.mapWorkArea.areaLays, "Statistics");
                    }
                    if (d.data === 'keyarea'){
                      //弹框输入信息
                      $("#gis-add-keyarea").show();
                      //  mapOwnFun.mapAddKeyAreaMenu();
                    }
                    if (d.data==='event') {//卡口
                        mapOwnFun.bayonetAreaMenu();
                    }

                    d3.selectAll("#newDiv").remove();
                }
                //第二层菜单-----扩展菜单
                if (d.value === 12) {
                    if (d.data === 'relation') {
                        $("#relation_extend_modalBox").show();
                        _that.remove();
                    } else if (d.data === 'router') {
                        magicFunctions.errors('没有数据');
                    } else {
                        var clickarr = {
                            'all': 'All',
                            'entity': 'Entity',
                            'document': 'Document',
                            'event': 'Event'
                        };
                        mapOwnFun.mapExtendAreaMenu(mapCommon.mapWorkArea.areaLays, clickarr[d.data]);
                    }
                }
                //第二层菜单-----删除菜单
                if (d.value === 13) {
                    var clickarr = {
                        'delarea': 0,
                        'inpoint': 1,
                        'outpoint': 2
                    };
                    mapOwnFun.mapRemoveAreaMenu(mapCommon.mapWorkArea.areaLays, clickarr[d.data]);
                    d3.selectAll("#newDiv").remove();
                }
                //第二层菜单-----搜索菜单
                if (d.value === 14) {
                    //let imagename = ["entity", "event", "relation"];
                    if (d.data==='event') {//卡口
                        mapOwnFun.bayonetAreaMenu();
                    }

                }
                //第三层菜单-----搜索--重点人
                if (d.value === 15) {
                    //let texts = ["All", "吸毒", "违法", "酒驾"];
                    //let extendType = ["asall", "asentity", "asevent", "asrelation"];
                    if (d.data === 'all') {
                        mapOwnFun.mapClickAreaSearchMenu("all");
                    }
                    if (d.data === 'druged') {//吸毒重点人
                        mapOwnFun.mapClickAreaSearchMenu("druged");
                    }
                    if (d.data === 'car') {//酒驾重点人
                        mapOwnFun.mapClickAreaSearchMenu("car");
                    }
                    d3.selectAll("#newDiv").remove();
                }
                //重点区域
                if (d.value === 21) {
                    if (d.data ==='cancele'||d.data ==='statistics'||d.data ==='peoplemove'||d.data ==='analyse') {//取消菜单
                        _that.remove();
                    }
                    if (d.data === 'cancele') {//取消
                        mapOwnFun.mapOffTopoMenu();
                    }
                    if (d.data === 'delete') {//删除
                        mapOwnFun.mapClickKeyAreaMenu("delete");
                    }
                    if (d.data === 'statistics'){
                        $(".topology_message_tab_active").removeClass("topology_message_tab_active");
                        $("#topo_total_title").addClass("topology_message_tab_active");
                        $(".topo_message").hide();
                        $("#topology_search_loading").hide();
                        $("#topology_message_total").show();

                        //mapOwnFun.mapClickAreaMenu(mapCommon.mapKeyArea.areaLays, "Statistics");
                    }
                    if (d.data === 'payonet'){
                      mapOwnFun.mapClickKeyAreaMenu("payonet");
                    }
                    if (d.data === 'peoplemove'){//人员流动
                        mapOwnFun.mapClickKeyAreaMenu("peoplemove");
                    }
                    if (d.data === 'analyse'){//区域分析
                        mapOwnFun.mapClickKeyAreaMenu("analyse");
                    }
                    d3.selectAll("#newDiv").remove();
                }
                //第二层菜单-----显示菜单   显示重点区域中的  关注实体（人、事件、反恐等
                if (d.value === 22) {
                    if (d.data === 'all') {
                      mapOwnFun.mapClickKeyAreaMenu("show", "all");
                    }
                    if (d.data === 'entity') {//重点人
                      mapOwnFun.mapClickKeyAreaMenu("show", "entity");
                    }
                    if (d.data === 'event') {//重点事件
                      mapOwnFun.mapClickKeyAreaMenu("show", "event");
                    }
                    d3.selectAll("#newDiv").remove();
                }

            });
        selectedPath.append("path").attr("d", this.arc(config.arc[0], config.arc[1]))
            .attr("class", "topoMenu_inring")
            .transition()
            .duration(300)
            .attrTween("d", this.attrTween(this.arc(config.arc[0], config.arc[1]), config.startAngle, config.endAngle));
        //外层的黑色圆环
        if (config.arc.length > 2) {
            selectedPath.append("path")
                .attr("class", "topoMenu_outring")
                .attr("d", this.arc(config.arc[2], config.arc[3]))
                .transition()
                .attrTween("d", this.attrTween(this.arc(config.arc[2], config.arc[3]), config.startAngle, config.endAngle));
        }
        //菜单操作提示文字信息
        selectedPath.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", function(d, i) {
                var x = _that.arc(config.arc[0], config.arc[1]).centroid(d)[0];
                var y = _that.arc(config.arc[0], config.arc[1]).centroid(d)[1] + 23;
                return "translate(" + x + "," + y + ")";
            })
            .style("fill", "#fff")
            .transition()
            .delay(350)
            .text(function(d, i) {
                return config.text[i];
            });
        //操作菜单图片
        selectedPath.append("image")
            .attr("x", function(d, i) {
                var x = _that.arc(config.arc[0], config.arc[1]).centroid(d)[0] - 15;
                return x;
            })
            .attr("y", function(d, i) {
                var y = _that.arc(config.arc[0], config.arc[1]).centroid(d)[1] - 20;
                return y;
            })
            .attr("width", 28)
            .attr("height", 28)
            .transition()
            .delay(350)
            .attr("xlink:href",d =>"../../image/typeicon/" + d.data.toLowerCase() + ".svg");
            /*.attr("xlink:href", function(d, i) {
                return EPMUI.context.url + "/static/typeicon/" + d.data.toLowerCase() + ".svg";
            });*/
    };

    //地图通用模块
    window.mapCommonPart = {
        /**
         * 
         * @param {*} name 根据name，得到路书的size
         */
        getLuShuByName:function (name){
          for(let l=0;l<lushuNum.length;l++){
            if(lushuNum[l].name === name){
              return lushuNum[l];
            }
          }
        },
        /**
         * 禁止文字选择 （拖拽时候使用）
         */
        selectText : function () {
          "getSelection" in window
            ?
            window.getSelection().removeAllRanges() :
            document.selection.empty();
        },
        /**
         * 
         * @param {*} id1   dom元素id
         * @param {*} event 
         */
        surveillanceDragBar: function(id1, event) {
          var ev = event || window.event;
          var x = ev.clientX;
          var y = ev.clientY;
          var target1 = $(id1);
          var _top = target1.position().top;
          var _left = target1.position().left;
          mapCommonPart.selectText();
          $(document).bind("mousemove", function (event) {
            var _ev = event || window.event;
            var mx = _ev.clientX - x;
            var my = _ev.clientY - y;
            target1.css({
              "top": _top + my,
              "left": _left + mx
            });
          });
          $(document).bind('mouseup', function () {
            $(this).unbind();
            mapCommonPart.selectText();
          });

        },
        /**
         * 
         * @param {*} tld 时间轴 需要显示的数据
         */
        addTimeLineData: function(tld){
          timeAxis.disposeTimeData(tld);
        },
        /**
         * 
         * @param {*} result  授权判断
         */
        mapAuthJudgment:function ( result ) {
            if ( result.code && result.code === 407 ) {
                showAlert( "提示", result.message, "#ffc000" );
                return false;
            }
            return true;
        },
        /**
         * map通用请求接口函数
         * @param {*} urls      url
         * @param {*} types     请求类型
         * @param {*} datas     数据
         * @param {*} completed complete时 回调函数
         * @param {*} succeed   success时  回调函数
         * @param {*} judgment  对应授权    回调函数
         * @param {*} errored   error时    回调函数
         * @param {*} tradit    是否自动解析数组
         */
        ajaxAppMap:function (urls, types, datas, completed, succeed, judgment, errored, tradit){
            var trad = tradit?true:false;
            let thisJudgment = function() { };
            let thisError = function() {
                $("#page_alert").show();
                $("#page_alert_content").html("没有数据");
            };
            let defaultError = errored || thisError;
            let defaultJudgment = judgment || thisJudgment;
            $.ajax({
                url: urls,
                traditional: trad, //是否自动解析数组  打开会出错
                type: types,
                data: datas,
                dataType: "json",
                complete: function() {
                    completed();
                },
                success: function(data) {
                    // 授权验证
                    if (!mapCommonPart.mapAuthJudgment(data)){
                        defaultJudgment();//调到对应授权
                        return;
                    }
                    succeed(data);
                },
                error: function(error) {
                    defaultError();
                }
            })
        },
        /**
         * 提示框
         */
        mapTooltip:function (){
            var mapSet = document.createElement("div");
            mapSet.className = "mapTooltip";
            //用来设置外层边框阴影
            var mapSetPanel = document.createElement("div");
            mapSetPanel.className = "mapTooltip_panel";
            mapSet.appendChild(mapSetPanel);
            mapSetPanel.innerHTML =
                '<div class="mapTooltip_label_div">'+
                '<label class="mapTooltip_label"> ! 黄色图标为无坐标数据'+
                '</label>'+
                '</div>'
            ;
            $("#basemap").append(mapSet);

            setTimeout(function(){
                $(".mapTooltip").css("left","0px");
            },1000);

            setTimeout(function(){
                $(".mapTooltip").css("left","-200px");
            },5000);
        },
        /**
         * 正则表达式 去除两侧空格
         * @param {*} v 要处理的字符串
         */
        mapTrim:function(v){
            return v.replace(/(^\s*)|(\s*$)/g, "");
        },
        /**
         * 获得曲线path  的所有点
         * @param {*} points 要获得曲线的区间两点
         * @param {*} size 拼成曲线的节点个数
         */
        bmapGetCurveLine:function(points,size){
            var curvePoints = [];
            for (var i = 0; i < points.length - 1; i++) {
                var p = mapCommonPart.mapGetCurveLineByTwoPoints(points[i], points[i + 1],size);
                if (p && p.length > 0) {
                    curvePoints = curvePoints.concat(p);
                }
            }
            return curvePoints;
        },
        /**
         * 生成曲线的函数
         * @param {*} obj1 起点
         * @param {*} obj2 终点
         * @param {*} size 生成节点个数
         */
        mapGetCurveLineByTwoPoints:function (obj1, obj2, size) {
            if (!obj1 || !obj2 || !(obj1 instanceof BMap.Point) || !(obj2 instanceof BMap.Point)) {
                return null;
            }

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

            var count=30; // 曲线是由一些小的线段组成的，这个表示这个曲线所有到的折线的个数
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

            var lat1 = parseFloat(obj1.lat);
            var lat2 = parseFloat(obj2.lat);
            var lng1 = parseFloat(obj1.lng);
            var lng2 = parseFloat(obj2.lng);

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
                /*t = 0;
                 h = lng1 - lng2;*/
                if((lng2 - lng1 + 0.000000001) != 0){
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 + 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }else{
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 - 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }

            } else if (lng2 == lng1) {
                /*t = Math.PI / 2;
                 h = lat1 - lat2;*/
                if((lng2 - lng1 + 0.000000001) != 0){
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 + 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }else{
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 - 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }

            } else {
                t = Math.atan((lat2 - lat1) / (lng2 - lng1));
                h = (lat2 - lat1) / Math.sin(t);
            }
            if (t2 == 0) {
                t2 = (t + (Math.PI / (5+size*2)));
            }
            h2 = h / 2;
            lng3 = h2 * Math.cos(t2) + lng1;
            lat3 = h2 * Math.sin(t2) + lat1;

            for (i = 0; i < count + 1; i++) {
                curveCoordinates.push(new BMap.Point(
                    (lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
                    (lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc))
                ));
                inc = inc + (1 / count);
            }

            return curveCoordinates;
        },
        /**
         * 地图过滤器
         */
        mapFilter:function(){
            var startTime = $("#map_time").val().trim() ? $("#map_time").val().split("~")[0].trim() : "";
            var endTime = $("#map_time").val().trim() ? $("#map_time").val().split("~")[1].trim() : "";

            //声明关系过滤数组
            var relationArr = [];
            var arr = Array.prototype.slice.call($('.relation_tip_active'));
            arr.map((item, index) => {
                relationArr.push(item.getAttribute('data-relationTypeName'));
            });

            var propertyArr = [];//中间部分
            $(".property_value").each( function( index, item ) {
                var value = $.trim( $( item ).text() ).split( "_" );
                if( !!value[3] ) {
                    var propertyObj = {
                        "rootType": $(item).attr("data-root"),
                        "objectType": $(item).attr("data-object"),
                        "property": $(item).attr("data-type"),
                        "dataType": $(item).attr("data-flag"),
                        "value": value[3]
                    };
                    propertyArr.push( propertyObj );
                }
            } );

            var totalAllId = {};  // 拓扑图所有节点 id+type
            var filters = mapOwnFun.getFilterIdType(),
                keys = [], ids = [],
                key, id;
            for (var i = 0, len = filters.length; i < len; i++) {
                key = filters[i].type,
                    id = filters[i].id;
                if (JSON.stringify(keys).indexOf(key) === -1) {
                    ids = [];
                    keys.push(key);
                    ids.push(id);
                    totalAllId[key] = ids;
                } else {
                    totalAllId[key].push(id);
                }
            }
            //totalAllId = {};//这两句后面应该删除 临时增加的 因为前面两部分不起作用
            //var propertyArr = [];//中间部分
            if (propertyArr.length>0) {
                var advanceData = [{
                    objectIds: totalAllId,
                    startTime: startTime,
                    endTime: endTime,
                    property: propertyArr
                }];
                var datas = { param: JSON.stringify(advanceData) };
                $.post( EPMUI.context.url + '/search/filter', datas, function( data ) {
                    var hideIds = data ? JSON.parse( data ) : [];
                    USEMAP.filterMapMarker(hideIds,"node");
                } );
            }else {
                USEMAP.filterMapMarker(relationArr,"relation");//地图关系过滤 前提是无节点过滤
            }
        },
        /**
         * 获得cname对应的cookie值
         * @param {*} cname key
         */
        getCookie:function(cname){
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++)
            {
                var c = ca[i].trim();
                if (c.indexOf(name)==0) return c.substring(name.length,c.length);
            }
            return "";
        },
        /**
         * 地图圆环菜单，“更多”按钮
         */
        getMoreMenusMap:function () {
            var type = ["Entity", "Document", "Event"];
            var moreMenusData = [
                [{
                    "name": [],
                    "sysname": [],
                    "id": []
                }],
                [{
                    "name": [],
                    "sysname": [],
                    "id": []
                }],
                [{
                    "name": [],
                    "sysname": [],
                    "id": []
                }]
            ];
            for (var a = 0; a < type.length; a++) {
                (function(a) {
                    const url = EPMUI.context.url + '/nextType/';
                    let data = {"objectType": type[a],"type": "topology","order": true};
                    let completed = function (){ return false; };
                    let succeed = function(data) {
                        if (data.length) {
                            for (let b = 0; b < data.length; b++) {
                                moreMenusData[a][0].name.push(data[b].displayName);
                                moreMenusData[a][0].sysname.push(data[b].systemName);
                                moreMenusData[a][0].id.push(data[b].systemName);
                            }
                            return moreMenusData;
                        }
                    };
                    let judgment = function() { return false; };
                    mapCommonPart.ajaxAppMap(url,'GET',data,completed,succeed,judgment);
                })(a);
            }
            return moreMenusData;
        },
        /**
         * 基本信息的圆环菜单  卡口的圆环菜单
         * @param {*} conf 配置信息
         * @param {*} type {topomenu | kkmenu } 区分是基本信息菜单，还是卡口菜单
         */
        topomenu:function(conf,type){
          d3.selectAll("#newDiv").remove();
          let getLeft = conf.getLeft;
          let getTop = conf.getTop;
          let div = document.createElement("div");
          div.setAttribute("id", "newDiv");
          div.style.position = "absolute";
          div.style.left = getLeft + "px";
          div.style.top = getTop + "px";
          div.style.backgroundColor = "rgba(0,0,0,0)";
          div.style.fontSize = "12px";
          mapOwnFun.mapAddTopoMenu(div);
          let svg = $("<svg class='complexCustomOverlay' style='width: 500px;height: 500px; cursor:pointer;'> </svg>").appendTo(div);
          let texts;
          let imageType;
          let nodeArray;
          if(type === "topomenu"){
            texts = ["删除", "扩展", "轨迹", "移动", "存点", "查看", "显示", "取消"];
            imageType = ["delete", "extend", "path", "move", "save", "checkout", "show", "cancele"];
            nodeArray = [conf.markerId, conf.nodeId, conf.nodeType, conf.page_type];
          }
          if(type === "kkmenu"){
            texts = ["删除", "实时监控", "过车信息", "移动", "存点", "查看", "显示", "取消"];
            imageType = ["delete", "bayonet", "path", "move", "save", "checkout", "show", "cancele"];
            nodeArray = [conf.markerId, conf.nodeId, conf.nodeType, conf.page_type];
          }
          let config = {
            arc: [46, 105, 105, 115],
            startAngle: 0,
            endAngle: 2 * Math.PI,
            text: texts,
            imageName: imageType,
            className: 'ol_menu',
            pievalue: 1,
            position: [250, 250],
            nodeArray: nodeArray,
            groupNodes: null
          };
          resetMenuMap.oneTopoMenus(config, "mark");
        },
        /**
         * 地图选区的圆环菜单 重点区域的圆环菜单
         * @param {*} conf 配置信息
         * @param {*} type  { keyAreamenu | areamenu } 区分是地图选区菜单，还是重点区域菜单
         */
        menu:function(conf,type){
          let a = conf.thisClick;
          let e = conf.areaLays; //e  areaLays
          d3.selectAll("#newDiv").remove();
          mapOwnFun.mapAddAreaMenu(a);
          let texts;
          let imageType;
          let nodeArray;
          let pievalue;
          if(type === "keyAreamenu"){
            pievalue = 21;
            let analyseType = "区域分析";
            let peopleMoveType = "人员流动";
            if(EPMUI.context.gis.type==="bmap"){
              analyseType = conf.areaLays.addattr.analyse ? "清除分析" : "区域分析";
              peopleMoveType = conf.areaLays.addattr.peopleMove ? "清除信息" : "人员流动";
            }else if(EPMUI.context.gis.type==="arcgis"){
              analyseType = conf.areaLays.graphic.attributes.analyse ? "清除分析" : "区域分析";
              peopleMoveType =  "人员流动";
            }

            texts = ["删除区域", "显示", "摄像头", peopleMoveType, analyseType,"取消"];
            imageType = ["delete", "extend", "payonet", "peoplemove", "analyse", "cancele"];
            nodeArray = [conf.markerId, conf.nodeId, conf.nodeType, conf.objectType];

          }
          if(type === "areamenu"){
            pievalue = 11;
            texts = ["删除", "扩展", "重点区域","取消"];//检索  "卡口",  "统计",
            imageType = ["delete", "extend", "keyarea", "cancele"];//areasearch  "event", "statistics",
            nodeArray = [conf.markerId, conf.nodeId, conf.nodeType, conf.objectType];
          }

          let config = {
            arc: [46, 105, 105, 115],
            startAngle: 0,
            endAngle: 2 * Math.PI,
            text: texts,
            imageName: imageType,
            className: 'ol_menu',
            pievalue: pievalue,
            position: [250, 250],
            nodeArray: nodeArray,
            groupNodes: null
          };
          resetMenuMap.oneTopoMenus(config, "area");
        },
        /**
         * 获得曲线的函数
         * @param {*} obj1 起点
         * @param {*} obj2 终点
         * @param {*} csize 弧度
         * @param {*} scount 个数
         */
        getCurveByTwoPoints:function (obj1, obj2, csize, scount) {
            var setsize = csize?csize:0;
            var setcount = scount?scount:30;
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
            var count=setcount; // 曲线是由一些小的线段组成的，这个表示这个曲线所有到的折线的个数
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
            var lat1 = parseFloat(obj1.gis.lat);
            var lat2 = parseFloat(obj2.gis.lat);
            var lng1 = parseFloat(obj1.gis.lon);
            var lng2 = parseFloat(obj2.gis.lon);
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
                /*t = 0;
                 h = lng1 - lng2;*/
                if((lng2 - lng1 + 0.000000001) != 0){
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 + 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }else{
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 - 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }
            } else if (lng2 == lng1) {
                /*t = Math.PI / 2;
                 h = lat1 - lat2;*/
                if((lng2 - lng1 + 0.000000001) != 0){
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 + 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }else{
                    t = Math.atan((lat2 - lat1 + 0.000000001) / (lng2 - lng1 - 0.000000001));
                    h = (lat2 - lat1 + 0.000000001) / Math.sin(t);
                }
            } else {
                t = Math.atan((lat2 - lat1) / (lng2 - lng1));
                h = (lat2 - lat1) / Math.sin(t);
            }
            if (t2 == 0) {
                t2 = (t + (Math.PI / (5+(setsize*2))));
            }
            h2 = h / 2;
            lng3 = h2 * Math.cos(t2) + lng1;
            lat3 = h2 * Math.sin(t2) + lat1;

            for (i = 0; i < count + 1; i++) {
                curveCoordinates.push({
                        "lon":(lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
                        "lat":(lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc))
                    }
                );
                inc = inc + (1 / count);
            }

            return curveCoordinates;
        },
        /**
         * 获取所有需要扩展的数据
         * @param {*} marker 基本点
         * @param {*} thr { single | multi } 单个点，还是多个点
         * @param {*} id  ajax请求参数
         * @param {*} type ajax请求参数
         * @param {*} nodeId ajax请求参数
         * @param {*} objtype ajax请求参数
         * @param {*} extendUrl ajax请求url
         */
        mapMainRadraw:function (marker, thr, id, type, nodeId, objtype, extendUrl){
            let ajaxurl = EPMUI.context.url + extendUrl;
            let completed = function (){ return false; };
            let judgment = function() { return false; };
            let succeed = function(data){
                var graph = data;
                //请求成功，有数据
                var selectGisById = [];
                var selectGisByType = [];
                if (parseInt(graph.code) == 200) {
                    var toWrokData = marker;
                    var toWrokgraph = graph;

                    var parseDatas = data.magicube_interface_data;
                    let setId = new Set();
                    for (var i = 0; i < parseDatas.length; i++) {
                        setId.add(parseDatas[i].id);
                    }
                    //循环，加点
                    setId.forEach( sid => {
                        selectGisById.push(sid);
                        for (var j = 0; j < parseDatas.length; j++) {
                            if(parseDatas[j].id === sid){
                                selectGisByType.push(parseDatas[j].objectType);
                                break;
                            }
                        }
                    });
                    if(thr == "single"){
                        mapCommonPart.getmapGis(parseDatas,selectGisById,selectGisByType,marker);//请求后端，获得经纬度信息 进行拓展
                    }else if(thr == "multi"){
                        mapCommonPart.getmapGis(parseDatas,selectGisById,selectGisByType,marker,true);//请求后端，获得经纬度信息 进行拓展
                    }
                    setTimeout(function () {
                        //globalFuction.getDatatoDraw(toWrokgraph, toWrokData, objtype,"/leaves/")//工作台联动 //同步工作台
                    }, 500);

                }
            };
            if(thr == "single"){
                let ajaxdata = {
                    objectId: id,
                    nodeId: nodeId,
                    objectType: type,
                    type: objtype
                };

                if(extendUrl === '/leaves/complex'){
                  ajaxdata = {
                    centerObjectId: id,
                    centerNodeId: nodeId,
                    centerObjectType: type,
                    passLabelOfRelationship: objtype
                  };
                }

                mapCommonPart.ajaxAppMap(ajaxurl,'POST',ajaxdata,completed,succeed,judgment,null,true);
            }else if(thr == "multi"){

                var dataNodes = {
                    objectId: id,
                    objectType: type,
                    nodeId: nodeId
                };
                let data = {"objectId": dataNodes.objectId,"nodeId": dataNodes.nodeId,"objectType": dataNodes.objectType,"type": objtype};
                mapCommonPart.ajaxAppMap(ajaxurl,'POST',data,completed,succeed,judgment,null,true);
            }
        },

        /**
         * 获取经纬度信息
         * @param {*} parseDatas 需要查询经纬度的所有点
         * @param {*} selectGisById  需要查询经纬度的点 的id
         * @param {*} selectGisByType 需要查询经纬度的点 的类型
         * @param {*} marker          点击的点
         * @param {*} multiSign       是否是多选
         */
        getmapGis:function (parseDatas,selectGisById,selectGisByType,marker,multiSign){
            let ajaxurl = EPMUI.context.url + '/object/gis';
            let ajaxdata = { id: selectGisById, type: selectGisByType };
            let completed = function (){ return false; };
            let succeed = function(data) { initMapGisNodes(data); };
            let judgment = function() { return false; };
            mapCommonPart.ajaxAppMap(ajaxurl,'POST',ajaxdata,completed,succeed,judgment);
            // 构造地图需要的数据
            function initMapGisNodes(data) {
                var gisData = data.magicube_interface_data;
                //gisData 存放的是有经纬度的id对应数据
                //selectGisById 存放的是这次所有的id
                //新建一个 数组, 里面根据 selectGisById 对应一个经纬度
                let allGisById = new es6_Map();

                //显示无经纬度点
                /*selectGisById.forEach( sgbi => {
                    let hasGis = false;
                    for (let i = 0; i < gisData.length; i++) {
                        if(sgbi === gisData[i].id){
                            let setid = gisData[i].id;
                            hasGis = true;
                            allGisById.set(setid, gisData[i]);
                        }
                    }
                    if(!hasGis){
                        var numlon = getRandomGis("lon");
                        var randomLon = numlon.toFixed(6);
                        var numlat = getRandomGis("lat");
                        var randomLat = numlat.toFixed(6);
                        let setGis = {
                            id: sgbi,
                            lon: randomLon,
                            lat: randomLat
                        };

                        allGisById.set(sgbi, setGis);
                    }
                });

                var gisExpandData = [];
                for (var j = 0; j < parseDatas.length; j++) {
                  var gisSign = false;
                  var obj;
                  var multiSource;//保存根节点
                  if(multiSign){// 多点拓展
                    for (var m=0;m<marker.length;m++){
                      if(parseDatas[j].source == marker[m].id){
                        multiSource = marker[m];
                      }
                    }
                  }else {
                    multiSource = null;
                  }

                  if(marker){
                    obj = {
                      id: parseDatas[j].id,
                      type: parseDatas[j].objectType,
                      objectType: parseDatas[j].type,
                      page_type:parseDatas[j].page_type,
                      name: parseDatas[j].target,
                      nodeId: parseDatas[j].nodeId,
                      source:multiSource,
                      relationId:parseDatas[j].relationId,
                      relationParentType:parseDatas[j].relationParentType,
                      relationTypeName: parseDatas[j].relationTypeName,
                      time: parseDatas[j].time,
                      addnode: true,
                      nogis:true,
                      gis: {
                        lon: allGisById.get(parseDatas[j].id).lon,
                        lat: allGisById.get(parseDatas[j].id).lat
                      },
                      tag:parseDatas[j].tag
                    };
                  }else{
                    obj = {
                      id: parseDatas[j].id,
                      type: parseDatas[j].objectType,
                      objectType: parseDatas[j].type,
                      page_type:parseDatas[j].page_type,
                      name: parseDatas[j].name,
                      nodeId: parseDatas[j].nodeId,
                      addnode:true,
                      nogis:true,
                      gis: {
                        lon: allGisById.get(parseDatas[j].id).lon,
                        lat: allGisById.get(parseDatas[j].id).lat
                      }
                    };
                  }

                  gisExpandData.push(obj);
                }
                // 对gisExpandData 循环 加点线  地图扩展
                addMapPointLine(gisExpandData,marker,multiSign);*/

              //不显示无经纬度点 start
                gisData.forEach( gd => {
                	let hasGis = false;
                	for (let i = 0; i < selectGisById.length; i++) {
                  	if(gd.id === selectGisById[i]){
                    	let setid = selectGisById[i];
                    	hasGis = true;
                    	allGisById.set(setid, gd);
                    }
                  }
                });

                var gisExpandData = [];
                for (var j = 0; j < parseDatas.length; j++) {
                  if(allGisById.has(parseDatas[j].id)){
                    var gisSign = false;
                    var obj;
                    var multiSource;//保存根节点
                    if(multiSign){// 多点拓展
                      for (var m=0;m<marker.length;m++){
                        if(parseDatas[j].source == marker[m].id){
                          multiSource = marker[m];
                        }
                      }
                    }else {
                      multiSource = null;
                    }

                    if(marker){
                      obj = {
                        id: parseDatas[j].id,
                        type: parseDatas[j].type,
                        objectType: parseDatas[j].objectType,
                        page_type:parseDatas[j].page_type,
                        name: parseDatas[j].target,
                        nodeId: parseDatas[j].nodeId,
                        source:multiSource,
                        relationId:parseDatas[j].relationId,
                        relationParentType:parseDatas[j].relationParentType,
                        relationTypeName: parseDatas[j].relationTypeName,
                        time: parseDatas[j].time,
                        addnode: true,
                        gis: {
                          lon: allGisById.get(parseDatas[j].id).lon,
                          lat: allGisById.get(parseDatas[j].id).lat
                        },
                        tag:parseDatas[j].tag
                      };
                    }else{
                      obj = {
                        id: parseDatas[j].id,
                        type: parseDatas[j].type,
                        objectType: parseDatas[j].objectType,
                        page_type:parseDatas[j].page_type,
                        name: parseDatas[j].name,
                        nodeId: parseDatas[j].nodeId,
                        addnode:true,
                        gis: {
                          lon: allGisById.get(parseDatas[j].id).lon,
                          lat: allGisById.get(parseDatas[j].id).lat
                        }
                      };
                    }

                    gisExpandData.push(obj);
                  }
                }
                // 对gisExpandData 循环 加点线  地图扩展
                addMapPointLine(gisExpandData,marker,multiSign);
                  // 不显示无经纬度的点 end

            }

        },
        /**
         * 卡口过车信息展示
         */
        setPassCar: function (){
          /*$(".map_alert-content").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
          });*/

          var startTime = $("#gis_passCar_time").val().trim() ? $("#gis_passCar_time").val().split("~")[0].trim() : "";
          var endTime = $("#gis_passCar_time").val().trim() ? $("#gis_passCar_time").val().split("~")[1].trim() : "";

          if(startTime && endTime){
            var index = 0;
            /*let data = [
              {
                "time":"2018-05-03",
                "value":[
                  {
                    "display":"票号",
                    "value":"D067168"
                  },
                  {"display":"车次","value":"K238"},
                  {"display":"发站","value":"广州"},
                  {"display":"到站","value":"太原"},
                  {"display":"车厢号","value":"14"},
                  {"display":"座位号","value":"0007"},
                  {"display":"乘车日期","value":"2018-05-03"},
                  {"display":"车票状态","value":"已出票"}
                ]
              },
              {
                "time":"2017-10-15",
                "value":[
                  {"display":"票号","value":"X010861"},
                  {"display":"车次","value":"G2601"},
                  {"display":"发站","value":"石家庄"},
                  {"display":"到站","value":"阳泉北"},
                  {"display":"车厢号","value":""},
                  {"display":"座位号","value":""},
                  {"display":"乘车日期","value":"2017-10-15"},
                  {"display":"车票状态","value":"已出票"}
                ]
              },
              {
                "time":"2016-11-14",
                "value":[
                  {"display":"票号","value":"9206358"},
                  {"display":"车次","value":"6032"},
                  {"display":"发站","value":"榆次"},
                  {"display":"到站","value":"阳泉"},
                  {"display":"车厢号","value":"01"},
                  {"display":"座位号","value":"0063"},
                  {"display":"乘车日期","value":"2016-11-14"},
                  {"display":"车票状态","value":"已出票"}
                ]
              }
            ];
            // 表头绑定点击事件
            $("#map_entity-alert>.map_alert-content").html('');
            let message = data;
            // 渲染弹框内表格数据
            for(let i=0; i<message.length; i++){
              if(i === 0){
                $("#map_entity-alert>.map_alert-content").append($(`<li class="tableStyle table-show"><p>` + ((i+1)+index*10) + `.卡口过车信息` + message[i].time + `<span class="icon-angle-up"></span></p></li>`));
              }else{
                $("#map_entity-alert>.map_alert-content").append($(`<li class="tableStyle"><p>` + ((i+1)+index*10) + `.卡口过车信息` + message[i].time + `<span class="icon-chevron-down-blue"></span></p></li>`));
              }
              let str = '';
              let messageValue = message[i].value;
              for(let j=0; j<messageValue.length; j++){
                str += `<tr><td style="width: 30%;">` + messageValue[j].display + `</td><td style="word-break: break-all;">` + messageValue[j].value + `</td></tr>`;
              }

              $(`<table><tbody>`+ str +`</tbody></table>`).appendTo($("#map_entity-alert>.map_alert-content>.tableStyle:eq(" + i + ")"));
            }

            $(".tableStyle").click(function(){
              if($(this).hasClass("table-show")){
                $(this).removeClass("table-show").find('span').removeClass("icon-angle-up").addClass("icon-chevron-down-blue");
                $(this).find('tableStyle').css('display', 'none');
              }else{
                $(this).addClass("table-show").find('span').addClass("icon-angle-up").removeClass("icon-chevron-down-blue");
                $(this).find('tableStyle').css('display', 'inline-table');
              }
            });



            //滚动条插件
            let $PaginationUl = $(".map_alert-content");
            try{
              !!$PaginationUl.data("mCS") && $PaginationUl.mCustomScrollbar("destroy"); //Destroy
            }catch (e){
              $PaginationUl.data("mCS",''); //手动销毁
            }
            $PaginationUl.mCustomScrollbar({
              theme: Magicube.scrollbarTheme,
              autoHideScrollbar: true
            });


            return '';*/

              //滚动条插件
              let $PaginationUl = $(".map_alert-content");
              try{
                !!$PaginationUl.data("mCS") && $PaginationUl.mCustomScrollbar("destroy"); //Destroy
              }catch (e){
                $PaginationUl.data("mCS",''); //手动销毁
              }
              $PaginationUl.mCustomScrollbar({
                theme: Magicube.scrollbarTheme,
                autoHideScrollbar: true
              });

              startTime += " 00:00:00";
              endTime +=" 00:00:00";

              let ajaxurlPage = EPMUI.context.url + '/object/gis/event';


              let mapPathBasePoint = mapCommon.mapWorkMarker[0];
              if(EPMUI.context.gis.type==="arcgis"){
                mapPathBasePoint = mapCommon.mapWorkMarker[0].graphic.attributes;
              }

              let workIdPage = mapPathBasePoint.baseMsg.id;
              let workTypePage = mapPathBasePoint.baseMsg.type;

              let ajaxdataPage = {
                  objectId: workIdPage,
                  objectType:workTypePage,
                  beginTime: startTime,
                  endTime: endTime,
                  pageSize:0,
                  pageNo:0
              };
              let completedPage = function (){ return false; };
              let judgmentPage = function() { return false; };
              let succeedPage = function(retData){
                  if(retData.code == "200"){
                      var total = retData.magicube_interface_data[0].total;
                      $("#map_kkxx_page").pagination(total, {
                          callback : mapKKXXPageCallback,
                          prev_text : '< 上一页',
                          next_text: '下一页 >',
                          num_display_entries : 10,
                          current_page: 0,
                          num_edge_entries : 1
                      });
                  }
              };
              mapCommonPart.ajaxAppMap(ajaxurlPage,'GET',ajaxdataPage,completedPage,succeedPage,judgmentPage);
          }

          function mapKKXXPageCallback(index){
              //$(".current").css("background","#299ABD").css("color","#fff");

            let ajaxurl = EPMUI.context.url + '/object/gis/event';

            let mapPathBasePoint = mapCommon.mapWorkMarker[0];
            if(EPMUI.context.gis.type==="arcgis"){
              mapPathBasePoint = mapCommon.mapWorkMarker[0].graphic.attributes;
            }
            let workId = mapPathBasePoint.baseMsg.id;
            let workType = mapPathBasePoint.baseMsg.type;
            let ajaxdata = {
              objectId: workId,
              objectType:workType,
              beginTime: startTime,
              endTime: endTime,
              pageSize:10,
              pageNo:index
            };
            let completed = function (){ return false; };
            let judgment = function() { return false; };
            let succeed = function(retData){
              if(retData.code == "200"){
                  let data = retData.magicube_interface_data;
                  // 表头绑定点击事件
                  $("#map_entity-alert>.map_alert-content").html('');
                  let message = data;
                  // 渲染弹框内表格数据
                  for(let i=0; i<message.length; i++){
                      if(i === 0){
                          $("#map_entity-alert>.map_alert-content").append($(`<li class="tableStyle table-show"><p>` + ((i+1)+index*10) + `.卡口过车信息` + message[i].time + `<span class="icon-angle-up"></span></p></li>`));
                      }else{
                          $("#map_entity-alert>.map_alert-content").append($(`<li class="tableStyle"><p>` + ((i+1)+index*10) + `.卡口过车信息` + message[i].time + `<span class="icon-chevron-down-blue"></span></p></li>`));
                      }
                      let str = '';
                      let messageValue = message[i].value;
                      for(let j=0; j<messageValue.length; j++){
                          str += `<tr><td style="width: 30%;">` + messageValue[j].display + `</td><td style="word-break: break-all;">` + messageValue[j].value + `</td></tr>`;
                      }

                      $(`<table><tbody>`+ str +`</tbody></table>`).appendTo($("#map_entity-alert>.map_alert-content>.tableStyle:eq(" + i + ")"));
                  }

                  $(".tableStyle").click(function(){
                      if($(this).hasClass("table-show")){
                          $(this).removeClass("table-show").find('span').removeClass("icon-angle-up").addClass("icon-chevron-down-blue");
                          $(this).find('tableStyle').css('display', 'none');
                      }else{
                          $(this).addClass("table-show").find('span').addClass("icon-angle-up").removeClass("icon-chevron-down-blue");
                          $(this).find('tableStyle').css('display', 'inline-table');
                      }
                  });
              }
            };
            mapCommonPart.ajaxAppMap(ajaxurl,'GET',ajaxdata,completed,succeed,judgment);
          }
        }
    };

  //--------- 所有的数据请求 -------------
  let gisAllData = function () {
    this.getAjaxBase = function (urls,param,type,tradit) {
      return new Promise(function (resolve,reject) {
        let getTradit = tradit? true:false;
        $.ajax({
          url: urls,
          traditional: getTradit, //是否自动解析数组
          type: type,
          data: param,
          dataType: "json",
          success: function(data) {
            // 授权验证
            if (!mapCommonPart.mapAuthJudgment(data)){//未授权
              reject("未授权该功能!");
            }else{
              resolve(data);
            }
          },
          error: function(error) {
            reject("未查询到数据!");
          }
        })
      });
    }
  };
  //搜索框 普通搜索页数
  gisAllData.prototype.getSearchModulePage = function (param) {
    let _thatGisData = this;
    return new Promise(function(resolve, reject) {
      _thatGisData.getAjaxBase(EPMUI.context.url + '/object/page',param,'POST').then(function (data) {
        resolve(data);
      }).catch(function () {
        reject("未查询到数据!");
      });
    })
  };
  //搜索框 普通搜索数据
  gisAllData.prototype.getSearchModuleData = function (param) {
    let _thatGisData = this;
    return new Promise(function(resolve, reject) {
      _thatGisData.getAjaxBase(EPMUI.context.url + '/search',param,'POST').then(function (data) {
        resolve(data);
      }).catch(function () {
        reject("未查询到数据!");
      });
    })
  };
  //搜索框 拖拽结束数据
  gisAllData.prototype.getSearchModuleDragData = function (dropObj) {
    let _thatGisData = this;
    return new Promise(function(resolve, reject) {
      _thatGisData.getAjaxBase(EPMUI.context.url + "/object/partInformation/" + dropObj.id + "/" + dropObj.type,null,'GET').then(function (data) {
        resolve(data);
      }).catch(function () {
        reject("未查询到数据!");
      });
    })
  };
  //获取 点的经纬度信息
  gisAllData.prototype.getObjectGis = function (param) {
    let _thatGisData = this;
    return new Promise(function(resolve, reject) {
      _thatGisData.getAjaxBase(EPMUI.context.url + '/object/gis',param,'POST').then(function (data) {
        resolve(data);
      }).catch(function () {
        reject("未查询到数据!");
      });
    })
  };


  // ------------- 搜索框 --------------
  let searchModule = function () { };
  //搜索框:添加
  searchModule.prototype.addModule = function (domid) {
    var mapSet = document.createElement("div");
    mapSet.className = "map_select";
    //用来设置外层边框阴影
    var mapSetPanel = document.createElement("div");
    mapSetPanel.className = "map_select_panel";
    mapSet.appendChild(mapSetPanel);
    //'<button id="selectSuper" class="map_select_btn map_select_btn_background">高级检索</button>'+
    mapSetPanel.innerHTML =
      '<div class="map_selectDiv">'+
      '<div class="map_select_input_div">'+
      '<input type="text" id="map_select_input" placeholder="  输入进行搜索..." autocomplete="off">'+
      '</div>'+
      '<div class="map_select_btn_div"><div>'+
      '<div id="selectObject" class="map_select_btn map_select_btn_background">'+
      '<span class="left_top1"></span><span class="left_top2"></span><span class="left_bottom1"></span><span class="left_bottom2"></span>'+
      '<span class="right_top1"></span><span class="right_top2"></span><span class="right_bottom1"></span><span class="right_bottom2"></span>'+
      '搜对象</div>'+

      '</div></div>'+
      '</div>'+
      '<div class="map_select_resultDiv">'+
      '<div class="mapselectTypeDiv">'+
      '<div id="mapEntityType" class="mapselectType">全部</div>'+
      '<div class="mapEntityTypeJX">|</div>'+
      '<div id="mapEventType" class="mapselectType">事件</div>'+
      '<div class="mapEntityTypeJX">|</div>'+
      '<div id="mapDocumentType" class="mapselectType">文档</div>'+
      '</div>'+
      '<div id="mapSelectResult">'+

      '</div>'+
      '<div id="mapSelectResultPage">'+

      '</div>'+
      '</div>'+
      '<div class="map_select_resultDivSmall">'+'显示详细0条信息!'+
      '</div>';
    document.getElementById(domid).appendChild(mapSet);// 添加DOM元素到地图中


  };
  //搜索框:事件
  searchModule.prototype.moduleEvent = function () {
    let _thatSM = this;
    let mapstyle = mapCommonPart.getCookie("theme");
    if(mapstyle === "white"){
      $(".map_select_btn").removeClass("map_select_btn_background").css("background","#fff").css("border","1px soloid #23b9e7");
    }

    var mapSelectValue = '';//左侧搜索内容

    $(".map_select_resultDivSmall").bind("mouseover",function(){
      $(".map_select_resultDiv").css("height","610px");
      $(".map_select_resultDivSmall").css("height","0px");
    });

    $("#map_select_input").bind("click",function(e){
      e.preventDefault();
      e.stopPropagation();
      $(".map_select_btn_div").css("width","210px");
      $(".map_select_btn").css("width","82px");
    }).keydown(function(event){
      if (event.keyCode == 13) {
        searchValue();
      }
    });// 搜索功能
    $("#selectObject").bind("click",function(){
      searchValue();
    });

    //鼠标进入左侧搜索框，地图禁止滚轮事件，出去，允许鼠标滚轮事件
    $(".map_select_resultDiv").bind("mouseover",function(){
      setmapProperty("null","zoom-false","null");
    }).bind("mouseout",function(){
      setmapProperty("null","zoom-true","null");
    });

    function searchValue(){
      mapAdvanceSearchFlag = "false";//普通搜索
      var value = $("#map_select_input").val();
      mapSelectValue = $("#map_select_input").val();
      if(mapCommonPart.mapTrim(value)){
        $("#mapSelectResultPage").css("display","block");
        _thatSM.searchModulePagination(mapCommonPart.mapTrim(value),"All");
        //下方div显示
        $(".map_select_resultDiv").css("height","610px");
        $(".map_select_resultDivSmall").css("height","0px");
      }else {
        $("#mapSelectResultPage").css("display","none");
        $("#mapSelectResult").html(" ");
        $(".map_select_resultDivSmall").html("没有搜索结果!");
        $(".map_select_resultDiv").css("height","0px");
        $(".map_select_resultDivSmall").css("height","40px");
      }
    }

    $("#mapEntityType").bind("click",function(){
      mapEntityTypeSearch("All");
    });
    $("#mapEventType").bind("click",function(){
      mapEntityTypeSearch("Event");
    });
    $("#mapDocumentType").bind("click",function(){
      mapEntityTypeSearch("Document");
    });
    function mapEntityTypeSearch(type) {
      switch (type){
        case "All":
          $("#mapEntityType").addClass("selectMapType").removeClass("noselectMapType");
          $("#mapEventType").addClass("noselectMapType").removeClass("selectMapType");
          $("#mapDocumentType").addClass("noselectMapType").removeClass("selectMapType");
          break;
        case "Event":
          $("#mapEntityType").addClass("noselectMapType").removeClass("selectMapType");
          $("#mapEventType").addClass("selectMapType").removeClass("noselectMapType");
          $("#mapDocumentType").addClass("noselectMapType").removeClass("selectMapType");
          break;
        case "Document":
          $("#mapEntityType").addClass("noselectMapType").removeClass("selectMapType");
          $("#mapEventType").addClass("noselectMapType").removeClass("selectMapType");
          $("#mapDocumentType").addClass("selectMapType").removeClass("noselectMapType");
          break;
      }

      var value = mapSelectValue;

      if(mapCommonPart.mapTrim(value)){
        $("#mapSelectResultPage").css("display","block");
        _thatSM.searchModulePagination(mapCommonPart.mapTrim(value),type);
        //下方div显示
        $(".map_select_resultDiv").css("height","610px");
        $(".map_select_resultDivSmall").css("height","0px");
      }else {
        $("#mapSelectResultPage").css("display","none");
        $("#mapSelectResult").html(" ");
        $(".map_select_resultDivSmall").html("没有搜索结果!");
      }
    }
  };
  //搜索框:分页
  searchModule.prototype.searchModulePagination = function (keyword,searchType) {//普通搜索 页数
    let _that = this;
    let mapSelectPageCur = 0;//左侧搜索当前页
    let datas = { "keyword": keyword, "type": searchType };
    gisAllDatas.getSearchModulePage(datas).then(function (returnData) {
      setSMPagination( returnData, searchType );
    }).catch(function () {
      $("#page_alert").show();
      $("#page_alert_content").html("没有数据!");
    });
    //设置分页
    function setSMPagination( data, type ) {
      let smallMsg = "";
      if (data > 0) {
        $("#mapSelectResultPage").css("display","block");
        smallMsg = "显示详细" + data + "条信息!";
        $(".map_select_resultDiv").css("height","610px");
        $(".map_select_resultDivSmall").css("height","0px");

        let totalpages = parseInt(data);
        if (totalpages !== 0) {
          $("#mapSelectResultPage").mappagination(totalpages, {
            callback : mapPageselectCallback,
            prev_text : '< 上一页',
            next_text: '下一页 >',
            num_display_entries : 5,
            current_page: mapSelectPageCur,
            num_edge_entries : 1
          });
        }
      } else {
        $("#mapSelectResultPage").css("display","none");
        if(type==="All"){
          $("#mapSelectResult").html(" ");
          $(".map_select_resultDiv").css("height","0px");
          $(".map_select_resultDivSmall").css("height","40px");
          smallMsg = "没有搜索结果!";
        }else{
          $("#mapSelectResult").html(" ");
          smallMsg = "没有搜索结果!";
        }

      }
      $(".map_select_resultDivSmall").html(smallMsg);
    }
    //分页回调
    function mapPageselectCallback(index){
      _that.searchData(keyword,searchType,index);
      $(".current").css("background","#299ABD").css("color","#fff");//判断是不是高级搜索 去掉了
    }
  };
  //搜索框:分页数据
  searchModule.prototype.searchData = function (value,searchType,index) {//分页回调 数据
    let _that = this;
    let mapSearchKeyWord = {"keyword": value, "type": searchType, "pageNo":index, "pageSize": 5};
    gisAllDatas.getSearchModuleData(mapSearchKeyWord).then(function (data) {
      let otherHTML = '';
      if (searchType === "All") {
        $("#mapEntityType").addClass("selectMapType").removeClass("noselectMapType");
        $("#mapEventType").addClass("noselectMapType").removeClass("selectMapType");
        $("#mapDocumentType").addClass("noselectMapType").removeClass("selectMapType");
      }else if (searchType === "Event") {
        $("#mapEntityType").addClass("noselectMapType").removeClass("selectMapType");
        $("#mapEventType").addClass("selectMapType").removeClass("noselectMapType");
        $("#mapDocumentType").addClass("noselectMapType").removeClass("selectMapType");
      }else if (searchType === "Document") {
        $("#mapEntityType").addClass("noselectMapType").removeClass("selectMapType");
        $("#mapEventType").addClass("noselectMapType").removeClass("selectMapType");
        $("#mapDocumentType").addClass("selectMapType").removeClass("noselectMapType");
      }
      if(!data){ return "" }
      let datas = data;
      let dataSource = [];
      if (datas.entity && datas.entity.length !== 0) { datas.entity.map( (item) => dataSource.push(item) ); }   //实体
      if (datas.event && datas.event.length !== 0)   { datas.event.map(  (item) => dataSource.push(item) ); }   //事件
      if (datas.document &&datas.document.length!==0){ datas.document.map( (item) => dataSource.push(item) ); } //文档
      if (datas.thing && datas.thing.length !== 0)   { datas.thing.map( (item) => dataSource.push(item) ); }    //物品
      if (datas.case && datas.case.length !== 0)     { datas.case.map( (item) => dataSource.push(item) ); }     //案件
      if (datas.place && datas.place.length !== 0)   { datas.place.map( (item) => dataSource.push(item) ); }    //地址
      if (datas.org && datas.org.length !== 0)       { datas.org.map( (item) => dataSource.push(item) ); }      //组织

      for (let i = 0; i < dataSource.length; i++) {
        let data_type = dataSource[i].objectType || '';
        let propty = dataSource[i].properties;
        otherHTML += '<div class="mapResultPanel" draggable="true" data-name="'+propty[0].value+'" data-pageType="'+dataSource[i].page_type+'" data-objectType="entity" data-id="'+ dataSource[i].id+'" data-nodeId="'+dataSource[i].nodeId+'" data-type="'+dataSource[i].objectType+'"><div class="mapResultPanelIn">' +
          '<div class="mapSelectResultImg">' +
          /*'<img src="'+ EPMUI.context.url + '/image/'+ dataSource[i].icon + '/entity" alt="头像"/>' +*/
          '<img src="?" onerror="window.MGC.proxyImage(this, \''+ dataSource[i].icon +'\', \''+ data_type.toLowerCase() +'\')" alt="头像"/>' +
          //
          '</div>' +
          '<div class="mapSelectResultOne">' +
          '<div class="mapSelectMsgDivTwo">';
        for (let j = 0; j < propty.length; j++) {
          let proptyValue = propty[j].value ? propty[j].value : ' ';
          otherHTML += '<div class="mapSelectMsgTwo"  title="' + proptyValue +
            '"><span>'+propty[j].displayName+':</span>' + proptyValue + '</div>';
        }
        otherHTML += '</div></div></div></div>';
      }

      $("#mapSelectResult").html(otherHTML);

      //每一条点击 样式变化，地图对应点选中
      $(".mapResultPanel").unbind("click").bind("click",function () {
        $(this).siblings().addClass("nomapResultPanelbackground").removeClass("mapResultPanelbackground");
        $(this).addClass("mapResultPanelbackground").removeClass("nomapResultPanelbackground");

        getBaseMessage(true,this.dataset.id, this.dataset.type, true);//基础信息展示
        //每一条点击 样式变化，地图对应点选中
        mapSearchResult(this.dataset.id);
      });

      _that.dragDomToMap(".mapResultPanel");//左侧搜索拖拽功能
    }).catch(function () {
      //代码出错，暂时不提示
    });
  };
  //搜索框:拖拽开始
  searchModule.prototype.dragDomToMap = function (className) {
    let _that = this;
    let targetMap;
    if(EPMUI.context.gis.type === "bmap"){
      targetMap = $('#basemap').get(0);
    }else if(EPMUI.context.gis.type === "arcgis"){
      targetMap = $('#basemap_root').get(0);
    }else if(EPMUI.context.gis.type === "supermap"){
      targetMap = $('#basemap').get(0);
    }else if(EPMUI.context.gis.type === "PGIS"){
      targetMap = $('#basemap').get(0);
    }
    targetMap.removeEventListener("drop", _that.dragDomToMapEnd, false);

    var dragNodes = document.querySelectorAll(className);
    var len = dragNodes.length;
    for (var i = 0; i < len; i++) {
      dragNodes[i].addEventListener('dragstart', function(e) {
        var dragObject = {
          name: this.dataset.name,
          type: this.dataset.type,
          objectType: this.dataset.objectType,
          id: this.dataset.id,
          nodeId: this.dataset.nodeId,
          dragFlag: true
        };
        e.dataTransfer.setData('maptext', JSON.stringify(dragObject));
      });
    }
    targetMap.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    });
    targetMap.addEventListener('drop', _that.dragDomToMapEnd, false);
  };
  //搜索框:拖拽结束
  searchModule.prototype.dragDomToMapEnd = function (e) {
    e.preventDefault();
    if (!e.dataTransfer.getData('maptext').match("dragFlag")) { return false; }
    let dropObj = JSON.parse(e.dataTransfer.getData('maptext'));
    let topoObj = {};
    gisAllDatas.getSearchModuleDragData(dropObj).then(function (dataSearch) {
      topoObj = {
        id: dataSearch.id,
        fixed: true,
        selected: "#ffd862",
        display: "block",
        nodeId: dataSearch.nodeId,
        nodeWeight:parseInt(dataSearch.nodeWeight) ? (parseInt(dataSearch.nodeWeight) > 10) ? 10 : parseInt(dataSearch.nodeWeight) < 0 ? 0 : parseInt(dataSearch.nodeWeight) : 0,
        name: dataSearch.target,
        objectType: dataSearch.objectType,
        page_type: dataSearch.page_type,
        markIcons: dataSearch.markIcons,
        type: dataSearch.type,
        fill: dataSearch.mark ? "#fc311a" : "#0088b1",
        stroke: dataSearch.mark ? "#ffbcaf" : "#33d0ff",
        x: e.x,
        y: e.y
      };
      let selectGisById = [topoObj.id];
      let selectGisByType = [topoObj.type];

      let param = { id: selectGisById, type: selectGisByType };
      return gisAllDatas.getObjectGis(param);
    }).then(function (data) {
      //根据返回的data-gis信息，拼接nodes数据
      let gisData = data.magicube_interface_data;
      let gisNodesData;
      if (gisData.length > 0) {
        gisNodesData = {
          id: topoObj.id,
          type: topoObj.type,
          objectType: topoObj.objectType,
          page_type: topoObj.page_type,
          name: topoObj.name,
          nodeId: topoObj.nodeId,
          gis: {
            lon: gisData[0].lon,
            lat: gisData[0].lat
          }
        };
      }else { //random 在这造假数据
        if (topoObj.name === "田雪") {
          gisNodesData = {
            id: topoObj.id,
            type: topoObj.type,
            objectType: topoObj.objectType,
            page_type: topoObj.page_type,
            name: topoObj.name,
            nodeId: topoObj.nodeId,
            addnode: true,
            gis: {
              lon: 126.773877,
              lat: 45.719088
            }
          };
        }
      }
      USEMAP.addOnePoint(gisNodesData);
    })

  };

  //数据函数
  window.gisAllDatas = new gisAllData();

  //搜索框
  window.sModule = new searchModule();
  sModule.addModule("topology_map");
  sModule.moduleEvent();
  //操作菜单
  window.resetMenuMap = new mapWorkMenus();
  var getMoreMenus = resetMenuMap.getMoreMenus();


  // ------------- 时间轴 --------------
  let magicGraph = {
    axisWidth: $("#topology_timeline_axis").width(),
    axisHeight: $("#topology_timeline_axis").height(),
    svg: d3.select("g.main"),
    pathUpdate: d3.select("g.main").append("svg:g").selectAll(".outlink"),
    enterNodes: d3.select("g.main").append("svg:g").selectAll("g"),
    topoTimeLineSvg: d3.select(".topo_timeline_svg")
  };
  //数组对象由大到小排序
  function compare(prop) {
    return function (a, b) {
      const prop1 = a[prop];
      const prop2 = b[prop];
      return prop1 > prop2 ? 1 : -1;
    }
  }
  const linkColorArray = d3.scale.category20();
  class MagicTopoTimeLine{
    constructor(){
      //功能：关系信息对应的时间轴数据，生成对应的时间轴坐标和条形图
        this.stack = d3.layout.stack()
          .x(d => d.time)
          .y(d => d.y),
        this.nest = d3.nest()
          .key(d => d.relationName),
        this.groups = d3.select(".topo_timeline_svg").append('g').selectAll(".rgroups"),
        this.rects = d3.select(".topo_timeline_svg").selectAll(".rgroups").selectAll(".item"),
        this.padding = {
          'left': 30,
          'right': 30,
          'top': 30,
          'bottom': 20
        },
        this.xRangeWidth = magicGraph.axisWidth - 40,
        this.yRangeWidth = magicGraph.axisHeight - this.padding.top - 15,
        this.xScale = function(xScaledata) {
          const xScale = d3.time.scale()
            .domain([d3.time.month.offset(new Date(xScaledata[0][0].time), -1), d3.time.month.offset(new Date(xScaledata[0][xScaledata[0].length - 1].time),1)])
            .rangeRound([0, this.xRangeWidth]);
          return xScale;
        },
        this.yScale = function(yScaledata) {
          const yScale = d3.scale.linear()
            .domain([0,
              d3.max(yScaledata, function(d) {
                return d3.max(d, function(d) {
                  return d.y0 + d.y;
                });
              })
            ])
            .range([0, this.yRangeWidth]);
          return yScale;
        },
        //功能：对时间数组进行补全，因为stack图的数据要求必须为对齐的数据格式
        this.assignDefaultValues = function(dataset, relationName) {
          dataset.forEach(data => data.y = parseInt(data.y));
          let defaultValue = 0;
          let hadData = [true, true, true];
          let newData = [];
          let previousdate = new Date();
          dataset.forEach(function(row) {
            if (row.time.valueOf() !== previousdate.valueOf()) {
              for (var i = 0, leng = relationName.length; i < leng; ++i) {
                if (hadData[i] === false) {
                  newData.push({
                    relationName: relationName[i],
                    y: defaultValue,
                    time: previousdate
                  });
                }
                hadData[i] = false;
              }
              previousdate = row.time;
            }
            hadData[relationName.indexOf(row.relationName)] = true;
          });
          for (var i = 0, len = relationName.length; i < len; ++i) {
            if (hadData[i] === false) {
              newData.push({
                relationName: relationName[i],
                y: defaultValue,
                time: previousdate
              });
            }
          }
          return dataset.concat(newData).sort(compare("time"));
        },
        //点击时间轴右边的列表，调用此函数更刷新时间轴
        this.UpdateAxis = function(indexArray, times) {
          let jsonStackTimes = JSON.parse(times);
          let endTime = []; //保存时间数组中对应的子集
          //用户单一选择时间显示
          if (indexArray !== 0) {
            indexArray.forEach((d) => {
              endTime.push(jsonStackTimes[d - 1]);
            });
            let stack = this.stack(endTime);
            this.creatGroup(stack); //重启绘制时间轴
            d3.selectAll("g.rgroups")
              .style("fill", d => linkColorArray(d[0].relationName));
          } else { //index为0，表示用户点击了所有关系列表
            let stack = this.stack(jsonStackTimes);
            this.creatGroup(stack);
            d3.selectAll("g.rgroups")
              .style("fill", d => linkColorArray(d[0].relationName));
          }
        },
        //时间轴右边的列表，更新列表和点击列表操作
        this.getAxis = function(data, name) {
          const self = this;
          let stringTimes = JSON.stringify(data);
          let content = '';
          d3.select("g.brush").remove();//需要每次都把上一次的清除，否则数据不对应
          if (name.length > 1) {
            //时间轴右边的列表生成
            for (var i = 0; i < name.length; i++) {
              let $html = name[i];
              let color = i === 0 ? "null" : linkColorArray(name[i]);
              let selected = "'radioTime icon-check-square-o'";
              content += `<div class=axisList style=color:${color}><div class=${selected}></div>${$html}</div>`;
            }
          }
          $("#event_list_child").mCustomScrollbar("destroy");
          $("#event_list_child").html(content);
          $("#event_list_child").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
          });
          let jsonStackTimes = JSON.parse(stringTimes);
          let stack = this.stack(jsonStackTimes);
          this.creatGroup(stack);
          d3.selectAll("g.rgroups")
            .style("fill", d => linkColorArray(d[0].relationName));
          //点击改变坐标轴
          $("div.axisList").off("click");
          $("div.axisList").on("click", function(e) {
            e.stopPropagation();
            let indexArray = [];
            //隐藏此项关系时间
            if ($(this).find("div").hasClass('icon-check-square-o')) {
              if ($(this).index() === 0) {
                $(this).find("div").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
                $(this).siblings().find("div").removeClass('icon-check-square-o').addClass('icon-square-o-blue');
              } else {
                $(this).find("div").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
                $("div.axisList").eq(0).find("div").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
              }
              //显示此项关系时间
            } else {
              if ($(this).index() === 0) {
                $(this).find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
                $(this).siblings().find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
              } else {
                $(this).find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
                if ($("div.axisList").find('.icon-check-square-o').length == $("p.axisList").length - 1) {
                  $("div.axisList").eq(0).find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
                }
              }
            }
            //得到列表的索引，用来得到对应的时间
            $("div.axisList").each((d,i) => {
              if ($(i).find('div').hasClass('icon-check-square-o')){
                indexArray.push($(i).index());
              }
            })
            //全选中显示全部时间
            if (indexArray.length == $("div.axisList").length) {
              self.UpdateAxis(0, stringTimes);
              //全没选中
            } else if (!indexArray.length){
              const emptyTime = [[{
                y:'',
                time: ''
              }]];
              const stringTime = JSON.stringify(emptyTime);
              self.UpdateAxis(0, stringTime);
              //逐一选中
            } else {
              self.UpdateAxis(indexArray, stringTimes);
            }
          })
            .on("mouseover", function(e) {
              e.stopPropagation();
              let $width = $(this).find("label").width();
              if ($width > 90) {
                let interpolation = ($width - 80) + 115;
                $("#topology_timeline_axis").stop(true).animate({
                  left:interpolation
                })
              }
            })
            .on("mouseout", function(e) {
              e.stopPropagation();
              $("#topology_timeline_axis").stop(true).animate({
                left : '140px'
              })
            });
        },
        //每次更新时间轴
        this.creatGroup = function(dataStack) {
          const islegend = magicGraph.topoTimeLineSvg.selectAll("g.legend"); //年份提示文字信息
          const legendExits = islegend.empty();
          //格式化本地时间
          const defined = {
            "decimal": ".",
            "thousands": ",",
            "grouping": [3],
            "currency": ["$", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%m/%d/%Y",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "shortMonths": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
          };
          let myMonth = d3.locale(defined);
          d3.time.format = myMonth.timeFormat; //将时间转化为中文
          let xScale = this.xScale(dataStack);
          let yScale = this.yScale(dataStack);
          //添加分组元素
          this.groups = this.groups.data(dataStack);
          this.groups.enter()
            .append("g")
            .attr("class", "rgroups")
            .attr("transform", "translate(40,15)");
          //.style("fill",d => linkColorArray(d[0].relationName));
          this.rects = this.groups.selectAll(".item")
            .data(d => d);
          this.rects.enter()
            .append("rect")
            .attr("class", "item")
            .attr("width", 5)
            .style("fill-opacity", 1);
          //添加矩形
          this.rects.transition()
            .duration(450)
            .attr("x", function(d) {
              if (typeof d.time === 'string' && d.time !== '') {
                var time = new Date(d.time);
                return xScale(time);
              } else {
                return 0;
              };
            })
            .attr("y", d => this.yRangeWidth - 20 - yScale(d.y0 + d.y))
            .attr("width", 5)
            .attr("height", d => yScale(d.y))
            .attr("transform", "translate(" + (this.padding.left - 30) + "," + (this.padding.top - 5) + ")")
            .style("fill-opacity", 1);
          //添加坐标轴
          const xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(d3.time.month, 3)
            .tickFormat(d3.time.format("%Y/%b"));
          yScale.range([this.yRangeWidth, 0]);
          const yAxis = d3.svg.axis()
            .scale(yScale)
            .ticks(2)
            .orient("left");
          this.rects.exit().remove();
          this.groups.exit().remove();
          //绑定时间轴坐标数据
          magicGraph.topoTimeLineSvg.select("#xtime_axis")
            .transition()
            .duration(450)
            .call(xAxis);
          magicGraph.topoTimeLineSvg.select("#ytime_axis")
            .transition()
            .duration(450)
            .call(yAxis);
          let dateWord = function() {
            if (dataStack[0][0].time && dataStack[0][dataStack[0].length - 1].time) {
              var sData = new Date(dataStack[0][0].time);
              var eData = new Date(dataStack[0][dataStack[0].length - 1].time);
              return sData.getFullYear() + "年" + "-" + (sData.getMonth() + 1) + "月" + "~" + eData.getFullYear() + "年" + "-" + (eData.getMonth() + 1) + "月";
            } else {
              return '';
            }
          };
          //已经存在则不再生产文字信息
          if (legendExits) {
            let legend = magicGraph.topoTimeLineSvg.append("g") //年份提示文字信息
              .attr("class", "legend")
              .append("text")
              .attr("class", "legendTitle")
              .attr("x", magicGraph.axisWidth - 160)
              .attr("y", 15);
          }
          d3.selectAll("g.legend").select("text").text(dateWord());
          this.brushAxis(xScale);
        },
        //功能：时间轴的筛选函数，生成矩形选择时间轴的坐标
        this.brushAxis = function(_xScale) {
          //刷子（拖选框）生成
          const self = this;
          const brushed = d3.selectAll("g.brush");
          const isBrushed = brushed.empty();
          let data = d3.svg.symbolTypes;
          const x = d3.scale.ordinal()
            .domain(data)
            .rangePoints([0, magicGraph.axisWidth - 50], 1);
          if (isBrushed) {
            const time_axis = magicGraph.topoTimeLineSvg.append("g")
              .attr("class", "brush")
              .attr("transform", "translate(32,20)")
              .call(d3.svg.brush().x(x)
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend)
              )
              .selectAll("rect")
              .attr("height", magicGraph.axisHeight - 45);
            d3.select(".brush").selectAll(".resize")
              .selectAll("rect")
              .attr("width", "1px")
              .style("visibility", "visible");
          }
          //开始拖动
          function brushstart() {
            magicGraph.topoTimeLineSvg.classed("selecting", true);
          }
          //选中的时候让对应的元素选中
          function brushmove() {}
          //不拖选的时候恢复
          function brushend() {
            let s = d3.event.target.extent();
            let s1 = s[0] - 20;
            let s2 = s[1] - 20;
            let gisTime = [];
            magicGraph.svg.selectAll("g.node").style("opacity", 0.1);
            magicGraph.svg.selectAll("path.link,.outword,.outwieght").style("opacity", 0);
            self.rects.classed("time_selected", false);
            magicGraph.enterNodes.classed("selected",(d,i)=>{
              d.selected = false;
              return false;
            })
              .selectAll(".outring")
              .style("stroke", function() {
                return d3.select(this).style("fill") !== "rgb(252, 49, 26)" ? "#33d0ff" : "#ffbcaf"
              });
            //选择对应时间的节点
            self.rects.filter(d => s1 <= (d = _xScale(new Date(d.time))) && d <= s2)
              .filter(d => d.y)
              .classed("time_selected", true)
              .each(function(dLinks) {
                gisTime.push(dLinks.time);
              });

            gisTime = [...new Set(gisTime)];

            magicGraph.topoTimeLineSvg.classed("selecting", !d3.event.target.empty());
            const width = d3.select(".extent").attr("width");
            if (width < 20) {
              magicGraph.svg.selectAll("g.node,path.link,text.outword,.outwieght").style("opacity", 1);
            }


            gisTimeLine(gisTime);

          }
        },
        //处理请求到的杂乱的时间轴数据，使其可以用来绘制时间轴
        this.disposeTimeData = function(timeData) {
          let assignName = ["所有关系"];
          let alltimeArray = [];
          let assignData = null;
          let dataset = null;
          timeData.sort(compare("relationName"));
          for (let i = 0; i < timeData.length; i++) {
            assignName.push(timeData[i].relationName);
          }
          assignName = [...new Set(assignName)];
          //动态改变时间轴右边列表内容,allrelationName按照此数据对齐
          assignData = this.assignDefaultValues(timeData, assignName);
          //会把assignData按照allrelationName进行一个个的分组，成为数组对象
          dataset = this.nest.entries(assignData);
          //过滤掉其中的“所有关系”数据
          for (let i = 0; i < dataset.length; i++) {
            if (dataset[i].key !== "所有关系") {
              alltimeArray.push(dataset[i].values);
            }
          }
          //需要重置allrelationName，使allrelationName的元素和alltimeArray的元素对应
          let relationName = ["所有关系"];
          for (let i = 0; i < alltimeArray.length; i++) {
            if (alltimeArray[i][0].relationName) {
              relationName.push(alltimeArray[i][0].relationName);
            }
          }
          this.getAxis(alltimeArray, relationName);
          magicGraph.svg.selectAll("g.node,path.link,text.outword,.outwieght").style("opacity", 1);
        }
    }
    // 进页面生成时间轴，清屏调用
    resetAxis(){
      $("#event_list_child").mCustomScrollbar("destroy");
      $("#event_list_child").html('');
      var axis = d3.selectAll("g.time_axis");
      var isAxis = axis.empty();
      var objs = [[
        {
          "y": '',
          "time": ''
        }
      ]];
      //堆叠布局
      var dStack = this.stack(objs);
      //添加坐标轴
      if (isAxis) {
        var xAxis = d3.svg.axis()
          .scale(this.xScale(dStack))
          .orient("bottom")
          .tickFormat(d3.time.format("%b"));
        var yAxis = d3.svg.axis()
          .scale(this.yScale(dStack))
          .orient("left");
      }
      magicGraph.topoTimeLineSvg.append("g")
        .attr("class", "time_axis")
        .attr("id", "xtime_axis")
        .attr("transform", "translate(" + this.padding.left + "," + (magicGraph.axisHeight - this.padding.bottom - 5) + ")")
        .call(xAxis);
      magicGraph.topoTimeLineSvg.append("g")
        .attr("class", "time_axis")
        .attr("id", "ytime_axis")
        .attr("transform", "translate(" + this.padding.left + "," + (magicGraph.axisHeight - this.padding.bottom - this.yRangeWidth - 5) + ")")
        .call(yAxis);
    }
  }

  //加载对应地图
  operationGis();
})