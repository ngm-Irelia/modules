define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "esri/Color",
  "dojo/_base/connect",

  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/TextSymbol",

  "esri/dijit/PopupTemplate",
  "esri/layers/GraphicsLayer"
], function (
  declare, arrayUtils, Color, connect,
  SpatialReference, Point, Graphic, SimpleMarkerSymbol, TextSymbol, 
  PopupTemplate, GraphicsLayer
) {
  return declare([GraphicsLayer], {

    constructor: function(options) {
      // options:
      //   data:  Object[]
      //     Array of objects. Required. Object are required to have properties named x, y and attributes. The x and y coordinates have to be numbers that represent a points coordinates.
      //   distance:  Number?
      //     Optional. The max number of pixels between points to group points in the same cluster. Default value is 50.
      //   labelColor:  String?
      //     Optional. Hex string or array of rgba values used as the color for cluster labels. Default value is #fff (white).
      //   labelOffset:  String?
      //     Optional. Number of pixels to shift a cluster label vertically. Defaults to -5 to align labels with circle symbols. Does not work in IE.
      //   resolution:  Number
      //     Required. Width of a pixel in map coordinates. Example of how to calculate: 
      //     map.extent.getWidth() / map.width
      //   showSingles:  Boolean?  -- 这两个应该注掉
      //     Optional. Whether or graphics should be displayed when a cluster graphic is clicked. Default is true.
      //   singleSymbol:  MarkerSymbol?  -- 这两个应该注掉
      //     Marker Symbol (picture or simple). Optional. Symbol to use for graphics that represent single points. Default is a small gray SimpleMarkerSymbol.
      //   singleTemplate:  PopupTemplate? -- 信息框
      //     PopupTemplate</a>. Optional. Popup template used to format attributes for graphics that represent single points. Default shows all attributes as "attribute = value" (not recommended).
      //   maxSingles:  Number?
      //     Optional. Threshold for whether or not to show graphics for points in a cluster. Default is 1000.
      //   webmap:  Boolean?
      //     Optional. Whether or not the map is from an ArcGIS.com webmap. Default is false.
      //   spatialReference:  SpatialReference?
      //     Optional. Spatial reference for all graphics in the layer. This has to match the spatial reference of the map. Default is 102100. Omit this if the map uses basemaps in web mercator.
      
      this._clusterTolerance = options.distance || 50;
      this._clusterData = options.data || [];
      this._clusters = [];
      this._clusterLabelColor = options.labelColor || "#000";
      // labelOffset can be zero so handle it differently
      this._clusterLabelOffset = (options.hasOwnProperty("labelOffset")) ? options.labelOffset : -5;
      // graphics that represent a single point
      this._singles = []; // populated when a graphic is clicked
      this._showSingles = options.hasOwnProperty("showSingles") ? options.showSingles : true;
      // symbol for single graphics
      var SMS = SimpleMarkerSymbol;
      this._singleSym = options.singleSymbol || new SMS("circle", 6, null, new Color("#888"));
      //this._singleTemplate = options.singleTemplate || new PopupTemplate({ "title": "", "description": "{*}" });
      this._maxSingles = options.maxSingles || 1000;

      this._webmap = options.hasOwnProperty("webmap") ? options.webmap : false;

      this._sr = options.spatialReference || new SpatialReference({ "wkid": 102100 });

      this._zoomEnd = null;

      this.pdata = [];
      this.cdata = [];
    },

    // override esri/layers/GraphicsLayer methods 
    _setMap: function(map, surface) {
      // calculate and set the initial resolution
      this._clusterResolution = map.extent.getWidth() / map.width; // probably a bad default...
      this._clusterGraphics();

      // connect to onZoomEnd so data is re-clustered when zoom level changes
      this._zoomEnd = connect.connect(map, "onZoomEnd", this, function() {
        this.pdata = [];
        this.cdata = [];
        // update resolution
        this._clusterResolution = this._map.extent.getWidth() / this._map.width;
        this.clear();
        this._clusterGraphics();

      });

      // GraphicsLayer will add its own listener here
      var div = this.inherited(arguments);
      return div;
    },

    _unsetMap: function() {
      this.inherited(arguments);
      connect.disconnect(this._zoomEnd);
    },

    // public ClusterLayer methods
    add: function(p) {
      // Summary:  The argument is a data point to be added to an existing cluster. If the data point falls within an existing cluster, it is added to that cluster and the cluster's label is updated. If the new point does not fall within an existing cluster, a new cluster is created.
      //
      // if passed a graphic, use the GraphicsLayer's add method
      if ( p.declaredClass ) {
        this.inherited(arguments);
        return;
      }

      // add the new data to _clusterData so that it's included in clusters
      // when the map level changes
      this._clusterData.push(p);
      var clustered = false;
      // look for an existing cluster for the new point
      for ( var i = 0; i < this._clusters.length; i++ ) {
        var c = this._clusters[i];
        if ( this._clusterTest(p, c) ) {
          // add the point to an existing cluster
          this._clusterAddPoint(p, c);
          // update the cluster's geometry
          this._updateClusterGeometry(c);
          // update the label
          this._updateLabel(c);
          clustered = true;
          break;
        }
      }

      if ( ! clustered ) {
        this._clusterCreate(p);
        p.attributes.clusterCount = 1;
        this._showCluster(p);
      }
    },

    clear: function() {
      // Summary:  Remove all clusters and data points.
      this.inherited(arguments);
      this._clusters.length = 0;
        d3.selectAll(".svgAreaMarker").remove();//移除原来的
    },

    clearSingles: function(singles) {
      // Summary:  Remove graphics that represent individual data points.
      var s = singles || this._singles;
      arrayUtils.forEach(s, function(g) {
        this.remove(g);
      }, this);
      this._singles.length = 0;
    },

    /*onClick: function(e) {
      // remove any previously showing single features
      this.clearSingles(this._singles);

      // find single graphics that make up the cluster that was clicked
      // would be nice to use filter but performance tanks with large arrays in IE
      var singles = [];
      for ( var i = 0, il = this._clusterData.length; i < il; i++) {
        if ( e.graphic.attributes.clusterId == this._clusterData[i].attributes.clusterId ) {
          singles.push(this._clusterData[i]);
        }
      }
      if ( singles.length > this._maxSingles ) {
        //alert("Sorry, that cluster contains more than " + this._maxSingles + " points. Zoom in for more detail.");
        return;
      } else {
        // stop the click from bubbling to the map
        e.stopPropagation();
        this._map.infoWindow.show(e.graphic.geometry);
        this._addSingles(singles);
      }
    },*/

      onClick: function(e) {

      },

    // internal methods 
    _clusterGraphics: function() {
      // first time through, loop through the points
      for ( var j = 0, jl = this._clusterData.length; j < jl; j++ ) {
        // see if the current feature should be added to a cluster
        var point = this._clusterData[j];
        var clustered = false;
        var numClusters = this._clusters.length;
        for ( var i = 0; i < this._clusters.length; i++ ) {
          var c = this._clusters[i];
          if ( this._clusterTest(point, c) ) {
            this._clusterAddPoint(point, c);
            clustered = true;
            break;
          }
        }

        if ( ! clustered ) {
          this._clusterCreate(point);
        }
      }
      this._showAllClusters();
    },

    _clusterTest: function(p, cluster) {
      var distance = (
        Math.sqrt(
          Math.pow((cluster.x - p.x), 2) + Math.pow((cluster.y - p.y), 2)
        ) / this._clusterResolution
      );
      return (distance <= this._clusterTolerance);
    },

    // points passed to clusterAddPoint should be included 
    // in an existing cluster
    // also give the point an attribute called clusterId 
    // that corresponds to its cluster
    _clusterAddPoint: function(p, cluster) {
      //ngm 吧需要隐藏的点放进数组
        this.pdata.push(p);
      // average in the new point to the cluster geometry
      var count, x, y;
      count = cluster.attributes.clusterCount;
      x = (p.x + (cluster.x * count)) / (count + 1);
      y = (p.y + (cluster.y * count)) / (count + 1);
      cluster.x = x;
      cluster.y = y;

      // build an extent that includes all points in a cluster
      // extents are for debug/testing only...not used by the layer
      if ( p.x < cluster.attributes.extent[0] ) {
        cluster.attributes.extent[0] = p.x;
      } else if ( p.x > cluster.attributes.extent[2] ) {
        cluster.attributes.extent[2] = p.x;
      }
      if ( p.y < cluster.attributes.extent[1] ) {
        cluster.attributes.extent[1] = p.y;
      } else if ( p.y > cluster.attributes.extent[3] ) {
        cluster.attributes.extent[3] = p.y;
      }
        //给聚合集添加 point信息

        var clusterpp = cluster.attributes.pp;
        clusterpp.push(p);
        cluster.attributes.pp = clusterpp;
      // increment the count
      cluster.attributes.clusterCount++;
      // attributes might not exist
      if ( ! p.hasOwnProperty("attributes") ) {
        p.attributes = {};
      }
      // give the graphic a cluster id
      p.attributes.clusterId = cluster.attributes.clusterId;

      setTimeout(function () {
          d3.selectAll("#a"+cluster.attributes.clusterId+"a").remove();//移除原来的

          var xyToLngLat = {
              x:cluster.x,
              y:cluster.y
          };
          var LngLatdata = turnSpace(xyToLngLat,"xyToLngLat");//返回值是经纬度数组
          var XYdata = turnSpace(new esri.geometry.Point(LngLatdata[0], LngLatdata[1]),"toScreen");// 屏幕距离

          //svg的大小
          var width = 60;
          var height = 60;
          //父元素的偏移量ngm写
          var fx = $("#basemap_gc").css("transform").replace(/[^0-9\-,]/g,'').split(',')[4];
          var fy = $("#basemap_gc").css("transform").replace(/[^0-9\-,]/g,'').split(',')[5];

            if(fx == null){
                fx = 0;
            }
          if(fy == null){
              fy = 0;
          }
          var svg = d3.select("#clusters_layer")//.attr("transform","translate("+e.clientX+","+e.clientY+")")
              .append("svg")
              .attr("width",width)
              .attr("height",height)
              .attr("x",parseFloat(XYdata.x)-30-fx) //应该获得父类svg的translate 进行计算  or map点击测试 e.srcElement.attributes.y.value
              .attr("y",parseFloat(XYdata.y)-45-fy)
              .attr("class","svgAreaMarker")
              .attr("id","a"+cluster.attributes.clusterId+"a");

          var markerType = [];
          if(cluster.attributes.hasOwnProperty("pp")){
              for(var i=0;i<cluster.attributes.pp.length;i++){
                  var type = cluster.attributes.pp[i].attributes.attr.type;
                  var haveSign = false;
                  for(var j=0;j<markerType.length;j++){
                      if(markerType[j].typeName == type){
                          haveSign = true;
                          markerType[j].size++;
                      }
                  }
                  if(!haveSign){//没有 ，新加一个type
                      var lizi = {
                          typeName:type,
                          size:1
                      }
                      markerType.push(lizi);
                  }

              }
          }

          if(cluster.attributes.hasOwnProperty("ps")){
              var type = cluster.attributes.ps.attr.type;
              var haveSign = false;
              for(var j=0;j<markerType.length;j++){
                  if(markerType[j].typeName == type){
                      haveSign = true;
                      markerType[j].size++;
                  }
              }
              if(!haveSign){//没有 ，新加一个type
                  var lizi = {
                      typeName:type,
                      size:1
                  }
                  markerType.push(lizi);
              }

          }


          var areaCopies = 0;//份数
          for(var i=0;i<markerType.length;i++){
              areaCopies += markerType[i].size;
          }

          var dataset = [];
          var addCopies = 0;//保存递增的角度
          // 知道了总份数areaCopies 求对应的，建立dataset
          for(var i=0;i<markerType.length;i++){
              var end = addCopies+(markerType[i].size/areaCopies)*2;
              var oneData = {
                  startAngle:Math.PI*addCopies,
                  endAngle:Math.PI*end,
                  typeName:markerType[i].typeName,
                  size:markerType[i].size,
                  percent: (100*markerType[i].size/areaCopies).toFixed(0)
              }
              addCopies += (markerType[i].size/areaCopies)*2;
              dataset.push(oneData);
          }

          /*var dataset = [{startAngle:0,endAngle:Math.PI*0.6},
           {startAngle:Math.PI*0.6,endAngle:Math.PI},
           {startAngle:Math.PI,endAngle:Math.PI*1.7},
           {startAngle:Math.PI*1.7,endAngle:Math.PI*2}];*/


          //创建 弧 生成器
          var arcPath = d3.svg.arc()
              .innerRadius(13)
              .outerRadius(30);

          var color = ["#0099FF","#CCCC33","#9A32CD","#99CCFF","#663366","#996633","#663300","#993366","#CCCCFF","#FFFF99"];
          //var color = ["#008CFF","#FFBF00","#FF0000","#FF00F2","#B700FF"];
          // 添加路径,"
          var arcs = svg.selectAll("path")
              .data(dataset)
              .enter()
              .append("path")
              .attr("d",function(d){
                  return arcPath(d);
              })
              .attr("transform","translate(30,30)")
              .attr("stroke","black")
              .attr("stroke-width","0.5px")
              .attr("fill",function(d,i){
                  return color[i];
              })

          svg.selectAll("text")
              .data(dataset)
              .enter()
              .append("text")
              .attr("transform",function(d){
                  return "translate(30,30)"+"translate("+ arcPath.centroid(d)+")";//弧的中心
              })
              .attr("text-anchor","middle")//居中
              .attr("fill","black")
              .attr("font-size","18px")
              .text(function(d){

                  return d.percent+"%";
                  //return Math.floor((d.endAngle-d.startAngle)*180/Math.PI)+"`";
              })
          //提示框
          var tooltip = d3.select("body")
              .append("div")
              .attr("class","tooltip")
              .style("display","none");

          arcs.on("mouseover",function(d){
              /*
               鼠标移入：
               （1）通过selection.thml()更改提示框的文字
               （2）通过更改style样式left和top来设置提示框的位置
               （3）设置提示框透明度为1.0  不透明
               */

              tooltip.html(d.typeName+":"+d.size)
                  .style("left",(d3.event.pageX)+"px")
                  .style("top",(d3.event.pageY+5)+"px")
                  .style("display","block");
          })
              .on("mousemove",function(d){
                  // 鼠标移动，更改样式left top 来改变提示框的位置
                  tooltip.style("left",(d3.event.pageX)+"px")
                      .style("top",(d3.event.pageY+5)+"px")
              })
              .on("mouseout",function(d){
                  // 鼠标 移出，透明度改为0
                  tooltip.style("display","none")
              })
      },30)





    },

    // point passed to clusterCreate isn't within the 
    // clustering distance specified for the layer so
    // create a new cluster for it
    _clusterCreate: function(p) {
      var clusterId = this._clusters.length + 1;
      // console.log("cluster create, id is: ", clusterId);
      // p.attributes might be undefined
      if ( ! p.attributes ) {
        p.attributes = {};
      }
      p.attributes.clusterId = clusterId;
      // create the cluster
        var pp = [];
      var cluster = { 
        "x": p.x,
        "y": p.y,
        "attributes" : {
          "clusterCount": 1,
          "clusterId": clusterId,
          "extent": [ p.x, p.y, p.x, p.y ],
            "ps":p.attributes,
            "pp":pp,
            "id":p.attributes.attr.id
        }
      };
      this._clusters.push(cluster);







    },

    _showAllClusters: function() {
      for ( var i = 0, il = this._clusters.length; i < il; i++ ) {
        var c = this._clusters[i];
        this._showCluster(c);
      }
        // 判断集群里面的点为哪些，让pictureLayer中对应点隐藏
        /*console.log(this.cdata)
        console.log(this.pdata)*/
        //调用前面的方法，隐藏其pictureLayer
        arcgisHidePoint(this.pdata,this.cdata);

    },

    _showCluster: function(c) {
      var point = new Point(c.x, c.y, this._sr);
      this.add(
        new Graphic(
          point, 
          null, 
          c.attributes
        )
      );
      // code below is used to not label clusters with a single point
      if ( c.attributes.clusterCount == 1 ) {
        return;
      }

      // show number of points in the cluster
      var label = new TextSymbol(c.attributes.clusterCount.toString())
        .setColor(new Color(this._clusterLabelColor))
        .setOffset(0, this._clusterLabelOffset);
      this.add(
        new Graphic(
          point,
          label,
          c.attributes
        )
      );
        this.cdata.push(c)
      //ngm 在这添加d3制作的div svg
    },

    _addSingles: function(singles) {
      // add single graphics to the map
      arrayUtils.forEach(singles, function(p) {
        var g = new Graphic(
          new Point(p.x, p.y, this._sr),
          this._singleSym,
          p.attributes
          //this._singleTemplate
        );
        this._singles.push(g);
        if ( this._showSingles ) {
          this.add(g);
        }
      }, this);
      this._map.infoWindow.setFeatures(this._singles);
    },

    _updateClusterGeometry: function(c) {
      // find the cluster graphic
      var cg = arrayUtils.filter(this.graphics, function(g) {
        return ! g.symbol &&
               g.attributes.clusterId == c.attributes.clusterId;
      });
      if ( cg.length == 1 ) {
        cg[0].geometry.update(c.x, c.y);
      } else {
        console.log("didn't find exactly one cluster geometry to update: ", cg);
      }
    },

    _updateLabel: function(c) {
      // find the existing label
      var label = arrayUtils.filter(this.graphics, function(g) {
        return g.symbol && 
               g.symbol.declaredClass == "esri.symbol.TextSymbol" &&
               g.attributes.clusterId == c.attributes.clusterId;
      });
      if ( label.length == 1 ) {
        // console.log("update label...found: ", label);
        this.remove(label[0]);
        var newLabel = new TextSymbol(c.attributes.clusterCount)
          .setColor(new Color(this._clusterLabelColor))
          .setOffset(0, this._clusterLabelOffset);
        this.add(
          new Graphic(
            new Point(c.x, c.y, this._sr),
            newLabel,
            c.attributes
          )
        );
        // console.log("updated the label");
      } else {
        console.log("didn't find exactly one label: ", label);
      }
    },

    // debug only...never called by the layer
    _clusterMeta: function() {
      // print total number of features
      console.log("Total:  ", this._clusterData.length);

      // add up counts and print it
      var count = 0;
      arrayUtils.forEach(this._clusters, function(c) {
        count += c.attributes.clusterCount;
      });
      console.log("In clusters:  ", count);
    }

  });
});

