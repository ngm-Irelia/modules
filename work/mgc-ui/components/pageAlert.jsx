import React, { Component } from 'react';

class PageAlert extends Component {

  render() {
    return (
      <div id="page_alert">
        <div id="page_alert_box">
          <h6 id="page_alert_title"></h6>
          <div id="page_alert_content"></div>
          <button type="button" id="page_alert_button" >确定</button>
        </div>
      </div>
    )
  }

}

export default PageAlert;
export { PageAlert }