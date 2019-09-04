import React, { Component } from 'react';
import Layout from './layouts/default';
import resources from './config/resources.json';

const PAGE_ROOT = 'epm-ui-page-root';
const initScriptTmpl = ( ctx, props ) => `
  if ( window.EPMUI && window.EPMUIPage ) {
    EPMUI.context = ${ ctx };
    var container = document.getElementById( "${ PAGE_ROOT }" );
    var Page = EPMUIPage.default || EPMUIPage;
    var Magicube = ${ props };
    ReactDOM.render(
      React.createElement( Page, ${ props } ),
      container
    );
  }
`.trim();
export default ( props ) => {
  const res = resources[ props.env ] || {};
  const context = props.context;
  const contextPath = context.contextPath;
  const gistype = context.gis.type;
  const gisjs = context.gis.js;
  const page = props.component.epmUIPage || {};
  const initScript = initScriptTmpl( JSON.stringify( context ), props.data );

  let data = props.data;
  if ( data && typeof data !== 'object') data = JSON.parse(data);
  const cssTheme = data.theme ? ( '/' + data.theme ) : '';

  return (
      <html lang="zh-cn">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge, chrome=1" />
        <title>{ page.title || 'EPM UI Page title' }</title>
        <link rel="shortcut icon" href={ `${ contextPath }/image/logo.ico` } />
        { res.css && res.css.map( ( css, index ) => <link key={ index } rel="stylesheet" href={ contextPath + css } /> ) }
        { page.css && page.css.map( ( css, index ) => <link key={ index } rel="stylesheet"
                                                            href={ contextPath + '/css' + cssTheme + css.replace(/\/css/, '') } /> ) }
      </head>
      <body>
      <Layout id={ PAGE_ROOT } contextPath={ contextPath }>
        { props.children }
      </Layout>
      {/*<script type="text/javascript" src="http://172.16.11.43:8080/geoserver/openlayers3/ol.js"></script>*/}
      <script type="text/javascript" src={ `${ contextPath }/js/public/jquery.js` }></script>
      { res.js && res.js.map( ( js, index ) => <script key={ index } src={ contextPath + js } /> ) }
      { page.js && page.js.map( ( js, index ) => <script key={ index } src={ contextPath + js } /> ) }
      { page.es && page.es.map( ( es, index ) => <script type= "module" key={ index } src={ contextPath + es } /> ) }
      { props.view ? <script src={ `${ contextPath }/views/${ props.view }.${ props.env === 'development' ? 'js' : 'min.js' }` } /> : null }
      <script dangerouslySetInnerHTML={ { __html: initScript } } />
      {gistype=='bmap'?<script src= "http://api.map.baidu.com/api?v=2.0&ak=oGipGGHoW0wB5s24tUaobMN4ku23wKCu" />:null}
      {gistype=='supermap'?<script src= {gisjs}/>:null}
      </body>
      </html>
  );

};
