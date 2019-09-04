const browserSync = require( 'browser-sync' );

const tasks = require( '../config/tasks' );

module.exports = ( callback ) => {
  
  return browserSync.init( tasks.bowserSync, callback );
  
};