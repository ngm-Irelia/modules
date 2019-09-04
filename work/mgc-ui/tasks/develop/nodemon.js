const nodemon     = require( 'gulp-nodemon' );
const browserSync = require( 'browser-sync' );

const config = require( '../config/settings' );
const tasks  = require( '../config/tasks' );

module.exports = ( callback ) => {
  
  let isRunning = false;
  return nodemon( tasks.nodemon )
  .on( 'start', () => {
    if ( !isRunning ) {
      callback();
      isRunning = true;
    }
  } )
  .on( 'restart', () => {
    // reload connected browsers after a slight delay
    setTimeout( () => {
      browserSync.reload();
    }, config.debug.browserSync.reloadDelay );
  } );
  
};