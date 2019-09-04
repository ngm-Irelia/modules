import React, { Component } from 'react';

const errorFlag = {
  phoneError: false,
  emailError: false
};

const url = '/magicube';

class ModifyPersonal extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      phoneValue: "",
      emailValue: "",
      phoneErrorMessage: "",
      emailErrorMessage: "",
      id: null
    }
  }
  /* 先获取用户ID */
  componentDidMount() {
    fetch(url + '/islogined',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        credentials: "include",
        body: ""
      }
    )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        this.setState( {
          id: data.data.userId
        } )
      } )
  }

  /* 动态改变手机号码输入框的value */
  handleChangePhone(ev) {
    this.setState( {
      phoneValue: ev.target.value
    } )
  }

  /* 动态改变邮箱输入框的value */
  handleChangeEmail(ev) {
    this.setState( {
      emailValue: ev.target.value
    } )
  }

  /* 校验邮箱 */
  handleCheckDetailEmail() {
    const value = this.state.emailValue;

    if( !value ) {
      errorFlag.emailError = false;
      this.setState( {
        emailErrorMessage: false
      } );
      return false;
    }

    const reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    const result = reg.test( value );

    if( !result ) {
      errorFlag.emailError = true;
      this.setState( {
        emailErrorMessage: "* 邮箱格式有误"
      } );
    } else {
      errorFlag.emailError = false;
      this.setState( {
        emailErrorMessage: false
      } );
    }
  }

  /* 校验手机号码 */
  handleCheckDetailPhone() {
    const value = this.state.phoneValue;

    if( !value ) {
      errorFlag.phoneError = false;
      this.setState( {
        phoneErrorMessage: ""
      } );
      return false;
    }

    const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    const result = reg.test( value );

    if( !result ) {
      errorFlag.phoneError = true;
      this.setState( {
        phoneErrorMessage: "* 手机号码有误"
      } );
    } else {
      errorFlag.phoneError = false;
      this.setState( {
        phoneErrorMessage: ""
      } );
    }

  }

  /* 提交修改内容 */
  handleSubmit() {
    const { phoneValue, emailValue } = this.state;
    if( !phoneValue && !emailValue ) {
      this.props.onSubmit( "fail", "警告!", "无修改内容" );
      return false;
    }
    //提交之前再次校验，方式光标不离开导致不校验的情况
    this.handleCheckDetailPhone();
    this.handleCheckDetailEmail();

    if( errorFlag.phoneError || errorFlag.emailError) {
      return false;
    }

    let data = `id=${ this.state.id }`;

    if( phoneValue ) {
      data += `&phoneNumber=${ phoneValue }`;
    }

    if( emailValue ) {
      data += `&email=${ emailValue }`;
    }

    fetch(url + '/updateuser',
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
          this.resetValue();
          this.handleClose();
          this.props.onSubmit( "succeed", "提示!", data.message );
        } else {
          this.props.onSubmit( "fail", "提示!", data.message );
        }
      } )
  }

  /* 隐藏修改信息的弹框 */
  handleClose() {
    this.div.style.display = "none";
  }

  /* 重置输入框和错误信息提示 */
  resetValue() {
    this.setState( {
      phoneValue: "",
      emailValue: "",
      phoneErrorMessage: "",
      emailErrorMessage: ""
    } )
  }

  render() {
    const { phoneValue, emailValue, phoneErrorMessage, emailErrorMessage } = this.state;
    return (
      <div ref={ (div) => this.div = div } className="modify_detail_box">
        <div className="personal_option_detail">
          <h6 className="modify_title">修改个人信息</h6>
          <div className="personal_option_box">
            <div>
              <input
                type="text" className="component_input" placeholder="请输入新手机号..." value={ phoneValue }
                onBlur={ this.handleCheckDetailPhone.bind( this ) } onChange={ this.handleChangePhone.bind( this ) }
              />
              {
                errorFlag.phoneError
                  ?
                  <p className="component_error">{ phoneErrorMessage }</p>
                  :
                  <p className="component_error"></p>
              }
            </div>
            <div>
              <input
                type="text" className="component_input" placeholder="请输入新邮箱..." value={ emailValue }
                onBlur={ this.handleCheckDetailEmail.bind( this ) } onChange={ this.handleChangeEmail.bind( this ) }
              />
              {
                errorFlag.emailError
                  ?
                  <p className="component_error">{ emailErrorMessage }</p>
                  :
                  <p className="component_error"></p>
              }
            </div>
            <div className="component_button_box">
              <button className="component_ensure" onClick={ this.handleSubmit.bind( this ) }>确认</button>
              <button className="component_reset" onClick={ this.handleClose.bind( this ) }>取消</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ModifyPersonal;
export { ModifyPersonal };
