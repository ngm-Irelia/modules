import React, { Component } from 'react';
import {
  Header, Select, Alert, RegisterGroup, RegisterUser, ModifyPassword, ModifyPersonal, AuthorityManage,WhiteListManageOut
} from '../../build/components/magicube';

const url = '/magicube';

const page = {
  title: '管理中心',
  css: [
    '/css/option/option.css'  
  ],
  js: [
    '/js/public/watermask.js',
    '/js/public/DateUtils.js',    
    '/js/public/laydate/laydate.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/option/option.js'
  ]
};

class Option extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      addGroupNameError: false,
      detailPhoneError: false,
      detailEmailError: false,
      alertShow: false,
      alertTitle: "",
      alertContent: "",
      alertColor: {}
    };

    this.handleCloseAlert = this.handleCloseAlert.bind( this );
    this.handleSubmitAddUser = this.handleSubmitAddUser.bind( this );
    this.handleSubmitAddGroup = this.handleSubmitAddGroup.bind( this );
    this.handleAuthorityManage = this.handleAuthorityManage.bind( this );
  }

  componentDidMount(){
    window.onload = function(){
      let systemTime = {
        elem: '#system_time',
        range: '~'
      };
      let optionTime = {
        elem: '#option_time',
        range: '~'
      };
      let wlmTime = {
        elem: '#wlmTimeSet',
        range: '~'
      };
      laydate.render(optionTime);
      laydate.render(systemTime);
      laydate.render(wlmTime);
    }
    
  }

  handleCloseAlert( show ) {
    this.setState( {
      alertShow: false
    } )
  }

  handleAuthorityManage( status, title, message ) {
      this.registerMessage( status, title, message );
  }

  handleSubmitAddUser( status, title, message ) {
    this.registerMessage( status, title, message );
  }

  handleSubmitAddGroup( status, title, message ) {
    this.registerMessage( status, title, message );
  }

  handleModifyPassword( status, title, message ) {
    this.registerMessage( status, title, message );
  }

  handleModifyDetail( status, title, message ) {
    this.registerMessage( status, title, message );
  }

  handleAuthorityEnsure(){
    //更改权限
    let updateUser = 'userId='+$(".authority_user_name").attr("sysUserId") +
                     '&roleId='+$("#authority_modify_auto_type").attr("data-type");

    fetch(url + '/updateuserrole',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        credentials: "include",
        body: updateUser
      }
    )
    .then( ( response ) => response.json() )
    .then( ( data ) => {

      $(".authority_modify_box").hide();

      if( data.status === "success" ) {
        this.registerMessage( "succeed", "提示!", data.message );
        refreshDelegation();
      } else {
        this.registerMessage( "fail", "提示!", data.message );
        refreshDelegation();
      }
    } )
  }

  handleAuthorityReset(){
    $(".authority_modify_box").hide();
  }

  registerMessage( status, title, message ) {
    if( status === "fail" ) {
     /* this.setState( {
        alertShow: true,
        alertTitle: title,
        alertContent: message,
        alertColor: { "color": "orangered" }
      } );*/

      $(".component_alert").show();

      $(".component_alert_title").html( title ).addClass("event_pagealert_notice_color_license");
      $(".component_alert_content").html( message );

    } else if( status === "succeed" ) {
      /*this.setState( {
        alertShow: true,
        alertTitle: title,
        alertContent: message,
        alertColor: { "color": "#33c5f4" }
      } );*/

      $(".component_alert").show();

      $(".component_alert_title").html( title ).addClass("event_pagealert_notice_color_default");
      $(".component_alert_content").html( message );

    }
  }

  render() {
    const { alertShow, alertTitle, alertContent, alertColor } = this.state;
    return (
      <div>

        <Header option={ true } />
        <Alert title={ alertTitle } content={ alertContent } show={ false } type="confirm"
               styles={ alertColor } onClick={ this.handleCloseAlert }
        />
        {/*{
          alertShow
            ?
            <Alert title={ alertTitle } content={ alertContent } show={ true } type="confirm"
                   styles={ alertColor } onClick={ this.handleCloseAlert }
            />
            :
            ""
        }*/}

        <div id="options_shade"></div>

        <div id="options_box">
          <ul id="options_box_titles">
            <li className="options_box_title option_title_active">个人信息</li>
            <li className="options_box_title">消息中心</li>
            <li className="options_box_title">权限管理</li>
            <li className="options_box_title">操作日志</li>
            <li className="options_box_title">系统日志</li>
          </ul>
          <ul id="options_box_contents">
            {/*个人中心*/}
            <li className="options_box_content options_content_active">
              <div id="person_detail">
                <h6 className="personal_title">
                  {/*<span id="personal_modify_password">修改密码</span>*/}
                  {/*<span id="personal_modify_detail">修改个人信息</span>*/}
                </h6>
                <div id="options_personal_photo" className="icon-headphoto">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </div>
                <div id="options_personal_detail">
                  <h5 className="personal_title">基本信息</h5>
                  <p><span className="options_personal_detail_title">姓名:</span><span className="options_personal_username"></span></p>
                  <p><span className="options_personal_detail_title">性别:</span><span className="options_personal_usergender"></span></p>
                  <p><span className="options_personal_detail_title">生日:</span><span className="options_personal_userage"></span></p>
                  <p><span className="options_personal_detail_title">手机号:</span><span className="options_personal_userphone"></span></p>
                  <p><span className="options_personal_detail_title">户籍:</span><span className="options_personal_userhouseholdregister"></span></p>
                  <p><span className="options_personal_detail_title">职位:</span><span className="options_personal_userposition"></span></p>
                </div>
                <div id="options_personal_account">
                  <h5 className="personal_title">帐号信息 <span id="option_modify_detail" className="icon-edit-blue"></span></h5>
                  <p><span className="options_personal_detail_title">帐号:</span><span className="options_personal_account"></span></p>
                  <p><span className="options_personal_detail_title">密码:</span><span className="options_personal_password"></span>********** <span id="option_modify_password" className="icon-edit-blue"></span></p>
                  <p><span className="options_personal_detail_title">注册邮箱:</span><span className="options_personal_useremail"></span></p>
                  <p><span className="options_personal_detail_title">所属群组:</span><span className="options_personal_groupname"></span></p>
                  <h5 className="personal_title personal_title_delegation">权限情况</h5>
                  <p><span className="options_personal_detail_title">权限级别:</span><span className="options_personal_rolename"></span></p>
                </div>

              </div>

              <ModifyPassword onSubmit={ this.handleModifyPassword.bind( this ) }/>

              <ModifyPersonal onSubmit={ this.handleModifyDetail.bind( this ) }/>

            </li>
            {/*消息*/}
            <li className="options_box_content">
              <div id="options_message_tab">
                <span className="options_message_push options_message_push_active">我收到的消息</span>
                <span className="options_message_push">我推送的消息</span>
              </div>
              <div className="new_messages options_content_active">
                {/*<h5 className="options_message_title">我收到的消息</h5>*/}
                <div className="options_message_box">
                  <div id="options_message_push_mine"></div>
                </div>

              </div>
              <div className="new_messages">
                {/*<h5 className="options_message_title">我推送的消息</h5>*/}
                <div className="options_message_box">
                  <div id="options_message_mine_push"></div>
                </div>
              </div>
            </li>
            {/*权限管理*/}
            <li className="options_box_content">
              <button type="button" className="delegation_tab_btn delegation_tab_active">用户权限修改</button>
              <button type="button" className="delegation_tab_btn">用户组权限修改</button>
              <button type="button" className="delegation_tab_btn">添加用户</button>
              <button type="button" className="delegation_tab_btn">添加用户组</button>
              <button type="button" className="delegation_tab_btn">权限管理</button>
              <button type="button" className="delegation_tab_btn">白名单管理</button>
              <div className="delegation_content_box" style={ { "display": "block" } }>
                <div id="delegation_modify_option">
                  <div className="delegation_modify_option_list">
                    <span className="delegation_modify_option_title">修改用户组：</span>
                    <Select
                      dataSource={`${ url }/grouplist`}
                      parentId="delegation_modify_group_select"
                      selectId="delegation_modify_group_type"
                      hasAll={ true }
                      selectProperty="null"
                      showInput="false"
                      selectValue=""
                      selectTitle="请选择用户组..."
                    />
                  </div>
                  <div className="delegation_modify_option_list">
                    <span className="delegation_modify_option_title">修改角色：</span>
                    <Select
                      dataSource={ `${ url }/rolelist` }
                      parentId="delegation_modify_role_select"
                      selectId="delegation_modify_role_type"
                      hasAll={ true }
                      selectProperty="null"
                      showInput="false"
                      selectValue=""
                      selectTitle="请选择角色..."
                    />
                  </div>
                  <div className="delegation_modify_option_list">
                    <input type="text" id="delegation_modify_option_select_input" placeholder="请输入身份证号.."/>
                    <span className="delegation_modify_option_idcard_search">用户搜索</span>
                  </div>
                  <div className="delegation_modify_option_list">
                    <button type="button" id="delegation_modify_option_ensure">修改</button>
                    <button type="button" id="delegation_modify_option_delete">删除</button>
                  </div>
                </div>
                <div id="delegation_content">
                  <table id="delegation_detail_head">
                    <tbody>
                    <tr>
                      <td>
                        <input type="checkbox" id="delegation_check_all" className="icon-square-o-blue"/>
                        ID
                      </td>
                      <td>用户帐号</td>
                      <td>证件号码</td>
                      <td>联系方式</td>
                      <td>用户组</td>
                      <td>角色</td>
                      <td>用户来源</td>
                    </tr>
                    </tbody>
                  </table>
                  <div id="delegation_detail_lists">
                    <table id="delegation_detail_body">
                      <tbody></tbody>
                    </table>
                  </div>
                  {/*<div id="delegation_detail_pagination"></div>*/}
                  <div id="delegation_detail_pagination_box">
                    <div id="delegation_detail_pagination"></div>
                    <div className="pagination_page_box">
                      <span className="pagination_page_tip">每页显示</span>
                      <input type="text" id="delegation_detail_pagination_num" defaultValue={ 20 }/>
                      <span className="pagination_page_tip">条</span>
                      <button id="delegation_detail_pagination_ensure">确定</button>
                    </div>
                  </div>
                </div>
                <div className="authority_modify_box">
                  <div className="personal_option_detail">
                    <h6 className="modify_title">修改角色类型</h6>
                    <div className="personal_option_box">
                      <div className="authority_user_show">
                        <div className="authority_user_title">用户账号:</div><div className="authority_user_name"></div>
                      </div>
                      <div className="authority_user_show">
                        <div className="authority_user_title">角色类型:</div>
                        <div className="authority_auto_name">
                          <div className="authority_select_auto_name">
                            <Select
                                dataSource={ `${ url }/rolelist` }
                                parentId="authority_modify_auto_select"
                                selectId="authority_modify_auto_type"
                                hasAll={ true }
                                selectProperty="null"
                                showInput="false"
                                selectValue=""
                                selectTitle="请选择角色类型..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="authority_component_button_box">
                        <button className="component_ensure" id="authority_modify_ensure" onClick={ this.handleAuthorityEnsure.bind(this) }>确认</button>
                        <button className="component_reset" id="authority_modify_reset" onClick={ this.handleAuthorityReset.bind(this) }>取消</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="delegation_content_box">
                <div id="delegation_modify_group">
                  <table>
                    <thead>
                    <tr>
                      <td>用户组名称</td>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                  </table>
                </div>
              </div>
              <div className="delegation_content_box">
                <RegisterUser onSubmit={ this.handleSubmitAddUser }/>
              </div>
              <div className="delegation_content_box">
                <RegisterGroup onSubmit={ this.handleSubmitAddGroup }/>
              </div>
              <div className="delegation_content_box">
                <AuthorityManage
                    dataSource={ `${ url }/rolelist` }
                    parentId="delegation_modify_auto_select"
                    selectId="delegation_modify_auto_type"
                    hasAll={ true }
                    selectProperty="null"
                    selectValue="请选择..."
                    onSubmit={ this.handleAuthorityManage }
                />
              </div>
              <div className="delegation_content_box">
                <WhiteListManageOut />
              </div>
              <div className="authority_modify_box_result">
                <div id="authority_modify_box_result_value"></div>
              </div>
            </li>
            {/*操作日志*/}
            <li className="options_box_content">
              <div id="option_log">
                <div id="option_log_filter">
                  <ul>
                    <li className="system_filter_list">
                      <span className="system_filter_title">用户名</span>
                      <input type="text" id="option_filter_username"/>
                    </li>
                    <li className="system_filter_list">
                      <span className="system_filter_title">操作类型</span>
                      <Select
                        dataSource={ `${ url }/log/useroperate/operatetype` }
                        parentId="option_filter_type_lists"
                        selectId="option_filter_user"
                        hasAll={ false }
                        selectProperty="ALL"
                        showInput="false"
                        selectValue=""
                        selectTitle="请选择操作类型..."
                      />
                    </li>
                    <li className="system_filter_list">
                      <span className="system_filter_title">IP地址</span>
                      <input type="text" id="option_filter_ip"/>
                    </li>
                    <li className="system_filter_list">
                      <span className="system_filter_title">操作时间</span>
                      <div className="clandar_box">
                        <input type="text" id="option_time" placeholder="请选择时间范围" readOnly />
                        <button type="button" id="option_time_start" className="icon-calendar-cute"></button>
                      </div>
                    </li>
                    <li className="system_filter_list">
                      <button id="option_filter_ensure">搜索</button>
                    </li>
                  </ul>
                </div>
                <div id="options_option_box">
                  <table id="option_content_head">
                    <tbody>
                    <tr>
                      <td>用户名</td>
                      {/*<td>对象ID</td>*/}
                      <td>IP地址</td>
                      <td>操作时间</td>
                      <td>操作类型</td>
                      <td>操作内容</td>
                    </tr>
                    </tbody>
                  </table>
                  <div id="option_log_lists">
                    <table id="option_content_body">
                      <tbody></tbody>
                    </table>
                  </div>
                  <div id="option_pagination_box">
                    <div id="option_log_pagination"></div>
                    <div className="pagination_page_box">
                      <span className="pagination_page_tip">每页显示</span>
                      <input type="text" id="option_page_num" defaultValue={ 10 }/>
                      <span className="pagination_page_tip">条</span>
                      <button id="option_page_ensure">确定</button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            {/*系统日志*/}
            <li className="options_box_content">
              <div id="system_log">
                <div id="system_log_filter">
                  <ul>
                    <li className="system_filter_list">
                      <span className="system_filter_title">用户名</span>
                      <input type="text" id="system_filter_username"/>
                    </li>
                    <li className="system_filter_list">
                      <span className="system_filter_title">操作类型</span>
                      <Select
                        dataSource={ `${ url }/log/sys/operatetype` }
                        parentId="option_filter_type_lists"
                        selectId="option_filter_sys"
                        hasAll={ false }
                        selectProperty="ALL"
                        showInput="false"
                        selectValue=""
                        selectTitle="请选择操作类型..."
                      />
                    </li>
                    <li className="system_filter_list">
                      <span className="system_filter_title">IP地址</span>
                      <input type="text" id="system_filter_ip"/>
                    </li>
                    <li className="system_filter_list">
                      <span className="system_filter_title">操作时间</span>
                      <div className="clandar_box">
                        <input type="text" id="system_time" placeholder="请选择时间范围" readOnly />
                        <button type="button" id="system_time_start" className="icon-calendar-cute"></button>
                      </div>
                    </li>
                    <li className="system_filter_list">
                      <button id="system_filter_ensure">搜索</button>
                    </li>
                    <li className="system_filter_list">
                      <div className="log-download">
                        <a href="/magicube/down/log" title="日志下载" ><img src="../image/download.svg" /></a>
                      </div>
                    </li>
                  </ul>
                </div>
                <div id="options_system_box">
                  <table id="system_content_head">
                    <tbody>
                    <tr>
                      <td>用户名</td>
                      <td>IP地址</td>
                      <td>操作时间</td>
                      <td>操作类型</td>
                    </tr>
                    </tbody>
                  </table>
                  <div id="system_log_lists">
                    <table id="system_content_body">
                      <tbody></tbody>
                    </table>
                  </div>
                  <div id="system_pagination_box">
                    <div id="system_log_pagination"></div>
                    <div className="pagination_page_box">
                      <span className="pagination_page_tip">每页显示</span>
                      <input type="text" id="system_page_num" defaultValue={ 20 }/>
                      <span className="pagination_page_tip">条</span>
                      <button id="system_page_ensure">确定</button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );

  }
}

Option.epmUIPage = page;

module.exports = Option;