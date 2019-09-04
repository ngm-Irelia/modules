$(function () {
  var ip = 'localhost',
    port = 3000;

  var getQueryVariable = function(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  };

  const userName = getQueryVariable('username');
  const password = getQueryVariable('pw');
  if(!userName || !password) {
    location.href = 'http://' + ip + ':' + port + '/login';
    return;
  }

  $.post('/login/inner', { username: decodeURIComponent(userName), pw: decodeURIComponent(password) },
    function (data) {
      const userInfo = data;
      if(userInfo.code === 200) {
        document.cookie = "name=" + userInfo.magicube_interface_data.userName;
        document.cookie = "userId=" + userInfo.magicube_interface_data.id;
        // document.cookie = "account=" + userInfo.magicube_interface_data.account;
        // document.cookie = "IDCardNo=" + userInfo.magicube_interface_data.idCard;

        fetch('magicube/memory/findSkinColor?userId=' + userInfo.magicube_interface_data.id,
          {
            credentials: 'include',
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          })
          .then((response) => response.json())
          .then((data) => {
            let theme = data.magicube_interface_data || 'blue-white';
            document.cookie = "theme=" + theme;
            if(theme === 'black'){
              document.cookie = "scrollbarTheme=minimal";
            }else{
              document.cookie = "scrollbarTheme=minimal-dark";
            }
            location.href = '/index';
          });
      }else if (userInfo.code == 333) {
        // 用户已经登录，直接跳转到index页面
        location.href = '/index';
      }else {
        location.href = 'http://' + ip + ':' + port + '/login';
      }
    });
});


