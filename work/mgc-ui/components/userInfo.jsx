import React, { Component } from 'react';


class UserInfo extends Component {

  constructor(props) {
    super(props);

    this.state = {
      userName: '',
      open: false,
      visible: 'none',
      themeAlertVisible: 'none',
      themeType: 'black',
      presentAuth: '',
      ckeckClassName:'icon-dot-circle',
      noCheckClassName:'icon-hollow-circle',
    };

    this.handleOpen             = this.handleOpen.bind( this );
    this.handleClose            = this.handleClose.bind( this );
    this.handleTabPersonal      = this.handleTabPersonal.bind( this );
    this.handleTabMessage       = this.handleTabMessage.bind( this );
    this.handleTabOption        = this.handleTabOption.bind( this );
    this.handleTabOpinion       = this.handleTabOpinion.bind( this );
    this.handleTabVersion       = this.handleTabVersion.bind( this );
    this.handleTabData          = this.handleTabData.bind( this );
    this.handletTabTheme        = this.handletTabTheme.bind( this );
    this.handleTabOut           = this.handleTabOut.bind( this );
  }
        
  componentDidMount() {
    //获取cookie
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
    
    let auth = localStorage.getItem('auth');

    this.setState( {
        userName: getCookie("name"),
        userId: getCookie("userId"),
        themeType: getCookie("theme"),
        presentAuth: auth        
    });
     //利用事件冒泡进行事件委托
    document.addEventListener( 'click', this.handleClose, false );
       
  }

  // 打开个人中心
  handleOpen() {
    this.setState({
      open: !this.state.open
    });
     
  }

  //关闭个人中心
  handleClose(ev){
    if( ev.target.getAttribute("id") === "userName" ) {
      return false;
    }
    this.setState( {
      open: false
    } );
  }

  // 切换到个人中心
  handleTabPersonal() {
    localStorage.setItem( "optionTab", 0 );
    location.href = "/option";
  }

  // 切换到消息中心
  handleTabMessage() {
    localStorage.setItem( "optionTab", 1 );
    location.href = "/option";
  }

  // 权限管理
  handleTabOption() {
    localStorage.setItem( "optionTab", 2 );
    location.href = "/option";
  }

  // 操作日志
  handleTabOpinion() {
    localStorage.setItem( "optionTab", 3 );
    location.href = "/option";
  }

  // 系统日志
  handleTabVersion() {
    localStorage.setItem( "optionTab", 4 );
    location.href = "/option";
  }

  // 版本管理
  handleTabData() {
    location.href = "/data";
  }

  //切换皮肤
  handletTabTheme() {
    this.setState({
      visible: 'block',
      themeAlertVisible: 'block'
    })
    
  }

  //选择皮肤
  handleChangeTheme(e) {
    e = e || window.event;
    this.setState({
        themeType: e.target.id
    })
  }
  //确定切换皮肤
  handleThemeSure(){
     fetch( EPMUI.context.url + '/memory/skin?color=' + this.state.themeType, 
      {
        credentials: 'include', 
        method: 'GET', 
        mode: 'cors',
        headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/x-www-form-urlencoded',
                  }
      } )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        document.cookie = "theme=" + this.state.themeType;
        if(this.state.themeType === 'black'){
          document.cookie = "scrollbarTheme=minimal";
        }else{
          document.cookie = "scrollbarTheme=minimal-dark";
        }
        location.reload(true);
        this.setState({
          visible: 'none',
          themeAlertVisible: 'none'
        })       
      } );
  }

  //取消切换皮肤
  handleClickCancel(){
    this.setState({
      visible: 'none',
      themeAlertVisible: 'none'
    })
  }
  // 退出
  handleTabOut() {
    fetch( '/logout', {credentials: 'include'} )
      // .then( ( response ) => response.json() )
      .then( ( data ) => {
        const cok = document.cookie;
        const nameStart = cok.indexOf("name");
        const nameEnd = cok.indexOf( ";", nameStart );
        let name = "";
        if( nameEnd !== -1 ) {
          name = cok.substring( nameStart + 5, nameEnd );
        } else {
          name = cok.substring( nameStart + 5 );
        }
        const exp = new Date();
        exp.setTime( exp.getTime() - 1 );
        document.cookie = "name="+ name +";expires=" + exp.toGMTString();
        location.href = "/login";
      } );
  }

  render() {
    const { positionStyle, arrowDirection, triangleStyle } = this.props;
    const classNamedot = this.state.themeType === "black" ? this.state.ckeckClassName : this.state.noCheckClassName;
    const classNamehollow = this.state.themeType === "white" ? this.state.ckeckClassName : this.state.noCheckClassName;
    const classNameBlue = this.state.themeType === "blue-white" ? this.state.ckeckClassName : this.state.noCheckClassName;
    return (
      <div id="userBox" onClick={ this.handleOpen }>
        <div id="header_border"></div>
        <div id="user">
          <div id="userName">
            <span className={ arrowDirection } onClick={ this.handleOpen }></span>
            { this.state.userName }
          </div>
          {
            this.state.open
            &&
            <div id="personal_center" style={ positionStyle }>
              <div onClick={ this.handleTabPersonal }><span className="icon-user-circle"></span>个人信息</div>
              <div onClick={ this.handleTabMessage }><span className="icon-bell"></span>消息中心</div>
              {/* {console.log(this.state.presentAuth)} */}
              { 
                this.state.presentAuth == 'true'
                &&
              <div onClick={ this.handleTabOption }><span className="icon-cog"></span>权限管理</div>
              }
              {
                this.state.presentAuth == 'true'
                &&
              <div onClick={ this.handleTabOpinion }><span className="icon-edit"></span>操作日志</div>
              }
              {
                this.state.presentAuth == 'true'
                &&
              <div onClick={ this.handleTabVersion }><span className="icon-exclamation-circle-o"></span>系统日志</div>
              }
              <div onClick={ this.handleTabData }><span className="icon-v-circle"></span>版本管理</div>
              <div onClick={ this.handletTabTheme }><span className="icon-clothes"></span>切换皮肤</div>
              <div onClick={ this.handleTabOut }><span className="icon-power-off"></span>退出</div>
              <b className={ triangleStyle }></b>
            </div>
          }
        </div>
        <div className="shade" style={{ display: this.state.visible }}>
          <div className="themeAlertBox" style={{ display: this.state.themeAlertVisible }}>
            <h4><span className="icon-clothes-blue"></span>切换皮肤</h4>
            <div className="model_box">
              <p>请选择切换皮肤类型 :</p>
              <div>
                  <div className={classNamedot} id="black" onClick={this.handleChangeTheme.bind(this)}> 黑色</div>
                  <div className={classNamehollow} id="white" onClick={this.handleChangeTheme.bind(this)}> 白色</div>
                  <div className={classNameBlue} id="blue-white" onClick={this.handleChangeTheme.bind(this)}> 蓝-白色 </div>
            </div>
            </div>
            <div className="button_box">
              <button className="ok" onClick={ this.handleThemeSure.bind(this) }>确定</button>
              <button className="cancel" onClick={ this.handleClickCancel.bind(this) }>取消</button>
            </div>
          </div>
        </div>
      </div>
    );

  }

}

UserInfo.defaultProps = {
  positionStyle: {
    top: '50px',
    borderTop: 'none'
  },
  arrowDirection: 'icon-chevron-down-blue',
  triangleStyle: 'triangleDown'
};

export default UserInfo;
export { UserInfo };