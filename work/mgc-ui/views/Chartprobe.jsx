import React,{Component} from 'react';
{/*导入依赖的jsx组件*/}
import { Header, PageAlert, Filter, MakeEntity, Select, Ulist, Alert} from '../../build/components/magicube';
const url = '/magicube';
const page = {
	title: '图表探查',
	css: [
		'/css/chartProbe/Chartprobe.css'
	],
	js: [
		'/js/public/watermask.js',
		'/bower_components/d3/d3.min.js',
		//'/js/public/html2canvas.js',
		'/js/public/saveSvgAsPng.js',//新的截图js
    	'/js/chartProbe/Chartprobe-filter.js',
        '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    	'/js/chartProbe/Chartprobe.js',
     	//'/js/topology/topology.js'
	]
};

class Chartprobe extends Component {
	//必须初始化state对象
	constructor(props){
		super(props);
		//this.state = {
		//}
		this.handleGoTopology_ = this.handleGoTopology_.bind(this);
    	this.handleGoGis_ = this.handleGoGis_.bind(this);
	}

	//返回控制台
  	handleGoTopology_() {
  	    // if (localStorage.getItem("topologyType") == "topo") {
  	    //   location.href = '/topology';
  	    // } else {
  	    //   localStorage.setItem("topologyType", "topo")
  	    //   if (!localStorage.topo_url) {
  	    //     location.href = '/topology';
  	    //   } else {
  	    //     location.href = localStorage.topo_url;
  	    //   }
  	    // }
		sessionStorageDataSave();
		localStorage.setItem("topologyType", "topo");
		location.href = '/topology';
  	}

  	handleGoGis_() {
  		sessionStorageDataSave();
	    fetch(EPMUI.context.url + '/object/gis/passport')
	        .then((res) => res.json())
	        .then((data) => {
	            // 验证授权
	            if (data.code && data.code === 407) {
	                // showAlert( "提示", data.message, "#ffc000" );
	                $("#page_alert_title").html('提示').css("color", '#ffc000');
	                $("#page_alert_content").html(data.message);
	                $("#page_alert").show();
	                return;
	            }
	            localStorage.setItem("topologyType", "gis");
	            location.href = '/topology';	
	        });	
	}

