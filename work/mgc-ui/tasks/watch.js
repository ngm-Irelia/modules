const gulp        = require( 'gulp' );
const path        = require( 'path' );
const browserSync = require( 'browser-sync' );

const config = require( './config/settings' );

const source = config.paths.source;

module.exports = ( callback ) => {

  console.info( 'Watching files for changes' );

  /* Watch Frame */
  gulp.watch( [
    path.join( source.frame, '**', '*.js' ),
    path.join( source.frame, '**', '*.jsx' ),
    path.join( source.frame, '**', '*.json' )
  ], [ 'build-frame' ] ).on( 'change', ( event ) => {
    console.info( 'File ' + event.path + ' was ' + event.type + ', running tasks...' );
    browserSync.reload();
  } );

  /* Watch Views */
  gulp.watch( [
    path.join( source.views, '**', '*.jsx' )
  ], [ 'build-views' ] ).on( 'change', ( event ) => {
    console.info( 'File ' + event.path + ' was ' + event.type + ', running tasks...' );
    browserSync.reload();
  } );

  /* Watch Custom Components */
  gulp.watch( [
    path.join( source.components, '**', '*.jsx' ),
    path.join( source.components, '**', '*.js' )
  ], [ 'build-components' ] ).on( 'change', ( event ) => {
    console.info( 'File ' + event.path + ' was ' + event.type + ', running tasks...' );
    browserSync.reload();
  } );

  /* Watch Css */
  gulp.watch( [
    path.join( source.css, '**', '*.css' )
  ], [ 'build-css' ] ).on( 'change', ( event ) => {
    console.info( 'File ' + event.path + ' was ' + event.type + ', running tasks...' );
    browserSync.reload();
  } );

  /* Watch Javascript */
  gulp.watch( [
    path.join( source.javascript, '**', '*.js' )
  ], [ 'build-javascript' ] ).on( 'change', ( event ) => {
    console.info( 'File ' + event.path + ' was ' + event.type + ', running tasks...' );
    browserSync.reload();
  } );

  /* Watch stylus */
  gulp.watch( [
    path.join( source.stylus, '**', '*.styl' ),
    path.join( source.themes, '**', '*.styl' )
  ], [ 'convert-stylus' ] ).on( 'change', ( event ) => {
    console.info( 'File ' + event.path + ' was ' + event.type + ', running tasks...' );
    browserSync.reload();
  } );

};