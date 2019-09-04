$(function(){
var template = [
    {
        'template': 'A',
        'allPosition': [0, 1, 2, 3, 4, 5, 6],
        'nofill': [0, 1, 2, 3, 4, 5, 6],
        'enable': 1
    },
    {
        'template': 'B',
        'allPosition': [0, 1, 2, 3, 4, 5, 6],
        'nofill': [0, 1, 2, 3, 4, 5, 6],
        'enable': 0
    },
    {
        'template': 'C',
        'allPosition': [0, 1, 2, 3, 4, 5],
        'nofill': [0, 1, 2, 3, 4, 5],
        'enable': 0
    }
];
//索引 对应 数据 1：[]
var index, tempData;
var isBig = false;
var targetDashboardId;
var templateList;

//数组里的每项字符串转为省略样式（澳大..）
Array.prototype.omit = function(){
    var omitArr = [];
    for(var j = 0, len=this.length; j < len; j++) {
        omitArr = this;
          var str = this[j].xValue;
          var slen = this[j].xValue.replace(/[^\x00-\xff]/g,"01").length;
          if(slen>6){
              var er = this[j].xValue.substring(0,2)+"..";
              omitArr[j].xValue = er;
          }
    }
    return omitArr;
}

//数组每项元素，保持不同
Array.prototype.uniq = function(){
    for(var i=0; i<this.length; i++){
        for(var k=i+1; k<this.length; k++){
            if(this[i].xValue == this[k].xValue){   
                this[k].xValue = this[k].xValue + " ";
            }
        }
    }
}

//获取数组中每项元素，字符串最长的一项,返回svg宽度
Array.prototype.getLongestStr = function(stackingFold){
    var temp=0;
    var width = 70*this.length;
    for(var j=0; j<this.length; j++){
        var slen = this[j].xValue.replace(/[^\x00-\xff]/g,"01").length;
        if(slen>temp){
            temp = slen;
        }
    }
    if(temp>10){
        width = temp*7*this.length+20*this.length*(stackingFold-1);
    }
    return width;
}

Array.prototype.getlength = function(){
    var temp=0;
    for(var j=0; j<this.length; j++){
        var slen = 0;
        for(var l=0; l<this[j].length; l++){
            slen += this[j][l].replace(/[^\x00-\xff]/g,"01").length;
        }
        if(slen>temp){
            temp = slen;
        }
    }
    return temp;
}

//参数为数组和 字符串
window.pie = function(dataSource, id, tip, transW, transH) {
    $('#'+id+' .barTipText').remove();
    $('#'+id+' .barTip').remove();
    $('#'+id+' .pieTipText').remove();
    $('#'+id+' .pieTip').remove();
    $('#'+id+' svg').remove();
    var $chartBox = $("#"+id+">div");   
    try{
      !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $chartBox.data("mCS",''); //手动销毁             
    };
    var center,
        w = transW || $("#"+id).width(),
        h = transH || $("#"+id).height(),
        padding = { left:50, right:50, top:60, bottom:30 },
        datas = dataSource[0].statisticalItems,
        colora_ = [],
        colora = ["#b2db4e", "#ea901e", "#ffff29", "#4cb3d2", "#d94d4c", "#a981e4", "#eaff56", "#2ddfa3", "  #70f2ff","#f57983", "#85f1e2", "#ff780c", "#e0efe8", "#10a8ab", "#b2db4e", "#a1f480", "#ff9798", "  #591ece", "#f99070","#3dbcc2", "#b2db4e", "#ea901e", "#ffff29", "#4cb3d2", "#d94d4c", "#a981e4", "  #eaff56", "#2ddfa3", "#70f2ff", "#f57983", "#85f1e2", "#ff780c", "#e0efe8", "#10a8ab", "#b2db4e", "#a1f480", "#ff9798", "#591ece", "#f99070", "#3dbcc2"];
    h > w ? center = w : center = h;
    var norm = 0.5 * center / (dataSource.length * 3);
    
    for(var i = 0; i < datas.length; i++){
        datas[i].yValue = Number(datas[i].yValue);
    }

    var svg = d3.select("#"+id+" div").append("svg").attr("height", h).attr("width", w).attr("class", "ctrl svgsvg");
    var pie = d3.layout.pie().value( function(d){ return d.yValue; } );
    var color = ["#f57983","#a1f480","#591ece","#10a8ab"];  
    for(var k=0; k<dataSource.length; k++){
        //第二个圆环,圆环的数据是0的应该去掉
        for(var i = 0; i < dataSource[k].length; i++){
            if(dataSource[k][i].yValue == 0){
                dataSource[k].splice(i, 1);
            }   
        }
        var change = dataSource[k].statisticalItems;
        var piedata_ = pie(change);
        var r_in = norm * ( 2 * k + 1 );
        var r_out = norm * ( 2 * k + 2 );   // .startAngle(0)    
        var r_out_b = r_out + 10;
        var arc_ = d3.svg.arc().innerRadius(r_in).outerRadius(r_out);//生成一个线性弧度,弧生成器
        var arc = d3.svg.arc().innerRadius(r_in).outerRadius(r_out_b);//交互效果的弧生成器
        var arcs_ = svg.selectAll(".sty_").data(piedata_).enter().append("g")
                       .attr("transform", "translate(" + w/2 + "," + (h/2+15) + ")"); //分组      
        var pa = arcs_.append("path")//往分组里添加路径
                      .attr("d", function(d){
                          return arc_(d);
                      })
                      .attr("fill", function(d, i){
                         var tmpColor;
                         colora[i] ? tmpColor = colora[i] : tmpColor = "#f1bcc3";
                         colora_.push(tmpColor);
                         return tmpColor; 
                      })
                      .attr("class", function(d, i){ return "pa"+id+k+i+""; });

        arcs_.on("mouseover", function(d, i){
                var percent = d.data.yValue / d3.sum(change, function(d){return d.yValue;}) * 100;//  这个数算的好像有问题
                var txt = d.data.xValue + " " + ":" +" " + percent.toFixed(1) + "%";
                $('.tooltip').show(); 
                d3.select('.tooltip').html(txt)
                       .style("left", (d3.event.pageX + 20) + "px")
                       .style("top", (d3.event.pageY - 70) + "px");
              })
              .on("mousemove",function(d,i){
                //.transition().duration(100).ease("in-out")  
                 d3.select('.tooltip').style("left",(d3.event.pageX+20)+"px").style("top",(d3.event.pageY-70)+"px")
                //d3.select(".hint"+i).style("stroke","#33d0ff").style("stroke-width",3);
              })
              .on("mouseout",function(d,i){
                $('.tooltip').hide();
                d3.select('.tooltip').html("");
                //d3.select(".hint"+i).style("stroke-width",0);
              });
        //画圆弧的时候并不是顺时针顺序i=0~10...,但是每个扇形和矩形的颜色是对应的
        //ease()缓动函数 参数有 bounce  cubic linear cubic-in-out sin sin-out exp circle back
        
        if(k == dataSource.length - 1){
            arcs_.on("mouseenter", function(d, i){
                    d3.select(this).append("path").attr("fill",colora_[i]).attr("d",arc_(d)).transition()
                    .duration(300).ease("bounce").attr("d",arc(d)).attr("class","pa"+id+k+i+"");
                 })
                .on("mouseleave",function(d,i){
                    d3.selectAll(".pa"+id+k+i+"").style("opacity",0);
                    d3.select(this).append("path").attr("fill",colora_[i]).attr("d",arc(d)).transition()
                    .duration(300).ease("bounce").attr("d",arc_(d)).attr("class","pa"+id+k+i+"");
                })     
        }

        var tipMaxLength;
        var tipText = '';
        tipMaxLength = tip.getlength();     
        if(isBig){
            d3.select("#"+id+" div").append("span").attr('class', 'pieTip').attr('style','border-color:'+color[k]+'; top:'+(38+12*k)+'px; left:'+(w-tipMaxLength*6-90)+'px');
            d3.select("#"+id+" div").append("span").attr('class', 'pieTipText tip_text_'+k).attr('style','top:'+(33+12*k)+'px; left:'+(w-tipMaxLength*6-70)+'px');
        }else{
            d3.select("#"+id+" div").append("span").attr('class', 'pieTip').attr('style','border-color:'+color[k]+'; top:'+(23+12*k)+'px; left:'+(w-tipMaxLength*6-60)+'px');
            d3.select("#"+id+" div").append("span").attr('class', 'pieTipText tip_text_'+k).attr('style','top:'+(18+12*k)+'px; left:'+(w-tipMaxLength*6-40)+'px');
        }          
        for(var i=0; i<tip[k].length; i++){
            tipText += tip[k][i];
        }
        tip[k].length == 0 ? $('#'+id+' .tip_text_'+k).text('全部') :  $('#'+id+' .tip_text_'+k).text(tipText);
    }

    // var text = svg.selectAll(".pieText").data(datas).enter().append("text")
    //               .attr("transform",function(d,i){
    //                 var i_tmp = Math.floor(i/10);
    //                 var i_tp = i%10;
    //                 var i_x = w/2+i_tmp*190;
    //                return "translate("+(i_x+25)+","+(h/4+i_tp*22+10)+")";
    //               })
    //               .attr("class",function(d,i){
    //                 return "pieText"+i
    //               })
    //               .text(function(d){return d.xValue;});
    // var rects = svg.selectAll(".pieRect").data(datas).enter().append("rect")
    //             .attr("transform",function(d,i){ 
    //                 var i_tmp = Math.floor(i/10);
    //                 var i_tp = i%10;
    //                 var i_x = w/2+i_tmp*190;
    //                 return "translate("+i_x+","+(h/4+i_tp*22)+")";
    //             })
    //             .attr("width",15).attr("height",10).style("fill",function(d,i){return colora_[i];})
    //             .attr("class",function(d,i){ return "hint"+i;});
    
    var tableLenth = dataSource[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
    svg.append("text")
       .text(dataSource[0].tableName)
       .attr("class", "chart_name")   
       .attr("transform", "translate("+(20)+","+(20)+")");          
       // .attr("transform","translate("+((w - tableLenth*14)/2)+","+(padding.top-20)+")");          
    
    try{
      !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $chartBox.data("mCS",''); //手动销毁             
    };
    $chartBox.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true,
      axis:"x"
    }); 

}

//柱状图
window.bar = function(dataSource, divv, tip, transW, transH) {
    $('#'+divv+' .barTipText').remove();
    $('#'+divv+' .barTip').remove();
    $('#'+divv+' .pieTipText').remove();
    $('#'+divv+' .pieTip').remove();
    $('#'+divv+' svg').remove();
    var $chartBox = $("#"+divv+">div");   
    try{
      !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $chartBox.data("mCS",''); //手动销毁             
    };
	var ret = [], 
        w,
	    //装纵坐标
        set = [],
	    datas = dataSource[0].statisticalItems,
        ws = transW || $("#"+divv).width(),
        h = transH || $("#"+divv).height(),
        padding = {left:40,right:60,top:60,bottom:30},
        rectWidth = 15;

    $('.tNameS').remove();   
    //大图
    if(isBig){
        padding = {left:50,right:60,top:70,bottom:40};
        w = 50*datas.length+15*datas.length*(dataSource.length-1);
        w = dataSource[0].statisticalItems.getLongestStr(dataSource.length);
        ws>w ? w=ws : w=w;
    }else{
        padding = {left:40,right:60,top:60,bottom:25};
        w = 50*datas.length+15*datas.length*(dataSource.length-1);
        ws>w ? w=ws : w=w;
        //var omitXData =  dataSource[0].statisticalItems.omit();
        for(var i=0; i<dataSource.length; i++){
            dataSource[i].statisticalItems.omit();  
            dataSource[i].statisticalItems.uniq();
        }
        datas = dataSource[0].statisticalItems;

    }


    for(var i=0;i<dataSource.length;i++){
      for(var j=0;j<dataSource[i].statisticalItems.length;j++){
        dataSource[i].statisticalItems[j].yValue = Number(dataSource[i].statisticalItems[j].yValue);
        set.push(dataSource[i].statisticalItems[j].yValue);   
      }
    }
    for(var j=0;j<datas.length;j++){
      ret.push(datas[j].xValue);
    }
    var svg = d3.select("#"+divv+" div")
               .append("svg")
               .attr("width",w)
               .attr("height",h)
               .attr("class","ctrl svgsvg");           
    //d3.range - 产生一系列的数值。
    var xScaled = d3.scale.ordinal().domain(ret).rangeBands([0,w - padding.left - padding.right],0.3);
    //d3.range - 产生一系列的数值。
    var yScaled = d3.scale.linear().domain([0,d3.max(set)*1.2]).range([h-padding.top - padding.bottom,0]);
    //坐标轴上显示什么字，写在定义域里，为一个数组，想出数字就后面这么写d3.range(datad_.length)。d3.map构建一个新的映射
    var xAxisd = d3.svg.axis().scale(xScaled).orient("bottom").innerTickSize(0).outerTickSize(0.1);
    var yAxisd = d3.svg.axis().scale(yScaled).orient("left").ticks(5).innerTickSize(0).outerTickSize(0.1);
    var color = ["#f57983","#a1f480","#591ece","#10a8ab"];  
    svg.append("g")//g是分组
       .attr("class","axis")
       .attr("id","axisX")
       .attr("transform","translate("+padding.left+","+(h -padding.bottom)+")")
       .call(xAxisd)
       .selectAll("text")
       .attr("dy","1em");
    svg.append("g")
       .attr("class","axis axisY")
       .attr("transform","translate("+padding.left+","+padding.top+")")
       .call(yAxisd)
       .selectAll("text")
       .attr("dx","-0.5em");
    d3.selectAll("#"+divv+" svg g.axisY g.tick").append("line").classed("grid-line",true).attr("x1",0)
      .attr("y1",0)
      .attr("x2",w-padding.left-padding.right)
      .attr("y2",0)
      .style("stroke-dasharray","3")
      .attr("fill","#FFF");
   
    for(var k=0;k<dataSource.length;k++){
        var rects = svg.selectAll(".rect"+k+"").data(dataSource[k].statisticalItems).enter().append("rect")
                  .attr("class","rect"+k).attr("transform","translate("+padding.left+","+padding.top+")")
                  .attr("x",function(d,i){
                      return xScaled(d.xValue)+(xScaled.rangeBand()-rectWidth*dataSource.length)/2+rectWidth*k;
                  })
                  .attr("y",yScaled(0))
                  //ordinal.rangeBand - 取得离散块的宽度。
                  .attr("width",rectWidth)//取得离散块的宽度
                  .attr("height",0)
                  .attr("ry",3)
                  .attr("rx",3)
                  .transition()
                  .duration(400)
                  .ease("ease-out")
                  .attr("y",function(d){
                    return yScaled(d.yValue);
                  })
                  .attr("height",function(d){
                     return h- padding.top - padding.bottom -yScaled(d.yValue);
                  })
                  .attr("fill",color[k]);
  
        //矩形上的文字
        var text = svg.selectAll(".text"+k+"").data(dataSource[k].statisticalItems).enter()
                      .append("text").attr("fill",color[k])
                      .attr("transform","translate("+padding.left+","+padding.top+")")
                      .attr("x",function(d,i){
                          return xScaled(d.xValue)+(xScaled.rangeBand()-rectWidth*dataSource.length)/2+rectWidth*k;
                      })
                      .attr("y",function(d){
                       return yScaled(d.yValue)-2;
                      })
                      .attr("class","textAll")
                      .attr("dx",function(){ return rectWidth/2; })
                      .attr("text-anchor","middle")
                      .text(function(d){ return d.yValue; });
    
        var tipMaxLength, tipText='';
        tipMaxLength = tip.getlength()
        tipMaxLength > 4 ? tipMaxLength : tipMaxLength = 4
        if(isBig){
            d3.select("#"+divv+">div").append("span").attr('class', 'barTip').attr('style','background-color:'+color[k]+'; top:'+(38+12*k)+'px; left:'+(ws-tipMaxLength*6-75)+'px');
            d3.select("#"+divv+">div").append("span").attr('class', 'barTipText tip_text_'+k).attr('style','top:'+(33+12*k)+'px; left:'+(ws-tipMaxLength*6-60)+'px');
        }else{
            d3.select("#"+divv+">div").append("span").attr('class', 'barTip').attr('style','background-color:'+color[k]+'; top:'+(23+12*k)+'px; left:'+(ws-tipMaxLength*6-35)+'px');
            d3.select("#"+divv+">div").append("span").attr('class', 'barTipText tip_text_'+k).attr('style','top:'+(18+12*k)+'px; left:'+(ws-tipMaxLength*6-20)+'px');
        }
        for(var i=0; i<tip[k].length; i++){
            tipText += tip[k][i];
        }
        tip[k].length == 0 ? $('#'+divv+' .tip_text_'+k).text('全部') :  $('#'+divv+' .tip_text_'+k).text(tipText);
        
    }
    svg.append("text")
        .text(dataSource[0].tableName)
        .attr("class","chart_name")
        .attr("transform","translate("+(20)+","+(20)+")");         
    svg.append("text")
       .text(dataSource[0].yName) 
       .attr('class','axis_name')
       .attr("transform","translate("+(20)+","+(45)+")");      
    svg.append("text").text(dataSource[0].xName)
                      .attr('class','axis_name')
                      .attr("transform","translate("+(w-padding.left-15)+","+(h+15-padding.bottom)+")");
    var len = dataSource[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
    var loc = len*15/2+20+80;    
   
    if(isBig){                
        $("#"+divv+" div").append("<div class='nMask'></div>");
        $(".nMask").css({"top":(0)+"px", "left":(20)+"px"});
        $("#"+divv+" div").not('.nMask').append('<div class="tNameS">'+dataSource[0].tableName+'</div>');
    } 
    $chartBox.mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true,
        axis:"x"
    });      
} 

