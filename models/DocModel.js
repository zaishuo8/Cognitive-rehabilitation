var connPool=require("./ConnPool");
var docBean = require("../jsbean/DocBean");
var patBean = require("../jsbean/PatBean");
var checkSession = require("../jsbean/CheckSession");
var async = require('async');

module.exports={
    login:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err,conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var docSql = 'select dname,picroute from doc where dnum=? and pwd=?';
            var param = [req.body['dnum'],req.body['pwd']];
            var pList = 'select pnum,pname,sex,vip,age,createtime,disease,prescription,target,problem from patient where dnum=? order by pid desc limit ?,?';
            var countSql = 'select count(*) as sum from patient where dnum=?';    //rs结果是总共有多少条记录,用sum保存
            var countunreadmessSql = 'select count(*) as unmessnum from message where rid=? and isread="0"';    //rs结果是总共有多少条记录,用sum保存
            var count;           //存放一共有多少条记录
            var unreadMessage;
            var pagesize = 5;    //每页3条记录
            var pages;           //存放一共有多少页

            async.series({
                one:function (callback) {
                    conn.query(docSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }else if(rs.length<=0){
                            var message = '<p style="color: lightcoral; margin: 5px auto;width:120px;">用户名或密码错误</p>';
                            return res.render('index',{message:message});
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(pList,[req.body['dnum'],0,5],function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                three:function (callback) {
                    conn.query(countSql,[req.body['dnum']],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        count = rs[0]['sum'];  //总共多少条 int
                        pages = Math.ceil(count/pagesize);   //总页码,math.ceil向上取整
                        callback(null,rs);
                    });
                },
                four:function (callback) {
                    conn.query(countunreadmessSql,[req.body['dnum']],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        unreadMessage = rs[0]['unmessnum'];  //总共多少条 int
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var docbean = new docBean();
                var rs1 = results['one'];
                var rs2 = results['two'];
                docbean.dnum = req.body['dnum'];
                docbean.dname = rs1[0].dname;
                if(rs1[0].picroute.length>7){
                    docbean.picroute = rs1[0].picroute.substring(7);
                }
                docbean.unreadMessagenum = unreadMessage;
                req.session.docbean = docbean;     //设置session
                return res.render('doctor',{docbean:docbean,rs:rs2,title:"患者管理",pages:pages,page:"1"});
            });
            conn.release();
        });
    },

    resgin:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pAddSql = 'insert into patient(pnum,pwd,pname,sex,vip,age,createtime,tgroup,dnum) values(?,?,?,?,?,?,?,"",?)';
            var biryear = parseInt(req.body['birthday'].substr (0,4));     //获得年份,并转换成整数
            var time = new Date().toLocaleDateString();
            var thisyear = parseInt(time.substr (0,4));
            var age = (thisyear-biryear).toString();
            var param = [req.body['pnum'],req.body['ppwd1'],req.body['pname'],req.body['sex'],req.body['vip'],age,time,req.session.docbean.dnum];
            conn.query(pAddSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                //console.log(rs);
                var docbean = checkSession.check(req, res);
                return res.redirect(307,'/pageturn?page=1');
                //res.render('doctor', {docbean: docbean, title: "患者管理"});    //直接渲染,结果没有加载css样式???
            });
            conn.release();
        });
    },

    pageturn:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err,conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pList = 'select pnum,pname,sex,vip,age,createtime from patient where dnum=? order by pid desc limit ?,?';
            var countSql = 'select count(*) as sum from patient where dnum=?';    //rs结果是总共有多少条记录,用sum保存
            var count;           //存放一共有多少条记录
            var pagesize = 5;    //每页3条记录
            var pages;           //存放一共有多少页
            var page = parseInt(req.query['page']);
            var pointStart = (page-1)*pagesize;    //第N页的第一条的序号(编号是从0开始的)
            var plistparam = [req.session.docbean.dnum,pointStart,pagesize];

            async.series({
                one:function (callback) {
                    conn.query(pList,plistparam,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(countSql,[req.session.docbean.dnum],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        count = rs[0]['sum'];  //总共多少条 int
                        pages = Math.ceil(count/pagesize);   //总页码,math.ceil向上取整
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs = results['one'];
                var docbean = checkSession.check(req, res);
                return res.render('doctor',{docbean:docbean,rs:rs,title:"患者管理",pages:pages,page:page});
            });
            conn.release();
        });
    },

    pajax:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err,conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pSql = 'select pname from patient where pnum=?';
            var param = [req.query['pnum']];
            // console.log("param:"+param);
            conn.query(pSql, param, function (err, rs) {
                if (err) {
                    return res.send("ajax数据库错误:" + err.message);
                }
                // console.log("rs:"+rs);
                if(rs.length!=0){
                    //console.log("账号存在");
                    return res.send("该账号已被注册");
                }else{
                    //console.log("账号合法");
                    return res.send("");
                }
            });
            conn.release();
        });
    },

    oldpwdajax:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err,conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pwdSql = 'select pwd from doc where dnum=?';
            var param = req.session.docbean.dnum;
            var oldpwd = [req.query['oldpwd']];
            // console.log("param:"+param);
            conn.query(pwdSql, param, function (err, rs) {
                if (err) {
                    return res.send("ajax数据库错误:" + err.message);
                }
                // console.log("rs:"+rs);
                if(rs[0]['pwd']!=oldpwd){
                    //console.log("账号存在");
                    return res.send("原密码输入错误");
                }else{
                    //console.log("账号合法");
                    return res.send("");
                }
            });
            conn.release();
        });
    },

    patient:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pqSql = 'select pid,pnum,pname,disease,target,problem,tgroup from patient where pnum=?';
            var asstSql = 'select astype,pnum,astime,createtime,finished,reported from asstask where pnum=? order by akid desc';
            var selsql = 'select preid,prename from prebank where createrpnum=? order by createtime desc';
            var selsql2 = 'select preid,prename,dname from prebank where createrpnum!=? and isshar="是" order by createtime desc';
            var countSql = 'select count(*) as sum from asstask where finished="0" and pnum=?';
            var param = req.session.patbean.pnum;
            var selparam = req.session.docbean.dnum;
            var finishednum;

            async.series({
                one:function (callback) {
                    conn.query(pqSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询patient数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(countSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        finishednum = rs[0]['sum'];  //总共多少条 int
                        callback(null,rs);
                    });
                },
                three:function (callback) {
                    conn.query(asstSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询评定任务表错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                four:function (callback) {
                    conn.query(selsql,selparam,function (err,rs) {
                        if(err){
                            return res.send("查询评定任务表错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                five:function (callback) {
                    conn.query(selsql2,selparam,function (err,rs) {
                        if(err){
                            return res.send("查询评定任务表错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var rs3 = results['three'];
                var rs4 = results['four'];
                var rs5 = results['five'];
                var docbean = checkSession.check(req, res);
                return res.render('patient',{docbean:docbean,title:"患者管理",rs1:rs1,finishednum:finishednum,rs3:rs3,rs4:rs4,rs5:rs5});
            });
            conn.release();
        });
    },

    upddtp:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var updSql = 'update patient set disease=?,target=?,problem=? where pnum=?';
            var pnum = req.session.patbean.pnum;
            var param = [req.query['disease'],req.query['target'],req.query['problem'],pnum];
            conn.query(updSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                    return res.redirect(307,'/patient?pnum='+pnum);
            });
            conn.release();
        });
    },

    addasstask:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var addasstaskSql = 'insert into asstask(astype,pnum,pname,astime,createtime,finished,reported,dnum) values(?,?,?,?,?,"0","0",?)';
            var pnum = req.session.patbean.pnum;
            var pname = req.session.patbean.pname;
            var createtime = new Date().toLocaleString();
            var asstime = req.query['asstime'];    //打印结果:2016-11-28T15:15 (把T替换成空格)
            var at1 = asstime.substr(0,10);
            var at2 = asstime.substr(11);
            asstime = at1.concat(" ").concat(at2);
            var param = [req.query['asstype'],pnum,pname,asstime,createtime,req.session.docbean.dnum];
            conn.query(addasstaskSql, param, function (err, rs) {
                if (err) {
                    return res.send("添加asstask数据库记录错误:" + err.message);
                }
                return res.redirect(307,'/patient?pnum='+pnum);
            });
            conn.release();
        });
    },

    pingding:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pingdingSql = 'select akid,pnum,pname,astime from asstask where dnum=? and finished="0" order by astime';
            conn.query(pingdingSql, [req.session.docbean.dnum], function (err, rs) {
                if (err) {
                    return res.send("查找asstask数据库记录错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                return res.render('asstask',{docbean:docbean,title:"评定任务",rs:rs});
            });
            conn.release();
        });
    },

    upddoc:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var docSql = 'select did,dnum,dname from doc where dnum=?';
            var param = req.session.docbean.dnum;
            async.series({
                one:function (callback) {
                    conn.query(docSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询doc数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var docbean = checkSession.check(req, res);
                return res.render('message',{docbean:docbean,title:"我的信息",rs1:rs1});
            });
            conn.release();
        });
    },

    uploadpic:function (newPath,req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var picSql = 'update doc set picroute=? where dnum=?';
            var picroute = newPath;
            var pnum = req.session.docbean.dnum;

            conn.query(picSql, [picroute,pnum], function (err, rs) {
                if (err) {
                    return res.send("写入图片路径数据库记录错误:" + err.message);
                }
                req.session.docbean.picroute = newPath.substring(7);
                return res.redirect(307,'/message');
            });
            conn.release();
        });
    },

    mpageturn:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var count;           //存放一共有多少条记录
            var pages;           //存放一共有多少页
            var pagesize = 8;    //每页3条记录
            // var page = 1;
            var page = parseInt(req.query['page']);
            var pointStart = (page-1)*pagesize;    //第N页的第一条的序号(编号是从0开始的)
            var plistparam = [req.session.docbean.dnum,pointStart,pagesize];

            var patSql = 'select pnum,pname from patient where dnum=? limit ?,?';
            var countSql = 'select count(*) as sum from patient where dnum=?';    //rs结果是总共有多少条记录,用sum保存
            var unreadsql = 'select distinct sid from message where rid=? and isread="0"';
            var param = req.session.docbean.dnum;
            async.series({
                one:function (callback) {
                    conn.query(patSql,plistparam,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(countSql,[req.session.docbean.dnum],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        count = rs[0]['sum'];  //总共多少条 int
                        pages = Math.ceil(count/pagesize);   //总页码,math.ceil向上取整
                        callback(null,rs);
                    });
                },
                three:function (callback) {
                    conn.query(unreadsql,param,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var rs3 = results['three'];
                var docbean = checkSession.check(req, res);
                return res.render('imessage',{docbean:docbean,title:"留言信息",rs1:rs1,pages:pages,page:page,rs3:rs3});
            });
            conn.release();
        });
    },

    upddn:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var updSql = 'update doc set dname=? where dnum=?';
            var dnum = req.session.docbean.dnum;
            var dname = req.query['dname'];
            var param = [dname,dnum];
            conn.query(updSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                req.session.docbean.dname = dname;
                var docbean = checkSession.check(req, res);
                return res.redirect(307,'/message');
                // res.send("修改成功");
            });
            conn.release();
        });
    },

    changepwd:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var updSql = 'update doc set pwd=? where dnum=?';
            var dnum = req.session.docbean.dnum;
            var param = [req.query['ppwd1'],dnum];
            conn.query(updSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                return res.redirect(307,'/message');
                // res.send("修改成功");
            });
            conn.release();
        });
    },

    messagedetails:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var sectSql = 'select sid,content,createtime from message where (sid=? and rid=?) or (rid=? and sid=?) order by createtime desc';
            var updSql = 'update message set isread="1" where sid=? and rid=? and isread="0"';
            var pname = req.session.patbean.pname;
            var dnum = req.session.docbean.dnum;
            var pnum = req.session.patbean.pnum;
            var param = [dnum,pnum,dnum,pnum];

            async.series({
                one:function (callback) {
                    conn.query(sectSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(updSql,[pnum,dnum],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var rs2 = results['two'];
                var docbean = checkSession.check(req, res);
                req.session.docbean.unreadMessagenum = req.session.docbean.unreadMessagenum-rs2.affectedRows;     //rs2.affectedRows : 修改的记录数
                return res.render('messagedetails',{docbean:docbean,rs1:rs1,title:"留言信息",pname:pname,pnum:pnum});
            });
            conn.release();
        });
    },

    replymessage:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var insertSql = 'insert into message(sid,rid,createtime,content,isread) ' +
                'values(?,?,?,?,"0")';
            var dnum = req.session.docbean.dnum;
            var pnum = req.session.patbean.pnum;
            var pname = req.session.patbean.pname;
            var content = req.query['reply'];
            var createtime = new Date().toLocaleString();
            var param = [dnum,pnum,createtime,content];
            conn.query(insertSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                // res.redirect(307,'/messagedetails?pnum='+pnum+'&pname='+pname);   //报错!!!!!!!!???????
                return res.redirect(307,'/imessage');
            });
            conn.release();
        });
    },

    prebank:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var sectSql = 'select preid,prename,createtime,tnum,isshar from prebank where createrpnum=? order by createtime desc';
            var createrpnum = req.session.docbean.dnum;
            var param = [createrpnum];
            conn.query(sectSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                return res.render('prescription',{docbean:docbean,title:"处方档案",rs:rs});
            });
            conn.release();
        });
    },

    addprebank:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var insertSql = 'insert into prebank(prename,createtime,tnum,createrpnum,isshar,description,tgroup,dname)' +
                'values(?,?,"0",?,"否",?,"",?)';
            var prename = req.body['prename'];
            var createrpnum = req.session.docbean.dnum;
            var createtime = new Date().toLocaleDateString();
            var description = req.body['premess'];
            var param = [prename,createtime,createrpnum,description,req.session.docbean.dname];
            conn.query(insertSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                return res.redirect(307,'/prescription');
            });
            conn.release();
        });
    },

    changeshar:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var tosharSql = 'update prebank set isshar="是" where preid=?';
            var tonotsharSql = 'update prebank set isshar="否" where preid=?';
            var preid = req.query['preid'];
            var isshar = req.query['isshar'];
            var param = [preid];
            if(isshar=='是'){
                conn.query(tonotsharSql, param, function (err, rs) {
                    if (err) {
                        return res.send("操作数据库错误:" + err.message);
                    }
                    var docbean = checkSession.check(req, res);
                    return res.redirect(307,'/prescription');
                });
            }else{
                conn.query(tosharSql, param, function (err, rs) {
                    if (err) {
                        return res.send("操作数据库错误:" + err.message);
                    }
                    var docbean = checkSession.check(req, res);
                    return res.redirect(307,'/prescription');
                });
            }
            conn.release();
        });
    },

    showpre:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var sectSql = 'select prename,createtime,description,tgroup,createrpnum from prebank where preid=?';
            var preid = req.query['preid'];
            var param = [preid];
            conn.query(sectSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                return res.render('preaddti',{docbean:docbean,title:"处方档案",rs:rs,preid:preid});
            });
            conn.release();
        });
    },

    showtrainbank1:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var preSql = 'select tgroup from prebank where preid=?';
            var sectSql = 'select tid,tname,tename from trainbank';
            var preid = req.query['preid'];

            async.series({
                one:function (callback) {
                    conn.query(sectSql,[],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(preSql,preid,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var rs2 = results['two'];
                var docbean = checkSession.check(req, res);
                return res.render('trainbank',{title:"处方档案",rs1:rs1,rs2:rs2,preid:preid,pid:""});
            });
            conn.release();
        });
    },

    showtrainbank2:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var preSql = 'select tgroup from patient where pid=?';
            var sectSql = 'select tid,tname,tename from trainbank';
            var pid = req.query['pid'];

            async.series({
                one:function (callback) {
                    conn.query(sectSql,[],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(preSql,pid,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var rs2 = results['two'];
                // var docbean = checkSession.check(req, res);
                return res.render('trainbank',{title:"题库",rs1:rs1,rs2:rs2,pid:pid,preid:""});
            });
            conn.release();
        });
    },

    //从处方库确认添加题目
    sureadded:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var selSql = 'select tgroup from prebank where preid=?';
            var uptSql = 'update prebank set tgroup=? where preid=?';
            var preid = req.query['preid'];
            var ts = req.query['ts'];

            async.waterfall([
                function (callback) {
                    conn.query(selSql,preid,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        var param = rs[0]['tgroup']+ts;
                        callback(null,param);
                    });
                },
                function (param,callback) {
                    conn.query(uptSql,[param,preid],function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            ],function(err,results){
                var docbean = checkSession.check(req, res);
                return res.redirect(307,"/preaddti?preid="+preid);
            });
            conn.release();
        });
    },

    //从患者选题中添加题目
    sureadded2:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var selSql = 'select tgroup from patient where pid=?';
            var uptSql = 'update patient set tgroup=? where pid=?';
            var pid = req.query['pid'];
            var ts = req.query['ts'];

            async.waterfall([
                function (callback) {
                    conn.query(selSql,pid,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        var param = rs[0]['tgroup']+ts;
                        callback(null,param);
                    });
                },
                function (param,callback) {
                    conn.query(uptSql,[param,pid],function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            ],function(err,results){
                var pnum = req.session.patbean.pnum;
                if(req.session.docbean==undefined){
                    return res.redirect(307,"/mytrain");
                }else{
                    return res.redirect(307,"/patient?pnum="+pnum);
                }
            });
            conn.release();
        });
    },

    bankdel:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var uptSql = 'update prebank set tgroup=? where preid=?';
            var preid = req.query['preid'];
            var tgroup = req.query['newgroup'];
            var param = [tgroup,preid];

            conn.query(uptSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var docbean = checkSession.check(req, res);
                return res.redirect(307,"/preaddti?preid="+preid);
            });
            conn.release();
        });
    },

    ptgdelajax:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var uptSql = 'update patient set tgroup=? where pid=?';
            var pid = req.query['pid'];
            var tgroup = req.query['newgroup'];
            var param = [tgroup,pid];

            conn.query(uptSql, param, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                return res.send("delok");
            });
            conn.release();
        });
    },

    updpreajax:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var selSql = 'select tgroup from prebank where preid=?';
            var uptSql = 'update patient set tgroup=? where pid=?';
            var pid = req.query['pid'];
            var preid = req.query['preid'];
            var param;

            async.waterfall([
                function (callback) {
                    conn.query(selSql,preid,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误1:"+err.message);
                        }
                        param = rs[0]['tgroup'];
                        callback(null,param);
                    });
                },
                function (param,callback) {
                    conn.query(uptSql,[param,pid],function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误2:"+err.message);
                        }
                        callback(null,param);
                    });
                }
            ],function(err,results){
                var docbean = checkSession.check(req, res);
                return res.send(param);
            });
            conn.release();
        });
    },

    plogin:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err,conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var patSql = 'select pname from patient where pnum=? and pwd=?';
            var param = [req.body['dnum'],req.body['pwd']];
            var countunreadmessSql = 'select count(*) as unmessnum from message where rid=? and isread="0"';    //rs结果是总共有多少条记录,用sum保存
            var unreadMessage;

            async.series({
                one:function (callback) {
                    conn.query(patSql,param,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }else if(rs.length<=0){
                            var message = '<p style="color: lightcoral; margin: 5px auto;width:120px;">用户名或密码错误</p>';
                            return res.render('index',{message:message});
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(countunreadmessSql,[req.body['dnum']],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        unreadMessage = rs[0]['unmessnum'];  //总共多少条 int
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var patbean = new patBean();
                var rs1 = results['one'];
                patbean.pnum = req.body['dnum'];
                patbean.pname = rs1[0].pname;
                patbean.unreadMessagenum = unreadMessage;
                req.session.patbean = patbean;     //设置session
                return res.redirect(307,"/mytrain");
            });
            conn.release();
        });
    },

    mytrain:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var pqSql = 'select pid,pnum,pname,disease,target,problem,tgroup from patient where pnum=?';
            var patbean = req.session.patbean;
            conn.query(pqSql, patbean.pnum, function (err, rs) {
                if (err) {
                    return res.send("操作数据库错误:" + err.message);
                }
                var patbean = req.session.patbean;
                return res.render('mytrain',{patbean:patbean,title:"我的训练",rs3:rs});
            });
            conn.release();
        });
    },

    myasses:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var nowSql = 'select akid,astime from asstask where pnum=? and finished="0"';
            var hisSql = 'select akid,astime from asstask where pnum=? and finished="1"';
            var patbean = req.session.patbean;
            var pnum = patbean.pnum;

            async.series({
                one:function (callback) {
                    conn.query(nowSql,pnum,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(hisSql,pnum,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                var rs2 = results['two'];
                return res.render('myasses',{patbean:patbean,title:"我的评定",rs1:rs1,rs2:rs2});
            });
            conn.release();
        });
    },

    mymessage:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var sectSql = 'select sid,content,createtime from message ' +
                'where sid=? or rid=? order by createtime desc';
            var updSql = 'update message set isread="1" where rid=?';
            var patbean = req.session.patbean;
            var pnum = patbean.pnum;

            async.series({
                one:function (callback) {
                    conn.query(sectSql,[pnum,pnum],function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                },
                two:function (callback) {
                    conn.query(updSql,pnum,function (err,rs) {
                        if(err){
                            return res.send("查询数据库记录总数错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            },function(err,results){
                var rs1 = results['one'];
                req.session.patbean.unreadMessagenum = 0;
                return res.render('mymessage',{patbean:patbean,title:"我的信息",rs1:rs1,pnum:pnum});
            });
            conn.release();
        });
    },

    preplymessage:function (req,res,next) {
        var pool = connPool();
        pool.getConnection(function (err, conn) {
            if (err) {
                return res.send("获取连接池错误" + err.message);
            }
            var docSql = 'select dnum from patient where pnum=?';
            var insSql = 'insert into message(sid,rid,createtime,content,isread) ' +
                'values(?,?,?,?,"0")';
            var content = req.query['reply'];
            var createtime = new Date().toLocaleString();
            var patbean = req.session.patbean;
            var pnum = patbean.pnum;

            async.waterfall([
                function (callback) {
                    conn.query(docSql,pnum,function (err,rs) {
                        if(err){
                            return res.send("查询数据库错误:"+err.message);
                        }
                        var param = rs[0]['dnum'];
                        callback(null,param);
                    });
                },
                function (param,callback) {
                    conn.query(insSql,[pnum,param,createtime,content],function (err,rs) {
                        if(err){
                            return res.send("插入数据库错误:"+err.message);
                        }
                        callback(null,rs);
                    });
                }
            ],function(err,results){
                return res.redirect(307,"/mymessage");
            });
            conn.release();
        });
    },
}
