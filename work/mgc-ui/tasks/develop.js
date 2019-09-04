const gulp        = require( 'gulp' );
const runSequence = require( 'run-sequence' );

const nodemon     = require( './develop/nodemon' );
const browserSync = require( './develop/browser-sync' );

gulp.task( 'nodemon', nodemon );
gulp.task( 'browser-sync', browserSync );

module.exports = ( callback ) => {
  
  console.log( 'Running dev server' );
  
  runSequence( [ 'watch', 'nodemon', 'browser-sync' ], callback );

};