//折线图
window.line = function(dataSource, divv, tip, transW, transH) {
    $('#'+divv+' .barTipText').remove();
    $('#'+divv+' .barTip').remove();
    $('#'+divv+' .pieTipText').remove();
    $('#'+divv+' .pieTip').remove();
    $('#'+divv+' svg').remove();
    var $chartBox = $("#"+divv+">div");   
    try{
      !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $chartBox.data("mCS",''); //手动销毁             
    };
    var ret = [],//装纵坐标
	    set = [],
	    datas = dataSource[0].statisticalItems,
        ws = transW || $("#"+divv).width(),
        h = transH || $("#"+divv).height(),
        padding = {left:40, right:60, top:60, bottom:30},
        rectWidth = 15,
        temp,
        w;
    $('.tNameS').remove();
    //大图
    if(isBig){
        w = 50*datas.length+15*datas.length*(dataSource.length-1);
        w = dataSource[0].statisticalItems.getLongestStr(dataSource.length);
        ws>w ? w=ws : w=w;
    }else{
        w = 50*datas.length+15*datas.length*(dataSource.length-1);
        ws>w ? w=ws : w=w;
        //var omitXData =  dataSource[0].statisticalItems.omit();
        for(var i=0; i<dataSource.length; i++){
            dataSource[i].statisticalItems.omit();
            dataSource[i].statisticalItems.uniq();
        }
        datas = dataSource[0].statisticalItems;

    }

    var svg = d3.select("#"+divv+" div").append("svg").attr("width",w).attr("height",h).attr("class","ctrl svgsvg");
    for(var i=0;i<dataSource.length;i++){
        for(var j=0;j<dataSource[i].statisticalItems.length;j++){
            set.push(dataSource[i].statisticalItems[j].yValue);   
        }
    }
    for(var i=0;i<datas.length;i++){
        ret.push(datas[i].xValue);
    };
    //找出纵坐标数组中的最大值
    var data_max = Math.max.apply(null,set);    
    
    //d3.range - 产生一系列的数值。rangeRoundPoints(
    var xscale = d3.scale.ordinal().domain(ret).rangeBands([0,w - padding.left - padding.right]);        
    var yscale = d3.scale.linear().domain([0,data_max*1.2]).range([h - padding.top - padding.bottom,0]);
    var xAxise = d3.svg.axis().scale(xscale).orient("bottom").innerTickSize(4);
    var yAxise = d3.svg.axis().scale(yscale).orient("left").ticks(5).innerTickSize(4);
    var py = (w - padding.right - padding.left)/(2*datas.length);
    var color =  ["#f57983","#a1f480","#591ece","#10a8ab"];
    var svgG = svg.append('g').attr('transform', "translate("+(padding.left+py)+","+padding.top+")");
    var linePath = d3.svg.line().x(function(d){return xscale(d.xValue); }).y(function(d){ return yscale(d.yValue);}).interpolate("monotone");  
    var linePathNone = d3.svg.line().x(function(d){return xscale(d.xValue); }).y(function(d){ return yscale(0)}).interpolate("monotone"); 
    var area = d3.svg.area().x(function(d){ return xscale(d.xValue);}).y0(h - padding.top - padding.bottom).y1(function(d){return yscale(d.yValue);}).interpolate("monotone");   
    var areaNone = d3.svg.area().x(function(d){ return xscale(d.xValue);}).y0(h - padding.top - padding.bottom).y1(function(d){return yscale(0);}).interpolate("monotone");  
    //添加提示线   
    var change0 = datas;
    svg.selectAll(".hintLine"+divv).data(change0).enter().append("line")
       .attr("x1",function(d){return xscale(d.xValue);})
       .attr("x2",function(d){return xscale(d.xValue);})
       .attr("y1",h-padding.bottom)
       .attr("y2",padding.top)
       .attr("transform","translate("+(padding.left+py)+",0)")  
       .attr("class","hintLine"+divv)
       .attr("id",function(d,i){ return "hintLine"+divv+i;})
       .attr("opacity",0)
       .style('fill','none')
       .style('stroke','#33d0ff')
       .style('stroke-width','2px');
    
    for(var k=0;k<dataSource.length;k++){
        var change = dataSource[k].statisticalItems;
        svg.append("path")
           .attr("d",linePathNone(change))
           .attr("transform","translate("+(padding.left+py)+","+padding.top+")")
           .attr("fill","none")
           .attr('stroke',color[k])
           .attr("stroke-width",2)
           .transition()
           .duration(500)
           .ease("ease-out")
           .attr("d",linePath(change))//d是路径，这里的数据应该是有横纵坐标的一个数组
           ;
           // .style("opacity",0.4)
           // .on("mouseover",function(){
           //   d3.select(this).style("opacity",1);
           // })
           // .on("mouseout",function(){
           //   d3.select(this).style("opacity",0.4)
           // });    
         svgG.append('g')
             .attr('class', 'area')
             .append("path")
             .datum(change)
             .attr("class", "line_path")
             .attr('opacity',0.2)
             .attr("d", areaNone)
             .transition()
             .duration(500)
             .ease("ease-out")
             //.attr("transform","translate("+(padding.left+py)+","+padding.top+")")
             .style('fill',color[k])
             .attr("d", area);
        svg.selectAll(".circle"+k).data(change).enter().append("circle").attr("transform","translate("+(padding.left+py)+","+padding.top+")").attr("cx",function(d){return xscale(d.xValue); })
            .attr("cy",function(d){ return yscale(0);})
            .attr("r",0)
            .attr("fill","#33d0ff")
            .attr("stroke",color[k])
            .attr("stroke-width",0)
            .transition()
            .duration(500)
            .ease("ease-out")
            .attr("cy",function(d){ return yscale(d.yValue);})
            .attr("r",4)
            .attr("stroke-width",2)
            .attr("class","dataDot"+divv)
            .style("z-index",20);

        var tipMaxLength, tipText='';
        tipMaxLength = tip.getlength()
        tipMaxLength > 4 ? tipMaxLength : tipMaxLength = 4
        if(isBig){
            d3.select("#"+divv+">div").append("span").attr('class', 'barTip').attr('style','background-color:'+color[k]+'; top:'+(38+12*k)+'px; left:'+(ws-tipMaxLength*6-75)+'px');
            d3.select("#"+divv+">div").append("span").attr('class', 'barTipText tip_text_'+k).attr('style','top:'+(33+12*k)+'px; left:'+(ws-tipMaxLength*6-60)+'px');
        }else{
            d3.select("#"+divv+">div").append("span").attr('class', 'barTip').attr('style','background-color:'+color[k]+'; top:'+(23+12*k)+'px; left:'+(ws-tipMaxLength*6-35)+'px');
            d3.select("#"+divv+">div").append("span").attr('class', 'barTipText tip_text_'+k).attr('style','top:'+(18+12*k)+'px; left:'+(ws-tipMaxLength*6-20)+'px');
        }
        for(var i=0; i<tip[k].length; i++){
            tipText += tip[k][i];
        }
        tip[k].length == 0 ? $('#'+divv+' .tip_text_'+k).text('全部') :  $('#'+divv+' .tip_text_'+k).text(tipText);
    }   

    svg.append("g").attr("class","axis").attr("transform","translate("+padding.left+","+(h - padding.bottom)+")").call(xAxise);
    svg.append("g").attr("class","axis").attr("transform","translate("+padding.left+","+padding.top+")").call(yAxise);
    //每次生成矩形时，让坐标轴有个过渡
    svg.select(".axis")
       .transition()
       .duration(500)
       .ease("circle")
       .call(xAxise);
         
    svg.append("text").text(dataSource[0].tableName).attr("class","chart_name")
    .attr("transform","translate("+(20)+","+(20)+")"); 
    svg.append("text").text(dataSource[0].yName).attr("transform","translate(20,45)").attr('class','axis_name');//16.65
    svg.append("text").text(dataSource[0].xName).attr("transform","translate("+(w-5-15-dataSource[0].xName.length*13)+","+(h-padding.bottom+5)+")").attr('class','axis_name');
           
    var statisticsTimes = ["一次统计","二次统计","三次统计","四次统计"];
        
    //添加一个矩形，进入显示线
    svg.selectAll(".hintLineBg").data(change).enter().append("rect")
       .attr("x",function(d,i){return xscale(d.xValue);})
       .attr("y",0)
       .attr("width",2*py)
       .attr("height",h-padding.top-padding.bottom)
       .attr("transform","translate("+padding.left+","+padding.top+")") 
       .attr("class","hintLineBg")
       .style("opacity",0)
       .on("mouseover",function(d,i){
           d3.select("#hintLine"+divv+i).attr("opacity",1);
           var posiX = d3.select("#hintLine"+divv+i).attr("x1");
           d3.selectAll(".dataDot"+divv).filter(function(d,i){ return xscale(d.xValue)==posiX  }).attr("stroke-width",5);
           // d3.select(".dashboard").append("div").attr("class","messageTip")
           var strMess = "<p>"+d.xValue+"</p>";
           d3.selectAll(".dashboard svg .dataDot"+divv).filter(function(d,i){ return xscale(d.xValue)==posiX  })
           .each(function(d,i){ return strMess +="<p>"+statisticsTimes[i]+"："+d.yValue+"</p>" ;})
           $(".messageTip").css('opacity',1).html(strMess);
           var _left = $('#'+divv).css('left');
           _left = _left.substring(0,_left.length-2);
           if(divv == 'cMagnify'){}
           var _leftS = $('#'+divv).scrollLeft(); 
           d3.select(".messageTip")
             .transition()
             .duration(200)
             .delay(200)
             .ease("ease-out")
             .style("left",(Number(_left)+Number(posiX)-_leftS+1.2*py+70)+"px")
             .style("top",(d3.event.pageY-110)+"px");
       })
       .on("mousemove",function(d,i){
          var posiX = d3.select("#hintLine"+divv+i).attr("x1");
          var _left = $('#'+divv).css('left');
          _left = _left.substring(0,_left.length-2);
          var _leftS = $('#'+divv).scrollLeft();
          d3.select(".messageTip")
             .style("left",(Number(_left)+Number(posiX)-_leftS+1.2*py+70)+"px")
             .style("top",(d3.event.pageY-110)+"px");
       })
       .on("mouseout",function(d,i){  
           d3.select("#hintLine"+divv+i).attr("opacity",0);
           var posiX = d3.select("#hintLine"+divv+i).attr("x1");
           d3.selectAll(".dataDot"+divv).filter(function(d,i){ return xscale(d.xValue)==posiX  }).attr("stroke-width",2);
           $(".messageTip").css('opacity',0).html('');
       });   

    if(isBig){              
        $("#"+divv+" div").append("<div class='nMask'></div>");
        $(".nMask").css({"top":(0)+"px", "left":(20)+"px"});
        $("#"+divv+" div").not('.nMask').append('<div class="tNameS">'+dataSource[0].tableName+'</div>');
    }
    $chartBox.mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true,
        axis:"x"
    });               
}

