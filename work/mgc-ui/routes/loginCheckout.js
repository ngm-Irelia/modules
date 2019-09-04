const request = require( 'request' );

const ips = require( '../config/ips.json' );
const url = 'http://' + ips.magicube.ip + ':' + ips.magicube.port + '/' + ips.magicube.name + '/';

module.exports = (req, res, next) => {

  if (req.headers.cookie) {

    request(
      {
        method: 'POST',
        url: url + 'islogined',
        form: {},
        headers: {
          Cookie: req.headers.cookie
        }
      },
      ( error, response, body ) => {
        console.log( "*****************Has logged in******************" );

        if (body && JSON.parse(body).status === 'success') {
          next();
        }else {
          res.redirect( req.context.contextPath + '/login' );
        }

      } );

  }else {
    res.redirect( req.context.contextPath + '/login' );
  }
};