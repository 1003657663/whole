'use strict';
/**
 * Created by chao on 2016/11/29.
 */

/**
 * 解析html中的script，link，style标签和其他自定义标签
 * @param $dom
 * @param filePath
 * @returns {{body: *, wholein: *, allTag: {body: null, script: {pathTag: string}, link: {pathTag: string}, style: {}}}}
 */
let $ = require('cheerio');
let tools = require('./tools');



module.exports = function resolveHtml($dom, filePath, defaultTag, isFirst) {

    let defaultElements = tools.clone(defaultTag);
    let body, wholein, head;

    $dom("*").filter(function () {
            let $this = $(this);
            if ($this.is("head")) {
                head = $this;
                for (let i in defaultElements) {
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
                for (let i in defaultElements) {
                    //i is script || link || style
                    if ($this.is(i)) {
                        let element = defaultElements[i];
                        //element is script || link || style
                        if ($this.is("[type=whole]")) {//如果type是whole那么是index专用标签，单独解析
                            $this.removeAttr("type");
                            if (element.pathTag) {//如果有资源tag
                                if ($this.is("[" + element.pathTag + "]")) {
                                    console.error("页面" + filePath + "中包含type=whole且有资源路径的标签，此标签不会被解析，请修改");
                                    process.exit();
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
                                if (!isFirst) {//isFirst代表首页，只有不是首页才需要remove
                                    $this.remove();
                                }
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
        for (let i in defaultElements) {
            if (defaultElements[i] && defaultElements[i].notmove && defaultElements[i].notmove.length > 0) {
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
        allTag: defaultElements
    };
};
