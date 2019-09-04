import React, { Component } from 'react';

const errorFlag = {
  passwordInitialError: false,
  passwordNewOneError: false,
  passwordNewTwoError: false
};

const url = '/magicube';

/* 修改密码 */
class ModifyPassword extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      passwordInitial: "",
      passwordNewOne: "",
      passwordNewTwo: "",
      passwordInitialMessage: "",
      passwordNewOneMessage: "",
      passwordNewTwoMessage: "",
      id: null
    }
  }

  componentDidMount() {
    /* 先判断是否登陆，获取用户的ID */
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

  /* 原始密码的值随着onchange事件的触发而改变 */
  handleChangeInitial(ev){
    this.setState( {
      passwordInitial: ev.target.value
    } );
  }

  /* 输入新密码 */
  handleChangeOne(ev){
    this.setState( {
      passwordNewOne: ev.target.value
    } );
  }

  /* 再次确认密码 */
  handleChangeTwo(ev){
    this.setState( {
      passwordNewTwo: ev.target.value
    } );
  }

  /* 判断初始密码是否和确认密码一致 */
  handleBlurInitial() {
    if( !this.state.passwordInitial.trim() ) {
      errorFlag.passwordInitialError = true;
      this.setState( {
        passwordInitialMessage: "* 原始密码不能为空"
      } )
    } else {
      errorFlag.passwordInitialError = false;
      this.setState( {
        passwordInitialMessage: ""
      } );
    }
  }

  /* 判断新密码是否为空 */
  handleBlurOne() {
    if( !this.state.passwordNewOne.trim() ) {
      errorFlag.passwordNewOneError = true;
      this.setState( {
        passwordNewOneMessage: "* 确认密码不能为空"
      } )
    } else {
      errorFlag.passwordNewOneError = false;
      this.setState( {
        passwordNewOneMessage: ""
      } );
    }
  }

  /* 判断 */
  handleBlurTwo() {
    if( this.state.passwordNewOne.trim() !== this.state.passwordNewTwo.trim() || !this.state.passwordNewTwo.trim() ) {
      errorFlag.passwordNewTwoError = true;
      this.setState( {
        passwordNewTwoMessage: "* 两次输入密码不同"
      } )
    } else {
      errorFlag.passwordNewTwoError = false;
      this.setState( {
        passwordNewTwoMessage: ""
      } );
    }
  }

  handleSubmit() {
    this.handleBlurInitial();
    this.handleBlurOne();
    this.handleBlurTwo();
    if( errorFlag.passwordInitialError || errorFlag.passwordNewOneError || errorFlag.passwordNewTwoError ) {
      return false;
    }

    const data = `id=${ this.state.id }&passwdOld=${this.state.passwordInitial}&passwdNew=${this.state.passwordNewTwo}`;

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

  handleClose() {
    this.div.style.display = "none";
  }

  resetValue() {
    this.setState( {
      passwordInitial: "",
      passwordNewOne: "",
      passwordNewTwo: ""
    } )
  }

  render() {
    const {
      passwordInitial, passwordNewOne, passwordNewTwo,
      passwordInitialMessage, passwordNewOneMessage, passwordNewTwoMessage
    } = this.state;

    return (
      <div ref={ (div) => this.div = div } className="modify_password_box">
       <div className="personal_option_password">
          <h6 className="modify_title">修改密码</h6>
          <div className="personal_option_box">
            <div>
              <input
                type="text" className="component_input" value={ passwordInitial }
                placeholder="请输入原密码..." onChange={ this.handleChangeInitial.bind( this ) }
                onBlur={ this.handleBlurInitial.bind( this ) }
              />
              {
                errorFlag.passwordInitialError
                  ?
                  <p className="component_error">{ passwordInitialMessage }</p>
                  :
                  <p className="component_error"></p>
              }
            </div>
            <div>
              <input
                type="password" className="component_input" value={ passwordNewOne }
                placeholder="请输入新密码..." onChange={ this.handleChangeOne.bind( this ) }
                onBlur={ this.handleBlurOne.bind( this ) }
              />
              {
                errorFlag.passwordNewOneError
                  ?
                  <p className="component_error">{ passwordNewOneMessage }</p>
                  :
                  <p className="component_error"></p>
              }
            </div>
            <div>
              <input
                type="password" className="component_input" value={ passwordNewTwo }
                placeholder="请再次输入新密码..." onChange={ this.handleChangeTwo.bind( this ) }
                onBlur={ this.handleBlurTwo.bind( this ) }
              />
              {
                errorFlag.passwordNewTwoError
                  ?
                  <p className="component_error">{ passwordNewTwoMessage }</p>
                  :
                  <p className="component_error"></p>
              }
            </div>
            <div className="component_button_box">
              <button className="component_ensure" onClick={ this.handleSubmit.bind( this ) } >确认</button>
              <button className="component_reset" onClick={ this.handleClose.bind( this ) }>取消</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ModifyPassword;
export { ModifyPassword };
