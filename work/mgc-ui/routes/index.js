const express = require( 'express' );
const request = require( 'request' );
const path    = require( 'path' );

const router  = express.Router();

const loginCheckout = require( './loginCheckout' );

const ips     = require( '../config/ips.json' );
const url = 'http://' + ips.magicube.ip + ':' + ips.magicube.port + '/' + ips.magicube.name + '/';
const THEME_DEFAULT = 'black';
const THEME_SCROLLBAR_DEFAULT = 'minimal';

/* Log in */
const iLogin = ( url, data, req, res ) => {
  request( {
      method: "POST",
      headers: {
        Origin: req.headers.origin,
        "x-forwarded-for": req.ip,
        Cookie: req.headers.cookie
      },
      url: url,
      form: data
    },
    ( err, httpResponse, body ) => {
      console.log( "*******************Log in******************" );
      if( !httpResponse ) {
        res.redirect( req.context.contextPath + '/login' );
        return false;
      }

      // 若为第一次登录，set-cookie有返回值；若用户已经登录，后端返回set-cookie字段为undefined
      if(httpResponse.headers['set-cookie']) {
        // req.session.sess = httpResponse.headers['set-cookie'];
        res.append( 'Set-Cookie', httpResponse.headers['set-cookie'] );
      }

      if( !body ) {
        return false;
      }
      const dataSource = JSON.parse( body );
      res.json( dataSource );
    } );
};

/* Sign out */
const iLogout = ( req, res ) => {
  request.post(
    {
      url: url + 'logout',
      form: {},
      headers: {
        Cookie: req.headers.cookie,
        "x-forwarded-for": req.ip
      }
    },
    ( error, response, body ) => {
      console.log( "******************Sign out******************" );
      // req.session.destroy();
      res.json( JSON.parse( body ) );
    } );
};

router.get( '/logout', loginCheckout, ( req, res ) => {
  iLogout( req, res );
} );

/* GET home page. */
router.get( ['/', '/index'], ( req, res ) => {
  // res.render( 'index');
  res.render( 'index', {
    theme: req.cookies.theme || THEME_DEFAULT
  });
} );

/*home */
router.get( '/home', ( req, res ) => {
  res.render( 'home', {
    theme: req.cookies.theme || THEME_DEFAULT
  });
} );

/* TEST: GET home page. */
// router.get( '/search', loginCheckout, ( req, res ) => {
//   res.render( 'search', {
//     theme: req.cookies.theme || 'black'
//   } )
// } );

/* GET login page. */
router.get( '/login', ( req, res ) => {
  res.render( 'login' ,{
    theme: req.cookies.theme || THEME_DEFAULT
  });
} );

/* GET pkilogin page. */
router.get( '/pkilogin', ( req, res ) => {
  res.render( 'pkilogin' ,{
    theme: req.cookies.theme || THEME_DEFAULT
  });
} );

// 从管理平台直接点击登录(银川)
router.post( '/login/inner', ( req, res ) => {
  const dataUrl = url + 'login/inner';
  const data = Object.assign( {}, req.body );
  iLogin( dataUrl, data, req, res );
} );

router.post( '/login/check', ( req, res ) => {
  const getDataUrl = url + 'login';
  const data = Object.assign( {}, req.body );
  iLogin( getDataUrl, data, req, res );
} );

