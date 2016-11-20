/**
 * Created by chao on 2016/11/16.
 * 负责读取html文件，并把文件流转到下一步
 */
var fs = require('fs');
var handleData = require('./handleIndexData');
var path = require('path');
var mypath = require('../myPath');

module.exports = function (htmlFiles, htmlDest) {

    global.tt = 200;

    if (Array.isArray(htmlFiles)) {
        var length = htmlFiles.length;
        for (var i = 0; i < length; i++) {
            read(htmlFiles[i]);
        }
    } else {
        read(htmlFiles);
    }
    function read(file) {
        var filePath = path.join(process.cwd(), file);
        if (mypath.isAfter(process.cwd(), filePath)) {//判断路径合法性
            //路径超出项目范围错误提示
            console.error(file + " 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
            process.exit();
        }
        fs.readFile(filePath, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            handleData(data.toString(), file, htmlDest);
        })
    }
};