//添加图形
function goChartProbeToAddChart(){
    $('.addChart').click(function(){
        event.stopPropagation(); 
        localStorage.setItem('posi', $(this).parent().parent().attr('data-index')); 
        location.href = './Chartprobe'; 
      })
}
goChartProbeToAddChart()

//初始化所有系统预定义模板，一生一次
function templateInit (){
    template.forEach(function(item, i){
        $.ajax({
            url: EPMUI.context.url+'/dashboard/create', 
            type: 'POST',
            data: {'template': item.template,
                    'allPosition': JSON.stringify(item.allPosition),
                    'nofill': JSON.stringify(item.nofill),
                    'style': item.style,
                    'enable': item.enable
                  },
            dataType: 'json',//异步请求返回结果是ajax请求dataType值为json，jquery就会把后端返回的字符串尝试通过JSON.parse()尝试解析为js对象
            // contentType:
            success: function (data) {
                if(data.code == '200' && i==0){
                    getDashboardInfo()
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            }
        }) 
        
    })
}

//获取启用的dashboard的ID等信息
function getDashboardInfo(){
    $.ajax({
        url: EPMUI.context.url+'/dashboard/get/currentuser', 
        type: 'GET',
        dataType: 'json',
        error: function(err) {
        },
        success: function (data) {          
            if(data.code == 200){
                var datas = data.magicube_interface_data;
                //此处如果有style应该返回style啊
                
                localStorage.setItem('dashboardTemplate',datas.template)
                localStorage.setItem('noFill', datas.nofill);
                localStorage.setItem('dashboardId', datas.id);
                localStorage.setItem('allPosition', datas.allPos);
               
                showDashboard();
                
            }else{
                templateInit();
            }                 

        }
    })  
} 
getDashboardInfo();

//根据dashboardId获取页面
function showDashboard (){
    if (localStorage.getItem('dashboardId')){    
      $.ajax({
          url: EPMUI.context.url+'/dashboard/view?dashboardId='+localStorage.getItem('dashboardId'), 
          type: 'GET',
          dataType: 'json',
          error: function(err) {
          },
          success: function (data) {
                if(data.code == 200){
                    if(data.magicube_interface_data.dashboard.charts){
                        var datas = data.magicube_interface_data.dashboard.charts;
                        tempData = data.magicube_interface_data.dashboard.charts;
                        //对百分比的处理
                        for(var j=0; j<datas.length; j++){   
                            if(datas[j].type == 'gis'){
                            }else{
                                if( datas[j].result[0].yName=="占比"){
                                    for(var i=0;i<datas[j].result.length;i++){
                                        var finalSet = datas[j].result[i].statisticalItems;
                                        for(var k=0; k<finalSet.length; k++){
                                            if(finalSet[k].yValue!=0){
                                                finalSet[k].yValue=finalSet[k].yValue.replace("%","");
                                            }
                                        }
                                        datas[j].result[i].yName=datas[j].result[i].yName+"%";
                                    }
                                    
                                }
            
                                if( datas[j].result.length>0 ){
                                    for(var p=0;p<datas[j].result.length; p++){
                                        dealWithData(datas[j].result, datas[j].result[p]);
                                    }                   
                                }
            
                            }                      
                                            
                        }  
                        if( localStorage.getItem('dashboardTemplate')=='A'){
                            $('.dashboard_template_a').show();
                            drawCharts(datas, 'show_board');               
                        }
                        else if( localStorage.getItem('dashboardTemplate')=='B'){
                            $('.dashboard_template_b').show();
                            drawCharts(datas, 'show_board_b');             
                        }
                        else if( localStorage.getItem('dashboardTemplate')=='C'){
                            $('.dashboard_template_c').show();
                            drawCharts(datas, 'show_board_c');
                            //TODO 正式使用的时候，删掉这一行即可，其他地方可不需要修改
                            //loadGis("","bCharth");
                        //这种情况就是自定义模板 先还原界面，在执行后续函数   
                        }else{
                            $('.dashboard_template_d').show();
                            restoreInterface(JSON.parse(data.magicube_interface_data.dashboard.style));
                            drawCharts(datas, 'show_board_d');
                        }
        
                    }  
                }
                         
          }
      })
    
    }
}

//把数据传入画图函数，区分模板
function drawCharts(datas, className ) {
    for(var i=0; i<datas.length; i++){
        var chartId
      //移动了以后是会有问题的
        //var chartId = $('.'+className+' div:eq('+(datas[i].position)+')').attr('id');
        $('.'+className+' div').each(function(k, ele){
            if( ele.getAttribute('data-index') ==  datas[i].position){
                chartId = ele.getAttribute('id')
            }
        })

        $('#'+chartId+' .addChart').remove();
        $('#'+chartId).attr('data-id',datas[i].id);
        $('#'+chartId).attr('data-type',datas[i].type);
        $('#'+chartId).attr('data-tip', datas[i].dataTip);
        if(datas[i].type == 'gis'){
            $('#'+chartId).attr('data-result',datas[i].param);
        }else{
            $('#'+chartId).attr('data-result',JSON.stringify(datas[i].result));
        }                       

        if(datas[i].type == 'yz'){
            bar( datas[i].result, chartId, JSON.parse(datas[i].dataTip));
        }else if(datas[i].type == 'zx'){
            line( datas[i].result, chartId, JSON.parse(datas[i].dataTip) );
        }else if(datas[i].type == 'yb'){
            pie( datas[i].result, chartId, JSON.parse(datas[i].dataTip) );
        }else if(datas[i].type == 'gis'){
          if(localStorage.getItem('dashboardTemplate')=='C'){
            loadGis(datas[i].param, 'cGis');
            loadGis(datas[i].param, chartId);           
          }else{
            loadGis(datas[i].param, chartId);
          }
        }

    }
   
}

//点击空白处
// $('.dashboard').click(function(){
//     event.stopPropagation();
//     $('#moveAlert').hide();
// })

//点击设置
$('#settingBtn').click(function(){
    event.stopPropagation();
    $('#setMenu').toggle();
})

//删除图表
$('#delChart').click(function(){
    event.stopPropagation();
  $('#setMenu').hide();    
})

//切换模板
$('#toggleTemp').click(function(){
    event.stopPropagation();
    $('#setMenu').hide();
    $('.setting_box').show();
    fetch(EPMUI.context.url + '/dashboard/get/currentuser/all')
        .then( (response) => response.json())
        .then( (data) => {
            //返回所有dashboard 
            if(data.magicube_interface_data.length > 0 ){
                templateList = data.magicube_interface_data;
                $('#templateList p').remove();
                $('#templateList').append(`<p><label><input type='radio' class='icon-hollow-circle' name='temp' id='tempUser' />自定义模板</label></p>`)
                templateList.forEach( function(item, i) {                   
                    $('#templateList').append(`<p data-dashboard=${item.id} data-template=${item.template} data-allPos=${item.allPos}
                     data-nofill=${item.nofill}><label><input type='radio' class='icon-hollow-circle' name='temp' id='temp${item.template}'
                       />${item.template}</label></p>`);
                })

                $('#templateList p').click(function(){
                    $(this).addClass('pitchOn').find('input').addClass('icon-dot-circle').removeClass('icon-hollow-circle').attr('checked',true);
                    $(this).siblings().removeClass('pitchOn').find('input').removeClass('icon-dot-circle').addClass('icon-hollow-circle').attr('checked',false);
                })

                $('#temp'+localStorage.getItem('dashboardTemplate')).addClass('icon-dot-circle').removeClass('icon-hollow-circle');
                $('#temp'+localStorage.getItem('dashboardTemplate')).parent().parent().addClass('pitchOn')

                var $templateList = $("#templateList");   
                try{
                    !!$templateList.data("mCS") && $templateList.mCustomScrollbar("destroy"); //Destroy
                }catch (e){
                    $templateList.data("mCS",''); //手动销毁             
                };

                $templateList.mCustomScrollbar({
                    theme: Magicube.scrollbarTheme,
                    autoHideScrollbar: true,
                    axis:"y"
                });
            }
           
        })   
    
})


$('#setTempSure').click(function(){
  //存在问题，若不是第一次切换模板，之前有这个模板就应该按之前的
    
    if($('#templateList .pitchOn' ).attr('data-dashboard')){
        toggleTemplate( $('#templateList .pitchOn' ).attr('data-dashboard'),  $('#templateList .pitchOn' ).attr('data-template'));
        customEnable = false;
        //选择自定义的
    }else{
        customEnable = true;
        $('.show_board_d').html('');
        $('.show_board_d').append(`<div class='d_0_0 cell' id='d0Chart0' data-index-tier='0' data-index-cell='0' data-style=${JSON.stringify({"top":2.5,"left":2.5,"width":30,"height":30,"index":"0","id":"d0Chart0","class":"d_0_0|cell","dataIndexCell":"0","dataIndexTier":"0"})} data-index="0" ><div><span class='addChart'>+</span></div></div>
        <span class='add_cell_btn addc_0' data-index='0'>+</span>`);
        $('.dashboard_template_a').hide();
        $('.dashboard_template_b').hide();                   
        $('.dashboard_template_c').hide();
        $('.dashboard_template_d').show();
        addCellClickEvent();//加块的点击事件
        goChartProbeToAddChart();//跳转图表点击事件
        moveCell();
        $('.cell').dblclick((event) => {
            event.stopPropagation();
            let ele = event.currentTarget;
            magnify(ele);
        });  
    }
    $('.setting_box').hide();   

})

var customEnable = false;
$('#setTempCancle').click(function(){
  $('.setting_box').hide();
})

//切换模板函数
function toggleTemplate(tDashboardId, text){
    $.ajax({
        url: EPMUI.context.url+'/dashboard/change?targetDashboardId='+tDashboardId, 
        type: 'GET',
        dataType: 'json',
        error: function(err) {
        },
        success: function (data) {
            //切换模板以后的成功函数，应该返回模板id，nofill，以及模板类型
            if(data.code == 200){
                //设置dashboardId，nofill，template， allposition
                $('.setting_box').hide();
                //let tempTemplate = localStorage.getItem('dashboardTemplate');
                if(text=='A'){
                    showWidget('a');

                }else if(text=='B'){
                    showWidget('b');

                }else if(text=='C'){
                    $('.show_board_c div svg').remove();
                    $('.show_board_c>div').find('.amplification').each(function(index, item){
                        if($(item).children().length==0){
                            $(item).append(`<div><span className='addChart'>+</span></div>`)
                        }
                    })
                    $('.dashboard_template_a').hide();
                    $('.dashboard_template_b').hide();                   
                    $('.dashboard_template_c').show();
                    $('.dashboard_template_d').hide();

                }else{
                    showWidget('d');
                }
                                
                getDashboardInfo();
                       
            }
        }
    })   
}

//切换模板后显示小工具
function showWidget(str){
    $('.show_board_'+str+' div svg').remove();
    $('.show_board_'+str+'>div').each(function(index, item){
        if($(item).children().length==0){
            $(item).append(`<div><span className='addChart'>+</span></div>`)
        }
    })
    $('.dashboard_template_a').hide();
    $('.dashboard_template_b').hide();                   
    $('.dashboard_template_c').hide();
    $('.dashboard_template_d').hide();
    $('.dashboard_template_'+str).show();
}

//自己开发拖拽
var initX;
var initY;
var preX;
var preY;
var initL;
var initT;
var mark=true;

$('.dragele').mousedown(function(){
    if(mark){
        $(this).unbind('mousemove');
        event.stopPropagation()
        $(this).addClass('operation');
        $(this).siblings().removeClass('operation');
        //initL = $(this).offsetLeft;//错了，jquery和原生混用
        //这四个值都不带px
        initL = $(this).offset().left;
        initT = $(this).offset().top;
        initX = event.clientX;
        initY = event.clientY;  
        $(this).bind('mousemove',function(){
            event.stopPropagation();
            preX = event.clientX;
            preY = event.clientY;
            $(this).css({'top':(initT+preY-initY-50)+'px', 'left':(initL+preX-initX)+'px'});
            mark = false;
        })
    }    
});

$('.dragele').mouseup(function(){
    $(this).unbind('mousemove');
    event.stopPropagation()
    var dragDom = $(this);
    preX = event.clientX;
    preY = event.clientY;
    var dragDomClass = $(this).attr('class');
    var flag = false;
    var nofill_ = [];
    $('.dragele:not(.operation)').each(function(i, dom){
        if( dom.offsetLeft < preX && preX < (dom.offsetWidth+dom.offsetLeft) && dom.offsetTop < (preY-50) && (preY-50) < (dom.offsetHeight+dom.offsetTop) ){
            var dragH = dragDom.height();
            var dragW = dragDom.width();
            var targetW = dom.offsetWidth;
            var targetH = dom.offsetHeight;
            var targetDomClass = dom.getAttribute('class');
            var left_ = dom.offsetLeft;
            var top_ = dom.offsetTop;
            dragDom.removeAttr('class').css('transition','all 0.4s ease-in-out').attr('class',targetDomClass).css({'left':left_+'px', top:top_+'px'});
            var targetId = dom.getAttribute('id');
            dom.removeAttribute('class');
            dom.style.transition = 'all 0.4s ease-in-out';
            dom.style.left = initL+'px';
            dom.style.top = initT-50+'px';
            dom.setAttribute('class',dragDomClass); 
            flag = true;

            //nofill
            //localStorage.getItem('noFill')
            //1.两个都有图表的进行交换2.一个有一个无的交换，两个都无
            Array.prototype.remove = function(val) { 
                var index = this.indexOf(val); 
                    if (index > -1) { 
                    this.splice(index, 1); 
                } 
            };
            var hasSvg = dom.getElementsByTagName("svg");

            // var tmpId = parseInt(dragDom.attr('data-index'));
            // dragDom.attr('data-index', $('#'+targetId).attr('data-index'))
            // $('#'+targetId).attr('data-index',tmpId);
            
             var dragIdi = dragDom.attr('data-id'),
                 dragIndex = parseInt(dragDom.attr('data-index')), 
                 targetIdi = dom.getAttribute('data-id'),
                 targetIndex = parseInt($('#'+targetId).attr('data-index'));


            
            if(dragDom.find('svg').length>0 && hasSvg.length>0){
                //dragDom.find('svg').remove();
                //dom.removeChild(dom.childNodes[0]);
                //dom.childNodes[0].removeChild(dom.childNodes[0].childNodes[0]);
                dragDom.children().html('');
                dom.childNodes[0].innerHTML = "";
                afreshDraw(dom.getAttribute('data-type'), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), dragW, dragH );
                afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), targetW, targetH);
                moveRequest(dragIdi, dragIndex, targetIdi, targetIndex);
                nofill_ = JSON.parse(localStorage.getItem('noFill'));
            }
            else if(dragDom.find('svg').length==0 && hasSvg.length==0){
                nofill_ = JSON.parse(localStorage.getItem('noFill'));
            }
            else if( dragDom.find('svg').length>0 && hasSvg.length==0){
                nofill_ = JSON.parse(localStorage.getItem('noFill'));
                nofill_.remove(  parseInt(dragDom.attr('data-index')) );
                nofill_.push( parseInt($('#'+targetId).attr('data-index')) );
                // dragDom.find('svg').remove();
                dragDom.children().html('');
                afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), targetW, targetH );
                moveRequest(dragIdi, dragIndex);
            }
            else if( dragDom.find('svg').length==0 && hasSvg.length>0){
                //拖动的元素的空的，目标位置的元素是有图的
                nofill_ = JSON.parse(localStorage.getItem('noFill'));
                nofill_.remove( parseInt($('#'+targetId).attr('data-index')) );
                nofill_.push( parseInt(dragDom.attr('data-index')) );
                //dom.childNodes[0].removeChild(dom.childNodes[0].childNodes[0]);
                dom.childNodes[0].innerHTML = "";
                afreshDraw(dom.getAttribute('data-type'), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), dragW, dragH );
                moveRequest(targetIdi, targetIndex);
            }
            
            function moveRequest(arg1, arg2, arg3, arg4){
                $.ajax({
                  url: EPMUI.context.url+'/dashboard/chart/move',
                  type:'post',
                  data:{
                      "dashboardId": localStorage.getItem('dashboardId'),
                      "chartOneId": arg1,
                      "positionOne": arg2,
                      "chartTwoId": arg3,
                      "positionTwo": arg4,
                      "nofill": JSON.stringify(nofill_)
                  },
                  success:function(){
                      localStorage.setItem('noFill',JSON.stringify(nofill_));
                  }
                })
            }        
            function afreshDraw(type, result, id, tip, transW, transH ){
                if(type== 'yz'){
                    bar( result, id, JSON.parse(tip), transW, transH );
                }else if( type == 'zx'){
                    line( result, id, JSON.parse(tip), transW, transH );  
                }else if( type == 'yb'){
                    pie( result, id, JSON.parse(tip), transW, transH );
                }else if(type =='gis'){
                    loadGis( JSON.stringify(result), id, transW, transH );
                }
            }


        }
    })
    if(!flag){
        dragDom.css('transition','all 0.4s ease-in-out').css({'left':(initL+'px'), 'top':(initT-50+'px')})
    }
    $('.dashboard div').css('transition','');
    mark=true;
}); 

