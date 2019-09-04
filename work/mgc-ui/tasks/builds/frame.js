const gulp          = require( 'gulp' );
const header        = require( 'gulp-header' );
const plumber       = require( 'gulp-plumber' );
const path          = require( 'path' );
const webpack       = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );

const config = require( '../config/settings' );
const tasks  = require( '../config/tasks' );

const { paths: { source: { frame: source }, output: { frame: output } }, files: { frame: files }, banner } = config;

module.exports = ( callback ) => {

  console.info( 'Building frame' );

  return gulp.src( path.join( source, files.src ) )
      .pipe( plumber() )
      .pipe( webpackStream( tasks.webpack.frame, webpack ) )
      .pipe( header( banner ) )
      .pipe( gulp.dest( output ) );

};