const path = require( 'path' );

const cwd = process.cwd();

module.exports = {
  frame: path.resolve( cwd, 'build', 'frame' ),
  views: path.resolve( cwd, 'build', 'views' ),
  components: path.resolve( cwd, 'build', 'components' ),
  javascript: path.resolve( cwd, 'build', 'public/js' ),
  css: path.resolve( cwd, 'build', 'public/css/' ),
  image: path.resolve( cwd, 'build', 'public/image' ),
  bower: path.resolve( cwd, 'build', 'public/bower_components' ),
  public: path.resolve( cwd, 'build', 'public/js/public' ),
  fonts: path.resolve( cwd, 'build', 'public/fonts/' ),
  stylus: path.resolve( cwd, 'public', 'css' ),
  store: path.resolve( cwd, 'build', 'store' ),
  common: path.resolve( cwd, 'build', 'common' )
};
