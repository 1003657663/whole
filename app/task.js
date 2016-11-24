'use strict';
/**
 * Created by chao on 2016/11/16.
 * 解释配置文件
 */
let readHtml = require('./readhtml');

module.exports = function (config) {

    let allDest = config.dest;

    let htmlFiles = config.html.files;
    let cssmin = config.css.cssmin;
    let jsmin = config.js.jsmin;

    let htmlDest = config.html.dest || allDest;
    let cssDest = config.css.dest || allDest;
    let jsDest = config.js.dest || allDest;

    if((htmlFiles && !htmlDest)){
        console.error("html文件路径或者 htmlDest有误");
        process.exit();
    }
    if((cssmin && !cssDest)){
        console.error("html文件路径或者 htmlDest有误");
        process.exit();
    }
    if((jsmin && !jsDest)){
        console.error("html文件路径或者 htmlDest有误");
        process.exit();
    }
    if (htmlFiles && htmlDest) {
        readHtml(htmlFiles,htmlDest);
    }
};