	//不会自动绑定函数方法的this对象，需要自行绑定
	//组件生命周期：组件安装前，组件安装后，应该更新组件吗
	//，将要更新组件，更新完了组件，接收prop的改变，组件将要卸载
	render() {
		const magicSide = ["top", "down", "left"];//, "right", "forward", "back"
		return (
			<div>
				<Header bSearch={true} /> {/* 此处是header部分 */}
				<PageAlert />
				<div className="chart_main">
					{/*gis和topo页面按钮*/}
					{/*<div className="go_otherviews">
						<button className="go_topo" onClick={this.handleGoTopology_}>拓扑</button>
						<button className="go_gis" onClick={this.handleGoGis_}>CIS</button>
					</div>*/}
					{/*<div className="go_otherviews">
						<button className="go_topo" id="goTopo">拓扑</button>
				        <button className="go_gis" id="goGis">GIS</button>
					</div>*/}
					<div className="chart_main_page">
						{/*魔方*/}
					    <div className="chart_magic_out">
					    	{/*左手臂线*/}
							<div className="left_line">
								<span className="triangle1"></span>
								<span className="triangle2"></span>
								<span className="line1"></span>
							</div>
							<div className="left_line_mask"></div>
							{/*右手臂线*/}
						    <div className="right_line">
						    	<span className="triangle3"></span>
								<span className="triangle4"></span>
								<span className="line2"></span>
						    </div>
						    <div className="right_line_mask"></div>
						    <div className="magic_shadow_middle"></div>
						    <div className="magic_shadow_bottom">
						    	<span></span>
						    	<span></span>
						    	<span></span>
						    	<span></span>
						    </div>
						    <div className="chart_magic_run">
								<div className="chart_magic" id="chartMagic">
									{magicSide.map(function(item){return <div key={item} className={item}></div>})}
								</div>
							</div>
                        </div>
                        {/*左矩形*/}
						<div className="classify" id="classifyId">
							<div className="box_corner1">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<div className="box_corner2">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<div className="box_corner3">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<div className="box_corner4">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>	
								<span className="side6"></span>
							</div>
							
							<div className="classify_in conrnerStyleDown">
								
							</div>
							<div className='classfiybtnBox'>
							</div>
							{/*<button className="btn_entity icon-entity-white acti" id="classifyEntity"></button>
							<button className="btn_event icon-event" id="classifyEvent"></button>
							<button className="btn_doc icon-document-white" id="classifyDocument"></button>*/}
						</div>
						{/*右矩形*/}
						<div className="dimension_box">
							<div className="box_corner5">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<div className="box_corner2">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<div className="box_corner3">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<div className="box_corner4">
							    <span className="side1"></span>
								<span className="side2"></span>
								<span className="side3"></span>
								<span className="side4"></span>
								<span className="side5"></span>
								<span className="side6"></span>
							</div>
							<h4>维度</h4>
							<div className="dimension_detial">
							</div>
						</div>
						{/* 魔方边上的立体圆圈*/}
                        <div className="threed_circle_one">
                        	<span className="circle_one1"></span>
                        	<span className="circle_one2"></span>
                        	<span className="circle_one3"></span>
                        	<span className="circle_one4"></span>
                        </div>
                        <div className="threed_circle_two">
                        	<span className="circle_one1"></span>
                        	<span className="circle_one2"></span>
                        	<span className="circle_one3"></span>
                        	<span className="circle_one4"></span>
                        </div>
                        <div className="threed_circle_three">
                        	<span className="circle_one5"></span>
                        	<span className="circle_one2"></span>
                        	<span className="circle_one3"></span>
                        	<span className="circle_one4"></span>
                        </div>
						{/*下方轮播图*/}						
						<div className="chart_slideshow">
						    <div className="top_line">
						    </div>
						    <div className="chart_slideshow_window">
						    	<div className="chart_slideshow_list" id = "slideShowList">
						    		{/*
						    	    <div className="schart_out1" id="sChartOut1">
						    	    	<span className="side_one"></span>
						    			<span className="side_two"></span>
						    			<span className="side_three"></span>
						    			<span className="side_four"></span>
						    	    	<div className="schart_one topo_smallchart" id="schartOne">
											<div className="btn_out" id="btn_out_two">
                                			  	<div className="btn_two bone icon-bar-chart-blue" id="bfour"></div>
                                			  	<div className="btn_two btwo icon-pie-chart" id="bfive"></div>
                                			  	<div className="btn_two bthree icon-line-chart" id="bsix"></div>
                                			  	<div className="btn_two icon-fullscreen" id="fulltwo"></div>
                                			</div>
										</div>
						    	    </div>
									*/}
                            	</div>
                            </div>
                            <div className="go_left_out" id="prev">
                            	<span className="go_left"></span>
                            </div>
                            <div className="go_right_out" id="next">
                            	<span className="go_right"></span>
                            </div>	
						</div>
					</div>
				    <div className="tubiao" id="dv4">
                      <div className="btn_out_big">
                        <div className="big icon-quit" id="bigfull"></div>
                        <div className="big icon-bar-chart" id="bigone"></div>
                        <div className="big icon-pie-chart" id="bigtwo"></div>
                        <div className="big icon-line-chart" id="bigthree"></div>
                        <div className="big icon-table" id="bigtable"></div>
                        <div className="big icon-filter" id="bigguolu"></div>
                        <div className="big icon-replay" id="retreat"></div>
                        <div className="big icon-import" id="chart_import"></div>
                        <div className="big icon-export" id="chart_export"></div>
                        <div className="big icon-camera" id="chart_camera"></div>
                      </div>
                      <button className='publish_btn' id='chartPublish'>发布</button>
                      <div className="chart_phone">
                        <h4><span className="icon-camera-blue"></span>截图成功</h4>
                        <img id="save_img_chart"/>
                        <a id="chart_phone_sure" download="save_img">保存</a>
                        <button type="button">取消</button>
                      </div>
                      <div id="draw_out">
                        <div id="draw_box">
                          <div id="draw">
                          </div>
                        </div>
                      </div>
                      <div id="up_down" className="icon-chart-bgu">
                        <p id="up" className="icon-arrow-circle-up-blue">汇聚</p>
                        <p id="down" className="icon-arrow-circle-down-blue">下钻</p>
                      </div>
                      <div className="table">
                        <div className="table_cut">
                        </div>
                        <div className="table_content">
                          <table>
                            <tbody id="topology_table"></tbody>
                          </table>
                        </div>
                      </div>
                      <div className="chart_filter">
                        {/*icon-chart-circle-o*/}
                        <h4><span className="icon-filter-blue"></span>数据过滤</h4>
                        <div className='filter_data_range'>
                        	<div id="filterpresentdata" className="icon-dot-circle"></div>
                            <h6 className="filter_presentdata">当前工作台</h6>
                            <div id="filteralldata" className="icon-hollow-circle"></div>
                            <h6 className="filter_alldata">全部数据</h6>
                        </div>
                        <ul>
                            <li>
                                <h6 className="filter_fenlei">统计范畴</h6>
                                <input type="text" id="filterfenlei"/>
                            </li>
                            <li>
                                <h6 className="filter_type">对象类型</h6>
                                <input type="text" id="filtertype"/>
                                <p className="filter_notice_objname"></p>
                                <div className="fil_type"></div>
                            </li>
                            <li>
                                <h6 className="filter_vidoo">统计项</h6>
                                <input type="text" id="filtervidoo"/>
                                <div className="packout_two"></div>
                            </li>
                            <li>
                                <h6 className="filter_way">统计方法</h6>
                                <input type="text" id="filterway"/>
                                <div className="packout_three"></div>
                            </li>
                            <li>
                                <h6 className="filter_textone">过滤参数</h6>
                                <input type="text" id="filter_contentone"/>
                                <div className="packout_"></div>
                            </li>
                            <li>
                                <h6 className="filter_texttwo">过滤值</h6>
                                <input type="text" id="filter_contenttwo"/>
                                <input type="text" className="filter_numdate_one"/>
                                <div className="filter_numdate_middle">到</div>
                                <input type="text" className="filter_numdate_two"/>
                                <div className="filter_addbtn">添加</div>
                                <div className="filter_notice"></div>
                            </li>
                        </ul>
                        <div className="filter_add_frame_out"><div className="filter_add_frame"></div></div>
                        <div id="filter_start_new">全新统计</div>
                        <div id="filter_start_old">叠加统计</div>
                        <div id="filter_cancel">取消过滤</div>
                        {/*<div className="packout_four"></div>*/}
                        
                      </div>
                      <div className="export_menu">
                        <h4><span className="icon-export-blue"></span>导出图表</h4>
                        <p>请选择文件类型:</p>
                        <p className="export_type icon-dot-circle">excel</p>
                        <p className="export_type icon-hollow-circle">json</p>
                        <p className="export_type icon-hollow-circle">xml</p>
                        <p>文件名称:</p>
                        <input type="text" id="chartexport_filename"/>
                        <div className="export_menu_sure confirmed">确定</div>
                        <div className="export_menu_cancel canceled">取消</div>
                      </div>
                      <div className="import_menu">
                        <h4>导入图表</h4>
                        <p>请选择文件:</p>
                        <input type="file" name="fileField" id="chart_import_file" />
                        <button value="上传" id="chart_import_file_">选择文件</button>
                        <div className="import_menu_sure confirmed">确定</div>
                        <div className="import_menu_cancel canceled">取消</div>
                      </div>
                      <div className='chart_pubilsh'>
                          <h4>图表发布</h4>
                          <p>确定把图表发布至dashboard</p>
                          <button className='chart_publish_ensure'>确定</button>
                          <button className='chart_publish_cancel'>取消</button>
                      </div>
                    </div>
                    <div className="chart_save"></div>
                    <div className="chart_message">
                    	<div className="drag_line"></div>
                    	<div id="topology_message_chart">
              			  <div className="message_chart_title">统计</div>
              			  <div id="message_chart_content">
              			  </div>
              			</div>
                    </div>
                    
                    

				</div>
                
            </div>
			);
	}

}

Chartprobe.epmUIPage = page;
module.exports = Chartprobe;