import React, { Component } from 'react';

class Table extends Component {

	constructor (props) {
		super(props);
		this.state = {
			dataSource: props.dataSource,
			handleData: props.handleData,
			columns: props.columns,
			singleSelection: props.singleSelection,
			selectable: props.selectable,
			pushData: [],
			selectAll: props.selectAll || '',
			rowConfigs: [],
			visible: 'none',
			exportVisible: 'none',
			pushVisible: 'none',
			openVisible: 'none',
			deleteVisible: 'none',
			markVisible: 'none',
			groupVisible: 'none',
			groupValue: '请选择',
			userVisible: 'none',
			userValue: '请选择',
			index: 0,
			userList: [],
			dataType: props.dataType
		};
	}

	componentDidMount() {
		this.getRowConfigs();
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			dataSource: nextProps.dataSource,
			handleData: nextProps.handleData,
			columns: nextProps.columns,
			selectable: nextProps.selectable,
			singleSelection: nextProps.singleSelection,
			dataType: nextProps.dataType,
			selectAll: nextProps.selectAll
			}, () => {
				this.getRowConfigs();
			});
	}

	//表格状态管理
	getRowConfigs(){
		const rowConfigs = [];
		const arr = this.state.dataSource;
		arr.map((item, i) =>{
			if(item.mark && item.mark === 1){
				var obj = this.state.handleData;
				obj.sign = "icon-mark-yellow";
			}else if(item.mark && item.mark === 0){
				var obj = this.state.handleData;
				obj.sign = "icon-mark";
			}
			const a = {
				data: item,
				handleData: this.state.handleData,
				selected: '',
				mark: item.mark
			}
			
			rowConfigs.push(a)
			})
		this.setState({ rowConfigs })
		$("#delegation_check_all, .delegation_check").removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
	}
	
	//行 双击事件  数据集双击切换到版本
	DbClick(i, e) {
		e = e || window.event;
		let datasetId;
		if(this.state.dataType == 'dataset'){
			if(typeof i === 'number'){
				datasetId = $("#delegation_detail_head tbody").children("tr").eq(i).attr("data-datasetid");
			}else{
				datasetId = e.currentTarget.getAttribute("data-datasetid");
			}
			
		}else if(this.state.dataType == 'version'){
			datasetId = this.state.datasetId;
		}
		this.setState({
			dataType: 'version',
			selectAll: ''
			}, ()=>{
			this.props.getPersonalData(datasetId, this.state.dataType, 1);
		})	
	}
	
	//全选
	handleCheckedAll(){
		const rowConfigs = this.state.rowConfigs;
		if(this.state.selectAll == 'checked'){
			rowConfigs.map((item, i)=>{		
				item.selected = '';
				$(".datas_all_operate").removeClass("datas_all_operate_show").addClass("datas_all_operate_hide");
				this.setState({
					selectAll: ''
					})
			});
			$("#delegation_check_all").removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
			$(".delegation_check").removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
		}else if(this.state.selectAll == ''){
			this.setState({ selectAll: 'checked' });
			$(".datas_all_operate").removeClass("datas_all_operate_hide").addClass("datas_all_operate_show");
			rowConfigs.map((item, i)=>{	
				item.selected = 'checked';
			});
			$("#delegation_check_all").removeClass("icon-square-o-big-blue").addClass("icon-check-square-o");
			$(".delegation_check").removeClass("icon-square-o-big-blue").addClass("icon-check-square-o");
	
		}
		this.setState({ rowConfigs });	
	}

	//单选
	handleChecked(i){
		const rowConfigs = this.state.rowConfigs;
		let obj = rowConfigs[i];
		var checkedCount = 0;
		if(obj.selected == 'checked'){
			obj.selected = '';
			$(".delegation_check").eq(i).removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
			this.setState({ selectAll : ''});
		}else if(obj.selected == ''){
			obj.selected = 'checked';
			$(".delegation_check").eq(i).removeClass("icon-square-o-big-blue").addClass("icon-check-square-o");
		} 	
		rowConfigs.map((item, i)=>{
			if(item.selected == 'checked'){
				checkedCount ++;
			}
		})
		if(checkedCount > 1){
			$(".datas_all_operate").removeClass("datas_all_operate_hide").addClass("datas_all_operate_show");
			if(checkedCount == rowConfigs.length){
				this.setState({ selectAll : 'checked'});
				$("#delegation_check_all").removeClass("icon-square-o-big-blue").addClass("icon-check-square-o");
			}
		}else{
			$(".datas_all_operate").removeClass("datas_all_operate_show").addClass("datas_all_operate_hide");
			$("#delegation_check_all").removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
		}
		this.setState({ rowConfigs })
		
	}

	//导出、推送、打开、删除、标记：鼠标点击事件
	handleClick(key ,i, e){
		e = e || window.event;
		var dataId = Number(e.currentTarget.parentNode.parentNode.getAttribute("data-dataId")),
			name = e.currentTarget.parentNode.parentNode.getAttribute("data-name"),
			datasetId = e.currentTarget.parentNode.parentNode.getAttribute("data-datasetId"),
			versionId = e.currentTarget.parentNode.parentNode.getAttribute("data-versionId");
			
		this.setState({
			dataId: dataId,
			name: name,
			datasetId: datasetId,
			versionId: versionId
			}, () => {
				this.getRowConfigs();
				switch(key){
					case 'export': 	this.handleExport();
									break;
					case 'send': 	this.handleSend();
									break;
					case 'open': 	this.handleOpen(i);
									break;
					case 'delete': 	this.handleDelete(i);
									break;
					case 'sign':	this.handleSign(i);
									break;
					case 'see':     this.handleSee();
									break;
					defalut: 		break;
				}
		})	
	
	}

	//导出：显示导出弹框
	handleExport() {
		if(this.state.dataType == 'dataset'){
			alert("此功能正在开发中...");
		}else if(this.state.dataType == 'version'){
			this.setState({
				visible: 'block',
				exportVisible: 'block',
				exportValue: 'excel'
			})
		}		
	}
	//导出：选择导出类型
	handleTypeSure(e) {
		e = e || window.event;
		this.setState({
			exportValue: e.target.value,
			typeVisible: 'none'
			})

	}

	//导出：确定导出
	handleExportSure(e) {
		
		downloadFile({ 
			fileName: this.state.name,
			setId: this.state.dataId,
			type: this.state.exportValue
		 });

		this.setState({
			visible: 'none',
			exportVisible: 'none'
			})
		//利用Input发送get请求下载文件
		function downloadFile(obj) {
			var url = EPMUI.context.url + '/file';  
	        $("#downloadform").remove();  
	        var form = $("<form>");//定义一个form表单  
	        form.attr({
	        	"id": "downloadform",
	        	"style": "display:none",
	        	"target": "",
	        	"method": "get",
	        	"action":  url,
	        });   
	        for(var key in obj){
	        	var input = $("<input>");
	        	input.attr({
	        	"type": "hidden",
	        	"name": key,
	        	"value": obj[key]
	        	});
	        	form.append(input);
	        }
	  
	        $("body").append(form);//将表单放置在web中  
  
        	form.submit();//表单提交   
		}  
		
	}

	//推送：显示推送弹框并且获取推送信息
	handleSend() {
		this.setState({ 
			visible: 'block',
			pushVisible: 'block' 
			})
		var url = EPMUI.context.url + '/group/user';
		fetch(url, { credentials: 'include' }).then((response)=>response.json()).then(data=>{
			this.setState({ pushData: data });
		})
	}

	//推送：分组选择框点击事件
	handleClickChooseGroup() {
		this.setState({ groupVisible: 'block' });

	}

	//推送：用户选择框点击事件
	handleClickChooseUser() {
		if(this.state.groupValue == '请选择'){
			return ;
		}
		this.setState({ userVisible: 'block' });

	}

	//推送：选择填入分组
	handleClickInsertGroup(i) {

		this.setState({ 
			groupValue: this.state.pushData[i].groupName,
			groupVisible: 'none',
			index: i
			},() => {
				var obj = this.state.pushData[this.state.index];
				this.setState({ userList: obj.userList })
				});	
		
	}

	//推送：选择填入用户
	handleClickInsertUser(i) {
		this.setState({ 
			userValue: this.state.pushData[this.state.index].userList[i].userName,
			userVisible: 'none' ,
			sendUserId: this.state.pushData[this.state.index].userList[i].userId
			});	
	}

	//推送：点击确认推送消息
	handlePushDataset() {	
		var jsonData = {};
		jsonData.receiverId = this.state.sendUserId;
		jsonData.description = $('#push_input_desc .pid_desc').text();
		if($(".datas_all_operate").width() == 0){
			var url = EPMUI.context.url + '/share/version';	
			jsonData.versionId = this.state.versionId;
	        $.post(url, jsonData, function(data) {
		    }, 'json');
		}else{
			var versionIdArr = [];
			this.state.rowConfigs.map((item, i)=>{	
				if(item.selected == 'checked'){
					versionIdArr.push(item.data.id);
				}
			});
			url = EPMUI.context.url + '/share/version/more';
			jsonData.versionId = versionIdArr;
	        $.ajax({
	        	//当提交的参数是数组时，添加traditional属性，默认为false
	        	traditional: true,
	        	type: 'post',
	        	url: url,
	        	data: jsonData, 
	        	dataType: 'json',
	        	success: function(data) {
				}

	        })
		}
		this.setState({ 
			visible: 'none',
			pushVisible: 'none' 
		});	
	}
	
	//点击弹出框取消事件
	handleClickCancel() {
		this.setState({ 
			visible: 'none',
			pushVisible: 'none',
			exportVisible: 'none',
			deleteVisible: 'none',
			markVisible: 'none'
		});
	}

	//查看
	handleSee() {
        localStorage.setItem("versionId", this.state.versionId);
        localStorage.setItem("topologyType", "topo");
		location.href = '/topology';      
	}

	//删除
	handleDelete(i) {
		this.setState({ 
			visible: 'block',
			deleteVisible: 'block',
			index: i
		 })
	}

	//确认删除
	handleDeleteVersion() {
		this.setState({
			dataType: this.props.dataType
			}, ()=>{
				if(this.state.dataType == 'dataset'){
					var url = EPMUI.context.url + '/dataset/delete?id=' + this.state.datasetId;
					fetch(url, { credentials: 'include' }).then((response)=>response.json()).then(data=>{
						let dataArr = this.state.dataSource;
						dataArr.splice(this.state.index, 1);						
						this.setState({
							visible: 'none',
							deleteVisible: 'none',
							dataSource : dataArr
						}, ()=>{
							this.getRowConfigs();
							let number = Number($(".pageTotal").text().replace(/[^0-9999999999]/ig,"")) - 1;
							$(".pageTotal").text("共"+ number + "条记录");
							if(this.state.dataSource.length == 0){
								$(".slds-button").click();
							}
						})			
					})
				}else if(this.state.dataType == 'version'){
					
					if($(".datas_all_operate").width() == 0){
						var url = EPMUI.context.url + '/version/delete?id=' + this.state.versionId;
						fetch(url, { credentials: 'include' }).then((response)=>response.json()).then(data=>{
							let dataArr = this.state.dataSource;
							dataArr.splice(this.state.index, 1);							
							this.setState({
								visible: 'none',
								deleteVisible: 'none',
								dataSource: dataArr
							}, ()=> {	
								this.getRowConfigs();
								let number = Number($(".pageTotal").text().replace(/[^0-9999999999]/ig,"")) - 1;
								$(".pageTotal").text("共"+ number + "条记录");
								if(this.state.dataSource.length == 0){
									$(".slds-button").click();
								}
							})			
						})
					}else{
						let versionIdArr = [], dataArr= this.state.dataSource;
						this.state.rowConfigs.map((item, i)=>{	
							if(item.selected == 'checked'){
								versionIdArr.push(item.data.id);
								dataArr.splice(i, 1, 0)							
							}
						});
						dataArr = [...new Set(dataArr)].filter(function(item){
							return item !== 0
						})
						url = EPMUI.context.url + '/version/delete/more';
						$.ajax({
							//当提交的参数是数组时，添加traditional属性，默认为false
							traditional: true,
							type: 'get',
							url: url,
							data: { id: versionIdArr }, 
							dataType: 'json',
							success:  (data)=> {
									this.setState({
										visible: 'none',
										deleteVisible: 'none',
										dataSource: dataArr
									}, ()=> {
										this.getRowConfigs();
										let number = Number($(".pageTotal").text().replace(/[^0-9999999999]/ig,"")) - versionIdArr.length;
										$(".pageTotal").text("共"+ number + "条记录");	
										if(this.state.dataSource.length == 0){
											$(".slds-button").click();	
										}
									})  
									}
						});
					}
				}
		})
			
	}

	//标记
	handleSign(i) {
		const rowConfigs = this.state.rowConfigs;	
		let obj = rowConfigs[i];
		if(obj.mark){
			$("#sign_modal>p").text("确定要取消标记么？")
		}else{
			$("#sign_modal>p").text("确定要标记么？")
		}
		this.setState({ 
			visible: 'block',
			markVisible: 'block',
			rowNum: i })		
	}

	//确认或取消标记
	handleMarkVersion() {
		const rowConfigs = this.state.rowConfigs;
		let obj = rowConfigs[this.state.rowNum];
		obj.data.mark = Number(!obj.data.mark);
		var url = EPMUI.context.url + '/version/mark?versionId=' + Number(obj.data.id) + '&mark=' + obj.data.mark;
		fetch(url, { credentials: 'include' }).then((response)=>response.json()).then(data=>{
			this.setState({
				visible: 'none',
				markVisible: 'none' 
			}, ()=>{
				this.getRowConfigs();
				});	
		})
	}

	//打开
	handleOpen(i) {
		this.DbClick(i);
	}

	render(){
		const thead = this.state.columns.map((item, i) => {
			return (
				<td key={ i } className={ "table_" + item.key }>
					{	
                		this.state.selectable && i === 0 
                		?
							<span id="delegation_check_all" className="icon-square-o-big-blue" onClick={ this.handleCheckedAll.bind(this)}></span>
                		:
                		''
                	}
					{ item.title }
				</td>
				)
			});
		const tbody = this.state.rowConfigs.map(( item, i) => {	
			typeof item.mark == 'number' ? 
		    (item.mark==1 ? item.handleData.sign = "icon-mark-yellow" : item.handleData.sign = "icon-mark")
		    :
		    '';
			var handleData = [];
			for(let key in item.handleData){
				 handleData.push(<td key = { key } className={ "table_" + key }>
					<span className={ item.handleData[key] } ref="image" onClick={ this.handleClick.bind(this, key, i)}></span>
				</td>)
			}
			var data = [];
			data.push(<td key="NO" className="table_NO" > 
				{ 
					this.state.singleSelection && this.state.selectable
            		?
            		<span className="delegation_check icon-square-o-big-blue" onClick={ this.handleChecked.bind(this, i)}></span>  
            		:
            		 ''	
				}
				{ i+1 }
			</td>);
				for(let key in item.data){
					if(this.state.dataType == 'dataset'){
						if(key!='id' && key!='userId' && key!='dataId' && key!='dataSetId' && key!='versionId' && key!='mark' && key!='createTime'){
							data.push(<td key={ key } className={ "table_" + key }>{ item.data[key] }</td>)
						}
					}else if(this.state.dataType == 'version'){
						if(key!='id' && key!='userId' && key!='dataId' && key!='dataSetId' && key!='versionId' && key!='mark'){
							key == 'snap' 
							? data.push(<td key={ key } className={ "table_" + key }><img src={ item.data[key] } /></td>) 
							: data.push(<td key={ key } className={ "table_" + key }>{ item.data[key] }</td>)
						}	
					}							
				}	
			
			return (
				<tr key={ i } data-datasetId={ item.data.dataSetId } data-userId={ item.data.userId } data-dataId={ item.data.dataId } data-name={ item.data.name } data-versionId={ item.data.id } onDoubleClick={ this.DbClick.bind(this, i) } >		 
 					{ data }
 					{ handleData }
				</tr>
			)
		})
    	
		
		return(
			<div>
			  <table id="delegation_detail_head">
                <thead>
	                <tr>
	                	{ thead }
	                </tr>
                </thead>
                <tbody>
                	{ tbody }
                </tbody>
              </table>

              <div id="topo_shade" style={{ display: this.state.visible }}>
          		{/* 导出 */}
              	<div className="alert_model" id="export_topoData_modalBoxl" style={{ display: this.state.exportVisible }}>
                    <h4><span className="icon-export-blue"></span>内容导出</h4>
                    <div className="model_box">
                      <p>请预先选择需要导处的数据类型 :</p>
	                  	<div>
	                      	<p>
		                  		<label htmlFor="excel">
		                  			<input type="radio" value="excel" id="excel" name="type" checked={ this.state.exportValue == 'excel'? true : false } onChange={ this.handleTypeSure.bind(this) } /> EXCEL (*xls)	                  			
		                  		</label>
		                  		<span>将文件到导出为EXCEL文件</span>
		                  	</p>
		                  	<p>
		                  		<label htmlFor="xml" >
		                  			<input type="radio" value="xml" id="xml" name="type" checked={ this.state.exportValue == 'xml'? true : false } onChange={ this.handleTypeSure.bind(this) } /> XML文件 (*xml)
		                  		</label>
		                  		<span>将文件到导出为XML文件（可导入）</span>
	                  		</p>
	                  		<p>
		                  		<label htmlFor="json">
		                  			<input type="radio" value="json" id="json" name="type" checked={ this.state.exportValue == 'json'? true : false } onChange={ this.handleTypeSure.bind(this) } /> JSON文件(*txt)
		                  		</label>
		                  		<span>将文件到导出为JSON文件（可导入）</span>
	                  		</p>
	                  	
	              		</div>
                    </div>
                    <div className="button_box">
                      <button className="ok" onClick={ this.handleExportSure.bind(this) }>确定</button>
                      <button className="cancel" onClick={ this.handleClickCancel.bind(this) }>取消</button>
                    </div>
                </div>
            	{/* 推送 */}
              	<div className="alert_model" id="push_modal" style={{ display: this.state.pushVisible }}>
                    <h4><span className="icon-send-blue"></span>内容推送</h4>
                    <div className="push_input_list" id="push_input_group">
                      <span>推送用户组 :</span>
                      <button className="pig_input" onClick={ this.handleClickChooseGroup.bind(this) } ref="group">{ this.state.groupValue }</button>
                      	<div className="pig_select" style={{ display: this.state.groupVisible }}>
                      		{
                      			this.state.pushData.map((item, i) => {
                      				return (<label key={ i } value={ item.groupId } onClick={ this.handleClickInsertGroup.bind(this, i) }>{ item.groupName }</label>);
                      			})
                      			
                      		}                     	
                        </div> 
                    </div>
                    <div className="push_input_list" id="push_input_user">
                      <span>推送用户 :</span>
                      <button className="pig_input" onClick={ this.handleClickChooseUser.bind(this) } ref="user">{ this.state.userValue }</button>
                      	<div className="pig_select" style={{ display: this.state.userVisible }}>
                      		{
                      			
                      			this.state.userList.map((item, i) => {
                      				return (<label key={ i }  onClick={ this.handleClickInsertUser.bind(this, i) }>{ item.userName }</label>);
                      			})
                      		}
                     	</div>                    		
                    </div>
                    <div className="push_input_list" id="push_input_desc">
                      <span>推送描述 :</span>
                      <div className="pid_desc" contentEditable></div>
                    </div>
                    <div className="button_box">
                      <button className="ok" onClick={ this.handlePushDataset.bind(this) }>确定</button>
                      <button className="cancel" onClick={ this.handleClickCancel.bind(this) }>取消</button>
                    </div>
                </div>
            	{/* 删除 */}
                <div className="alert_model" id="delete_modal" style={{ display: this.state.deleteVisible }}>
                	<h4><span className="icon-delete-blue"></span>删除</h4>
                    <p style={{ marginLeft: '25px' }}>确定要删除么？</p>               
                    <div className="button_box">
                      <button className="ok" onClick={ this.handleDeleteVersion.bind(this) }>确定</button>
                      <button className="cancel" onClick={ this.handleClickCancel.bind(this) }>取消</button>
                    </div>
                    
                </div>
            {/* 标记 */}
                <div className="alert_model" id="sign_modal" style={{ display: this.state.markVisible }}>
                	<h4><span className="icon-mark-blue"></span>标记</h4>
                    <p style={{ marginLeft: '25px' }}>确定要标记么？</p>               
                    <div className="button_box">
                      <button className="ok" onClick={ this.handleMarkVersion.bind(this) }>确定</button>
                      <button className="cancel" onClick={ this.handleClickCancel.bind(this) }>取消</button>
                    </div>
                    
                </div>
              </div>	      		
			</div>
			)
	}	
}

export default Table;
export { Table }