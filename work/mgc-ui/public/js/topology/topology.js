$(function () {
  var toolbarShow = {
      show: false
    },
    toolbarRotate = false,
    toolbarfixed = false,
    screenFlag = true, // 拓扑是否为全屏
    gisScreenFlag = true,
    compareSlectedNum,
    translateNum = "386px",
    compareDeatilEditable = false,
    compareRelateEditable = false,
    compareObjFirst = "",
    compareObjSeconed = "";
  window.inMap = false;
  window.mapRight = true; //判断地图时右侧栏是否隐藏
  window.m = false;
  window.t = false;
  var tsign = true;

  localStorage.setItem("topo_flag", true);
  localStorage.setItem("topo_url", location.href);

  //跳转工具页
  $("#options").on('click', function () {
    localStorage.setItem("optionTab", 2);
    location.href = '/option';
  });

  //移动工具条
  $(".hideBars").mousedown(function (event) {
    var ph = $("#topology_relative_network").height();
    var pw = $("#topology_relative_network").width();
    dragBar("#toolsBar", event, "#toolsBar_w", ph, pw);
  });


  //图表检索功能 拖动
  $("#topo_mapMoveBar").mousedown(function (event) {
    var ph = $("#topology_relative_network").height();
    var pw = $("#topology_relative_network").width();
    dragTopoMap("#search_nodes_modalBox", event, "#topo_map_w", ph, pw);
  });
  //图表搜索功能 右上关闭按钮
  $(".close_search_nodes_modalBox_btn").on('click', function () {
    $(".search_nodes_modalBox").hide();
  });

  //工具条的展开和隐藏
  $(".hideBars").on('dblclick', function () {
    var target = $("#toolsBar");
    //判断工具条是横向还是纵向
    if (!toolbarRotate) {
      var _style1 = {
        "height": "265px"
      };
      var _style2 = {
        "height": "26px"
      };
    } else {
      var _style1 = {
        "width": "310px"
      };
      var _style2 = {
        "width": "26px"
      };
    }

    barShow(toolbarShow, target, _style1, _style2);
  });

  /*************************************************************************************/
  //保存工具条的操作
  $("#tool_save").click(function () {
    if (window.links.length === 0 && window.nodes.length === 0) {
      alert('当前工作台数据集为空，不能保存');
      return;
    } else if ($("#dsname_tip h4").attr("data-dataId") || $("#dsname_tip h4").attr("data-versionname")) {
      //用户再次保存
      //显示已保存版本数据集及版本的名字
      $("#save_topoData_modalBox").children("h4").html("<span class='icon-folder-open-o-blue'></span>保存");
      //更新版本名称
      var versionNameArr = $("#dsname_tip h4").attr("data-versionName").split('V');
      if (versionNameArr[1]) {
        versionNameArr[1] = (Number(versionNameArr[1]) + 0.1).toFixed(1);
      } else {
        versionNameArr[0] = versionNameArr[0] + '_';
        versionNameArr[1] = '0.1';
      }
      var versionName = versionNameArr.join('V');
      $("#topo_save_name").val($("#dsname_tip h4").attr("data-datasetName")).attr("readOnly", true);
      $("#topo_save_versionName").val(versionName).attr("readOnly", true);
      // 显示已保存版本标记状态
      if ($(".save_list_box span.save_mark").attr("mark") == 1) {
        $(".save_list_box span.save_mark").removeClass("icon-mark").addClass("icon-mark-yellow");
      } else {
        $(".save_list_box span.save_mark").removeClass("icon-mark-yellow").addClass("icon-mark");
      }
      // 显示保存弹框
      $("#save_topoData_modalBox").show();
      return;
    } else {
      //用户第一次保存
      initSaveAlert();
    }
  });
  //另存为工作条的操作
  $("#tool_saveAs").click(function () {
    if ((window.links.length == 0 && window.nodes.length == 0) || !$("#dsname_tip h4").attr("data-versionName")) {
      $("#tool_saveAs").css('cursor', 'not-allowed');
      return;
    } else {
      $("#save_topoData_modalBox").children("h4").html("<span class='icon-folder-open-o-blue'></span>另存为");
      initSaveAlert();
    }
  });
  // 标记图片状态改变及mark值的改变
  $(".save_list_box span.save_mark").click(function () {
    if ($(this).attr("class") == 'save_mark icon-mark') {
      $(this).attr({
        "class": "save_mark icon-mark-yellow",
        "mark": 1
      });
    } else if ($(this).attr("class") == 'save_mark icon-mark-yellow') {
      $(this).attr({
        "class": 'save_mark icon-mark',
        "mark": 0
      });
    }
  });

  /**
   * 更新数据集快照
   * @param form
   * @param callback
   */
  let updateSnapshoot = function (form) {
    $.ajax({
      url: EPMUI.context.url + '/version/snap',
      type: 'POST',
      processData: false,
      contentType: false,
      data: form,
      dataType: 'json',
      success: function (data) {}
    });
  };

  /**
   * 创建数据集子集
   * @param form 需要提交的表单数据
   * @param callback
   */
  let createSubset = function (form, callback) {
    $.ajax({
      url: EPMUI.context.url + '/version',
      type: 'POST',
      processData: false,
      contentType: false,
      data: form,
      dataType: 'json',
      success: function (data) {
        if (typeof callback === 'function') {
          callback(data);
        }
      }
    });
  };

  /**
   * 创建数据集
   * @param form 需要提交的表单数据
   * @param callback
   */
  let createDataSet = function (form, callback) {
    $.ajax({
      url: EPMUI.context.url + '/dataset',
      type: 'POST',
      processData: false,
      contentType: false,
      data: form,
      dataType: 'json',
      success: function (data) {
        if (typeof callback === 'function') {
          callback(data);
        }
      }
    });
  };

  function isIE() {
    if (window.ActiveXObject || "ActiveXObject" in window || navigator.userAgent.includes("Edge")) return true;
    else return false;
  }
  /**
   * 处理数据集快照
   * @param data
   */
  let handleSnapshoot = function (data) {
    //生成UUID
    let uuid = function () {
      let s = [],
        hexDigits = "0123456789abcdef";
      for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      let uuid = s.join("");
      return uuid;
    };

    let versionId = data.id || '';
    //保存快照部分:获取当前工作集的base64位路径 异步获取
    const target = document.getElementById("topo_network");
    let promise = new Promise((resolve, reject) => {
      if (isIE()) {
        html2canvas(target).then(function (canvas) {
          resolve(canvas.toDataURL());
        });
      } else {
        svgAsPngUri(document.getElementById("topo_svgContent"), {}, function (uri) {
          resolve(uri);
        });
      }
    });
    // 拿到canvas base64码后将数据集的信息传递给后台
    promise.then((dataUrl) => {
      // 由于base64码太长，将base64码转为blob（类二进制格式）
      let n = dataUrl.length,
        ia = new Uint8Array(n);
      while (n--) {
        ia[n] = dataUrl.charCodeAt(n);
      }
      // 将文件转换为blob格式（formdata只能接收file或者blob格式）
      let blob = new Blob([ia], {
        type: "image/png"
      });

      let formdata = new FormData();
      formdata.append('versionId', versionId);
      formdata.append('snap', blob, uuid());
      updateSnapshoot(formdata);
    });
  };

  /**
   * 点击 保存/另存为的保存按钮 响应函数
   */
  let handleSaveDataset = function () {
    //获取保存弹框中的数据
    let name = $("#topo_save_name").val(),
      versionName = $("#topo_save_versionName").val(),
      description = $("#topo_save_describle").val(),
      mark = Number($(".save_list_box span.save_mark").attr("mark")) || 0;
    //获取topo的数据
    let saveDatas = {
      savetnodes: nodes,
      savetlinks: links
    };

    let formdata = new FormData();
    formdata.append("versionName", versionName);
    formdata.append("description", description);
    // formdata.append("snap", new Blob( [], { type: "image/png" } ), uuid());
    formdata.append("mark", mark);
    formdata.append("topoJson", JSON.stringify(saveDatas));

    let saveTitle = $("#save_topoData_modalBox h4").text().trim();
    if (saveTitle === '保存') {
      if ($("#dsname_tip h4").attr("data-datasetId") || localStorage.getItem("datasetId")) {
        //已经保存过的版本再次保存（保存为子集）
        formdata.append("setId", Number($("#dsname_tip h4").attr("data-datasetId") || localStorage.getItem("datasetId")));
        //异步请求保存数据集子集
        createSubset(formdata, save_success);
      } else {
        //第一次保存数据集及版本
        saveFirstAndsaveAs(formdata);
      }
    } else if (saveTitle === '另存为') {
      saveFirstAndsaveAs(formdata);
    }
  };

  $('#save_sure').on('click', handleSaveDataset);

  function save_success(data) {
    $("#save_topoData_modalBox").hide();
    $("#save_topoData_modalBox label").text('*数据集名称不能为空').hide();
    $("#topo_save_name, #topo_save_versionName, #topo_save_describle").css('border', '1px solid #202b33');
    $("#topo_save_describle").val('');
    $(".save_list_box span.save_mark").addClass("icon-mark").removeClass("icon-mark-yellow");
    if (data.code == 200) {
      let result = data.magicube_interface_data || {};
      //更新截图
      handleSnapshoot(result);
      // 更新数据集显示信息
      d3.select('.dataset').remove();
      window.loadDataset();
      // 保存正在打开的数据集信息
      var datasetId = result.dataSetId || $("#dsname_tip h4").attr("data-datasetId");
      var versionId = result.id || undefined;
      $("#dsname_tip h4").attr({
        "data-datasetId": datasetId,
        "data-versionId": versionId,
        "data-datasetName": $("#topo_save_name").val(),
        "data-versionName": $("#topo_save_versionName").val()
      }).text($("#dsname_tip h4").attr("data-datasetName") + '-' + $("#dsname_tip h4").attr("data-versionName"));
      $("#topo_save_name, #topo_save_versionName").val('');
      localStorage.setItem("saveState", true);
      localStorage.setItem("datasetId", datasetId);
      localStorage.setItem("versionId", versionId);
      // 判断是否加载重新打开的数据集
      whetherLoadDataset();
    }
  }

  //关闭保存或另存为弹框
  $("#save_close").on('click', function () {
    //该弹框为另存为弹框时,否则为保存弹框
    if (!$("#dsname_tip h4").attr("data-versionname")) {
      $("#topo_save_name, #topo_save_versionName").val('');
    }
    saveBoxClose();
    $("#dataset_save_tip").hide();
  });

  //第一次保存或另存为弹框数据
  function initSaveAlert() {
    $("#topo_save_name").val("").attr("readOnly", false);
    $("#topo_save_versionName").val("").attr("readOnly", false);
    $(".save_list_box span.save_mark").addClass("icon-mark").removeClass("icon-mark-yellow");
    // 显示保存或另存为弹框
    $("#save_topoData_modalBox").show();
  }

  //第一次保存或另存为操作
  function saveFirstAndsaveAs(formdata) {
    //判断数据集是否为空
    var name = $("#topo_save_name").val(),
      versionName = $("#topo_save_versionName").val();
    if (!name.trim() || !versionName.trim()) {
      !name.trim() ?
        $('#topo_save_name').css('border', '1px solid #e4393c')
        .next().show() : '';

      !versionName.trim() ?
        $('#topo_save_versionName').css('border', '1px solid #e4393c')
        .next().show() : '';
    } else {
      formdata.append("name", name);
      //异步请求创建数据集
      createDataSet(formdata, function (data) {
        if (data.code == 403) {
          $('#topo_save_name').css('border', '1px solid #e4393c')
            .next().text('该数据集已存在，请存为其他名字').show();
        } else {
          save_success(data);
          if ($("#dataset_save_tip").css("display") == 'block') {
            $("#dataset_save_tip").hide();
          }
        }
      });
    }
  }

  //关闭保存弹框
  function saveBoxClose() {
    //going back envying 
    $("#save_topoData_modalBox").hide();
    $("#topo_save_name, #topo_save_versionName, #topo_save_describle").css('border', '1px solid #202b33');
    $("#topo_save_describle").val('');
    $("#save_topoData_modalBox label").text('*数据集名称不能为空').hide();
    $(".save_list_box span.save_mark").addClass("icon-mark").removeClass("icon-mark-yellow");
  }

  /*************************************************************************************/
  //快照
  $("#save_close_imgmodal,#save_sure_img").on('click', function () {
    $("#save_screenShot_modalBox").hide();
  });

  //纵向工具条固定
  $("#tool_fixed").click(function () {
    if (!toolbarfixed) {
      $("#toolsShade").hide();
      toolbarfixed = true;
    } else {
      $("#toolsShade").show();
      toolbarfixed = false;
    }
  });

  //工具条旋转
  $("#tool_rotate").click(function () {
    $(".tipBoxs").hide();
    if (!toolbarRotate) {
      $("#toolsBar").animate({
        "height": 0
      }, 200, 'linear', function () {
        $("#toolsShade").css({
          'width': '46px',
          'height': '57px',
          'line-height': '48px'
        });
        $(".hideBars").css({
          'width': '26px',
          'height': '58px'
        });
        $(".lineTable").css({
          'transform': 'rotate(0deg)'
        })
        $(".tipBoxs").css({
          'top': '22px',
          'left': '0'
        });
        $("#toolsBar .tool_box1").removeClass("tool_box1").addClass("tool_box2");
        $(".tool_rotate_li").css({
          'width': '1px',
          'height': '26px'
        });
        $("#toolsBar").css({
          'transiform': 'rotate(-90deg)',
          'height': '57px',
          'width': '245px'
        }).animate({
          "width": "245px"
        }, 200, 'linear');
      });
      toolbarRotate = true;
    } else {
      $("#toolsBar").animate({
        "width": 0
      }, 200, 'linear', function () {
        $("#toolsShade").css({
          'width': '57px',
          'height': '26px',
          'line-height': '26px'
        });
        $(".hideBars").css({
          'width': '57px',
          'height': '26px'
        });
        $(".lineTable").css({
          'transform': 'rotate(0deg)'
        });
        $(".tipBoxs").css({
          'top': '0',
          'left': '25px'
        });
        $("#toolsBar .tool_box2").removeClass("tool_box2").addClass("tool_box1");
        $(".tool_rotate_li").css({
          'width': '100%',
          'height': '1px'
        });
        $("#toolsBar").css({
          'transiform': 'rotate(0)',
          'height': '255px',
          'width': '57px'
        }).animate({
          "height": "255px"
        }, 200, 'linear');
      });
      toolbarRotate = false;
    }
  });
  //工具条显示隐藏菜单
  $(".tool-parent-right").mouseover(function () {
    let index = $(this).index();
    if (index === 9 || index === 1 || index === 2) {
      $(this).children("div").show();
    } else {
      $(this).children("div").hide();
    }
  });
  $(".tipBoxs").mouseout(function () {
    $(this).hide();
  });

  // 全屏|退出全屏 兼容性方法
  var ScreenUtil = {
    requestFullScreen: function (element) {
      if (element.requestFullScreen) {
        element.requestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozFullScreen) {
        element.mozFullScreen();
      }
    },
    exitFullscreen: function () {
      const element = document;
      if (element.exitFullscreen) {
        element.exitFullscreen();
      } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else if (element.webkitCancelFullScreen) {
        element.webkitCancelFullScreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      }
    },
    getFullScreenElement: function () {
      const fullscreenElement = document.fullscreenElement ||
        document.mozFullScreenElement || document.webkitFullscreenElement;
      return fullscreenElement;
    }
  };

  var FullScreenFunc = {
    setTopoFullScreenFunc: function (ele) {
      ScreenUtil.requestFullScreen($("#topology_relative_network").get(0));
      $(ele).children("span").addClass("icon-quit").removeClass("icon-fullscreen");
      screenFlag = false;
      $("#topology_relative_network").css("bottom", 0);
    },
    exitTopoFullScreenFunc: function (ele) {
      ScreenUtil.exitFullscreen();
      $(ele).children("span").addClass("icon-fullscreen").removeClass("icon-quit");
      screenFlag = true;
      if (ele == '#map_fullscreen') {
        var _width = $("#topology_message").css('width');
        $("#map_usual_tools").css("right", parseInt(_width) + 8 + 'px');
        if (m) {
          $("#map_usual_tools").css("right", '8px');
        }
      }
      //$("#topology_relative_network").css("bottom", "150px");
    }
  };

  $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange',
      function () {
        // ESC退出全屏
        if (ScreenUtil.getFullScreenElement() === null) {
          FullScreenFunc.exitTopoFullScreenFunc('#tool_fullscreen');
        }

        // 更新css属性信息
        setTimeout(function () {
          setTopoStyle(true);
          // 点击全屏图标，自动调整左下角数据集的位置
          adjustPositionForDs();
        }, 0);
      })
    //屏蔽F11
    .on('keydown', function (event) {
      if (event.keyCode === 122) {
        return false; //屏蔽F11
      }
      if (event.keyCode === 27) {
        FullScreenFunc.exitTopoFullScreenFunc('#tool_fullscreen');
        var _width = $("#topology_message").css('width');
        $("#map_usual_tools").css("right", parseInt(_width) + 8 + 'px');
        if (m) {
          $("#map_usual_tools").css("right", '8px');
        }
      }
    });

  //全屏模式&窗口模式
  $("#tool_fullscreen").click(function () {
    if (screenFlag) {
      FullScreenFunc.setTopoFullScreenFunc(this);
    } else {
      FullScreenFunc.exitTopoFullScreenFunc(this);
    }
  });

  //bmap 全屏模式&窗口模式
  $("#map_fullscreen").click(function () {
    if (screenFlag) {
      FullScreenFunc.setTopoFullScreenFunc(this);
      $("#map_usual_tools").css("right", "8px");
      $("#topology_relative_network").css("bottom", 0);
    } else {
      FullScreenFunc.exitTopoFullScreenFunc(this);
      var _width = $("#topology_message").css('width');
      $("#map_usual_tools").css("right", parseInt(_width) + 8 + 'px');
      if (m) {
        $("#map_usual_tools").css("right", '8px');
      }
    }
  });

  //打开过滤器
  $("#tool_filter").on('click', function () {
    $(".topo_network_filter").show();

    // 获取选中的节点, 赋值给筛选框的 筛选范围
    // var $ele = $("g.selected");
    // $ele.length > 0 ?
    //   $('#network_filter_object').val($ele.children('text').text()) :
    //   $('#network_filter_object').val('全部');
    // if ( $ele.length > 0 ) {
    //   $( '#network_filter_object' ).val( $ele.children('text').text() );
    //   $( '#network_filter_object' ).attr( 'user-id', $ele.attr('id') );
    // }else {
    $('#network_filter_object').val('全部');
    // }
    // 获取页面上所有节点并进行处理
    // var filters = globalFuction.getFilterNodesId(),
    //   length = filters.length,
    //   keys = [], ids = [],
    //   i = 0, key, id;
    //
    // for ( ; i < length; i++ ) {
    //   key = filters[ i ].type,
    //   id = filters[ i ].id;
    //   if ( JSON.stringify( keys ).indexOf( key ) === -1 ) {
    //     ids = [];
    //     keys.push( key );
    //     ids.push( id );
    //     totalAllId[ key ] = ids;
    //   }else {
    //     totalAllId[ key ].push( id );
    //   }
    //
    // }
  });

  // // 过滤器，添加按钮事件
  // $('.filter_add_btn').on('click', function() {
  //
  //   var classifyDataListText = $("#network_filter_object").val() + "_" + $(".filter_classify_placeholder:eq(0)").html() + "_" +  $(".filter_classify_placeholder:eq(1)").html() + "_" + $(".filter_classify_placeholder:eq(2)").html() + "_" + $(".select_property_value:eq(0)").val();
  //
  //   var classifyDataList = '<div class="advance_search_detail">'
  //   + '<span class="property_value" data-root="entity" data-object="PERSON" data-type="PERSONAL_NAME" data-flag="string">实体_人_姓名_12</span>'
  //   + '<strong class="classify_delete"></strong></div>'
  //   // alert( $('.property_value').length );
  //   $lastSpan.text( userName + '_' + spanText );
  // });

  //关闭过滤器
  $("#filter_option_cancel").on('click', function () {
    $(".topo_network_filter").hide();
  });

  //开始过滤
  $("#filter_option_ensure").on('click', function () {
    $(".topo_network_filter").hide();
    var startTime = $("#filter_time").val() ? $("#filter_time").val().split('~')[0].trim() : "";
    var endTime = $("#filter_time").val() ? $("#filter_time").val().split('~')[1].trim() : "";
    var propertyArr = [];

    $(".property_value").each(function (index, item) {
      var value = $.trim($(item).text()).split("_");
      if (!!value[3]) {
        var propertyObj = {
          "rootType": $(item).attr("data-root"),
          "objectType": $(item).attr("data-object"),
          "property": $(item).attr("data-type"),
          "dataType": $(item).attr("data-flag"),
          "value": value[3]
        };
        propertyArr.push(propertyObj);
      }
    });

    // 过滤器
    // 关系筛选条件
    var arr = Array.prototype.slice.call($('.relation_tip_active')),
      relationArr = [];
    arr.map((item, index) => {
      relationArr.push(item.getAttribute('data-relationTypeName'));
    });

    // 获取满足关系筛选的节点
    // var filtersId = getFilterLinksId();
    // for (var i = 0; i < filtersId.length; i++) {
    //   if (relationArr.indexOf(filtersId[i].relationName) > -1) {
    //     var obj = {
    //       id: filtersId[i].id,
    //       type: filtersId[i].type
    //     };
    //   }
    //  }

    if (propertyArr && propertyArr.length > 0) {
      // 筛选所需节点

      // 处理节点数据 -> {'type': ['id1', 'id2', ...]}
      var totalAllId = {}; // 拓扑图所有节点 id+type
      var filters = globalFuction.getFilterNodesId(),
        keys = [],
        ids = [],
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
      // 后台筛选节点, 得到需要隐藏的node
      var advanceData = [{
        objectIds: totalAllId,
        startTime: startTime,
        endTime: endTime,
        property: propertyArr
      }];
      var datas = {
        param: JSON.stringify(advanceData)
      };
      $.post(EPMUI.context.url + '/search/filter', datas, function (data) {
        var showNodeIds = data ? JSON.parse(data) : [];

        // 筛选节点及关系
        globalFuction.toolFilter(showNodeIds, relationArr);
      });
    } else {
      // 若无节点过滤， 直接关系过滤
      globalFuction.toolFilter([], relationArr);
    }
    //$(".filter_classify_content").empty();
  });

  //获取cookie
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  };

  //图表和拓扑图之间的切换
  $("#topo_map").on('click', function () {
    if ($(this).html() === "图表") {
      location.href = '/Chartprobe';
      localStorage.setItem("topologyType", "chart");
      localStorage.removeItem("colleNodes"); //移除集合缓存数据
      globalFuction.saveLocalStorage();
    }
  });

  //gis和拓扑之间的切换
  $("#topo_gis").on('click', function () {
    if ($(this).html() === "GIS") {
      localStorage.removeItem("colleNodes"); //移除集合缓存数据
      globalFuction.saveLocalStorage();
      location.href = '/gisPlatform';
    }
  });

  //信息栏tab切换
  $(".message_tab_list").off().on('click', function () {
    var index = $(this).index();
    $(this).addClass("topology_message_tab_active").siblings().removeClass("topology_message_tab_active");
    $(".topo_message").css("display", "none").eq(index).css("display", "block");
  });

  //时间轴显示隐藏
  $("#topology_timeline_taggle").click(function () {
    t = !t;
    if (t) {
      $("#topology_relative_network").css("bottom", 0);
      this.style = "transform: rotate(180deg)";
      $("#topology_relative_timeline").css("height", 0);
      setTopoStyle();
    } else {
      $("#topology_relative_network").css("bottom", "150px");
      this.style = "transform: rotate(0deg)";
      $("#topology_relative_timeline").css("height", "150px");
      setTopoStyle();
    }
  });

  //信息栏显示隐藏
  $("#topology_message_taggle").click(function () {
    var _width = $("#topology_message").css('width');
    m = !m;
    if (m) {
      $("#topology_relative").css("right", 0);
      this.style = "right: 0; transform: rotate(180deg)";
      $("#topology_message").css("transform", "translate(" + _width + ", 0)");

      setTopoStyle();
      if (inMap) {
        $("#topo_map").css("right", 0);
        $("#topo_gis").css("right", 0);
        $("#map_usual_tools").css("right", "8px");
        $(".BMapLib_Drawing_panel").css("right", 12 + 'px');
        $(".map_showHide_panel").css("right", 12 + 'px');
      }
      mapRight = false;
    } else {
      mapRight = true;
      if (inMap) {
        $("#topology_relative").css("right", '0px');
        $(this).css({
          "right": _width,
          "transform": "rotate(0deg)"
        });
        $("#topology_message").css("transform", "translate(0, 0)");

        $(".BMapLib_Drawing_panel").css("right", parseInt(_width) + 12 + 'px');
        $(".map_showHide_panel").css("right", parseInt(_width) + 12 + 'px');
        var _width = $("#topology_message").css('width');
        $("#map_usual_tools").css("right", parseInt(_width) + 8 + 'px');
        //$("#topo_usual_tools").css("right", parseInt(_width) + 8 + 'px');
        $("#topo_map").css("right", parseInt(_width) + 'px');
        $("#topo_gis").css("right", parseInt(_width) + 'px');
        setTopoStyle();

      } else {
        $("#topology_relative").css("right", _width);
        $(this).css({
          "right": _width,
          "transform": "rotate(0deg)"
        });
        $("#topology_message").css("transform", "translate(0, 0)");

        $("#map_usual_tools").css("right", parseInt(_width) + 8 + 'px');
        $(".BMapLib_Drawing_panel").css("right", parseInt(_width) + 12 + 'px');
        $(".map_showHide_panel").css("right", parseInt(_width) + 12 + 'px');
        setTopoStyle();
      }

    }
  });

  //右边信息栏拖拽
  $("#topology_message_drag").mousedown(function (event) {
    var ev = event || window.event;
    var _width = $("#topology_message").width();
    var downX = ev.clientX;

    selectText();

    $(document).bind('mousemove', function (event) {
      var e = event || window.event;
      var moveX = e.clientX;
      if (parseInt(_width) - (moveX - downX) > 500) {
        dragBadMessage(500)
      } else if (parseInt(_width) - (moveX - downX) < 256) {
        dragBadMessage(256);
      } else {
        $("#topology_message").css('width', parseInt(_width) - (moveX - downX) + 'px');
        $("#topology_relative").css("right", parseInt(_width) - (moveX - downX) + 'px');
        $("#topology_message_taggle").css("right", parseInt(_width) - (moveX - downX) + 'px');
        /*
        $("#topo_usual_tools").css("right",parseInt(_width) - (moveX - downX - 8) + 'px');

        $("#thumbnail").css("right",parseInt(_width)- (moveX - downX - 5) + 'px');
        $(".thumbnail_big").css("right",parseInt(_width)- (moveX - downX - 5) + 'px');*/
        if (inMap) {
          $("#topology_relative").css("right", "0px");
          $("#topo_map").css("right", parseInt(_width) - (moveX - downX) + 'px');
          $("#topo_gis").css("right", parseInt(_width) - (moveX - downX) + 'px');
          $("#map_usual_tools").css("right", parseInt(_width) - (moveX - downX - 8) + 'px');
          $(".BMapLib_Drawing_panel").css("right", parseInt(_width) - (moveX - downX - 12) + 'px');
          $(".map_showHide_panel").css("right", parseInt(_width) - (moveX - downX - 12) + 'px');
        }

      }

    });

    $(document).bind('mouseup', function () {
      $(document).unbind();
      setTopoStyle();
      return false;
    });
  });

  //拖拽达到边界
  function dragBadMessage(number) {
    $("#topology_message").css("width", number);
    $("#topology_relative").css("right", number);
    /*
    $("#topo_usual_tools").css("right",number + 8);

    $("#thumbnail").css("right",number+5);
    $(".thumbnail_big").css("right",number+5);*/
    if (inMap) {
      $("#topology_relative").css("right", "0px");
      $("#topo_map").css("right", number);
      $("#topo_gis").css("right", number);
      $("#map_usual_tools").css("right", number + 8);
    }
    $("#topology_message_taggle").css("right", number);
    setTopoStyle();
    return false;
  }
  //碰撞比对显示
  function showMessageBox(index) {
    if (index === 0) {
      $(".obj_message").show();
    } else {
      $("#topo_creat_link_modalBox").show();
    }
  }
  //关闭比较
  function hideMessageBox(index) {
    $("#topology_main").css('filter', 'blur(0)');
    $("#compare_tools").css('filter', 'blur(0)');
    if (index === 0) {
      $(".obj_message").hide();
    } else {
      $("#topo_creat_link_modalBox").hide();
    }
  }
  //设置对比信息
  window.setCompareData = function (id1, node1, id2, node2, type) {
    $.get(EPMUI.context.url + '/object/compareInformation?idOne=' + id1 + '&nodeIdOne=' + node1 + '&idTwo=' + id2 + '&nodeIdTwo=' + node2 + '&type=' + type, function (data) {
      let dataSource = JSON.parse(data);
      if (dataSource.code === 200) {
        compareSlectedNum = "";
        showMessageBox(0);
        let data = dataSource.magicube_interface_data;
        compareObjFirst = data.one.displayName;
        compareObjSeconed = data.two.displayName;
        var dataSourceLeft = data.one.properties;
        var dataSourceRight = data.two.properties;
        $("#compare_selected_border").css("display", "none");
        var content = '<table id="topo_compare_detail">' +
          '<thead>' +
          '<tr>' +
          '<th class="compare_detail_left compare_obj_name" colspan="2" data-id="' + id1 + '" data-nodeId="' + node1 + '" data-type="' + type + '">' + compareObjFirst + '</th>' +
          '<th class="compare_detail_right compare_obj_name" colspan="2" data-id="' + id2 + '" data-nodeId="' + node2 + '" data-type="' + type + '">' + compareObjSeconed + '</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody >'
          // + compareDetail(dataSourceLeft, dataSourceRight)
          +
          '</tbody>' +
          '</table>';
        $("#topo_compare_content").html(content);
        $("#topo_compare_detail tbody").mCustomScrollbar("destroy");
        $("#topo_compare_detail tbody").html(compareDetail(dataSourceLeft, dataSourceRight));
        $("#topo_compare_detail tbody").mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true
        });

        if (data.trail.length != 0) {
          // 轨迹对比绑定下拉收起事件
          compare_timeline();
          // 轨迹对比绑定传值
          $("#obj_bottom").data("trajectory_data", data.trail);
          // 轨迹对比添加对比实物信息
          $("#trajectory_operate").after($('<table id="topo_compare_trajectory">' +
            '<thead>' +
            '<tr>' +
            '<th class="compare_detail_left compare_obj_name" colspan="2" data-id="' + id1 + '" data-nodeId="' + node1 + '" data-type="' + type + '">' + compareObjFirst + '</th>' +
            '<th class="compare_detail_right compare_obj_name" colspan="2" data-id="' + id2 + '" data-nodeId="' + node2 + '" data-type="' + type + '">' + compareObjSeconed + '</th>' +
            '</tr>' +
            '</thead>' +
            '</table>'));
          $(".trajectory_operate_main_content").mCustomScrollbar("destroy");
          $(".trajectory_operate_main_content").append(setCompareTrajectory(data.trail));
          $(".trajectory_operate_main_content").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
          });
          const trajectoryItemLeft = $('.trajectory_item_onleft').find('.trajectory_item');
          const trajectoryItemRight = $('.trajectory_item_onright').find('.trajectory_item');
          const selectHeight = (compareNode,node) => {
            compareNode.each((d,i) => {
              if (!$(i).children()[0]) {
                const height = $(node).find('.trajectory_item').eq(d).height();
                $(i).css({height:height});
              }
            })
          }
          selectHeight(trajectoryItemLeft,'.trajectory_item_onright');
          selectHeight(trajectoryItemRight,'.trajectory_item_onleft');
          // 轨迹对比按条件筛选事件绑定
          $("#trajectory_operate>.search_sure").on('click', function () {
            let time = $("#trajectory_time").text();
            let type = $("#trajectory_type").text();
            let newData = [];
            // 轨迹对比筛选条件：时间、类别
            if (time !== '全部' && time !== '请选择...' && type !== '全部' && type !== '请选择...') {
              newData = trajectoryTimeFilter(data.trail, time);
              newData = trajectoryTypeFilter(newData, type);
            } else if ((time === '全部' || time === '请选择...') && type !== '全部' && type !== '请选择...') {
              // 轨迹对比筛选条件：类别
              newData = trajectoryTypeFilter(data.trail, type);
            } else if (time !== '全部' && time !== '请选择...' && (type === '全部' || type === '请选择...')) {
              // 轨迹对比筛选条件：时间
              newData = trajectoryTimeFilter(data.trail, time);
            } else {
              newData = data.trail;
            }
            $(".trajectory_operate_main_content .trajectory_content_box").remove();
            $(".trajectory_operate_main_content").mCustomScrollbar("destroy");
            $(".trajectory_operate_main_content").append(setCompareTrajectory(newData));
            $(".trajectory_operate_main_content").mCustomScrollbar({
              theme: Magicube.scrollbarTheme,
              autoHideScrollbar: true
            });
          });
        } else {
          $(".trajectory_operate_main_content").html("<tr id='trajectory_nodata'><td>暂无轨迹信息</td></tr>");
        }
        $("#compare_shade").hide();
        locationEditCompareDetail();
        deleteNode(id1, node1, id2, node2);
      } else {
        $("#page_alert").show();
        $("#page_alert_content").html('没有对比信息');
      }
    })
  };
  //比较表格中的详细
  function compareDetail(data1, data2) {
    var content = "";
    var len = data1.length;
    for (var i = 0; i < len; i++) {
      var str1 = "",
          str2 = "";
      var contentLists1 = !!data1[i].svalue ? data1[i].svalue.split(";") : [""];
      var contentLists2 = !!data2[i].svalue ? data2[i].svalue.split(";") : [""];
      var length = contentLists1.length;

      for (var j = 0; j < length; j++) {
        var propertyValue1 = contentLists1[j] ? contentLists1[j] : " ",
            propertyValue2 = contentLists2[j] ? contentLists2[j] : " ";
        if (contentLists1[j] !== contentLists2[j]) {
          str1 += '<div class="orangered_font">' + propertyValue1 + '</div>';
          str2 += '<div class="orangered_font">' + propertyValue2 + '</div>';
        } else {
          str1 += '<div>' + propertyValue1 + '</div>';
          str2 += '<div>' + propertyValue2 + '</div>';
        }
      }

      content += '<tr>' +
        '<th class="compare_obj_key compare_detail_left">' + data1[i].displayName + '</th>' +
        '<td class="compare_detail_left" data-type="' + data1[i].propertyName + '">' + str1 + '</td>' +
        '<th class="compare_obj_key compare_detail_right">' + data2[i].displayName + '</th>' +
        '<td class="compare_detail_right" data-type="' + data2[i].propertyName + '">' + str2 + '</td>' +
        '</tr>';
    }

    return content;
  }
  	//数组对象由大到小排序
	function compare(prop) {
		return function (a, b) {
			const prop1 = a[prop];
			const prop2 = b[prop];
			return prop1 > prop2 ? 1 : -1;
		}
	}
  //创建轨迹对比信息
  function setCompareTrajectory(data) {
    const leftNodeId = $(".compare_detail_left").attr("data-nodeId");
    const rightNodeId = $(".compare_detail_right").attr("data-nodeId");
    const assigenNode = [];
    //下面对数据进行对齐
    for (let i = 0; i < data.length; i++) {
      const D = data[i].value;
      const compareMap = {};
      compareMap.year = data[i].year;
      compareMap.leftNode = [];
      compareMap.rightNode = [];
      compareMap.allNodeId = [];
      for (let j = 0; j < D.length; j++) {
        const dV = D[j];
        dV.sortId = dV.display + dV.time;//用来排序
        if(dV.owner === leftNodeId){
          compareMap.leftNode.push(dV);
        } else if(dV.owner === rightNodeId){
          compareMap.rightNode.push(dV);
        }
      }
      compareMap.leftNode.sort(compare('sortId'));
      compareMap.rightNode.sort(compare('sortId'));
      compareMap.leftAndRightNode = compareMap.leftNode.concat(compareMap.rightNode);
      assigenNode.push(compareMap);
    }
    for (let i = 0; i < assigenNode.length; i++) {
      const left = assigenNode[i].leftNode;
      const right = assigenNode[i].rightNode;
      const leftAndright = assigenNode[i].leftAndRightNode.sort(compare('sortId'));
      const leftId = [];
      const rightId = [];
      for (let j = 0; j < left.length; j++) {
        leftId.push(left[j].sortId);
      }
      for (let j = 0; j < right.length; j++) {
        rightId.push(right[j].sortId);
      }
      for (let j = 0; j < leftAndright.length; j++) {
        if (!leftId.includes(leftAndright[j].sortId)) {
          const space = JSON.parse(JSON.stringify(leftAndright[j]));
          space.owner = leftNodeId;
          space.value = [];
          left.push(space);
        }
        if (!rightId.includes(leftAndright[j].sortId)) {
          const space = JSON.parse(JSON.stringify(leftAndright[j]));
          space.owner = rightNodeId;
          space.value = [];
          right.push(space);
        }
      }
      assigenNode[i].leftNode.sort(compare('sortId'));
      assigenNode[i].rightNode.sort(compare('sortId'));
      delete assigenNode[i].leftAndRightNode;
    }
    var contents = "",
        yearArr = [],
        typeArr = [];
    for (let i = 0, len = assigenNode.length; i < len; i++) {
      let contentLeft = "";
      let contentRight = "";
      yearArr.push(assigenNode[i].year);
      //左边的
      for (let j = 0, leng = assigenNode[i].leftNode.length; j < leng; j++) {
        let datasLeft = assigenNode[i].leftNode[j],
            datasRight = assigenNode[i].rightNode[j],
            contentL = '',
            contentR = '',
            psL = '',
            psR = '',
            triangle_border = 'triangle_border',
            borderColorLeft = "'trajectory_item_left trajectory_border_color'",
            borderColorRight = "'trajectory_item_right trajectory_border_color'";
        if ((datasLeft.sortId === datasRight.sortId) && (datasLeft.value.length > 0 && datasRight.value.length > 0)) {
            borderColorLeft = "'trajectory_item_left trajectory_border_color_selected'";
            borderColorRight = "'trajectory_item_right trajectory_border_color_selected'";
            triangle_border = 'triangle_border_selected';
        }
        const lenL = datasLeft.value.length;
        const lenR = datasRight.value.length;
        for (let k = 0; k < lenL; k++) {
          let dl = datasLeft.value[k];
          let valueL = dl.value ? dl.value : '';
          psL += `<p>${dl.display}：${valueL}</p>`;
        }
        for (let l = 0; l < lenR; l++) {
          let dr = datasRight.value[l];
          let valueR = dr.value ? dr.value : '';
          psR += `<p>${dr.display}：${valueR}</p>`;
        }
        typeArr.push(datasLeft.display,datasRight.display);
        // 根据后台返回type字段，确定图标
        let iconL = '',
            iconR = '';
        //很具type不同，的到不同的图标
        const getIcons = (type) => {
          let icons = '';
          switch (type) {
            case 'HUOCHE_CHUXING_RELATIONSHIP':
              icons = '<div class="trajectory_icon icon-train"></div>';
              break;
            case 'FEIJI_CHUXING_RELATIONSHIP':
              icons = '<div class="trajectory_icon icon-plane"></div>';
              break;
            case 'SHANGWANG_REN_EVENT_RELATIONSHIP':
              icons = '<div class="trajectory_icon icon-police-surface"></div>';
              break;
            case 'ZHUSU_REN_EVENT_RELATIONSHIP':
              icons = '<div class="trajectory_icon icon-hotel"></div>';
              break;
            case 'TONGHUA_PERSON_EVENT_RELATIONSHIP':
              icons = '<div class="trajectory_icon icon-phone"><span class="path1"></span><span class="path2"></span></div>';
              break;
            case 'QICHE_CHUXING_RELATIONSHIP':
              icons = '<div class="trajectory_icon icon-car"></div>';
              break;
            default:
              icons = '<div class="trajectory_icon icon-event"></div>';
              break;
          }
          return icons;
        }
        iconL = getIcons(datasLeft.type);
        iconR = getIcons(datasRight.type);
        if (datasLeft.value.length == 0) {
            contentL = '';
        } else {
          contentL = `<div class=trajectory_item_box_left>
                        <div class=${borderColorLeft}>
                            <div class=${triangle_border}></div>
                            <div class=dot_border></div>
                            <div class=trajectory_item_content>
                              <div class=trajectory_item_text>${psL}</div>
                              ${iconL}
                            </div>
                        </div>
                      </div>`;
        }
        contentLeft += `<div class="trajectory_item clearFloat">
                          ${contentL}
                        </div>`;
        if (datasRight.value.length == 0) {
          contentR = '';
        } else {
          contentR = `<div class=trajectory_item_box_right>
                        <div class=${borderColorRight}>
                            <div class=${triangle_border}></div>
                            <div class=dot_border></div>
                            <div class=trajectory_item_content>
                              ${iconR}
                              <div class=trajectory_item_text>${psR}</div>  
                            </div>
                        </div>
                      </div>`;
        }
        contentRight += `<div class="trajectory_item clearFloat">
                          ${contentR}
                        </div>`;
      }
      contents += `<div class=trajectory_content_box>
                      <div class="trajectory_content clearFloat">
                          <div class=trajectory_time><p>${data[i].year}</p></div>
                          <div class=trajectory_item_onleft>
                            ${contentLeft}
                          </div>
                          <div class=trajectory_item_onright>
                            ${contentRight}
                          </div>
                      </div>
                  </div>`;
    }
    trajectoryTimeFilterData(yearArr);
    trajectoryTypeFilterData([...new Set(typeArr)]);
    return contents;
  }
  //轨迹对比按时间过滤传值
  function trajectoryTimeFilterData(arr) {
    $("#trajectory_time").data({timeFilter:arr});
  }
  //轨迹对比按时间过滤传值
  function trajectoryTypeFilterData(arr) {
    $("#trajectory_type").data({typeFilter: arr});
  }
  //轨迹对比按时间过滤
  function trajectoryTimeFilter(arr, time) {
    let newArr = [];
    for (let i = 0, max = arr.length; i < max; i++) {
      if (arr[i].year === time) {
        newArr.push(arr[i]);
        break;
      };
    }
    return newArr;
  }
  // 轨迹对比按类型对比
  function trajectoryTypeFilter(arr, type) {
    let data = arr[0].value;
    let newArr = [];
    for (let i = 0, max = data.length; i < max; i++) {
      if (data[i].display === type) {
        newArr.push(data[i]);
      }
    }
    return [{
      year: arr[0].year,
      value: newArr
    }];
  }
  //点击选中对应的detail表格
  function locationEditCompareDetail() {
    $(".compare_detail_left").off().click(function () {
      if (compareDeatilEditable) {
        return false;
      }
      compareSlectedNum = 0;
      $("#compare_selected_border").css({
        "display": "block",
        "transform": "translateX(-1px)",
        "transition": "all 0.2s linear"
      });
    });

    $(".compare_detail_right").off().click(function () {
      if (compareDeatilEditable) {
        return false;
      }
      compareSlectedNum = 1;
      $("#compare_selected_border").css({
        "display": "block",
        "transform": "translateX(" + translateNum + ")",
        "transition": "all 0.2s linear"
      });
    });
  }
  //编辑信息比较的数据
  $("#compare_detail_edit").on('click', function () {
    var objectId, objectType;

    if (!compareDeatilEditable) {
      if (compareSlectedNum !== 0 && compareSlectedNum !== 1) { //没有选中不让编辑
        showAlert("提示", "请选择要编辑的对象", "#ffc000");
        return false;
      }
      $("#compare_selected_border").css({
        "transform": "translateX(-400px)",
        "transition": "all 0.2s linear"
      });
      $(this).addClass("icon-save").removeClass("icon-edit-blue");
      if (compareSlectedNum === 0) {
        $("#topo_compare_detail tr").each(function (index, item) {
          $(item).children("td:eq(0)").attr("contentEditable", true).addClass("compare_detail_edit");
          // $(".orangered_font").removeClass("orangered_font").addClass("border_none");
        });
      } else {
        $("#topo_compare_detail tr").each(function (index, item) {
          $(item).children("td:eq(1)").attr("contentEditable", true).addClass("compare_detail_edit");
          // $(".orangered_font").removeClass("orangered_font").addClass("border_none");
        });
      }
      compareDeatilEditable = true;
    } else {
      $(this).removeClass("icon-save").addClass("icon-edit-blue");
      compareDeatilEditable = false;
      if (compareSlectedNum === 0) {
        objectId = $(".compare_obj_name").eq(0).attr("data-id");
        objectType = $(".compare_obj_name").eq(0).attr("data-type");

        $("#compare_selected_border").css({
          "transform": "translateX(0px)",
          "transition": "all 0.2s linear"
        });
        // $(".border_none").removeClass("border_none").addClass("orangered_border");
      } else {
        objectId = $(".compare_obj_name").eq(1).attr("data-id");
        objectType = $(".compare_obj_name").eq(1).attr("data-type");

        $("#compare_selected_border").css({
          "transform": "translateX(" + translateNum + ")",
          "transition": "all 0.2s linear"
        });
        // $(".border_none").removeClass("border_none").addClass("orangered_border");
      }

      saveEditeContent(objectId, objectType);

      $(".compare_detail_edit").attr("contentEditable", false).removeClass("compare_detail_edit");
    }
  });

  //保存编辑数据
  function saveEditeContent(objectId, objectType) {
    var editObject = {
        modify: [],
        id: objectId,
        type: objectType
    };
    $(".compare_detail_edit").each(function (index, item) {
      var contentArr = [];
      $(item).children("div").each(function (_index, _item) {
        contentArr.push($(_item).html());
      });

      editObject.modify.push({
        propertyName: $(item).attr("data-type"),
        value: contentArr.join(";")
      })
    });

    $.post(EPMUI.context.url + '/object/detailInformation', {
      modifyJson: JSON.stringify(editObject)
    }, function (data) {
      if (!data) {
        return false;
      }
      var datas = JSON.parse(data);

      if (parseInt(datas.code) === 200) {
        showAlert("提示!", datas.message, "#33d0ff");
      } else {
        showAlert("提示!", datas.message, "#ffc000");
      }
    })
  }

  //轨迹对比下拉收起
  function compare_timeline() {
    $(".obj_title_box").unbind('click').on('click', 'span', function () {
      if ($(this).hasClass("icon-angle-up")) {
        $(this).removeClass("icon-angle-up").addClass("icon-chevron-down-blue");
        $(".obj_title_box:eq(0)").hide();
        $("#topo_detaiCompare_opt").hide();
        $("#topo_compare_box").hide();
        $("#obj_bottom").css({
          'top': '35px'
        });
        $(".trajectory_operate_main_content").css({
          'height': '425px'
        });
      } else {
        $(this).removeClass("icon-chevron-down-blue").addClass("icon-angle-up");
        $(".obj_title_box:eq(0)").show();
        $("#topo_detaiCompare_opt").show();
        $("#topo_compare_box").show();
        $("#obj_bottom").css({
          'top': '340px'
        });
        $(".trajectory_operate_main_content").css({
          'height': '120px'
        });
      }
    });
  }

  //删除节点
  function deleteNode(id1, nodeId1, id2, nodeId2) {

    $("#compare_detail_delete").click(function () {
      if (compareSlectedNum === 0) {
        var deleteObjectId = id1;
        var deleteObjectNodeId = nodeId1;
      } else if (compareSlectedNum === 1) {
        var deleteObjectId = id2;
        var deleteObjectNodeId = nodeId2;
      } else {
        showAlert("提示!", "请选择删除对象", "#ffc000");
        return false;
      }

      $("#delete_alert").show();

      //再次确认删除
      $("#delete_ensure_true").click(function () {
        $.get(EPMUI.context.url + '/node?nodeId=' + deleteObjectNodeId + '&objectId=' + deleteObjectId, function (data) {
          if (!data) {
            return false;
          }
          var datas = JSON.parse(data);

          if (datas.code === 200) {
            showAlert("提示!", datas.message, "#33d0ff");
            $("#obj_message").hide();
            $("#delete_alert").hide();

            deleteNodesLinks([deleteObjectId]);
          }
        });
      });

      //取消删除
      $("#delete_ensure_false").click(function () {
        $("#delete_alert").hide();
      });

    });
  }

  //编辑对比信息关系的表
  $("#compare_relate_edit").on('click', function () {
    if (!compareRelateEditable) {
      $(this).addClass("icon-save").removeClass("icon-edit-blue");
      $("#obj_mes tbody tr").each(function (index, item) {
        $(item).children("td").each(function (_index, _item) {
          if (_index !== 0 && _index !== 1) {
            $(_item).addClass("compare_relate_edit").attr("contentEditable", true);
          }
        });
      });
    } else {
      $(this).removeClass("icon-save").addClass("icon-edit-blue");
      $(".compare_relate_edit").attr("contentEditable", false).removeClass("compare_relate_edit");
    }
    compareRelateEditable = !compareRelateEditable;
  });

  //信息比对modal中追加关系
  $("#compare_relate_add").on('click', function () {
    var str = `<tr><td>${compareObjFirst}</td><td>${compareObjSeconed}</td><td></td><td></td><td></td></tr>`;
    $("#obj_mes tbody").append(str);
    if (compareRelateEditable) {
      $("#compare_relate_edit").removeClass("icon-save").addClass("icon-edit-blue");
      $(".compare_relate_edit").attr("contentEditable", false).removeClass("compare_relate_edit");
      compareRelateEditable = false;
    }
  });

  //创建连接相关操作
  makelinkOptions();

  function makelinkOptions() {
    //   碰撞比对菜单的隐藏
    $("#topo_compare_cancel").click(function () {
      //   将轨迹对比恢复初始样式
      $(".obj_title_box>span").attr('class', 'icon-angle-up');
      $(".obj_title_box:eq(0)").show();
      $("#topo_detaiCompare_opt").show();
      $("#topo_compare_box").show();
      $("#obj_bottom").css({
        'top': '340px',
        'height': '135px'
      });
      //   移除轨迹对比相关内容节点
      $("#obj_bottom .trajectory_content_box").remove();
      $("#obj_bottom #topo_compare_trajectory").remove();
      $("#trajectory_nodata").remove();
      //   轨迹比对过滤条件初始化
      $("#trajectory_time").text("请选择...");
      $("#trajectory_type").text("请选择...");
      //   关闭弹框
      hideMessageBox(0);
    });

    //关闭创建连接
    $("#makelink_cancel").on("click", function () {
      hideMessageBox(1);

      $(".makelink_pro").removeClass("makelink_pro_active");
      $("#makelink_description").html("");
    });

    $(".makelink_pro").on('click', function () {
      $(this).addClass("makelink_pro_active").siblings().removeClass("makelink_pro_active");
    });
  }

  //创建关系
  window.makeNodesRelate = function (newLink, nameOne, nameTwo) {
    let sourceName;
    let targetName;
    if (newLink) {
      sourceName = newLink.target.name;
      targetName = newLink.source.name;
    } else {
      sourceName = nameTwo;
      targetName = nameOne;
    }
    showMessageBox(1);
    $("#relate_name_one").html(sourceName);
    $("#relate_name_two").html(targetName);
    //交换方向
    $("#relate_direction").off().bind('click', function () {
      if ($(this).attr("data-flag") === "true") {
        $(this).attr("data-flag", "false");
        $("#relate_name_one").html(targetName);
        $("#relate_name_two").html(sourceName);
      } else {
        $(this).attr("data-flag", "true");
        $("#relate_name_one").html(sourceName);
        $("#relate_name_two").html(targetName);
      }
    });

    $("#makelink_ensure").off().bind('click', function () {
      //关系类型必须填一个，第一个关系名称必填
      if ($("#make_relate_type").attr("data-type") === "null") {
        $("#div_make_relate_type").addClass('selectParent_elemnt_box_selset');
        return;
      }
      if ($("#make_relate_name").attr("data-type") === "null") {
        $("#div_make_relate_name").addClass('selectParent_elemnt_box_selset');
        return;
      }
      //修改关系操作
      if ($("#topo_creat_link_modalBox").attr("data-type") !== "null") {
        var patchData = new Object();
        var relationTypeName = $("#make_relate_name").attr("data-type");
        var relationTime = $("#relate_time").val();
        var relationMedium = $("#relate_medium").val();
        patchData.modify = [{
          "propertyName": "RELATIONSHIP_TIME",
          "value": relationTime
        }, {
          "propertyName": "RELATIONSHIP_MEDIUM",
          "value": relationMedium
        }];
        patchData.relationId = $("#topo_creat_link_modalBox").attr("data-type");
        patchData.flag = true;
        patchData.type = relationTypeName;
        $.ajax({
          url: EPMUI.context.url + '/relation',
          type: 'patch',
          data: {
            "modifyJson": JSON.stringify(patchData)
          },
          dataType: 'json',
          success: function (data) {
            if (data.code === 200) {
              var $id = $("#topo_creat_link_modalBox").attr("data-type");
              let html = $('#make_relate_name').html();
              d3.selectAll("g.gtext").filter(function (d) {
                return d.relationId === $id;
              }).select("textPath").text(html); //修改关系名称
              for (var i = 0; i < links.length; i++) { //更改对应关系数据的id和关系名称
                if ($id.indexOf(links[i].relationId) > -1) {
                  links[i].relationId = data.magicube_interface_data.toString();
                  links[i].relationTypeName = html;
                  globalFuction.drawTopoMap(); //更新布局
                }
              }
              showAlert("提示!", "关系修改成功", "#33c5f4");
              $("#relate_time").val("");
              $("#relate_medium").val("");
              $(".makelink_box h5").eq(0).html("请选择创建连接的关系类型：");
              $("#topo_creat_link_modalBox,#topo_shade").hide();
            } else {
              showAlert("提示!", "关系修改失败", "#ffc000");
            }
          }
        });
      } else { //创建关系操作
        const flag = $("#relate_direction").attr("data-flag") !== "true";
        let linkDirect = flag ? '-20' : '20';
        const themLinks = [];
        for (let i = 0; i < links.length; i++) {
          if ((links[i].source.nodeId == newLink.source.nodeId && links[i].target.nodeId == newLink.target.nodeId) || (links[i].target.nodeId == newLink.source.nodeId && links[i].source.nodeId == newLink.target.nodeId)) {
            themLinks.push(links[i]);
            links.splice(i, 1);
            i--;
          }
        }
        globalFuction.drawTopoMap();
        const oldLinks = []; //保存创建关系的两个点之间已经存在的关系
        themLinks.map((d, i) => {
          delete d.index;
          delete d.linknum;
          delete d.size;
          d.id = d.target.id;
          d.source = d.source.id;
          d.type = d.target.type;
          d.objectType = d.target.objectType;
          d.quantity = d.target.quantity;
          d.page_type = d.target.page_type;
          d.nodeId = d.target.nodeId;
          d.nodeType = d.target.nodeType;
          d.markIcon = d.target.markIcons;
          d.mark = d.target.stroke == "#33d0ff" ? false : true;
          d.target = d.target.name;
          oldLinks.push(d);
        });
        const postData = {
          idOne: newLink.source.nodeId,
          idTwo: newLink.target.nodeId
        };
        const postProData = {};
        const relationTypeNameTwo = $("#make_relate_name").attr("data-type");
        const relationTypeNameOneChina = $("#make_relate_type").html();
        const relationTypeNameTwoChina = $("#make_relate_name").html();
        postProData[$("#relate_time").attr("data-type")] = $("#relate_time").val();
        postProData[$("#relate_medium").attr("data-type")] = $("#relate_medium").val();
        //二级关系和一级关系选择，二级关系没有就选一级关系
        postData.relationType = relationTypeNameTwo;
        postData.property = JSON.stringify(postProData);
        $.post(EPMUI.context.url + '/relation', postData, function (data) {
          if (!data) {
            return;
          }
          const datas = JSON.parse(data);
          hideMessageBox(1);
          //TODO:这里要保持和工作台的links数据保持一致，否则会报错
          if (parseInt(datas.code) === 200) {
            const link = {
              tag: linkDirect,
              id: newLink.source.id,
              nodeId: newLink.source.nodeId,
              relationId: datas.magicube_interface_data._id,
              relationTypeName: relationTypeNameTwoChina,
              relationParentType: relationTypeNameOneChina,
              mark: false,
              nodeType: 0,
              source: newLink.target.id,
              target: newLink.source.name,
              markIcons: [],
              quantity: 0,
              type: newLink.source.type,
              objectType: newLink.source.objectType,
              page_type: newLink.source.page_type
            }
            oldLinks.push(link);
            globalFuction.creatNewLink(oldLinks);
            showAlert("提示!", "关系创建成功", "#33c5f4");
            $("#relate_time").val("");
            $("#relate_medium").val("");
            $("#topo_creat_link_modalBox").hide();
          } else {
            showAlert("提示!", "关系创建失败", "#ffc000");
          }
        });
      }
      return;
    });

  };

  // 设置topo关系网的大小
  window.setTopoStyle = function (flag) {
    if (flag) {
      $(".topo-console").attr("width", screen.width);
      $(".topo-console").attr("height", screen.height);
    } else {
      $(".topo-console").attr("width", $("#topology_relative").width());
      $(".topo-console").attr("height", $("#topology_relative").height());
    }

  };

});
/*************************************************************************************/

