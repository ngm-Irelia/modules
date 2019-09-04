import React, { Component } from 'react';

const url = '/magicube';

class RegisterGroup extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      addGroupNameErrorMessage: "",
      addGroupNameValue: "",
      addGroupNameError: false
    };

    this.handleSubmit = this.handleSubmit.bind( this );
    this.handleReset = this.handleReset.bind( this );
    this.handleChangeGroupName = this.handleChangeGroupName.bind( this );

  }

  /* 光标离开用户组名的input进行校验是否内容为空 */
  handleAddGroupNameBlur() {
    const value = this.state.addGroupNameValue;
    if( !value.trim() ) {
      this.setState( {
        addGroupNameErrorMessage: "用户组名不能为空",
        addGroupNameError: true
      } );

      return false;
    }

    const data = `name=${ value }`;

    this.checkName( data, url + '/checkgroupname', 'group' );
  }

  handleChangeGroupName( ev ) {
    this.setState( {
      addGroupNameValue: ev.target.value
    } );
  }

  /* 提交创建数据 */
  handleSubmit() {
    const { addGroupNameValue } = this.state;
    const data = "name=" + addGroupNameValue;
    const submitResult = this.checkData();

    if( !submitResult ) {
      return false;
    }

    fetch(
      url + '/addgroup',
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
        if( data.status === "success" ) {
          this.props.onSubmit( "succeed", "提示!", data.message );
          this.resetValue();
        } else {
          return false;
        }
      } )
  }

  handleReset() {
    this.resetValue();
  }

  /* 重置输入框内的value */
  resetValue() {
    this.setState( {
      addGroupNameErrorMessage: "",
      addGroupNameValue: "",
      addGroupNameError: false
    } )
  }

  /* 向后台请求判断用户名是否存在 */
  checkName( data, url ) {
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
          this.setState( {
            addGroupNameErrorMessage: data.message,
            addGroupNameError: true
          } );
        } else {
          this.setState( {
            addGroupNameError: false
          } );
        }
      } );
  }

  checkData() {
    const { addGroupNameValue, addGroupNameError } = this.state;

    if( !addGroupNameValue ) {
      this.props.onSubmit( "fail", "警告!", "填写用户组名！");
      return false;
    } else if( addGroupNameError ) {
      return false;
    }

    return true;
  }

  render() {
    const { addGroupNameErrorMessage, addGroupNameError, addGroupNameValue } = this.state;

    return (
      <div className="register">
          <div className="register_lists_box">
            <ul className="register_detail_box">
              <li>
                <span className="register_detail_title">用户组名:</span>
                <input autoComplete="off" className="register_detail_value"
                       onBlur={ this.handleAddGroupNameBlur.bind( this ) } type="text"
                       placeholder="请输入用户组名..." value={ addGroupNameValue }
                       onChange={ this.handleChangeGroupName } ref={ ( input ) => this.groupName = input }
                />
                {
                  addGroupNameError
                  ?
                  <p className="register_error">* { addGroupNameErrorMessage }</p>
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

export default RegisterGroup;
export { RegisterGroup };
