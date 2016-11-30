'use strict';
/**
 * Created by chao on 2016/11/30.
 */

let fs = require('fs'),
    myPath = require('./myPath'),
    copyFile = require('./copyFile');


/**
 * 数组去重
 * @param arr
 * @returns {*}
 */
function removeRepeat(arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    arr.sort();
    let one = arr[0];
    let sameStart;
    for (let i = 1; i < arr.length; i++) {
        if (one == arr[i]) {
            sameStart = i;
        } else {
            if (sameStart) {
                arr.splice(sameStart, i - sameStart);
                i -= (i - sameStart);
                sameStart = null;
            }
            one = arr[i];
        }
    }
}

module.exports = function writeResult(result, writeHtmlPath) {
    let resultTag = result.allTag;
    if (result.$dom) {
        fs.writeFile(writeHtmlPath, result.$dom.html(), function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("写入成功 done");
            }
        });
    }
    for (let i in resultTag) {
        let tag = resultTag[i];
        let paths = tag.paths;
        if (paths) {
            //数组去重
            removeRepeat(paths);
            if (tag.dest) {
                let destDir = myPath.destPath(tag.dest);
                if (!tag.min) {
                    for (let p = 0; p < paths.length; p++) {
                        copyFile(paths[p],destDir);
                    }
                }
            }
        }
    }
};

