'use strict';
/*jshint unused:false*/
/**
 * Created by chao on 2016/11/16.
 * 负责读取html文件，并把文件流转到下一步
 */
let handleHtml = require('./handleHtml'),
    mypath = require('./myPath');

module.exports = function (htmlFiles, htmlDest) {

    if (Array.isArray(htmlFiles)) {
        let length = htmlFiles.length;
        for (let i = 0; i < length; i++) {

            let filePath = htmlFiles[i];
            if (mypath.isOver(filePath)) {
                console.error(+" 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
                process.exit();
            }
            handleHtml(filePath);
        }
    } else {
        if (mypath.isOver(htmlFiles)) {
            console.error(+" 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
            process.exit();
        }
        handleHtml(htmlFiles);
    }
};