//工具条的拖拽
function dragBar(id1, event, id2, ph, pw) {
  var ev = event || window.event;
  var x = ev.clientX;
  var y = ev.clientY;
  var target1 = $(id1);
  var target2 = $(id2);
  var _top = target1.get(0).offsetTop;
  var _left = target1.get(0).offsetLeft;
  var w = parseInt(target1.css('width'));
  var h = parseInt(target1.css('height'));

  selectText();

  $(document).bind("mousemove", function (event) {
    var _ev = event || window.event;
    var mx = _ev.clientX - x;
    var my = _ev.clientY - y;
    var r = _left + mx + parseInt(target1.css('width'));
    var b = _top + my + parseInt(target1.css('height'));
    if (r > pw) {
      target1.css("left", pw - w);
      target2.css("left", pw - w);
    } else if (_left + mx < 0) {
      target1.css("left", 0);
      target2.css("left", 0);
    } else if (b > ph) {
      target1.css("top", ph - h);
      target2.css("top", ph - h);
    } else if (_top + my < 0) {
      target1.css("top", 0);
      target2.css("top", 0);
    } else {
      target1.css({
        "top": _top + my,
        "left": _left + mx
      });
      target2.css({
        "top": _top + my,
        "left": _left + mx
      });
    }
  });

  $(document).bind('mouseup', function () {
    $(this).unbind();
    selectText();
  });

}

