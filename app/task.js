'use strict';
/**
 * Created by chao on 2016/11/16.
 * 解释配置文件
 */
let readHtml = require('./readhtml');
let path = require('path');
let myPath = require('./myPath');

module.exports = function (config) {

    let allDest = config.dest || "";

    //处理html数组的路径
    /*    let files = config.html.files;
     if(Array.isArray(files)){
     for(let i=0;i<files.length;i++){
     files[i] = myPath.getAbsolutePath(files[i]);
     }
     }else{
     config.html.files = myPath.getAbsolutePath(files);
     }*/
    let htmlFiles = config.html.files;

    let htmlDest = path.join(allDest, config.html.dest);

    let tag = config.tag;

    if ((htmlFiles && !htmlDest)) {
        console.error("html文件路径或者 htmlDest有误");
        process.exit();
    }


    for (let i in tag) {
        if (tag[i]) {
            let oneTag = tag[i];
            if (oneTag.pathTag) {
                if (!(oneTag.dest || allDest)) {
                    console.error(i + "没有路径信息，请添加");
                    process.exit();
                } else {
                    oneTag.dest = path.join(allDest, oneTag.dest);
                }
            }
        }
    }


    if (htmlFiles && htmlDest) {
        readHtml(htmlFiles, htmlDest, tag, config);
    }
};