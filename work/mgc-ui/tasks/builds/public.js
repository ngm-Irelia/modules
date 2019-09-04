const gulp       = require( 'gulp' );
const header     = require( 'gulp-header' );
const path       = require( 'path' );

const config = require( '../config/settings' );

const { paths: { source: { public: source }, output: { public: output } }, banner } = config;

module.exports = ( callback ) => {

  console.info( 'Building public' );

  return gulp.src( path.join( source ) )
    .pipe( gulp.dest( output ) );

};
