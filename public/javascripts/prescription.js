/**
 * Created by xuting on 2016/11/20.
 */
$(document).ready(function(){

    //内容验证不为空
    $("h5.tip").css("display","none");

    function prenametest() {
        var prename = $("input[name='prename']").val();
        if(prename == ''){
            $("#prenametip").css("display","block");
            return false;
        }else {
            $("#prenametip").css("display","none");
            return true;
        }
    }
    function premesstest() {
        var premess = $("#premess").val();
        if(premess == ''){
            $("#premesstip").css("display","block");
            return false;
        }else {
            $("#premesstip").css("display","none");
            return true;
        }
    }

    $("form#addpreform").submit(function(e){
        if(!(prenametest()&&premesstest())){
            e.preventDefault();
        }
    });
});
