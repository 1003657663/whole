'use strict';
/*jshint unused:false*/
/**
 * Created by chao on 2016/11/16.
 * 负责读取html文件，并把文件流转到下一步
 */
let handleHtml = require('./handleHtml'),
    mypath = require('./myPath'),
    path = require('path'),
    fs = require('fs');

module.exports = function (htmlFiles, htmlDest, defaultTag) {

    function startHandleHtml(oneHtmlFile) {
        let cwdPath = mypath.startPath();
        let readHtmlPath = mypath.getAbsolutePath(cwdPath, oneHtmlFile);

        if (mypath.isOver(readHtmlPath)) {
            console.error(readHtmlPath + " 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
            process.exit();
        }
        let handleResult = handleHtml(readHtmlPath, defaultTag, true);
        writeResult(handleResult, readHtmlPath, htmlDest, defaultTag);

    }

    if (Array.isArray(htmlFiles)) {
        let length = htmlFiles.length;
        for (let i = 0; i < length; i++) {
            startHandleHtml(htmlFiles[i]);
        }
    } else {
        startHandleHtml(htmlFiles);
    }

};

function writeResult(result, htmlPath, htmlDest, defaultTag) {
    if (result.$dom) {
        fs.writeFile(mypath.destPath(htmlDest, path.basename(htmlPath)), result.$dom.html(), function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("写入成功 done");
            }
        });
    }
}
