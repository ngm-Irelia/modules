const path = require( 'path' );

const cwd = process.cwd();
const pkg = require( path.resolve( cwd, 'package.json' ) );
const paths = require( path.resolve( cwd, 'config', 'paths.js' ) );

const bsProxyPort = process.env.PORT || '3000';
const bsPort = parseInt( bsProxyPort, 10 ) + 1;
const bsUIPort = bsPort + 1;

module.exports = {

  banner: [
    '/*!',
    ` * ${ pkg.name } - ${ pkg.description }`,
    ` * @version v${ pkg.version }`,
    ` * @link ${ pkg.homepage }`,
    ' * Copyright (C) 2017 BONC All rights reserved.',
    ' */',
    ''
  ].join('\n'),

  paths: {
    source: {
      frame: path.resolve( cwd, 'frame' ),
      views: path.resolve( cwd, 'views' ),
      components: path.resolve( cwd, 'components' ),
      javascript: path.resolve( cwd, 'public/js' ),
      css: path.resolve( cwd, 'public/css' ),
      image: path.resolve( cwd, 'public/image/**' ),
      bower: path.resolve( cwd, 'public/bower_components/**' ),
      public: path.resolve( cwd, 'public/js/public/**' ),
      store: path.resolve( cwd, 'store' ),
      common: path.resolve( cwd, 'common' ),
      fonts: path.resolve( cwd, 'public/fonts' ),
      stylus: path.resolve( cwd, 'public/stylus/pages' ),
      themes: path.resolve( cwd, 'public/stylus/themes' )
    },
    output: paths,
    clean: [
      path.resolve( cwd, 'build' )
    ]
  },

  files: {
    frame: {
      src: 'html.jsx',
      dist: 'html.js'
    },
    components: {
      src: 'index.js',
      dist: 'magicube.js'
    },
    store: {
      src: 'index.js',
      dist: 'store.js'
    },
    common: {
        src: 'index.js',
        dist: 'common.js'
    }
  },

  module: {
    frame: {
      global: 'EPMUIApp'
    },
    views: {
      global: 'EPMUIPage'
    },
    components: {
      global: 'Magicube',
      exports: 'magicube'
    },
    store: {
        global: 'store',
        exports: 'store'
    },
    common: {
        global: 'common',
        exports: 'common'
    }
  },
  
  debug: {
    browserSync: {
      proxyPort: bsProxyPort,
      port: bsPort,
      uiPort: bsUIPort,
      reloadDelay: 500
    }
  }

};