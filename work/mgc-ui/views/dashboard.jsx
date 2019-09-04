import React, {Component} from 'react'
import { Header, PageAlert, Filter, MakeEntity, Select, Ulist, Alert} from '../../build/components/magicube';
const url = '/magicube';
const page = {
	title: 'dashboard',
	css: [
	    '/css/dashboard/dashboard.css',
	    // '/css/public/jquery.gridly.css'
	    // '/css/public/jquery-ui.css'
	],
	js: [

    '/bower_components/d3/d3.min.js',//这个好像就是d3那个包
	// '/js/public/jquery-ui.js',	
	'/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
	'/js/public/map/map.js',
	'/js/gisPlatform/china-map.js',
	'/js/public/d3map/d3-map.js',
	'/js/dashboard/dashboard.js'
	    // '/js/public/jquery.gridly.js'	
	]
};

class Dashboard extends Component {	
	constructor(props){
		super(props);
		this.state = {
			statDate:'',
			statDay:'',
			statWeek:'',
			statAll:''
		}
	}	

	componentDidMount() {
        fetch(EPMUI.context.url+'/metadata/logNumber')
      .then((response) => response.json() )
      .then((data) => {
		console.log(data)
		this.setState({
				statDate:data.magicube_interface_data.date,
				statDay:data.magicube_interface_data.dayNum,
				statWeek:data.magicube_interface_data.weekNum,
				statAll:data.magicube_interface_data.allNum
			})
      });
    }

