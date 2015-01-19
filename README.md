#SimpleTOC
模仿百度百科TOC(Table Of Contents)的jquery插件    

* [如何使用](#如何使用)
* [指定目录元素](#指定目录元素)
* [依赖第三方类库](#依赖第三方类库)
* [实际效果截图](#实际效果截图)


###如何使用
在页面引入依赖脚本与simpletoc脚本，加入默认样式文件   
```html
<script src="../libs/jquery/jquery-1.8.3.min.js"></script>
<script src="../libs/jqueryui/jquery-ui-1.9.1.custom.min.js"></script>
<script src="../libs/underscore-min.js"></script>
<script src="../src/javascripts/jquery.simpletoc.js"></script>
<link href="../src/stylesheets/toc.css" rel="stylesheet" type="text/css">
<script type="text/javascript">
    $(function(){
        $('body').toc();
    });
</script>
```

###指定目录元素
默认H1，H2，H3三级目录以逗号分隔，支持所有jquery selector，最高支持3级
```js
$(function(){
    $('body').toc({selectors:'h1,h2,h3'});
});
```

###依赖第三方类库
1. jQuery 1.7.2+ 
2. jQueryUI Widget Factory 1.8.21+ 
3. underscore.js


###实际效果截图
![效果](http://7tebg3.com1.z0.glb.clouddn.com/sssTOC.png)