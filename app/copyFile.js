'use strict';
/**
 * Created by chao on 2016/11/30.
 */

let fs = require('fs'),
    myPath = require('./myPath'),
    path = require('path');


function copyOneFile(fromPath, toPath, successCallBack,p) {
    fs.stat(toPath, function (err, st) {
        if (err) {
            console.error("读取文件路径" + toPath + "失败，请检查");
            console.error(err);
        }
        if (st.isDirectory()) {
            fs.stat(fromPath, function (err, stat) {
                if (err) {
                    console.error("读取文件路径" + toPath + "失败，请检查");
                    console.error(err);
                }
                if (stat.isFile()) {
                    let readable = fs.createReadStream(fromPath);
                    let writeable = fs.createWriteStream(myPath.join(toPath, path.basename(fromPath)));
                    writeable.on('finish', function () {
                        successCallBack(p);
                    });
                    readable.pipe(writeable);
                }
            });
        }
    });
}

/**
 * 文件拷贝
 * @param fromPath
 * @param toPath
 * @param paths
 */
module.exports = function copyFile(paths, toPath, successCallback) {

    for (let p = 0; p < paths.length; p++) {
        copyOneFile(paths[p], toPath, function (p) {
            console.log("写入成功  " + paths[p]);
            if (p == paths.length - 1) {
                successCallback();
            }
        },p);
    }
};