	render(){
		const {statDate, statDay, statWeek, statAll} = this.state
		return (
			<div>
			{/*<React.Fragment>*/}
			    <Header />
				<div className='dashboard'>
				    <p className='setting_btn icon-dashboard-set-btn' id='settingBtn'></p>
				    <div className='set_menu' id='setMenu'>
				        <ul>
				           <li id='toggleTemp'>切换模板</li>
				           <li id='delChart'>删除图表</li>
				        </ul>
				    </div>
				    <div className='setting_box'>
				        <h4>设置</h4>
				        <h5>请选择模板类型 :</h5>
				        {/*<p><label><input type='radio' className='icon-dot-circle' name='temp' id='tempA' />模板A</label></p>
				        <p><label><input type='radio' className='icon-hollow-circle' name='temp' id='tempB' />模板B</label></p>
		                <p><label><input type='radio' className='icon-hollow-circle' name='temp' id='tempC' />模板C</label></p>
						<p><label><input type='radio' className='icon-hollow-circle' name='temp' id='tempUser' />自定义模板</label></p>*/}
						<div id='templateList'></div>
						<button id='setTempSure'>确定</button>
				        <button id='setTempCancle'>取消</button>
				    </div>
					<div className='dashboard_template_a'>
						{/*<div className='dashboard_head'>
						    <h3>情报魔方</h3>
						    <span className='head_side_style'></span>
						    <span className='head_side_style'></span>
						    <span className='head_side_style'></span>
						    <span className='head_side_style'></span>	
						</div>*/}	
						<div className='show_board gridly' id='sortable'>
						    <div className='dragele a_chart_a' id='aCharta' data-index='0'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele a_chart_b' id='aChartb' data-index='1'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele a_chart_c' id='aChartc' data-index='2'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele a_chart_d' id='aChartd' data-index='3'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele a_chart_f' id='aChartf' data-index='4'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele a_chart_g' id='aChartg' data-index='5'><div><span className='addChart'>+</span></div></div> 
						    <div className='dragele a_chart_h' id='aCharth' data-index='6'><div><span className='addChart'>+</span></div></div>
						    {/*<span className='tooltip'></span>*/}
					    </div>
					</div>

					<div className='dashboard_template_b'>
						<div className='show_board_b gridly'>
						    <div className='dragele b_chart_a' id='bCharta' data-index='0'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele b_chart_b' id='bChartb' data-index='1'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele b_chart_c' id='bChartc' data-index='2'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele b_chart_d' id='bChartd' data-index='3'><div><span className='addChart'>+</span></div></div>
						    <div className='dragele b_chart_e' id='bCharte' data-index='4'><div><span className='addChart'>+</span></div></div>
						    {/*<div className='b_chart_f brick' id='bChartf' ><span className='addChart'>+</span></div>*/}
						    <div className='dragele b_chart_g' id='bChartg' data-index='5'><div><span className='addChart'>+</span></div></div> 
						    <div className='dragele b_chart_h' id='bCharth' data-index='6'><div><span className='addChart'>+</span></div></div>						    
					    </div>
					</div>

                    <div className='dashboard_template_c'>
						<div className='show_board_c gridly'>
						    <div className='c_gis_title'>
							    <div className="klam">
                                  <p>DASHBOARD GIS</p>
                                </div>							
							    <div className="noor one"></div>
                                <div className="noor two"></div>
							</div>
						    <div className='c_gis' id='cGis'><div></div></div>
						    <div className='amplification c_chart_a' id='cCharta' data-index='0'><div><span className='addChart'>+</span></div></div>
						    <div className='amplification c_chart_b' id='cChartb' data-index='1'><div><span className='addChart'>+</span></div></div>
						    <div className='amplification c_chart_c' id='cChartc' data-index='2'><div><span className='addChart'>+</span></div></div>
						    <div className='amplification c_chart_d' id='cChartd' data-index='3'><div><span className='addChart'>+</span></div></div>
						    <div className='amplification c_chart_f' id='cChartf' data-index='4'><div><span className='addChart'>+</span></div></div>						    
						    <div className='amplification c_chart_e' id='cCharte' data-index='5'><div><span className='addChart'>+</span></div></div>
							<div className='c_textbox' id='cTextBox'>
							    <p><span className='c_stat_name'>日&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;期</span><span className='c_stat_result'>{statDate}</span></p>
							    <p><span className='c_stat_name'>今日搜索量</span><span className='c_stat_result'>{statDay}</span></p>
							    <p><span className='c_stat_name'>本周搜索量</span><span className='c_stat_result'>{statWeek}</span></p>
							    <p><span className='c_stat_name'>累计搜索量</span><span className='c_stat_result'>{statAll}</span></p>
							</div> 
						    {/*<span className='tooltip'></span>*/}
					    </div>
					</div>

                    <div className='dashboard_template_d'>
					        <p id='ToolBoxPrompt'></p>
					        <div className='dashboard_menu '>
							    <div className='tool_list'>							        
							        <button id='addTier' className='icon-line-color-blue'></button>
								    <button id='addCell' className='icon-th-large-blue'></button>
								    {/*<button id='editTBtn'>b层</button>
								    <button id='editCBtn'>b块</button>*/}
									<button id='saveEdit' className='icon-save1'></button>
									<button className='icon-toolbox' id='db_tool'></button>
								</div>
							</div>
							<div className='save_template' id='saveTemplate'>
								<h4>保存自定义模板</h4>
								<label><span>自定义模板名称：</span><input type='text' id='customTemplateName'/><span id='tempNameWarn'>名称已存在</span></label>
								{/*<button id='saveTempUpdate'>更新</button>*/}
								<button id='saveTempNew'>新建</button>
								<button id='saveTempCancel'>取消</button>
							</div>
							<div className='edit_tier' id='editTier'>
						        <h4>编辑</h4>
								<ul>
									<li><label><span>高度：</span><input type='text' id='tierHeigth'/><span>%</span></label></li>
								</ul>
								<button className='edit_tier_sure' id='editTierSure'>确定</button>
								<button className='edit_tier_cancel' id='editTierCancel'>取消</button>
							</div>
							<div className='edit_cell' id='editCell'>
							    <h4>编辑</h4>
								<ul>	
									<li><label><span>高度：</span><input type='text' /><span>%</span></label></li>
									<li><label><span>宽度：</span><input type='text' /><span>%</span></label></li>
									<li><label><span>上边距：</span><input type='text' /><span>%</span></label></li>
									<li><label><span>左边距：</span><input type='text' /><span>%</span></label></li>
								</ul>	
								<button className='edit_cell_sure' id='editCellSure'>确定</button>
								<button className='edit_cell_cancel' id='editCellCancel'>取消</button>
							</div>
							<div className='move_alert' id='moveAlert'>
							    <p id='move'>交  换</p>
								<p id='merge'>合  并</p>
							</div>
						<div className='show_board_d gridly'>			    
						    <div className='d_0_0 cell' id='d0Chart0' data-index-tier='0' data-index-cell='0' data-style='{"top":2.5,"left":2.5,"width":30,"height":30,"index":"0", "id":"0Chart0","class":"d_0_0 cell","dataIndexCell":"0","dataIndexTier":"0"}' data-index='0'><div><span className='addChart'>+</span></div></div>
							<span className='add_cell_btn addc_0' data-index='0'>+</span>					    
					    </div>
					</div>

					<span className='tooltip'></span>
					<div className='messageTip'></div>
					<div className='dashboard_shade'>					    
					    <div className='magnify' id='cMagnify'>
						    <div></div>
                            {/*<button className='icon-delete-blue' id='magnifyDel'></button>*/}
                            <span className='icon-delete-blue' id='magnifyDel'></span>
					    </div>
					</div>
				</div>			    	
		    {/*</React.Fragment>*/}
		    </div>
		)
	}
}

Dashboard.epmUIPage = page;
module.exports = Dashboard;