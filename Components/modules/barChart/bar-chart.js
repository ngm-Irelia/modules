/**
 * @fileoverview 组件-横向柱状图 
 * v1.0 简单实现功能，用户自定义各种效果后续开发
 * 示例文件 first.html
 * 基于原生js
 *
 * @author NGM
 * @version 1.0
 */

/** 
 * @namespace component的所有类均放在Component命名空间下
 */
var Component = window.Component = Component || {};

(function(){
	class BarChart {
		constructor() {
			this.showId = "";//显示的id
			this.showData = '';
		}
		/**
		 * 加载函数
		 * @param showId 显示#id
		 * @param data 显示数据
		 */
		run(showId, data) {
			this.showId = showId;
			this.showData = data;
			
			this.showLineChart();
		}

		/**
		 * 显示柱状图
		 */
		showLineChart() {
			let _that = this;
			let showdata = _that.showData;
			
			if(!showdata){ return '';}
			
			let html = `<div class="common-showLineChart">`;
			
			for(var i=0;i<showdata.length;i++){
				html += `<div class="common-showLineChart-outLine">
					<div class="common-showLineChart-innerLine" style="background-color:${_that.innerLineColorArr(i)};"></div>
					<div class="common-showLineChart-index-background" style="border-color:${_that.indexColorArr(i)} transparent transparent transparent;"></div>
					<div class="common-showLineChart-index">${i+1}</div>
					<div class="common-showLineChart-title">${showdata[i].name}</div>
					<div class="common-showLineChart-number">${showdata[i].number}</div>
				</div>`;
			}
			 
			html += `</div>`;
			
			document.getElementById(_that.showId).innerHTML = html;
			
			setTimeout(function(){
				var doms = document.getElementsByClassName('common-showLineChart-innerLine');
				for(var i=0;i<doms.length;i++){
					doms[i].style.width = (showdata[i].number/showdata[0].number)*100+'%';
				}
			},0);
			
		}
		
		innerLineColorArr(index){
			let arr = ["#ff7575","#ff9a9a","#feb5b5","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6"];
			return arr[index];
		}
		
		indexColorArr(index){
			let arr = ["#fe0202","#e6a23a","#f5c478","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc"];
			return arr[index];
		}



	}

	Component.BarChart = BarChart;
})()
	
 
