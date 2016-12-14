var mysql = require('mysql');

module.exports=(function () {
    var pool = mysql.createPool({
        host:'localhost',      //主机
        user:'root',           //mysql用户名
        password:'19920209',    //密码
        database:'jizhi',
        port:'3306'             //端口号
    });

    //初始化连接池
    pool.on('connection',function (connection) {
        connection.query('SET SESSION auto_increment_increment=1');
    });

    //通过闭包函数返回 pool ,每次返回都是上面的pool,而不是有新的连接就初始化新的pool,所谓的 单例模式(只有一个连接池)
    return function () {
        return pool;
    }
})();