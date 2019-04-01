styled-components是什么?
  styled-components 是一个常用的 css in js 类库。
  通过 js 赋能解决了原生 css 所不具备的能力，比如变量、循环、函数等。
	
优点:
  对比于sass&less 等预处理可以解决部分 css 的局限性，而且需要对其编译，还有其复杂的 webpack 配置。
  styled-componens 很好的解决了学习成本与开发环境问题，很适合 React 技术栈 && React Native 的项目开发。

缺点: 破坏了原生体验，需要写更多的代码来达到业务要求,

简单学习:
  npm install --save styled-components
  不同的编辑器会有相应的代码提示插件
	
	import styled from 'styled-components';
	
	const HeaderWrapper = styled.div`
		height:58px;
		color:red;
	`
	
	//其他组件中调用,使用方式:
import React, { Component } from 'react';
import { HeaderWrapper } from './style';

class Header extends Component {

    render (){
        return (
            <HeaderWrapper className="aaaa"> 
                
            </HeaderWrapper>
        )
    }
}

export default Header;

* 注意事项: 首字母需要大写;  
HeaderWrapper随机生成了一些 class, 我们也可以自己再通过className添加自己的class

调用外部的数据
const HeaderWrapper = styled.div`
	height:58px;
	width:${ widthData };
	color:red;
`
设置默认参数
HeaderWrapper.defaultProps = {
    widthData: '100%';
}

设置元素属性
export const Logo = styled.a.attrs({"href":'/'})`
position:absolute;
height: 58px;
width: 64px;
border-bottom:1px solid #f0f0f0;
display:block;
background:url(${logoPic});
`;

继承HeaderButton部分样式继承自Button

const Button = styled.button`
    color: #000;
    font-size: 1em;
`;

const HeaderButton = Button.extend`
    border: 2px solid #000;
    border-radius: 3px;
`;

动画
import { keyframes } from 'styled-components';
// CSS 动画
const translates = keyframes`
    from {
        transform: translate(0,0);
    }
    to {
        transform: translate(10,10);
    }
`
const Rotate = styled.button`
    animation: ${translates} 1s linear infinite;
`
  