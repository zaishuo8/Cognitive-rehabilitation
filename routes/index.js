var express = require('express');
var router = express.Router();
var docModel = require("../models/DocModel");
var docBean = require("../jsbean/DocBean");
var patBean = require("../jsbean/PatBean");
var checkSession = require("../jsbean/CheckSession");
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{message:''});
});

router.get('/logout', function(req, res, next) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.post('/login', function(req, res, next) {
    if(req.body['dnum']=='40001'||req.body['dnum']=='40002'){
        docModel.login(req,res,next);
    }else{
        docModel.plogin(req,res,next);
    }
});

router.get('/resgin', function(req, res, next) {
    var docbean = checkSession.check(req, res);
    //console.log(docbean);
    res.render('resgin', {docbean: docbean, title: "新增患者"});
});

//提交注册患者
router.post('/resgin', function(req, res, next) {
    docModel.resgin(req,res,next);
});

router.all('/pageturn', function(req, res, next) {
    docModel.pageturn(req,res,next);
});

//添加患者时ajax验证
router.get('/pajax',function (req, res,next) {
    //console.log('pnum:'+req.query['pnum']);
    docModel.pajax(req,res,next);
});

//修改密码老密码ajax验证
router.get('/oldpwdajax',function (req, res,next) {
    docModel.oldpwdajax(req,res,next);
});

//患者管理路由
router.get('/pmanage',function (req, res,next) {
    res.redirect(307,'/pageturn?page=1');
});

//患者管理具体页面
router.get('/patient',function (req, res,next) {
    var docbean = checkSession.check(req, res);
    if(!checkSession.checkpatbean(req, res)){
        req.session.patbean.pnum = req.query['pnum'];
        req.session.patbean.pname = req.query['pname'];
    }else if(req.session.patbean.pnum != req.query['pnum']){
        req.session.patbean.pnum = req.query['pnum'];
        req.session.patbean.pname = req.query['pname'];
    }
    docModel.patient(req,res,next);
    // var docbean = checkSession.check(req, res);
    // res.render('patient',{docbean:docbean,title:"患者管理"});
});

//评定任务路由
router.get('/pingding',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.pingding(req,res,next);
});

//我的消息路由
router.all('/message',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.upddoc(req,res,next);
});

//留言信息
router.get('/imessage',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    res.redirect(307,'/mpageturn?page=1');
});

//留言管理分页
router.get('/mpageturn',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.mpageturn(req,res,next);
});

//处方库路由
router.all('/prescription',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.prebank(req,res,next);
});

//添加处方
router.post('/addprebank',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.addprebank(req,res,next);
});

//修改共享
router.get('/changeshar',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.changeshar(req,res,next);
});

//'开始评定'路由
router.get('/startass',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    res.render('startass',{title:"开始评定"});
});

//处方库添加题目路由
router.get('/preaddti',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.showpre(req,res,next);
});

//发消息路由
router.get('/messagedetails',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    checkSession.checkpatbean(req, res);
    req.session.patbean.pnum = req.query['pnum'];
    req.session.patbean.pname = req.query['pname'];
    docModel.messagedetails(req,res,next);
});

//更新基础信息
router.get('/upddtp',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.upddtp(req,res,next);
});

//添加评定任务
router.get('/addasstask',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.addasstask(req,res,next);
});

//更新医生信息
router.get('/upddn',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.upddn(req,res,next);
});

//修改密码操作
router.get('/changepwd',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.changepwd(req,res,next);
});

//回复消息
router.get('/replymessage',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.replymessage(req,res,next);
});

//进入题库
router.get('/trainbank',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.showtrainbank1(req,res,next);
});

//处方库添加题目操作
router.get('/sureadded',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.sureadded(req,res,next);
});

//患者添加题目
router.get('/sureadded2',function (req,res,next) {
    //没有docbean,应该直接退到index页面,该方法中止,为什么还会执行下面的语句,
    //调用sureadded2方法,直到sureadded2中又res返回时才报错
    //"Can't set headers after they are sent"
    //var docbean = checkSession.check(req, res);
    //??????????

    docModel.sureadded2(req,res,next);
});

//处方库删题
router.get('/bankdel',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.bankdel(req,res,next);
});

//患者题库删题
router.get('/ptgdelajax',function (req,res,next) {
    // var docbean = checkSession.check(req, res);
    docModel.ptgdelajax(req,res,next);
});

//患者更新处方
router.get('/updpreajax',function (req,res,next) {
    var docbean = checkSession.check(req, res);
    docModel.updpreajax(req,res,next);
});

router.get('/trainbank2',function (req,res,next) {
    // var docbean = checkSession.check(req, res);
    docModel.showtrainbank2(req,res,next);
});

router.all('/mytrain',function (req,res,next) {
    docModel.mytrain(req,res,next);
});

router.get('/myasses',function (req,res,next) {
    docModel.myasses(req,res,next);
});

router.get('/mymessage',function (req,res,next) {
    docModel.mymessage(req,res,next);
});

router.get('/preplymessage',function (req,res,next) {
    docModel.preplymessage(req,res,next);
});

//ajax上传头像到临时文件夹,并返回图片到网页
router.post('/uppicajax',function (req,res,next) {
    var form = new multiparty.Form();
    //设置编码
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = "public/images/uploadtemp/";     //临时文件夹
    //设置单文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和

    form.parse(req, function(err, fields, files) {        //参数field是传过来的表单中非文件形式的数据,files是文件形式的数据(数组形式??)
        if(err){
            res.send("上传文件错误"+err.message);
        }

        var file1 = files['upload'];
        //var originalFilename = file1[0].originalFilename; //8.jpg
        var tmpPath = file1[0].path;//uploadtemp/8cdDvP_SU2C3Dz8R4a9CIOps.jpg
        res.send(tmpPath.substring(7));
    });
});

//上传头像(图片)
router.post('/uploadpic',function (req,res,next) {
    var form = new multiparty.Form();
    //设置编码
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = "./uploadtemp/";     //临时文件夹
    //设置单文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和

    form.parse(req, function(err, fields, files) {
        if(err){
            res.send("上传文件错误"+err.message);
        }
        var newPath='public/images/dpic/';
        var file1 = files['upload'];
        var originalFilename = file1[0].originalFilename; //8.jpg
        var tmpPath = file1[0].path;//uploadtemp/8cdDvP_SU2C3Dz8R4a9CIOps.jpg

        var timestamp=new Date().getTime(); //获取当前时间戳
        newPath += timestamp+originalFilename;

        var fileReadStream = fs.createReadStream(tmpPath);
        var fileWriteStream = fs.createWriteStream(newPath);
        fileReadStream.pipe(fileWriteStream); //管道流
        fileWriteStream.on('close',function(){
            fs.unlinkSync(tmpPath);    //删除临时文件夹中的图片

            //把路径存数据库
            docModel.uploadpic(newPath,req,res,next);
            //res.send('上传成功');
        });
    });
});

router.get('/t',function (req,res,next) {
    var tid = req.query['tid'];
    res.render("t/"+tid+"/go",{});
})

module.exports = router;