$('.dragele').unbind('mousemove');

//图表放大函数
function magnify(ele){
    $('.nMask').remove();
    $('.tNameS').remove();
    isBig = true;   
    $('.dashboard_shade').show();
    
    if(ele.getAttribute('data-type') == 'zx'){
        line( JSON.parse(ele.getAttribute('data-result')), 'cMagnify', JSON.parse(ele.getAttribute('data-tip')) );    
    }
    else if(ele.getAttribute('data-type') == 'yz'){
        bar( JSON.parse(ele.getAttribute('data-result')), 'cMagnify', JSON.parse(ele.getAttribute('data-tip')) );   
    }
    else if(ele.getAttribute('data-type') == 'yb'){  
        pie( JSON.parse(ele.getAttribute('data-result')), 'cMagnify', JSON.parse(ele.getAttribute('data-tip')) );     
    }else if(ele.getAttribute('data-type') == 'gis'){//加载弹框地图
        loadGis(ele.getAttribute('data-result'), 'cMagnify');
    }   
}
$('.dragele, .amplification, .cell').dblclick((event) => {
    event.stopPropagation();
    let ele = event.currentTarget;
    magnify(ele);
});

$('#magnifyDel').click(function(){
  $('.dashboard_shade').hide();
  $('#cMagnify svg').remove();
  isBig = false;
})
    
