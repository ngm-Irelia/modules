/**
 * Created by (ngm) on 2017/8/2.
 *
 *
 * @fileoverview 基于百度地图实现的部分功能
 * 基于Baidu Map API 2.0
 *
 * @author ngm
 * @version 1.0
 */

/**
 * @namespace ngm 基于百度地图实现功能的所有类均放在BMapNgm命名空间下
 */
var CommonBMap = window.CommonBMap = CommonBMap || {};
(function() {

  CommonBMap.commonBMap = commonBMap;

  function commonBMap() {
    var map;
    let mapJsonStyle = [
      {
        "featureType": "land",
        "elementType": "geometry",
        "stylers": {
          "color": "#303d47"
        }
      },
      {
        "featureType": "water",
        "elementType": "all",
        "stylers": {
          "color": "#536981"
        }
      },
      {
        "featureType": "green",
        "elementType": "all",
        "stylers": {
          "color": "#b0d3dd"
        }
      },
      {
        "featureType": "highway",
        "elementType": "geometry.fill",
        "stylers": {
          "color": "#d2eef0"
        }
      },
      {
        "featureType": "highway",
        "elementType": "geometry.stroke",
        "stylers": {
          "color": "#7dabb3"
        }
      },
      {
        "featureType": "arterial",
        "elementType": "geometry.fill",
        "stylers": {
          "color": "#d6e4e5"
        }
      },
      {
        "featureType": "arterial",
        "elementType": "geometry.stroke",
        "stylers": {
          "color": "#b0d5d4"
        }
      },
      {
        "featureType": "local",
        "elementType": "labels.text.fill",
        "stylers": {
          "color": "#7a959a"
        }
      },
      {
        "featureType": "local",
        "elementType": "labels.text.stroke",
        "stylers": {
          "color": "#d6e4e5"
        }
      },
      {
        "featureType": "arterial",
        "elementType": "labels.text.fill",
        "stylers": {
          "color": "#3d85c6"
        }
      },
      {
        "featureType": "highway",
        "elementType": "labels.text.fill",
        "stylers": {
          "color": "#374a46"
        }
      },
      {
        "featureType": "highway",
        "elementType": "labels.text.stroke",
        "stylers": {
          "color": "#6aa84f"
        }
      },
      {
        "featureType": "manmade",
        "elementType": "geometry",
        "stylers": {
          "color": "#1d3549"
        }
      },
      {
        "featureType": "building",
        "elementType": "geometry.fill",
        "stylers": {
          "color": "#415362"
        }
      },
      {
        "featureType": "railway",
        "elementType": "all",
        "stylers": {
          "color": "#bf9000"
        }
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": {
          "color": "#3d85c6",
          "weight": "3.1",
          "lightness": -46,
          "saturation": 93
        }
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": {
          "color": "#ffffff"
        }
      },
      {
        "featureType": "label",
        "elementType": "labels.text.fill",
        "stylers": {
          "color": "#ffffff"
        }
      },
      {
        "featureType": "label",
        "elementType": "labels.text.stroke",
        "stylers": {
          "color": "#022338"
        }
      }
    ];
    //加载地图
    this.run = function(mapid){
      let mapstyle = getCookie("theme");
      mapload = true;
      map = new BMap.Map(mapid,{enableMapClick: false});    // 创建Map实例
      mapstyle === "white" ? map.setMapStyle({style:'normal'}) : map.setMapStyle({styleJson:mapJsonStyle});
      map.centerAndZoom(new BMap.Point(106.24, 39.915), 4);  // 初始化地图,设置中心点坐标和地图级别43.24, 57.915  106.24, 39.915
      map.addControl(new BMap.OverviewMapControl());
      map.setCurrentCity("北京");           //设置地图显示的城市
      map.disableScrollWheelZoom();     //开启鼠标滚轮缩放
      map.disableDragging();   //  禁止拖拽
      map.disableDoubleClickZoom();         //启用鼠标双击放大
      map.disablePinchToZoom();        //禁用双指操作缩放
      map.enableAutoResize();     // 自适应容器


      map.setDefaultCursor("pointer");
      let scaleMap = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT,offset: new BMap.Size(311, 30)});
      map.addControl(scaleMap);

      $("svg[type='system']").css("cursor","pointer");
      $("img[src='http://api0.map.bdimg.com/images/copyright_logo.png']").css("display",'none');
      $("a[href='http://www.openstreetmap.org/']").parent().parent().parent().css("display",'none');




      setTimeout(function () { map.centerAndZoom(new BMap.Point(106.24, 39.915), 4); },1000);
      setTimeout(function () { map.centerAndZoom(new BMap.Point(106.24, 39.915), 4); },2000);
      setTimeout(function () { map.centerAndZoom(new BMap.Point(106.24, 39.915), 4); },3000);

      map.addEventListener("tilesloaded",function(){
        $("svg[type='system']").css("cursor","pointer");
        $("img[src='http://api0.map.bdimg.com/images/copyright_logo.png']").css("display",'none');
        $("a[href='http://www.openstreetmap.org/']").parent().parent().parent().css("display",'none');
        setTimeout(function () {
          $("a[href='http://www.openstreetmap.org/']").parent().css("display",'none');
        },1000);
      });

    };

    function getCookie(cname){
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++)
      {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
      return "";
    }
    //commonMap END!!
  }

})();
