/**
 * jquery toc plugin
 * -v 1.0.0
 * -create time 2015-1-9
 * Copyright (c) 2015 zachary woo
 * Licensed MIT
 **/
(function (plugin) {
        plugin(window, document, window.jQuery);
    }
    (function (window, document, $, undefined) {

        //存储目录元素集合
        var items = [],
            //生成ID的起始种子
            idSeed = [0, 0, 0];
        // Calling the jQueryUI Widget Factory Method
        $.widget("mcblog.toc", {

            //Plugin version
            version: "1.0.0",

            // selectors最高支持3级
            options: {
                context: "body",
                selectors: "h1, h2, h3"
            },
            _create: function () {
                var self = this;
                //过滤出所有目录标记
                self._filterSelectors();
                self._generateHTML();
                self._bindEvent();
            },
            _filterSelectors: function () {
                var self = this;
                items = $(self.options.context).find(self.options.selectors);
            },
            _getLevel: function (dom) {
                //判断元素标签级别
                var self = this;
                var selectors = self.options.selectors.replace(/ /g, "").toLocaleLowerCase();
                var temp = selectors.split(",");
                var tagName = $(dom).prop("tagName").toLocaleLowerCase();

                return temp.indexOf(tagName);
            },
            _generateId: function (dom) {
                var self = this,
                    level = self._getLevel(dom);
                if (level === 0) {
                    idSeed[0] += 1;
                    idSeed[1] = 0;
                    idSeed[2] = 0;
                } else if (level === 1) {
                    idSeed[1] += 1;
                    idSeed[2] = 0;
                } else if (level === 2) {
                    idSeed[2] += 1;
                } else {
                    throw new Error("不支持元素级别超过3级");
                }
            },
            _getId: function (dom) {
                var self = this,
                    level = self._getLevel(dom);
                self._generateId(dom);
                var id = [];
                for (var i = 0; i <= level; i++) {
                    id.push(idSeed[i]);
                }
                return id;
            },
            _generateHTML: function () {
                var self = this;
                $dl = $('<dl id="sideCatalog-dl"/>')
                $.each(items, function () {
                    var id = self._getId(this),
                        level = self._getLevel(this),
                        $el = $(this);
                    //设置锚点
                    $el.attr('data-anchor', 'anchor' + id.join('-'));
                    //创建导航
                    $('<dd/>', {
                        "id": "sideToolbar-item-" + id.join("-"),
                        "class": "sideCatalog-item" + (level + 1),
                        "data-unique": 'anchor' + id.join('-'),
                        "data-target": $el.prop('tagName')
                    }).append(
                        $('<span/>', {
                            "class": "sideCatalog-index" + (level + 1)
                        }).text(id.join("."))
                    ).append(
                        $('<a/>', {
                            "title": $el.text(),
                            "href": "#" + $el.text()
                        }).text($el.text())
                    ).append(
                        $('<span class="sideCatalog-dot"/>')
                    ).appendTo($dl)
                });
                var $div = $('<div id="sideCatalog-catalog"/>').append($dl);

                var $siteCatalog = $('<div/>', {
                        class: "sideCatalogBg",
                        id: "sideCatalog"
                    })
                    .append('<div id="sideCatalog-sidebar"><div class="sideCatalog-sidebar-top"></div><div class="sideCatalog-sidebar-bottom"></div></div><div id="sideCatalog-updown"><div title="向上翻页" class="sideCatalog-up-disable" id="sideCatalog-up"></div><div title="向下翻页" class="sideCatalog-down-enable" id="sideCatalog-down"></div></div>')
                    .append($div);

                $('<div class="sideToolbar" id="sideToolbar"/>')
                    .append($siteCatalog)
                    .append('<a href="javascript:void(0);" id="sideCatalogBtn"></a>')
                    .appendTo('body');

                //添加页面扩展extend满足最后一个目录可以滚动到页面顶部
                var lastItem = items[items.length - 1];
                var extendHeight = $(window).height() - ($("body")[0].scrollHeight - $(lastItem).offset().top)

                if (extendHeight > 0) {
                    $('<div/>', {
                        height: extendHeight
                    }).appendTo(self.options.context);
                }
            },
            _bindEvent: function () {
                var self = this;
                //单击目录导航事件
                $('#sideCatalog')
                    .on('click.toc', 'dd', function () {
                        self._scrollTo($(this));
                        $('dd.highlight').removeClass('highlight');
                        $(this).addClass('highlight');
                        self._refreshCatalogPosition(); //click 后将触发 scroll事件，scroll事件中已经执行了_refreshCatalogPosition
                        return false;
                    })
                    .on('mouseenter.toc', function () {
                        if ($('#sideCatalog-dl').height() > $('#sideCatalog-catalog').height())
                            $('#sideCatalog-updown').show();
                    })
                    .on('mouseleave.toc', function () {
                        $('#sideCatalog-updown').hide();
                    });
                //内容滚动条，滚动事件
                var scrollFun = _.throttle(function () {
                    $("html,body").promise().done(function () {
                        // Stores how far the user has scrolled
                        var winScrollTop = $(window).scrollTop(),
                            // Stores the height of the window
                            winHeight = $(window).height(),
                            // Stores the height of the document
                            docHeight = $(document).height(),
                            scrollHeight = $("body")[0].scrollHeight;

                        // Stores the distance to the closest anchor
                        var closestAnchorDistance = null,
                            // Stores the index of the closest anchor
                            closestAnchorIdx = null,
                            // Keeps a reference to all anchors
                            anchors = items;
                        // Determines the index of the closest anchor
                        anchors.each(function (idx) {
                            var distance = Math.abs($(this).offset().top - winScrollTop);
                            if (closestAnchorDistance == null || distance < closestAnchorDistance) {
                                closestAnchorDistance = distance;
                                closestAnchorIdx = idx;
                            } else {
                                return false;
                            }
                            var unique = $(anchors[closestAnchorIdx]).data("anchor")
                            $('dd').removeClass('highlight');
                            $('dd[data-unique="' + unique + '"]').addClass('highlight');
                        });
                        self._refreshCatalogPosition();
                    });
                }, 300);
                $(window).scroll(scrollFun);
                //向上向下按钮事件
                var offset = 3 * 25; //上下偏移量
                $('#sideCatalog-up').click(function () {
                    if ($(this).hasClass('sideCatalog-up-disable')) return false;
                    if ($("#sideCatalog-down").hasClass('sideCatalog-down-disable')) {
                        $("#sideCatalog-down").removeClass('sideCatalog-down-disable').addClass('sideCatalog-down-enable');
                    }
                    if ($("#sideCatalog-dl").position().top + offset >= 0) {
                        $(this).removeClass('sideCatalog-up-enable').addClass('sideCatalog-up-disable');
                        $("#sideCatalog-dl").animate({
                            "top": "0px"
                        });

                    } else {
                        $("#sideCatalog-dl").animate({
                            "top": ($("#sideCatalog-dl").position().top + offset) + "px"
                        });
                    }
                });
                $('#sideCatalog-down').click(function () {
                    if ($(this).hasClass('sideCatalog-down-disable')) return false;
                    if ($("#sideCatalog-up").hasClass('sideCatalog-up-disable')) {
                        $("#sideCatalog-up").removeClass('sideCatalog-up-disable').addClass('sideCatalog-up-enable');
                    }
                    if (($("#sideCatalog-dl")[0].scrollHeight - Math.abs($("#sideCatalog-dl").position().top - offset)) < $('#sideCatalog-catalog').height()) {
                        $(this).removeClass('sideCatalog-down-enable').addClass('sideCatalog-down-disable');
                        $("#sideCatalog-dl").animate({
                            "top": "-" + ($("#sideCatalog-dl")[0].scrollHeight - $('#sideCatalog-catalog').height() + 26) + "px"
                        });

                    } else {
                        $("#sideCatalog-dl").animate({
                            "top": ($("#sideCatalog-dl").position().top - offset) + "px"
                        });
                    }
                });
                //折叠展开
                $('#sideCatalogBtn').click(function(){
                    var $el = $(this);
                    if($el.hasClass('sideCatalogBtnDisable')){
                        $el.removeClass('sideCatalogBtnDisable');
                        //$('#sideCatalog').show();
                        $('#sideCatalog').css('visibility','visible');
                    }else{
                        //$('#sideCatalog').hide();
                        $el.addClass('sideCatalogBtnDisable');
                        $('#sideCatalog').css('visibility','hidden');
                    }
                });


            },
            _scrollTo: function (elem) {
                var anchor = elem.data('unique');
                var tagName = elem.data('target');
                var self = this
                currentDiv = $(tagName + '[data-anchor="' + anchor + '"]');
                if (!currentDiv.length) {
                    return self;
                }
                // Once all animations on the page are complete, this callback function will be called
                $("html, body").promise().done(function () {
                    // Animates the html and body element scrolltops
                    $("html, body").animate({
                        "scrollTop": currentDiv.offset().top + "px"
                    });
                });
                // Maintains chainability
                return self;
            },
            _refreshCatalogPosition: function () {
                var idx = $('dd').index($('dd.highlight'));
                var count = $('dd').length;
                var dlTop = $("#sideCatalog-dl").position().top;

                var newDlTop = (idx - 6) * -25; //25像素是每个dd的高度
                if (newDlTop < dlTop) {
                    //向上移
                    var tmp = count - idx - 1 - 6; //不够移动至中间位置时的差值
                    if (tmp < 0) {
                        newDlTop += (Math.abs(tmp) * 25);

                    }
                }
                if (newDlTop > 0)
                        newDlTop = 0;

                if (newDlTop < 0)
                    $('#sideCatalog-up').removeClass('sideCatalog-up-disable').addClass('sideCatalog-up-enable')
                else
                    $('#sideCatalog-up').removeClass('sideCatalog-up-enable').addClass('sideCatalog-up-disable')
                if ($("#sideCatalog-dl").height() - Math.abs(newDlTop) > $('#sideCatalog-catalog').height())
                    $('#sideCatalog-down').removeClass('sideCatalog-down-disable').addClass('sideCatalog-down-enable')
                else
                    $('#sideCatalog-down').removeClass('sideCatalog-down-enable').addClass('sideCatalog-down-disable')

                //同时执行动态平滑滚动效果
                setTimeout(function () {
                    $("#sideCatalog-dl").animate({
                        "top": newDlTop + "px"
                    }, 'fast');
                }, 0);
            }

        });

    }));
