/**
 * Created by chao on 2016/11/16.
 * 负责文件读取
 */
var readHtml = require('./html/readhtml');
module.exports = function (htmlFiles, htmlDest, cssmin, cssDest, jsmin, jsDest) {
    if (htmlFiles && htmlDest) {
        readHtml(htmlFiles,htmlDest);
    }
};
