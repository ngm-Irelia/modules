const gulp        = require( 'gulp' );
const runSequence = require( 'run-sequence' );

const buildFrame      = require( './builds/frame' );
const buildViews      = require( './builds/views' );
const buildComponents = require( './builds/components' );
const buildJavascript = require( './builds/javascript' );
const buildCss = require( './builds/css' );
const buildImage = require( './builds/image' );
const buildBower = require( './builds/bower' );
const buildPublic = require( './builds/public' );
const buildFonts = require( './builds/fonts' );

const buildCommon = require( './builds/common' );
const buildStore = require( './builds/store' );

gulp.task( 'build-frame', buildFrame );
gulp.task( 'build-views', buildViews );
gulp.task( 'build-components', buildComponents );
gulp.task( 'build-javascript', buildJavascript );
gulp.task( 'build-css', buildCss );
gulp.task( 'build-image', buildImage );
gulp.task( 'build-bower', buildBower );
gulp.task( 'build-public', buildPublic );
gulp.task( 'build-fonts', buildFonts );

gulp.task( 'build-common', buildCommon );
gulp.task( 'build-store', buildStore );

module.exports = ( callback ) => {
  
  console.info( 'Building' );

  let tasks = [];

  tasks.push( 'build-views' );
  tasks.push( 'build-frame' );
  tasks.push( 'build-components' );
  tasks.push( 'build-javascript' );
  tasks.push( 'build-css' );
  tasks.push( 'build-image' );
  tasks.push( 'build-bower' );
  tasks.push( 'build-public' );
  tasks.push( 'build-fonts' );

  tasks.push( 'build-common' );
  tasks.push( 'build-store' );

  runSequence( tasks, callback );

};