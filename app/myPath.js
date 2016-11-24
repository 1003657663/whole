'use strict';
/**
 * Created by w1003 on 2016/11/19.
 */

let path = require('path'),
    cwdPath;
module.exports = {
    isBefore: function (pathA, pathB) {
        if (path.relative(pathA, pathB).indexOf('..\\') == -1) {
            return true;
        } else {
            return false;
        }
    },
    isAfter: function (pathA, pathB) {
        if (path.relative(pathA, pathB).indexOf('..\\') == -1) {
            return false;
        } else {
            return true;
        }
    },
    isOver: function (filePath) {
        if (!cwdPath) {
            cwdPath = process.cwd();
        }
        return this.isAfter(cwdPath, filePath);//判断路径合法性
    }
};