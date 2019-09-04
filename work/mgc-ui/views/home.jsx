import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from '../../build/store/store';
import { Header } from '../../build/common/common';
const page = {
  title: '首页',
  css: [
  ],
  js: [
    
  ]
};



class IndexApp extends Component {

  constructor(props) {
    super(props);

    
  }

  
  render() {
   
    return (
      <Provider store={store}>

        <div>
          <Header />

        </div>

      </Provider>
    );
  }

}

IndexApp.epmUIPage = page;

module.exports = IndexApp;
