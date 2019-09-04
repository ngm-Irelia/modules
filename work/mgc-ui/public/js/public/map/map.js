/**
 * Created by ngm on 2018/7/23.
 */
$(function () {
  window.mapload = false;
  //动态加载js
  function mapLoadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if(typeof(callback) != "undefined"){
      if (script.readyState) {// ie
        script.onreadystatechange = function () {
          if (script.readyState == "loaded" || script.readyState == "complete") {
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


  //加载对应地图
  window.loadGis = function (data, baseId, w, h) {
    if(!mapload){
      /*if(EPMUI.context.gis.type==="bmap"){
        mapLoadScript('/js/public/map/commonBMap.js',function () { //加载,并执行回调函数
          window.USEMAP = new CommonBMap.commonBMap();
          USEMAP.run("aChartb");
        });
      }*/
      $("#"+baseId+" div").html(" ");
      //let dgis = new dGIS(baseId, $("#"+baseId).width(), $("#"+baseId).height());
      var width = w || $("#"+baseId).width();
      var height= h || $("#"+baseId).height()
      let dgis = new dGIS(baseId, width, height);
      dgis.run();
      //模拟点数据  
      let manyPoints;
      if(data){
        manyPoints = JSON.parse(data);
      }else {
        manyPoints = [
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
          },
          {
            id: "333",
            type: "entity",
            objectType:"entity",
            name: "沂水",
            nodeId: "333",
            addnode:true,
            gis:{
              lon:"84.434898",
              lat:"33.303039"
            }
          }

        ];
      }
      dgis.addManyPoint(manyPoints);

      var $mapBox = $("#"+baseId+" div");   
      try{
        !!$mapBox.data("mCS") && $mapBox.mCustomScrollbar("destroy"); //Destroy
      }catch (e){
        $mapBox.data("mCS",''); //手动销毁             
      };
      $mapBox.mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true,
        axis:"x"
      }); 

    }
  }



});