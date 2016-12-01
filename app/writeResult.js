'use strict';
/**
 * Created by chao on 2016/11/30.
 */

let fs = require('fs'),
    myPath = require('./myPath'),
    path = require('path'),
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
            if (i == arr.length - 1) {
                arr.splice(i, 1);
            }
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

/**
 * 打印出文件地址列表
 * @param tag
 * @param paths
 */
function printList(tag, paths) {
    let data = tag + "\n" + paths.join('\n') + "\n\n";
    fs.writeFile(path.join(myPath.startPath(), 'pathlist.txt'), data, {flag: 'a'}, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log("写入成功  " + tag + "的pathlist");
    });

}

/**
 * 删除文件地址列表文件，相当于清空
 */
function clearOrCreateListFile() {
    try {
        fs.writeFileSync(path.join(myPath.startPath(), 'pathlist.txt'), "");
    } catch (e) {
        console.error(e);
    }
}
/**
 * 写入结果
 * @param result
 * @param writeHtmlPath
 */
module.exports = function writeResult(result, writeHtmlPath, config) {
    let resultTag = result.allTag;
    if (result.$dom) {
        fs.writeFile(writeHtmlPath, result.$dom.html(), function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("写入成功  " + writeHtmlPath);
            }
        });
    }
    //判断异步执行情况
    let tagLength = 0;
    let successNum = 0;

    for (let i in resultTag) {
        let tag = resultTag[i];
        let paths = tag.paths;
        if (paths) {
            tagLength++;
        }
    }

    function successCallback() {
        successNum++;
        if (successNum == tagLength) {
            console.error("done");
        }
    }

    if (config.printList) {
        clearOrCreateListFile();
    }
    for (let i in resultTag) {
        let tag = resultTag[i];
        let paths = tag.paths;
        if (paths) {
            //数组去重
            removeRepeat(paths);
            if (config.printList) {
                printList(i, paths);
            }
            if (tag.dest) {
                let destDir = myPath.destPath(tag.dest);
                if (!tag.min) {
                    copyFile(paths, destDir, successCallback);
                }
            }
        }
    }
};

