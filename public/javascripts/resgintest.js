/**
 * Created by xuting on 2016/11/9.
 */
$(document).ready(function(){
    $("h5.tip").css("display","none");

    function pnumtest() {
        var pnum1 = $("#pnum").val();
        var patt1=new RegExp("[0-9]{5}");
        if(pnum1.length!=5 || !patt1.test(pnum1)){
            $("#pnumtip").css("display","block");
            $("#resgined").text('');
            return false;
        }else{
            $("#pnumtip").css("display","none");
            $.get("/pajax",{pnum:$("#pnum").val()},function (res) {      //??ajax请求6次后就不继续请求了??
                $("#resgined").text(res);
            });
            if($("#resgined").text()=='') return true;
            else return false;
        }
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
    function pnametest() {
        var pname = $("#pname").val();
        var patt2=new RegExp("^[\u4e00-\u9fa5]{0,}$");
        if(pname == ''){
            $("#pnametip1").css("display","block");
            $("#pnametip2").css("display","none");
            return false;
        }else if(!patt2.test(pname)){
            $("#pnametip1").css("display","none");
            $("#pnametip2").css("display","block");
            return false;
        }else {
            $("#pnametip1").css("display","none");
            $("#pnametip2").css("display","none");
            return true;
        }
    }
    function sextest() {
        var sex = $("input[name='sex']:checked").val();
        if(sex == undefined){
            $("#sextip").css("display","block");
            return false;
        }else {
            $("#sextip").css("display","none");
            return true;
        }
    }
    function birthdaytest() {
        var date = $("input[name='birthday']").val();
        if(date == ''){
            $("#birthdaytip").css("display","block");
            return false;
        }else {
            $("#birthdaytip").css("display","none");
            return true;
        }
    }

    $("#pnum").blur(pnumtest);
    $("#ppwd1").blur(ppwd1test);
    $("#ppwd2").blur(ppwd2test);
    $("#pname").blur(pnametest);
    $("#birthday").blur(birthdaytest);


    $("form#presgin").submit(function(e){
        if(!(pnumtest() && ppwd1test() && ppwd2test() && pnametest() && sextest() && birthdaytest())){
            e.preventDefault();
        }
    });
});

function goBack()
{
    window.history.back()
}