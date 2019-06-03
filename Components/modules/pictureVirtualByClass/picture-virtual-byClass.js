/**
 * @fileoverview 组件-图片显示虚化效果  通过class方式
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


	class PictureVirtualByClass {
		constructor() {
		}
		/**
		 * 加载函数
		 * @param Img 显示图片
		 */
		run() {
			this.elems = document.getElementsByClassName('picture-virtual');
			this.loadImg();
		}

		/**
		 * 加载图片
		 */
		loadImg() {
			let _that = this;
			for(var i=0;i<_that.elems.length;i++){
				let ele = _that.elems[i];
				_that.width = ele.clientWidth;
				_that.height = ele.clientHeight;
				
				_that.showImg = ele.getAttribute("data-src");
				
				let html =
					`<div class="virtual-div" style="position: relative; width:100%; height:100%;">
					<div style="width:100%; height:100%;overflow: hidden;">
						<img src="${_that.showImg}" class="virtual-img" style="filter: blur(15px);" width="100%" height="100%"/> 
					</div>
					<div style="position: absolute; top:0px; bottom:0px;left:0px;right:0px;">
						<img src="${_that.showImg}"  class="clear-img" style="position: absolute;"/> 
					</div>
				</div>
				`;
				
				ele.innerHTML = html;
				
				let VImg = ele.getElementsByClassName("virtual-img")[0];
				let CImg = ele.getElementsByClassName("clear-img")[0];
				
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
	}

	Component.PictureVirtualByClass = PictureVirtualByClass; 

})();