'use strict';
/**
 * Created by chao on 2016/11/30.
 */

let fs = require('fs'),
    path = require('path');

module.exports = function copyFile(fromPath, toPath) {
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
                    let writeable = fs.createWriteStream(path.join(toPath + './' + path.basename(fromPath)));
                    readable.pipe(writeable);
                }
            });
        }
    });
};
