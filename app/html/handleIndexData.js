/**
 * Created by chao on 2016/11/16.
 * 处理主页面的数据
 */

let $ = require('cheerio');
let handChildHtml = require('./handleChildHtml');

module.exports = function (data, file, htmlDest) {
    //data是来自主html文件的data
    let $dom = $.load(data,{decodeEntities:false});
    let wholeScript = $dom('script[type=whole]');
    let wholeLink = $dom('link[type=whole]');
    let locationStyle = $dom('style[type=whole]');
    let wholeins = $dom('wholein');

    let locationScript = wholeScript.filter(':not([src])');
    let locationLink = wholeLink.filter(':not([href])');


    if (wholeins.filter(':not([src])').length > 0) {
        console.error("主页面:" + file + "中包含的wholein标签必须含有src属性，请删除不含src属性的wholein标签");
        process.exit();
    }
    if (locationScript.length > 1) {
        console.error("主页面:" + file + "中包含多个定位script标签，规定只能有一个");
        process.exit();
    }
    if (locationLink.length > 1) {
        console.error("主页面:" + file + "中包含多个定位link标签，规定只能有一个");
        process.exit();
    }
    if (locationStyle.length > 1) {
        console.error("主页面:" + file + "中包含多个定位style标签，规定只能有一个");
        process.exit();
    }


    let srcScript = wholeScript.filter('script[src]');
    let srcLink = wholeLink.filter('link[href]');

    let length = wholeins.length;
    for (let i = 0; i < length; i++) {
        handChildHtml(wholeins.eq(i), file,
            {
                script: {
                    locationScript: locationScript,
                    srcScript: srcScript
                },
                link: {
                    locationLink: locationLink,
                    srcLink: srcLink
                },
                style: {
                    locationStyle: locationStyle
                }
            })
    }
};