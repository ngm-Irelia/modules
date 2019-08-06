(function(){
    //Section 1 : 按下自定义按钮时执行的代码
    var a= {
            exec:function(editor){
                var data = article_vo();
                if (data['taskArtInfo.title']=='') {
                    layer.msg('标题不能为空');
                    return
                }
                data['taskArtInfo.artId'] = $("#atc_pid").val();
                //根据id判断是修改还是新增文章
                var title = data['taskArtInfo.title'];
                var content = data['taskArtInfo.content'];
                var pid = data['taskArtInfo.artId'];
                var type = $("#type_id").val();
                content = content.replace(/(<\/?s.*?>)/g, '');
                //内容为空可以保存
                if(content == null || content == ""){
                    content = " ";
                }
                if(data['taskArtInfo.artId']==null||data['taskArtInfo.artId']==""){
                    $.post('./product_folder/addProduct',{'title':title,'content':content,'type':type},function (result) {
                        if(result.code == 200){
                            layer.msg('保存成功');
                        }
                        else if(result.code == 400){
                            layer.msg('保存失败');
                        }
                    })
                }
                else{
                    $.post('./product_folder/updateProduct',{'title':title,'content':content,'pid':pid},function (result) {
                        if(result.code == 200){
                            layer.msg('保存成功');
                            $("#js_search_list li").eq($("#index_i").val()).children(".cont").html(result.message);
                            $("#js_search_list li").eq($("#index_i").val()).children(".tit").html(title);
                            $("#js_search_list li").eq($("#index_i").val()).children(".content_html").html(content);
                            $("#js_search_wenjian li").eq($("#index_i").val()).children(".cont").html(result.message);
                            $("#js_search_wenjian li").eq($("#index_i").val()).children(".tit").html(title);
                            $("#js_search_wenjian li").eq($("#index_i").val()).children(".content_html").html(content);
                            $("#js_del_list li").eq($("#index_i").val()).children(".cont").html(result.message);
                            $("#js_del_list li").eq($("#index_i").val()).children(".tit").html(title);
                            $("#js_del_list li").eq($("#index_i").val()).children(".content_html").html(content);
                        }
                        else if(result.code == 400){
                            layer.msg('保存失败');
                        }
                    })
                }
            }
        },
        //Section 2 : 创建自定义按钮、绑定方法
        b='linkbutton';
    CKEDITOR.plugins.add(b,{
        init:function(editor){
            editor.addCommand(b,a);
            editor.ui.addButton('linkbutton',{
                label:'保存',
                icon: this.path + 'save_color.png',
                command:b
            });
        }
    });
})();