var time = 60;
var allt = 0, rightt = 0, wrongt = 0;
$(document).ready(function() {
	putnums();
	countime(time);

	$(".ases").click(function () {
		allt = allt + 1;
		if (parseInt($("#p1").text()) + parseInt($("#p2").text()) == parseInt($(this).find("p").text())) {
			rightt = rightt + 1;
		} else {
			wrongt = wrongt + 1;
		}
		putnums();
	});

	$("#goback").click(function () {
		window.history.back();
	});
});

//产生各位随机数
function num() {
	var t = parseInt(Math.random()*10);
	return t;
}

//产生所有数
function givenums() {
	var t1 = num();
	var t2 = num();
	var tas = t1+t2;
	var fas1 = num();
	while(fas1==tas){
		fas1=fas1+num();
	}
	var fas2 = num();
	while(fas2==tas || fas2==fas1){
		fas2=fas2+num();
	}
	var fas3 = num();
	while(fas3==tas || fas3==fas1 || fas3==fas2){
		fas3=fas3+num();
	}

	var tnums=[t1,t2];
	var asnums=[tas,fas1,fas2,fas3];
	asnums.sort(function(){ return 0.5 - Math.random() });    //对数组进行随机排序

	return[tnums,asnums];
}

//放入数组
function putnums() {
	var allnums = givenums();
	document.getElementById("p1").innerHTML = allnums[0][0];
	document.getElementById("p2").innerHTML = allnums[0][1];
	document.getElementById("as1").innerHTML = allnums[1][0];
	document.getElementById("as2").innerHTML = allnums[1][1];
	document.getElementById("as3").innerHTML = allnums[1][2];
	document.getElementById("as4").innerHTML = allnums[1][3];
}

//倒计时
function countime() {
	if(time>=0){
		$("#countime").text(time);
		time=time-1;
		setTimeout("countime()",1000);
	}else{
		document.getElementById("body").innerHTML="<p class='result'>正确:"+rightt+"题,错误:"+wrongt+"题。</P>" +
			"<div id='again' class='result' onclick='window.location.reload()'><p id='againp'>重来</p></div>" +
			"<div id='goback' onclick='window.history.back()'>返回</div>";
	}
}



