﻿define(['ModuleView', 'UILayerList'], function (ModuleView, UILayerList) {
    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.events = {
                'click': 'showLayer'
            };

            this.entity.checkAll(true);

        },

        hideLayer: function () {
            if (this.layer && this.layer.status == 'show') {
                this.layer.hide();
            }
        },

        onHide: function () {
            if (this.layer) {
                this.layer.destroy();
            }
        },

        showLayer: function () {
            _hmt.push(['_trackEvent', 'train.list.' + this.tagname, 'click']);

            var scope = this;
            var data = this.entity.get();
            if (data.length == 0) return;

            this.searchBarEntity['select' + this.tagname]();
            if (this.layer && this.layer.status == 'show') return;

            if (!this.layer) {

                //这里注释了车站地图需求
                this.layer = new UILayerList({
                    list: data,
                    reposition: function () {
                        this.$el.css({
                            'position': 'fixed',
                            '-webkit-box-sizing': 'border-box',
                            'box-sizing': 'border-box',
                            'width': '100%',
                            'left': '0',
                            'background-color': '#fff',
                            'bottom': '36px'
                        });
                    },
                    events: {
                        'click .js_ok': function () {
                            scope.entity.update();
                            this.hide();
                        }
                    },
                    onHide: function () {
                        scope.searchBarEntity.resetData(true);
                    },
                    title: '<span class="fl js_cancel" style="font-weight: 500;">取消</span><span class="fr js_ok" style="color: #00b358; font-weight: 500;">确定</span>',
                    itemFn: function (item) {
                        return '<div style="text-align: left; padding-left: 10px; ">' + item.name + '</div>';
                    },
                    onItemAction: function (data, index) {

                    },
                    setIndex: function (i) {
                        scope.entity.setIndex(i, true);
                        this.setIndexArr();
                    },
                    setIndexArr: function () {
                        var indexArr = scope.entity.getCheckedIndex();
                        if (typeof indexArr == 'number') indexArr = [indexArr];
                        this.$('li').removeClass(this.curClass);
                        for (var i = 0, len = indexArr.length; i < len; i++) this._setIndex(indexArr[i])
                    },
                    _setIndex: function (i) {
                        if (i < 0 || i > this.list.length) return;
                        this.index = i;
                        this.$('li[data-index="' + i + '"]').addClass(this.curClass);
                    }
                });
            } else {
                this.layer.list = data;
                this.layer.refresh();
            }

            this.layer.show();
            this.layer.setIndexArr();
        },

        getViewModel: function () {
            return this.entity.get();
        }

    });

});
