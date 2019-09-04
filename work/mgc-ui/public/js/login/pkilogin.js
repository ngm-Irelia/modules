// $(function () {

(function (){

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

  const param = getQueryVariable('key');
  if(!param) {
    return;
  }

  $.post('magicube/login/key', { key: decodeURIComponent(param) }, function (data) {
    const userInfo = JSON.parse(data);
    if(userInfo.code === 200) {
      document.cookie = "name=" + userInfo.magicube_interface_data.userName;
      document.cookie = "userId=" + userInfo.magicube_interface_data.userId;
      //document.cookie = "account=" + userInfo.magicube_interface_data.account;
      document.cookie = "IDCardNo=" + userInfo.magicube_interface_data.idCard;

      fetch('magicube/memory/findSkinColor?userId=' + userInfo.magicube_interface_data.userId,
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
          let theme = data.magicube_interface_data || 'black';
          document.cookie = "theme=" + theme;
          if(theme === 'black'){
            document.cookie = "scrollbarTheme=minimal";
          }else{
            document.cookie = "scrollbarTheme=minimal-dark";
          }
          location.href = '/index';
        });

      //在登录里存储这个值，在离开登录或超时登录时，移除这个值
      localStorage.removeItem('auth');
      localStorage.setItem('auth', userInfo.magicube_interface_data.auth.toString());

    }else if (userInfo.code == 333) {
      // 用户已经登录，直接跳转到index页面
      location.href = '/index';
    }else {
      location.href = 'http://10.94.50.202:8080/login.jsp';
    }
  });
})();

// });
