var patBean = require("../jsbean/PatBean");

module.exports={
    check:function (req,res) {
        var docbean = req.session.docbean;
        if(docbean==undefined){
            res.render('index',{message:''});
            return false;
        }
        return docbean;
    },

    checkpatbean:function (req,res) {
        var patbean = req.session.patbean;
        if(patbean==undefined){
            patbean = new patBean();
            req.session.patbean = patbean;
            return false;
        }else{
            return true;
        }
    }
}