$(function(){
  
  window.view = {
    auditUrl:  "http://localhost:8081", // "http://172.16.87.124:8081",
    /**
     * 
     * @param {*} ids 显示地图的 dom元素id
     * @param {*} bank 暂留，若要页面一开始进来。不显示南京银行，可以使用
     */
    initMap:function(ids, bank){
      let v = this;
      $.ajax({
        type: "POST",
        url: v.auditUrl+"/audit_nj/riskview/getMap",
        data: {
          branchName:"南京银行",
          level:"1"
        },
        dataType: "json",
        success: function(returndata){
          if(returndata.code === 200){
            v.showMap(ids,returndata.data.models);//加载地图，第二个参数放数据 ； 地图部分数据应该做好处理，分三级，还是发三次请求   
          } 
        }
      }); 

    },
    /**
      * 加载地图的方法
      * @param {*} ids        显示地图的元素id
      * @param {*} showDatas  地图上显示的数据
      */
     showMap:function(ids,showYHGisData){
      let v =this;
      let showingProvince = {};// 正在使用的省数据
      let showingCity = {}; // 正在使用的市数据
      let showingProvinceNoClick = {};// 正在使用的数据,去掉其本身点击的范围

      let upperArr = []; //上一级的地图和数据
      let showingMapLevel = 1; //正在展示的地图级别
      let showingAreaIdLength = 0; // 正在显示的范围

      $.get('../javascripts/common/mapdata/china.json', function(chinaJson) {
   
        var baseRegions =  chinaJson.features.map(item => {// 获得每个市的名字，用来处理地图的颜色

          if(item.properties.name === '中华人民共和国'){
            
            return {
              maplevel:1,
              id: item.properties.id,
              cp: item.properties.cp,
              name: item.properties.name, //params.data[2].name item.properties.name
              itemStyle: {
                normal: {
                  areaColor: 'rgba(11,15,30, 1)',
                  borderColor: 'rgba(23,68,138, 1)',
                  borderWidth: 0,
                  shadowColor: 'rgba(20,64,111, 1)',
                  shadowBlur: 65,
                  shadowOffsetX: 0
                },
                emphasis: {
                  areaColor: 'rgba(11,15,30, 1)', //2a333d
                  color: '#CEE3FE'
                }
              }
            };
          }
          return {
            maplevel:2,
            id: item.properties.id,
            cp: item.properties.cp,
            name: item.properties.name, //params.data[2].name item.properties.name
            itemStyle: {
              normal: {
                areaColor: 'rgba(11,15,30, 1)',
                borderColor: 'rgba(20,55,111, 1)',
                borderWidth: 1,
                shadowColor: 'rgba(20,64,111, 1)',
                shadowBlur: 0,
                shadowOffsetX: 0
              },
              emphasis: {
                areaColor: 'rgba(11,15,30, 1)', //2a333d
                color: '#CEE3FE'
              }
            }
          };
        } );

        //showingProvince = chinaJson;
        showingProvince = JSON.parse(JSON.stringify(chinaJson)); //深拷贝
        echarts.registerMap('china', chinaJson);
        var chart = echarts.init(document.getElementById(ids));
    
        
        option = {
          geo: {
            regions: baseRegions,
            map: 'china',
            top:'25%',
            left:'right',
            roam:false,
            center: [115.97, 29.71],
            label: {
              normal: {
                show: true,
                color: '#CEE3FE'
              },
              emphasis: {
                show: false,
                color: '#CEE3FE'
              },
            },
            itemStyle: {
              normal: {
                areaColor: '#10182A',
                borderColor: '#155DA3',
                borderWidth: 1.5,
                shadowColor: 'rgba(20,64,111, 1)',
                shadowBlur: 5,
                shadowOffsetX: 1
              },
              emphasis: {
                areaColor: '#10182A', //2a333d
                color: '#CEE3FE'
              }
            }
          },
          series: [{
                name: 'yh',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: showYHGisData,
                symbolSize: function (val) {
                    return 12;
                },
                showEffectOn: 'render',
                rippleEffect: {
                    brushType: 'stroke'
                },
                hoverAnimation: false,
                label: {
                  normal: {
                    formatter: function(value){
                      return value.value[2].name
                    },
                    position: 'right',
                    show: false
                  }
                },
                itemStyle: {
                  normal: {
                    color: 'red',
                    shadowBlur: 10,
                    shadowColor: '#333'
                  }
                },
                zlevel: 1
          }]
      
        };
        chart.setOption(option);
         
        chart.on('click', {seriesName: 'yh'}, function (params) { //点击的点 
          //dblClickCommon(params, "point");
        });
        chart.on("dblclick",function(params){   // 点击的地图 
          dblClickCommon(params, "map");
        })

        /**
         * 双击事件
         * @param {*} params 点击节点的信息
         * @param {*} clickType 暂留，用来处理不同点击类型时，使用
         */
        function dblClickCommon(params, clickType){
          var provience;
          var clickBank;
          var bankLevel = 1;

          if(params.componentType === "geo"){ // 点击 地图
            //双击地图的操作，就是返回上一级
            if(showingMapLevel == 1){
              return '';
            }
            if(showingMapLevel > 2){ // here 重点，因为点击地图，就是跳到上一级，在这去掉upperArr的最后一位
              upperArr.pop();
            }
            
            let uaLen = upperArr.length;
            setMapLevel(showingMapLevel-1, upperArr[uaLen-1].upperData, upperArr[uaLen-1].upperMap, upperArr[uaLen-1].upperBank, "map");
            return '';
          }else if(params.componentType === "series"){//点击 点
            clickBank = params.data[2].name ;
            bankLevel = params.data[2].level ;
            provience = showingProvince.features.filter( item => item.properties.name===params.data[2].address);//获得chinaJson数据
 
          }
          
          if(!provience|| provience.length <=0 ){ // 市级id
            //最后在 showingCity中判断一下哦
            //有，则是第四层， 无则返回到第一层
            let city = showingCity.features.filter( item => item.properties.name===params.data[2].address);//获得chinaJson数据

            //params.region.maplevel == 4  level:4 
            if( params.data[2].level && params.data[2].level === 4 ){
              setMapLevel(1, '', '','');
              return '';
            }
            if(!city|| city.length <=0 ){
              setMapLevel(1, '', '','');
            }else{
              let cityParams = {
                region : {
                  maplevel:4,
                  id: city[0].properties.id,
                  cp: city[0].properties.cp,
                  name: city[0].properties.name,
                  level:bankLevel
                }
              };
              if(showingMapLevel == 4){
							
              }else{
                let upperArrLen = upperArr.length;
                setMapLevel(4, cityParams, upperArr[upperArrLen-1].upperMap, upperArr[upperArrLen-1].upperBank,"point");
              }
            }
            return '';
          }

          // 根据id长度，判断如果是点击的相邻的区域，返回上一层
          if(showingAreaIdLength >= provience[0].properties.id.length ){
            //返回上一级 
            let upperArrLen = upperArr.length;
					  setMapLevel(showingMapLevel - 1, upperArr[upperArrLen-1].upperData, upperArr[upperArrLen-1].upperMap, upperArr[upperArrLen-1].upperBank,"map");
					  return '';
          }else if(showingAreaIdLength < provience[0].properties.id.length){
            //跳转下一级
            showingAreaIdLength = provience[0].properties.id.length;
          }
          let mnParams = {
            region : {
              maplevel:0,
              id: provience[0].properties.id,
              cp: provience[0].properties.cp,
              name: provience[0].properties.name,
              level:bankLevel
            }
          };

          if(parseInt(mnParams.region.id)>3200 && parseInt(mnParams.region.id)<3300){//市范围 
            setMapLevel(3, mnParams, '../javascripts/common/mapdata/geometryCouties/'+mnParams.region.id+'00.json',clickBank,"point");
          }else if(parseInt(mnParams.region.id)>99){	//全国范围
            setMapLevel(1, mnParams, '','',"point");
          }else{//第二层 省范围
            setMapLevel(2, mnParams, '../javascripts/common/mapdata/geometryProvince/'+mnParams.region.id+'.json', clickBank,"point");
          }
        }

        /**
         * 显示不同级别的底图
         * @param {*} level      地图的级别
         * @param {*} params     地图点击点的信息
         * @param {*} jsonUrl    地图的url
         * @param {*} baseBank   当前的银行名称
         * @param {*} clickType  点击的类型
         */
        function setMapLevel(level,params,jsonUrl , baseBank, clickType){
          var newRegions;
           
          if(level == 4){//第4级 单纯放大地图
            newRegions =  [{ // 获得每个市的名字，用来处理地图的颜色
              maplevel:level,
              id: params.region.id,
              cp: params.region.cp,
              name: params.region.name,
              itemStyle: {
                normal: {
                  areaColor: 'rgba(11,15,30, 1)',
                  borderColor: 'rgba(57,91,168, 1)',
                  borderWidth: 2,
                  shadowColor: 'rgba(20,64,111, 1)',
                  shadowBlur: 5,
                  shadowOffsetX: 1
                },
                emphasis: {
                  areaColor: 'rgba(11,15,30, 1)', //2a333d
                  color: '#CEE3FE'
                }
              }
            }];

            //获取第三级的数据（todo） 发送请求
            if(baseBank){
              $.ajax({
                type: "POST",
                url: v.auditUrl+"/audit_nj/riskview/getMap",
                data: {
                  branchName:baseBank,
                  level:params.region.level
                },
                dataType: "json",
                success: function(returndata){
                  if(returndata.code === 200){
                    let mapData = returndata.data.models;
                    chart.setOption({
                      geo:{
                        zoom: 100,
                        scaleLimit: {
                          min: 1,
                          max:120
                        },
                        regions: newRegions
                      },
                      series: [{
                        data: mapData
                      }]
                    });

                    deleteUpperArr(clickType); // 重点
                  } 
                }
              });
            }
     
          }

          if(level == 3){//第三级 市范围
            $.get(jsonUrl, function(getJson){
              newRegions =  getJson.features.map(item => {// 获得每个市的名字，用来处理地图的颜色
                return {
                  maplevel:level,
                  id: item.properties.id,
                  cp: item.properties.cp,
                  name: item.properties.name,
                  itemStyle: {
                    normal: {
                      areaColor: 'rgba(11,15,30, 1)',
                      borderColor: 'rgba(57,91,168, 1)',
                      borderWidth: 2,
                      shadowColor: 'rgba(20,64,111, 1)',
                      shadowBlur: 5,
                      shadowOffsetX: 1
                    },
                    emphasis: {
                      areaColor: 'rgba(11,15,30, 1)', //2a333d
                      color: '#CEE3FE'
                    }
                  }
                };
              } );

              var newChinaJson = JSON.parse(JSON.stringify(showingProvinceNoClick)); //深拷贝
              var dealJsonNew = dealNewJson(newChinaJson, params.region.id); //去掉了点击的省，防止覆盖
              dealJsonNew.features = dealJsonNew.features.concat(getJson.features);
              
              showingCity = dealJsonNew;  // 保存正在使用的市数据
              echarts.registerMap('newChinaMap', dealJsonNew);
    
              //获取第三级的数据（todo） 发送请求
              if(baseBank){
                $.ajax({
                  type: "POST",
                  url: v.auditUrl+"/audit_nj/riskview/getMap",
                  data: {
                    branchName:baseBank,
                    level:params.region.level
                  },
                  dataType: "json",
                  success: function(returndata){
                    if(returndata.code === 200){
                      let mapData = returndata.data.models;
                      chart.setOption({
                        geo:{
                          map:'newChinaMap',
                          zoom: 30,
                          scaleLimit: {
                            min: 1,
                            max:50
                          },
                          roam:true,
                          center:params.region.cp, // 通过id获得其中心点 todo
                          itemStyle: {
                            normal: {
                              areaColor: 'rgba(16,24,42,0.3)', //#10182A
                              borderColor: 'rgba(21,93,163,0.3)',//#155DA3
                              borderWidth: 0.5,
                              shadowColor: 'rgba(20,64,111, 0.3)',
                              shadowBlur: 1,
                              shadowOffsetX: 1
                            },
                            emphasis: {
                              areaColor: '#10182A', //2a333d
                              color: '#CEE3FE'
                            }
                          },
                          regions: newRegions
                        },
                        series: [{
                          data: mapData
                        }]
                      });

                      deleteUpperArr(clickType); // 重点
                    } 
                  }
                });
              }
    
            });
          }

          if(level == 2){//第二级 省范围
            $.get(jsonUrl, function(provienceJson){
              newRegions =  provienceJson.features.map(item => {// 获得每个市的名字，用来处理地图的颜色
                return {
                  maplevel:level,
                  id: item.properties.id,
                  cp: item.properties.cp,
                  name: item.properties.name,
                  itemStyle: {
                    normal: {
                      areaColor: 'rgba(11,15,30, 1)',
                      borderColor: 'rgba(57,91,168, 1)',
                      borderWidth: 2,
                      shadowColor: 'rgba(20,64,111, 1)',
                      shadowBlur: 5,
                      shadowOffsetX: 1
                    },
                    emphasis: {
                      areaColor: 'rgba(11,15,30, 1)', //2a333d
                      color: '#CEE3FE'
                    }
                  }
                };
              } );
              var newChinaJson = JSON.parse(JSON.stringify(chinaJson)); //深拷贝
              showingProvinceNoClick = dealNewJson(newChinaJson, params.region.id); //去掉点击的点，所在的区域，防止覆盖
              showingProvinceNoClick.features = showingProvinceNoClick.features.concat(provienceJson.features);
              
              showingProvince.features = newChinaJson.features.concat(provienceJson.features); // here～ 保存下完整json，用来获取id哦
              
              echarts.registerMap('newChinaMap', showingProvinceNoClick);

              //todo 请求获取 第二级 数据
              if(baseBank){
                $.ajax({
                  url: v.auditUrl+"/audit_nj/riskview/getMap",
                  type: "POST",
                  data: {
                    branchName:baseBank,
                    level:params.region.level
                  },
                  dataType: "json",
                  success: function(returndata){
                    if(returndata.code === 200){
                      let mapData = returndata.data.models;

                      chart.setOption({
                        geo:{
                          map:'newChinaMap',
                          zoom: 7,
                          scaleLimit: {
                            min: 1,
                            max:20
                          },
                          roam:true,
                          center:params.region.cp, // 通过id获得其中心点 todo
                          itemStyle: {
                            normal: {
                              areaColor: 'rgba(16,24,42,0.3)', //#10182A
                              borderColor: 'rgba(21,93,163,0.3)',//#155DA3
                              borderWidth: 0.5,
                              shadowColor: 'rgba(20,64,111, 0.3)',
                              shadowBlur: 1,
                              shadowOffsetX: 1
                            },
                            emphasis: {
                              areaColor: '#10182A', //2a333d
                              color: '#CEE3FE'
                            }
                          },
                          regions: newRegions
                        },
                        series: [{
                          data: mapData
                        }]
                      });

                      deleteUpperArr(clickType); // 重点
                    } 
                  }
                }); 
              }

            });
          }

          if(level == 1){
            baseBank = "南京银行";
            $.ajax({
              type: "POST",
              url: v.auditUrl+"/audit_nj/riskview/getMap",
              data: {
                branchName:"南京银行",
                level:"1"
              },
              dataType: "json",
              success: function(returndata){
                if(returndata.code === 200){
                  let mapData = returndata.data.models;

                  chart.setOption({
                    geo:{
                      regions:baseRegions,
                      map: 'china',
                      zoom: 1,
                      scaleLimit: {
                        min: 1,
                        max:10
                      },
                      top:'25%',
                      left:'right',
                      roam:false,
                      center: [115.97, 29.71],
                      label: {
                        normal: {
                          show: true,
                          color: '#CEE3FE'
                        },
                        emphasis: {
                          show: false,
                          color: '#CEE3FE'
                        },
                      },
                      itemStyle: {
                        normal: {
                          areaColor: '#10182A',
                          borderColor: '#155DA3',
                          borderWidth: 1.5,
                          shadowColor: 'rgba(20,64,111, 1)',
                          shadowBlur: 5,
                          shadowOffsetX: 1
                        },
                        emphasis: {
                          areaColor: '#10182A', //2a333d
                          color: '#CEE3FE'
                        }
                      }
                    },
                    series: [{
                      data: mapData
                    }]
                  });

                  deleteUpperArr(clickType); // 重点
                } 
              }
            }); 
            
          }

          window.getBaseData('','',baseBank);

          showingAreaIdLength = level*2-2;
          showingMapLevel = level;
          
          /**
           * 
           * @param {*} ctype 点击的类型
           */
          function deleteUpperArr(ctype){
            if(ctype === "map"){
             
            }else{
              dealUpperArr(level * 2 - 2, level, jsonUrl, params, baseBank);
            }
            
            if(level == 1){
              upperArr=[];
              dealUpperArr(level * 2 - 2, level, jsonUrl, params, baseBank);
            }
          }

        }

        //修改地图的json，去掉要显示的省，防止覆盖
        /**
         * 
         * @param {*} oldJson   地图json数据
         * @param {*} provienceId  需要去掉的区域的id
         */
        function dealNewJson(oldJson, provienceId){
          var todealJson = JSON.parse(JSON.stringify(oldJson)); //深拷贝
          var newJson = { };
          newJson.features =  todealJson.features.filter( item => {// 获得每个市的名字，用来处理地图的颜色
            return  item.properties.id !== provienceId & item.properties.name != '中华人民共和国'
          } ); 
          return newJson;
        }

        /**
         * 
         * @param {*} showIdLength  地图中id的长度
         * @param {*} showLevel      地图的级别
         * @param {*} uMap           地图json的url
         * @param {*} uData          当前区域的信息 
         * @param {*} baseBank       当前级别的银行
         */
        function dealUpperArr(showIdLength,showLevel,uMap,uData,baseBank){
          upperArr.push({
            showingAreaIdLength : showIdLength,
            showingMapLevel : showLevel,
            upperMap : uMap,
            upperData : uData,
            upperBank: baseBank
          });

        }
        
      });
    },
      
    /**
     * 解析search的值，转为json对象
     * @param {*} search window.location.search
     */
    dealSearch:function (search){
      if(search && search.indexOf("?")!=-1) { 
        var str = search.substring(1);
        var strs = str.split("&"); 
        var searchJson = {};
        for(var i=0;i<strs.length;i++){ 
          searchJson[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
        }
        return searchJson;
      }
    },
    /**
     * 封装fetch请求，统一处理权限和session过期的问题
     * @param {string} url 
     * @param {object} options 
     * @example window.view.fetch(url, options);
     */
    fetch: function (url, options) {
      let result = {
        code: 200,
        msg: "",
        data: []
      }

      return new Promise((resolve, reject) => {
        fetch(url, options)
          .then(res => {
            if (res.ok) {
              return res.json();
            }
            throw new Error('数据请求失败');
          })
          .then(json => {
            // if (json.code == 407) {
            //   //407:没权限  提示信息
            //   return alert(json.msg);
            // } else if (json.code == 401) {
            //   //401:session过期或未登录 跳转到登录页面
            //   return location.href = '/login';
            // }
            resolve(json);
          })
          .catch((err) => {
            result.code = 500;
            result.msg = "数据请求失败";
            reject(result);
          });
      });
    }

  }


})