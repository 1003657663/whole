'use strict';
/* jshint unused:false */
/**
 * Created by w1003 on 2016/11/23.
 */
let $ = require('./lib/cheerio/index'),
    path = require('path'),
    fs = require('fs'),
    myPath = require('./myPath'),
    resolveHtml = require('./resolveHtml');


/**
 * 判断this页面中是否包含子页面中的相同路径的相同的标签
 * @param oneTag
 * @param tagName
 * @param thisAllTag
 * @param pathTag
 * @returns {boolean}
 */
function isTagRepeat(oneTag, tagName, thisAllTag, pathTag) {
    let path = oneTag.attr(pathTag);
    if (path) {
        let aimTag = thisAllTag[tagName];
        if (aimTag) {
            let other = aimTag.other;
            if (other) {
                for (let i = 0; i < other.length; i++) {
                    if (other.eq(i).is(tagName)) {
                        if (path == other.eq(i).attr(pathTag)) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}
/**
 * 处理标签中的连接src和href属性
 * @param thisElement
 */
function handlePathELement(oneTag, thisElement, filePath, writeHtmlPath) {
    //可能没有src标签比如<script>和<style>
    //最终地址是dest规定的地址，需要计算
    if (oneTag.pathTag) {
        let tagPath = thisElement.attr(oneTag.pathTag);

        if (tagPath) {
            //把文件所在路径存入数组，后续处理文件
            //判断是否存在
            if (!fs.existsSync(tagPath)) {
                console.error(filePath + "中的标签中的路径" + tagPath + "不存在，请更改");
                process.exit();
            }
            if (!Array.isArray(oneTag.paths)) {
                oneTag.paths = [];
            }
            oneTag.paths.push(tagPath);
            //修改attr src中的路径
            let attrPath = path.join(path.relative(writeHtmlPath, oneTag.dest), path.basename(tagPath));
            thisElement.attr(oneTag.pathTag, attrPath);
        }
    }
}

/**
 * 通过解析最终生成的html节点，获取各个标签的路径，并且更改路径属性
 * @param resolveData
 * @param filePath
 */
function resolveIndexData(resolveData, filePath, writeHtmlPath) {
    let $dom = resolveData.$dom;
    let allTag = resolveData.allTag;
    $dom("*").filter(function () {
        let $this = $(this);
        for (let i in allTag) {
            let oneTag = allTag[i];
            if ($this.is(i) && oneTag.pathTag && $this.is("[" + oneTag.pathTag + "]")) {
                handlePathELement(oneTag, $this, filePath, writeHtmlPath);
            }
        }
    });
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
                    //判断页面中是否已经有此标签，有的话不进行继续添加
                    if (isTagRepeat($this, i, thisAllTag, tag.pathTag)) {
                        continue;
                    }
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
                    } else {
                        if (tag.location) {//判断是否有定位标签
                            tag.location.insertAfter($this);
                        } else {
                            //判断是否script插入到头部或者尾部
                            if ($this.is("script")) {
                                $this.insertAfter(thisBody);
                            } else {
                                thisHead.append($this);
                            }
                        }
                    }
                    if (h == tag.other.length - 1) {//在最后一次执行中，去掉whole定位标签
                        if (tag.location) {
                            tag.location.remove();
                        }
                    }
                }
            }
        }
    }
    //body未过滤，这里需要过滤
    if (thatBody) {
        thisWholein.replaceWith(thatBody.children());
    } else {
        thisWholein.replaceWith(thatDom("*"));
    }
}


/**
 * module,入口
 * @param filePath
 * @param writeHtmlPath
 * @param defaultTag
 * @param isFirst
 * @returns {{data: string, allTag: {script: {notmove: {thedata: string, path: string}, movetop: string, movebottom: string, other: string, srcTag: string}, link: {srcTag: string}, style: {}, user: {}}}}
 */
module.exports = function handleHtml(filePath, writeHtmlPath, defaultTag, isFirst) {
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
    let resolveData = resolveHtml($dom, filePath, defaultTag, isFirst);//解析当前页面
    let wholein = resolveData.wholein;

    if (wholein && wholein.filter(":not([src])").length > 0) {
        console.error("wholeins标签必须有src属性，请修改 " + filePath + "中的wholeins标签");
        process.exit();
    }

    //**************************************************接下来处理返回的数据，并返回
    if (wholein) {
        for (let i = 0; i < wholein.length; i++) {
            let path = myPath.getJoinPath(filePath, wholein.eq(i).attr("src"));
            let result = handleHtml(path, writeHtmlPath, defaultTag);
            handleResult(resolveData, result, wholein.eq(i), isFirst);//先处理返回结果，处理后，在解析当前页面
        }
        if (isFirst) {
            //处理最终解析结果，各个标签的路径处理和，对应的文件压缩和复制
            resolveIndexData(resolveData, filePath, writeHtmlPath);
        }
    }

    //返回处理结果
    return resolveData;
};




