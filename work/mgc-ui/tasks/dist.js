const runSequence  = require( 'run-sequence' );

module.exports = ( callback ) => {
  
  console.info( 'Distributing' );
  
  runSequence( 'clean', [ 'build' ], callback );

};