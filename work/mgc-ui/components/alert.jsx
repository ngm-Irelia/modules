import React, { Component } from 'react';

class Alert extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      alertIcon: this.props.icon || '',
      alertTitle: this.props.title || '',
      alertContent:  this.props.content || <div />,
      alertStyle: this.props.style || {},
      alertType: this.props.type || '',
      show: this.props.show || false,
      sureFunction: this.props.onClick || function(){}
    };
    //绑定事件
    this.handleSure = this.handleSure.bind( this );
    this.handleCancel = this.handleCancel.bind( this );
  }

  //如果属性改变触发这个生命周期钩子
  componentWillReceiveProps( nextProps ) {
    if( this.props.content !== nextProps.content ) {
      this.setState( {
        alertTitle: nextProps.title,
        alertContent: nextProps.content,
        alertStyle: nextProps.style
      } );
    }
  }

  //弹框确认事件
  handleSure() {
    //this.state.sureFunction();
    $(".component_alert").hide();
  }

  //弹框取消事件
  handleCancel() {
    //this.state.sureFunction();
    $(".component_alert").hide();
  }

  render() {
    const { alertIcon, alertTitle, alertContent, alertStyle, alertType } = this.state;
    let style = {
      display: this.state.show ? 'fixed' : 'none'
    };

    return(
      <div className="component_alert" style={style}>
        
        {
          (()=>{
            switch (alertType) {
              case "alert": 
                  return (<div />);
                  break;
              case "confirm":
                  return <div className="component_alert_box">
                            <h4 className="header component_alert_title" style={ alertStyle }><span className={ alertIcon } />{ alertTitle }</h4>
                            <div className="body component_alert_content">{ alertContent }</div>
                            <div className="footer">
                              <button type="button" className="button_sure" onClick={ this.handleSure.bind( this ) }>确定</button>
                              <button type="button" className="button_cancel" onClick={ this.handleCancel.bind( this ) }>取消</button>
                            </div>
                          </div>;
                  break;
              default: 
                  break;
            }
          })()
        }    
        
      </div>
    )
  }

}

export default Alert;
export { Alert };