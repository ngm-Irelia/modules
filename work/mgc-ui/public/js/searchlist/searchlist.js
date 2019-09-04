$(function () {
  var searchType = "All",//tabmain标签上的data-key值
      tabArrData = null,//
      parentNode,//tab的每个li，里面包含parentClassfiy和childClassfiy
      iNode,//i标签  就是...
      searchTip = '<p>没有搜索结果，请确认搜索内容是否为<span id="searchlist_none_name"></span>。<p style="display:none;"><span id="searchlist_makeLabel">创建对象</span></p></p>',
      advanceSearchTip = '<p>高级搜索没有搜索到内容，请更换搜索条件重新搜索...</p>',
      keyword = decodeURIComponent(Magicube.keyword) || '',
      s_index = 0,
      pro_index = 0,
      alertBoxHide = false,
      advanceSearchClick = false,
      advanceSearchFlag = localStorage.advanceSearchFlag ? localStorage.advanceSearchFlag : "false",
      cur_page = isNaN(parseInt(localStorage.page)) ? 0 : parseInt(localStorage.page),
      tabArrHtml = JSON.parse(localStorage.tabArrHtml);//保存tab栏的html结构

  if(keyword === "undefined"){
    keyword='';
  }
  var AllTitleData = [];
  var reqFlag = 0 ;
  window.searchMapLoad = false;
  window.mapAreaValue = [];
  //设置本地存储的键值，就是搜索框里用户输入
  localStorage.setItem("s_keyword", encodeURIComponent(keyword));
  //s_index是用来判断页面处于实体，事件，文档还是全部，数字类型
  if (!localStorage.s_index) {
    localStorage.setItem("s_index", s_index);
  }
  //加载tab栏
  //搜索列表初始化，函数声明提升，所以这里可以这么用
  searchlistInit();

  // 搜索列表初始化
  function searchlistInit() {
    var value = keyword;//这个是搜索框里的值
    $(".search_group_input").val(value);
    if (tabArrHtml.length === 4) {//本来这个本地存储就应该等于4，每次强刷会重走一遍tab头信息的函数，所以长度会增加3
      s_index = parseInt(localStorage.s_index);
      //s_index大于0，说明不是在全部，然后继续往下找
      //目的是还原出刷新前点到哪个地方
      if (s_index > 0) { //删除id为#search_all的dom
        var _parentNode = $(".parent_classify").removeClass("tab_active").not("#search_all").hide().eq(s_index - 1).show().parent();
        if (_parentNode.children().length === 1) {
          //把字符串转成json对象
          var _tabArrHtml = JSON.parse(localStorage.tabArrHtml);
          var index = parseInt(localStorage.pro_index);
          var strAll = "";
          var str = "";
          //eq()选取带有指定index的元素
          var curentFlag = $(".parent_classify").eq(s_index);
          _tabArrHtml.map(function (_item) {
            if (_item.title === curentFlag.html()) {
              strAll = _item._htmlAll;
              str = _item._html;
            }
          });
          _parentNode.append(str);
          var curentNode = _parentNode.children().eq(index);
          curentNode.addClass("tab_active");
          searchType = curentNode.attr("data-key");
          searchChildClassify(_parentNode);
          searchParentClassify();
        }
      } else {
        searchParentClassify();
        $("#search_all").addClass("tab_active");
      }
      getPagination();
    } else {
      getPagination();
    }
  }

  //动态加载js
  function loadScript(url, callback){
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (typeof(callback) != "undefined"){
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function () {
          callback();
        };
      }
    }
    script.src = url;
    document.body.appendChild(script);
  }

  //获取cookie
  function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i].trim();
          if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
      }
      return "";
  }

  function setPGISStyle(){
      $("p").css("font-size",'14px');
      $(".search_history_box a").css("font-size",'16px');
      $("#searchLsit_search_btn p").css("font-size",'16px');
      $("#searchLsit_search_advancedBtn p").css("font-size",'16px');
      let themeStyle = getCookie("theme");
      if(themeStyle === "white"){
          $("BODY").css("color",'#2b363d');
      }else{
          $("BODY").css("color",'#fff');
      }
  }
  
  if (EPMUI.context.gis.type === "PGIS") {
      //调整pgis代码的问题！！
      setTimeout(function () {
          setPGISStyle();
      },500);
      setTimeout(function () {
          setPGISStyle();
      },1000);
      setTimeout(function () {
          setPGISStyle();
      },2000);
  }

  //打开高级搜索
  $("#searchLsit_search_advancedBtn").on('click', function () {
    //日历插件的调用
    laydate.render({
      elem: '#search_time',
      range: '~'
    });
    
    $("#search_shade").animate({'top': '50px', 'right': 0, 'bottom': 0, 'left': 0}, 100, 'linear', function () {
      $("#advance_search_content").show();
      window.mapAreaValue = [];
    });
    if (EPMUI.context.gis.type === "bmap") {
      if (!searchMapLoad) {
        loadScript("/bower_components/d3/d3.min.js", function () {
          loadScript("/js/gisPlatform/gisPlatform.js", function () {
            loadScript("/js/public/gis/selectMapDrawingManager.js", function () {
              loadScript("/js/gisPlatform/BMapNgm.js", function () {
                loadScript("/js/public/gis/DistanceTool.js", function () {
                  var searchBMap = new BMapNgm.bMapNgm();
                  searchBMap.searchMapRun();
                  searchMapLoad = true;
                });
              });
            });
          });
        });
      }
      ;
    } else if (EPMUI.context.gis.type === "arcgis") {
      if (!searchMapLoad) {
        //加载一个css
        $("<link>")
          .attr({
            rel: "stylesheet",
            type: "text/css",
            href: EPMUI.context.gis.cssFirst
          })
          .appendTo("head");

        if (EPMUI.context.gis.cssSecond != "null") {
          $("<link>")
            .attr({
              rel: "stylesheet",
              type: "text/css",
              href: EPMUI.context.gis.cssSecond
            })
            .appendTo("head");
        }

        loadScript(EPMUI.context.gis.js, function () { //加载,并执行回调函数
          loadScript("/js/gisPlatform/gisPlatform.js", function () {
            loadScript("/js/gisPlatform/arcGisNgm.js", function () {
              var searchBMap = new ArcGisNgm.arcGisNgm();
              searchBMap.searchArcGisRun();
              searchMapLoad = true;
            });

          });
        });
      }
    } else if(EPMUI.context.gis.type === "PGIS"){
        if (!searchMapLoad) {
            loadScript("/js/gisPlatform/gisPlatform.js", function () {
                loadScript("/js/gisPlatform/PGIS.js", function () {
                    var searchPgis = new PGIS.pgis();
                    searchPgis.searchMapRun();
                    //searchMapLoad = true;
                });
            });
        }
    }else if(EPMUI.context.gis.type === "supermap"){
        if (!searchMapLoad) {
            $("<link>")
                .attr({ rel: "stylesheet",
                    type: "text/css",
                    href: "http://cdn.bootcss.com/leaflet/1.2.0/leaflet.css"
                })
                .appendTo("head");
            $("<link>")
                .attr({ rel: "stylesheet",
                    type: "text/css",
                    href: "http://cdn.bootcss.com/leaflet.draw/0.4.12/leaflet.draw.css"
                })
                .appendTo("head");
            loadScript('/bower_components/d3/d3.js',function(){
                loadScript('/js/public/supermap/dist/include-leaflet.js',function(){
                    loadScript('/js/public/supermap/dist/iclient9-leaflet.js',function(){
                        loadScript('http://cdn.bootcss.com/leaflet.draw/0.4.12/leaflet.draw.js',function(){
                            loadScript('/js/topology/superMapL.js',function(){
                                var searchSupermap = new SuperMapNgm.superMapNgm();
                                searchSupermap.searchMapRun();
                            });
                        });
                    });
                });
            });
        }
    }
    // $("#advance_search_map_value").on('keyup', function(ev) {
    //   ev = ev || window.event;
    //   if(ev.keyCode == 13){
    //     console.log($(this).val());
    //   }
    // });
  });

  //关闭高级搜索
  $("#advance_search_cancel").on('click', function () {
    $("#advance_search_content").hide();
    $("#search_shade").animate({'top': '50%', 'right': '50%', 'bottom': '50%', 'left': '50%'}, 100, 'linear');
  });

  //高级搜索中地理位置设定
  $("#searchMap").on('click', function () {
    $(".BMapLib_Drawing_panel").show();
    $("#search_shade").append($(this), $(".search_map_operate"));
    $("#advanceSearch_box").hide();
    $(this).addClass('searchlist_searchMap_width_active').removeClass('searchlist_searchMap_width_default');

    if(!searchMapLoad){
        if(EPMUI.context.gis.type === "PGIS"){
            $("#searchPGIS").html("");
            setTimeout(function () {
                var searchPgis = new PGIS.pgis();
                searchPgis.searchMapRun();
                searchMapLoad = true;
            })
        }
    }

      if(EPMUI.context.gis.type === "supermap"){
          searchMapSize();
          $(".search_map_operate").css("z-index","999")
      }

    $(".search_map_operate").show();
    let circleHoverFlag = 1;
    $(".circle").hover(function () {
      $(this).addClass("circle_hover").children('p').show();
    }, function () {
      $(this).children('p').hide();
      if (circleHoverFlag) {
        return;
      } else {
        $(this).removeClass("circle_hover");
      }
    });
    $(".square").hover(function () {
      $(this).addClass("square_hover").children('p').show();
    }, function () {
      $(this).children('p').hide();
      if (circleHoverFlag) {
        $(this).removeClass("square_hover");
      }
    });
    $(".circle").on('click', function () {
      circleHoverFlag = 1;
      $(this).addClass("circle_hover");
      $(".square").removeClass("square_hover");
    });
    $(".square").on('click', function () {
      circleHoverFlag = 0;
      $(this).addClass("square_hover");
      $(".circle").removeClass("circle_hover");
    });
  });

  //从地图返回高级搜索
  $(".search_map_return").on('click', function () {
    $("#searchMap").addClass('searchlist_searchMap_width_default').removeClass('searchlist_searchMap_width_active').appendTo($("#advance_search_condition>li:nth-of-type(3)"));
    $(".search_map_operate").hide();
    $(".BMapLib_Drawing_panel").hide();
    $("#advanceSearch_box").show();
  });
  //请求tab头全部分类(以前分开，现在一级二级分类一块请求过来了)
  function getTabAllTitle(){
    $.get(EPMUI.context.url+'/metaData/AllObjectType',{'type':'All','keyword':$('.search_group_input').val()},function(data){
      AllTitleData = JSON.parse(data).magicube_interface_data || [];
      setTabMainTitle();
      getTabTitle();

    })
  }

  //把tab头主分类放入页面
  function setTabMainTitle(){
    var TabMT='<li class="searchlist_tab searchlist_tab_all">'
              + '<span id="search_all" class="parent_classify tab_active" data-key="All">全部</span>'
              +'</li>';
    for(var i=0;i<AllTitleData.length;i++){
      if(i==0){
        TabMT += '<li class="searchlist_tab searchlist_tab_entity">'
              +  '<span class="parent_classify" data-key="'+AllTitleData[i].property+'">'+AllTitleData[i].title+'('+AllTitleData[i].size+')'+'</span>'
              +  '<i id="'+AllTitleData[i].property+'_more" class="child_classify_more" data-key="open">...</i>'
              +'</li>';
      }else{
        TabMT += '<li class="searchlist_tab">'
              +  '<span class="parent_classify" data-key="'+AllTitleData[i].property+'">'+AllTitleData[i].title+'('+AllTitleData[i].size+')'+'</span>'
              +  '<i id="'+AllTitleData[i].property+'_more" class="child_classify_more" data-key="open">...</i>'
              +'</li>';
      }
      
    }
    $("#searchList_main_tab").html(TabMT);
  }
  //获取tab头信息
  function getTabTitle() {
    tabArrHtml = [{ title: "全部", _html: '' }];
    for (var i = 0; i < AllTitleData.length; i++) {//放着实体事件文档中英文的数组
      var strAll = '';
      var str = '';
      var datas = AllTitleData[i].sonRoots
      if (datas.length !== 0) {
        for (var j = 0; j < datas.length; j++) {
          strAll += '<b class="child_classify" data-key="' + datas[j].property + '">' + datas[j].title +'('+datas[j].size+')' + '</b>'
        }
        var tmp;
        datas.length > 9 ? tmp = 9 : tmp = datas.length;
        for (var k = 0; k < tmp; k++) {
          str += '<b class="child_classify" data-key="' + datas[k].property + '">' + datas[k].title +'('+datas[k].size+')' + '</b>'
        }
      }
      
      tabArrHtml.push({title: AllTitleData[i].title, _htmlAll: strAll, _html: str});
          
    }
    searchParentClassify();
  }
  // getTabTitle();
  // console.log(entityTexts)
  //tab一级分类
  function searchParentClassify() {
    $(".parent_classify").each(function (index, item) {
      //off() 方法通常用于移除通过 on() 方法添加的事件处理程序。
      $(item).off().on('click', function () {
        var strAll = "";
        var str = "";
        s_index = index;//存储点击的是哪个大分类
        pro_index = 0;
        cur_page = 0;
        //存储当前状态
        localStorage.setItem("s_index", s_index);//当前大分类
        localStorage.setItem("pro_index", pro_index);
        localStorage.setItem("tabArrHtml", JSON.stringify(tabArrHtml));//转成字符串
        var indexSh = $(item).parent('li').index() ;        
        strAll = tabArrHtml[indexSh]._htmlAll;//拿到，当前点击分类下的子分类
        str = tabArrHtml[indexSh]._html;
        //遍历本地缓存，拿到当前选择分类下的缓存，放到字符串等待拼接；

        searchType = $(this).attr("data-key");
        parentNode = $(this).parent();//拿到li标签
        var parentNodeSpecial = $(this).parent();
        iNode = $(this).parent().find("i");//li标签下面的i标签
        if (parentNode.children().length === 2) {
          iNode.before(str);//如果li标签没有填入小分类，即b标签，把b标签添加进去
        }
        //searchChildClassifyMore(parentNodeSpecial,strAll,str,iNode);
        //一级标签用span标签，二级标签用b标签
        if (index === 0) {
          //点击全部，其他分类下的子标签span显示，其他不显示，实体有左边距其他没有
          parentNode.siblings().children("span").show();
          parentNode.siblings().children().not("span").hide();
          parentNode.siblings().removeClass('searchlist_tab_entity');
          $("#searchList_main_tab li:eq(1)").addClass('searchlist_tab_entity');
        } else {
          parentNode.children().show();
          parentNode.siblings().children("span").not("#search_all").hide();//从集合中删除某集合
          iNode.css('display', 'inline-block');
          parentNode.addClass('searchlist_tab_entity');
          parentNode.siblings().removeClass('searchlist_tab_entity');
        }
        //真的
        $(".child_classify_more").on('click', function () {
          if ($(this).attr("data-key") == "open") {
            $(this).parent().children("b").remove();
            $(this).before(strAll);
            $(this).attr("data-key", "close");
            $(this).text(".");
          } else {
            $(this).parent().children("b").remove();
            $(this).before(str);
            $(this).attr("data-key", "open");
            $(this).text("...");
          }
          //searchChildClassify(parentNodeSpecial);//在這裡加這個的原因是，只要重新添加html，點擊事件就不能獲取dom元素，所以要在dom元素生成的地方，添加點擊事件函數
          searchChildClassify(parentNode);
        });
        searchChildClassify(parentNode);
        //默认让第一个标签高亮
        $(".tab_active").removeClass("tab_active");
        parentNode.children("span").addClass("tab_active");
        reqFlag = 1
        getPagination();


      });
    });
  }

  //tab二级过滤
  function searchChildClassify(parentNode) {
    parentNode.children(".child_classify").off().on('click', function () {
      pro_index = $(this).index();
      localStorage.setItem("pro_index", pro_index);
      searchType = $(this).attr("data-key");
      $(".tab_active").removeClass("tab_active");
      $(this).addClass("tab_active");
      reqFlag = 1;
      getPagination();
    });
  }

  //回车搜索
  $(".search_group_input").bind('keydown', function (ev) {
    if (ev.keyCode === 13) {
      $("#searchList_main_box").hide();
      $("#searchlist_loading").show();
      var value = $(".search_group_input").val();
      history.replaceState(null, '', '?keyword=' + value);
      setLocalstorageValue(value);
    }
  });

  //点击按钮搜索
  $("#searchLsit_search_btn").click(function () {
    $("#searchList_main_box").hide();
    $("#searchlist_loading").show();
    var value = $(".search_group_input").val();
    history.replaceState(null, '', '?keyword=' + value);
    setLocalstorageValue(value);
  });

  //设置搜索内容到本地缓存
  function setLocalstorageValue(value) {
    advanceSearchFlag = "false";
    searchType = "All";
    localStorage.setItem("advanceSearchFlag", advanceSearchFlag);
    localStorage.setItem("s_keyword", encodeURIComponent(value.trim()));
    searchEvent(value.trim());
  }

  //高级搜索
  $("#advance_search_ensure").on('click', function () {
    //对搜索条件进行空格处理
    //trim()去掉首尾空格
    // 检索内容
    var keyword = $.trim($("#advance_search_value").val()) ? $.trim($("#advance_search_value").val()) : "";
    // 时间设定
    var startTime = $.trim($("#search_time").val().split("~")[0]) ? $.trim($("#search_time").val().split("~")[0]) : "";
    var endTime = $.trim($("#search_time").val().split("~")[1]) ? $.trim($("#search_time").val().split("~")[1]) : "";

    var propertyArr = [];
    advanceSearchFlag = "true";
    advanceSearchClick = true;
    // 搜索框搜索关键字填入检索内容
    $(".search_group_input").val(keyword);
    // 对象筛选
    $(".property_value").each(function (index, item) {
      //split( "_" )将字符串在指定位置分割，返回数组（每一项是字符串）
      var value = $.trim($(item).text()).split("_");
      if (!!value[3]) {
        var propertyObj = {
          "rootType": $(item).attr("data-root"),//获取属性值
          "objectType": $(item).attr("data-object"),
          "property": $(item).attr("data-type"),
          "dataType": $(item).attr("data-flag"),
          "value": value[3]
        };
        propertyArr.push(propertyObj);
      }
    });
    //默认高级搜索从全部内容检索
    var advanceData = {
      objectType: "All",
      pageSize: 10,
      keyWord: keyword,
      startTime: startTime,
      endTime: endTime,
      property: JSON.stringify(propertyArr)
    };

    localStorage.setItem("advanceBody", JSON.stringify(advanceData));
    //搜索完成关闭弹框
    $("#advance_search_content").hide();
    $("#search_shade").animate({'top': '50%', 'right': '50%', 'bottom': '50%', 'left': '50%'}, 100, 'linear');
    searchEvent(keyword);
  });

  //检索触发事件
  function searchEvent(keyword) {
    s_index = 0;
    pro_index = 0;
    cur_page = 0;
    var _parentNode = $("#search_all").parent();
    $("#search_all").addClass("tab_active");
    _parentNode.siblings().children("span").removeClass("tab_active").show();
    _parentNode.siblings().children("b").hide();
    _parentNode.siblings().children("i").hide();
    _parentNode.siblings().removeClass('searchlist_tab_entity');
    $("#searchList_main_tab li:eq(1)").addClass('searchlist_tab_entity');
    localStorage.setItem("s_keyword", encodeURIComponent(keyword));
    localStorage.setItem("pro_index", pro_index);
    localStorage.setItem("s_index", s_index);
    localStorage.setItem("advanceSearchFlag", advanceSearchFlag);   
    searchParentClassify();
    getPagination();
  }

  // 授权判断
  function authJudgment(result) {
    if (result.code && result.code === 407) {
      showAlert("提示", result.message, "searchlist_pagealert_notice_color_license");
      return false;
    }
    return true;
  }

  //分页：其实是后台分的，每请求一次就会向后台发一次请求，后台每次给6条数据，这个分页引的插件是先才粘贴的在jquery.js中
  //生成分页
  function getPagination() {
    // 将搜索gif图隐藏
    $("#searchlist_loading").hide();
    //先进行判断是否是高级搜索
    if (advanceSearchFlag === "false") {
      // 判断搜索关键字是否为空
      var keyword = decodeURIComponent(localStorage.s_keyword) || "";
      if(keyword === '' || keyword === 'undefined' || keyword === undefined){
        $("#searchlist_pagination_box").hide();
        $("#searchList_main_box").children(".searchList_main_content_box").html("").hide();
        $("#searchlist_nomessage").html("<p>请输入检索内容。</p>").show();       
        $('#searchList_main_tab').html('');
        return ;
      }else{

        $("#searchlist_loading").show();
        $.post(EPMUI.context.url + '/object/page', {"keyword": keyword, "type": searchType}, function (data) {
           if(reqFlag==0){
             getTabAllTitle()
             
             //localStorage.setItem('reqFlag',reqFlag);
           }
           reqFlag=0;
          
          // 授权
          if (!authJudgment(JSON.parse(data))) {
            $("#searchList_main_box").childrean(".searchList_main_content_box").html("").hide();
            $("#searchlist_pagination_box").hide();
            return;
          }
          setPagination(data, "search");
        });
      }
    } else {
      // 判断搜索关键字是否为空
      var keyword = localStorage.advanceBody ? JSON.parse(localStorage.advanceBody) : "";
      if (!keyword) {
        $("#searchlist_nomessage").html(advanceSearchTip).show();
        return;
      }

      // 高级搜索增加地图选区
      if (window.mapAreaValue.length > 0) {
        if (window.mapAreaValue[0].radius) {
          keyword.gisType = 'circle';
          keyword.radius = window.mapAreaValue[0].radius;
          keyword.lat = window.mapAreaValue[0].lat;
          keyword.lon = window.mapAreaValue[0].lon;
        } else {
          keyword.gisType = 'polygon';
          let lat = window.mapAreaValue[0].lat.join(',');
          let lon = window.mapAreaValue[0].lon.join(',');
          keyword.lat = lat;
          keyword.lon = lon;
        }
      }

      //判断是点击高级搜索按钮进行的搜索还是点击tab进行的搜索
      if (advanceSearchClick) {
        keyword.objectType = "All";
      } else {
        keyword.objectType = searchType;
      }

      $.post(EPMUI.context.url + '/search/advancedsearch/page', keyword, function (data) {
        // 授权
        if (!authJudgment(JSON.parse(data))) {
          $("#searchList_main_box").hide();
          $("#searchlist_pagination_box").hide();

          return;
        }
        setPagination(data);
      });
    }
  }

  //设置分页
  function setPagination(data, type) {
    var totalpages = parseInt(data);
    if (totalpages !== 0) {
      $("#searchlist_pagination").pagination(totalpages, {
        callback: pageselectCallback,
        prev_text: '< 上一页',
        next_text: '下一页 >',
        num_display_entries: 6,
        current_page: cur_page,
        num_edge_entries: 1
      });
      $("#searchlist_nomessage").hide();
      $("#searchlist_pagination_box").show();
    } else {
      // 如果搜索结果的数据条数为零判断是普通搜索还是高级搜索，普通搜索可以创建对象，高级搜索不能创建对象。
      advanceSearchClick = false;
      if (type === "search") {
        //普通搜索
        $("#searchlist_nomessage").html(searchTip).show().find("#searchlist_none_name").html("“" + $(".search_group_input").val() + "”");
        showMakeEntityModal();
      } else {
        //高级搜索
        $("#searchlist_nomessage").html(advanceSearchTip).show();
      }
      $("#searchlist_pagination_box").hide();
      $("#searchList_main_box").hide();
    }
  }

  //分页回掉
  function pageselectCallback(index) {
    getSearchData(index);
    localStorage.setItem("page", index)
  }

  //数据分类
  function getSearchData(index) {
    //判断是否是高级搜索
    if (advanceSearchFlag === "false") {
      var keyword = decodeURIComponent(localStorage.s_keyword) ? decodeURIComponent(localStorage.s_keyword) : "";
      //根据输入信息，请求全部结果
      $.post(EPMUI.context.url + '/search', {
        "keyword": keyword,
        "type": searchType,
        "pageNo": index,
        "pageSize": 10
      }, function (data) {
        setSearchLists(data);
      });
    } else {
      var keyword = localStorage.advanceBody ? JSON.parse(localStorage.advanceBody) : {};
      keyword.pageNo = index;
      if (advanceSearchClick) {
        keyword.objectType = "All";
      } else {
        keyword.objectType = searchType;
      }
      $.post(EPMUI.context.url + '/search/advancedsearch', keyword, function (data) {
        advanceSearchClick = false;
        setSearchLists(data);
      });
    }
  }

  //根据获取到的数据进行搜索结果展示
  function setSearchLists(data) {

    var datas = JSON.parse(data);
    var dataSource = [];
    // for(var key in datas){
    //   var res = datas[key];
    //   res.map( function (item) {
    //     dataSource.push(item);
    //   });
    // }//我就不明白这个为什么会报错
    
    // 进行数据分类
    //实体,人
    if (datas.entity && datas.entity.length !== 0) {
      datas.entity.map(function (item) {
        //item.dataType = "entity";
        dataSource.push(item);
      });
    }
    //事件
    if (datas.event && datas.event.length !== 0) {
      datas.event.map(function (item) {
        //item.dataType = "event";
        dataSource.push(item);
      });
    }
    //文档
    if (datas.document && datas.document.length !== 0) {
      datas.document.map(function (item) {
        //item.dataType = "document";
        dataSource.push(item);
      });
    }
    //物品
    if (datas.thing && datas.thing.length !== 0) {
      datas.thing.map(function (item) {
        //item.dataType = "thing";
        dataSource.push(item);
      });
    }
    //案件
    if (datas.case && datas.case.length !== 0) {
      datas.case.map(function (item) {
        //item.dataType = "case";
        dataSource.push(item);
      });
    }
    //地址
    if (datas.place && datas.place.length !== 0) {
      datas.place.map(function (item) {
        //item.dataType = "place";
        dataSource.push(item);
      });
    }
    //组织
    if (datas.org && datas.org.length !== 0) {
      datas.org.map(function (item) {
        //item.dataType = "org";
        dataSource.push(item);
      });
    }

    $("#searchList_main_box").html(concathtml(dataSource)).show();
    BtnTip ();

    $(".searchList_main_content_box").mouseenter(function(){
      $(".searchList_content_text").mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    }).trigger('mouseenter');

    goDetail();
    goTopology();
  } 
  
  //跳转到相关详细
  function goDetail() {
    $(".search_go_detail").on('click', function () {
      location.href = '/' + $(this).attr("data-pageType") + '?id=' + $(this).attr("data-id") + '&type=' + $(this).attr("data-type");
      
    });
  }

  //跳转到工作台,同时添加节点到工作台
  function goTopology() {
    $(".searchList_content_topology").on('click', function () {
      $.get(EPMUI.context.url + "/object/" + "partInformation/" + $(this).attr("data-id") + "/" + $(this).attr("data-type"), function (searchNodes) {
        var dataSearch = $.parseJSON(searchNodes);
        var node = jQuery.creatTopologyNode(dataSearch);
        node.selected = true;//为true到工作台自动打开菜单可以扩展数据
        var searchAddNode = [];
        searchAddNode.push(node);
        localStorage.setItem("searchAddNode", JSON.stringify(searchAddNode));
        localStorage.setItem( "open", JSON.stringify(dataSearch.nodeId) );//跳转到工作台，检测到open，会自动打开菜单
        location.href = '/topology';
      });
      localStorage.setItem("topologyType", "topo");
    });
    $(".searchList_content_gis").on('click', function () {
      var id = $(this).attr("data-id"),
        type = $(this).attr("data-type");

      // 验证是否授权
      $.get(EPMUI.context.url + '/object/gis/passport', function (data) {
        const result = JSON.parse(data);
        if (!authJudgment(result)) return;

        $.get(EPMUI.context.url + "/object/" + "partInformation/" + id + "/" + type, function (searchNodes) {
          var dataSearch = $.parseJSON(searchNodes);
          var node = jQuery.creatTopologyNode(dataSearch);
          node.x = 830.0762424295211;
          node.y = 379.9961124025927;
          var searchAddNode = [];
          searchAddNode.push(node);
          //localStorage.setItem("goTopo", true);
          localStorage.setItem("searchAddNode", JSON.stringify(searchAddNode));
          location.href = '/gisPlatform';
        });
        localStorage.setItem("topologyType", "topo");
      });

    });
  }

  //********高级搜索********

  //弹出创建标签弹框
  function showMakeEntityModal() {
    $("#searchlist_makeLabel").on('click', function () {
      $("#document_modal").show();
      $("#search_shade").show();
      $("#make_label").val($(".search_group_input").val());
    });
  }

  //关闭创建标签弹框
  $("#make_cancel").on('click', function () {
    $("#document_modal").hide();
    $("#search_shade").hide();
  });

  //确定创建
  $("#make_ensure").on('click', function () {
    //初始化创建对象的参数，按文档规定来定义参数
    var makeObj = {
        name: $("#make_label").val(),
        docId: Magicube.id,
        objectType: $("#makeEntity_type").attr("data-type"),
        property: ""
      },
      syncTopoNode = {
        pageType: $(".make_active").attr("data-type"),
        objectType: $("#makeEntity_type").attr("data-type")
      },
      propertyObj = {};


    if ($("#makeEntity_type").attr("data-type") !== "null") {
      $("#makeEntity_type").parent().next().hide(); //把错误提示隐藏
      makeObj.objectType = $("#makeEntity_type").attr("data-type");
    } else {
      $("#makeEntity_type").parent().next().show();    //错误提示显示
      return false;
    }
    //判断对象名是否为空
    if (!$("#make_label").val()) {
      //next()下一个同胞元素
      $("#make_label").next().show();
      return false;
    } else {
      $("#make_label").next().hide();
    }
    //获取手动添加的属性
    $(".make_detail_list").each(function (index, item) {
      if (!!$(item).html().trim()) {
        propertyObj[$(item).attr("data-type")] = $(item).html();
      }
    });

    makeObj.property = JSON.stringify(propertyObj);
    $.post(EPMUI.context.url + '/document/createobject', makeObj, function (data) {
      var datas = JSON.parse(data);
      if (datas.status !== "success") {
        showAlert("警告!", datas.message, "searchlist_pagealert_notice_color_license");
        return false;
      } else {
        showAlert("提示!", datas.message, "searchlist_pagealert_notice_color_default");
      }

      //如果选中同步到工作台，进入if
      //prop() 方法设置或返回被选元素的属性和值。
      if ($("#add_topo_checkbox").prop("checked") === true) {
        // $("#add_topo_checkbox").addClass('').removeClass('');
        syncTopo(datas, syncTopoNode);
      }

      $("#document_modal").hide();
      $("#topo_shade").hide();

      var makeEntityTime = setInterval(function () {
        if (alertBoxHide) {
          $("#searchList_main_box").show();
          $("#searchlist_loading").show();
          setLocalstorageValue($("#make_label").val());
          alertBoxHide = false;
          clearInterval(makeEntityTime);
        }
      }, 200);

    });

  });

  //把创建的点同步到工作台，按照邓茂的需求
  function syncTopo(datas, syncTopoNode) {
    var searchAddNode = localStorage.searchAddNode ? JSON.parse(localStorage.searchAddNode) : [];
    var object = {
      id: datas.data.objectId,
      nodeId: datas.data.nodeId,
      name: $("#make_label").val(),
      fixed: true,
      selected: true,
      objectType: syncTopoNode.pageType,
      type: syncTopoNode.objectType,
      x: 1400,
      y: 100
    };

    searchAddNode.push(object);
    localStorage.setItem("searchAddNode", searchAddNode);
  }

  //关闭警告框
  $("#page_alert_button").on('click', function () {
    $("#page_alert").hide();
    $("#page_alert_content").html("");
    alertBoxHide = true;
  });

  //警告框的显示
  function showAlert(title, content, color) {
    $("#page_alert_title").html(title).addClass(color);
    $("#page_alert_content").html(content);
    $("#page_alert").show();
  }

  window.onresize=function(){  
    var left_ = ($("#searchList_main_search").width()-532)/2+548;
    $(".search_history_box").css("left",left_+"px");
  };

  //拼接字符串，拼返回数据组成一条一条的结果
  function concathtml(data) {
    let _content = '',
        objectType;
    for (var i = 0; i < data.length; i++) {
      var _propty = data[i].properties;
      // var _type = data[i].type;
      var _message = "";
      for (var j = 0, len = _propty.length; j < len; j++) {
        var displayName = _propty[j].value ? _propty[j].value : '';
        if (_propty[j].displayName !== "文档内容") { //判断是否是文档内容，如果是不显示

          if (_propty[j].displayName === "文档分类" && displayName) {
            var classifications,
                names = [],
                vateShow = '';
            if( window.MGC.isJSONString( displayName ) ) {
              for (var num in classifications) {
                vateShow = (Math.round(classifications[num].vate * 10000)) / 100;
                names.push('<span class="dot">● </span>' + classifications[num].name + ': 置信度' + vateShow + '%');
              }
            }

            displayName = names.join("&nbsp;&nbsp;");
          }

          _message += '<div><span>' + _propty[j].displayName + '：</span><p>' + displayName + '</p></div>';
        }
      }

      //拼接搜索列表中的单个结果的内容
      var name = '';
      name = data[i].properties.length > 0 ? data[i].properties[0].value : '';
      objectType = data[i].objectType || '';
      _content += '<div class="searchList_main_content_box">'
        + '<div class="searchList_main_content">'
        + '<div class="searchList_content_img">'
        // + '<img src="' + EPMUI.context.url + '/image/' + data[i].icon + '/' + data[i].pageType + '" alt="头像"/>'
        + '<img src="?" onerror="window.MGC.proxyImage(this, \''+ data[i].icon +'\', \''+ objectType.toLowerCase() +'\')" alt="头像"/>'
        + '</div>'
        + '<div class="search_go_detail icon-button" data-type="' + objectType + '" data-pageType="' + data[i].pageType + '" data-id="' + data[i].id + '">详细资料<span class="path2"></span></div>'
        + '<div data-id=' + data[i].id + ' class="searchList_content_gis icon-earth-blue" data-name="' + name + '" data-type="' + objectType + '" data-pageType="' + data[i].pageType + '" data-nodeId="' + data[i].nodeId + '">'
        + '</div>'
        + '<div data-id=' + data[i].id + ' class="searchList_content_topology icon-topology" data-name="' + name + '" data-type="' + objectType + '" data-pageType="' + data[i].pageType + '" data-nodeId="' + data[i].nodeId + '"></div>'
        + '<div class="searchList_content_text">'
        + _message
        + '</div>'
        + '</div>'
        + '</div>'
    } 
    return _content;
  } 

  var tipText = ['GIS','关系拓扑'];
  //图表tooltip
  function BtnTip () {
    $('.searchList_content_gis,.searchList_content_topology').mouseover(function(){
      var tipIndex = $(this).index()-2;
      var tipRight;
      tipIndex == 0 ? tipRight='32px' : tipRight='6px'
      $(this).parent().append('<div class="tipStyle"></div>');
      $('.tipStyle').text(tipText[tipIndex]).css('right',tipRight);
    });
    $('.searchList_content_gis,.searchList_content_topology').mouseout(function(){
      $('.tipStyle').remove();
    });

    //拼接搜索列表中的单个结果的内容
    // var name = '';
    // name = data[i].properties.length > 0 ? data[i].properties[0].value : '';
    // _content += '<div class="searchList_main_content_box">'
    //   + '<div class="searchList_main_content">'
    //   + '<div class="searchList_content_img">'
    //   + '<img src="' + EPMUI.context.url + '/image/icon/oracle?idCardNumber=' + data[i].idCardNumber + '&type=' + data[i].type + '" alt="头像"/>'
    //   + '</div>'
    //   + '<div class="search_go_detail icon-button" data-type="' + _type + '" data-pageType="' + data[i].pageType + '" data-id="' + data[i].id + '">详细资料<span class="path1"></span><span class="path2"></span></div>'
    //   + '<div data-id=' + data[i].id + ' class="searchList_content_gis icon-earth-blue" data-name="' + name + '" data-type="' + _type + '" data-pageType="' + data[i].pageType + '" data-nodeId="' + data[i].nodeId + '">'
    //   + '</div>'
    //   + '<div data-id=' + data[i].id + ' class="searchList_content_topology icon-topology" data-name="' + name + '" data-type="' + _type + '" data-pageType="' + data[i].pageType + '" data-nodeId="' + data[i].nodeId + '"></div>'
    //   + '<div class="searchList_content_text">'
    //   + _message
    //   + '</div>'
    //   + '</div>'
    //   + '</div>'
  }
});