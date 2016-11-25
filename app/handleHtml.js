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
 * 处理标签中的连接src和href属性
 * @param element
 */
function handlePathELement(element, file, srcTag) {
    //可能没有src标签比如<script>和<style>
    if (srcTag) {
        if (element.attr(srcTag)) {
            element.path = myPath.getAbsolutePath(file, element.attr(srcTag));
        }
    }
}

/**
 * 解析html中的script，link，style标签和其他自定义标签
 * @param $dom
 * @param filePath
 * @returns {{body: *, wholein: *, allTag: {body: null, script: {pathTag: string}, link: {pathTag: string}, style: {}}}}
 */
function resolveHtml($dom, filePath) {

    let body,
        wholein,
        head,
        defaultEl = {
            script: {pathTag: "src"},
            link: {pathTag: "href"},
            style: {}
        };

    $dom("*").filter(function () {
            let $this = $(this);
            if ($this.is("head")) {
                head = $this;
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
                            }
                        } else {//如果type不是whole，就是child专用标签，单独解析
                            if ($this.is("[notmove]")) {
                                if (element.notmove) {
                                    element.notmove.add($this);
                                } else {
                                    element.notmove = $this;
                                }
                            } else {
                                handlePathELement($this, filePath, element.srcTag);
                                $this.remove();
                                if (element.other) {
                                    element.other.add($this);
                                } else {
                                    element.other = $this;
                                }
                            }
                        }
                    }
                }
            }
        }
    );

    if (!body) {//如果没有body元素，但是有notmove元素，那么错误
        for (let i in defaultEl) {
            if (defaultEl[i] && defaultEl[i].notmove && defaultEl[i].notmove.length > 0) {
                console.error(filePath + "  无body元素的文件中的notmove标签是无效的，请把html代码用body元素包裹");
                process.exit();
            }
        }
    }

    return {
        head: head,
        body: body,
        wholein: wholein,
        $dom: $dom,
        allTag: defaultEl
    };
}
/**
 * 处理返回的数据，增删改相应的dom结构,时刻牢记任何一个标签都可能为空，需要判空
 * @param $dom
 * @param result
 */
function handleResult(resolveResult, result, thisWholein) {
    let thisAllTag = resolveResult.allTag;
    let thisBody = resolveResult.body;
    let thisHead = resolveResult.head;

    let thatAllTag = result.allTag;//allTag{script:{notmove:"",other:""},link}
    let thatBody = result.body;
    let thatHead = result.head;
    let thatDom = result.$dom;

    for (let i in thatAllTag) {
        if (thatAllTag[i]) {
            let tag = thatAllTag[i];
            if (tag.notmove && tag.notmove.length > 0) {
                //首先净化标签
                tag.notmove.removeAttr("notmove");
                //notmove不做移动
            }
            if (tag.other && tag.other.length > 0) {
                for (let h = 0; h < tag.other.length; h++) {
                    let $this = tag.other.eq(h);
                    if ($this.is("[movetop]")) {
                        //首先净化标签
                        $this.removeAttr("movetop");
                        //把movetop插入head最底部
                        thisHead.append($this);
                    } else if ($this.is("[movebottom]")) {
                        //首先净化标签
                        $this.removeAttr("movebottom");
                        //movebottom插入到body下面
                        $this.insertAfter(thisBody);
                    } else {//判断是否script插入到头部或者尾部
                        if ($this.is("script")) {
                            $this.insertAfter(thisBody);
                        } else {
                            thisHead.append($this);
                        }
                    }
                }
            }
        }
    }
    //body未过滤，这里需要过滤
    thisWholein.replaceWith(thatDom("*"));
}

/**
 * module,入口
 * @param filePath
 * @returns {{data: string, allTag: {script: {notmove: {thedata: string, path: string}, movetop: string, movebottom: string, other: string, srcTag: string}, link: {srcTag: string}, style: {}, user: {}}}}
 */
module.exports = function handleHtml(filePath, global) {
    console.log("正在解析：" + filePath);
    //参数是文件路径，必须是单个文件
    if (myPath.isOver(filePath)) {//判断路径是否超界，合法性
        console.error(filePath + "  文件的路径在执行目录之外，不合法，请引用项目目录下的文件");
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
    let $dom = $.load(fileData, {decodeEntities: false});
    let resolveData = resolveHtml($dom, filePath);
    let wholein = resolveData.wholein;

    if (wholein && wholein.filter(":not([src])").length > 0) {
        console.error("wholeins标签必须有src属性，请修改 " + filePath + "中的wholeins标签");
        process.exit();
    }


    //**************************************************接下来处理返回的数据，并返回
    if (wholein) {
        for (let i = 0; i < wholein.length; i++) {
            let path = myPath.getAbsolutePath(filePath, wholein.eq(i).attr("src"));
            let result = handleHtml(path);
            handleResult(resolveData, result, wholein.eq(i));//先处理返回结果，处理后，在解析当前页面
            console.log(path + "\n\n" + $dom.html());
        }
    }

    //返回处理结果
    return resolveData;
};


