import React, { Component } from 'react';

const url = '/magicube';

const page = {
  title: '登录',
  css: [
    '/css/login/pkilogin.css'
  ],
  js: [
    '/js/login/pkilogin.js'
  ]
};

class PKILogin extends Component {

  constructor( props ) {
    super( props );

    this.handleChangeType = this.handleChangeType.bind( this );
  }

  handleChangeType(ev) {
    ev.target.setAttribute("type", "password");
  }

  render() {

    return (
      <div>
        <div id="index_main">
          <div id="index_main_logo">
            <img src="../image/logo.svg" alt=""/>
          </div>
          <div id="index_main_title">
            <p>情报魔方</p>
          </div>
          <div id="login_warning">
            <p></p>
          </div>
          <div id="index_login">
            <div id="index_login_input">
              {/*<div className="index_text icon-login-user-o">*/}
                {/*<input type="text" id="home_user" autoComplete="off" autoFocus="autoFocus"/>*/}
              {/*</div>*/}
              {/*<div className="index_text icon-login-unlock">*/}
                {/*<input type="text" id="home_pwd" defaultValue="" onFocus={ this.handleChangeType }/>*/}
              {/*</div>*/}
              <img src="../image/fraudkey.png" alt=""/>
            </div>
            <div className="index_button icon-index-btn">
              <span className="path1 index_position"></span>
              <span className="path2 index_position"></span>
              <span className="path3 index_position"></span>
              <span className="index_font">登  录</span>
              <input type="button" id="index_login_btn" value="登  录"/>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

PKILogin.epmUIPage = page;

module.exports = PKILogin;
