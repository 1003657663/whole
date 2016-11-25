
# 入门
0. 安装whole
```
node install whole -g
node install whole --save-dev
```
1. 在项目根目录下创建wholefile.js文件

```
var whole = require('whole.js');
whole.task({
    html:{
        files:["index.html"],
        dest:"./dist"
    },
    css:{
        cssmin:"cssmin",
        dest:"./dist/css"
    },
    js:{
        jsmin:"uglify",
        dest:"./dist/js"
    }
});
```
2. 执行
```
whole
```

# wholefile.js配置
### html字段
* dest  
代表html被解析后保存的路径  
* files  
代表主html页面路径，可以是数组，也可以是一个文件路径

### css字段
* dest  
代表css被解析后保存的路径  
* cssmin  
代表css的压缩插件，可以选择的有"cssmin"

### js字段
* dest  
代表js被解析后的保存路径  
* jsmin  
代表js的压缩插件，可以选择的有"uglify"

#使用说明
* 通过wholein标签引入代码
```
<!--index.html-->
<head>
    <style>
        html,body{margin:0;}
    </style>
</head>
<body>
    <h1></h1>
    <wholein src = "child/nav.html"></wholein><!--标签在这-->
<body>

<!--child.html-->
<head>
    <link rel="stylesheet" href="index.css">
    <script src="index.js"></script>
    <style>
        a{color:red;}
    </style>
</head>
<body>
    <nav>
        <ul></ul>
    <nav>
<body>

<!--解析后-->
<head>
    <style>
        html,body{margin:0;}
    </style>
    <link rel="stylesheet" href="index.css">
    <style>
        a{color:red;}
    </style>
    <script src="index.js"></script>
</head>
<body>
    <h1></h1>
    <nav>
        <ul></ul>
    <nav>
<body>
```
* 主html文件代表就是最终展示给用户看的html文件，子html文件代表的是将被include进主html文件的子文件
将主html文件路径填写进配置中，子html将被自动解析，解析规则如下
###主html页面

* 主html文件

    通过改变type为whole，标识这个位置用来存放所有从子页面解析过来的js文件标签
    ```
    <script type="whole"></script>
    ```
    通过加上src路径，标识从子页面中解析的js标签放到特定的位置
    ```
    <script type="whole" src="./js/index.js"></script>
    ```
    link标签如上
    ```
    <link type="whole">
    <link type="whole" href="./css/index.css>
    ```
    如果style，link，script标签都没有type="whole"的位置标记标签，那么默认script位置是body之后，其它标签位置是head标签最底部，
    顺序是按照原来页面中的顺序排列
    
### 子html页面

* 子html页面  

    子html页面有两种布局方式，一种是标准html布局,以下为必须标签,
    这种方式是为了子页面测试用，解析的时候将忽略html，head和body标签  
    ```
    <html>
        <head>
        </head>
        <body>
        </body>
    </html>
    ```
    另一种是直接写代码方式,没有html，head，body标签
    ```
    <script></script>
    <style>
    
    </style>
    
    <nav>
        <ul>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    </nav>
    ```
    子页面的script标签,有notmove、movebottom、movetop属性，其中notMove只有在标准html的子页面并且标签写在body中
    才有效，此时标签将保留在html代码中，不会移动到头部或者尾部  
    movebottom将会把标签移动到head标签中，移动规则参见主html页面说明  
    movetop将会把标签移动到body元素的最底部
    1. notmove说明
    * 移动前
    ```
    <!--child.html-->
    <html>
        <head>
        </head>
        <body>
            <nav>
                <script notmove src="../index.js"></script>
                <ul>
                </ul>
            </nav>
        </body>
    </html>
    
    ```
    * 移动后,位置不变,但是notmove属性会被去掉
    ```
    <!--index.html-->
    <html>
        <head>
        </head>
        <body>
            <nav>
                <script src="../index.js"></script>
                <ul>
                </ul>
            </nav>
        </body>
    </html>
    ```
    2. movebottom
    * 移动前
    ```
    <nav>
        <script movebottom src="index.js"><script>
        <ul>
        </ul>
    <nav>
    ```
    * 移动后
    ```
    <body>
        <nav>
            <ul>
            </ul>
        </nav>
        <script src="index.js"><script>
    </body>
    ```
    3. movetop
    * 移动前
    ```
    <nav>
        <script movetop src="index.js"><script>
        <ul>
        </ul>
    <nav>
    ```
    * 移动后
    ```
    <head>
        <script src="index.js"><script>
    </head>
    <body>
        <nav>
            <ul>
            </ul>
        </nav>
    </body>
    
    ```
# FAQ
1. 路径问题，所有路径请按照文件所在的路径的相对路径写，软件会自动处理
2. 子页面中也可以使用include另一个页面，但是最终生成的页面只有填写在wholefile.js路径中的页面