$("#cMagnify").scroll(function(){
    var le_shift = $(this).scrollLeft()+$(this).width()-30;
    $(this).find("#magnifyDel").css("left",(le_shift)+"px");//+278   
    $('.tNameS').css("left", ($(this).scrollLeft()+20)+"px");
});

//处理叠加统计Xvalue个数不同的情况
function dealWithData(information, data) {//之前的数据，新请求的数据    
    function search(arr,dst){
      var i = arr.length;
      while(i-=1){
          if (arr[i] == dst){
             return i;
          }
      }
      return false;
    }
    var fg=0;
    var arrInformation=[];
    var arrData = [];
    var data_one=information[0].statisticalItems;
    var data_two = data.statisticalItems;
  $.extend(true,arrData,data_two);
  //遍历第一个数组，如果和第二个相同的，就把第二个完全拷贝的那份删除，得到一个数组，是第二个数组刨除和第一个重复的
    for(var i=0;i<data_one.length;i++){
        for(var j=0;j<data_two.length;j++){
            if(data_one[i].xValue==data_two[j].xValue){
                for(var v=0;v<arrData.length;v++){
                    if(arrData[v].xValue==data_two[j].xValue){
                        arrData.splice(v,1);                        
                    }
                }
        
            }
        }
    }
  //把第一个数组push一下，变成包含着第二个的数组，这时，第一个是全的，第二个是不全的，
  for(var k=0;k<arrData.length;k++){
    arrData[k].yValue = 0;
    data_one.push(arrData[k]);
  }
  //把第一个全的拷贝一份
  $.extend(true,arrInformation,data_one);
  //遍历拷贝的这个，如果第二个有就删除，得到一个数组，包含着在第一个却不在第二个的元素
    for(var i=0;i<data_two.length;i++){
        for(var j=0;j<arrInformation.length;j++){
            if(data_two[i].xValue==arrInformation[j].xValue){
                arrInformation.splice(j,1);
            }
        }
   }
  //把第二个没有的元素，值变成0，加入到第二个数组中，至此，两个数组的XValue是一样的了
  for(var p=0;p<arrInformation.length;p++){
    arrInformation[p].yValue=0;
    data_two.push(arrInformation[p]);
  }
  //现在两个数组内容是完全一样的，只是顺序不一样，下面就让他们的顺序一致
  var arrNew=[];
    for(var s=0;s<data_one.length;s++){
        for(var g=0;g<data_two.length;g++){
            if(data_one[s].xValue==data_two[g].xValue){
                arrNew.push(data_two[g]);
            }
        }
   }
  data.statisticalItems=[];
  $.extend(true,data.statisticalItems,arrNew);  
  
}


