/**
 * Created by chao on 2016/11/16.
 * 处理主页面的数据
 */

let $ = require('cheerio');
let handChildHtml = require('./handleChildHtml');

module.exports = function (data, file, htmlDest) {
    //data是来自主html文件的data

    var defaultEl = {
        script:{srcTag:"src"},
        link:{srcTag:"href"},
        style:{}
    };

    let wholeins;
    let $dom = $.load(data,{decodeEntities:false});

    $dom("*").filter(function () {
        var $this = $(this);
        if($this.is("wholein")){
            if($this.is(":not([src])")){
                console.error("主页面:" + file + "中包含的wholein标签必须含有src属性，请删除不含src属性的wholein标签");
                process.exit();
            }
            if(wholeins){
                wholeins.add($this);
            }else{
                wholeins = $this;
            }
        }else{
            for(let i in defaultEl){
                let elementInfo = defaultEl[i];
                if($this.is(i)){
                    if($this.is("[type=whole]")){
                        if($this.is("["+elementInfo.srcTag+"]")){
                            if(elementInfo.src){
                                elementInfo.src.add($this);
                            }else {
                                elementInfo.src = $this;
                            }
                        }else{
                            if(elementInfo.location){
                                //第二个错误
                                console.error("主页面:" + file + "中包含多个定位"+i+"标签，规定只能有一个");
                                process.exit();
                            }else {
                                elementInfo.location = $this;
                            }
                        }
                    }
                }
            }
        }
    });

    console.log()
    let length = wholeins.length;
    for (let i = 0; i < length; i++) {
        handChildHtml(wholeins.eq(i), file,
            {
                script: {
                    locationScript: locationScript,
                    srcScript: srcScript
                },
                link: {
                    locationLink: locationLink,
                    srcLink: srcLink
                },
                style: {
                    locationStyle: locationStyle
                }
            })
    }
};