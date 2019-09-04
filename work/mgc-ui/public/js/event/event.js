$(function() {
  var editable = false;
      //detailData;
  var temp = null;

  initEventMes();

  //初始化页面
  function initEventMes(){
    //获取所有事件的数据
    $.get(EPMUI.context.url + '/object/detailInformation/' + Magicube.id + '/' + Magicube.type, function(data){
      let datas = JSON.parse(data),
          detailData = datas.magicube_interface_data,
          basicArr = detailData.property.basic || [],
          eventTrend = detailData.record || [],
          // eventTrend = [
          //                [{"display":"入住时间","value":"2013-11-22 13:51:53"},
          //                {"display":"房间号","value":"101"},
          //                {"display":"退房时间","value":null},
          //                {"display":"企业名称","value":"祥达宾馆祥达宾馆祥达宾馆祥达宾馆祥达宾馆祥达宾馆祥达宾馆祥达宾馆祥达宾馆祥达宾馆"},
          //                {"display":"企业编码","value":"6401040890"}]]
          relateData = detailData.related || {};
      getBasicMes(basicArr);  //设置事件的基本信息
      getRelateMes(relateData);   //设置相关信息
      temp = setRelateTopo(detailData);  //设置topo图
      initEventTrend(eventTrend); //设置事件趋势
    });
  }

	//获取基本信息
  function getBasicMes(data) {
    var content = '',
        detailName = data[0].value;
    //遍历数据拼接字符串
    for( var i = 0; i < data.length; i ++ ){
      data[i].value = data[i].value ? data[i].value : '暂无数据';
      content += '<p>'
              +  '<span class="event_basic_title">' + data[i].display + '：</span>'
              +  '<span class="event_base_message" data-type="' + data[i].system + '">' + data[i].value + '</span>'
              +  '</p>';
    }
    let $eventMesBox = $("#event_message_box");
    $eventMesBox.mCustomScrollbar("destroy");
    $eventMesBox.html(content);
    $eventMesBox.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
    //如果宽度大于370，让其宽度为100%
    $(".event_base_message").each( function( index, item ){
      if( $(item).width() > 370 ){
        $(item).parent().addClass('event_a_base_message_width');
      }
    } );
    editContent();
  }

  //获取相关信息
  function getRelateMes(related) {
    //建立key和页面tab之间的对应关系
    let keyToTab = function (key) {
      let index = 0;
      switch(key) {
        case 'entity':
          index = 0;
          break;
        case 'event':
          index = 1;
          break;
        case 'document':
          index = 2;
          break;
        default:
          index = 0;
      }
      return index;
    };
    //将解析json的代码抽取出来
    let parseJsonToHtml = function (item, i, key) {
      let relatedHtml = '',
        detailHtml = '';

      relatedHtml += '<p class="event_relate_list" data-type="' + item.objectType + '" data-id="' + item.objectId + '" data-pagetype="' + key + '">'
        +  '<span>' + i + '. ' + item.objectName + '</span>'
        +  '<span>' + item.objectTypeName + '</span>'
        +  '</p>';

      let relations = item.relations || [];
      let detailRelationStr = '<p class="detail_relate_list">' + relations.join(',') + '</p>';
      detailHtml += '<tr>'
        +   '<td>' + item.objectTypeName + '</td>'
        +   '<td>' + item.objectName + '</td>'
        +   '<td>' + item.objectType + '</td>'
        +   '<td>' + detailRelationStr + '</td>'
        +  '</tr>';

      return [relatedHtml, detailHtml];
    };

    let detailStr = ''; //相关事件-详细tab html
    for(let key in related) {
      let relatedItemValue = related[key].value || [];

      let relatedItemStr = ''; // 相关事件-默认-相关实体/相关事件/相关文档 html
      let count = 0;
      for(let i = 0, l = relatedItemValue.length; i < l; i++){
        //判断相关数据是否为一层嵌套
        if(relatedItemValue[i].hasOwnProperty('nodeId')) {
          //一层嵌套
          let item = relatedItemValue[i];
          let htmlArr = parseJsonToHtml(item, i+1, key);
          relatedItemStr += htmlArr[0];
          detailStr += htmlArr[1];
        }else {
          //二层嵌套，再解析一层
          for(let itemKey in relatedItemValue[i]) {
            let nestedRelatedItemValue = relatedItemValue[i][itemKey].value || [];
            for(let j = 0, itemL = nestedRelatedItemValue.length; j < itemL; j++) {
              let item = nestedRelatedItemValue[j];
              let htmlArr = parseJsonToHtml(item, ++count, key);
              relatedItemStr += htmlArr[0];
              detailStr += htmlArr[1];
            }
          }
        }
      }
      let $eventRelateTab = $(".event_relateMes_contents:eq(" + keyToTab(key) + ")");
      $eventRelateTab.mCustomScrollbar("destroy");
      $eventRelateTab.html(relatedItemStr);
      $eventRelateTab.mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
      goRelatePage();
    }
    let $eventDetailTab = $("#relate_detail_tableMes");
    $eventDetailTab.mCustomScrollbar("destroy");
    $("#relate_detail_tableMes tbody").html( detailStr );
    $eventDetailTab.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
  }

  // 获取相关拓扑
  function setRelateTopo(data) {
    const update = () => {
      const nodeJson = data;
      let width = $("#event_topo").width();
      let height = $("#event_topo").height();
      $.get(EPMUI.context.url + "/object/" + "partInformation/" + nodeJson.objectId + "/" + nodeJson.objectType, function (searchNodes) {
        var dataSearch = $.parseJSON(searchNodes);
        var newNode = jQuery.creatTopologyNode(dataSearch);
        newNode.px = width / 2;
        newNode.py = height / 2;
        startFunction(newNode, "#event_topo");
      });
    }
    return update;
  }

  //相关信息的tab切换
  $(".event_relate_opt").on( 'click', function() {
    $(".event_relate_opt").removeClass("event_relate_active");
    $(this).addClass("event_relate_active");
    var index = $(this).index();
    $(".entity_relate_box").hide().eq(index).show();
    if (index == 2) {
      temp();
    }
    // 判断点击的是那个tab，然后进行更改图标
    switch( index ) {
      case 0:
        $("#event_relate_optBox span").eq(0).addClass('icon-check-circle-o-blue').removeClass('icon-check-circle-o');
        $("#event_relate_optBox span").eq(2).addClass('icon-align-justify').removeClass('icon-align-justify-black');
        $("#event_relate_optBox span").eq(4).addClass('icon-relation-map').removeClass('icon-relation-map-blue');
      break;
      case 1:
        $("#event_relate_optBox span").eq(0).addClass('icon-check-circle-o').removeClass('icon-check-circle-o-blue');
        $("#event_relate_optBox span").eq(2).addClass('icon-align-justify-black').removeClass('con-align-justify');
        $("#event_relate_optBox span").eq(4).addClass('icon-relation-map').removeClass('icon-relation-map-blue');
      break;
      case 2:
        $("#event_relate_optBox span").eq(0).addClass('icon-check-circle-o').removeClass('icon-check-circle-o-blue');
        $("#event_relate_optBox span").eq(2).addClass('icon-align-justify').removeClass('icon-align-justify-black');
        $("#event_relate_optBox span").eq(4).addClass('icon-relation-map-blue').removeClass('icon-relation-map');
      break;
    }
  } );

  //趋势tab切换
  //  trendTabs();
  function trendTabs() {
    $(".event_trend_tab_tit").click( function(){
      var index = $(this).index();
      $(this).addClass('trend_tab_active').siblings().removeClass("trend_tab_active");
      $(".event_trend_tab_mes").eq(index).addClass("trend_mes_active").siblings().removeClass("trend_mes_active");
    } );
  }

  //设置事件的趋势
  function initEventTrend(eventTrend) {

    if (eventTrend.length === 0) {
      $('#trend_mes_content>#content_scroller').append('<div class="no-data"><span class="icon-notfind"></span><span>对不起，暂无数据。</span></div>');
      return;
    }

    var box = '';
    for (var i = 0; i < eventTrend.length; i++) {
      // 初始化起始年份
      let content = '', trend_mes_headValue = '', yearStartP = '', yearEndP = '';
      for(let j=0, max=eventTrend[i].length; j<max; j++){
        // if(eventTrend[i][j].display === '开始时间'){
        //   if(i === 0){
        //     yearStartP = '<p class="trend_year_start">'+ eventTrend[i][j].value.substring(0, 4)+'</p>';
        //   }
        //   trend_mes_headValue = eventTrend[i][j].value.substring(0, 10); 
        // }else if(eventTrend[i][j].display === '结束时间'){
        //   if(i === eventTrend.length-1){
        //     yearEndP = '<p class="trend_year_end">'+ eventTrend[i][j].value.substring(0, 4) +'</p>';
        //   }
        // }
        content += '<p>' + eventTrend[i][j].display + ': ' + eventTrend[i][j].value +'</p>';
      }

      // 初始化时间趋势数据
      box += '<div class="trend_mes_box">'
          // + yearStartP
          // + yearEndP
             + '<div class="trend_mes_head">'
               + '<span class="trend_index">' + (i+1) + '</span>'
               + '<span class="bgline"></span>'
               + '<span class="icon-event_node"></span>'
             + '</div>'
             + '<div class="trend_mes_content">'
              + '<div class="trend_mc_circle">'
                + '<span class="icon-hollow-circle"></span>'
              + '</div>'
              + '<div class="trend_mes_content_scroller">'
                + content
              + '</div>'
             + '</div>'
           + '</div>';
    }

    

    $("#trend_mes_content>#content_scroller").mCustomScrollbar("destroy");
    $('#trend_mes_content>#content_scroller').html(box);
    $("#trend_mes_content>#content_scroller").mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true,
      axis: 'x'
    });

    var $chartBox = $(".trend_mes_content_scroller");   
    try{
      !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $chartBox.data("mCS",''); //手动销毁             
    };
    $chartBox.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true,
      axis:"y"
    });  
  }

  //编辑基本信息的数据
  function editContent(){
    $("#event_option").click( function(){
      //如果处于未编辑状态进行编辑
      if(!editable){
        $(".event_base_message").addClass("eneity_edit").attr("contenteditable", true);
				$(this).removeClass("icon-edit-blue").addClass("icon-save");
        editable = true;
      //  否则进行保存
      } else {
        saveEditeContent();
        $(".event_base_message").removeClass("eneity_edit").attr("contenteditable", false);
        editable = false;
				$(this).removeClass("icon-save").addClass("icon-edit-blue");
      }
    } )
  }
 
  //保存编辑数据
  function saveEditeContent() {
    var editObject = {
      modify: [],
      id: Magicube.id,
      type: Magicube.type
    };
    $(".event_base_message").each( function (index, item) {
      editObject.modify.push( {
        propertyName: $(item).attr("data-type"),
        value: $(item).html()
      } )
    } );

    $.post( EPMUI.context.url + '/object/detailInformation', { modifyJson: JSON.stringify( editObject ) }, function( data ) {
      var datas = JSON.parse( data );
      if( parseInt( datas.code ) === 200 ) {
        showAlert( "提示!", datas.message, "event_pagealert_notice_color_default" );
      } else {
        showAlert( "提示!", datas.message, "event_pagealert_notice_color_license" );
      }
    } )

  }

  //跳转相关详细页面
  function goRelatePage() {
    $(".event_relate_list").on( 'click', function() {
      location.href = '/' + $( this ).attr( "data-pagetype" ) + '?id=' + $( this ).attr( "data-id" ) + '&type=' + $( this ).attr( "data-type" );
    } );
  }

  //关闭警告框
  $("#page_alert_button").on( 'click', function (){
    $("#page_alert").hide();
    $("#page_alert_content").html("");
  } );

  //警告框的显示
  function showAlert( title, content, color ) {
    $("#page_alert_title").html(title).addClass(color);
    $("#page_alert_content").html(content);
    $("#page_alert").show();
  }

  // 详情页跳转向本地缓存加点
  window.goTopoAddNode = function(id,type){
      $.get( EPMUI.context.url + "/object/"+"partInformation/" + id + "/" + type, function(searchNodes){
        var parseSearchNodes = $.parseJSON(searchNodes);
        var node = jQuery.creatTopologyNode(parseSearchNodes);
        node.selected = true;//为true到工作台自动打开菜单
        //缓存一个当前跳转的节点的nodeid，供控制台打开菜单使用，如果没有则不生效
        localStorage.setItem( "open", JSON.stringify(node.nodeId) );
        localStorage.setItem( "searchAddNode", JSON.stringify(Array.of(node)));
        location.href = '/topology';
      } );
  }
});