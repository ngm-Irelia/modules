import React, { Component } from 'react';
const url = '/magicube';
const page = {
	title: '404',
	css: [
        '/css/topology/topology.css'
	]
};
class Notfound404 extends Component{
    render() {
        return (
            <div className='notFound'>
                <h1>404</h1>
                <p>页面找不到</p>
            </div>
        )
    }
}

Notfound404.epmUIPage = page;
module.exports = Notfound404;