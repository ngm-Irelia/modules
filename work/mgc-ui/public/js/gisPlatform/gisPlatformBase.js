/**
 * Created by ngm on 2018/3/13.
 */
$(function(){
    var screenFlag = true,            // 拓扑是否为全屏
        gisScreenFlag = true;
    window.inMap = false;
    window.mapRight = true;//判断地图时右侧栏是否隐藏
    window.m = false;
    window.t = false;
    // localStorage.setItem("topo_flag", true);
    localStorage.setItem("topo_url", location.href);
    $("#go_topo").removeClass("selectBar_selected");
    $("#go_map").addClass("selectBar_selected");
    $("#go_chart").removeClass("selectBar_selected");
    if(localStorage.getItem("topologyType") === "chart"){
        localStorage.removeItem("topo_url");
    }
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
            //
            const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.msFullScreenElement || document.webkitFullscreenElement;
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
            //$("#topology_relative_network").css("bottom", "150px");
        }

    };
    $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange',
        function () {
            // ESC退出全屏
            if (ScreenUtil.getFullScreenElement() === null) {
                FullScreenFunc.exitTopoFullScreenFunc('#map_fullscreen');
            }
        })
        .on('keydown', function (event) {
            if (event.keyCode === 122) {
                return false;//屏蔽F11
            }
            if (event.keyCode === 27) {
              FullScreenFunc.exitTopoFullScreenFunc('#map_fullscreen');
              var _width = $("#topology_message").css('width');
            }
        });
    //map 全屏模式&窗口模式
    $("#map_fullscreen").click(function () {
        if (screenFlag) {
            FullScreenFunc.setTopoFullScreenFunc(this);
            $("#topology_relative_network").css("bottom", 0);
        } else {
            FullScreenFunc.exitTopoFullScreenFunc(this);
            var _width = $("#topology_message").css('width');
        }
    });
    //时间轴显示隐藏
    $("#topology_timeline_taggle").click(function () {
        t = !t;
        if (t) {
            this.style = "transform: rotate(180deg)";
            $("#topology_relative_timeline").css("height", 0);
        } else {
            this.style = "transform: rotate(0deg)";
            $("#topology_relative_timeline").css("height", "150px");
        }
    });
    //信息栏显示隐藏
    $("#topology_message_taggle").click(function () {
        var _width = $("#topology_message").width();
        var widthpx = $("#topology_message").css('width');
        m = !m;
        if (m) {
            $("#topology_relative").css("right", 0);
            this.style = "right: 0; transform: rotate(180deg)";
            $("#topology_message").css("transform", "translate(" + widthpx + ", 0)");
            // in map
            $("#topo_map").css("right", 0);
            $("#topo_gis").css("right", 0);
            $("#topo_dashboard").css("right", 0);
            $(".BMapLib_Drawing_panel").css("right", 12 + 'px');
            $(".map_showHide_panel").css("right", 12 + 'px');
            mapRight = false;
        } else {
            //in map
            mapRight = true;
            $("#topology_relative").css("right", '0px');
            $(this).css({"right": widthpx, "transform": "rotate(0deg)"});
            $("#topology_message").css("transform", "translate(0, 0)");
            $(".BMapLib_Drawing_panel").css("right", parseInt(_width) + 12 + 'px');
            $(".map_showHide_panel").css("right", parseInt(_width) + 12 + 'px');
            var _width = $("#topology_message").width();
            $("#topo_map").css("right", parseInt(_width) + 'px');
            $("#topo_gis").css("right", parseInt(_width) + 'px');
            $("#topo_dashboard").css("right", parseInt(_width) + 'px');
        }
    });
    //右边信息栏拖拽
    $("#topology_message_drag").mousedown(function (event) {
        var ev = event || window.event;
        var _width = $("#topology_message").width();
        var downX = ev.clientX;

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
                //in map
                $("#topology_relative").css("right", "0px");
                $("#topo_map").css("right", parseInt(_width) - (moveX - downX ) + 'px');
                $("#topo_gis").css("right", parseInt(_width) - (moveX - downX ) + 'px');
                $("#topo_dashboard").css("right", parseInt(_width) - (moveX - downX ) + 'px');
                $(".BMapLib_Drawing_panel").css("right", parseInt(_width) - (moveX - downX - 12) + 'px');
                $(".map_showHide_panel").css("right", parseInt(_width) - (moveX - downX - 12) + 'px');
            }

        });

        $(document).bind('mouseup', function () {
            $(document).unbind();
            return false;
        });
    });
    //拖拽达到边界
    function dragBadMessage(number) {
        $("#topology_message").css("width", number);
        $("#topology_relative").css("right", number);
        //in map
        $("#topology_relative").css("right", "0px");
        $("#topo_map").css("right", number);
        $("#topo_gis").css("right", number);
        $("#topo_dashboard").css("right", number);
        $("#topology_message_taggle").css("right", number);
        return false;
    }
    //信息栏tab切换
    $(".message_tab_list").off().on('click', function () {
        var index = $(this).index();
        $(this).addClass("topology_message_tab_active").siblings().removeClass("topology_message_tab_active");
        $(".topo_message").css("display", "none").eq(index).css("display", "block");
    });

    //对应message.js

    var messageAllContent = [],
        baseType = ["相关的实体", "相关的事件", "相关的文档"],
        setTimeFlag,
        useToGisData,
        detailBlank = 0;
    window.searchToGisData = '';
    //获取基本信息
    window.getBaseMessage = function(clearMessage, id, type, flag, detaileId, relateId) {
        var _detaileId = detaileId ? detaileId : "#check_detail_contents";
        var _relateId = relateId ? relateId : "#check_relate_contents";
        if (!clearMessage) {
            $(_detaileId).html("");
            $(_relateId).html("");
            messageAllContent[0] = $("#topo_search_content").html();
            localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
            return false;
        }
        $.get(EPMUI.context.url + '/object/detailInformation/' + id + '/' + type, function(data) {
            if (data == null || data == 'null' || data == '' || data == undefined) {
                return false;
            }
            window.useToGisData = JSON.parse(data);
            var datas = JSON.parse(data);
            var taiYuanObjectType = datas.magicube_interface_data.objectType || '';
            baseBasic(datas.magicube_interface_data.property.basic, id, type, datas.magicube_interface_data.pageType, datas.magicube_interface_data.icon, _detaileId, taiYuanObjectType);
            if (flag) {
                getbaseRelate(datas.magicube_interface_data.related, _relateId);
            }
            messageAllContent[0] = $("#topo_search_content").html();
            localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
        });
    };
    //详细信息中基本信息块
    window.baseBasic = function(data, id, type, pageType, icon, parentNodeId, objectType) {
        var baseData = data;
        var image = pageType === "document" ? "" :
            //'<img id="topo_detail_photo" src="' + EPMUI.context.url + '/image/' + icon + '/' + pageType + '"/>';
            '<img id="topo_detail_photo" src="?" alt="头像" onerror="window.MGC.proxyImage(this, \''+ icon +'\', \''+ objectType.toString().toLowerCase() +'\')"/>';
        var str = '<span class="topo_checkout_detail icon-eye-circle" data-type="' + type + '" data-pageType="' + pageType + '" data-id="' + id + '">查看</span>' +
            image;

        for (var i = 0; i < baseData.length; i++) {
            baseData[i].value = baseData[i].value || '';
            str += '<div class="check_detail_content">' + baseData[i].display + '：' + baseData[i].value + '</div>';
        }
        $(parentNodeId).mCustomScrollbar("destroy");
        $(parentNodeId).html(str);
        $(parentNodeId).mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
        });

        $(".topo_checkout_detail").on('click', function() {
            location.href = '/' + $(this).attr('data-pageType') + '?id=' + id + '&type=' + $(this).attr("data-type");
        });
    };
    //拼接详细信息中的关系
    window.getbaseRelate = function(data, parentNodeId) {
        var relateData = data;
        var relateStr = "";
        for (var i in relateData) {
            if (relateData[i].value && relateData[i].value.length > 0) {
                var _data = relateData[i].value;
                var _str = "";
                for (var j = 0; j < _data.length; j++) {
                    var pageType =  _data[j].objectType;
                    _str += '<div class="relate_list_box">' +
                        '<span class="base_relate_list" draggable="true" data-type="' + pageType + '" data-pageType="' + i + '" data-id="' + _data[j].objectId + '" data-nodeId="' + _data[j].nodeId + '" data-show="false">' + _data[j].objectName + '</span>' +
                        '</div>'
                }

                var active = i === 0 ? "mesType_title_active" : "";
                var show = i === 0 ? "topology_mes_active" : "";
                var _flag = i === 0 ? "true" : "false";
                var direction = i === 0 ? "triangleDown" : "triangleRight";
                relateStr += '<div class="check_relate_content">' +
                    '<h6 class="base_relate_title ' + active + '" data-hide=' + _flag + '>' + '<span class="topo_direction ' + direction + '"></span>' + relateData[i].display + '</h6>' +
                    '<div class="base_relate_lists ' + show + '">' + _str + '</div>' +
                    '</div>';
            }
        }
        $(parentNodeId).mCustomScrollbar("destroy");
        $(parentNodeId).html(relateStr);
        $(parentNodeId).mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
        });
        hoverShowDetail();
        dragDomMakeTopo(".base_relate_list");
        messageShow(".base_relate_title", false);
    };
    //鼠标放在详细的相关上会出现对应的详细
    window.hoverShowDetail = function() {
        $(".base_relate_list").on('mouseover', function() {
            var _this = this;
            clearTimeout(setTimeFlag);

            setTimeFlag = setTimeout(function() {

                $(".detail_relate_detail").hide();
                if ($(_this).attr('data-show') === "false") {
                    $(_this).attr('data-show', true).parent().append('<div style="display: none" class="detail_relate_detail"></div>');
                    $.get(EPMUI.context.url + '/object/detailInformation/' + $(_this).attr("data-id") + '/' + $(_this).attr("data-type"), function(data) {
                        if (!data) {
                            return false;
                        }
                        var basicArr = JSON.parse(data).magicube_interface_data.property.basic;
                        var str = '<div class="relate_detail_arrows icon-angle-up"></div><div class="relate_detail_hide">×</div>';
                        for (var i = 0; i < basicArr.length; i++) {
                            if (basicArr[i].display === "摘要") {
                                str += "";
                            } else {
                                if(i === 0){
                                  basicArr[i].value = basicArr[i].value || '';
                                  str += '<div style="width: 90%;"><span class="relate_detail_title">' + basicArr[i].display + '：</span><span>' + basicArr[i].value + '</span></div>'
                                }else{
                                  basicArr[i].value = basicArr[i].value || '';
                                  str += '<div><span class="relate_detail_title">' + basicArr[i].display + '：</span><span>' + basicArr[i].value + '</span></div>'
                                }
                            }
                        }
                        $(_this).next().mCustomScrollbar("destroy");
                        $(_this).next().html(str);
                        $(_this).next().mCustomScrollbar({
                            theme: Magicube.scrollbarTheme,
                            autoHideScrollbar: true
                        });
                        $(_this).next().show();



                        $('.relate_detail_hide').unbind("click").bind("click",function(){
                          $(this).parent().parent().parent().hide();
                          //修改父div的高度
                          if($(this).parent().parent().parent().height()>400){
                            let crc = $(".check_relate_content");
                            let parentHeight = crc.parent().height();
                            let pheight = parentHeight+$(this).parent().parent().parent().height()-400;
                            crc.parent().height(pheight);
                          }
                        });

                        //修改父div的高度
                        if($(_this).next().height()>400){
                          let crc = $(".check_relate_content");
                          let parentHeight = crc.parent().height();
                          let pheight = parentHeight+$(_this).next().height()-400;
                          crc.parent().height(pheight);
                        }
                    });

                } else {
                    $(_this).next().show();
                }

            }, 400);
        });

        $(".base_relate_list").on('mouseout', function() {
            clearTimeout(setTimeFlag);
            //$(this).next().hide();
        });
    };
    var mapHandler = function(e) {
        e.preventDefault();
        if (!e.dataTransfer.getData('text').match("dragFlag")) {
            return false;
        }
        var dropObj = JSON.parse(e.dataTransfer.getData('text'));
        // console.log("dropObj === ");
        // console.log(dropObj);
        var topoObj = {};
        $.get(EPMUI.context.url + "/object/" + "partInformation/" + dropObj.id + "/" + dropObj.type,function(searchNodes) {
            var dataSearch = $.parseJSON(searchNodes);
            topoObj = {
                id: dataSearch.id,
                display: "block",
                nodeWeight:dataSearch.nodeWeight ? parseInt(dataSearch.nodeWeight) : 0,
                nodeId: dataSearch.nodeId,
                name: dataSearch.target,
                objectType: dataSearch.objectType,
                markIcons: dataSearch.markIcons,
                type: dataSearch.type,
                fill: dataSearch.mark ? "#fc311a" : "#0088b1",
                stroke: dataSearch.mark ? "#ffbcaf" : "#33d0ff",
                x: e.x,
                y: e.y
            };

            var selectGisById = [];
            var selectGisByType = [];
            selectGisById.push(topoObj.id);
            selectGisByType.push(topoObj.type);
            // 根据nodes从后台或得gis信息
            $.ajax({
                url: EPMUI.context.url + '/object/gis',
                type: 'post',
                data: {
                    id: selectGisById,
                    type: selectGisByType
                },
                dataType: 'json',
                success: function(data) {
                    //根据返回的data-gis信息，拼接nodes数据
                    var gisData = data.magicube_interface_data;
                    var gisNodesData;
                    if (gisData.length > 0) {
                        var obj = {
                            id: topoObj.id,
                            type: topoObj.type,
                            objectType: topoObj.objectType,
                            name: topoObj.name,
                            nodeId: topoObj.nodeId,
                            gis: {
                                lon: gisData[0].lon,
                                lat: gisData[0].lat
                            }
                        };
                        gisNodesData = obj;
                    } else {
                        var numlon = new Number(123.111111 + Math.random()*6);
                        var randomLon = numlon.toFixed(6);

                        var numlat = new Number(28.058636 + Math.random()*5);
                        var randomLat = numlat.toFixed(6);

                        var obj = {
                            id: topoObj.id,
                            type: topoObj.type,
                            objectType: topoObj.objectType,
                            name: topoObj.name,
                            nodeId: topoObj.nodeId,
                            nogis:true,
                            gis: {
                                lon:randomLon,
                                lat:randomLat
                            }
                        };
                        gisNodesData = obj;
                    }
                    USEMAP.addOnePoint(gisNodesData);
                }
            });

        });
    };
    //拖动相关内容到地图
    function dragDomMakeTopo(className) {
        var targetMap = $('#basemap').get(0);
        var dragNodes = document.querySelectorAll(className);
        var len = dragNodes.length;
        for (var i = 0; i < len; i++) {
            dragNodes[i].addEventListener('dragstart', function(e) {
                var dragObject = {
                    name: this.innerText,
                    type: this.dataset.type,
                    objectType: this.dataset.pagetype,
                    id: this.dataset.id,
                    nodeId: this.dataset.nodeid,
                    dragFlag: true
                };
                e.dataTransfer.setData('text', JSON.stringify(dragObject));
            });
        };

        targetMap.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        });

        targetMap.addEventListener('drop', mapHandler, false);

    };
    //移除绑定的事件
    function removeDragEvent(className) {
        var targetMap = $('#basemap').get(0);
        targetMap.removeEventListener("drop", mapHandler, false);
    }
    //统计操作
    //点击选择按钮，判断一个属性，值是show，列表变为展示状态；值为hide时，列表变为可选择显示或隐藏状态
    window.totalOptions = function() {
        $("#total_checkbox_flag").on('click', function() {
            if ($(this).attr("data-checkbox") === "show") {
                $(".total_select_data").hide();
                $(this).attr("data-checkbox", "hide").addClass('icon-check-circle-o defaultColor').removeClass('icon-check-circle-o-blue clickColor');
            } else {
                $(".total_select_data").show();
                $(this).attr("data-checkbox", "show").addClass('icon-check-circle-o-blue clickColor').removeClass('icon-check-circle-o defaultColor');
            }
        });
        //刷新按钮
        $("#total_checkbox_refresh").on('click', function() {
            var deleteNode = [];
            $(".total_selected_id").each(function(index, item) {
                if ($(item).prop("checked") === false) {
                    var nodeList = JSON.parse($(item).next().attr("data-idlists"));
                    deleteNode = deleteNode.concat(nodeList);
                    if ($(item).hasClass("total_selected_id")) { //检查一个元素是否包含这个类
                        $(item).parentsUntil("tbody").remove();
                    } else {
                        $(item).parentsUntil("li").remove();
                        $("#check_detail_contents").html("");
                        $("#check_relate_contents").html("");
                        localStorage.removeItem("forceNodes");
                    }
                }
            });
            // localStorage.setItem("goTopo", false);
        })
    };
    //获取统计信息
    //应该是某个页面一加载时，调用这个函数，传入当前一些数据，这个数据是空的时候，统计模块最外面的额大盒子就是空的
    window.getTotalMessage = function(idArr) {
        if (idArr.ids.length === 0) {
            $("#total_type_box").html("");
            return false;
        } else {
            var str = '<div id="total_type"></div>' //这个大盒子装了除了选择刷新按钮的全部其他东西
                +
                '<div id="total_option_box">' +
                '<button data-checkbox="hide" id="total_checkbox_flag"   class="icon-check-circle-o defaultColor">选择</button>' +
                '<button data-total="show" id="total_checkbox_refresh" class="icon-refresh defaultColor">刷新</button>' +
                '</div>';
            $("#total_type_box").mCustomScrollbar("destroy");
            $("#total_type_box").html(str);
            $("#total_type_box").mCustomScrollbar({
                theme: Magicube.scrollbarTheme,
                autoHideScrollbar: true
            });
        }
        var dataType = ['entity', 'event', 'document'];
        $.ajax({
            type: "POST",
            url: EPMUI.context.url + '/statistic',
            data: {
                "objectId": idArr.ids,
                "type": idArr.types
            },
            dataType: 'json',
            success: function(data) {
                var datas = [],
                    count = 0;
                data.forEach(function(item) {
                    dataType.forEach(function(_item) {
                        if (item.displayName === _item) {
                            datas[count] = item;
                            count++;
                        }
                    });
                });

                var totalStr = totalMesWrap(datas); //拿回数据以后先拼接外层字符串
                messageAllContent[1] = totalStr;
                localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
                $("#topology_loading").hide();
                $("#total_type").mCustomScrollbar("destroy");
                $("#total_type").html(totalStr);
                $("#total_type").mCustomScrollbar({
                    theme: Magicube.scrollbarTheme,
                    autoHideScrollbar: true
                });
                totalOptions();
                messageShow(".total_title_text", true);
                outputSelectId();
            }
        });
    };

    window.gisGetTotalMessage = function(idArr) {
        if (!idArr) {
            $("#total_type_box").html("");
            return false;
        } else {
            var str = '<div id="total_type"></div>' //这个大盒子装了除了选择刷新按钮的全部其他东西
                +
                '<div id="total_option_box">' +
                '<button data-checkbox="hide" id="total_checkbox_flag"   class="icon-check-circle-o defaultColor">选择</button>' +
                '<button data-total="show" id="total_checkbox_refresh" class="icon-refresh defaultColor">刷新</button>' +
                '</div>';
            $("#total_type_box").mCustomScrollbar("destroy");
            $("#total_type_box").html(str);
            $("#total_type_box").mCustomScrollbar({
                theme: Magicube.scrollbarTheme,
                autoHideScrollbar: true
            });
        }
        var dataType = ['entity', 'event', 'document'];
        var datas = [],
            count = 0;
        idArr.forEach(function(item) {
            dataType.forEach(function(_item) {
                if (item.displayName === _item) {
                    datas[count] = item;
                    count++;
                }
            });
        });

        var totalStr = totalMesWrap(datas); //拿回数据以后先拼接外层字符串
        messageAllContent[1] = totalStr;
        localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
        $("#topology_loading").hide();
        $("#total_type").mCustomScrollbar("destroy");
        $("#total_type").html(totalStr);
        $("#total_type").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
        });
        totalOptions();
        messageShow(".total_title_text", true);
        outputSelectId();
    };

    //拼接统计信息外层字符串
    //外层就是有一个h3和一个就是实体
    window.totalMesWrap = function(w_data) {
        var str = "";
        var len = w_data.length;
        // totalAllId = {};

        for (var i = 0; i < len; i++) {
            var _flag, _display, _active, _image;
            i === 0 ? _flag = "true" : _flag = "false";
            i === 0 ? _display = "display:block" : _display = "display:none";
            i === 0 ? _active = "mesType_title_active" : _active = "";
            i === 0 ? _image = "triangleDown" : _image = "triangleRight";
            // totalAllId = totalAllId.concat( w_data[i].idList );
            // 过滤控制台筛选所需数据
            // filterData( w_data[i].data );

            switch (w_data[i].displayName) {
                case "entity":
                    var displayName = "实体类型";
                    break;
                case "event":
                    var displayName = "事件类型";
                    break;
                case "document":
                    var displayName = "文档类型";
                    break;
            }
            str += '<li class="topology_totalmes">' +
                '<h3 class="topology_firstPro_title" data-hide=' + _flag + '>' +
                '<span class="total_title_text ' + _active + '">' +
                '<span class="topo_direction ' + _image + '"></span>' +
                displayName +
                '</span>' +
                '</h3>' +
                '<ul style="' + _display + '">' +
                totalMesMiddle(w_data[i].data, "topology_secondPro_title", false) +
                '</ul>' +
                '</li>';
        }
        var content_wrap = '<ul id="total_checked_box">' +
            str +
            '</ul>';
        return content_wrap;
    };

    //拼接统计信息中层字符串
    //中层就是li里边再加一个ul就是人和职业
    window.totalMesMiddle = function(data, className, flag) {
        var content_middle = "";
        var _data = data;
        if (_data.length !== 0) {
            var len = _data.length;
            for (var i = 0; i < len; i++) {
                var _flag, _display, _active, _image;
                i === 0 ? _flag = "true" : _flag = "false";
                i === 0 ? _display = "display:block" : _display = "display:none";
                i === 0 ? _active = "mesType_title_active" : _active = "";
                i === 0 ? _image = "triangleDown" : _image = "triangleRight";
                var str = !flag ? totalMesMiddle(_data[i].data, "topology_thridPro_title", true) : totalMesList(_data[i].data);
                content_middle += '<li>' +
                    '<p class="' + className + '" data-hide=' + _flag + '>' +
                    '<input type="checkbox" class="total_select_data icon-check-square-o" checked="true">' +
                    '<span class="total_title_text ' + _active + '">' +
                    '<span class="topo_direction triangleChoose ' + _image + '"></span>' +
                    '<span>' + _data[i].displayName + '</span>' +
                    '<span> [ ' + _data[i].idList.length + ' ]</span>' +
                    '</span>' +
                    '</p>' +
                    '<ul style="' + _display + '">' +
                    str +
                    '</ul>' +
                    '</li>';
            }
        }
        return content_middle;
    };

    //统计信息内层
    //内层就是公务员
    window.totalMesList = function(data) {
        var str = "";

        for (var i = 0, len = data.length; i < len; i++) {
            str += '<tr>' +
                '<td>' +
                '<p>' +
                '<input type="checkbox" class="total_select_data total_selected_id icon-check-square-o" checked="true">' +
                '<span data-idLists=' + JSON.stringify(data[i].idList) + ' data-active="true">' +
                (data[i].name === 'null' ? '未知' : data[i].name) +
                '</span>' +
                '</p>' +
                '</td>' +
                '<td>' +
                '<i></i>' +
                '<b>' + data[i].idList.length + '</b>' +
                '</td>' +
                '</tr>';
        }

        var sontent = '<table class="total_classifyList_table">' + str + '</table>';
        return sontent;
    };

    //选中统计信息前面的复选框，对外输出类型
    window.outputSelectId = function() {
        // 隐藏得点（叠加）
        let propertyAllId = [];
        // 显示得点（未叠加）
        let addId = [];
        $(".total_select_data").on('click', function() {
            //勾选显示点
            if ($(this).prop("checked") === true) {
                $(this).attr("checked", true).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
                $(this).parent().next().find(".total_select_data").prop("checked", true).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
                checkedJudgement($("#total_checked_box"));
                addId = getmessageId($(this));
                propertyAllId = [...new Set([...propertyAllId].filter(x => !new Set(addId).has(x)))];
                //取消勾选隐藏点
            } else {
                $(this).attr("checked", false).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
                $(this).parent().next().find(".total_select_data").prop("checked", false).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
                checkedJudgement($("#total_checked_box"));
                propertyAllId = [...new Set([...new Set(propertyAllId), ...new Set(getmessageId($(this), propertyAllId))])];
            }
        });
    };

    //进行父子级联动判断勾选与未勾选状态
    window.checkedJudgement = function(obj) {
        var _obj = obj.children('li').children('ul');
        if (_obj.length !== 0) {
            _obj.each(function(index, item) {
                checkedJudgement($(item));
                if( $(item).find('input:checked').length === $(item).find('input').length ) {
                    $(item).prev().children('input').prop("checked", true).attr("checked", true).removeClass("tital_select_noall icon-pull-up").addClass("icon-check-square-o");
                } else if( $(item).find('input:checked').length !== $(item).find('input').length && $(item).find('input:checked').length !== 0 ) {
                    $(item).prev().children('input').prop("checked", true).attr("checked", true).addClass("tital_select_noall icon-pull-up").removeClass("icon-check-square-o");
                } else {
                    $(item).prev().children('input').prop("checked", false).attr("checked", false).addClass("tital_select_noall icon-pull-up").removeClass("icon-check-square-o");
                }
            });
        }
    };

    // 勾选显示与隐藏工作台上的点
    window.getmessageId = function(obj){
        let list = obj.parent().siblings('ul').find('input');
        let propertyAllId = [];
        // 循环到最内层的input开始存各点的id
        if(list.length === 0){
            obj.each(function(index, item){
                if(typeof $(item).next().attr("data-idLists") == 'string'){
                    propertyAllId = propertyAllId.concat(JSON.parse($(item).next().attr("data-idLists")));
                }
            });
            // 数组去重
            propertyAllId = [...new Set(propertyAllId)];
            return propertyAllId;
        } else{
            return getmessageId(list);
        }
    };

    //右上角的搜索
    $("#search_input").on('keyup', function(e) {
        if (e.keyCode === 13) {
            getSearchData($("#search_input").val().trim());
        }
    });

    $("#search_btn").on('click', function() {
        getSearchData($("#search_input").val().trim());
    });

    $("#topo_search_none").on('click', function() {
        $("#search_input").focus();
    });

    //弹出创建标签弹框
    $("#topo_go_makeLabel").on('click', function() {
        $("#document_modal").show();
        $("#topo_shade").show();
        $("#make_label").val($("#search_input").val());
    });

    //关闭创建标签弹框
    $("#make_cancel").on('click', function() {
        $("#document_modal").hide();
        $("#topo_shade").hide();
    });

    //创建标签
    $("#make_ensure").on('click', function() {
        var propertyObj = {},
            name = $("#make_label").val(),
            objectType = $("#makeEntity_type").attr("data-type"),
            pageType = $(".make_active").attr("data-type"),
            makeObj = {
                name: name,
                inDocument: false,
                objectType: objectType,
                property: ""
            };

        if (!name) {
            $("#make_label").next().show();
            return false;
        } else {
            $("#make_label").next().hide();
        }

        if ($("#makeEntity_type").attr("data-type") !== "null") {
            makeObj.objectType = $("#makeEntity_type").attr("data-type");
        } else {
            $("#makeEntity_type").parent().next().show();
            return false;
        }

        $(".make_detail_list").each(function(index, item) {
            if (!!$(item).html().trim()) {
                propertyObj[$(item).attr("data-type")] = $(item).html();
            }
        });

        makeObj.property = JSON.stringify(propertyObj);
        $.post(EPMUI.context.url + '/document/createobject', makeObj, function(data) {
            if (!data) {
                return false;
            }
            var datas = JSON.parse(data);
            if (datas.status !== "success") {
                showAlert("提示!", datas.message, "#ffc000");
                return false;
            } else {
                showAlert("提示!", datas.message, "#33d0ff");
            }

            if ($("#add_topo_checkbox").prop("checked") === true) {
                var topoObj = {
                    name: name,
                    objectType: pageType,
                    type: objectType,
                    fixed: true,
                    selected: "#ffd862",
                    display: "block",
                    x: 400,
                    y: 200,
                    fill: "#0088b1",
                    stroke: "#33d0ff"
                };
                topoObj.id = datas.data.objectId;
                topoObj.nodeId = datas.data.nodeId;
            }
            showAlert("提示!", datas.message.reason, "#33d0ff");
            getSearchData($("#make_label").val().trim());
        });
        $("#document_modal").hide();
        $("#topo_shade").hide();

    });

    //获取搜索数据
    function getSearchData(value) {
        if (!!value) {
            $(".topology_message_tab_active").removeClass("topology_message_tab_active");
            $("#topo_search_title").addClass("topology_message_tab_active");
            $(".topo_message").hide();
            $("#topology_message_search").show();
            $("#topology_search_loading").hide();

            $.get(EPMUI.context.url + '/objects/' + value, function(data) {
                $("#topology_search_loading").hide();
                var datas = $.parseJSON(data);

                // 授权
                if (datas.code && datas.code === 407) {
                    showAlert('提示', datas.message, '#ffc000');
                    return;
                }

                if (parseInt(datas.code) === 200) {
                    window.gisPointType = datas.magicube_interface_data[0].data[0].displayName;
                }
                if (parseInt(datas.code) === 204) {
                    $("#topo_search_tip").show();
                    $("#topo_search_content").hide();
                    $("#topo_search_none").hide();

                    return false;
                }
                searchMessage(datas.magicube_interface_data);
                $("#topo_search_content").show();
            });
        } else {
            showAlert("警告!", "请输入搜索内容", "#ffc000");
        }
    }

    //搜索内容展示
    function searchMessage(data) {
        var text = "",
            id, type;

        for (var i = 0; i < data.length; i++) {

            if (i === 0) {
                id = data[i].data[0].data[0].id;
                type = data[i].data[0].displayName;
                getBaseMessage(true, id, type, false, "#topo_search_detail");
            }
            text += searchMes_m(data[i].data, data[i].dispalyName);

        }

        var content = '<ul class="topology_message_detail">' +
            text +
            '</ul>';

        if (data.length > 0) {
            $("#topo_search_tip").hide();
            $("#topo_search_content").show();
        } else {
            $("#topo_search_tip").show();
            $("#topo_go_search").html($("#search_input").val());
            $("#topo_search_content").hide();
        }

        $("#topo_search_none").hide();
        $("#topo_search_result").mCustomScrollbar("destroy");
        $("#topo_search_result").html(content);
        $("#topo_search_result").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
        });

        messageAllContent[2] = $("#topo_search_content").html();
        localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
        removeDragEvent(".search_go_detail");
        dragDomMakeTopo(".search_go_detail");
        messageShow(".topology_mesType_title", false);
        goDetail();
    }

    //搜索内部数据
    function searchMes_m(data, name) {
        var displayName = "";
        switch (name) {
            case "document":
                displayName = "文档";
                break;
            case "entity":
                displayName = "实体";
                break;
            case "event":
                displayName = "事件";
                break;
        }

        if (data.length) {
            var txt = "",
                str = "",
                length = 0;
            var len = data.length;
            for (var i = 0; i < len; i++) {
                var _data = data[i].data,
                    _len = _data.length,
                    type = data[i].displayName;

                length += _len;
                for (var j = 0; j < _len; j++) {
                    str += '<div><span data-id="' + _data[j].id + '" data-nodeId="' + _data[j].nodeId + '" data-type="' + type + '" data-pageType="' + name + '" draggable="true" class="search_go_detail">' + _data[j].displayName + '</span></div>'
                }
            }

            txt += '<li>' +
                '<h4 class="topology_mesType_title" data-hide="false">' +
                '<span class="topo_direction triangleRight"></span>' +
                '<span class="search_result_title">' + displayName + '</span>' +
                '<span>( ' + length + ' )</span>' +
                '</h4>' +
                '<div class="search_box" style="display: none">' +
                str +
                '</div>' +
                '</li>';

            return txt;
        }
    }

    //跳到详细页面
    function goDetail() {
        $(".search_go_detail").on('click', function() {
            getBaseMessage(true, $(this).attr('data-id'), $(this).attr('data-type'), false, "#topo_search_detail");
        });
    }

    //关闭警告框
    $("#page_alert_button").on('click', function() {
        $("#page_alert").hide();
        $("#page_alert_content").html("");
    });

    //警告框的显示
    window.showAlert = function(title, content, color) {
        $("#page_alert_title").html(title).css("color", color);
        $("#page_alert_content").html(content);
        $("#page_alert").show();
    };

    //显示本地缓存的统计(goTopo这个没用了可以不要了)
    // if (localStorage.topo_flag === "true") {
    //     var str = localStorage.topoNodes ?
    //         JSON.parse(localStorage.topoNodes).totalHtml : '';
    //     $("#total_type_box").mCustomScrollbar("destroy");
    //     $("#total_type_box").html(str);
    //     $("#total_type_box").mCustomScrollbar({
    //         theme: Magicube.scrollbarTheme,
    //         autoHideScrollbar: true
    //     });
    //     outputSelectId();
    //     totalOptions();
    //     messageShow(".total_title_text", true);
    // }

    //小图标的变换以及显示隐藏
    function messageShow(id, flag) {
        $(id).on('click', function () {
            var target = flag ? $(this).parent() : $(this);
            if (target.attr("data-hide") === "false") {
                $(this).addClass("mesType_title_active");
                target.next().css("display", "block");
                target.attr("data-hide", "true");
                $(this).children(".topo_direction").addClass('triangleDown').removeClass('triangleRight');
            } else {
                $(this).removeClass("mesType_title_active");
                target.next().css("display", "none");
                target.attr("data-hide", "false");
                $(this).children(".topo_direction").addClass('triangleRight').removeClass('triangleDown');
            }

            let crc = $(".check_relate_content");
            let crclen = 0;
            crc.each(function(i,c) {
              crclen += $(c).height();
            });
            let pheight = crclen+400;
            crc.parent().height(pheight);
        });
    }

  //地图设置框
  //tab切换
  $(".map_setting_tab").off('click').on('click', function () {

    var val = $(this).attr("value");
    if(val === "基本设置"){
      $(".map_settings_message").addClass("map_settings_message_hide");
      $("#map_settings_base").removeClass("map_settings_message_hide");
    }else if(val === "显示设置"){
      $(".map_settings_message").addClass("map_settings_message_hide");
      $("#map_settings_show").removeClass("map_settings_message_hide");
    }else if(val === "区域设置"){
      $(".map_settings_message").addClass("map_settings_message_hide");
      $("#map_settings_area").removeClass("map_settings_message_hide");
    }

    $("#map_settings").css("height","20px").show();
    setTimeout(function(){
      $("#map_settings").css("height","260px");
    },20);
    $(this).addClass("map_setting_tab_active").siblings().removeClass("map_setting_tab_active");
  });

  //右侧菜单
  let map_tools_header_sign = false;
  $("#map_tools_header").unbind("click").bind("click",function () {
    if(map_tools_header_sign){//隐藏
      map_tools_header_sign = false;
      $(this).css("border","0").css("height","38px").css("width","40px");
      $("#map_usual_tools").css("overflow","hidden").css("height","0px");
      setTimeout(function () {
        if(!map_tools_header_sign){
          $("#map_usual_tools").css("border","0");
        }
      },800);
    }else{ // 显示
      $(this).css("border","1px solid rgba(66,212,255,.6)").css("height","40px").css("width","40px");
      map_tools_header_sign = true;
      $("#map_usual_tools").css("border","1px solid rgba(66,212,255,0.6)").css("height","191px");
      setTimeout(function () {
        if(map_tools_header_sign){
          $("#map_usual_tools").css("overflow","visible");
        }
      },800);
    }
  });



  //gis菜单totip
  d3.selectAll("#map_tools_header").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","map_totips")
        .style("margin-left","-36px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "菜单";
        });
    };
  })
    .on("mouseout",function (d,i) {
      d3.selectAll(".map_totips").remove();
    });

  d3.selectAll("#map_tool").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","map_totips")
        .style("margin-left","-36px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "选区";
        });
    };
  })
    .on("mouseout",function (d,i) {
      d3.selectAll(".map_totips").remove();
    });


  d3.selectAll("#map_fullscreen").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-36px")
      .style("width",function(d,i){
        return "28px";
      })
      .text(function(d,i){
        return "全屏";
      });
  })
  .on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });

  d3.selectAll("#map_filter").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-56px")
      .style("width",function(d,i){
        return "50px";
      })
      .text(function(d,i){
        return "过滤器";
      });
  })
  .on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });

  d3.selectAll("#map_findnodes").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-36px")
      .style("width",function(d,i){
        return "30px";
      })
      .text(function(d,i){
        return "检索";
      });
  })
  .on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });

  d3.selectAll("#map_back").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-36px")
      .style("width",function(d,i){
        return "30px";
      })
      .text(function(d,i){
        return "后退";
      });
  })
  .on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });

  d3.selectAll("#map_resetscreen").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-36px")
      .style("width",function(d,i){
        return "30px";
      })
      .text(function(d,i){
        return "清屏";
      });
  })
  .on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });

  d3.selectAll("#map_warning_person").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-36px")
      .style("margin-top","-16px")
      .style("width",function(d,i){
        return "30px";
      })
      .text(function(d,i){
        return "告警";
      });
  }).on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });

  d3.selectAll("#topo_dashboard").on("mouseover",function (d,tools) {
    d3.select(this).append("p")
      .attr("class","map_totips")
      .style("margin-left","-36px")
      .style("margin-top","-16px")
      .style("width",function(d,i){
        return "30px";
      })
      .text(function(d,i){
        return "发布";
      });
  }).on("mouseout",function (d,i) {
    d3.selectAll(".map_totips").remove();
  });



})