const gulp       = require( 'gulp' );
const header     = require( 'gulp-header' );
const cleanCSS      = require( 'gulp-clean-css' );
const path       = require( 'path' );
const sourcemaps = require( 'gulp-sourcemaps' );

const config = require( '../config/settings' );
const tasks  = require( '../config/tasks' );

const { paths: { source: { css: source }, output: { css: output } }, banner } = config;

module.exports = ( callback ) => {

  console.info( 'Building css' );
  return gulp.src( path.join( source, '**', '*.css' ) )
    .pipe( sourcemaps.init() )
    .pipe( cleanCSS() )
    .pipe( header( banner ) )
    .pipe( sourcemaps.write( './' ) )
    .pipe( gulp.dest( output ) );

};
