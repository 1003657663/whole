'use strict';
/**
 * Created by chao on 2016/11/16.
 */

let task = require('./task.js');
let path = require('path');
let fs = require('fs');

//判断是否存在配置文件参数，比如whole a.js,不存在采用默认wholefile.js
let file = process.argv[2];
let configFile;
if (file && fs.existsSync(path.join(process.cwd(), file))) {
    configFile = path.join(process.cwd(), file);
} else {
    configFile = path.join(process.cwd(), "wholefile.js");
}

let config;
try {
    config = require(configFile);
} catch (e) {
    console.error("请添加wholefile.js文件,或者是使用的配置文件格式不对，详情见https://github.com/1003657663/whole");
    console.error(e);
    process.exit();
}
task(config);
