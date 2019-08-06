/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.language = 'zh-cn'
	config.font_defaultLabel = '仿宋';
	config.fontSize_defaultLabel = '14px';
	//忽略段落中的空字符
	config.ignoreEmptyParagraph = true;
	config.resize_enabled = false;
	config.defaultLanguage = 'cn';
	config.fontSize_sizes='八号/6.7px;七号/7.3px;小六/8.7px;六号/10px;小五/12px;五号/14px;小四/16px;四号/18.7px;小三/20px;三号/21.3px;小二/24px;二号/29.3px;小一/32px;一号/34.7px;小初/48px;'
	config.font_names = '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;';
	config.startupShowBorders = false;
	config.height = 'calc(100vh - 180px)';
	config.allowedContent=true
	config.extraPlugins = 'html5video,widget,widgetselection,clipboard,lineutils';
	config.filebrowserImageUploadUrl = "./file/uploadImg";
	config.extraPlugins="linkbutton";

//	config.resize_minHeight = 300;
//	config.resize_maxHeight = 600;
};
