$(document).ready(function(){
	$('#myTab a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});

	$("#example").css("display","none");
	var pid = $("#pid").val();

	//添加评定模态框前端验证
	$("h5.tip").css("display","none");

	function asstypetest() {
		var asstype = $("input[name='asstype']:checked").val();
		if(asstype == undefined){
			$("#asstypetip").css("display","block");
			return false;
		}else {
			$("#asstypetip").css("display","none");
			return true;
		}
	}
	function asstimetest() {
		var asstime = $("input[name='asstime']").val();
		if(asstime == ''){
			$("#isasstimetip").css("display","block");
			return false;
		}else {
			$("#isasstimetip").css("display","none");
			return true;
		}
	}

	$("form#addasstask").submit(function(e){
		if(!(asstypetest() && asstimetest())){
			e.preventDefault();
		}
	});

	//显示康复训练题目组
	var tgroupstr = $("#hidden").val();
	showtgroup(tgroupstr);

	//更换处方
	$(".choice").click(function () {
		var preid = $(this).parent().parent().attr('id');
		//ajax
		$.get("/updpreajax",{pid:pid,preid:preid},function (res) {
			//alert(res);
			$("#traindetails").empty();
			showtgroup(res);
		});
	});


	//显示题目组
	function showtgroup(tgroupstr) {
		var tgroup = tgroupstr.split("-");
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