//图表检索功能 的拖拽
function dragTopoMap(id1, event, id2, ph, pw) {
  var ev = event || window.event;
  var x = ev.clientX; //736
  var y = ev.clientY; //116
  var target1 = $(id1);
  var target2 = $(id2);
  var _top = target1.get(0).offsetTop;
  var _left = target1.get(0).offsetLeft;
  var w = parseInt(target1.css('width'));
  var h = parseInt(target1.css('height'));

  selectText();

  $(document).bind("mousemove", function (event) {
    var _ev = event || window.event;
    var mx = _ev.clientX - x; //-36
    var my = _ev.clientY - y; //14
    var r = _left + mx + parseInt(target1.css('width')); //720+ -36+365=1049
    var b = _top + my + parseInt(target1.css('height')); // 55+14+100=169
    if (r > pw) { //1049--1070
      target1.css("left", pw - w + 274);
      target2.css("left", pw - w + 274);
    } else if (_left + mx < 0) { //720+ -36
      target1.css("left", 274);
      target2.css("left", 274);
    } else if (b > ph) { //169----750
      target1.css("top", ph - h + 215);
      target2.css("top", ph - h + 215);
    } else if (_top + my < 0) { //55+14
      target1.css("top", +215);
      target2.css("top", +215);
    } else {
      target1.css({
        "top": _top + my + 215,
        "left": _left + mx + 274
      });
      target2.css({
        "top": _top + my + 215,
        "left": _left + mx + 274
      });
    }
  });

  $(document).bind('mouseup', function () {
    $(this).unbind();
    selectText();
  });

}

//工具条的显示隐藏
function barShow(flagShow, target, _style1, _style2) {
  if (flagShow.show === false) {
    target.css("overflow", "visible").animate(_style1, 300, "linear");
    flagShow.show = true;
    $(".lineTable").removeClass("icon-toolbox").addClass("icon-toolbox-blue");
  } else {
    target.css("overflow", "hidden").animate(_style2, 300, "linear");
    flagShow.show = false;
    $(".lineTable").removeClass("icon-toolbox-blue").addClass("icon-toolbox");
  }
}

//禁止文字选择
function selectText() {
  "getSelection" in window
    ?
    window.getSelection().removeAllRanges() :
    document.selection.empty();
}