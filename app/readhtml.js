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

module.exports = function (htmlFiles, htmlDest) {

    if (Array.isArray(htmlFiles)) {
        let length = htmlFiles.length;
        let cwdPath = mypath.startPath();
        for (let i = 0; i < length; i++) {
            let filePath = mypath.getAbsolutePath(cwdPath, htmlFiles[i]);

            if (mypath.isOver(filePath)) {
                console.error(htmlFiles + " 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
                process.exit();
            }
            let global = {};
            let handleResult = handleHtml(filePath, global);
            if (handleResult.$dom) {
                fs.writeFile(mypath.destPath(htmlDest, path.basename(filePath)), handleResult.$dom.html(), function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("写入成功 done");
                    }
                });
            }
        }
    } else {
        let cwdPath = mypath.startPath();
        htmlFiles = mypath.getAbsolutePath(cwdPath, htmlFiles);

        if (mypath.isOver(htmlFiles)) {
            console.error(htmlFiles + " 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
            process.exit();
        }
        let global = {};
        let handleResult = handleHtml(htmlFiles, global);
        if (handleResult.$dom) {
            fs.writeFile(mypath.destPath(htmlDest, path.basename(htmlFiles)), handleResult.$dom.html(), function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("写入成功 done");
                }
            });
        }
    }
};
