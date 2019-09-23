/**
 * 水球类
 */

export default class {

    constructor( level ) {
        // 等级状态
        this.level = level;
        this.div = null;
        this.img = null;
        this.left = 0;
        this.top = 0;
        this.width = 100;
        this.height = 100;

        // 是当前对象自定义属性，不是原生的click事件，算是我们给当前水滴自定义的一个事件
        this.onclick = function() {};
        this.onboom = function() {};
        
    }

    /**
     * 绘制当前的水球对象到指定的容器中
     */
    draw( wrap ) {
        this.div = document.createElement('div');
        this.div.classList.add('water-polo');
        this.img = document.createElement('img');
        this.img.src = 'img/'+ this.level +'.png';
        this.div.appendChild(this.img);

        this.div.onclick = () => {
            typeof this.onclick === 'function' && this.onclick();
        };

        this.img.addEventListener('animationend', ()=> {
            this.img.classList.remove('level-up');
        });

        wrap.appendChild( this.div );

        this.left = this.div.offsetLeft;
        this.top = this.div.offsetTop;
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        if (this.level > 4) {
            this.level = 0;

            // 爆炸了，分裂出来4个小水滴 - Bullet
            typeof this.onboom === 'function' && this.onboom();
        }
        this.img.classList.add('level-up');
        this.img.src = 'img/'+ this.level +'.png';
    }

}