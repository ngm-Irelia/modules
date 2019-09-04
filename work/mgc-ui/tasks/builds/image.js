const gulp       = require( 'gulp' );
const header     = require( 'gulp-header' );
const path       = require( 'path' );

const config = require( '../config/settings' );
const tasks  = require( '../config/tasks' );

const { paths: { source: { image: source }, output: { image: output } }, banner } = config;

module.exports = ( callback ) => {

  console.info( 'Building image' );

  return gulp.src( path.join( source ) )
    .pipe( gulp.dest( output ) );

};
