/**
 * Created by xuting on 2016/12/5.
 */
$(document).ready(function(){
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $("#example").css("display","none");
    var pid = $("#pid").val();

    //显示康复训练题目组
    var tgroupstr = $("#hidden").val();
    showtgroup(tgroupstr);

    //显示题目组
    function showtgroup(tgroupstr) {
        var tgroup = tgroupstr.split("-");
        for(var i=1;i<tgroup.length;i++){
            var tid = tgroup[i];
            var sub = $("#example").clone();
            sub.attr("id",tid);
            sub.css("display","block");
            sub.find("a").attr("href",tbank[tid].src)
            sub.find("img").attr("src","images/"+tbank[tid].tename+".png");
            sub.find("p").text(tbank[tid].tname);
            var delbtn = sub.find("button");
            delbtn.click(function () {
                var ttid = $(this).parent().attr('id');
                var index;
                for(var j=1;j<tgroup.length;j++){
                    if(tgroup[j]==ttid){
                        index = j;
                        break;
                    }
                }
                tgroup.splice(index,1);
                var newgroup = tgroup.join("-");
                //ajax
                $.get("/ptgdelajax",{pid:pid,newgroup:newgroup},function (res) {
                    if(res=='delok'){
                        $("#"+ttid).remove();
                    }
                });
            });
            $("#traindetails").append(sub);
        }
    }
});

function goBack()
{
    window.history.back()
}