/* GET searchlist page. */
router.get( '/searchlist', loginCheckout, ( req, res ) => {
  res.render( 'searchList', {
    keyword: req.query.keyword,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET topology page. */
router.get( '/topology', loginCheckout, ( req, res ) => {
  res.render( 'topology', {
    keyword: req.query.keyword,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET Chartprobe page. */
router.get( '/Chartprobe', loginCheckout, ( req, res ) => {
  res.render( 'Chartprobe', {
    keyword: req.query.keyword,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET dashboard page. */
router.get( '/dashboard', loginCheckout, ( req, res ) => {
  res.render( 'dashboard', {
    keyword: req.query.keyword,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT
  } );
} );

/* GET gitPlatform page. */
router.get( '/gisPlatform', loginCheckout, ( req, res ) => {
  res.render( 'gisPlatform', {
    keyword: req.query.keyword,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET option page. */
router.get( '/option', loginCheckout, ( req, res ) => {
  res.req.headers['cache-control'] = "max-age=60*60*4";
  const userId = req.cookies.userId;
  res.render( 'option', {
    id: userId,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET entity page. */
router.get( '/entity', loginCheckout, ( req, res ) => {
  // console.log( req.signedCookies, req.cookies );
  res.render( 'entity', { 
    type: req.query.type,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT,
    hbaseUrl: 'http://' + ips.hbase.ip + ':' + ips.hbase.port
  } );
} );

/* GET event page. */
router.get( '/event', loginCheckout, ( req, res ) => {
  res.render( 'event', {
    type: req.query.type,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET document page. */
router.get( '/document', loginCheckout, ( req, res ) => {
  res.render( 'document', {
    type: req.query.type,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* GET data page */
router.get( '/data', loginCheckout, ( req, res ) => {
  res.render( 'data', {
    type: req.query.type,
    id: req.query.id,
    theme: req.cookies.theme || THEME_DEFAULT,
    scrollbarTheme: req.cookies.scrollbarTheme || THEME_SCROLLBAR_DEFAULT
  } );
} );

/* POST newEntity page */
router.get( '/serviceforjz', ( req, res ) => {
  var param = req.query.key,  //登录验证信息
    idNumber = req.query.idNumber,   //被查找人身份证号
    regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;   //身份证号校验
  if(regIdNo.test(idNumber)){
    request(
      {
        method: 'POST',
        url: url + 'login/key',
        form: {
          key: decodeURIComponent(param)
        },
        headers: {
          Cookie: req.headers.cookie
        }
      },
      ( error, response, body ) => {
        const userInfo = body;

        if (userInfo && JSON.parse(userInfo).code === 200) {

          // 用户登录验证成功跳转到 newEntity 页面
          res.render('newEntity', {
            idNumber: req.query.idNumber,
            theme: req.cookies.theme || 'black'
          })
        }else if(JSON.parse(userInfo).code === 333){
          // 用户已经登录，直接跳转到 newEntity 页面
          res.render('newEntity', {
            idNumber: req.query.idNumber,
            theme: req.cookies.theme || 'black'
          })
        }else {
          // 身份证号效验失败返回错误信息
          res.send({
            code: 1,
            msg: '请重新登录！'
          });
        }

      } );
  }else{
    res.send({
      code: 2,
      msg: '查找身份证号格式有误1！',
      req:req
    });
  }
} );


/* POST newEntity page */
/*
 router.post( '/serviceforjz', ( req, res ) => {
 var param = req.query.key,  //登录验证信息
 idNumber = req.query.idNumber,   //被查找人身份证号
 regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;   //身份证号校验
 console.log(req);

 if(regIdNo.test(idNumber)){
 request(
 {
 method: 'POST',
 url: url + 'login/key',
 form: {
 key: decodeURIComponent(param)
 },
 headers: {
 Cookie: req.headers.cookie
 }
 },
 ( error, response, body ) => {
 const userInfo = body;

 if (userInfo && JSON.parse(userInfo).code === 200) {

 // 用户登录验证成功跳转到 newEntity 页面
 res.render('newEntity', {
 idNumber: req.body.idNumber,
 theme: req.cookies.theme || 'black'
 })
 }else if(JSON.parse(userInfo).code === 333){
 // 用户已经登录，直接跳转到 newEntity 页面
 res.render('newEntity', {
 idNumber: req.body.idNumber,
 id: req.body.idNumber,
 theme: req.cookies.theme || 'black'
 })
 }else {
 // 身份证号效验失败返回错误信息
 res.send({
 code: 1,
 msg: '请重新登录！'
 });
 }

 } );
 }else{
 res.send({
 code: 2,
 msg: '查找身份证号格式有误1！',
 req:req
 });
 }
 } );
 */

module.exports = router;
