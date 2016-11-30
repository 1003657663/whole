'use strict';
/**
 * Created by chao on 2016/11/16.
 */
module.exports = {
    dest: "./dist",

    html: {
        files: ["./test/index.html"],
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
};

