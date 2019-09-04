$(function() {
  var datasetImg = {center: 32, centerScale: 80, around: 22, offset: 20},
      heightScreen = document.body.clientHeight - $("#header").height() - $("#topology_timeline").height(),
      rectWidth = 180,
      rectHeight = 180,
      xRange = rectWidth - (datasetImg.centerScale/2 + datasetImg.around/2 + 20) + datasetImg.around/2,
      yRange = rectHeight - ( datasetImg.centerScale/2 + datasetImg.around/2 + 20 ) + datasetImg.around/2,
      dsLocation = {
        beforeX: datasetImg.around,
        beforeY: heightScreen - datasetImg.around - 24,
        afterX: datasetImg.centerScale/2 + datasetImg.around/2 + 20,
        afterY: heightScreen - datasetImg.centerScale/2 - datasetImg.around/2 - 20
      },
      degree = 360,
      dataRadius = 40;
  var i = 0,
      duration = 750,
      selectedNode = null,
      pathPrefix = 'image/dataset/',
      timelineShow = true,
      fullScreen = false,
      dsOffset = 0,
      dataset_show = {},
      svg, svgDataset, svgRect, ghost,
      root, nodeSet, datasetAll;

  var PUSH_TYPE_USER = 'user',
      PUSH_TYPE_GROUP = 'group',
      groups;

  var cluster = d3.layout.cluster()
      .size([degree, dataRadius])
      .separation(function (a, b) {
        return (a.parent == b.parent ? 1 : 2) / a.depth;
      });

  var drag = d3.behavior.drag()
      .on('dragstart', dragstart)
      .on('drag', dragmove)
      .on('dragend', dragend);

  /**
   * 获取数据集列表
   * @param userId
   * @param callback
   */
  let getDataSetList = function ( userId, callback ) {
    //t: 时间戳，解决IE11下 xhr 请求被缓存的bug
    $.get(EPMUI.context.url + '/dataset?pageNumber=1&pageSize=15',
      { userId: userId, t: new Date().getTime() }, function(data) {
      if( typeof callback === 'function') {
        callback(data);
      }
    });
  };

  /**
   * 数据集更新数据
   */
  let updateDataSet = function () {
    let userId = getCookie('userId'),
        jsonData,
        interceptData;

    //将返回的数据集列表整理成左下角盒子需要的数据格式
    var tidyData = function ( jsonData ) {
      let result = jsonData.slice( 0, Math.min( 6 || jsonData.length ) );
      if( result.length < 6 ) {
        for (let i = 0, l = 6 - result.length; i < l; i++) {
          result.push({ 'name': '' });
        }
      }
      return result;
    };

    getDataSetList( userId, function ( data ) {
      jsonData = JSON.parse(data).magicube_interface_data.data || [];
      datasetAll = Object.assign([], jsonData);
      initModal(jsonData);

      interceptData = tidyData( jsonData );
      root = {
        "name": "",
        "dataSetId": 0,
        "versionId": 0,
        "_children": interceptData
      };
      root.x0 = degree / 2;
      root.y0 = 0;

      update(root);
    } );
  };

  /**
   * 初始化放数据集的容器
   */
  let initDsContainer = function() {
    svg = d3.select(".topo-console");
    svgDataset = svg.append("g")
      .attr('class', 'dataset')
      .attr('transform', 'translate('+ dsLocation.beforeX + ',' + dsLocation.beforeY +')');

    svgRect = svg.insert('g', '.dataset')
      .attr('class', 'dataset_wrap')
      .append('rect')
      .attr('x', 0)
      .attr('y', heightScreen - rectHeight)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .style({'stroke': '#0088b1', 'stroke-width': 1, 'stroke-opacity': 1e-6, 'fill-opacity': 1e-6});
  };

  // 加载数据集
  let loadDataset = function() {
    initDsContainer();
    updateDataSet();
  };
  loadDataset();
  window.loadDataset = loadDataset;

  // 数据集求 交/并/差集 相关
  $('#dataset_opera .dataset_cancel').on('click', cancelOperate);
  $('#dataset_opera .dataset_ok').on('click', operateDataset);
  //碰撞信息显示
  $('#dataset_merge .dataset_ok').on('click', function() {
    if($('#dsname_tip h4').attr('data-datasetname') && $('#dsname_tip h4').attr('data-versionname')){
      $('#dsname_tip h4').text($('#dsname_tip h4').attr('data-datasetname') + '-' + $('#dsname_tip h4').attr('data-versionname')); 
    }
    showModal('dataset_merge');
  });

  // 数据集 更多 模块相关
  $('#dataset_manage .search_btn').on('click', searchDataset);
  $('#dataset_manage .search input').on('keydown', function(event) {
    if(event.keyCode == 13) {
      searchDataset();
    }
  })
  $('#dataset_manage .dsm_close').on('click', function() {
    //删除数据集弹框内容  
    showModal('dataset_manage');
  });

  // 数据集推送相关
  initPushInfo();
  $('#tool_push').on('click', function() {
    showModal('push_modal');
  });
  $('#push_modal .push_ok').on('click', pushDataset);
  $('#push_modal .push_cancel').on('click', function() {
    showModal('push_modal');
  });

  $('#push_modal .pig_input').on('click', function() {
    var show = $(this).next('.pig_select').css('display') === 'none' ?
      'inline-block' : 'none';

    $(this).next('.pig_select').css('display', show);
  });

  $('#push_modal').on('click', '.pig_select label', function() {
    togglePushSelectItem(this);
  });
  
  // 自动调节左下角数据集位置
  $("#topology_timeline_taggle").on('click', function() {
    timelineShow = !timelineShow;
    dsOffset = timelineShow ? 0 : 150;
    movedownWithScreen();
  });
  // $("#tool_fullscreen").on('click', adjustPositionForDs);
  // $('#topo_network').on('click', function(event) {
  //   if(event.keyCode == 27) {
  //     if (fullScreen) {
  //       adjustPositionForDs();
  //     }
  //   }
  // });

  // 保存/另存为 数据集时格式校验
  $('#topo_save_name, #topo_save_versionName').focus(function() {
    $(this).css('border', '1px solid #202b33')
      .next().hide();
  })
  .blur(function() {
    !$(this).val().trim() ?
      $(this).css('border', '1px solid #ffd862')
        .next().show() : '';
  });


  //d3.select(self.frameElement).style("height", "800px");

  window.adjustPositionForDs = function() {
    fullScreen = !fullScreen;
    dsOffset = fullScreen ? 300 : 0;
    if(!fullScreen && !timelineShow) {
      dsOffset = 150;
    }
    movedownWithScreen();
  };

  // 根据key值从cookie获值
  function getCookie(c_name) {
    if (document.cookie.length > 0) {
      var c_start = document.cookie.indexOf(c_name + '=');
      if (c_start !== -1) {
        c_start = c_start + c_name.length + 1;
        var c_end = document.cookie.indexOf(';', c_start);
        if (c_end === -1) {
          c_end=document.cookie.length;
        }
        return document.cookie.substring(c_start, c_end);
      }
    }
    return '';
  }

  // 初始化“更多”模态框的数据
  function initModal(datasets) {
    // 显示数据集版本弹框内容
    showDataModel(datasets);
    $('#dataset_manage .dataset_list li.datasetBox').on('dblclick', function() {
      $(".dataset_edit .dse_opera").css('display', 'inline-block');
      dataset_show.datasetId = $(this).attr('data-datasetId');
      dataset_show.name = $(this).attr('data-name');
      $.get(EPMUI.context.url + '/dataset/version',
        //t: 时间戳，解决IE11下 xhr 请求被缓存的bug
        { setId: $(this).attr("data-datasetId"), t: new Date().getTime() }, function(data){
        nodeSet = JSON.parse(data).magicube_interface_data.data;
        var datasets = JSON.parse(data).magicube_interface_data.data;
        datasetAll = Object.assign([], datasets);
        $('#dataset_manage h5').text('版本');
        // 显示数据集版本弹框内容
        showDataModel(datasets);
      }); 
    });   
  }
  // 显示数据集版本弹框内容
  function showDataModel(datas){
    //清除搜索框搜索数据
    $('.search input').val('');
    //清除弹框内展示的数据集或者版本信息
    $('#dataset_manage .dataset_list ul').empty();
    //动态添加数据集或者版本
    var lis = '';
    $.each(datas, function(i, data) {
      // var clsName = data.dataSetId == dsId ? 'ds_selected' : 'datasetBox';
       if(data.snap){
          var clsName = "versionBox";
          var html = '<img class="versionBox" src="' + data.snap + '" />';
        }else{
          clsName = "datasetBox";
          html = '<span class="datasetBox icon-dataset"></span>';
        }
      lis += '<li class="'+ clsName +'" data-timestamp='+ data.createTime +' data-datasetId='+ data.dataSetId
        + ' data-versionId=' + data.id
        + ' data-name='+ data.name +'>'
        + html 
        + '<p>'+data.name+'</p>'
        + '</li>';
    });
    $("#dataset_manage .dataset_list").mCustomScrollbar("destroy");
    $('#dataset_manage .dataset_list ul').append(lis);
    $("#dataset_manage .dataset_list").mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
    });
    //给版本li绑定双击事件：打开版本topo图
    $('#dataset_manage .dataset_list li.versionBox').on('dblclick', dbclickTopo);
  }

  //返回到数据集
  $(".dataset_edit button.return").on('click', function(){
    $(".dataset_edit .dse_opera").hide();
    //删除数据集弹框内容，重新加载数据集内容
    $('#dataset_manage h5').text('数据集');
    updateDataSet();
    // 删除数据集之前的选中状态
    $('.dataset_list li').each(function() {
      if ($(this).attr('class')) {
        $(this).removeClass('ds_selected');
        $(this).find('img').removeClass('ds_selected');
      }
    });
  });
  //双击打开topo图
  function dbclickTopo(e) {
    e = e || window.event;
    $.get(EPMUI.context.url + '/version', {id: $(e.target).parent().attr('data-versionId')}, function(data){
      nodeSet = JSON.parse(data).magicube_interface_data;
      $('#dataset_manage').hide();
      showOperaModal();
    });
  }
  function searchDataset() {
    var searchContent = $('#dataset_manage .search input').val(),
        dsLength = datasetAll.length,
        newDatasets = [],
        datasetName;

    for (var i = 0; i < dsLength; i++) {
      datasetName = datasetAll[i].name;
      if (datasetName.indexOf(searchContent) !== -1) {
        newDatasets.push(datasetAll[i]);
      }
    }
    initModal(newDatasets);
  }

  function update(source) {

    var nodes = cluster.nodes(root);
    if(nodes.length === 1) nodes[0].x = degree / 2;  // 有bug，特殊过滤
    // var links = cluster.links(nodes);

    // Update the nodes…
    var node = svgDataset.selectAll("g.dataSetNode")
        .data(nodes);
    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "dataSetNode")
        .attr("transform", function(d) {
            // return "rotate(" + ( source.x0 + datasetImg.offset ) +") translate(" + source.y0 + ")";
            return "translate(" + source.y0 + ")";
        })
        .on("click", click)
        // .on("mouseenter", mouseoverNode)
        // .on("mouseleave", mouseoutNode)
        .call(drag);

    nodeEnter.append('image')
        .attr('x', function(d) {
          return d._children ? -datasetImg.center/2 : -datasetImg.around/2;
        })
        .attr('y', function(d) {
          return d._children ? -datasetImg.center/2 : -datasetImg.around/2;
        })
        .attr('width', function(d) {
          return d._children ? datasetImg.center : 1e-6;
        })
        .attr('height', function(d) {
          return d._children ? datasetImg.center : 1e-6;
        })
        .attr('xlink:href', function(d, i) {
          if (d.depth === 1 && !d.dataSetId) {
            return pathPrefix + "around-dark.svg";
          }

          var pathSuffix = d._children ? 'center-shrink' : 'around-bright';
          return pathPrefix + pathSuffix + ".svg";
        })
        .attr('transform', function(d) {
          return "rotate(" + -d.x +")";
        })
        .on("mouseenter", mouseoverNode)
        .on("mouseleave", mouseoutNode);

    // var textWrap = nodeEnter.append('rect')
    //     .attr('x', 0)
    //     .attr('y', '-1.3em')
    //     .attr('width', 108)
    //     .attr('height', '2.9em')
    //     .style({'stroke': '#0088b1', 'stroke-width': 1, 'fill-opacity': 1e-6, 'stroke-opacity': 1e-6})
    //     .attr('transform', function(d) {
    //         return "rotate(" + -d.x +") translate("+ datasetImg.around/2 +")";
    //     })
    var textNode = nodeEnter.append("text")
        .attr('x', '0.5em')
        .attr('transform', function(d) {
            return "rotate(" + -d.x +") translate("+ datasetImg.around/2 +")";
        })
        // .attr('dy', '.3em')
        .style('text-anchor', function(d) {
          return 'start';
          // return (d.x > 90 && d.x < 270) ? 'end' : 'start';
        })
        .style('fill-opacity', function(d) {
          return 1e-6;
          // return 1;
        });
    textNode.append('tspan')
      .text(function(d) {
        return d.name;
      });
    textNode.append('tspan')
      .attr('x', '0.5em')
      .attr('y', '1.3em')
      .text(function(d) {
        if(d.depth === 0) {
          return;
        }
        return d.updateTime;
      });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "rotate(" + d.x +") translate(" + d.y + ")";
        });

    nodeUpdate.select('image')
        .attr('x', function(d) {
          // return d._children ? -datasetImg.center/2 : -datasetImg.around/2;
          var temp;
          if (d._children) {
            temp = -datasetImg.center/2;
          }else if (d.depth === 0) {
            temp = -datasetImg.centerScale/2
          }else {
            temp = -datasetImg.around/2
          }
          return temp;
        })
        .attr('y', function(d) {
          // return d._children ? -datasetImg.center/2 : -datasetImg.around/2;
          var temp;
          if (d._children) {
            temp = -datasetImg.center/2;
          }else if (d.depth === 0) {
            temp = -datasetImg.centerScale/2
          }else {
            temp = -datasetImg.around/2
          }
          return temp;
        })
        .attr('width', function(d) {
          //return d._children ? datasetImg.center : datasetImg.around;
          var temp;
          if (d._children) {
            temp = datasetImg.center;
          }else if (d.depth === 0) {
            temp = datasetImg.centerScale;
          }else {
            temp = datasetImg.around;
          }
          return temp;
        })
        .attr('height', function(d) {
          // return d._children ? datasetImg.center : datasetImg.around;
          var temp;
          if (d._children) {
            temp = datasetImg.center;
          }else if (d.depth === 0) {
            temp = datasetImg.centerScale;
          }else {
            temp = datasetImg.around;
          }
          return temp;
        });

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + ")"; })
        .remove();

    // nodeExit.select("circle")
    //     .attr("r", 1e-6);
    nodeExit.select('image')
        .attr('width', 1e-6)
        .attr('height', 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d3.event.defaultPrevented) return;

    if (d != root) {
      return;
    }

    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }

    clickToggle(d, this);
    update(d);
  }

  function mouseoverNode(d, i) {
    // Filter out the absence of a dataset
    if(d === root || !d.dataSetId) {
        return;
    }

    // append the rect tooltip for dataset information
    const nodeDom = $(this).parent().get(0);
    d3.select(nodeDom).append('rect')
      .attr('x', 0)
      .attr('y', '-1.3em')
      .attr('width', function(d) {
        return d.depth === 0 ? 0 : 108;
      })
      .attr('height', function(d) {
        return d.depth === 0 ? 0 : '2.9em';
      })
      .attr('class', 'datasetTip')
      .attr('transform', function(d) {
          return "rotate(" + -d.x +") translate("+ datasetImg.around/2 +")";
      });

    // show the text tooltip
    d3.select(nodeDom).select('text')
      .selectAll('tspan')
      .attr('class', 'datasetTipText');
  }

  function mouseoutNode(d, i) {
    // remove the rect tooltip
    const nodeDom = $(this).parent().get(0);
    d3.select(nodeDom).select('rect')
      .remove();
    // hide the text tooltip
    d3.select(nodeDom).select('text')
      .selectAll('tspan')
      .attr('class', 'datasetTipTextHide');
  }

  function dragstart(d, i) {
      d3.event.sourceEvent.stopPropagation();

      if(d === root || !d.dataSetId) {
          return;
      }
      selectedNode = d3.select(this);
      selectedNode.style('opacity', function(d) {
        dataset_show.datasetId = d.dataSetId;
        dataset_show.name = d.name;
        dataset_show.versionId = d.versionId;
        return 0.7;
      });
      var transform = selectedNode.attr("transform");
      ghost = svgDataset.append('image')
        .attr('x', -datasetImg.around/2)
        .attr('y', -datasetImg.around/2)
        .attr('width', datasetImg.around)
        .attr('height', datasetImg.around)
        .style('opacity', 0.3)
        .attr('xlink:href', function() {
          return pathPrefix + 'around-bright.svg';
        })
        .attr('transform', transform);

      // showRectRange(1);
  }

  function dragmove(d, i) {
    if (d === root || !d.dataSetId) {
        return;
    }

    // d.x0 = d3.event.x;
    // d.y0 = d3.event.y;
    var coords = d3.mouse($('g.dataset').get(0));

    ghost.attr('transform', function(d) {
        return 'translate('+ d3.event.x +','+ d3.event.y +')';
      });

    if (Math.abs(coords[0]) > xRange || Math.abs(coords[1]) > yRange) {
      ghost.style('opacity', 1);
      svg.selectAll(".link, .Mgnodes, .gtext").style("opacity", .1);
    }else {
      ghost.style('opacity', 0.3);
      svg.selectAll(".link, .Mgnodes, .gtext").style("opacity", 1);
    }
  }

  function dragend(d, i) {
      if (d === root || !d.dataSetId) {
          return;
      }
      var coords = d3.mouse($('g.dataset').get(0));

      if (Math.abs(coords[0]) < xRange && Math.abs(coords[1]) < yRange) {
        clearGhost();
      }else {
        svg.selectAll(".link, .node, .gtext").style("opacity", 1);
        //显示对于数据集合并交等操作选择
        showOperaModal();
        //获取拖动版本相应数据
        getRecordById();
        //本地存储工作台上的点
        globalFuction.saveLocalColl();
      }
      // showRectRange(1e-6);
  }

  function showRectRange(opacityValue) {
    svgRect.transition()
      .duration(duration)
      .style('stroke-opacity', opacityValue);
  }

  // Operate modal tooggle
  function showOperaModal() {
    var show = $('#dataset_opera').css('display');

    if (show === 'block') {
      $('#dataset_opera').css('display', 'none');
    }else if (show === 'none') {
      $('#dataset_opera').css('display', 'block');
    }
  }

  // 取消操作
  function cancelOperate() {
    clearGhost();
    showOperaModal();
  }
  // 数据集合并交等确认操作
  function operateDataset() {
    //选择操作方式
    //var operate = $("#dataset_opera .dataset_content input[name='datasetRadio']");
    let operate = null;
		$(".datasetRadio").each(function (d,i) {
				if ($(i).hasClass("icon-dot-circle")) {//得到选中的关系type
					operate = $(i).attr("data-value");
        }
		});
    //选择碰撞方式
    var ways = '';
    $("#dataset_opera .dataset_content input[name='datasetCheckbox']:checked").each(function() {
      ways += this.value + ',';
    });
    clearGhost();
    //关闭操作弹框
    showOperaModal();

    // 当选择 '打开到控制台' 时，向用户提示是否保存控制台的分析数据
    var versionId = $('#dsname_tip h4').attr('data-versionId') || $('#dsname_tip h4').attr('data-id'),   
        nodesLength = nodes.length,
        saveState = localStorage.getItem("saveState");
    if ('open' === operate && (saveState === 'false' || saveState == undefined)) {
      // 勾选 默认不再提示
      // TODO: 获取勾选条件，并判断
      // 未勾选
      $('#dataset_save_tip').show(); 
      // 打开到控制台时，提示是否保存 相关
      $('#dataset_save_tip .dstf_ok, #dataset_save_tip .dstf_cancel').on('click', function() { 
          saveDefault(this);   
      });
      return;
    }
    performCollectionOpera(operate, ways);
  }
  
  // 打开到控制台时，提示是否保存 相关
  function saveDefault(ele) {
    $('#dataset_save_tip').hide();
    let operate = null;
    $(".datasetRadio").each(function (d,i) {
      if ($(i).hasClass("icon-dot-circle")) {//得到选中的关系type
        operate = $(i).attr("data-value");
      }
    });
    var ways = '';
    $("#dataset_opera .dataset_content input[name='datasetCheckbox']:checked").each(function() {
      ways += this.value + ',';
    });
    var value = $(ele).val();

    if (value === 'ok') {
      // 设置标识
      localStorage.setItem('collection_perform', true);
      $('#tool_save').click();
    }else {
      performCollectionOpera(operate, ways);
    }
  }
  // 数据集操作
  function performCollectionOpera (operate, ways) {
    globalFuction.collectiveOpera(nodeSet, dataset_show, operate, ways);

    if ('open' === operate) {
      showSuccessModal('数据已加载完毕！');
      $('#dataset_save_tip').hide();
      setTimeout(() => {
        $('#dataset_finished').fadeOut();
      },500);
      return;
    }
    showModal('dataset_merge');
  }

  // 判断是否是重新打开的数据集，数据集 保存/另存 之后调用
  window.whetherLoadDataset = function() {
    var operate = $("#dataset_opera .dataset_content input[name='datasetRadio']:checked").val(),
        ways = '';
    $("#dataset_opera .dataset_content input[name='datasetCheckbox']:checked").each(function() {
      ways += this.value + ',';
    });

    var flag = localStorage.getItem('collection_perform');
    localStorage.removeItem('collection_perform');
    flag==='true' ? performCollectionOpera(operate, ways) : '';
  }

  function getRecordById() {
    $.get(EPMUI.context.url +  '/version', { id: dataset_show.versionId }, function(data) {
      nodeSet = data.code === 200 ? (data.magicube_interface_data || {}) : {};
    }, 'json');
  }

  function clearGhost() {
    if(ghost) {
      ghost.transition().remove();
      selectedNode.transition().style('opacity', 1);
    }
  }

  function movedownWithScreen() {
    var svgObj = dsOffset > 0 ? svgDataset.transition().duration(600) : svgDataset;

    var translateX = d3.transform(svgDataset.attr('transform')).translate[0];
    var translateY = svgDataset.selectAll('g.node')[0].length === 1 ? dsLocation.beforeY : dsLocation.afterY;
    svgObj.attr('transform', "translate(" +  translateX + "," + (translateY + dsOffset) + ")");

    svgRect.attr('y', heightScreen - rectHeight + dsOffset);
  }

  function formatDate(date) {
    if(date instanceof Date) {
      return date.getFullYear() + '-'
        + (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        + date.getDate() + ' '
        + date.getHours() + ':'
        + date.getMinutes() + ':'
        + date.getSeconds();
    }
  }

  function clickToggle(d, obj) {
    var datasetUpdate = svgDataset.transition().duration(duration),
        imgNode = d3.select(obj).select('image');
    if(d._children) {
      datasetUpdate.attr('transform', 'translate('+ dsLocation.beforeX +','+ (dsLocation.beforeY + dsOffset)+')');

      setTimeout(function() {
        imgNode.attr('xlink:href', pathPrefix+'center-shrink.svg');
      }, 500);
    }else {
      setTimeout(function() {
        imgNode.attr('xlink:href', pathPrefix+'center-enlarge.svg');
      }, 300);

      datasetUpdate.attr('transform', 'translate('+ dsLocation.afterX +','+ (dsLocation.afterY + dsOffset) +')');
    }

    loadMore(d);
  }

  function loadMore(d) {
    // Add to show the more button
    var moreNode = svgDataset.select('g.more');
    if(!moreNode[0][0]) {
      moreNode = svgDataset.append('g')
        .attr('class', 'more')
        .attr('transform', 'translate(0, 64)')
        .on('click', function() {
          //删除数据集弹框内容，重新加载数据集内容
          $('#dataset_manage h5').text('数据集');
          $('.dataset_wrap').remove();
          $('.dataset').remove();
          loadDataset();
          // 删除数据集之前的选中状态
          $('.dataset_list li').each(function() {
            if ($(this).attr('class')) {
              $(this).removeClass('ds_selected');
              $(this).find('img').removeClass('ds_selected');
            }
          });
          showModal('dataset_manage');
        });

      moreNode.append('image')
        .attr('x', -datasetImg.centerScale/2)
        .attr('y', -10)
        .attr('width', datasetImg.centerScale)
        .attr('height', 10)
        .attr('xlink:href', pathPrefix + 'more.svg')
        .style({'opacity': 1e-6, 'cursor': 'pointer'});

      // moreNode.append('text')
      //   .style('text-anchor', 'end')
      //   .text('更多>')
      //   .style('fill-opacity', 1e-6);
    }
    // Transition show the more button
    if (d._children) {
      moreNode.select('image').transition()
        .duration(160)
        .style('opacity', 1e-6);
    }else {
      setTimeout(function() {
        moreNode.select('image').transition()
          .duration(200)
          .style('opacity', 1);
      }, duration);
    }

  }

  window.showModal = function(eleName) {
    var show = $('#'+eleName+'').css('display');
    if (show === 'block') {
      $('#'+eleName+'').css('display', 'none');
    }else if (show === 'none') {
      $('#'+eleName+'').css('display', 'block');
    }
  }

  // 提示操作成功
  window.showSuccessModal = function(message) {
    $('#dataset_finished h5').text(message);
    $('#dataset_finished').fadeIn();
  }

  // 数据集推送相关
  function togglePushSelectItem(ele) {
    var groupId = $(ele).attr('data-id'),
        groupName = $(ele).text(),
        users = [];

    $(ele).parents('.pig_select').css('display', 'none')
      .prev('.pig_input').attr('data-id', groupId).text(groupName);

    // 如果点击的select item为用户组，需要刷新推送用户信息
    if ( $(ele).parents('#push_input_group').length > 0 ) {

      for (var i = 0; i < groups.length; i++) {
        if (groups[i].groupId == groupId) {
          users = groups[i].userList || [];
          break;
        }
      }
      $('#push_input_user .pig_input').attr('data-id', '').text('请选择');
      loadPushBaseInfo(PUSH_TYPE_USER, users);
    }

  }

  function initPushInfo() {
    var url = EPMUI.context.url + '/group/user';
    $.get(url, function(data) {
      groups = data || [];
      loadPushBaseInfo(PUSH_TYPE_GROUP, groups);
    }, 'json');
  }

  function loadPushBaseInfo(type, options) {
    if ( type === PUSH_TYPE_USER ) {
      $( '#push_input_'+ type ).children('.pig_select').remove();
    }

    var select = $('<div class="pig_select"></div>');
    select.mCustomScrollbar("destroy");
    $.each(options, function(i, item) {
      select.append('<label data-id='+ item[type+'Id'] +'>'+ item[type+'Name'] +'</label>')
    });
    $('#push_input_'+ type).append(select);
    // 滚动条插件使用注意：必须将dom元素先插入，再调用函数
    select.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
  }

  function pushDataset() {
    var saveState = localStorage.getItem("saveState");
    var url = EPMUI.context.url + '/share/version',
      jsonData = {};
      jsonData.versionId = Number($('#dsname_tip h4').attr('data-versionId'));
      jsonData.receiverId = Number($('#push_input_user .pig_input').attr('data-id'));
      jsonData.description = $('#push_input_desc .pid_desc').text();
    if (saveState == 'false') {
      $('#tool_save').click();
      return;
    }else{
      $.post(url, jsonData, function(data) {
        showModal('push_modal');
        'success' === data.status ?
          showSuccessModal(data.message) :
          showAlert('提示', data.message, '#33d0ff');
        //$('#dsname_tip h4').removeAttr('data-versionId');
        localStorage.removeItem("versionId");
      }, 'json');
    }
    
  }

});
