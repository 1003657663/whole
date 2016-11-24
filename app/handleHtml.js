'use strict';
/* jshint unused:false */
/**
 * Created by w1003 on 2016/11/23.
 */
let $ = require('cheerio'),
    path = require('path'),
    fs = require('fs'),
    myPath = require('./myPath');

/**
 * 通过当前路径filt和相对路径src获得解析后的绝对路径
 * @param file
 * @param src
 * @returns {string|*}
 */
function getAbsolutePath(file, src) {
    console.log(file);
    let dir = path.dirname(file);
    return path.join(dir, src);
}

/**
 * 处理标签中的连接src和href属性
 * @param element
 */
function handlePathELement(element, file, srcTag) {
    //可能没有src标签比如<script>和<style>
    if (srcTag) {
        if (element.attr(srcTag)) {
            element.path = getAbsolutePath(file, element.attr(srcTag));
        }
    }
}

function resolveHtml($dom, filePath) {

    let body,
        wholein,
        defaultEl = {
            body: null,
            script: {pathTag: "src"},
            link: {pathTag: "href"},
            style: {}
        };

    $dom("*").filter(function () {
        let $this = $(this);
        if ($this.is("head")) {
            for (let i in defaultEl) {
                if ($this.find(i + "[notmove]").length > 0) {
                    console.error(filePath + "中的notmove的script或者link标签不可以放在head中，因为head中的标签能被解析到body中并且不移动，请在body中写notmove标签");
                    process.exit();
                }
            }
        } else if ($this.is("body")) {
            body = $this;
        } else if ($this.is("wholein")) {
            if ($this.is(":not([src])")) {
                console.error("页面:" + filePath + "中包含的wholein标签必须含有src属性，请删除不含src属性的wholein标签");
                process.exit();
            }
            if (wholein) {
                wholein.add($this);
            } else {
                wholein = $this;
            }
        } else {
            for (let i in defaultEl) {
                if ($this.is(i)) {
                    let element = defaultEl[i];
                    if ($this.is("[type=whole]")) {//如果type是whole那么是index专用标签，单独解析
                        if (element.pathTag) {//如果有资源tag
                            if ($this.is("[" + element.pathTag + "]")) {
                                if (element.src) {
                                    element.src.add($this);
                                } else {
                                    element.src = $this;
                                }
                            } else {
                                if (element.location) {
                                    console.error("页面:" + filePath + "中包含多个定位" + i + "标签，规定只能有一个");
                                    process.exit();
                                } else {
                                    element.location = $this;
                                }
                            }
                        } else {//如果type不是whole，就是child专用标签，单独解析
                            if ($this.is("[movetop]")) {
                                $this.removeAttr("movetop");
                                handlePathELement($this, filePath, element.srcTag);
                                if (element.movetop) {
                                    element.movetop.add($this);
                                } else {
                                    element.movetop = $this;
                                }
                                console.log($this.path);
                            } else if ($this.is("[movebottom]")) {
                                $this.removeAttr("movebottom");
                                if (element.movebottom) {
                                    element.movebottom.add($this);
                                } else {
                                    element.movebottom = $this;
                                }
                            } else if ($this.is("[notmove]")) {
                                $this.removeAttr("notmove");
                                let isAimElement = false;
                                if (element.notmove) {
                                    element.notmove.add($this);
                                } else {
                                    element.notmove = $this;
                                }
                            } else {
                                if (element.other) {
                                    element.other.add($this);
                                } else {
                                    element.other = $this;
                                }
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

    if (body) {//如果没有body元素，但是有notmove元素，那么错误
        for (let i in defaultEl) {
            if (defaultEl[i] && defaultEl[i].notmove && defaultEl[i].notmove.length > 0) {
                console.error(filePath + "  无body元素的文件中的notmove标签是无效的，请把html代码用body元素包裹");
                process.exit();
            }
        }
    }

    return {
        body: body,
        wholein: wholein,
        allTag: defaultEl
    };
}
function handleResult($, result) {
    let body = result.body;

    let allTag = result.allTag;

}


function fileExist(file) {

}


module.exports = function handleHtml(filePath) {
    //参数是文件路径，必须是单个文件
    if (myPath.isAfter(process.cwd(), filePath)) {//判断路径是否超界，合法性
        console.error(filePath + "  文件的路径在执行更目录之外，不合法，请引用项目目录下的文件");
        process.exit();
    }
    //判断文件存在性,直接读取文件，出错则结束说明文件有问题
    let fileData;//由于读取文件一定会成功后才进入下一步，所以fileData不会为空
    try {
        fileData = fs.readFileSync(filePath);
    } catch (e) {
        console.error(e.message);
        process.exit();
    }

    //读取文件的wholein属性，并且递归给下一个
    let $dom = $.load(fileData);
    let resolveData = resolveHtml($dom, filePath);
    let wholein = resolveData.wholein;

    if (wholein && wholein.filter(":not([src])").length > 0) {
        console.error("wholeins标签必须有src属性，请修改 " + filePath + "中的wholeins标签");
        process.exit();
    }


    //**************************************************接下来处理返回的数据，并返回
    if (wholein) {
        for (let i = 0; i < wholein.length; i++) {
            let result = handleHtml(wholein.eq(i).attr("src"));
            handleResult($dom, result);//先处理返回结果，处理后，在解析当前页面
        }
    }


    //返回处理结果
    return {
        data: "",//data数据也就是将要替换wholein的数据，可以是多个或者一个标签
        allTag: {
            script: {
                notmove: {
                    thedata: "",
                    path: "",
                },
                movetop: "",
                movebottom: "",
                other: "",
                srcTag: "src",
            },
            link: {
                srcTag: "href",

            },
            style: {},
            user: {}
        }
    };
};


