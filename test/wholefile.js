'use strict';
/**
 * Created by chao on 2016/11/16.
 */
let whole = require('../app/whole.js');
whole.task({
    dest: "./dist",

    html: {
        files: ["index.html"],
        dest: "html"
    },
    tag: {
        script: {
            pathTag: "src",
            dest: "js",
        },
        link: {
            pathTag: "href",
            dest: "css",
        },
        style: {},
    }
});

