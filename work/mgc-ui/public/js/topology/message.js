$(function () {
	var messageAllContent = [],
		baseType = ["相关的实体", "相关的事件", "相关的文档"],
		setTimeFlag,
		detailBlank = 0;
	window.searchToGisData = '';
	//获取基本信息
	window.getBaseMessage = function (clearMessage, id, type, flag, detaileId, relateId) {
		var _detaileId = detaileId ? detaileId : "#check_detail_contents";
		var _relateId = relateId ? relateId : "#check_relate_contents";
		if (!clearMessage) {
			$(_detaileId).mCustomScrollbar("destroy");
			$(_detaileId).html("");
			$(_relateId).mCustomScrollbar("destroy");
			$(_relateId).html("");
			messageAllContent[0] = $("#topo_search_content").html();
			localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
			return false;
		}
		$.get(EPMUI.context.url + '/object/detailInformation/' + id + '/' + type, function (data) {
			if (data == null || data == 'null' || data == '' || data == undefined) {
				return false;
			}
			window.useToGisData = JSON.parse(data);
			var datas = JSON.parse(data);
			var icons = datas.magicube_interface_data.icon;
			//var objectIcon ='/image/' + icons;
			var taiYuanObjectType = datas.magicube_interface_data.objectType || '';
			baseBasic(datas.magicube_interface_data.property.basic, id, type, datas.magicube_interface_data.pageType, icons, _detaileId, taiYuanObjectType);
			if (flag) {
				getbaseRelate(id, type, _relateId);
			}
			messageAllContent[0] = $("#topo_search_content").html();
			localStorage.setItem('messageAllContent', JSON.stringify(messageAllContent));
		});
	};

	//详细信息中基本信息块
	window.baseBasic = function (data, id, type, pageType, icon, parentNodeId, objectType) {
		var imgUrl = icon + '/' + pageType;
		var baseData = data;
		var image = pageType === "document" ? "" :
			// '<img id="topo_detail_photo" src="' + EPMUI.context.url + imgUrl + '"/>';
			'<img id="topo_detail_photo" src="?" alt="头像" onerror="window.MGC.proxyImage(this, \'' + icon + '\', \'' + objectType.toLowerCase() + '\')"/>';
		var str = '<span class="topo_checkout_detail icon-eye-circle" ' +
			'data-type="' + type + '" data-pageType="' + pageType + '" data-id="' + id + '">查看</span>' + image;
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
		$(".topo_checkout_detail").on('click', function () {
			location.href = '/' + $(this).attr('data-pageType') + '?id=' + id + '&type=' + $(this).attr("data-type");
		});
	};

	//拼接详细信息中的关系
	window.getbaseRelate = function (id, type, parentNodeId) {
		$.get(EPMUI.context.url + '/object/detailInformation/related/' + id + '/' + type, function (data) {
			const dataJson = JSON.parse(data);
			if (dataJson.code === 200) {
				const relateData = dataJson.magicube_interface_data;
				let parentStr = "";
				for (var i in relateData) {
					let relateStr = "";
					const parentName = i === 'document' ? '相关文档' : i === 'event' ? '相关事件' : '相关实体';
					if (relateData[i].length > 0) {
						const childrenData = relateData[i];
						for (let j = 0; j < childrenData.length; j++) {
							let _str = "";
							for (let k = 0; k < childrenData[j].value.length; k++) {
								const grandSonData = childrenData[j].value[k];
								const pageType = grandSonData.objectType;
								_str += `<div class=relate_list_box>
											<span class=base_relate_list draggable=true data-type=${pageType} data-pageType=${i} data-id=${grandSonData.objectId} data-nodeId=${grandSonData.nodeId} data-show=false>${grandSonData.objectName}</span>
										</div>`;
							}
							relateStr += `<div class=check_children_relate_content>
											<h6 class=base_children_relate_title data-hide=false><span class=${"'topo_direction triangleRight'"}></span>${childrenData[j].display}</h6>
											<div class=base_relate_lists>${_str}</div>
										</div>`;
						}
						parentStr += `<div class=check_parent_relate_content>
										<h6 class=base_parent_relate_title data-hide=false><span class=${"'topo_direction triangleRight'"}></span>${parentName}</h6>
										<div class=base_parent_relate_lists>${relateStr}</div>
									</div>`;
					}
				}
				$(parentNodeId).mCustomScrollbar("destroy");
				$(parentNodeId).html(parentStr);
				$(parentNodeId).mCustomScrollbar({
					theme: Magicube.scrollbarTheme,
					autoHideScrollbar: true
				});
				hoverShowDetail();
				dragDomMakeTopo(".base_relate_list");
				messageShow(".base_parent_relate_title", false);
				messageShow(".base_children_relate_title", false);
			}
		})
	};

	//鼠标放在详细的相关上会出现对应的详细
	window.hoverShowDetail = function () {
		$(".base_relate_list").on('mouseover', function () {
			var _this = this;
			clearTimeout(setTimeFlag);

			setTimeFlag = setTimeout(function () {
				$(".detail_relate_detail").hide();
				if ($(_this).attr('data-show') === "false") {
					$(_this).attr('data-show', true).parent().append('<div style="display: none" class="detail_relate_detail"></div>');
					$.get(EPMUI.context.url + '/object/detailInformation/' + $(_this).attr("data-id") + '/' + $(_this).attr("data-type"), function (data) {
						if (!data) {
							return false;
						}
						var basicArr = JSON.parse(data).magicube_interface_data.property.basic;
						var str = '<div class="relate_detail_arrows icon-angle-up"></div><div class="relate_detail_hide">×</div>';
						for (var i = 0; i < basicArr.length; i++) {
							if (basicArr[i].display === "摘要") {
								str += "";
							} else {
								if (i === 0) {
									basicArr[i].value = basicArr[i].value || '';
									str += '<div style="width: 90%;"><span class="relate_detail_title">' + basicArr[i].display + '：</span><span>' + basicArr[i].value + '</span></div>'
								} else {
									basicArr[i].value = basicArr[i].value || '';
									str += '<div><span class="relate_detail_title">' + basicArr[i].display + '：</span><span>' + basicArr[i].value + '</span></div>'
								}
							}
						}
						$(_this).next().html(str);
						$(_this).next().show();
						$('.relate_detail_hide').unbind("click").bind("click", function () {
							$(this).parent().hide();
							//修改父div的高度
							if ($(this).parent().height() > 400) {
								let crc = $(".check_relate_content");
								let parentHeight = crc.parent().height();
								let pheight = parentHeight + $(this).parent().height() - 400;
								crc.parent().height(pheight);
							}
						});
						//修改父div的高度
						if ($(_this).next().height() > 400) {
							let crc = $(".check_relate_content");
							let parentHeight = crc.parent().height();
							let pheight = parentHeight + $(_this).next().height() - 400;
							crc.parent().height(pheight);
						}
					});

				} else {
					$(_this).siblings().next().hide();
					$(_this).next().show();
				}
			}, 400);
		});

		$(".base_relate_list").on('mouseout', function () {
			clearTimeout(setTimeFlag);
			//$(this).next().hide();
		});
	};
	var handler = function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (!e.dataTransfer.getData('text').match("dragFlag")) {
			return false;
		}
		var dropObj = JSON.parse(e.dataTransfer.getData('text'));
		var allNodeId = [];
		nodes.forEach(function (node) {
			allNodeId.push(node.id);
		});
		//请求借口的数据,得到topo数据
		$.get(EPMUI.context.url + "/object/" + "partInformation/" + dropObj.id + "/" + dropObj.type, function (searchNodes) {
			var dataSearch = $.parseJSON(searchNodes);
			var topoObj = jQuery.creatTopologyNode(dataSearch);
			topoObj.x = e.x;
			topoObj.y = e.y;
			if (!allNodeId.includes(topoObj.id)) {
				nodes.push(topoObj);
				globalFuction.drawTopoMap();
				searchToGisData = useToGisData;
				localStorage.setItem("saveState", false);
			} else {
				$(".Mgnodes[id='" + topoObj.id + "']").addClass("selected")
			}
		});
	}
	/**
	 * 拖动相关内容到工作台
	 * @param className
	 */
	function dragDomMakeTopo(className) {
		let target = $('.topo-console').get(0),
			dragNodes = document.querySelectorAll(className),
			len = dragNodes.length;

		for (let i = 0; i < len; i++) {
			dragNodes[i].addEventListener('dragstart', function (e) {
				let dragObject = {
					type: this.dataset.type,
					id: this.dataset.id,
					dragFlag: true
				};
				e.dataTransfer.setData('text', JSON.stringify(dragObject));
			});
		}

		target.addEventListener('dragover', function (e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			return false;
		}, false);
		target.addEventListener('drop', handler, false);
	}
	//移除绑定的事件
	function removeDragEvent(className) {
		var target = $('.topo-console').get(0);
		target.removeEventListener("drop", handler, false);
	}
	//统计操作
	//点击选择按钮，判断一个属性，值是show，列表变为展示状态；值为hide时，列表变为可选择显示或隐藏状态
	window.totalOptions = function () {
		$("#total_checkbox_flag").on('click', function () {
			if ($(this).attr("data-checkbox") === "show") {
				$(".total_select_data").hide();
				$(this).attr("data-checkbox", "hide").addClass('icon-check-circle-o defaultColor').removeClass('icon-check-circle-o-blue clickColor');
			} else {
				$(".total_select_data").show();
				$(this).attr("data-checkbox", "show").addClass('icon-check-circle-o-blue clickColor').removeClass('icon-check-circle-o defaultColor');
			}
		});
		//刷新按钮
		$("#total_checkbox_refresh").on('click', function () {
			var deleteNode = [];
			$(".total_select_data_children").each(function (index, item) {
				if ($(item).prop("checked") === true) {
					var nodeList = JSON.parse($(item).next().attr("data-idlists"));
					deleteNode = deleteNode.concat(nodeList);
					if ($(item).hasClass("total_select_data_children")) { //检查一个元素是否包含这个类
						$(item).parentsUntil("tbody").remove();
					} else {
						$(item).parentsUntil("li").remove();
						$("#check_detail_contents").html("");
						$("#check_relate_contents").html("");
						localStorage.removeItem("forceNodes");
					}
				}
			});
			localStorage.setItem("goTopo", false);
			if (deleteNode.length > 0) {
				globalFuction.deleteNodesLinks(deleteNode);
			}
		})
	};

	//获取统计信息
	//应该是某个页面一加载时，调用这个函数，传入当前一些数据，这个数据是空的时候，统计模块最外面的额大盒子就是空的
	window.getTotalMessage = function (idArr) {
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
			$("#total_type_box").html(str);
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
			success: function (data) {
				var datas = [],
					count = 0;
				data.forEach(function (item) {
					dataType.forEach(function (_item) {
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

	//拼接统计信息外层字符串
	//外层就是有一个h3和一个就是实体
	window.totalMesWrap = function (w_data) {
		var str = "";
		var len = w_data.length;
		for (var i = 0; i < len; i++) {
			var _flag, _display, _active, _image;
			i === 0 ? _flag = "true" : _flag = "false";
			i === 0 ? _display = "display:block" : _display = "display:none";
			i === 0 ? _active = "mesType_title_active" : _active = "";
			i === 0 ? _image = "triangleDown" : _image = "triangleRight";
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
	window.totalMesMiddle = function (data, className, flag) {
		let content_middle = "";
		let _data = data;
		if (_data.length !== 0) {
			var len = _data.length;
			for (let i = 0; i < len; i++) {
				let _flag, _display, _active, _image,_inputStyle;
				_flag = i === 0 ? "true" : "false";
				_display = i === 0 ? "display:block" : "display:none";
				_active = i === 0 ?  "mesType_title_active" : "";
				_image = i === 0 ? "triangleDown" : "triangleRight";
				_inputStyle = i === 0 ? "icon-pull-up" : "icon-pull-down";
				let str = !flag ? totalMesMiddle(_data[i].data, "topology_thridPro_title", true) : totalMesList(_data[i].data);
				content_middle += '<li>' +
					'<p class="' + className + '" data-hide=' + _flag + '>' +
					'<input type="checkbox" class="total_select_data total_select_data_parent ' + _inputStyle + '" checked="true">' +
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
	window.totalMesList = function (data) {
		var str = '';
		for (var i = 0, len = data.length; i < len; i++) {
			str += '<tr>' +
				'<td>' +
				'<p>' +
				'<input type="checkbox" class="total_select_data total_select_data_children icon-check-square-o">' +
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
		$('.total_select_data_children').prop('checked',true);
		var sontent = '<table class="total_classifyList_table">' + str + '</table>';
		return sontent;
	};

	//选中统计信息前面的复选框，对外输出类型
	window.outputSelectId = function () {
		$(".total_select_data_children").off().on('click', function () {
			// 隐藏得点
			let propertyAllId = [];
			// 显示得点
			let addId = [];
			//勾选显示点
			if ($(this).prop("checked") === true) {
				$(this).prop("checked", true).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
				//$(this).parent().next().find(".total_select_data").prop("checked", true).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
				//checkedJudgement($("#total_checked_box"));
				propertyAllId = [...new Set([...new Set(propertyAllId), ...new Set(getmessageId($(this), propertyAllId))])];
				globalFuction.statisticFilter(propertyAllId);
				//取消勾选隐藏点
			} else {
				$(this).prop("checked", false).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
				//$(this).parent().next().find(".total_select_data").prop("checked", false).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
				//checkedJudgement($("#total_checked_box"));
				addId = getmessageId($(this));
				propertyAllId = [...new Set([...propertyAllId].filter(x => !new Set(addId).has(x)))];
				globalFuction.statisticFilter(addId, "checked");
			}
		});
	};

	//进行父子级联动判断勾选与未勾选状态
	window.checkedJudgement = function (obj) {
		var _obj = obj.children('li').children('ul');
		if (_obj.length !== 0) {
			_obj.each(function (index, item) {
				checkedJudgement($(item));
				if ($(item).find('input:checked').length === $(item).find('input').length) {
					console.log(1);
					//$(item).prev().children('input').prop("checked", true).removeClass("icon-square-o-blue").addClass("icon-check-square-o");
				} else if ($(item).find('input:checked').length !== $(item).find('input').length && $(item).find('input:checked').length !== 0) {
					console.log(2);
					$(item).prev().children('input').prop("checked", true).addClass("icon-square-o-blue").removeClass("icon-check-square-o");
				} else {
					//$(item).prev().children('input').prop("checked", true).addClass("icon-square-o-blue").removeClass("icon-check-square-o");
				}
			});
		}
	};

	// 勾选显示与隐藏工作台上的点
	window.getmessageId = function (obj) {
		let list = obj.parent().siblings('ul').find('input');
		let propertyAllId = [];
		// 循环到最内层的input开始存各点的id
		if (list.length === 0) {
			obj.each(function (index, item) {
				if (typeof $(item).next().attr("data-idLists") == 'string') {
					propertyAllId = propertyAllId.concat(JSON.parse($(item).next().attr("data-idLists")));
				}
			});
			// 数组去重
			propertyAllId = [...new Set(propertyAllId)];
			return propertyAllId;
		} else {
			return getmessageId(list);
		}
	};

	//功能：控制选择列表展开后收起时图标的状态
	function messageShow(id, flag) {
		$(id).on('click', function () {
		var target = flag ? $(this).parent() : $(this);
		if (target.attr("data-hide") === "false") {
			$(this).addClass("mesType_title_active");
			target.next().css("display", "block");
			target.attr("data-hide", "true");
			$(this).children(".topo_direction").addClass('triangleDown').removeClass('triangleRight');
			$(this).siblings('.total_select_data_parent').addClass('icon-pull-up').removeClass('icon-pull-down');
		} else {
			$(this).removeClass("mesType_title_active");
			target.next().css("display", "none");
			target.attr("data-hide", "false");
			$(this).children(".topo_direction").addClass('triangleRight').removeClass('triangleDown');
			$(this).siblings('.total_select_data_parent').addClass('icon-pull-down').removeClass('icon-pull-up');
		}
		let crc = $(".check_relate_content");
		let crclen = 0;
		crc.each(function (i, c) {
			crclen += $(c).height();
		});
		let pheight = crclen + 400;
		crc.parent().height(pheight);
		});
	}
	//右上角的搜索
	$("#search_input").on('keyup', function (e) {
		if (e.keyCode === 13) {
			getSearchData($("#search_input").val().trim());
			//防止节点抖动
			for (var j = 0; j < nodes.length; j++) {
				nodes[j].fixed = true;
			}
		}
	});

	$("#search_btn").on('click', function () {
		getSearchData($("#search_input").val().trim());
	});

	$("#topo_search_none").on('click', function () {
		$("#search_input").focus();
	});

	//弹出创建标签弹框
	$("#topo_go_makeLabel").on('click', function () {
		$("#document_modal").show();
		//$("#topo_shade").show();
		$("#make_label").val($("#search_input").val());
	});

	//关闭创建标签弹框
	$("#make_cancel").on('click', function () {
		$("#document_modal").hide();
		//$("#topo_shade").hide();
	});

	//创建标签
	$("#make_ensure").on('click', function () {
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

		$(".make_detail_list").each(function (index, item) {
			if (!!$(item).html().trim()) {
				propertyObj[$(item).attr("data-type")] = $(item).html();
			}
		});

		makeObj.property = JSON.stringify(propertyObj);
		$.post(EPMUI.context.url + '/document/createobject', makeObj, function (data) {
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
			//这里有问题
			if ($("#add_topo_checkbox").prop("checked") === true) {
				var topoObj = {
					name: name,
					objectType: pageType,
					type: objectType,
					fixed: true,
					selected: true,
					display: "block",
					nodeType: 0,
					nodeWeight: 0,
					x: 400,
					y: 200,
					fill: "#0088b1",
					stroke: "#33d0ff"
				};
				topoObj.id = datas.data.objectId;
				topoObj.nodeId = datas.data.nodeId;
				nodes.push(topoObj);
				globalFuction.drawTopoMap(0);
			}
			showAlert("提示!", datas.message.reason, "#33d0ff");
			getSearchData($("#make_label").val().trim());
		});
		$("#document_modal").hide();
		//$("#topo_shade").hide();

	});

	//获取搜索数据
	function getSearchData(value) {
		if (!!value) {
			$(".topology_message_tab_active").removeClass("topology_message_tab_active");
			$("#topo_search_title").addClass("topology_message_tab_active");
			$(".topo_message").hide();
			$("#topology_message_search").show();
			$("#topology_search_loading").hide();

			$.get(EPMUI.context.url + '/objects/' + value, function (data) {
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
			text += searchMes_m(data[i].data, data[i].systemName);
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
		var displayName = name;
		// switch (name) {
		// 	case "document":
		// 		displayName = "文档";
		// 		break;
		// 	case "entity":
		// 		displayName = "实体";
		// 		break;
		// 	case "event":
		// 		displayName = "事件";
		// 		break;
		// }

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
		$(".search_go_detail").on('click', function () {
			getBaseMessage(true, $(this).attr('data-id'), $(this).attr('data-type'), false, "#topo_search_detail");
		});
	}

	//关闭警告框
	$("#page_alert_button").on('click', function () {
		$("#page_alert").hide();
		$("#page_alert_content").html("");
	});

	//警告框的显示
	window.showAlert = function (title, content, color) {
		$("#page_alert_title").html(title).css("color", color);
		$("#page_alert_content").html(content);
		$("#page_alert").show();
	};

	//显示本地缓存的统计
	// if (localStorage.topo_flag === "true" && localStorage.goTopo === "false") {
	// 	alert(1);
	// 	var str = localStorage.topoNodes ?
	// 		JSON.parse(localStorage.topoNodes).totalHtml : '';
	// 	$("#total_type").mCustomScrollbar("destroy");
	// 	$("#total_type_box").html(str);
	// 	$("#total_type").mCustomScrollbar({
	// 		theme: Magicube.scrollbarTheme,
	// 		autoHideScrollbar: true
	// 	});
	// 	outputSelectId();
	// 	totalOptions();
	// 	messageShow(".total_title_text", true);
	// }
});