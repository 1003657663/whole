/**
 * Created by chao on 2016/11/16.
 * 解释配置文件
 */
var read = require('./read');

module.exports = function (config) {
    var allDest = config.dest;

    var htmlFiles = config.html.files;
    var cssmin = config.css.cssmin;
    var jsmin = config.js.jsmin;

    var htmlDest = config.html.dest || allDest;
    var cssDest = config.css.dest || allDest;
    var jsDest = config.js.dest || allDest;

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
    read(htmlFiles,htmlDest,cssmin,cssDest,jsmin,jsDest);
};