import React, { Component } from 'react';
import { Select } from './select';
import { Reg } from '../utilities/reg';

const userError = {
  addUserNameError: false,
  addUserPwdError: false,
  addUserEnsurePwdError: false,
  addUserEmailError: false,
  addUserPhoneError: false,
  addUserGroupError: false,
  addUserRoleError: false
};

const url = '/magicube';

class RegisterUser extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      addUserNameErrorMessage: "用户名不能为空",
      addUserPwdErrorMessage: "用户密码不能为空",
      addUserEnsurePwdErrorMessage: "确认密码不能为空",
      addUserEmailErrorMessage: "邮箱不能为空",
      addUserPhoneErrorMessage: "手机号码不能为空",
      addUserGroupErrorMessage: "请选择用户组",
      addUserRoleErrorMessage: "请选择用户角色",
      addUserName: "",
      addUserPassword: "",
      addUserEnsurePassword: "",
      addUserEmail: "",
      addUserPhone: "",
      addUserGroup: "ALL",
      addUserRole: "ALL",
      groupCount: 0,
      roleCount: 0,
      addUserPersonalNameError: false,
      addUserGenderError: false,
      addUserDateError: false,
      addUserCensusError: false,
      addUserPositionError: false,
      addUserIdCardErrorMessage: "身份证号输入有误",
      addUserIdCardError: false,
      selectOpen : false,
      selectOptionData:[],
      selectValue:"请选择...",
      selectProperty:0
    };

    this.handleChangeName                = this.handleChangeName.bind( this );
    this.handleChangePwd                 = this.handleChangePwd.bind( this );
    this.handleChangeEmail               = this.handleChangeEmail.bind( this );
    this.handleChangePhone               = this.handleChangePhone.bind( this );
    this.handleSubmit                    = this.handleSubmit.bind( this );
    this.handleReset                     = this.handleReset.bind( this );
    this.handleSelectGroup               = this.handleSelectGroup.bind( this );
    this.handleSelectRole                = this.handleSelectRole.bind( this );
    this.handleChangePasswordShow        = this.handleChangePasswordShow.bind( this );
    this.handleChangeEnsurePasswordShow  = this.handleChangeEnsurePasswordShow.bind( this );
    this.handleChangeValue               = this.handleChangeValue.bind( this );

  }

  componentDidMount(){
    laydate.render({
      elem: '#personal_date',
      start: '1990-01-01',
      max: Date.parse(new Date()),
      done: function(value){
        // 日历判空
        if( !value ) {
          this.setState( {
            addUserDateError: true
          } )
        } else {
          this.setState( {
            addUserDateError: false
          } )
        }
      }.bind(this)
    });
  }

  //改变用户名的value值
  handleChangeName( ev ) {
    this.setState( {
      addUserName: ev.target.value
    } );
  }

  //改变密码的value值
  handleChangePwd( ev ) {
    this.setState( {
      addUserPassword: ev.target.value
    } );
  }

  //改变确认密码的value值
  handleChangeEnsurePwd( ev ) {
    this.setState( {
      addUserEnsurePassword: ev.target.value
    } );
  }

  //改变的value值
  handleChangeEmail( ev ) {
    this.setState( {
      addUserEmail: ev.target.value
    } );
  }

  //改变手机号码的value值
  handleChangePhone( ev ) {
    this.setState( {
      addUserPhone: ev.target.value
    } );
  }

  //判断用户名是否为空
  handleAddUserNameBlur() {
    const value = this.state.addUserName;
    if( !value.trim() ) {
      userError.addUserNameError = true;
      this.setState( {
        addUserNameErrorMessage: "用户名不能为空"
      } );
      return false;
    }

    const data = `account=${ value }`;

    this.checkName( url + '/checkusername', data );
  }

  //判断用户密码是否为空
  handleAddUserPwdBlur() {
    const value = this.state.addUserPassword;
    if( !( value ).trim() ) {
      userError.addUserPwdError = true;
      this.setState( {
        addUserPwdErrorMessage: "用户密码不能为空"
      } );
    } else {
      userError.addUserPwdError = false;
      this.setState( {
        addUserPwdError: ""
      } );
    }

  }

  //判断确认密码是否为空
  handleAddUserEnsurePwdBlur() {
    const { addUserPassword, addUserEnsurePassword, addUserEnsurePwdErrorMessage } = this.state;

    if( !addUserEnsurePassword.trim() ) {
      userError.addUserEnsurePwdError = true;
      this.setState( {
        addUserEnsurePwdErrorMessage: "请填写确认密码"
      } );
      return false;
    }


    if( addUserPassword !== addUserEnsurePassword ) {
      userError.addUserEnsurePwdError = true;
      this.setState( {
        addUserEnsurePwdErrorMessage: "两次输入的密码不同"
      } )
    } else {
      userError.addUserEnsurePwdError = false;
      this.setState( {
        addUserEnsurePwdErrorMessage: ""
      } );
    }
  }

  //判断邮箱是否为空
  handleAddUserEmailBlur() {
    const value = this.state.addUserEmail;
    const reg = Reg.email;
    const result = reg.test( value );

    if( !result ) {
      userError.addUserEmailError = true;
      this.setState( {
        addUserEmailErrorMessage: "邮箱格式有误"
      } );
    } else {
      userError.addUserEmailError = false;
      this.setState( {
        addUserEmailErrorMessage: ""
      } );
    }
  }

  //判断电话是否为空
  handleAddUserPhoneBlur() {
    const value = this.state.addUserPhone;
    const reg = Reg.phone;
    const result = reg.test(value);

    if( !result ) {
      userError.addUserPhoneError = true;
      this.setState( {
        addUserPhoneErrorMessage: "手机号码有误"
      } );
    } else {
      userError.addUserPhoneError = false;
      this.setState( {
        addUserPhoneErrorMessage: ""
      } );
    }
  }

  //切换密码的明文和密文
  handleChangePasswordShow( ev ) {
    this.changeType( ev, this.password );
  }

  //切换确认密码的明文和密文
  handleChangeEnsurePasswordShow( ev ) {
    this.changeType( ev, this.ensurePassword );
  }

  //判断姓名是否为空
  handlePersonalBlur(ev) {
  if( !ev.target.value.trim() ) {
    this.setState( {
      addUserPersonalNameError: true
    } )
  } else {
    this.setState( {
      addUserPersonalNameError: false
    } )
  }
}

  //判断性别是否为空
  handleGenderBlur(ev) {
    if( !ev.target.value.trim() ) {
      this.setState( {
        addUserGenderError: true
      } )
    } else {
      this.setState( {
        addUserGenderError: false
      } )
    }
  }

  //判断性别是否为空
  handleCensusBlur(ev) {
    if( !ev.target.value.trim() ) {
      this.setState( {
        addUserCensusError: true
      } )
    } else {
      this.setState( {
        addUserCensusError: false
      } )
    }
  }

  //判断身份证号是否为空
  handleIdCardBlur(ev){
    if(!ev.target.value.trim()){
      this.setState({
        addUserIdCardError: true,
        addUserIdCardErrorMessage: "身份证号不能为空"
      })
    }else{
      let pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; 
      if( pattern.test(ev.target.value.trim()) ){
        this.setState({
          addUserIdCardError: false
        })
      }else{
        this.setState({
          addUserIdCardError: true,
          addUserIdCardErrorMessage: "身份证号输入有误"
        })
      }
    }
  }

  //判断职位是否为空
  handlePositionBlur(ev) {
    if( !ev.target.value.trim() ) {
      this.setState( {
        addUserPositionError: true
      } )
    } else {
      this.setState( {
        addUserPositionError: false
      } )
    }
  }

  /* 改变密码框的type类型 */
  changeType( ev, target ) {
    if( ev.target.getAttribute( "data-flag" ) === "false" ) {
      target.type = "text";
      ev.target.setAttribute( "data-flag", "true" );
      var regClassName1 = new RegExp('(\\s|^)' + 'register_addUser_show icon-eye-slash' + '(\\s|$)');  
      ev.target.className = ev.target.className.replace(regClassName1, 'register_addUser_show icon-eye');
      {/*ev.target.style.background = "url('../image/component/component_hide.svg') no-repeat 1px 3px/16px 14px";*/}
    } else {
      target.type = "password";
      ev.target.setAttribute( "data-flag", "false" );
      {/*ev.target.style.background = "url('../image/component/component_display.svg') no-repeat 0 5px/16px 14px";*/}
      var regClassName2 = new RegExp('(\\s|^)' + 'register_addUser_show icon-eye' + '(\\s|$)');  
      ev.target.className = ev.target.className.replace(regClassName2, 'register_addUser_show icon-eye-slash');
    }
  }

  //选择用户组
  handleSelectGroup( obj ) {
    if( obj.systemName === "null" ) {
      userError.addUserGroupError = true;
      this.setState( {
        addUserGroupErrorMessage: "请选择正确的用户组"
      } );
      return false;
    }

    userError.addUserGroupError = false;
    this.setState( {
      addUserGroup: obj.systemName
    } )
  }

  //选择角色
  handleSelectRole( obj ) {
    if( obj.systemName === "null" ) {
      userError.addUserRoleError = true;
      this.setState( {
        addUserRoleErrorMessage: "请选择正确的用户组"
      } );
      return false;
    }

    userError.addUserRoleError = false;
    this.setState( {
      addUserRole: obj.systemName
    } )
  }

  //提交创建数据
  handleSubmit() {
    const { addUserName, addUserPassword, addUserEmail, addUserPhone, addUserGroup, addUserRole } = this.state;

    const submitResult = this.checkData();

    if( !submitResult ) {
      return false;
    }
    /* fetch数据交互body体用formData的格式 */
    const data = 'account=' + addUserName
      + '&passwd=' + addUserPassword
      + '&email=' + addUserEmail
      + '&phoneNumber=' + addUserPhone
      + '&groupId=' + addUserGroup
      + '&roleId=' + addUserRole
      + '&userName=' + this.personalName.value
      + '&birthday=' + this.date.value
      + '&gender=' + this.gender.value
      +'&householdRegister=' + this.census.value
      +'&position=' + this.position.value
      +'&idCard=' + this.idCard.value;
    fetch(url + '/adduser',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        credentials: "include",
        body: data
      }
    )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        if( data.status === "success" ) {
          this.props.onSubmit( "succeed", "提示!", data.message );
          this.resetValue();
        } else {
          this.props.onSubmit( "fail", "提示!", data.message );
        }
      } )
  }

  //重置数据事件
  handleReset() {
    this.resetValue();
  }

  handleChangeValue() {
    fetch( url+'/grouplist' )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        this.setState( {
          selectOptionData: data,
          selectOpen: true,
          selectValue: data[0].displayName,
          selectProperty: data[0].systemName
        } );
      } );

  }

  handleSelectProperty(index, obj ) {
    this.setState( {
      selectOpen: false,
      selectProperty: obj.systemName,
      selectValue: obj.displayName
    } );

    if( obj.systemName === "null" ) {
      userError.addUserGroupError = true;
      this.setState( {
        addUserGroupErrorMessage: "请选择正确的用户组"
      } );
      return false;
    }

    userError.addUserGroupError = false;
    this.setState( {
      addUserGroup: obj.systemName
    } )


  }

  /* 重置数据 */
  resetValue() {
    this.setState( {
      addUserNameError: false,
      addUserPwdError: false,
      addUserEmailError: false,
      addUserPhoneError: false,
      addUserPersonalNameError: false,
      addUserGenderError: false,
      addUserDateError: false,
      addUserCensusError: false,
      addUserPositionError: false,
      addUserIdCardError: false,
      addUserName: "",
      addUserPassword: "",
      addUserEmail: "",
      addUserPhone: "",
      addUserGroup: "ALL",
      addUserRole: "ALL",
      groupCount: this.state.groupCount + 1,
      roleCount: this.state.roleCount + 1,
      addUserEnsurePassword: "",
      selectValue:"请选择..."
    } );
    this.idCard.value = "";
    this.position.value = "";
    this.personalName.value = "";
    this.gender.value = "";
    this.date.value = "";
    this.census.value = "";
  }

  /* 向后台发送请求判断用户名是否已存在 */
  checkName( url, data ) {
    fetch(
      url,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: "POST",
        credentials: "include",
        body: data
      }
    )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        if( data.status !== "success" ) {
          userError.addUserNameError = true;
          this.setState( {
            addUserNameErrorMessage: data.message
          } );
        } else {
          userError.addUserNameError = false;
          this.setState( {
            addUserNameErrorMessage: ""
          } );
        }
      } );
  }

  /* 进行全部数据的校验 */
  checkData() {
    const {
      addUserNameErrorMessage, addUserPwdErrorMessage, addUserEnsurePwdErrorMessage, addUserEmailErrorMessage, addUserPhoneErrorMessage, addUserGroupErrorMessage, addUserRoleErrorMessage,
      addUserName, addUserPassword, addUserEnsurePassword, addUserEmail, addUserPhone, addUserGroup, addUserRole,
      groupCount, selectOpen
    } = this.state;
    //判断用户名是否为空
    if( !addUserName.trim() ) {
      userError.addUserNameError = true;
      this.setState( {
        addUserNameErrorMessage: "用户名不能为空"
      } );
      return false;
    }
    //判断密码是否为空
    if( !addUserPassword.trim() ) {
      userError.addUserPwdError = true;
      this.setState( {
        addUserPwdErrorMessage: "用户密码不能为空"
      } );
      return false;
    }
    //判断密码是否一致
    if( !addUserEnsurePassword.trim() ) {
      userError.addUserEnsurePwdError = true;
      this.setState( {
        addUserEnsurePwdErrorMessage: "确认密码不能为空"
      } );
      return false;
    }
    //判断邮箱是否为空
    if( !addUserEmail.trim() ) {
      userError.addUserEmailError = true;
      this.setState( {
        addUserEmailErrorMessage: "邮箱不能为空"
      } );
      return false;
    }
    //判断手机号是否为空
    if( !addUserPhone.trim() ) {
      userError.addUserPhoneError = true;
      this.setState( {
        addUserPhoneErrorMessage: "手机号码不能为空"
      } );
      return false;
    }
    //判断用户组是否没选
    if( addUserGroup === "ALL" ) {
      userError.addUserGroupError = true;
      this.setState( {
        addUserGroupErrorMessage: "请选择用户组"
      } );
      return false;
    }
    //判断角色是否没选
    if( addUserRole === "ALL" ) {
      userError.addUserRoleError = true;
      this.setState( {
        addUserRoleErrorMessage: "请选择用户角色"
      } );
      return false;
    }
    //判断姓名是否为空
    if( !this.personalName.value.trim() ) {
      this.setState( {
        addUserPersonalNameError: true
      } );
      return false;
    }
    //判断性别是否有误
    if( !this.gender.value.trim() || this.gender.value.trim() !== "男" && this.gender.value.trim() !== "女" ) {
      this.setState( {
        addUserGenderError: true
      } );
      return false;
    }
    //判断生日是否有误
    if( !this.date.value.trim() ) {
      this.setState( {
        addUserDateError: true
      } );
      return false;
    }
    //判断户籍是否为空
    if( !this.census.value.trim() ) {
      this.setState( {
        addUserCensusError: true
      } );
      return false;
    }
    //判断职位是否为空
    if( !this.position.value.trim() ) {
      this.setState( {
        addUserPositionError: true
      } );
      return false;
    }
    //判断身份证号是否为空
    if( !this.idCard.value.trim() ){
      this.setState( {
        addUserIdCardError: true
      } );
      return false;
    }
    return true;
  }

  render() {
    const {
      addUserNameErrorMessage, addUserPwdErrorMessage, addUserEnsurePwdErrorMessage, addUserEmailErrorMessage, addUserPhoneErrorMessage,addUserGroupErrorMessage, addUserRoleErrorMessage,
      addUserName, addUserPassword, addUserEnsurePassword, addUserEmail, addUserPhone,
      groupCount, roleCount, addUserIdCard, addUserIdCardErrorMessage, addUserIdCardError,
      selectOpen, selectProperty, selectOptionData, selectValue
    } = this.state;

    const {
      addUserNameError, addUserPwdError, addUserEmailError, addUserPhoneError, addUserEnsurePwdError, addUserGroupError, addUserRoleError      
    } = userError;

    return (
      <div className="register">
        <div className="register_lists_box">
          <ul className="register_detail_box">
            <li>
              <span className="register_detail_title">用户名:</span>
              <input className="register_detail_value" onBlur={ this.handleAddUserNameBlur.bind( this ) }
                     type="text" placeholder="请输入用户名..." value={ addUserName }
                     onChange={ this.handleChangeName } ref={ ( input ) => this.name = input }
              />
              {
                addUserNameError
                  ?
                  <p className="register_error">* { addUserNameErrorMessage }</p>
                  :
                  ""
              }
            </li>
            <li>
              <span  className="register_detail_title">密码:</span>
              <input className="register_detail_value" onBlur={ this.handleAddUserPwdBlur.bind( this ) }
                     type="password" placeholder="请输入用户密码..." ref={ ( input ) => this.password = input }
                     value={ addUserPassword } onChange={ this.handleChangePwd } />
              <span data-flag={ false } className="register_addUser_show icon-eye-slash" onClick={ this.handleChangePasswordShow }></span>
              {
                addUserPwdError
                  ?
                  <p className="register_error">* { addUserPwdErrorMessage }</p>
                  :
                  ""
              }
            </li>
            <li>
              <span  className="register_detail_title">确认密码:</span>
              <input className="register_detail_value" onBlur={ this.handleAddUserEnsurePwdBlur.bind( this ) }
                     type="password" placeholder="请再次输入用户密码..." ref={ ( input ) => this.ensurePassword = input }
                     value={ addUserEnsurePassword } onChange={ this.handleChangeEnsurePwd.bind( this ) } />
              <span data-flag={ false } className="register_addUser_show icon-eye-slash" onClick={ this.handleChangeEnsurePasswordShow.bind( this ) }></span>
              {
                addUserEnsurePwdError
                  ?
                  <p className="register_error">* { addUserEnsurePwdErrorMessage }</p>
                  :
                  ""
              }
            </li>
            <li>
              <span  className="register_detail_title">邮箱:</span>
              <input className="register_detail_value" onBlur={ this.handleAddUserEmailBlur.bind( this ) }
                     type="text" placeholder="请输入邮箱..." value={ addUserEmail }
                     onChange={ this.handleChangeEmail } ref={ ( input ) => this.email = input }
              />
              {
                addUserEmailError
                  ?
                  <p className="register_error">* { addUserEmailErrorMessage }</p>
                  :
                  ""
              }
            </li>
            <li>
              <span className="register_detail_title">手机号码:</span>
              <input className="register_detail_value" onBlur={ this.handleAddUserPhoneBlur.bind( this ) }
                     type="text" placeholder="请输入手机号码..." value={ addUserPhone }
                     onChange={ this.handleChangePhone } ref={ ( input ) => this.phone = input }
              />
              {
                addUserPhoneError
                  ?
                  <p className="register_error">*  { addUserPhoneErrorMessage }</p>
                  :
                  ""
              }
            </li>
            <li>
              <span className="register_detail_title">用户组:</span>
              <div style={ { "display": "inline-block" } }>
                <h6 id="delegation_add_group_type" data-type={ selectProperty } onClick={ this.handleChangeValue }>{ selectValue }</h6>
                {
                  selectOpen
                    ?
                    <div id="delegation_add_group_select" >
                      {
                        selectOptionData.map( ( item, index ) => {
                          return(
                            <p key={ index } className="select_type_list" onClick={ this.handleSelectProperty.bind( this, index, item ) }>{ item.displayName }</p>
                          )
                        } )
                      }
                    </div>
                    :
                    ""
                }
              </div>


              {/*<Select
                dataSource={ `${url}/grouplist` }
                parentId="delegation_add_group_select"
                selectId="delegation_add_group_type"
                hasAll={ true }
                selectProperty="null"
                selectValue="请选择..."
                onHandleSelect={ this.handleSelectGroup }
                count={ groupCount }
              />*/}
              {
                addUserGroupError
                  ?
                  <p className="register_error">* { addUserGroupErrorMessage }</p>
                  :
                  ""
              }
            </li>
            <li>
              <span className="register_detail_title">角色:</span>
              <Select
                dataSource={`${url}/rolelist`}
                parentId="delegation_add_role_select"
                selectId="delegation_add_role_type"
                hasAll={ true }
                selectProperty="null"
                selectValue="请选择..."
                onHandleSelect={ this.handleSelectRole }
                count={ roleCount }
              />
              {
                addUserRoleError
                  ?
                  <p className="register_error">* { addUserRoleErrorMessage }</p>
                  :
                  ""
              }
            </li>
          </ul>
          <ul className="register_detail_box">
            <li>
              <span className="register_detail_title">姓名:</span>
              <input className="register_detail_value" type="text" placeholder="请输入姓名..."
               onBlur={ this.handlePersonalBlur.bind(this) } ref={ (input) => this.personalName = input }/>
              {
                this.state.addUserPersonalNameError
                ?
                <p className="register_error">* 请输入姓名</p>
                :
                ""
              }
            </li>
            <li>
              <span className="register_detail_title">性别:</span>
              <input className="register_detail_value" type="text" placeholder="请输入性别..."
               onBlur={ this.handleGenderBlur.bind(this) } ref={ (input) => this.gender = input }/>
              {
                this.state.addUserGenderError
                ?
                <p className="register_error">* 性别输入有误</p>
                :
                ""
              }
            </li>
            <li>
              <span className="register_detail_title">生日:</span>
              <input type="text" id="personal_date" className="register_detail_value" placeholder="请选择日期..." ref={ (input) => this.date = input } readOnly />
              <button type="button" id="personal_date_btn" className="icon-calendar-cute"></button>
              {
                this.state.addUserDateError
                ?
                <p className="register_error register_birthday">* 请输入生日</p>
                :
                ""
              }
            </li>
            <li>
              <span className="register_detail_title">户籍:</span>
              <input className="register_detail_value" type="text" placeholder="请输入户籍..."
               onBlur={ this.handleCensusBlur.bind(this) } ref={ (input) => this.census = input }/>
              {
                this.state.addUserCensusError
                ?
                <p className="register_error">* 请输入户籍</p>
                :
                ""
              }
            </li>
            <li>
              <span className="register_detail_title">职位:</span>
              <input className="register_detail_value" type="text" placeholder="请输入职位..."
                     onBlur={ this.handlePositionBlur.bind(this) } ref={ (input) => this.position = input }/>
              {
                this.state.addUserPositionError
                  ?
                  <p className="register_error">* 请输入职位</p>
                  :
                  ""
              }
            </li>
            <li>
              <span className="register_detail_title">身份证:</span>
              <input className="register_detail_value" type="text" placeholder="请输入身份证号码..."
               onBlur={this.handleIdCardBlur.bind(this)} ref={ (input) => this.idCard = input } />
              {
                addUserIdCardError
                  ?
                  <p className="register_error">* { addUserIdCardErrorMessage }</p>
                  :
                  ""
              }
            </li>
          </ul>
          <div className="register_options_box">
            <button type="button" className="register_add_ensure" onClick={ this.handleSubmit }>添加</button>
            <button type="button" className="register_add_reset" onClick={ this.handleReset }>重置</button>
          </div>
        </div>
      </div>
    );
  }
}

export default RegisterUser;
export { RegisterUser };
