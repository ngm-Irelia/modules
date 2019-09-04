$(function(){
  var searchAddNode = [], nodeId = '';
  //var entityNode = null;

  setLoad();

  function setLoad(){
    let reloadSign = localStorage.getItem("reloadSign");
    if(!reloadSign){
      setTimeout(function () {
        localStorage.setItem("reloadSign",true);
        window.location.reload();
      },1000);

    }
  }

  initEntityMes();

  // 初始化数据
  function initEntityMes(){
    // 获取实体全部数据
    $.get(EPMUI.context.url + '/object/detailInformation/' + Magicube.idNumber, function(data){
      let datas = JSON.parse(data);
      var propertyData = datas.magicube_interface_data.property.all || [];
      var detailName = datas.magicube_interface_data.property.basic[0].value || '';
      var objectId = datas.magicube_interface_data.objectId || '';
          nodeId = datas.magicube_interface_data.nodeId || '';
      var objectType = datas.magicube_interface_data.objectType || '';
      let type = datas.magicube_interface_data.type || '';
      let pageType = datas.magicube_interface_data.pageType || '';
      var icons = datas.magicube_interface_data.icon;
      var objectIcon = '/image/' + icons;
      const width = $(".topo").width();
      const height = $(".topo").height();
      let rootNode = {
          display:'block',
          id:objectId,
          fill:"#0088b1",
          nodeId:nodeId,
          name:detailName,
          nodeWeight:0,
          markIcons:[],//小手铐
          nodeType:0,
          fixed:true,
          quantity:0,
          type:type,
          objectType:objectType,
          relationTypeName:'default',
          page_type:pageType,
          stroke:'#33d0ff',
          px:width / 2,
          py:height / 2 - 20
      };
      startFunction(rootNode,".topo");
      getMes( propertyData, objectIcon, objectType );  //动态创建基本信息
      entityGoTopology();   //跳转到topology页面
      
      // 右侧事件分类tab切换
      if(datas.magicube_interface_data.relationclass){
        initTab(datas.magicube_interface_data.relationclass);  //tab切换信息展示
      }
    });
  }

  // 跳转topology页面
  function entityGoTopology() {
    // 跳转到工作台
    $("#entity_topo").on( 'click', function(){
      localStorage.setItem("topologyType", "topo");
      goTopoAddNode(Magicube.id,Magicube.type);
    } );

    // 跳转到地图
    $("#entity_map").on( 'click', function(){
        localStorage.setItem("topologyType", "gis");
        goMapAddNode(Magicube.id,Magicube.type);
    });
  }

  // 详情页跳转向本地缓存加点
  window.goTopoAddNode = function(id,type){
      $.get( EPMUI.context.url + "/object/"+"partInformation/" + id + "/" + type, function(searchNodes){
        var parseSearchNodes = $.parseJSON(searchNodes);
        var node = jQuery.creatTopologyNode(parseSearchNodes);
        node.selected = true;//为true到工作台自动打开菜单
        //缓存一个当前跳转的节点的nodeid，供控制台打开菜单使用，如果没有则不生效
        localStorage.setItem( "open", JSON.stringify(node.nodeId) );
        localStorage.setItem( "searchAddNode", JSON.stringify(Array.of(node)) );
        location.href = '/topology';
      } );
    // }
  }

  // 详情页跳转向本地缓存加点
  window.goMapAddNode = function(id,type){
      $.get( EPMUI.context.url + "/object/"+"partInformation/" + id + "/" + type, function(searchNodes){
          var parseSearchNodes = $.parseJSON(searchNodes);
          var node = jQuery.creatTopologyNode(parseSearchNodes);
          node.selected = true;//为true到工作台自动打开菜单
          //缓存一个当前跳转的节点的nodeid，供控制台打开菜单使用，如果没有则不生效
          localStorage.setItem( "open", JSON.stringify(node.nodeId) );
          localStorage.setItem( "searchAddNode", JSON.stringify(Array.of(node)) );
          location.href = '/gisPlatform';
      } );
      // }
  }
	// 获取对象信息 显示tab
  function getMes(data, objectIcon, objectType) {

    // 数据分类
    let commonData = [], tableData = [];　　　　
    //设置头像
    $("#entity-info .entity-title img").after('<img src="'+ EPMUI.context.url + objectIcon + objectType +'" '
    + ' alt="头像"/>');

    // 显示信息tab标签
    for( var commonStr = '', tableStr = '', i = 0; i < data.length; i ++ ) {
      // tab第一个加默认样式
      if(i === 0){
        // 判断tab内容是否是表格
        if(data[i].displayType === 'common'){
          commonData.push(data[i]);
          commonStr += '<p class="tab-active" data-display="' + data[i].displayType + '" >' + data[ i ].display + '</p>'
        }else if(data[i].displayType === 'table'){
          tableData.push(data[i]);
          tableStr += '<p data-display="' + data[i].displayType + '" data-tableName="' + data[i].displayColumn.value + '" >' + data[i].display + '(' + data[i].size + ')' + '</p>'
        }
      }else{
        // 判断tab内容是否是表格
        if(data[i].displayType === 'common'){
          commonData.push(data[i]);
          commonStr +='<p data-display="' + data[i].displayType + '" >' + data[ i ].display + '</p>';
        }else if(data[i].displayType === 'table'){
          tableData.push(data[i]);
          tableStr += '<p data-display="' + data[i].displayType + '" data-tableName="' + data[i].displayColumn.value + '" >' + data[i].display + '(' + data[i].size + ')' + '</p>';
        }
      }
    }
    $("#entity-info>.entity-content>.title-tabs").html(commonStr);
    $("#entity-info>.entity-relateTable>.title-tabs").html(tableStr);

    // tab标签绑定点击事件
    $("#entity-info>.entity-content>.title-tabs>p").click(function(){
      // 更换tab样式
      $(this).addClass("tab-active").siblings().removeClass("tab-active");
      let index = $(this).index();
      // 调取tab内容展示
      if(commonData[index].value.length>0){
        mesTab(commonData[index].value, $(this).attr("data-display"), $(this).attr("data-tableName"));
      }else{
        let str = '<div class="no-data"><span class="icon-notfind"></span><p>对不起，暂无数据。</p></div>';
        $("#entity-info>.entity-content>.tab-content>table>tbody").html(str);
      }
    });
    $("#entity-info>.entity-relateTable>.title-tabs>p").click(function(){
      // 更换tab样式
      $(this).addClass("tab-active").siblings().removeClass("tab-active");
      let index = $(this).index();
      // 调取tab内容展示
      if(tableData[index].value.length > 0){
        mesTab(tableData[index].value, $(this).attr("data-display"), $(this).attr("data-tableName"));
      }else{
        let str = '<div class="no-data"><span class="icon-notfind"></span><p>对不起，暂无数据。</p></div>';
        $("#entity-info>.entity-relateTable>.tab-content>table>tbody").html(str);
      }
    });

    // 手动触发初始化对象信息tab展示
    $("#entity-info>.entity-content>.title-tabs>p:eq(0)").click();
    $("#entity-info>.entity-relateTable>.title-tabs>p:eq(0)").click();
  }

  function mesTab(data, type, tableName){
    // 显示tab内容切换
    let commonStr = '', tableStr = '';
    // 判断tab内容是否为空
    if(data.length > 0){
      // 判断展示内容是否为表格
      if(type === 'common'){
        for(let i=0, max=data.length; i<max; i++){
          if(JSON.stringify(data[i]) !== '{}'){
            let value = '';
            if(data[i].value){
              // 判断value是否为数组
              if(typeof data[i].value === 'object'){
                if(data[i].value.length === 0){
                  value =  '';
                }else{
                  // 如果值为多个保留，并用“，”隔开
                  for(let j=0, max=data[i].value.length; j<max; j++){
                    data[i].value[j] = data[i].value[j]? data[i].value[j] : '';
                    value += data[i].value[j] + '，';
                  }
                  value = value.substring(0,value.length - 1);
                }
              }else if(typeof data[i].value === 'string'){
                value = data[i].value;
              }
            }else{
              value = '';
            }
            commonStr += `<tr><td>` + data[i].display + `</td><td>` + value + `</td></tr>`; 
          }
          $("#entity-info>.entity-content>.tab-content>table>tbody").html(commonStr);
        }
      }else if(type === 'table'){
        for(let i=0, max=data.length; i<max; i++){
          if(JSON.stringify(data[i]) !== '{}'){
            tableStr += `<tr><td class="link">` + data[i][tableName] + '(' + data[i].value.length + ')' + `</td></tr>`;
          }
        }
        $("#entity-info>.entity-relateTable>.tab-content>table>tbody").html(tableStr);
        // 表头绑定点击事件
        $(".entity-relateTable>.tab-content>.table-max>tbody>tr").click(data, function(){
          $("#entity-alert>.alert-content").html('');
          let message = data[$(this).index()].value;
          // 渲染弹框内表格数据
          for(let i=0; i<message.length; i++){
              if(typeof message[i] === 'string'){
                message[i] = JSON.parse(message[i]);
              }
              if(i === 0){
                $("#entity-alert>.alert-content").append($(`<li class="tableStyle table-show"><p>` + data[$(this).index()].desc + (i+1) + `<span class="icon-angle-up"></span></p></li>`));
              }else{
                $("#entity-alert>.alert-content").append($(`<li class="tableStyle"><p>` + data[$(this).index()].desc + (i+1) + `<span class="icon-chevron-down-blue"></span></p></li>`));
              }
              let str = '';
              for(let j in message[i]){
                if(j !== 'tableName'){
                  str += `<tr><td>` + j + `</td><td>` + message[i][j] + `</td></tr>`;
                }
              }
              $(`<table>
                  <tbody>`
                    + str +
                  `</tbody>
                </table>`).appendTo($("#entity-alert>.alert-content>.tableStyle:eq(" + i + ")"));
          }
          
          // 遮罩弹框显示、弹框显示
          $("#entity-shade").show();
          $("#entity-alert").show().find(".cancel").click(function(){
            $("#entity-shade").hide();
            $("#entity-alert").hide();
          });
          $(".tableStyle").click(function(){
            if($(this).hasClass("table-show")){
              $(this).removeClass("table-show").find('span').removeClass("icon-angle-up").addClass("icon-chevron-down-blue");
              $(this).find('tableStyle').css('display', 'none');
            }else{
              $(this).addClass("table-show").find('span').addClass("icon-angle-up").removeClass("icon-chevron-down-blue");
              $(this).find('tableStyle').css('display', 'inline-table');
            }
          });
        });
      }
    }else{
      let str = '<div class="no-data"><span class="icon-notfind"></span><p>对不起，暂无数据。</p></div>';
      $("#entity-info>.entity-content>.tab-content>table>tbody").html(str);
      $("#entity-info>.entity-relateTable>.tab-content>table>tbody").html(str);
    }
  }

  // 初始化右侧tab标签
  function initTab(data){
    //  渲染tab标签
    for(var i=0, max=data.length, tabs=''; i<max; i++){
      // 截取事件分类名称 去掉【】
      if(data[i].display.indexOf("【") > 0){
        data[i].display = data[i].display.slice(0,data[i].display.indexOf("【"));
      }
      tabs += `<p data-system="` + data[i].system + `">` + data[i].display + '(' + data[i].size + ')' + `</p>`;
    }
    $(".entity-relateInfo>.tabs").html(tabs);

    // 手动触发初始化tab内容显示
    changeTab(0, $(".entity-relateInfo>.tabs>p:eq(0)").attr("data-system"));

    // tab标签绑定点击事件
    $(".entity-relateInfo>.tabs>p").click(function(){
      changeTab($(this).index(), $(this).attr("data-system"));
    });
    
  }
  // 右侧tab切换信息内容
  function changeTab(index, system){
    var content='';
    $.get( EPMUI.context.url + "/nest/record?relationType=" + system + '&nodeId=' + nodeId, function(data){
      data = JSON.parse(data);
      // 渲染事件内容
      initEventTrend(data.magicube_interface_data);
      initEventTrendFilter(data.magicube_interface_data);
    } );
   
    // tab标签点击切换样式
    $(".entity-relateInfo>.tabs>p:eq("+ index +")").addClass("tab-choose").siblings().removeClass("tab-choose");

    // goRelatePage();
  }

   //渲染事件内容
  function initEventTrend(eventTrend) {
    eventTrend = eventTrend? eventTrend : [];
    if (eventTrend.length === 0) {
      $('#entity-relate>.entity-relateInfo>.tab-content>.container-scroller>.container').html('<span class="icon-notfind"></span><p>对不起，暂无数据。</p>');
      return;
    }
    var box = '';
    for (var i = 0; i < eventTrend.length; i++) {
      // 初始化起始年份
      let content = '';
      let data = eventTrend[i].value;
      for(let j=0, max=data.length; j<max; j++){
        data[j].value = data[j].value? data[j].value : '';
        content += '<p>' + data[j].display + '： ' + data[j].value +'</p>';
      }
      
      // 初始化时间趋势数据
      box += '<div class="trend_mes_box">'
      
            + '<div class="trend_mes_title">'
            +  '<p class="mes_time">' + eventTrend[i].time.substr(0, 10) + '</p>'
              + '<p class="bgline"></p>'
              + '<span class="icon-event_node"></span>'
              + '<span class="icon-hollow-circle"></span>'
            + '</div>'
            + '<div class="trend_mes_content">'
              + '<div class="trend_mes_content_box">'
                  + content
              + '</div>'
            + '</div>'
          + '</div>';
    }
    $('#entity-relate>.entity-relateInfo>.tab-content>.container-scroller>.container').html(box);
  }

  // 渲染筛选年份
  function initEventTrendFilter(data){
    $("#time-filter").css("display", "none");
    if(data){
      if(data.length > 1){
        $("#time-filter").css("display", "flex");
        let start = Number(data[0].time.substring(0, 4));
        let end = Number(data[data.length - 1].time.substring(0, 4));
        $("#time-filter>.filter-content>.time-choose").html("全部");
        $("#time-filter>.filter-content>.time-list").hide();
        getTimeRange(start, end, ['全部', start], data);
        $("#time-filter").css("display", "flex");
      }
    }
  }

  // 递归时间范围
  function getTimeRange(start, end, arr, dataSource){
    if(start !== end){
      start --;
      arr.push(start);
      getTimeRange(start, end, arr, dataSource);
    }else{
      drawTimeLine(arr, dataSource);
      return ;
    }
  }

  // 渲染时间线数据
  function drawTimeLine(timeRange, data){
    let str = '';
    timeRange.map(function(item){
      str += `<li>` + item + `</li>`;
    });
    $("#time-filter>.filter-content>.time-list").html(str);
    $("#time-filter>.filter-content>.time-choose").click(function(){
      $("#time-filter>.filter-content>.time-list").show();
      $("#time-filter>.filter-content>.time-list>li").click(function(){
        $("#time-filter>.filter-content>.time-choose").html($(this).html());
        $(this).parent().hide();
        // 手动过滤相应年份数据
        if($(this).html() === '全部'){
          initEventTrend(data);
          return ;
        }else{
          let time = Number($(this).html());
          filterData(data, time);
        }
      });
    });
  }

  // 手动过滤相应年份数据
  function filterData(data, time){
    let dataSource = [];
    for(let i=0, max=data.length; i<max; i++){
      let timeData = Number(data[i].time.substring(0, 4));
      if(timeData === time){
        dataSource.push(data[i]);
      }
    }
    initEventTrend(dataSource);
  }

//   // 授权判断
//   function authJudgment( result ) {
//     if ( result.code && result.code === 407 ) {
//       $("#searchList_main_box").html('');
//       $("#searchlist_pagination_box").hide();
//       showAlert( "提示", result.message, "entity_pagealert_notice_color_license" );
//       return false;
//     }
//     return true;
//   }

  // 事件点击跳转详情
  // function goRelatePage() {
  //   $(".entity_go_detail").on( 'click', function() {
  //     location.href = '/' + $( this ).attr( "data-pagetype" ) + '?id=' + $( this ).attr( "data-id" ) + '&type=' + $( this ).attr( "data-type" );
  //   } )
  // }
  
  var tipText = ['GIS','关系拓扑'];
  //图标tooltip
  !function BtnTip () {
    $('#entity_map, #entity_topo').mouseover(function(){
      var tipIndex = $(this).index();
      var tipRight;
      tipIndex == 0 ? tipRight='20px' : tipRight='-40px'
      $(this).parent().append('<div class="tipStyle"></div>');
      $('.tipStyle').text(tipText[tipIndex]).css('right',tipRight);
    });
    $('#entity_map, #entity_topo').mouseout(function(){
      $('.tipStyle').remove();
    });
  }();

});