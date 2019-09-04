const gulp = require( 'gulp' );

// watch for file changes and build
const watch = require( './tasks/watch' );

// develop server
const develop = require( './tasks/develop' );

// build all files
const build = require( './tasks/build' );

// utility tasks
const clean = require( './tasks/clean' );

// distribution tasks
const dist = require( './tasks/dist' );

// convert stylus to css
const convertStylus = require( './tasks/builds/stylus' );

/* Tasks */
gulp.task( 'default', [ 'build' ] );

gulp.task( 'watch', watch );

gulp.task( 'develop', develop );

gulp.task( 'build', build );

gulp.task( 'clean', clean );

gulp.task( 'dist', dist );

gulp.task( 'convert-stylus', convertStylus );