/***********   自定义模板   *************/

//至多可加3个层级3个图
var globalIndex = 0;//层的数量，累加
var onOff = true;//工具箱开关标识
var dashboardDHeight = {
    'tier0':30
}
var dashboardDTop = {
    'tier0':2.5
}
var customTemplateStyle=[];
var position = [ 1, 2, 3, 4, 5, 6, 7, 8];
let customAllPosition = [];
let customNofill = [];

//工具框打开隐藏
$('#db_tool').dblclick(function(){
    if(onOff){
        $('.dashboard_menu').animate({'height':'122px' });
        $('#db_tool').find('before').css('color', '#33d0ff');
    }else{
        $('.dashboard_menu').animate({'height':'32px' });
    }
    onOff = !onOff;
})
let tooltipText = ['添加层', '添加格', '保存'];
$('.tool_list button').not('#db_tool').mouseover(function(){
    let tipIndex = $(this).index();
    $('#ToolBoxPrompt').show().text(tooltipText[tipIndex]).css('bottom',(132-(tipIndex+1)*30)+'px' );
}).mouseout(function(){
    $('#ToolBoxPrompt').hide();
})

//计算top值 
function countTop( tierIndex ){
    let T = 0;
    let H = 0;
    for(let k in dashboardDTop){
        if(k.substr(k.length-1,1) <= tierIndex){
            T += dashboardDTop[k];
        }       
    }
    for(let k in dashboardDHeight){
        if(k.substr(k.length-1,1) < tierIndex){
            H += dashboardDHeight[k];
        }
    }
    return T+H;   
}

//当出现合并,新加，删除等时，重新按序给div分配index
function ReassignmentIndex(){
    $('.show_board_d>div').each(function( i, dom){
        dom.attr('index', i);
    })
}

//添加层
$('#addTier').click(()=>{
    $('#editTier ul li label span:eq(3)').remove();
    if(globalIndex == 2){
        return false;
    }else{
        globalIndex++;
        $('.show_board_d').append(`<div class='d_${globalIndex}_0 cell' id='d${globalIndex}Chart0' data-index-tier='${globalIndex}' data-index-cell='0'><div><span class='addChart'>+</span></div></div>
                                   <span class='add_cell_btn addc_${globalIndex}' data-index='${globalIndex}'>+</span>`);          
        
        let topValue = countTop( globalIndex );//其实这个30应该计算一下剩下多少高度
        let inputVal = (100-topValue-2.5)  > 30 ? 30 : (100-topValue-2.5);
        $('#tierHeigth').attr('placeholder', inputVal)
        $('.d_'+globalIndex+'_0').css({'top': topValue+2.5+'%', 'height':inputVal+'%'});
        $('.addc_'+globalIndex).css({'top': topValue+2.5+'%'});//设置层的css              
        addCellClickEvent();//加块的点击事件
        goChartProbeToAddChart();//跳转图表点击事件
        $('#editTier').slideDown("slow");    
        moveCell();   
        $('.cell').dblclick((event) => {
            event.stopPropagation();
            let ele = event.currentTarget;
            magnify(ele);
        });
    }    
})
 
//确认设置层样式,margin-top：2.5
$('#editTierSure').click(()=>{   
    let th = parseInt( $('#tierHeigth').val() );
    let topValue = countTop(globalIndex);
    if(th <= 100-topValue-2.5){               
        $('.d_'+globalIndex+'_0').css({'top': topValue+2.5+'%', 'height':th+'%'});
        $('.addc_'+globalIndex).css({'top': topValue+2.5+'%'});
        $('#editTier').slideUp("slow");        
        addStyleAttribute('#d'+globalIndex+'Chart0', th, 30,topValue+2.5, 2.5, position[0])
        position.shift(); 
        dashboardDHeight['tier'+globalIndex] = th;
        dashboardDTop['tier'+globalIndex] = 2.5;
    }else{
        $('#editTier ul li label').append(`<span>高度过大</span>`)  
    }
    
})

//取消设置层样式
$('#editTierCancel').click(function(){
    $('#editTier').slideUp();
    let topValue = countTop( globalIndex )//此处的30也要计算是剩余了多少高度
    addStyleAttribute('#d'+globalIndex+'Chart0', 30, 30, topValue+2.5, 2.5, position[0])
    position.shift(); 
    dashboardDHeight['tier'+globalIndex] = 30;
    dashboardDTop['tier'+globalIndex] = 2.5;
})

//显示添加格按钮
$('#addCell').click(function(){
    if($('.add_cell_btn').css('display')=='none'){
        $('.add_cell_btn').show();
    }else if($('.add_cell_btn').css('display')=='block'){
        $('.add_cell_btn').hide();
    }   
})

//添加格
function addCellClickEvent(){
    $('.add_cell_btn').unbind("click"); 
    $('.add_cell_btn').click(function(){    
        let tierIndex = $(this).attr('data-index');
        let cellIndex = $('.cell[data-index-tier$="'+tierIndex+'"]').length;       
        if(cellIndex>2){
            return false;
        }else{
            $('.show_board_d').append(`<div class='d_${tierIndex}_${cellIndex} cell' id='d${tierIndex}Chart${cellIndex}' data-index-cell='${cellIndex}' data-index-tier='${tierIndex}'><div><span class='addChart'>+</span></div></div>`)
        }

        addCellCss(cellIndex, tierIndex);
        goChartProbeToAddChart();
        moveCell();
        $('.cell').dblclick((event) => {
            event.stopPropagation();
            let ele = event.currentTarget;
            magnify(ele);
        });
              
    })
}
addCellClickEvent();

//格的位置
function addCellCss(cellIndex, tierIndex){  
    let topValue = countTop( tierIndex );
    $('.d_'+tierIndex+'_'+cellIndex).css({'left': '99%', 'top': topValue+'%'}).animate({'top': topValue+'%','left': (cellIndex+1)*2.5+cellIndex*30+'%','height': dashboardDHeight['tier'+tierIndex]+'%'})    
    addStyleAttribute('#d'+tierIndex+'Chart'+cellIndex, dashboardDHeight['tier'+tierIndex], 30, topValue, (cellIndex+1)*2.5+cellIndex*30, position[0])
    position.shift();
}

//给新加标签添加style属性
function addStyleAttribute(str, h, w, t, l, index){
    var cellStyle = {
        top:null,
        left:null,
        width:null,
        height:null,
        index:null
    }
    cellStyle.top = t;
    cellStyle.left = l;
    cellStyle.width = w;
    cellStyle.height = h;
    cellStyle.index = index+'';  
    cellStyle.id = $(str).attr('id');
    cellStyle.class = $(str).attr('class').replace(' ', '|');
    cellStyle.dataIndexCell = $(str).attr('data-index-cell');
    cellStyle.dataIndexTier = $(str).attr('data-index-tier');
    console.log(cellStyle)
    console.log(JSON.stringify(cellStyle))
    console.log(JSON.parse( JSON.stringify(cellStyle) ))
    $(str).attr('data-style',JSON.stringify(cellStyle));
    $(str).attr('data-index',index+'');
}

//获取当前页面的AllPosition nofill data-style
function saveCustomTemplate(){
    customTemplateStyle = [];
    customAllPosition = [];
    customNofill = [];
    $('.cell').map(function(index, item){
        let obj = JSON.parse($(this).attr('data-style'));//str
        customTemplateStyle.push(obj);
        customAllPosition.push(parseInt(obj.index));
        if( $(this).find('svg').length ==0 ){
            customNofill.push(parseInt(obj.index));
        }
    })
}

//模板为自定义模板是还原界面，还原界面
function restoreInterface(arr){
    //有了交换style和乱序的allposition才是一一对应的
    $('.show_board_d').html('');
    arr.map(function(item, index){ 
        // let temp = item.substring(1, item.length-1);     
        // let substitute = JSON.parse(temp);  
        let substitute = item;
        console.log(item)
        $('.show_board_d').append(`<div class=${substitute.class.replace('|', ' ')}  id=${substitute.id} data-index-tier=${substitute.dataIndexTier} data-index-cell=${substitute.dataIndexCell} data-index=${substitute.index} data-style=${JSON.stringify(item)} ><div><span class='addChart'>+</span></div></div>        
        `)
        $('#'+substitute.id).css({'height':substitute.height+'%', 'width':substitute.width+'%', 'top':substitute.top+'%', 'left':substitute.left+'%'}).addClass('cell');        
        if(substitute.dataIndexTier==1){
            $('.show_board_d').append(`<span class='add_cell_btn addc_0' data-index='0'>+</span>`);
            $('.addc_0').css({'top': substitute.top+'%'});
        }else if(substitute.dataIndexTier==1){
            $('.show_board_d').append(`<span class='add_cell_btn addc_1' data-index='1'>+</span>`);
            $('.addc_1').css({'top': substitute.top+'%'});
        }else if(substitute.dataIndexTier==2){
            $('.show_board_d').append(`<span class='add_cell_btn addc_2' data-index='2'>+</span>`); 
            $('.addc_2').css({'top': substitute.top+'%'});
        }
              
    })
    addCellClickEvent();//加块的点击事件
    goChartProbeToAddChart();//跳转图表点击事件
    moveCell(); 
    $('.cell').dblclick((event) => {
        event.stopPropagation();
        let ele = event.currentTarget;
        magnify(ele);
    });
}

