$(function(){
//图表的提示信息
    d3.selectAll("#tool_photo").on("mouseover",function (d,tools) {
      if (true) {
        d3.select(this).append("p")
          .attr("class","totips")
          .style("margin-left","-50px")
          .style("width",function(d,i){
            return "30px";
          })
          .text(function(d,i){
            return "快照";
         });
      };
    })
    .on("mouseout",function (d,i) {
        d3.selectAll(".totips").remove();
    });

    d3.selectAll("#tool_fullscreen").on("mouseover",function (d,tools) {
      if (true) {
        d3.select(this).append("p")
          .attr("class","totips")
          .style("margin-left","-50px")
          .style("width",function(d,i){
            return "30px";
          })
          .text(function(d,i){
            return "全屏";
         });
      };
    })
    .on("mouseout",function (d,i) {
        d3.selectAll(".totips").remove();
    });
  d3.selectAll("#tool_filter").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","totips")
        .style("margin-left","-70px")
        .style("width",function(d,i){
          return "50px";
        })
        .text(function(d,i){
          return "过滤器";
       });
    };
  })
  .on("mouseout",function (d,i) {
      d3.selectAll(".totips").remove();
  });

  d3.selectAll("#tool_findnodes").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","totips")
        .style("margin-left","-50px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "搜索";
       });
    };
  })
  .on("mouseout",function (d,i) {
      d3.selectAll(".totips").remove();
  });

  d3.selectAll("#tool_back").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","totips")
        .style("margin-left","-50px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "后退";
       });
    };
  })
  .on("mouseout",function (d,i) {
      d3.selectAll(".totips").remove();
  });

  d3.selectAll("#tool_linepath").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","totips")
        .style("margin-left","-50px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "连线";
       });
    };
  })
  .on("mouseout",function (d,i) {
      d3.selectAll(".totips").remove();
  });

  d3.selectAll("#tool_resetscreen").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","totips")
        .style("margin-left","-50px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "清屏";
       });
    };
  })
  .on("mouseout",function (d,i) {
      d3.selectAll(".totips").remove();
  });
  d3.selectAll("#tool_export").on("mouseover",function (d,tools) {
    if (true) {
      d3.select(this).append("p")
        .attr("class","totips")
        .style("margin-left","-50px")
        .style("width",function(d,i){
          return "30px";
        })
        .text(function(d,i){
          return "导出";
       });
    };
  })
  .on("mouseout",function (d,i) {
      d3.selectAll(".totips").remove();
  });

});
