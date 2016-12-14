/**
 * Created by xuting on 2016/11/21.
 */
$(document).ready(function(){
    $("#example").css("display","none");
    var preid = $("#preid").val();
    var tgroup = $("#hidden").val().split("-");

    for(var i=1;i<tgroup.length;i++){
        var tid = tgroup[i];
        var sub = $("#example").clone();
        sub.attr("id",tid);
        sub.css("display","block");
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
            window.location.href="/bankdel?preid="+preid+"&newgroup="+newgroup;
        });
        $("#traindetails").append(sub);
    }

});

function goBack()
{
    window.history.back()
}