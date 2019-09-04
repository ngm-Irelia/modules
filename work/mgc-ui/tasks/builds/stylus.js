const gulp = require('gulp');
const header = require('gulp-header');
const path = require('path');
const stylus = require('gulp-stylus');
const nib = require('nib');
const cached = require('gulp-cached');
const plumber = require('gulp-plumber');
const print = require('gulp-print');
// const merge = require('merge-stream');
const minimist = require('minimist'); //命令行参数获取插件

const config = require('../config/settings');

const {paths: {source: {stylus: source, themes: skins}, output: {stylus: output}}} = config;

module.exports = (callback) => {

  console.info('Converting stylus');
  /**
   * 从命令行读取参数生成对应的主题色
   * @demo 命令行参数使用示例：gulp convert-stylus --theme black
   */
  let knownOptions = {
    string: 'theme',
    default: {theme: 'black'} //默认为黑色
  };

  let options = minimist(process.argv.slice(2), knownOptions);
  let theme = options.theme;

  return gulp.src(path.join(source, '**', '*.styl'))
    .pipe(plumber())
    .pipe(cached('convert-stylus'))
    .pipe(print())
    .pipe(stylus({use: nib(), import: ['nib', path.join(skins, theme, 'style.styl')]}))
    .pipe(gulp.dest(path.join(output, theme)));


  // return gulp.src( path.join( source, '**', '*.styl' ) )
  //   .pipe( plumber() )
  //   .pipe( cached( 'convert-stylus' ) )
  //   .pipe( print() )
  //   .pipe( stylus({ use: nib(), import: ['nib']}) )
  //   .pipe( gulp.dest( output ) );

  // gulp.task( 'theme-black', function () {
  //   return gulp.src(path.join(source, '**', '*.styl'))
  //     .pipe(plumber())
  //     .pipe(cached('convert-stylus'))
  //     .pipe(print())
  //     .pipe(stylus({import: [path.join(skins, 'black', 'style.styl')]}))
  //     .pipe(gulp.dest(path.join( output, 'black' )));
  // } );
  //
  // gulp.task( 'theme-blue-white', function () {
  //   return gulp.src(path.join(source, '**', '*.styl'))
  //     .pipe(plumber())
  //     .pipe(cached('convert-stylus'))
  //     .pipe(print())
  //     .pipe(stylus({import: [path.join(skins, 'blue-white', 'style.styl')]}))
  //     .pipe(gulp.dest(path.join( output, 'blue-white' )));
  // } );
  //
  // gulp.task( 'theme-white', function () {
  //   return gulp.src(path.join(source, '**', '*.styl'))
  //     .pipe(plumber())
  //     .pipe(cached('convert-stylus'))
  //     .pipe(print())
  //     .pipe(stylus({import: [path.join(skins, 'white', 'style.styl')]}))
  //     .pipe(gulp.dest(path.join( output, 'white' )));
  // } );
  // let tasks = ['theme-black', 'theme-blue-white', 'theme-white'];
  // runSequence( 'theme-black',
  //   ['theme-blue-white'],
  //   callback );


  // const themes = ['blue-white']; //'black', 'blue-white', 'white'
  // let themeTasks = themes.map((theme) => {
  //   return gulp.src(path.join(source, '**', '*.styl'))
  //     .pipe(plumber())
  //     .pipe(cached('convert-stylus'))
  //     .pipe(print())
  //     .pipe(stylus({import: [path.join(skins, theme, 'style.styl')]}))
  //     .pipe(gulp.dest(path.join( output, theme )));
  // });
  // return merge( themeTasks );

};