$('#saveEdit').click(function() {
    $('#saveTemplate').show();
    $('#tempNameWarn').hide();
    if(!customEnable){
        $('#saveTempUpdate').hide();
    }else{
        $('#saveTempUpdate').show();
    }
    $('#customTemplateName').attr('placeholder', '自定义模板1');
})

$('#saveTempUpdate').click(function(){  
    if(localStorage.getItem('template') == $('#customTemplateName').val()){

    }
})

$('#saveTempCancel').click(function(){
    $('#saveTemplate').hide();
    $('#tempNameWarn').hide();
})

//保存当前模板
$('#saveTempNew').click(function(){
    saveCustomTemplate();
    let name = $('#customTemplateName').val() || $('#customTemplateName').attr('placeholder');
    let noRepeat = true;
    templateList.forEach(function(item, i){
        if(item.template == name){
            noRepeat = false;
        }
    })
    if(noRepeat){
        $.ajax({
            url: EPMUI.context.url+'/dashboard/create', 
            type: 'POST',
            dataType: 'json',
            data: {
                'template': name,
                "style": JSON.stringify( customTemplateStyle ),
                'nofill': JSON.stringify( customNofill ),
                'allPosition': JSON.stringify( customAllPosition ),
                'enable':1
            },
            error: function(err) {
            },
            success: function (data) {
                if(data.code == 200){
                    //返回值只有新生成的dashboardid
                    localStorage.setItem('dashboardTemplate',name)
                    localStorage.setItem('noFill', JSON.stringify( customNofill ));
                    localStorage.setItem('dashboardId', data.magicube_interface_data.dashboardId);
                    localStorage.setItem('allPosition', JSON.stringify( customAllPosition));
                    $('#saveTemplate').hide();
                    //还原界面
                    restoreInterface(customTemplateStyle)
                    //加载dashboard数据
                    showDashboard ()
                }                                   
            }
        })
    }else{
        $('#tempNameWarn').show().text('名称已存在'); 
    }
    
})

//页面跳转
$('.selectBar_div').click(function(){
    //localStorage.setItem('')
});

//合并功能接口函数
function merge() {
    saveCustomTemplate();
    $.ajax({
        url: EPMUI.context.url + '/dashboard/chart/merge',
        type: 'post',
        data: {'nofill':JSON.stringify(customNofill),
               'allPosition': JSON.stringify(customAllPosition),
               'style': JSON.stringify(customTemplateStyle)},
        dataType: 'json',
        success:function(data){ 
            if(data.code == 200){
                localStorage.setItem('nofill', JSON.stringify(customNofill));
            }else{}
        }
    })
}

//刷新图表
function afreshDraw(type, result, id, tip, transW, transH ){
    if(type== 'yz'){
        bar( result, id, JSON.parse(tip), transW, transH );
    }else if( type == 'zx'){
        line( result, id, JSON.parse(tip), transW, transH );  
    }else if( type == 'yb'){
        pie( result, id, JSON.parse(tip), transW, transH );
    }else if(type =='gis'){
        loadGis( JSON.stringify(result), id, transW, transH );
    }
}

