/**
 * Created by lss on 2018/10/8.
 */
window.MGC = {
  /**
   * 图片获取代理
   * @param img 页面上的文档对象
   * @param src server端传递的图片url(图片来自BE)
   * @param objectType 对象的类型（图片来自FE）
   */
  proxyImage: function (img, src, objectType) {
    let defaultName = objectType || 'default';
    let _img = new Image();

    _img.onload = function () {
      img.src = this.src;
    };
    _img.onerror = function () {
      _img.onerror = null;
    };
    img.onerror = function () {
      img.src = '/image/typeicon/default.svg';
      img.onerror = null;
    };

    img.src = '/image/typeicon/' + defaultName + '.svg';
    src ? _img.src = src : '';
  },
  /**
   * 判断字符串是否可以转为对应的json格式
   * @param str 需要判断的字符串
   * @returns {boolean}
   */
  isJSONString: function ( str ) {
    try {
      if (typeof JSON.parse(str) == "object") {
        return true;
      }
    } catch(e) {
    }
    return false;
  },
  /**
   * "高调"的普通信息提示框
   * @param content
   */
  alert: function ( message ) {
    let container = document.createElement( 'div' ),
      header = document.createElement( 'section' ),
      content = document.createElement( 'section' ),
      footer = document.createElement( 'section' ),
      confirm = document.createElement( 'button' );
    //设置class
    container.className = 'mgc-popup';
    header.className = 'mgc-popup-head';
    content.className = 'mgc-popup-content';
    footer.className = 'mgc-popup-footer';
    confirm.className = 'mgc-popup-confirm';
    //设置初始值
    header.innerText = '提示';
    content.innerText = message;
    confirm.innerText = '确定';
    //设置样式 component/*.styl文件定义
    //添加DOM
    footer.appendChild( confirm );
    container.appendChild( header );
    container.appendChild( content );
    container.appendChild( footer );
    document.body.appendChild( container );
    //按钮添加事件
    confirm.addEventListener( 'click', function () {
      container.style.display = 'none';
    } );
  }
};