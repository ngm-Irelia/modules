document.addEventListener("DOMContentLoaded", function(event) {

	class CommonLineChart {
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
			
			let html = `<div id="common-showLineChart">`;
			
			for(var i=0;i<showdata.length;i++){
				html += `<div id="common-showLineChart-outLine">
					<div id="common-showLineChart-innerLine" style="width:${(data[i].number/data[0].number)*100}%; background-color:${_that.innerLineColorArr(i)};"></div>
					<div id="common-showLineChart-index-background" style="border-color:${_that.indexColorArr(i)} transparent transparent transparent;"></div>
					<div id="common-showLineChart-index">${i+1}</div>
					<div id="common-showLineChart-title">${data[i].name}</div>
					<div id="common-showLineChart-number">${data[i].number}</div>
				</div>`;
			}
			 
			html += `</div>`;
			
			document.getElementById(_that.showId).innerHTML = html;
			
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




	//使用方式如下
	window.commonLineChart = new CommonLineChart();

	// 使用时，传入对应参数，使用即可
	//模拟data
	var data = [
		{
			id:"111",
			name:"中国",
			number:1399
		},{
			id:"999",
			name:"中国2",
			number:999
		},{
			id:"888",
			name:"中国",
			number:888
		},{
			id:"777",
			name:"中国",
			number:777
		},{
			id:"666",
			name:"中国",
			number:666
		},{
			id:"555",
			name:"中国",
			number:555
		},{
			id:"444",
			name:"中国",
			number:444
		}
	]
	
	/**
	 * 加载函数
	 * @param showId 数据需要显示的父id
	 * @param data 显示的数据
	 */
	commonLineChart.run("showarea",data);



});
