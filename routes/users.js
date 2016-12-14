var express = require('express');
var router = express.Router();
var docModel = require("../models/DocModel");
var checkSession = require("../jsbean/CheckSession");

/* GET users listing. */
router.get('/', function(req, res, next) {
  var docbean = checkSession.check(req, res);
  res.render('doctor',{docbean:docbean,title:"患者管理"});
});

module.exports = router;
