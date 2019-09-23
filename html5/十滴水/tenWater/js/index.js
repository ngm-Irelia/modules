// import m from './m.js';

// console.log('index.js', m);

/**
 * 把我们要做的东西抽象成一个个的对象（类）
 * 
 * Game：游戏类，控制游戏的分数，状态，游戏容器，提供开始和结束等功能
 * WaterPolo：水球（水滴），宽、高、状态（等级），升级，爆炸
 * Bullte：分裂出来的小水滴，宽、高、状态（方向），移动速度，移动，碰撞，销毁
 */

import Game from './Game.js';

Game.wrap = document.querySelector('#wrap');
Game.txt = document.querySelector('#txt');
Game.gameLevelDom = document.querySelector('#next-level');

Game.start();

//下一关事件

Game.gameLevelDom.addEventListener('click',function(){
	Game.nextStart();
	document.querySelector('#game-level').innerHTML = Game.gameLevel;
	
	Game.gameLevelDom.style.display = 'none';
})