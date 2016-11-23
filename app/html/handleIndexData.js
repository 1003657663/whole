/**
 * Created by chao on 2016/11/16.
 * 处理主页面的数据
 */

let $ = require('cheerio');
let handChildHtml = require('./handleChildHtml');

module.exports = function (data, file, htmlDest, isIndex) {
    //data是来自主html文件的data
    let $dom = $.load(data, {decodeEntities: false});

    let defaultEl = {
        script: {pathTag: "src"},
        link: {pathTag: "href"},
        style: {},
    };

    let wholeins;
    $dom("*").filter(function (i, el) {
        var $this = $(this);
        if ($this.is("wholein")) {
            if ($this.is(":not([src])")) {
                console.error("主页面:" + file + "中包含的wholein标签必须含有src属性，请删除不含src属性的wholein标签");
                process.exit();
            }
            if (wholeins) {
                wholeins.add($this);//有错误
                //$this.add(wholeins);//有错误
            } else {
                wholeins = $this;
            }
        } else {
            for (let i in defaultEl) {
                let element = defaultEl[i];
                if ($this.is(i)) {
                    if ($this.is("[type=whole]")) {
                        if (element.pathTag) {//如果有资源tag
                            if ($this.is("[" + element.pathTag + "]")) {
                                if (element.src) {
                                    element.src.add($this);
                                } else {
                                    element.src = $this;
                                }
                            } else {
                                if (element.location) {
                                    console.error("主页面:" + file + "中包含多个定位" + i + "标签，规定只能有一个");
                                    process.exit();
                                } else {
                                    element.location = $this;
                                }
                            }
                        } else {
                            if (element.whole) {
                                element.whole.add($this);
                            } else {
                                element.whole = $this;
                            }
                        }
                    } else {
                        if (element.other) {
                            element.other.add($this);
                        } else {
                            element.other = $this;
                        }
                    }
                }
            }
        }
    });
    let length = wholeins.length;
    for (let i = 0; i < length; i++) {
        handChildHtml(wholeins.eq(i), file, defaultEl, isIndex);
    }
};