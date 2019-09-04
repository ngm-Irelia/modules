import React ,{Component} from 'react';

class Chart extends Component {

	constructor (props){
		super(props);//props是接收的数据
		this.state = {
         dataSource: {},
         id:'dv'
		};
		this.handleDrawChart = this.handleDrawChart.bind(this);//绑定this指向
	}

//    const colora = ["#b2db4e","#ea901e","#ffff29","#4cb3d2","#d94d4c","#a981e4","#eaff56","#2ddfa3","#70f2ff","#f57983",
//                    "#85f1e2","#ff780c","#e0efe8","#10a8ab","#b2db4e","#a1f480","#ff9798","#591ece","#f99070","#3dbcc2",
//                    "#b2db4e","#ea901e","#ffff29","#4cb3d2","#d94d4c","#a981e4","#eaff56","#2ddfa3","#70f2ff","#f57983",
//                    "#85f1e2","#ff780c","#e0efe8","#10a8ab","#b2db4e","#a1f480","#ff9798","#591ece","#f99070","#3dbcc2"];
//    const colorb = ["#0eb83b","#cb99cc","#70f2ff","#f99070","#fffc31","#cccc9a","#7463FF","#ff823f","#48c0a4","#eafdc5",
//                    "#bef7e4","#f23a3a","#4ea1d3","#dfdce3","#e77776","#ff5965","#ffffff","#35a7ff","#ffe74d","#94dbf1",
//                    "#0eb83b","#cb99cc","#70f2ff","#f99070","#fffc31","#cccc9a","#7463FF","#ff823f","#48c0a4","#eafdc5",
//                    "#bef7e4","#f23a3a","#4ea1d3","#dfdce3","#e77776","#ff5965","#ffffff","#35a7ff","#ffe74d","#94dbf1"];

//    /*请求画图数据*/
//    componentWillMount(){
//       fetch(url + '/chart/chartData')
//          .then( (response ) => response.json() )
//          .then( (data) => {
//             this.setState( {
//                dataSource:data
//             } )
//          })
//    }

//    componentDidMount(){
//        handleDrawChart();
//    }

   

// // 我这里需要使用组件的人传进来的参数
// // this.props.padding
// // this.props.co
// // this.props.width
// // this.props.height
// // 
// //padding = {left:40,right:40,top:90,bottom:40};
// //   co=15;//宽度的系数
  
//    handleDrawChart(){
//   	   var dataa = this.state.dataSource.statisticalItems;
//       var w1 = w + dataa.length*this.props.co;
//       dataa.map((item) => {
//         item.yValue = Number( item.yValue);
//       })
//       var svg = d3.select("#dv")
//                   .append("svg")
//                   .attr("height",this.props.height)
//                   .attr("width",w1)
//                   .attr("class","ctrl svgsvg");
//       var pie = d3.layout.pie().value(function(d){return d.yValue;});
//       var colora_=[];
//       var piedata_ = pie(dataa);
//       var r_in = this.props.height/8;
//       var r_out = this.props.height/4 ; 
//       var r_out_b = r_out+10;
//       var arc_ = d3.svg.arc().innerRadius(r_in).outerRadius(r_out);//生成一个线性弧度,弧生成器
//       var arcs_ = svg.selectAll(".sty_").data(piedata_).enter().append("g").attr("transform","translate("+w/3+","+qs+")"); //分组      
//       var arc = d3.svg.arc().innerRadius(r_in).outerRadius(r_out_b);//交互效果的弧生成器
//       var pa = arcs_.append("path")//往分组里添加路径
//              .attr("d",function(d){
//                 return arc_(d);
//              })
//              .attr("fill",function(d,i){
//                 var tmpColor;
//                 colora[i] ? tmpColor=colora[i] : tmpColor="#f1bcc3";
//                 colora_.push(tmpColor);
//                 return tmpColor ; 
//              })
//              .attr("class",function(d,i){ return "pa"+i+"" ;});
//       var tooltip = d3.select("#dv").append("div").attr("class","tooltip").style("opacity",0.0);        

//       arcs_.on("mouseover",function(d,i){
//               var percent = d.data.yValue/d3.sum(change,function(d){return d.yValue;})*100;
//               var txt = d.data.xValue + " "+ ":" +" " +percent.toFixed(1)+"%";
//                tooltip.html(txt)
//                     .style("left",(d3.event.pageX-30)+"px")
//                     .style("top",(d3.event.pageY-110)+"px")
//                     .style("opacity",0.7);
//               })
//               .on("mousemove",function(d,i){
//                 tooltip.transition().duration(100).ease("in-out").style("left",(d3.event.pageX-30)+"px").style("top",(d3.event.pageY-110)+"px")
//                 d3.select(".hint"+i).style("stroke","#33d0ff").style("stroke-width",3);
//               })
//               .on("mouseout",function(d,i){
//                 tooltip.style("opacity",0);
//                 tooltip.html("");
//                 d3.select(".hint"+i).style("stroke-width",0);
//                 });
        
        
//             arcs_.on("mouseenter",function(d,i){
//                 d3.select(this).append("path").attr("fill",colora_[i]).attr("d",arc_(d)).transition()
//                 .duration(300).ease("bounce").attr("d",arc(d)).attr("class","pa"+i+"");            
//               })
//              .on("mouseleave",function(d,i){
//                 d3.selectAll(".pa"+i+"").style("opacity",0);
//                 d3.select(this).append("path").attr("fill",colora_[i]).attr("d",arc(d)).transition()
//                 .duration(300).ease("bounce").attr("d",arc_(d)).attr("class","pa"+i+"");
               
//              })
        
    
//         var xw = w*0.6;
//         var xh = h/6;
        
        
//         // var text = svg.selectAll(".pieText").data(dataa).enter().append("text")
//         //               .attr("transform",function(d,i){
//         //                 var i_tmp = Math.floor(i/10);
//         //                 var i_tp = i%10;
//         //                 var i_x = ww/2+i_tmp*190;
//         //                return "translate("+(i_x+25)+","+(hh/4+i_tp*22+10)+")";
//         //               })
//         //               .attr("class",function(d,i){
//         //                 return "pieText"+i
//         //               })
//         //               .text(function(d){return d.xValue;});
//         // var rects = svg.selectAll(".pieRect").data(dataa).enter().append("rect")
//         //             .attr("transform",function(d,i){ 
//         //                 var i_tmp = Math.floor(i/10);
//         //                 var i_tp = i%10;
//         //                 var i_x = ww/2+i_tmp*190;
//         //                 return "translate("+i_x+","+(hh/4+i_tp*22)+")";
//         //             })
//         //             .attr("width",15).attr("height",10).style("fill",function(d,i){return colora_[i];})
//         //             .attr("class",function(d,i){ return "hint"+i;});

        
//         svg.append("text")
//            .text(this.state.dataSource.tableName)
//            .attr("class","textd")
//            .attr("transform","translate("+(14*w/33)+","+(padding.top-50)+")");
//         var len = this.state.dataSource.tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
//         var loca = len*17/2+60+ww/2-70 //提示信息的位置
        
        
//     }
    
//   }

  render(){
    return(
    	<div id="dv"></div>
		);
  }
} 

export default Chart;
export { Chart };