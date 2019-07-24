

(function() {
	
	class userGroup{
		constructor(config){
			this.config = config;
			console.log(config);

			this.run();
		}

		run (){
			let _that = this;
			let domHtml = ``;


			let baseImg = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTYzOTY3NDA3MDcxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI4OTEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTc1OS44NSA4NTAuMzNjLTEyLjQzIDAtMjMuODgtOC4yNi0yNy41LTIwLjk2QzcwMy40MiA3MjcuOSA2MTIuNjkgNjU3LjAyIDUxMS43IDY1Ny4wMmMtMTAyLjAyIDAtMTkwLjU2IDY4Ljc3LTIyMC4zIDE3MS4xMy00LjQ2IDE1LjM1LTIwLjMyIDI0LjE1LTM1LjU1IDE5LjYyLTE1LjE2LTQuNTEtMjMuODUtMjAuNjItMTkuMzktMzUuOTcgMzYuOTctMTI3LjI0IDE0Ny41OC0yMTIuNzMgMjc1LjIzLTIxMi43MyAxMjYuMzUgMCAyMzkuNzEgODguMSAyNzUuNjcgMjE0LjI1IDQuMzggMTUuMzctNC4zOCAzMS40My0xOS41OCAzNS44Ny0yLjY0IDAuNzctNS4zMSAxLjE0LTcuOTMgMS4xNHoiIHAtaWQ9IjI4OTIiPjwvcGF0aD48cGF0aCBkPSJNNTE0LjI1IDY1Ny43M2gtNi44OGMtNzcuMDQgMC0xMzkuNzItNjMuNDMtMTM5LjcyLTE0MS4zOXYtODQuMjJjMC03Ny45NiA2Mi42OC0xNDEuMzkgMTM5LjcyLTE0MS4zOWg2Ljg4Yzc3LjA0IDAgMTM5LjcyIDYzLjQzIDEzOS43MiAxNDEuMzl2ODQuMjJjMCA3Ny45Ny02Mi42OCAxNDEuMzktMTM5LjcyIDE0MS4zOXogbS02Ljg4LTMwOS4wNWMtNDUuNDcgMC04Mi40NiAzNy40My04Mi40NiA4My40NHY4NC4yMmMwIDQ2LjAxIDM2Ljk5IDgzLjQ0IDgyLjQ2IDgzLjQ0aDYuODhjNDUuNDcgMCA4Mi40Ni0zNy40MyA4Mi40Ni04My40NHYtODQuMjJjMC00Ni4wMS0zNi45OS04My40NC04Mi40Ni04My40NGgtNi44OHoiIHAtaWQ9IjI4OTMiPjwvcGF0aD48cGF0aCBkPSJNNTEyIDk0Ni42QzI3NS4xOCA5NDYuNiA4Mi41MSA3NTEuNjUgODIuNTEgNTEyUzI3NS4xOCA3Ny40IDUxMiA3Ny40IDk0MS40OSAyNzIuMzUgOTQxLjQ5IDUxMiA3NDguODIgOTQ2LjYgNTEyIDk0Ni42eiBtMC04MTEuMjZjLTIwNS4yNSAwLTM3Mi4yMiAxNjguOTctMzcyLjIyIDM3Ni42NlMzMDYuNzUgODg4LjY2IDUxMiA4ODguNjYgODg0LjIyIDcxOS42OSA4ODQuMjIgNTEyIDcxNy4yNSAxMzUuMzQgNTEyIDEzNS4zNHoiIHAtaWQ9IjI4OTQiPjwvcGF0aD48L3N2Zz4=';

			//  
			let configModule = [];
			if(_that.config.config){
				configModule = _that.config.config;
			}
			
			let cmHtml = ``;

			configModule.forEach( (item, index)=>{
				cmHtml+= `<li id="ct-userGroup-menu-item-plus-${index}" class="ct-userGroup-menu-item"  data-type="0" >${item.name}</li>`
			})

			domHtml+=`
			<div id="ct-userGroup">
				<img id="ct-userGroup-img" src="${_that.config.img? _that.config.img : baseImg}" onerror="javascript:this.src='${baseImg}';" width="21" height="22" />
				<span id="ct-userGroup-user">
					<span>${_that.config.user}</span>
					<span id="ct-userGroup-span"></span>
				</span>
				<ul id="ct-userGroup-menu">

						${ cmHtml ? cmHtml+'<li class="ct-userGroup-li-line"></li>' : ''}
						<li class="ct-userGroup-menu-item"  data-type="0" ><a href="${_that.config.logout.url}">${_that.config.logout.name ?_that.config.logout.name : "登出"}</a></li>
				</ul>
			</div>
			`;

			document.getElementById(_that.config.domId).innerHTML = domHtml;

			let userGroupSign = false;

			configModule.forEach( (item, index)=>{
				document.getElementById("ct-userGroup-menu-item-plus-"+index).addEventListener("click",item.callback );
			})
			

			//事 件   图片 和 用户名 点击显示下方菜单
 			document.getElementById('ct-userGroup-img').addEventListener('click',function(e){
				e.stopPropagation();
				changeUserGroup();
			})

			document.getElementById('ct-userGroup-user').addEventListener('click',function(e){
				e.stopPropagation();
				changeUserGroup();
			})

			function changeUserGroup(){
				if(!userGroupSign){
					document.getElementById('ct-userGroup-menu').style.display = 'block';
					userGroupSign = true;
				}else{
					document.getElementById('ct-userGroup-menu').style.display = 'none';
					userGroupSign = false;
				}
			}

			document.addEventListener('click',function(){
				document.getElementById('ct-userGroup-menu').style.display = 'none';
				userGroupSign = false;
			})

		}

	}

	window.userGroup = function(){
		return (new userGroup(...arguments));
	}


	window.userGroup({
		domId:"userGroup-box",
		user:"用户Akbuser",
		logout:{
			url: "http://www.baidu.com",
			name:"登出"
		},
		img:"../modules/analytic/typeicon/收藏.png",
		config:[
			{
				name:"设置",
				callback:function(){
					console.log("设置回调")
				}
			},
			{
				name:"换肤",
				callback:function(){
					console.log("换肤回调")
				}
			}
		]
	});

})()

