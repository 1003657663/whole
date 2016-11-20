/**
 * Created by chao on 2016/11/16.
 */
var whole = require('../app/whole.js');
whole.task({
    dest:"./dist",
    html:{
        files:["index.html"],
        dest:"./dist"
    },
    css:{
        cssmin:"cssmin",
        dest:"./dist/css"
    },
    js:{
        jsmin:"uglify",
        dest:"./dist/js"
    }
});

