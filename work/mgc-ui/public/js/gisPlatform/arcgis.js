if (trackStatues[i] == "pathMigratory") { //迁徙轨迹
	if (mapCommon.mapWorkMarker[0].graphic.attributes.name === "田雪") {
		var data = {
			"code": 200,
			"message": "成功",
			"magicube_interface_data": [{
					"gis": [
						121.7425337,
						20.4195612
					],
					"tripMode": "airplane",
					"name": "[121.7425337,20.4195612]",
					"time": "T1"
				},
				{
					"gis": [
						116.6098338,
						16.7158791
					],
					"tripMode": "airplane",
					"name": "[116.6098338,16.7158791]",
					"time": "T2"
				},
				{
					"gis": [
						114.9187130,
						12.3840818
					],
					"tripMode": "airplane",
					"name": "[114.9187130,12.3840818]",
					"time": "T3"
				},
				{
					"gis": [
						111.7633487,
						8.5435468
					],
					"tripMode": "airplane",
					"name": "[111.7633487,8.5435468]",
					"time": "T4"
				}
			]
		};

		var addData = data.magicube_interface_data;
		var curveAnimationPoints = [];

		let lushulen = lushuNum.length + 1;
		let lushuName = "l" + lushulen;
		lushuNum.push({
			name: lushuName,
			size: 0,
			lushu: []
		});

		window.tripData = addData;
		for (var k = 0; k < addData.length; k++) {
			if (k == 0) {
				var addDataFirst = {
					time: addData[0].time,
					tripMode: addData[0].tripMode,
					address: addData[0].name,
					gis: {
						lon: addData[0].gis[0],
						lat: addData[0].gis[1]
					}
				}
				var linePoints = mapCommonPart.getCurveByTwoPoints(basePoint, addDataFirst, 200);
				addCurve(linePoints, basePoint, addDataFirst, "base");
				for (var l = 0; l < linePoints.length; l++) {
					curveAnimationPoints.push(linePoints[l]);
				}
				//轨迹动画
				//curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
				runCurveAnimation(linePoints, basePoint, "track", addData[k].tripMode, k, lushuName);
			}
			if (k > 0) {
				var addDataFirst = {
					time: addData[k - 1].time,
					tripMode: addData[k - 1].tripMode,
					address: addData[k - 1].name,
					gis: {
						lon: addData[k - 1].gis[0],
						lat: addData[k - 1].gis[1]
					}
				};

				var addDataSecond = {
					time: addData[k].time,
					tripMode: addData[k].tripMode,
					address: addData[k].name,
					gis: {
						lon: addData[k].gis[0],
						lat: addData[k].gis[1]
					}
				};
				var linePoints = mapCommonPart.getCurveByTwoPoints(addDataFirst, addDataSecond, 200);
				if (k == addData.length - 1) {
					addCurve(linePoints, basePoint, addDataSecond, "last");
				} else {
					addCurve(linePoints, basePoint, addDataSecond, "base");
				}
				for (var l = 0; l < linePoints.length; l++) {
					curveAnimationPoints.push(linePoints[l]);
				}
				//轨迹动画
				//curveAnimation(linePoints,basePoint,"track", addData[k].tripMode, k);
				runCurveAnimation(linePoints, basePoint, "track", addDataSecond.tripMode, k, lushuName);
			}
		}
		return '';
	}
	
}


