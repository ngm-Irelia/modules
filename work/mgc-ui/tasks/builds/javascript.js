const gulp       = require( 'gulp' );
const header     = require( 'gulp-header' );
const uglify     = require( 'gulp-uglify' );
const babel      = require( 'gulp-babel' );
const path       = require( 'path' );
const sourcemaps = require( 'gulp-sourcemaps' );

const config = require( '../config/settings' );
const tasks  = require( '../config/tasks' );

const { paths: { source: { javascript: source }, output: { javascript: output } }, banner } = config;

module.exports = ( callback ) => {
  return gulp.src( [ path.join( source, '**', '*.js' ),
    `!${ path.join( source, 'public', '*', '**', '*.js' ) }`,
    `!${ path.join( source, 'public', '**', 'html2canvas.js' ) }`,
    `!${ path.join( source, 'public', '**', 'jquery.js' ) }`,
    `!${ path.join( source, 'public', '**', 'quill.js' ) }`] )
    .pipe( sourcemaps.init() )
    .pipe( babel( tasks.babel.javascript ) )
    .pipe( uglify( { mangle: false } ) )
    .pipe( header( banner ) )
    .pipe( sourcemaps.write( './' ) )
    .pipe( gulp.dest( output ) );

};
