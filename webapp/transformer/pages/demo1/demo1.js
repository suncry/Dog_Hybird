define([
    'AbstractView',
    'text!TransPath/demo1/tpl.layout.html',
    'text!TransPath/demo1/demo1.css',
    'UISelect',
    'UIRated',
    'UIGroupSelect',
    'TransModel',
    'UIIdentitycard',


    'text!TransStylePath/common.css',
], function (AbstractView,
             layoutHtml,
             style,
             UISelect,
             UIRated,
             UIGroupSelect,
             TransModel,

             UIIdentitycard,

             commoncss) {
    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commoncss;

            // this.classname = 'page-index';

            this.events = {
                'click .js-group-select': 'showGroupSelect',
                'click .js-num': 'numAction',

                'click .js-loading': 'selectArea'
            };

            var s = '';
            
            this.data1 = [];
            this.data2 = [];
            this.data3 = [];

        },

        getDataCityData: function (callback, id) {
            if(!id) id = 0;
            var scope = this;
            var model = TransModel.CityModel.getInstance();

            model.urlParam = {
                id: id
            };

            // this.showLoading();
            model.get(function (data) {
                scope.hideLoading();
                callback(data);
            });
        },

        selectArea: function () {
            var scope = this;

            //这坨代码有点挫
            this.getDataCityData(function (data1) {
                scope.data1 = data1;

                scope.getDataCityData(function (data2) {

                    scope.data2 = data2;

                    scope.getDataCityData(function (data3) {
                        scope.data3 = data3;
                        scope.showUiCity();
                    }, data2[0].id);

                }, data1[0].id);

            });

        },

        showUiCity: function () {
            var data1 = this.data1;
            var data2 = this.data2;
            var data3 = this.data3;
            var scope = this;

            if (!this.uiCity) {
                this.uiCity = new UIGroupSelect({
                    isDownIn: true,
                    title: 'groupselect 组件',
                    data: [data1, data2, data3],
                    indexArr: [0, 0, 0 ],
                    changedArr: [
                        function (item) {
                            var uiScope = this;
                            scope.getDataCityData(function (data) {
                                uiScope.scrollArr[1].reload({data: data});
                            }, item.id)
                        },
                        function (item) {
                            var uiScope = this;
                            scope.getDataCityData(function (data) {
                                uiScope.scrollArr[2].reload({data: data});
                            }, item.id)
                        }
                    ],
                    onShow: function () {
                        this.$el.addClass('cm-scroll-select-wrap');
                        this.$('.cm-scroll-select-wrap').width('33%');
                    },
                    onOkAction: function (item) {
                        scope.showToast('当前选择: ' + item[0].name + ' : ' + item[1].name + ' ' + item[2].name);
                        this.hide();
                    }
                });
            }

            this.uiCity.show();

        },

        showGroupSelect: function () {

            var data1 = [];
            var data2 = [];
            var data3 = [];
            var scope = this;

            for (var i = 0; i < 80; i++) {
                data1.push({name: '一选项:' + i, id: i});
                data2.push({name: '二选项:' + i, id: i});
                data3.push({name: '三选项:' + i, id: i});
            }


            if (!this.groupSelect) {
                this.groupSelect = new UIGroupSelect({
                    isDownIn: true,
                    title: 'groupselect 组件',
                    data: [data1, data2, data3],
                    indexArr: [0, 3],
                    changedArr: [
                        function () {
                            scope.setSelected();
                        },
                        function () {
                            scope.setSelected();
                        }
                    ],
                    onShow: function () {
                        this.$el.addClass('cm-scroll-select-wrap');
                        this.$el.find('.cm-scroll-select-wrap').width('32%');
                    },
                    onOkAction: function (item) {
                        scope.showToast('当前选择: ' + item[0].name + ' : ' + item[1].name);
                        this.hide();
                    }
                });
            }

            this.groupSelect.show();

        },

        initSelect: function () {
            var data1 = [];
            var data2 = [];
            var scope = this;

            for (var i = 0; i < 10; i++) {
                data1.push({name: '一选项:' + i, id: i});
                data2.push({name: '二选项:' + i, id: i});
            }

            if (!this.select1)
                this.select1 = new UISelect({
                    data: data1,
                    wrapper: this.$('.js-select-wrap1'),
                    changed: function () {
                        scope.setSelected();
                    }
                });

            if (!this.select2)
                this.select2 = new UISelect({
                    data: data2,
                    wrapper: this.$('.js-select-wrap2'),
                    changed: function () {
                        scope.setSelected();
                    }
                });


            this.select1.show();
            this.select2.show();

            this.setSelected();

        },

        setSelected: function () {
            var data1 = this.select1.getSelected();
            var data2 = this.select2.getSelected();

            this.$('.js-select-check').html('当前选择:' + data1.name + ':' + data2.name);
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '转诊业务'
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {
            this.d_switch = this.$('.js_switch');
            this.d_date = this.$('.j_date');
            this.d_start_txt = this.$('.js_start_txt');
            this.d_end_txt = this.$('.js_end_txt');
            this.d_js_banner = this.$('.js_banner');
            this.d_js_banner_wrapper = this.$('.js_banner_wrapper');
            this.d_js_his_route = this.$('.js_his_route');
            this.js_his_route_list = this.$('.js_his_route_list');

        },

        initRated: function () {
            var scope = this;
            this.rated = new UIRated({
                wrapper: this.$('.js-rated'),
                changedAction: function (rated) {
                    scope.setRated(rated);
                }
            });

            this.rated.show();
            scope.setRated(this.rated.getRated());


        },

        setRated: function (rated) {
            this.$('.js-rated-check').html(rated);
        },

        numAction: function () {

            var ui = new UIIdentitycard({
                targetEl: this.$('.js-num')

            });
            ui.show();

        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initSelect();
                this.initRated();

            });

            this.on('onHide', function () {

            });
        }

    });

});
