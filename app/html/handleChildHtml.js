/**
 * Created by w1003 on 2016/11/19.
 * 处理子页面的数据
 */
let path = require('path');
let fs = require('fs');
let myPath = require('../mypath');
let $ = require('cheerio');

module.exports = function (wholein, file, indexData) {
    //<wholein src="../index.js" ></wholein>

    let defaultEl = {"script": {}, "link": {}, "style": {}};//默认会被移动到主页面的数组

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
        let head = $dom("head");

        //处理子页面数据
/*        let script = {};
        let link = {};
        let style = {};*/
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
            } else if($this.is("wholein")){
                if(wholeins){
                    wholeins.add($this);
                }else{
                    wholeins = $this;
                }
            }else {
                let isAimElement = false;
                for (let i in defaultEl) {
                    if ($this.is(i)) {
                        isAimElement = true;
                        if ($this.is("[movetop]")) {
                            $this.removeAttr("movetop");
                            if (defaultEl[i].movetop) {
                                defaultEl[i].movetop.add($this);
                            } else {
                                defaultEl[i].movetop = $this;
                            }
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
                /*                if ($this.is("script")) {
                 isAimElement = true;
                 if ($this.is("[movetop]")) {
                 $this.removeAttr("movetop");
                 if (script.movetop) {
                 script.movetop.add($this);
                 } else {
                 script.movetop = $this;
                 }
                 } else if ($this.is("[movebottom]")) {
                 $this.removeAttr("movebottom");
                 if (script.movebottom) {
                 script.movebottom.add($this);
                 } else {
                 script.movebottom = $this;
                 }
                 } else if ($this.is("[notmove]")) {
                 $this.removeAttr("notmove");
                 isAimElement = false;
                 if (script.notmove) {
                 script.notmove.add($this);
                 } else {
                 script.notmove = $this;
                 }
                 } else {
                 if (script.other) {
                 script.other.add($this);
                 } else {
                 script.other = $this;
                 }
                 }
                 } else if ($this.is("link")) {
                 isAimElement = true;
                 if ($this.is("[movetop]")) {
                 $this.removeAttr("movetop");
                 if (link.movetop) {
                 link.movetop.add($this);
                 } else {
                 link.movetop = $this;
                 }
                 } else if ($this.is("[movebottom]")) {
                 $this.removeAttr("movebottom");
                 if (link.movebottom) {
                 link.movebottom.add($this);
                 } else {
                 link.movebottom = $this;
                 }
                 } else if ($this.is("[notmove]")) {
                 $this.removeAttr("notmove");
                 isAimElement = false;
                 if (link.notmove) {
                 link.notmove.add($this);
                 } else {
                 link.notmove = $this;
                 }
                 } else {
                 if (link.other) {
                 link.other.add($this);
                 } else {
                 link.other = $this;
                 }
                 }
                 } else if ($this.is("style")) {
                 isAimElement = true;
                 if ($this.is("[movetop]")) {
                 $this.removeAttr("movetop");
                 if (style.movetop) {
                 style.movetop.add($this);
                 } else {
                 style.movetop = $this;
                 }
                 } else if ($this.is("[movebottom]")) {
                 $this.removeAttr("movebottom");
                 if (style.movebottom) {
                 style.movebottom.add($this);
                 } else {
                 style.movebottom = $this;
                 }
                 } else if ($this.is("[notmove]")) {
                 $this.removeAttr("notmove");
                 isAimElement = false;
                 if (style.notmove) {
                 style.notmove.add($this);
                 } else {
                 style.notmove = $this;
                 }
                 } else {
                 if (style.other) {
                 style.other.add($this);
                 } else {
                 style.other = $this;
                 }
                 }
                 }*/

                if (isAimElement) {
                    if ($this.is(":not([notmove])")) {
                        $this.remove();
                    }
                }
            }
        });


        console.log($dom("body").html());

        if (!hasBody) {//如果没有body元素，但是又notmove元素，那么错误
            let isOk = false;
            for(let i in defaultEl){
                if(defaultEl[i].notmove && defaultEl[i].notmove.length >0){
                    console.error(src + "  无body元素的文件中的notmove标签是无效的，请把html代码用body元素包裹");
                    process.exit();
                }
            }
        }
    } else {
        //路径超出项目范围错误提示
        console.error(src + " 文件中的wholein的src:" + src + " 地址经过计算已经在wholefile.js所在的根目录之外，防止误修改根目录之外的文件,请修改");
        process.exit();
    }

}
;