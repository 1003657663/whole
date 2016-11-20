/**
 * Created by w1003 on 2016/11/19.
 */

var path = require('path');

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
    }
}