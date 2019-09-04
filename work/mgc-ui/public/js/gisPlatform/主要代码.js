//清除跨省人员流动效果
function removePeopleMove(){
  var allOverlays = map.getOverlays();
  for(var k=0;k<allOverlays.length;k++) {
      if (allOverlays[k].hasOwnProperty("type")&&allOverlays[k].type === "peopleMoveLine") {
          map.removeOverlay(allOverlays[k]);
      }
  }
}

/**
* 跨省人员流动效果
* @param {*} returnData 人员流动数据
*/
function peopleMove(returnData){
  //把其他所有点线 隐藏 有两点，根据产生弧线方法得到paths 加点的graphic，然后移动graphic
  //添加动画的线条
  for(var i=0;i<returnData.length;i++){
      var symbolcolor;
      if(returnData[i].populationSize<2222){
          symbolcolor = "#00A9EC";
      }else if(returnData[i].populationSize>=2222&&returnData[i].populationSize<5555){
          symbolcolor = "#E9F01D";
      }else if(returnData[i].populationSize>=5555){
          symbolcolor = "#EB3F2F";
      }
      var pMovePoints = peopleMoveGetCurveByTwoPoints(returnData[i].source,returnData[i].target);

      var newPoints = [];
      for(var k=1;k<pMovePoints.length;k++){
          var pointNEW = new BMap.Point(pMovePoints[k-1].lon, pMovePoints[k-1].lat);
          newPoints.push(pointNEW);
      }

      var polyline = new BMap.Polyline(newPoints, {strokeColor:symbolcolor, strokeWeight:1, strokeOpacity:0.6,strokeStyle:"dashed"});
      polyline.type="peopleMoveLine";
      map.addOverlay(polyline);
  }

  peopleMoveSetTime(returnData);

}
//人员轨迹
function peopleMoveSetTime(returnData){
  for(var i=0;i<returnData.length;i++){
      runPeopleMove(returnData[i].source,returnData[i].target,returnData[i].populationSize);
  }
}

/**
* 人员流动 效果开始
* @param {*} point1         起点
* @param {*} point2         终点
* @param {*} populationSize 流动的数量
*/
function runPeopleMove(point1,point2,populationSize){
  let pMovePoints = peopleMoveGetCurveByTwoPoints(point1,point2);
  let numPMP = 0;
  let numPMPSize = [10,9,8,7,6,5,4,3,2,1]
  let runPMP = setInterval(function () {
      if(numPMP<9){
          peopleMoveCurveAnimation(pMovePoints,numPMPSize[numPMP],populationSize);
          numPMP++;
      }else{
          clearInterval(runPMP);
      }
  },5);
}

/**
* 人员流动 动画
* @param {*} points          轨迹点数据
* @param {*} size            动画点的大小
* @param {*} populationSize  流动的数量
*/
function peopleMoveCurveAnimation(points,size,populationSize) {
  var pt = new BMap.Point(points[0].lon, points[0].lat);

  var pmMarker;
  if(populationSize<2222){

      pmMarker = new BMap.Marker(pt);
      pmMarker.setIcon(new BMap.Icon(gisPeopleMoveImages[1],new BMap.Size(size,size),{anchor : new BMap.Size(0, 0)}));

  }
  else if(populationSize>=2222&&populationSize<5555){

      pmMarker = new BMap.Marker(pt);
      pmMarker.setIcon(new BMap.Icon(gisPeopleMoveImages[3],new BMap.Size(size,size),{anchor : new BMap.Size(0, 0)}));

  }else if(populationSize>=5555){
      pmMarker = new BMap.Marker(pt);
      pmMarker.setIcon(new BMap.Icon(gisPeopleMoveImages[5],new BMap.Size(size,size),{anchor : new BMap.Size(0, 0)}));
  }


  map.addOverlay(pmMarker);

  var cAsize = 0;//记录走过的位置
  var cA = setInterval(function () {
      if(cAsize<points.length){
          var geometry = new BMap.Point(points[cAsize].lon, points[cAsize].lat);
          pmMarker.setPosition(geometry);
          cAsize++;
      }else{
          clearInterval(cA);
          //图标也要去掉了
          var pmIcon;
          if(populationSize<2222){
              pmIcon = new BMap.Icon(gisPeopleMoveImages[0],new BMap.Size(21-size*2,21-size*2),{anchor : new BMap.Size(-size+10, -size+10)})
          }else if(populationSize>=2222&&populationSize<5555){
              pmIcon = new BMap.Icon(gisPeopleMoveImages[2],new BMap.Size(21-size*2,21-size*2),{anchor : new BMap.Size(-size+10, -size+10)})
          }else if(populationSize>=5555){
              pmIcon = new BMap.Icon(gisPeopleMoveImages[4],new BMap.Size(21-size*2,21-size*2),{anchor : new BMap.Size(-size+10, -size+10)});
          }
          pmMarker.setIcon(pmIcon);
          setTimeout(function(){
              map.removeOverlay(pmMarker);
          },500);

      }
  },5);

}

/**
* 人员流动 根据两点，计算弧线路径
* @param {*} obj1 起点
* @param {*} obj2 终点
* @param {*} sign 标志 暂留
*/
function peopleMoveGetCurveByTwoPoints(obj1, obj2,sign) {
  var lat1 = parseFloat(obj1.gis.lat);
  var lat2 = parseFloat(obj2.gis.lat);
  var lng1 = parseFloat(obj1.gis.lon);
  var lng2 = parseFloat(obj2.gis.lon);


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

  //计算count个数 根据经纬度
  var lineX = (lat1-lat2 >0?lat1-lat2:lat2-lat1);
  var lineY = (lng1-lng2 >0?lng1-lng2:lng2-lng1);
  var sqrtXY = Math.sqrt(lineX*lineX + lineY*lineY);
  var count=parseInt(sqrtXY*10); // 曲线是由一些小的线段组成的，这个表示这个曲线所有到的折线的个数

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
      t = 0;
      h = lng1 - lng2;
  } else if (lng2 == lng1) {
      t = Math.PI / 2;
      h = lat1 - lat2;
  } else {
      t = Math.atan((lat2 - lat1) / (lng2 - lng1));
      h = (lat2 - lat1) / Math.sin(t);
  }
  if (t2 == 0) {
      t2 = (t + (Math.PI / 5));
  }
  h2 = h / 2;
  lng3 = h2 * Math.cos(t2) + lng1;
  lat3 = h2 * Math.sin(t2) + lat1;

  for (i = 0; i < count + 1; i++) {
      /*curveCoordinates.push(new BMap.Point(
        (lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
        (lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc))
        ));*/
      curveCoordinates.push({
              "lon":(lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
              "lat":(lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc))
          }
      );
      inc = inc + (1 / count);
  }

  return curveCoordinates;
}