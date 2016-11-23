/**
 * Created by w1003 on 2016/11/19.
 * 处理子页面的数据
 */
let path = require('path');
let fs = require('fs');
let myPath = require('../mypath');
let $ = require('cheerio');
let insertDataToIndex = require('./insertDataToIndex');

module.exports = function (wholein, file, indexData, isIndex) {
    //<wholein src="../index.js" ></wholein>

    let defaultEl = {
        script: {srcTag: "src"},
        link: {srcTag: "href"},
        style: {}
    };//默认会被移动到主页面的数组

    let separator = path.sep;//取得操作系统的目录路径 分隔符
    let src = wholein.attr('src');//取得被包含的文件的路径
    let inFilePath = path.normalize(process.cwd() + separator +//获取格式化后的绝对路径
        path.dirname(file) + separator + src);

    if (myPath.isBefore(process.cwd(), inFilePath)) {//判断路径合法性
        let data;
        try {
            data = fs.readFileSync(inFilePath).toString();//获取子页面数据
        } catch (e) {
            console.error(e.message);
            process.exit();
        }
        let $dom = $.load(data, {decodeEntities: false});

        //处理子页面数据
        let hasBody = false;
        let wholeins;


        $dom("*").filter(function (i, el) {
            var $this = $(this);
            if ($this.is("head")) {
                if ($this.find("script[notmove]").length > 0 || $this.find("link[notmove]").length > 0) {
                    console.error(src + "中的notmove的script或者link标签不可以放在head中，因为head中的标签能被解析到body中并且不移动，请在body中写notmove标签");
                    process.exit();
                }
            } else if ($this.is("body")) {
                hasBody = true;
            } else if ($this.is("wholein")) {
                if (wholeins) {
                    wholeins.add($this);
                } else {
                    wholeins = $this;
                }
            } else {
                let isAimElement = false;
                for (let i in defaultEl) {
                    if ($this.is(i)) {
                        isAimElement = true;
                        if ($this.is("[movetop]")) {
                            $this.removeAttr("movetop");
                            handlePathELement($this, file, defaultEl[i].srcTag);
                            if (defaultEl[i].movetop) {
                                defaultEl[i].movetop.add($this);
                            } else {
                                defaultEl[i].movetop = $this;
                            }
                            console.log($this.path);
                        } else if ($this.is("[movebottom]")) {
                            $this.removeAttr("movebottom");
                            if (defaultEl[i].movebottom) {
                                defaultEl[i].movebottom.add($this);
                            } else {
                                defaultEl[i].movebottom = $this;
                            }
                        } else if ($this.is("[notmove]")) {
                            $this.removeAttr("notmove");
                            isAimElement = false;
                            if (defaultEl[i].notmove) {
                                defaultEl[i].notmove.add($this);
                            } else {
                                defaultEl[i].notmove = $this;
                            }
                        } else {
                            if (defaultEl[i].other) {
                                defaultEl[i].other.add($this);
                            } else {
                                defaultEl[i].other = $this;
                            }
                        }
                    }
                }

                if (isAimElement) {
                    if ($this.is(":not([notmove])")) {
                        $this.remove();
                    }
                }
            }
        });

        if (!hasBody) {//如果没有body元素，但是又notmove元素，那么错误
            for (let i in defaultEl) {
                if (defaultEl[i].notmove && defaultEl[i].notmove.length > 0) {
                    console.error(src + "  无body元素的文件中的notmove标签是无效的，请把html代码用body元素包裹");
                    process.exit();
                }
            }
        }
        if (wholeins) {
            console.log(wholeins.toString());
        }
        return;
        insertDataToIndex(defaultEl);
    } else {
        //路径超出项目范围错误提示
        console.error(src + " 文件中的wholein的src:" + src + " 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
        process.exit();
    }

};
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
/**
 * 通过当前路径filt和相对路径src获得解析后的绝对路径
 * @param file
 * @param src
 * @returns {string|*}
 */
function getAbsolutePath(file, src) {
    var dir = path.dirname(file);
    return path.join(file, src);
}