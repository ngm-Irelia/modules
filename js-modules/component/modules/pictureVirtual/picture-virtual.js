/**
 * @fileoverview 组件-图片显示虚化效果 
 * v1.0 简单实现功能，用户自定义各种效果后续开发
 * 示例文件 first.html
 * 基于原生js
 *
 * @author NGM
 * @version 1.0
 * 
 * #图片虚化组件 v1.0  注意，现在要求 父盒子必须要有宽高~，后续有时间，在代码中优化下组件
 */

/** 
 * @namespace component的所有类均放在Component命名空间下
 */
var Component = window.Component = Component || {};

(function(){

	class PictureVirtual {
		constructor() {
			this.showId = ""; //显示的id
			this.showData = '';
		}
		/**
		 * 加载函数
		 * @param showId 显示#id
		 * @param Img 显示图片
		 */
		run(showId, Img) {
			this.showId = showId;
			this.showImg = Img;
			this.elem = document.getElementById(this.showId);
			this.width = this.elem.clientWidth;
			this.height = this.elem.clientHeight;
			
			this.loadImg();
		}

		/**
		 * 加载图片
		 */
		loadImg() {
			let _that = this;

			let html =
				`<div id="${_that.showId}virtual-div" style="position: relative; width:100%; height:100%;">
				<div style="width:100%; height:100%;overflow: hidden;">
					<img src="${_that.showImg}" id="${_that.showId}virtual-img" style="filter: blur(15px);" width="100%" height="100%"/> 
				</div>
				<div style="position: absolute; top:0px; bottom:0px;left:0px;right:0px;">
					<img src="${_that.showImg}"  id="${_that.showId}clear-img" style="position: absolute;"/> 
				</div>
			</div>
			`;

			document.getElementById(_that.showId).innerHTML = html;

			_that.dealImg();

		}

		/**
		 * 处理图片样式
		 */
		dealImg() {
			let _that = this;
			let VImg = document.getElementById(_that.showId + "virtual-img");
			let CImg = document.getElementById(_that.showId + "clear-img");
			VImg.onload = function() {
				let baseH = VImg.naturalHeight;
				let baseW = VImg.naturalWidth;
				if(baseH>=baseW){ // h>=w
					CImg.setAttribute('height',_that.height);
					let left = (_that.width-(baseW*_that.height)/baseH)/2;
					CImg.setAttribute('style', 'position: absolute; left: '+parseInt(left)+'px');
				}else{ // h<w
					CImg.setAttribute('width',_that.width);
					let top = (_that.height-(baseH*_that.width)/baseW)/2;
					CImg.setAttribute('style', 'position: absolute; top: '+parseInt(top)+'px');
				}
			}
		}

	}

	Component.PictureVirtual = PictureVirtual;

})()

