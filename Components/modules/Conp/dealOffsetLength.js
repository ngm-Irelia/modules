class DealOffsetLength {

  // 使用说明， 获取 ol 的时候，可以有标签。
  // 根据 ol 添加标签的时候，需要原来没有 标签， 统一添加标签！

  constructor(){
     this.Oselect = { //引用句子的offset和length
      offset : 0,
      length : 0
    }
  }


  /**
   * 调用方法
   * @param {string} sign 表示获取 还是 设置  get：获取 set：设置 
   * @param {*} config 获取offset和length 需要的一些信息，主要是window.getSelection()里面的属性~ 还有其他需要的字段
   * config = {
   *  baseHtml 正文
   *  targetNode 正文外层包裹的容器
   *  HtmlTag 可指定标签作为包裹选中文本的容器
   * }
   * 
   * 
   */
  run(sign,config){
    if(sign === "get"){
      this.getOL(config); // 我在想怎么能写的你们看不懂 ！！
    }else if(sign === 'set'){
      this.setOL(config);
    }


  }


  /**
   * 获取
   * config ： baseHtml 
   */
  getOL(config){
    let that_ = this;
    if(config.hasOwnProperty('baseHtml')){
      let select = window.getSelection();
      let selecter = select.toString();
      if(selecter.trim() !== ''){
        let range = select.getRangeAt(0);
        let anchorNode = select.anchorNode;//选区开始节点
        let anchorOffset = select.anchorOffset;//基于起始节点的偏移量 需要判断选区是否含有其他标签，且判断是否在选区开头
        let startToAnchorHtml= ''; 
        function getStartToAnchorLen(anchorNode){
          let parentNode = anchorNode.parentNode;
          let childNodes = parentNode.childNodes;
          let anchorIndex = Array.prototype.indexOf.call(childNodes, anchorNode);
          for(let i = 0; i<anchorIndex; i++){
            //判断不同类型的子节点
            if(childNodes[i].nodeName == 'BR'){
              startToAnchorHtml += '<br>';
            }else if(childNodes[i].nodeName !== 'BR' && childNodes[i].nodeType == 1){
              startToAnchorHtml += childNodes[i].innerHTML;
            }else if(childNodes[i].nodeType == 3){
              startToAnchorHtml += childNodes[i].nodeValue;
            }
          }
          if(parentNode == config.targetNode){
              return;
          }else{
              getStartToAnchorLen(parentNode);
          }
        }
        getStartToAnchorLen(anchorNode);
        let startToAnchorLen = startToAnchorHtml.replace(/<(?!br).*?>/g,'').length; //根据起始节点得到之前到文段开始的距离
        that_.Oselect.offset = startToAnchorLen + anchorOffset;
        that_.Oselect.length = selecter.length;
        console.log('offset:',that_.Oselect.offset,'len' ,that_.Oselect.length)


        //将选中的文本高亮
        let spanNode = document.createElement(config.HtmlTag);
        spanNode.style.background = 'red';
        spanNode.appendChild(range.extractContents());
        range.insertNode(spanNode);


      }
      
    }else{
      alert('没有传入html片段！');
    }




  }
  /**
   * 数据对象按照某个属性值倒序排列（插入排序）
   * @param {*} arr 
   * @param {*} property 
   */
  ArrayObjSort(arr, property){
    for(let i = 1 ;i < arr.length; i++){
      let j = i;
      let target = arr[j];
      while(j > 0 && target[property] > arr[j - 1][property]){
        arr[j] = arr[j - 1];
        j--;
      }
      arr[j] = target;
    }
    return arr;
  }
  /**
   * 合并数组并去重（两个数组）
   * @param {*} arr1 
   * @param {*} arr2 
   */
  MergeArray(arr1, arr2){
    let arr_ = [];
    arr_.push(...arr1);
    for(let i = 0; i< arr2.length;i++){
      var flag = true;
      for(let j = 0; j < arr1.length; j++){
        if(arr2[i] == arr1[j]){ //相等则直接退出循环跳到下一次顶层循环
          flag = false;
          break;
        }else{ //不相等则退出当前循环继续下一次循环
          flag = true;
          continue;
        }
      }
      if(flag){
        arr_.push(arr2[i]);
      }
    }
    return arr_;
  }
  /**
   * 设置
   */
  setOL(config){
    let that_ = this;
    let targetNodeHtml = config.targetNode.innerHTML;
    if(config.OffsetLenList.length == 0 || config.OffsetLenList == null || config.OffsetLenList == undefined){
      return ;
    }
    //根据offset倒序排列
    let SortOffList = that_.ArrayObjSort(config.OffsetLenList, 'offset');

    for(let i in SortOffList){
      SortOffList[i]['endOffset'] = SortOffList[i]['offset'] + SortOffList[i]['length'];
    }

    for(let i = 0 ;i < SortOffList.length - 1; i++) {
      //两两比较
      if(SortOffList[i + 1].endOffset > SortOffList[i].offset){ //有交叉 

        if(SortOffList[i + 1].endOffset < SortOffList[i].endOffset){//有交叉 
          //step 1  新节点设置
          let newObj = {};
          newObj.offset = SortOffList[i].offset;
          newObj.length = Math.abs(SortOffList[i + 1].endOffset - SortOffList[i].offset);//绝对值
          newObj.endOffset = newObj.offset + newObj.length;
          newObj.class = that_.MergeArray(SortOffList[i].class, SortOffList[i + 1].class);
          //step 2 第一个节点信息设置
          SortOffList[i].length = SortOffList[i].length - (SortOffList[i + 1].endOffset - SortOffList[i].offset );
          SortOffList[i].offset = SortOffList[i + 1].endOffset;
          //step 3 第二个节点信息设置
          SortOffList[i + 1].length = SortOffList[i + 1].length - newObj.length;
          SortOffList[i + 1].endOffset = newObj.offset; 

          SortOffList.splice( i+1, 0, newObj);
        }else{//有嵌套
          //step 1  新节点设置
          let newObj = JSON.parse( JSON.stringify(SortOffList[i]) );
          newObj.class = that_.MergeArray(SortOffList[i].class, SortOffList[i + 1].class);
          //step 2 第一个节点信息设置
          SortOffList[i].length = SortOffList[i+1].endOffset - SortOffList[i].endOffset;
          SortOffList[i].offset = SortOffList[i].endOffset;
          SortOffList[i].endOffset = SortOffList[i+1].endOffset;
          //step 3 第二个节点信息设置
          SortOffList[i + 1].length = newObj.offset - SortOffList[i + 1].offset;
          SortOffList[i + 1].endOffset = newObj.offset; 

          SortOffList.splice( i+1, 0, newObj);
        }
        
      }else{
        continue;
      }
    }
    
    //查看数组是否有不符合要求的顺序！， 有， 重新调用setOL
    let hasFalseNode = false;
    for(let h=0;h<SortOffList.length-1;h++){
      if(SortOffList[h].offset < SortOffList[h + 1].endOffset){
        hasFalseNode = true;
      }
    }

    if(hasFalseNode){
      config.OffsetLenList = SortOffList;
      that_.setOL(config);
    }else{
      
      //多次拆分数组，导致会有length = 0 的数据，去掉它们~
      for(let h=SortOffList.length-1;h>=0;h--){
        if(!SortOffList[h].length){
          SortOffList.splice( h, 1);
        }
      }

      let targetNodeArr = targetNodeHtml.split('');
      SortOffList.map((v,i)=>{
        let oldStr = targetNodeHtml.substr(v.offset, v.length);
        let newStr = `<em class="${v.class.join(' ')}">${oldStr}</em>`;
        targetNodeArr.splice(v.offset, v.length, newStr);
      });
      config.targetNode.innerHTML = targetNodeArr.join('');
    }

  }




}


window.dealOffsetLength = new DealOffsetLength();


