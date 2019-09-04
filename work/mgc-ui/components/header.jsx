import React, { Component } from 'react';
import { HeaderMenu } from "./headerMenu";

class Header extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { bHome, bSearchlist, bTopo, bMap, bChart, bDashboard, bSearch, bUser, positionStyle, arrowDirection } = this.props;
    return (
      <div id="header">
        <div id="header_logo">
          <img src="../image/logo.svg" alt=""/>
          <p>情报魔方</p>
        </div>
        <HeaderMenu
          bHome = { bHome }
          bSearchlist = { bSearchlist }
          bTopo={ bTopo }
          bMap={ bMap }
          bChart={ bChart }
          bDashboard={ bDashboard }
          bSearch={ bSearch }
          bUser={ bUser }
          positionStyle={ positionStyle }
          arrowDirection={ arrowDirection }/>
      </div>
    );
  }
}

export default Header;
export { Header };