// 修改：轨迹路径 和 动画分离
function runCurveAnimation(points, basePoint, sign, tripMode, tripNum, lushuName) {
	let lushu = mapCommonPart.getLuShuByName(lushuName);

	if (tripNum == 0) {
		curveAnimation(points, basePoint, sign, tripMode, tripNum, lushuName);
	} else {
		var stopnum = 0;
		var lushuSetInt = setInterval(function() {
			stopnum++;
			if (tripNum == lushu.size) {
				curveAnimation(points, basePoint, sign, tripMode, tripNum, lushuName);
				clearInterval(lushuSetInt);
			}
			if (stopnum > 150) {
				clearInterval(lushuSetInt);
			}
		}, 500);
		lushu.lushu.push(lushuSetInt); // 把定时器存到相关的数据下
	}
}
//轨迹动画
function curveAnimation(points, basePoint, sign, tripMode, tripNum, lushuName) {
	let lushu = mapCommonPart.getLuShuByName(lushuName);
	var pt = new esri.geometry.Point(points[0].lon, points[0].lat);

	//设置标注显示的图标
	var symbol1;
	if (tripMode === "car") {
		symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[1], 20, 25);
	} else if (tripMode === "airplane") {
		symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[0], 30, 30);
	} else if (tripMode === "train") {
		symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[2], 20, 25);
	} else if (tripMode === "boat") {
		symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[3], 30, 35);
	} else if (tripMode === "no") {
		symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[3], 1, 1);
	} else {
		symbol1 = new esri.symbol.PictureMarkerSymbol(gisMoveImages[1], 20, 25);
	}
	symbol1.setColor(new esri.Color([220, 20, 60, 1]))
	symbol1.clickSign = "false";

	//要在模版中显示的参数
	var attr = {
		sign: "curveAnimationPoint"
	};

	//创建图像
	var graphic = new esri.Graphic(pt, symbol1, attr);
	//把图像添加到刚才创建的图层上
	graphicLayer.add(graphic);

	var cAsize = 0; //记录走过的位置
	var cA = setInterval(function() {
		if (cAsize < points.length) {
			var geometry = new esri.geometry.Point(points[cAsize].lon, points[cAsize].lat);
			graphic.setGeometry(geometry);
			if (cAsize > 0) {
				//动图角度调整
				var angle = setAnimationRotation(points[cAsize - 1], points[cAsize]);

				//graphic.symbol.setAngle(angle);
				graphic.symbol.setAngle(angle - 90);
				var addCurveData = [];
				addCurveData.push(points[cAsize - 1]);
				addCurveData.push(points[cAsize]);
				//addCurve(addCurveData,basePoint,points[0],sign); // 小车跑过路线变色
			}
			cAsize++;
		} else {
			lushu.size = lushu.size + 1;
			clearInterval(cA);
			//图标也要去掉了
			graphicLayer.remove(graphic);

			var tripDataSize = tripData.length + 1;
			if (tripData && tripDataSize == lushu.size) { //添加预测区域
				let expectPoint = {
					"gis": [
						109.7633487,
						5.5435468
					],
					"tripMode": "airplane",
					"name": "[109.7633487,5.5435468]",
					"time": "2017-11-13 04:22:00"
				};

				let l = tripData.length;
				var addFirst = {
					time: tripData[l - 1].time,
					tripMode: tripData[l - 1].tripMode,
					address: tripData[l - 1].name,
					gis: {
						lon: tripData[l - 1].gis[0],
						lat: tripData[l - 1].gis[1]
					}
				};

				var addSecond = {
					time: expectPoint.time,
					tripMode: expectPoint.tripMode,
					address: expectPoint.name,
					gis: {
						lon: expectPoint.gis[0],
						lat: expectPoint.gis[1]
					}
				};
				var addlinePoints = mapCommonPart.getCurveByTwoPoints(addFirst, addSecond);
				var bPoint = {
					gis: {
						lon: mapCommon.mapWorkMarker[0].graphic.attributes.gis.lon,
						lat: mapCommon.mapWorkMarker[0].graphic.attributes.gis.lat
					},
					id: mapCommon.mapWorkMarker[0].graphic.attributes.id
				};

				addCurve(addlinePoints, bPoint, addSecond, "dashed", "dashed");

			}

		}
	}, 100);

}
//动画角度调整 在每个点的真实步骤中设置小车转动的角度
function setAnimationRotation(curPos, targetPos) {
	var me = this;
	var deg = 0;

	if (targetPos.lon != curPos.lon) {
		var tan = (targetPos.lat - curPos.lat) / (targetPos.lon - curPos.lon),
			atan = Math.atan(tan);
		deg = atan * 360 / (2 * Math.PI);
		//degree  correction;
		if (targetPos.lon < curPos.lon) {
			deg = -deg;

		} else { // 这个地方有问题
			deg = 180 - deg;
		}
		return deg;
	} else {
		var disy = targetPos.lat - curPos.lat;
		var bias = 0;
		disy > 0 ? bias = -1 : bias = 1;
		return -bias * 90;
	}
	return;
}
//添加弧线路径
function addCurve(points, baseP, lastP, sign, CurveType) {
	var color;
	if (sign === "place") {
		color = new esri.Color([127, 255, 0, 1]); //127,255,0
	} else if (sign === "track") {
		color = new esri.Color([253, 175, 0, 1]); //253,175,0
	} else if (sign === "base" || sign === "last") {
		color = new esri.Color([34, 179, 255, 1]); //170,33,22
	} else {
		color = new esri.Color([34, 179, 255, 1]); //127,255,0
	}

	if (sign === "dashed") { // 预测区域不加点
		var pt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
		//设置标注显示的图标
		var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/twinkle.gif", 50, 50);
		symbol1.clickSign = "false";
		//要在模版中显示的参数
		var attr = {
			sign: "CurvePoint",
			address: lastP.address,
			id: baseP.id
		};
		//创建图像
		var graphic = new esri.Graphic(pt, symbol1, attr);
		//把图像添加到刚才创建的图层上
		graphicLayer.add(graphic);

		setTimeout(function() {
			//加文字标签
			var textattr = {
				address: lastP.name,
				id: baseP.id,
				sign: "text"
			};
			var textpt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
			var textSymbol = new esri.symbol.TextSymbol("预测区域");
			textSymbol.setColor(new esri.Color([255, 255, 0, 1]));
			textSymbol.setOffset(0, -50);
			//创建图像
			var textGraphic = new esri.Graphic(textpt, textSymbol, textattr);
			//把图像添加到刚才创建的图层上
			graphicLayer.add(textGraphic);

			//添加一个预测区域 ----
			var symbolC = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SHORTDASHDOT);
			symbolC.setColor([220, 20, 60, 0.3]).outline.setColor([220, 20, 60, 0.4]);

			var circleC = new esri.geometry.Circle({
				"center": [lastP.gis.lon, lastP.gis.lat],
				"radius": 120000
			});
			var circleattr = {
				address: lastP.name,
				id: baseP.id,
				sign: "circle"
			};
			var circleGraphic = new esri.Graphic(circleC, symbolC, circleattr);
			graphicLayer.add(circleGraphic);
		}, 1000)

		return '';
	}

	for (var i = 1; i < points.length; i++) {
		var polylineJson = {
			"paths": [
				[
					[points[i].lon, points[i].lat],
					[points[i - 1].lon, points[i - 1].lat]
				]
			],
			"spatialReference": {
				"wkid": 4326
			}
		};

		var polyline = new esri.geometry.Polyline(polylineJson);

		var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID);
		lineSymbol.setColor(color);
		if (CurveType === "dashed") {
			lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDASHDOT);
			lineSymbol.setColor([220, 20, 60, 1]);
		}

		lineSymbol.setWidth(1);
		let time = lastP.time ? lastP.time : "";
		var lineAttr = {
			sign: "Curveline",
			id: baseP.id,
			time: time
		}

		var graphicLine = new esri.Graphic(polyline, lineSymbol, lineAttr);
		lineGraphicLayer.add(graphicLine);
	}
	if (sign === "base") {
		//在最后位置加点
		var pt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
		//设置标注显示的图标
		var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle.png", 20, 20);
		symbol1.clickSign = "false";
		//要在模版中显示的参数
		var attr = {
			sign: "CurvePoint",
			address: lastP.address,
			id: baseP.id
		};
		//创建图像
		var graphic = new esri.Graphic(pt, symbol1, attr);
		//把图像添加到刚才创建的图层上
		graphicLayer.add(graphic);

		//加文字标签
		var textattr = {
			time: lastP.time,
			id: baseP.id,
			sign: "text"
		};
		var textpt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
		var textSymbol = new esri.symbol.TextSymbol(lastP.address);
		textSymbol.setColor(new esri.Color([255, 25, 0, 1]));
		textSymbol.setOffset(0, 10);
		//创建图像
		var textGraphic = new esri.Graphic(textpt, textSymbol, textattr);
		//把图像添加到刚才创建的图层上
		graphicLayer.add(textGraphic);

	} else if (sign === "last") {
		//在最后位置加点
		var pt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
		//设置标注显示的图标
		var symbol1 = new esri.symbol.PictureMarkerSymbol("../../../image/gis/circle.png", 20, 20);
		symbol1.clickSign = "false";
		//要在模版中显示的参数
		var attr = {
			sign: "CurvePoint",
			address: lastP.address,
			id: baseP.id
		};
		//创建图像
		var graphic = new esri.Graphic(pt, symbol1, attr);
		//把图像添加到刚才创建的图层上
		graphicLayer.add(graphic);

		//加文字标签
		var textattr = {
			time: lastP.time,
			id: baseP.id,
			sign: "text"
		};
		var textpt = new esri.geometry.Point(lastP.gis.lon, lastP.gis.lat);
		var textSymbol = new esri.symbol.TextSymbol(lastP.address);
		textSymbol.setColor(new esri.Color([255, 25, 0, 1]));
		textSymbol.setOffset(0, 10);
		//创建图像
		var textGraphic = new esri.Graphic(textpt, textSymbol, textattr);
		//把图像添加到刚才创建的图层上
		graphicLayer.add(textGraphic);

	}

}