//拖动div函数
function moveCell(){
    let initDragLeft,
        initDragTop,
        dragDom;
    
    $('.cell').unbind("mousedown");     
    $('.cell').mousedown( function(){
        $('.dashboard div').css('transition','');
        if( mark ){
            $(this).unbind('mousemove');
            event.stopPropagation()
            $(this).addClass('operation');
            $(this).siblings().removeClass('operation');
            initDragLeft = $(this).offset().left - $('.dashboard_template_d').width() * 0.02;
            initDragTop = $(this).offset().top - 50;
            //这四个值都不带px
            initL = $(this).offset().left;
            initT = $(this).offset().top;
            initX = event.clientX;
            initY = event.clientY;  
            $(this).bind('mousemove', function() {
                event.stopPropagation();
                preX = event.clientX;
                preY = event.clientY;
                $(this).css( {'top': (initT+preY-initY-50)+'px', 'left': (initL+preX-initX)+'px'} );
                mark = false;
            })
        }    
    });

    $('.cell').unbind("mouseup"); 
    $('.cell').mouseup(function(){
        $(this).unbind('mousemove');    
        event.stopPropagation()
        dragDom = $(this);
        preX = event.clientX;
        preY = event.clientY;
        var dragDomClass = $(this).attr('class');
        var flag = false;
        var nofill_ = [];   
    
        $('.cell:not(.operation)').each( function(i, dom){
            if( dom.offsetLeft < preX && preX < (dom.offsetWidth + dom.offsetLeft) && dom.offsetTop < (preY - 50) && (preY - 50) < (dom.offsetHeight + dom.offsetTop) ){
                flag = true;
                $('#moveAlert').css({'top':preY-50+'px','left':preX+'px'}).show();

                var dragH = dragDom.height();
                var dragW = dragDom.width();
                var targetW = dom.offsetWidth;
                var targetH = dom.offsetHeight;
                var left_ = dom.offsetLeft;
                var top_ = dom.offsetTop;
                var targetId = dom.getAttribute('id');
                let targetLeft = dom.offsetLeft;
                let targetTop = dom.offsetTop;
                var hasSvg = dom.getElementsByTagName("svg");

                Array.prototype.remove = function(val) { 
                    var index = this.indexOf(val); 
                        if (index > -1) { 
                        this.splice(index, 1); 
                    } 
                };

                //合并
                $('#merge').unbind('click')
                $('#merge').click(function(){
                    event.stopPropagation();
                    $('#moveAlert').hide();
                    if(dragDom.find('svg').length>0 && hasSvg.length>0){
                        dragDom.css('transition','all 0.4s ease-in-out').css({'left':(initL-$('.show_board_d').offset().left+'px'), 'top':(initT-50+'px')}) 
                    }else{
                       
                        let attrTarget = dom.getAttribute('data-style');
                            attrTarget = JSON.parse(attrTarget);
                        let attrDrag = dragDom.attr('data-style');
                            attrDrag = JSON.parse(attrDrag);

                        //左边距相同，公共边是宽
                        if ( Math.abs(targetLeft - initDragLeft) < 6 && Math.abs(targetW - dragW) < 10 ) {
                            //确实有公共边，没有隔着一个图
                            if(initDragTop > targetTop && (Math.abs(initDragTop - targetTop) - $('.show_board_d').height() * 0.025 - targetH) < 6) {
                                let finalHeight = targetH + dragH + $('.show_board_d').height() * 0.025;
                                
                                //拖拽div有图，目标div，没图，应该删除目标div
                                if(dragDom.find('svg').length>0){
                                    dragDom.css({'transition': 'all 0.4s ease-in-out', 'height': finalHeight+'px', 'top':targetTop+'px', 'left':initDragLeft+'px'})
                                    
                                    
                                    attrDrag.top = attrTarget.top;
                                    attrDrag.height = attrTarget.height + attrDrag.height +2.5;
                                    dragDom.attr('data-style', JSON.stringify(attrDrag) );                                   
                                    dom.parentNode.removeChild(dom);
                                
                                    customAllPosition.remove( dom.getAttribute('data-index'));
                                    dragDom.children().html('');
                                    console.log(dragDom.width())
                                    console.log(dragDom.height())
                                    afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), targetTop, finalHeight )
                                    
                                    
                                //反之，删除拖拽div
                                }else if(hasSvg.length >= 0){
                                    
                                    dom.style.transition = 'all 0.4s ease-in-out';
                                    dom.style.height = finalHeight + 'px'; 
                                    
                                    attrTarget.height = attrTarget.height + attrDrag.height +2.5;
                                    dom.setAttribute('data-style', JSON.stringify(attrTarget) );
                                    dragDom.remove();
                                    dom.childNodes[0].innerHTML = '';
                                    console.log(dom.clientHeight)
                                    afreshDraw(dom.getAttribute(('data-type')), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), dom.clientWidth, finalHeight )
                                    
                                }
                                
                            } else if (initDragTop < targetTop && (Math.abs(initDragTop - targetTop) - $('.show_board_d').height() * 0.025 - dragH) < 6) {
                                let finalHeight = targetH + dragH + $('.show_board_d').height() * 0.025;    

                                if(dragDom.find('svg').length >= 0){
                                    dragDom.css({'transition': 'all 0.4s ease-in-out', 'height': finalHeight+'px', 'top':initDragTop+'px', 'left':initDragLeft+'px'})
                                    
                                    
                                    
                                    attrDrag.height = attrTarget.height + attrDrag.height +2.5;
                                    dragDom.attr('data-style', JSON.stringify(attrDrag) )
                                    dom.parentNode.removeChild(dom);
                                    dragDom.children().html('');
                                    afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), dragDom.width(), finalHeight )
                                    
                                }else if(hasSvg.length>0){
                                    
                                    dom.style.transition = 'all 0.4s ease-in-out';
                                    dom.style.height = finalHeight + 'px'; 
                                    dom.style.left = initDragTop + 'px';
                                    
                                    attrTarget.top = attrDrag.top;
                                    attrTarget.height = attrTarget.height + attrDrag.height +2.5;
                                    dom.setAttribute('data-style', JSON.stringify(attrTarget) );
                                    dragDom.remove();
                                    dom.childNodes[0].innerHTML = '';
                                    afreshDraw(dom.getAttribute(('data-type')), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), dom.clientWidth, finalHeight )
                                }

                            }
                            
                        }else if ( Math.abs(targetTop - initDragTop) < 6 && Math.abs(targetH - dragH) < 10 ) {
            
                            if(initDragLeft > targetLeft && (Math.abs(initDragLeft - targetLeft) - $('.show_board_d').width() * 0.025 - targetW) < 6){
                                let finalWidth = targetW + dragW + $('.show_board_d').width() * 0.025;

                                if(dragDom.find('svg').length>0){
                                    dragDom.css({'transition': 'all 0.4s ease-in-out', 'width': finalWidth +'px', 'left':targetLeft+'px', 'top': initDragTop+'px'})
                                    
                                    attrDrag.width = attrTarget.width + attrDrag.width +2.5;
                                    attrDrag.left = attrTarget.left;
                                    dragDom.attr('data-style', JSON.stringify(attrDrag) )
                                    dom.parentNode.removeChild(dom)
                                    dragDom.children().html('');
                                    afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), finalWidth, dragDom.height() )
                                    
                                }else if(hasSvg.length>=0){
                                    dom.style.transition = 'all 0.4s ease-in-out';
                                    dom.style.width = finalWidth + 'px';  

                                    attrTarget.width = attrTarget.width + attrDrag.width +2.5;
                                    dom.setAttribute('data-style', JSON.stringify(attrTarget) )
                                    dragDom.remove();
                                    dom.childNodes[0].innerHTML = '';
                                    afreshDraw(dom.getAttribute(('data-type')), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), finalWidth, dom.clientHeight )
                                }
                                
                            }else if(initDragLeft < targetLeft && (Math.abs(initDragLeft - targetLeft) - $('.show_board_d').width() * 0.025-dragW) < 6){
                                let finalWidth = targetW + dragW + $('.show_board_d').width() * 0.025;

                                if(dragDom.find('svg').length>0){
                                    dragDom.css({'transition': 'all 0.4s ease-in-out', 'width': finalWidth +'px', 'left':initDragLeft+'px', 'top': initDragTop+'px'})
                                    
                                    attrDrag.width = attrTarget.width + attrDrag.width +2.5;
                                    dragDom.attr('data-style', JSON.stringify(attrDrag) )
                                    dom.parentNode.removeChild(dom)
                                    dragDom.children().html('');
                                    afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), finalWidth, dragDom.height() )
                                    

                                }else if(hasSvg.length>=0){
                                    dom.style.transition = 'all 0.4s ease-in-out';
                                    dom.style.width = finalWidth + 'px'; 
                                    dom.style.left = initDragLeft+'px';

                                    attrTarget.laft = attrDrag.left;
                                    attrTarget.width = attrTarget.width + attrDrag.width +2.5;
                                    dom.setAttribute('data-style', JSON.stringify(attrTarget) )
                                    dragDom.remove();
                                    dom.childNodes[0].innerHTML = '';
                                    afreshDraw(dom.getAttribute(('data-type')), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), finalWidth, dom.clientHeight  )
                                }
                            }
            
                        } else{
                            dragDom.css('transition','all 0.4s ease-in-out').css({'left':(initL-$('.show_board_d').offset().left+'px'), 'top':(initT-50+'px')})                                               
                        }
                    }
                    
                    merge();
                    $('.show_board_d div').css('transition','');
        
                })

                //交换

                $('#move').unbind('click')
                $('#move').click(function(){
                    event.stopPropagation();
                    $('#moveAlert').hide();       
                    var targetDomClass = dom.getAttribute('class');
                    dragDom.removeAttr('class').css('transition','all 0.4s ease-in-out').attr('class',targetDomClass).css({'left':left_+'px', top:top_+'px', 'height':targetH+'px', 'width':targetW+'px'});                   
                    dom.removeAttribute('class');
                    dom.setAttribute('class',dragDomClass); 
                    dom.style.transition = 'all 0.4s ease-in-out';
                    dom.style.left = initL - $('.show_board_d').offset().left+'px';
                    dom.style.top = initT-50+'px';
                    dom.style.height = dragH + 'px';
                    dom.style.width = dragW + 'px';
                    
                    // flag = true;
                
                    //nofill
                    //localStorage.getItem('noFill')
                    //1.两个都有图表的进行交换2.一个有一个无的交换，两个都无
                    

                    var dragIdi = dragDom.attr('data-id'), 
                        dragIndex = parseInt(dragDom.attr('data-index')), 
                        targetIdi = dom.getAttribute('data-id'), 
                        targetIndex = parseInt($('#'+targetId).attr('data-index'));
                    //现在样式不在class里，光交换class不能交换样式
                    if(dragDom.find('svg').length>0 && hasSvg.length>0){
                        dragDom.children().html('');
                        dom.childNodes[0].innerHTML = "";
                        afreshDraw(dom.getAttribute('data-type'), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), dragW, dragH );
                        afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), targetW, targetH);
                        //moveRequest(dragIdi, dragIndex, targetIdi, targetIndex);
                        moveRequest(dom, dragDom);
                        nofill_ = JSON.parse(localStorage.getItem('noFill'));
                    }
                    else if(dragDom.find('svg').length==0 && hasSvg.length==0){
                        nofill_ = JSON.parse(localStorage.getItem('noFill'));
                    }
                    else if( dragDom.find('svg').length>0 && hasSvg.length==0){
                        nofill_ = JSON.parse(localStorage.getItem('noFill'));
                        nofill_.remove(  parseInt(dragDom.attr('data-index')) );
                        nofill_.push( parseInt($('#'+targetId).attr('data-index')) );
                        dragDom.children().html('');
                        moveRequest(dom, dragDom);
                        afreshDraw(dragDom.attr('data-type'), JSON.parse(dragDom.attr('data-result')), dragDom.attr('id'), dragDom.attr('data-tip'), targetW, targetH );
                        //moveRequest(dragIdi, dragIndex);
                    }
                    else if( dragDom.find('svg').length==0 && hasSvg.length>0){
                        //拖动的元素的空的，目标位置的元素是有图的
                        nofill_ = JSON.parse(localStorage.getItem('noFill'));
                        nofill_.remove( parseInt($('#'+targetId).attr('data-index')) );
                        nofill_.push( parseInt(dragDom.attr('data-index')) );
                        dom.childNodes[0].innerHTML = "";
                        moveRequest(dom, dragDom);
                        afreshDraw(dom.getAttribute('data-type'), JSON.parse(dom.getAttribute('data-result')), dom.getAttribute('id'), dom.getAttribute('data-tip'), dragW, dragH );
                        //moveRequest(targetIdi, targetIndex);
                        
                    }
                    //moveRequest(dom, dragDom);
                    // function moveRequest(arg1, arg2, arg3, arg4){
                    //     $.ajax({
                    //       url: EPMUI.context.url+'/dashboard/chart/move',
                    //       type:'post',
                    //       data:{
                    //           "dashboardId": localStorage.getItem('dashboardId'),
                    //           "chartOneId": arg1,
                    //           "positionOne": arg2,
                    //           "chartTwoId": arg3,
                    //           "positionTwo": arg4,
                    //           "nofill": JSON.stringify(nofill_)
                    //       },
                    //       success:function(data){
                    //             if(JSON.parse(data).code == 200){
                    //                 localStorage.setItem('noFill',JSON.stringify(nofill_));
                    //                 $('#'+arg1).parent().html('');
                    //                 showDashboard ()
                    //                 //交换class实际结构没变的话重新加载页面
                    //                 //解决方法一：不用给后端发请求，直接变掉前端界面的样式，chartA的posi为0，以前0在左上角宽高小，后来0在右下角宽高大
                    //                 //解决方法二：每次交换完要刷新页面
                    //             }
                              

                    //       }
                    //     })
                    // }
                    
                    function moveRequest(target, drag){
                        let tStyle = JSON.parse(target.getAttribute('data-style'));
                        let dStyle = JSON.parse(drag.attr('data-style'));
                        drag.attr('data-style', JSON.stringify(tStyle));
                        target.setAttribute('data-style', JSON.stringify(dStyle));
                        
                        let dId = drag.attr('id')
                        let dTier = drag.attr('data-index-tier')
                        let dcell = drag.attr('data-index-cell')
                        let dIndex = drag.attr('data-index')

                        let tId = target.getAttribute('id')
                        let tTier = target.getAttribute('data-index-tier')
                        let tcell = target.getAttribute('data-index-cell')
                        let tIndex = target.getAttribute('data-index')
                        drag.removeAttr('id');
                        drag.removeAttr('data-index-tier');
                        drag.removeAttr('data-index-cell');
                        drag.removeAttr('data-index');

                        drag.attr('id', tId);
                        drag.attr('data-index-tier', tTier);
                        drag.attr('data-index-cell', tcell);
                        drag.attr('data-index', tIndex);

                        target.removeAttribute('id')    
                        target.removeAttribute('data-index-tier')
                        target.removeAttribute('data-index-cell')
                        target.removeAttribute('data-index');

                        target.setAttribute('id', dId)
                        target.setAttribute('data-index-tier', dTier)
                        target.setAttribute('data-index-cell', dcell)
                        target.setAttribute('data-index', dIndex);
                        merge();
                    }
               
                    

                    // if(!flag){
                    //     dragDom.css('transition','all 0.4s ease-in-out').css({'left':(initL-$('.show_board_d').offset().left+'px'), 'top':(initT-50+'px')})
                    // }
                    // $('.dashboard div').css('transition','');
                })
                
                

            }else{
              // dragDom.css('transition','all 0.4s ease-in-out').css({'left':(initL-$('.show_board_d').offset().left+'px'), 'top':(initT-50+'px')})                                               
               
            }
        }) 
        // $('.show_board_d div').css('transition','');  
        if(!flag){
            dragDom.css('transition','all 0.4s ease-in-out').css({'left':(initL-$('.show_board_d').offset().left+'px'), 'top':(initT-50+'px')})
        }
        mark=true;
    }); 
    
    $('.cell').unbind('mousemove');
}

$('.cell').unbind('mousemove');

//合并或交换时
// function amendStyleAttribute(drag, target){
//     let final = JSON.tostringify(drag.attr('data-style'));
//     final.height = 

// }





})
