'use strict';
/**
 * Created by w1003 on 2016/11/19.
 */

let path = require('path'),
    fs = require('fs'),
    _startPath;
module.exports = {
    //是否pathA<pathB
    isBefore: function (pathA, pathB) {
        if (path.relative(pathA, pathB).indexOf('..\\') == -1) {
            return true;
        } else {
            return false;
        }
    },
    //是否pathA>pathB
    isAfter: function (pathA, pathB) {
        let relaPath = path.relative(pathA, pathB);
        if (relaPath.indexOf('..\\') == -1 || relaPath === "") {
            return false;
        } else {
            return true;
        }
    },
    //判断路径是否超界
    isOver: function (filePath) {
        if (!_startPath) {
            _startPath = process.argv[1];
        }
        let dir = path.dirname(_startPath);
        return this.isAfter(dir, filePath);//判断路径合法性
    },
    /**
     * 通过当前路径filt和相对路径src获得解析后的绝对路径
     * @param file
     * @param src
     * @returns {string|*}
     */
    getAbsolutePath: function (file, src, isDir) {
        let isDirPath = false;
        if (isDir) {
            isDirPath = isDir;
        } else {
            if (file.indexOf('.') == -1) {
                isDirPath = true;
            } else {
                isDirPath = false;
            }
        }
        if (isDirPath) {
            return path.join(file, src);
        } else {
            file = path.dirname(file);
            return path.join(file, src);
        }
    },
    startPath: function () {
        if (!_startPath) {
            _startPath = process.argv[1];
        }
        return path.dirname(_startPath);
    },
    destPath: function (destPath, fileName) {
        let _dPath = path.join(this.startPath(), destPath);
        let stat = fs.statSync(_dPath);
        if (!stat || !stat.isDirectory()) {
            try {
                fs.mkdirSync(_dPath);
                return path.join(_dPath, './' + fileName);
            } catch (e) {
                console.error(e);
            }
        } else if (stat && stat.isDirectory()) {
            return path.join(_dPath, './' + fileName);
        }
    }
};