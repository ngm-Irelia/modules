document.addEventListener("DOMContentLoaded", function(event) {
  // 使用时，传入对应参数，使用即可
  //模拟data
  var data = [
    {
      id:"111",
      name:"中国",
      number:1399
    },{
      id:"999",
      name:"中国2",
      number:999
    },{
      id:"888",
      name:"中国",
      number:888
    },{
      id:"777",
      name:"中国",
      number:777
    },{
      id:"666",
      name:"中国",
      number:666
    },{
      id:"555",
      name:"中国",
      number:555
    },{
      id:"444",
      name:"中国",
      number:444
    }
  ]

  /**
   * 加载函数
   * @param showId 数据需要显示的父id
   * @param data 显示的数据
   */

  let cl = new Components.BarChart();
  cl.run("showarea",data);
});