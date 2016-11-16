/**
 * Created by chao on 2016/11/16.
 * 负责读取html文件，并把文件流转到下一步
 */
var fs = require('fs');
var handleData = require('./handleData');


module.exports = function (htmlFiles, htmlDest) {
    if (Array.isArray(htmlFiles)) {
        var length = htmlFiles.length;
        for (var i = 0; i < length; i++) {
            read(htmlFiles[i]);
        }
    } else {
        read(htmlFiles);
    }
    function read(file) {
        fs.readFile(file, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            handleData(data, file, htmlDest);
        })
    }
};
