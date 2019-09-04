const express       = require( 'express' );
const favicon       = require( 'serve-favicon' );
const logger        = require( 'morgan' );
const fs            = require( 'fs' );
const rfs           = require( 'rotating-file-stream');
const bodyParser    = require( 'body-parser' );
const parseurl      = require( 'parseurl' );
const cookieParser  = require( 'cookie-parser' );
const session       = require( 'express-session' );
// const RedisStore    = require( 'connect-redis' )(session);
const proxy         = require( 'http-proxy-middleware' );

const path          = require( 'path' );
// const accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});//添加访问日志
// const errorLogfile  = fs.createWriteStream('error.log', {flags: 'a'});//添加访问日志
// configs
const errors  = require( path.join( __dirname, 'config', 'errors.json') );
const context = require( path.join( __dirname, 'config', 'context.json' ) );
const log     = require( path.join( __dirname, 'config', 'log.json' ) );
const paths   = require( path.join( __dirname, 'config', 'paths' ) );
const ips     = require( path.join( __dirname, 'config', 'ips.json' ) );

const { frame: framePath, views: viewsPath, components: comsPath, bower: bowerPath,common:commonPath,store:storePath } = paths;

//const accessLogStream = fs.createWriteStream( log[ 'log_path' ], { flags: 'a' } );

// initialize EPM UI context and integration
require( 'epm-ui' ).context = context;
const epmUIExpress = require( 'epm-ui-express-integration' );
epmUIExpress.options( {
  main: path.join( framePath, 'html.js' ),
  context: context
} );

// routes
const index = require( './routes/index' );

const app = express();
//app.use( logger( 'tiny', { stream: accessLogfile } ) );//将访问日志写入access.log文件
const logDirectory = path.join(__dirname, 'log');//日志文件保存目录
// 确定日志文件是否存在
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
 
// 创建一个日志文件
const accessLogStream = rfs('access.log', {
      interval: '1d', // 更新时间为一天
      path: logDirectory
});
// app.use(logger('dev', {
//   skip: function (req, res) { 
//     return res.statusCode < 400 
//   }
// }));

app.use(logger('common',{stream: accessLogStream}));//添加访问日志

// view engine setup
app.set( 'views', viewsPath );
app.set( 'view engine', 'js' );
app.engine( 'js', epmUIExpress.engine() );
app.use( epmUIExpress.context() );

const options = {
  target: "http://" + ips.magicube.ip + ":" + ips.magicube.port,
  changeOrigin: true,
  xfwd: true
};
const newProxy  = proxy( options );
app.use( '/magicube/*', newProxy );

// app.use( session ( {
//   secret: 'keyboard cat',
//   resave: true,
//   saveUninitialized: false,
//   cookie: { secure: false, maxAge: 1000 * 60 * 60 * 8 }
//   // store: new RedisStore( {
//   //   url: 'http://' + ips.redis.ip + ':' + ips.redis.port,
//   //   ttl: 60 * 60 * 8
//   // } )
// } ) );

app.use( cookieParser() );

app.use( logger( log[ 'log_level' ] ) );

// if ( app.get( 'env' ) === 'production' ) {
//   app.use( express.static( path.join( __dirname, 'build/public' ) ) );
// } else {
//   app.use( express.static( path.join( __dirname, 'public' ) ) );
// }
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
//请不要再改这里了，好吗？谁再改打死他
if (app.get( 'env' ) === 'production') {
  app.use( express.static( path.join( __dirname, 'build/public' ) ) );
} else {
  app.use( express.static( path.join( __dirname, 'public' ) ) );
}
app.use( '/views', express.static( viewsPath ) );
app.use( '/components', express.static( comsPath ) );
app.use( '/common', express.static( commonPath ) );
app.use( '/store', express.static( storePath ) );
app.use( '/bower_components', express.static( bowerPath) );

app.use( '/', index );

// catch 404 and forward to error handler
app.use( ( req, res, next ) => {
  let err = new Error( 'Not Found' );
  err.status = 404;
  res.render( '404', {
    keyword: req.query.keyword,
    id: req.query.id,
    theme: req.cookies.theme || 'black'
  } );
  next( err );
} );

// error handlers

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
  app.use( ( err, req, res, next ) => {
    const status = err.status || 500;
    res.status( status );
    res.render( 'error', {
      status: status,
      message: err.message,
      stack: err.stack
    } );
  } );
}

// production error handler
// no stacktraces leaked to user
app.use( ( err, req, res, next ) => {
  res.status( err.status || 500 );
  res.render( 'error', {
    info: errors[ err.status ] || errors[ 'default' ],
    message: err.message
  } );
} );

module.exports = app;
