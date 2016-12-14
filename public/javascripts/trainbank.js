/**
 * Created by xuting on 2016/12/1.
 */
$(document).ready(function(){
    $("#tbpannel button").click(choice);

     function choice() {
        var copysub = $(this).parent().clone();
        var copybtn = copysub.find('button');
        copybtn.text('取消选择')
            .click(function () {
                var tid = $(this).parent().attr('id');
                var oldbtn = $("#tbpannel #"+tid).find('button');
                oldbtn.text('选择')
                    .removeClass("btn btn-info")
                    .addClass("btn btn-primary")
                    .bind('click',choice);         //递归
                $("#choiced #"+tid).remove();
            });
        $(this).text('已选择');
        $(this).removeClass("btn-primary");
        $(this).addClass("btn btn-info");
        $(this).unbind('click');
        $("#choiced").append(copysub);
    };

    $(".btn-default").unbind('click');

    $("button#sureadd").click(function () {
        var addeds = $("#choiced").children();
        if(addeds.length==0){
            alert("请选择题目");
            return false;
        }
        var ts='';
        for(var i=0;i<addeds.length;i++){
            ts = ts+'-'+addeds[i].id;
        }
        var pid = $("#pid").val();
        var preid = $("#preid").val();
        if(preid!=""){
            window.location.href="/sureadded?preid="+preid+"&ts="+ts;
        }else{
            window.location.href="/sureadded2?pid="+pid+"&ts="+ts;
        }
    });

    var rs2 = $("#rs2").val().split("-");
    var subs = $("#tbpannel").children();
    for(var i=0;i<subs.length;i++){
        var tid = subs[i].id;
        for(var j=0;j<rs2.length;j++){
            if(rs2[j]==tid){
                var addedbtn = $("#"+tid).find("button");
                addedbtn.text('已经添加')
                    .removeClass("btn btn-primary")
                    .addClass("btn btn-default active")
                    .unbind('click');
            }
        }

    }
});

//判断是否添加
function isadded(tgroup,banktid) {
    for(var i=0;i<tgroup.length;i++){
        if(tgroup[i]==banktid){
            return false;
        }
    }
    return true;
}

function goBack()
{
    window.history.back()
}