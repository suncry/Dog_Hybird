define(['ModuleView', 'text!TrainListPath/tpl.more.filter.html', 'UIScrollLayer', 'TrainListPath/en.more.filter'], function (ModuleView, tpl, UIScrollLayer, MoreFilterEntity) {
    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.events = {
                'click ': 'showLayer'
            };

            this.entity = new MoreFilterEntity();
            this.entity.subscribe(this.freshLayout, this);

            this.setoutTimeEntity.subscribe(this.refreshSetout, this);
            this.arriveTimeEntity.subscribe(this.refreshArrive, this);

            this.shifaEntity.subscribe(this.refreshShifa, this);
            this.yupiaoEntity.subscribe(this.refreshYupiao, this);

        },

        onHide: function () {
            if (this.layer) {
                this.layer.destroy();
            }
        },

        refreshShifa: function () {
            if (this.shifaEntity.get())
                this.layer.$('.js_shifa_switch').addClass('active');
            else
                this.layer.$('.js_shifa_switch').removeClass('active');

        },

        refreshYupiao: function () {
            if (this.yupiaoEntity.get())
                this.layer.$('.js_yupiao_switch').addClass('active');
            else
                this.layer.$('.js_yupiao_switch').removeClass('active');
        },

        refreshSetout: function () {
            var index = this.setoutTimeEntity.getCheckedIndex();
            var name = this.setoutTimeEntity.getCheckedName()
            if (index === null) return;

            this.layer.$('.js_setout_list li').removeClass('active');
            this.layer.$('.js_setout_list li[data-index="' + index + '"]').addClass('active');
            this.layer.$('.js_setout_name').html(name);
        },

        refreshArrive: function () {
            var index = this.arriveTimeEntity.getCheckedIndex();
            var name = this.arriveTimeEntity.getCheckedName()
            if (index === null) return;

            this.layer.$('.js_arrive_list li').removeClass('active');
            this.layer.$('.js_arrive_list li[data-index="' + index + '"]').addClass('active');
            this.layer.$('.js_arrive_name').html(name);

        },

        freshLayout: function () {
            var layout = this.entity.get();
            this.d_setout = this.layer.$('.js_setout_wapper');
            this.d_arrive = this.layer.$('.js_arrive_wapper');

            if (layout.setout) {
                this.d_setout.addClass('active');

            } else {
                this.d_setout.removeClass('active');
            }

            if (layout.arrive) {
                this.d_arrive.addClass('active');
            } else {
                this.d_arrive.removeClass('active');
            }

            //更新IScroll容器
            this.layer.resetHeight();
        },

        hideLayer: function () {
            if (this.layer && this.layer.status == 'show') {
                this.layer.hide();
            }
        },

        showLayer: function () {
            _hmt.push(['_trackEvent', 'train.list.showfilter', 'click']);

            var html = '';
            var data = {};
            var scope = this;
            data.entity = this.entity;
            data.setoutTimeEntity = this.setoutTimeEntity;
            data.arriveTimeEntity = this.arriveTimeEntity;
            data.shifaEntity = this.shifaEntity;
            data.yupiaoEntity = this.yupiaoEntity;

            var _height = $('.js_title').height() + this.view.$('.js_calendar_wrapper').height();
            _height = parseInt(_height) || 0;

            this.searchBarEntity['select' + this.tagname]();
            if (this.layer && this.layer.status == 'show') return;

            html = this.view.renderTpl(tpl, data);

            if (!this.layer) {
                this.layer = new UIScrollLayer({
                    events: {
                        'click .js_setout_wapper h3': function () {
                            scope.entity.selectSetout();
                        },
                        'click .js_arrive_wapper h3': function () {
                            scope.entity.selectArrive();
                        },
                        'click .js_setout_list li': function (e) {
                            var el = $(e.currentTarget);
                            var index = el.attr('data-index');
                            scope.setoutTimeEntity.setIndex(index);
                        },
                        'click .js_arrive_list li': function (e) {
                            var el = $(e.currentTarget);
                            var index = el.attr('data-index');
                            scope.arriveTimeEntity.setIndex(index);
                        },
                        'click .js_shifa_switch': function () {
                            scope.shifaEntity.checked();
                        },
                        'click .js_yupiao_switch': function () {
                            scope.yupiaoEntity.checked();
                        },
                        'click .js_search': function () {
                            scope.view.renderList();
                            this.hide();
                        }
                    },
                    classname: 'page-list',
                    fixedHeight: true,
                    height: $(window).height() - _height,
                    animateInClass: 'cm-down-in',
                    animateOutClass: 'cm-down-out',
                    heightByWrapper: true,
                    onShow: function () {
                        //Andriod大屏手机渲染BUG
                        this.$('.js_search').hide();
                        var self = this;
                        setTimeout(function () {
                            self.$('.js_search').show();
                        }, 200);

                    },
                    onHide: function () {
                        scope.searchBarEntity.resetData(true);
                    },
                    reposition: function () {
                        this.$el.css({
                            'position': 'fixed',
                            'padding': '0',
                            'box-sizing': 'border-box',
                            'width': '100%',
                            'left': '0',
                            'background-color': '#efefef',
                            '-webkit-box-sizing': 'border-box',
                            'box-sizing': 'border-box',
                            'bottom': '36px'
                        });
                    },
                    html: html
                });
            }
            this.layer.show();

        }

    });

});
