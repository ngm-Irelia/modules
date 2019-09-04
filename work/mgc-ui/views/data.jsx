import React, { Component } from 'react';
import { Header, RegisterUser, RegisterGroup, Table, Alert } from '../../build/components/magicube';
import { Pagination } from 'epm-ui';

const url = '/magicube';

const page = {
	title: '版本管理',
	css: [
    	'/css/data/data.css'
	],
	js: [
    '/js/public/watermask.js',
		'js/public/laydate/laydate.js'		
	]
};

 class Data extends Component {
 	constructor(props) {
 		super(props);
 		this.state = {
 			tabFlag: true,
 			data: [],
 			dataSource: [],
 			handleData: {},
 			columns: [
		    	{
		    		"title": "序号",
		        	"key": "NO"
		    	},
		    	{
		    		"title": "数据集名称",
		        	"key": "name"
		    	},
		    	{
		    		"title": "描述",
		        	"key": "description"
		    	},
		    	{
		    		"title": "创建者",
		        	"key": "author"
		    	},
		    	{
		    		"title": "版本数量",
		        	"key": "versionQuantity"
		    	},
		    	{
		    		"title": "最新更新时间",
		        	"key": "updateTime"
		    	},
		    	{
		    		"title": "导出",
		        	"key": "export"
		    	},
		    	{
		    		"title": "删除",
		        	"key": "delete"
		    	},
		    	{
		    		"title": "打开",
		        	"key": "open"
		    	}
		    ],
 			selectable: false,
 			singleSelection: false,
 			selectAll: '',
 			dataType: 'dataset',
 			returnVisible: 'none',
 			pageIndex: 1,
			pageSize: 10,
			searchValue: '',
			searchType: ''
 		};	
 		this.handleChange = this.handleChange.bind(this);
		this.getPersonalData = this.getPersonalData.bind(this);
		this.handleClickSearchTime = this.handleClickSearchTime.bind(this);
 	}

 	componentDidMount() {
		//  调用日历插件 
		laydate.render({
			elem: '#data_time',
			done: function(value, date, endDate){
				this.setState({
					searchValue: value
				},()=>{
					this.handleClickSearchTime();	
				})
			}.bind(this)
		});

		// 获取个人平台信息
		this.getPersonalData();

		 // 获取cookie
		const getCookie = (cookie_name) => {
			var allcookies = document.cookie;
			var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度
		
			// 如果找到了索引，就代表cookie存在，
			// 反之，就说明不存在。
			if (cookie_pos != -1){
				// 把cookie_pos放在值的开始，只要给值加1即可。
				cookie_pos += cookie_name.length + 1;      //这里容易出问题，所以请大家参考的时候自己好好研究一下
				var cookie_end = allcookies.indexOf(";", cookie_pos);
		
				if (cookie_end == -1)
				{
					cookie_end = allcookies.length;
				}
				var value = unescape(allcookies.substring(cookie_pos, cookie_end));    //这里就可以得到你想要的cookie的值了。。。
			}
			return value;
		}

		this.setState({
			userId: getCookie("userId")
		})
	 }
	 
 	// 获取个人平台数据
 	getPersonalData(datasetId, dataType, pageIndex){
 		this.setState({
 			dataType: dataType || this.state.dataType,
			datasetId: datasetId || this.state.datasetId,
			pageIndex: pageIndex || this.state.pageIndex
 			}, ()=>{
 				if(this.state.dataType == 'dataset'){
	 			let url = EPMUI.context.url + '/dataset?pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;
				fetch(url, { credentials: 'include' , method: 'GET' }).then((response)=>response.json()).then(data=>{	
					data.magicube_interface_data.data.pop();
					this.setState({
						dataSource: data.magicube_interface_data.data,
						handleData: {	
							"export": "icon-export",
							"delete": "icon-delete",
							"open": "icon-folder-open"
						},
						singleSelection: false,
						selectable: false,
						pages: data.magicube_interface_data.totalPage,
						total: data.magicube_interface_data.totalItem,
						pageSize: 10,
						dataType: 'dataset',
						returnVisible: 'none'
					})
				})
		   	}else if(this.state.dataType == 'version'){	
		   		this.setState({	
					   pageSize: 5,
					   searchValue: '',
					   searchType: ''
		   			}, ()=>{
					$("#data_case, #data_time, #data_content").val('');
		   			let url = EPMUI.context.url + '/dataset/version?setId=' + this.state.datasetId + '&pageNumber=' + this.state.pageIndex + '&pageSize=5';	
					fetch(url, { credentials: 'include', method: 'GET'}).then((response)=>response.json()).then(data=>{
						this.setState({
							columns: [
						      {
						        "title": "序号",
						        "key": "id"
						      },
						      {
						      	"title": "图示",
						      	"key": "image"
						      	},
						      {
						        "title": "案件名称",
						        "key": "name"
						      },
						      {
						        "title": "描述",
						        "key": "description"
						      },
						      {
						      	"title": "作者",
						      	"key": "author"
						      },
						      {
						      	"title": "时间",
						      	"key": "time"
						      },
						      {
						      	"title": "导出",
						      	"key": "export"
						      },
						      {
						      	"title": "推送",
						      	"key" : "send"
						      },
						      {
						      	"title": "查看",
						      	"key": "see"
						      },
						      {
						      	"title": "删除",
						      	"key": "delete"
						      },
						      {
						      	"title": "标记",
						      	"key": "sign"
						      }
						    	],
							dataSource: data.magicube_interface_data.data,
							handleData: {
								"export": "icon-export",
								"send": "icon-send",
								"see": "icon-eye",
								"delete": "icon-delete",
								"sign": "icon-mark"			
							},
							singleSelection: true,
							selectable: true,
							dataType: 'version',
							pages: data.magicube_interface_data.totalPage,
							total: data.magicube_interface_data.totalItem,
							returnVisible: 'block'
						}, () => {
							this.refs.table.getRowConfigs();
						})		
					})
		   		})
				
		   	}
 		})	
	 }
	 
 	// tab切换
 	handleSelectPlatform(e){
 		e = e || window.event;
 		this.setState({
 			columns: [
		    	{
		    		"title": "序号",
		        	"key": "NO"
		    	},
		    	{
		    		"title": "数据集名称",
		        	"key": "name"
		    	},
		    	{
		    		"title": "描述",
		        	"key": "description"
		    	},
		    	{
		    		"title": "创建者",
		        	"key": "author"
		    	},
		    	{
		    		"title": "版本数量",
		        	"key": "number"
		    	},
		    	{
		    		"title": "最新更新时间",
		        	"key": "time"
		    	},
		    	{
		    		"title": "导出",
		        	"key": "export"
		    	},
		    	{
		    		"title": "删除",
		        	"key": "delete"
		    	},
		    	{
		    		"title": "打开",
		        	"key": "open"
		    	}
		    ]
 			})
		if(e.target.innerHTML == '个人平台'){
			this.setState({
				tabFlag: true,
	 			pageIndex:1,
	 			dataType: 'dataset',
	 			pageSize: 10
			}, ()=>{
				this.getPersonalData();
			})
	 		
 		}else if(e.target.innerHTML == '公共平台'){
 			this.setState({
				tabFlag: false,
	 			dataSource: []
				})
 			//var url = EPMUI.context.url + '/user/record';
			//fetch(url, { credentials: 'include' , method: 'POST'}).then((response)=>response.json()).then(data=>{
			//	console.log(data)			
			//})
 				
 		}		
 	}
 	
 	//分页组件回调函数
 	handleChange( index, size ) {
		$(".datas_all_operate").removeClass("datas_all_operate_show").addClass("datas_all_operate_hide");
	     this.setState( {
	        pageIndex: index,
	        pageSize: size,
	        selectAll: ''
	   } , ()=> {
		let key = this.state.searchType || undefined;
		   if(key){
				switch(key){
					case 'case':
						this.handleClickSearchCase();
						break;
					case 'time':
						this.handleClickSearchTime();
						break;						
					case 'content':
						this.handleClickSearchContent();
						break;						
					default:
						this.getPersonalData();
						break;		
				}
		   }else{
			 this.getPersonalData();  
		   }		  	
	   	});
	}

	// 按案件进行检索 click
	handleClickSearchCase(){
		let url, key = this.refs.searchCaseInput.value.trim();
		this.setState({
			searchType: 'case',
			searchValue: key
		}, ()=>{
			if(this.state.dataType == 'dataset'){
				url = EPMUI.context.url + '/dataset/search?type=name&param='+ key +'&userId='+ this.state.userId +'&pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;
			}else if(this.state.dataType == 'version'){
				url = EPMUI.context.url + '/version/search?dataSetId='+ this.state.datasetId +'&type=name&param='+ key +'&userId='+ this.state.userId +'&pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;			
			}
			fetch(url, { credentials: 'include' , method: 'GET' }).then((response)=>response.json()).then(data=>{
				this.setState({
					dataSource: data.magicube_interface_data.data,
					pages: data.magicube_interface_data.totalPage,
					total: data.magicube_interface_data.totalItem
				})
			})
		})
	}

	// 按时间进行检索
	handleClickSearchTime(){
		let url, key = this.state.searchValue.trim() || undefined;
		if(key){
			this.setState({
				searchType: 'time',
				searchValue: key
			}, ()=>{
				if(this.state.dataType == 'dataset'){
					url = EPMUI.context.url + '/dataset/search?type=time&param='+ key +'&userId='+ this.state.userId +'&pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;	
				}else if(this.state.dataType == 'version'){
					url = EPMUI.context.url + '/version/search?dataSetId='+ this.state.datasetId +'&type=time&param='+ key +'&userId='+ this.state.userId +'&pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;			
				}
				fetch(url, { credentials: 'include' , method: 'GET' }).then((response)=>response.json()).then(data=>{		
					this.setState({
						dataSource: data.magicube_interface_data.data,
						pages: data.magicube_interface_data.totalPage,
						total: data.magicube_interface_data.totalItem,
					})
					// console.log(data)
				})
			})
		}else{
			this.getPersonalData();
		}
		
	}

	// 按内容进行检索 click
	handleClickSearchContent(){
		let url, key = this.refs.searchContentInput.value;
		this.setState({
			searchType: 'content',
			searchValue: key
		}, ()=>{
			if(this.state.dataType == 'dataset'){
				url = EPMUI.context.url + '/dataset/search?type=descritpion&param='+ key +'&userId='+ this.state.userId +'&pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;	

			}else if(this.state.dataType == 'version'){
				url = EPMUI.context.url + '/version/search?dataSetId='+ this.state.datasetId +'&type=descritpion&param='+ key +'&userId='+ this.state.userId +'&pageNumber=' + this.state.pageIndex + '&pageSize=' + this.state.pageSize;			
			}
			fetch(url, { credentials: 'include' , method: 'GET' }).then((response)=>response.json()).then(data=>{
				this.setState({
					dataSource: data.magicube_interface_data.data,
					pages: data.magicube_interface_data.totalPage,
					total: data.magicube_interface_data.totalItem
				})
			})
		})
	}
	
	// 按案件进行检索 keyup		
	handleKeyUpSearchCase(e){
		if(e.keyCode == 13){
			this.handleClickSearchCase();
		}	
	}

	// 按内容进行检索 keyup	
	handleKeyUpSearchContent(e){
		if(e.keyCode == 13){
			this.handleClickSearchContent();	
		}
	}

	// 批量推送版本
	pushAll(){	
		this.refs.table.handleSend();
	}

	// 批量删除版本
	deleteAll(){
		this.refs.table.handleDelete();
	}

	// 返回数据集页面
	goBack() {
		location.reload(true);
	}
	
 	render() {    
 		return (
 			<div>
 				<Header /> 				
 				<div className="datas_box">
	 				<div className="datas_box_titles clearFloat">
	 					<ul id="datas_tab_titles" ref="tab_titles">
		 					<li className="datas_tab_title">
		 						<div>
		 							<p className={ this.state.tabFlag? 'datas_tab_title_item_active' : 'datas_tab_title_item' } onClick={ this.handleSelectPlatform.bind(this) } style={ this.state.choosePreStyle }>个人平台</p>
		 						</div>
		 					</li>	
		 					<li className="datas_tab_title">
		 						<div>
		 							<p className={ !this.state.tabFlag? 'datas_tab_title_item_active' : 'datas_tab_title_item' } onClick={ this.handleSelectPlatform.bind(this) } style={ this.state.choosePubStyle }>公共平台</p>
		 						</div>
		 					</li>
		 				</ul>
		 				<div className="datas_all_operate">
		 					<span className="icon-send" onClick={ this.pushAll.bind(this) }></span>
		 					<span className="icon-delete" onClick={ this.deleteAll.bind(this) }></span>
		 				</div>
		 				<div className="datas_search_filter">
		 					<div className="clandar_box datas_search_filter_box">
		 						<input type="text" id="data_case" placeholder="按案件进行检索" ref="searchCaseInput" onKeyUp={ this.handleKeyUpSearchCase.bind(this) } />
		 						<span className="icon-folder" onClick={ this.handleClickSearchCase.bind(this) }></span>
		 					</div>
		 					<div className="datas_search_filter_box">
		 						<input type="text" id="data_time" placeholder="按时间进行检索" ref="searchTimeInput" readOnly />
		 						<span className="icon-calendar" id="data_time_start"></span>
		 					</div>
		 					<div className="datas_search_filter_box">
		 						<input type="text" id="data_content" placeholder="搜索内容" ref="searchContentInput" onKeyUp={ this.handleKeyUpSearchContent.bind(this) } />
		 						<span className="icon-search" onClick={ this.handleClickSearchContent.bind(this) }></span>
		 					</div>
		 				</div>	
	 				</div>	
	 				<ul id="datas_box_contents">
	 					 <li className="datas_box_content">
			                <div id="delegation_content">
			                  <Table ref="table" dataSource={ this.state.dataSource } handleData={ this.state.handleData } columns={ this.state.columns } selectable={ this.state.selectable } singleSelection={ this.state.singleSelection } dataType={ this.state.dataType } getPersonalData={ this.getPersonalData } selectAll={ this.state.selectAll } />
			                </div>       
	            		</li>
	 				</ul>
 				</div> 
 				 <div className="return" onClick={ this.goBack.bind(this) } style={{ display: this.state.returnVisible }}>
 				 	<span className="icon-arrow_back"></span>
 				 	返回
 				 </div>
 				 <Pagination
		          index={ this.state.pageIndex }
		          pages={ this.state.pages }
		          size={ this.state.pageSize }
		          total={ this.state.total }
		          onChange={ this.handleChange }
		          />
		          <div className="pageTotal">共 { this.state.total } 条记录</div>
 			</div>)
 	}
 }

 Data.epmUIPage = page;
 module.exports = Data;