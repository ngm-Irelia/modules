$(function () {

  updateWaterMark();
  $(window).resize(function () {
    updateWaterMark();
  });

  function getCookie(cookie_name) {
    var allcookies = document.cookie;
    var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度

    // 如果找到了索引，就代表cookie存在，
    // 反之，就说明不存在。
    if (cookie_pos != -1) {
      // 把cookie_pos放在值的开始，只要给值加1即可。
      cookie_pos += cookie_name.length + 1;      //这里容易出问题，所以请大家参考的时候自己好好研究一下
      var cookie_end = allcookies.indexOf(";", cookie_pos);
      if (cookie_end == -1) {
        cookie_end = allcookies.length;
      }
      var value = unescape(allcookies.substring(cookie_pos, cookie_end));    //这里就可以得到你想要的cookie的值了。。。
    }
    return value;
  }

  function updateWaterMark() {
    var date = new Date();
    watermark({
      watermark_txt: (getCookie('name') || '') + '<br/>'
      + (getCookie('IDCardNo') || '身份证号') + '<br/>'
      + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '<br/>'
      + '本操作将被记录' + '<br/>' + '泄露相关信息将依法追究法律责任',
      topo: $("#topo_network").length
    });
  }

  // 生成水印
  function watermark(settings) {
    //默认设置
    var defaultSettings = {
      watermark_txt: "",
      watermark_x: 20, //水印起始位置x轴坐标
      watermark_y: 20,//水印起始位置Y轴坐标
      watermark_rows: 350,//水印行数
      watermark_cols: 250,//水印列数
      watermark_x_space: 5,//水印x轴间隔
      watermark_y_space: 5,//水印y轴间隔
      watermark_color: '#616161',//水印字体颜色
      watermark_alpha: 0.2,//水印透明度
      watermark_fontsize: '16px',//水印字体大小
      watermark_font: '微软雅黑',//水印字体
      watermark_width: 350,//水印宽度
      watermark_height: 200,//水印长度
      watermark_angle: -15 ////水印倾斜度数
    };

    //采用配置项替换默认值，作用类似jquery.extend
    if (arguments.length === 1 && typeof arguments[0] === "object") {
      var src = arguments[0] || {};
      for (var key in src) {
        if (src[key] && defaultSettings[key]
          && src[key] === defaultSettings[key])
          continue;
        else if (src[key])
          defaultSettings[key] = src[key];
      }
    }

    var oTemp = document.createDocumentFragment();
    $(".watermark").remove();
    //获取页面最大宽度
    var page_width = Math.max(document.body.scrollWidth,
      document.body.clientWidth);
    //获取页面最大高度
    var page_height = Math.max(document.body.scrollHeight,
      document.body.clientHeight);
    if (page_height == 0) {
      page_height = document.documentElement.scrollHeight;
    }

    //如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔
    if (defaultSettings.watermark_cols == 0
      || (parseInt(defaultSettings.watermark_x
        + defaultSettings.watermark_width
        * defaultSettings.watermark_cols
        + defaultSettings.watermark_x_space
        * (defaultSettings.watermark_cols - 1)) > page_width)) {
      defaultSettings.watermark_cols = parseInt((page_width
        - defaultSettings.watermark_x + defaultSettings.watermark_x_space)
        / (defaultSettings.watermark_width + defaultSettings.watermark_x_space));
      defaultSettings.watermark_x_space = parseInt((page_width
        - defaultSettings.watermark_x - defaultSettings.watermark_width
        * defaultSettings.watermark_cols)
        / (defaultSettings.watermark_cols - 1));
    }
    //如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔
    if (defaultSettings.watermark_rows == 0
      || (parseInt(defaultSettings.watermark_y
        + defaultSettings.watermark_height
        * defaultSettings.watermark_rows
        + defaultSettings.watermark_y_space
        * (defaultSettings.watermark_rows - 1)) > page_height)) {
      defaultSettings.watermark_rows = parseInt((defaultSettings.watermark_y_space
        + page_height - defaultSettings.watermark_y)
        / (defaultSettings.watermark_height + defaultSettings.watermark_y_space));
      defaultSettings.watermark_y_space = parseInt((page_height
        - defaultSettings.watermark_y - defaultSettings.watermark_height
        * defaultSettings.watermark_rows)
        / (defaultSettings.watermark_rows - 1));
    }

    if (defaultSettings.watermark_cols == 0) {
      defaultSettings.watermark_cols = 1;
      defaultSettings.watermark_width = page_width;
      // defaultSettings.watermark_fontsize = detectFontSize(defaultSettings.watermark_fontsize) + "px";
      defaultSettings.watermark_fontsize = defaultSettings.watermark_fontsize + "px";
    }

    if (defaultSettings.watermark_rows == 0) {
      defaultSettings.watermark_rows = 1;
      defaultSettings.watermark_height = page_height;
      // defaultSettings.watermark_fontsize = detectFontSize(defaultSettings.watermark_fontsize) + "px";
      defaultSettings.watermark_fontsize = defaultSettings.watermark_fontsize + "px";
    }

    var x;
    var y;
    var isIE = /msie/.test(navigator.userAgent.toLowerCase());

    for (var i = 0; i < defaultSettings.watermark_rows; i++) {
      y = defaultSettings.watermark_y
        + (defaultSettings.watermark_y_space + defaultSettings.watermark_height)
        * i;
      for (var j = 0; j < defaultSettings.watermark_cols; j++) {
        x = defaultSettings.watermark_x
          + (defaultSettings.watermark_width + defaultSettings.watermark_x_space)
          * j;
        var mask_div = document.createElement('div');
        var maskId = 'mask_div' + i + j;
        mask_div.id = maskId;
        $(mask_div).attr("class", "watermark")
        mask_div.innerHTML = "<span class='a'>" + defaultSettings.watermark_txt + "</span>";
        //
        mask_div.style.visibility = "";
        mask_div.style.position = "absolute";
        if (isNaN(x)) {
          x = 20;
        }
        if (isNaN(y)) {
          y = 20;
        }

        mask_div.style.left = x + 'px';
        mask_div.style.top = y + 'px';
        mask_div.style.overflow = "hidden";
        mask_div.style.zIndex = "500";
        //mask_div.style.border="solid black 1px";
        mask_div.style.opacity = defaultSettings.watermark_alpha;
        var scale = 1;
        if (isIE) {
          var rad = (0 - defaultSettings.watermark_angle) * (Math.PI / 180);
          var m11 = Math.cos(rad) * scale, m12 = -1 * Math.sin(rad)
            * scale, m21 = Math.sin(rad) * scale, m22 = m11;

          var documentMode = document.documentMode;// ie

          if (documentMode == undefined || documentMode < 9) {
            mask_div.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + defaultSettings.watermark_alpha * 100 + ") progid:DXImageTransform.Microsoft.Matrix(M11=" + m11 + ",M12=" + m12 + ",M21=" + m21 + ",M22=" + m22 + ",SizingMethod='auto expand')";
          }
        }
        // Modern
        mask_div.style['-ms-transform'] = "rotate(" + defaultSettings.watermark_angle + "deg) scale(" + scale + ")";
        mask_div.style['-moz-transform'] = "rotate(" + defaultSettings.watermark_angle + "deg) scale(" + scale + ")";
        mask_div.style['-webkit-transform'] = "rotate(" + defaultSettings.watermark_angle + "deg) scale(" + scale + ")";
        mask_div.style['-o-transform'] = "rotate(" + defaultSettings.watermark_angle + "deg) scale(" + scale + ")";
        mask_div.style['transform'] = "rotate(" + defaultSettings.watermark_angle + "deg) scale(" + scale + ")";
        mask_div.style.fontSize = defaultSettings.watermark_fontsize;
        mask_div.style.fontFamily = defaultSettings.watermark_font;
        mask_div.style.color = defaultSettings.watermark_color;
        mask_div.style.textAlign = "center";
        mask_div.style.width = defaultSettings.watermark_width + 'px';
        mask_div.style.height = defaultSettings.watermark_height + 'px';
        mask_div.style.display = "block";
        mask_div.style.pointerEvents = "none";//pointer-events:none  让水印不遮挡页面的点击事件
        oTemp.appendChild(mask_div);
      }

    }
    // if (settings.topo) {
    //   const topo = document.getElementById("topo_network");
    //   topo.appendChild(oTemp);
    // }
    document.body.appendChild(oTemp);
  }

});