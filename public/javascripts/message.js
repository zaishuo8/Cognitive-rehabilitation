$(document).ready(function(){
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    // 更新信息前端验证
    $("h5.tip").css("display","none");

    function dnametest() {
        var dname = $("#dname").val();
        var patt2=new RegExp("^[\u4e00-\u9fa5]{0,}$");
        if(dname == ''){
            $("#dnametip1").css("display","block");
            $("#dnametip2").css("display","none");
            return false;
        }else if(!patt2.test(dname)){
            $("#dnametip1").css("display","none");
            $("#dnametip2").css("display","block");
            return false;
        }else {
            $("#dnametip1").css("display","none");
            $("#dnametip2").css("display","none");
            return true;
        }
    }

    $("#dname").blur(dnametest);

    $("form#upddoc").submit(function(e){
        if(!dnametest()){
            e.preventDefault();
        }
    });


    //修改密码前端验证
    function oldpwdtest() {
        var oldpwd = $("#oldpwd").val();
        $.get("/oldpwdajax",{oldpwd:$("#oldpwd").val()},function (res) {      //??ajax请求6次后就不继续请求了??
            $("#isoldpwd").text(res);
        });
        if($("#isoldpwd").text()=='') return true;
        else return false;
    }
    function ppwd1test() {
        var ppwd1 = $("#ppwd1").val();
        if(ppwd1.length<6 || ppwd1.length>12){
            $("#ppwd1tip").css("display","block");
            return false;
        }else{
            $("#ppwd1tip").css("display","none");
            return true;
        }
    }
    function ppwd2test() {
        var ppwd1 = $("#ppwd1").val();
        var ppwd2 = $("#ppwd2").val();
        if(ppwd1 != ppwd2){
            $("#ppwd2tip").css("display","block");
            return false;
        }else {
            $("#ppwd2tip").css("display","none");
            return true;
        }
    }

    $("#oldpwd").blur(oldpwdtest);
    $("#ppwd1").blur(ppwd1test);
    $("#ppwd2").blur(ppwd2test);

    $("form#changepwd").submit(function(e){
        if(!(oldpwdtest() && ppwd1test() && ppwd2test())){
            e.preventDefault();
        }
    });

    //更换头像,保存头像前,将选中图片显示到图片框里
    $("input[type='file']").change(function () {
        var formElement = document.getElementById("uploadpic");
        var formData = new FormData(formElement);
        $.ajax({
            url : '/uppicajax',
            type : 'POST',
            data : formData,
            async: false,
            cache: false,
            // 告诉jQuery不要去处理发送的数据
            processData : false,
            // 告诉jQuery不要去设置Content-Type请求头
            contentType : false,
            success: function(res) {
                $("#prepic").attr("src",res);
            },
            error: function(res) {
                alert("error");
            }
        });
    });
});

function goBack()
{
    window.history.back()
}