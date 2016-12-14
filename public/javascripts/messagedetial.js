/**
 * Created by xuting on 2016/11/23.
 */
$(document).ready(function(){

    //回复内容验证不为空
    $("h5.tip").css("display","none");

    function replymesstest() {
        var replymess = $("input[name='reply']").val();
        if(replymess == ''){
            $("#remess").css("display","block");
            return false;
        }else {
            $("#remess").css("display","none");
            return true;
        }
    }

    $("form#replyform").submit(function(e){
        if(!replymesstest()){
            e.preventDefault();
        }
    });
});