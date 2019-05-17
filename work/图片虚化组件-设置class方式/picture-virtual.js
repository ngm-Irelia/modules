document.addEventListener("DOMContentLoaded", function(event) {

	class PictureVirtual {
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
				console.log(ele.getElementsByTagName("img"));
				
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

	window.pictureVirtual = new PictureVirtual();
	pictureVirtual.run();



});
