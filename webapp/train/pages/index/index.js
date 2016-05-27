define([
    'AbstractView',
    'text!TrainIndexPath/tpl.layout.html',
    'text!TrainIndexPath/index.css',

    'TrainBusStore',
    'TrainBusModel',
    'cUser'
], function (
    AbstractView,
    layoutHtml,
    index_css,
    BusStore,
    BusModel,
    cUser
) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            _hmt.push(['_trackEvent', 'train.index.view.', 'click']);

            var scope = this;
            this.template = layoutHtml;
            this.style = index_css;

            this.startCityStore = BusStore.SCityStore.getInstance();
            this.endCityStore = BusStore.ECityStore.getInstance();
            this.hisRouteStore = BusStore.HisRouteStore.getInstance();

            this.preSaleModel = BusModel.PreSaleModel.getInstance();
            this.userModel = BusModel.UserInfoModel.getInstance();
            this.initModel = BusModel.InitAppModel.getInstance();

            //默认两个月日历可选
            this.endTime = 2592000000 * 2 - 86400000;

            //默认不抢票
            this.qiangpiao = 0;

            this.events = {
                'click .js_switch': function () {
                    _hmt.push(['_trackEvent', 'train.index.switch', 'click']);

                    if (this.d_switch.hasClass('active')) {
                        this.d_switch.removeClass('active')
                    } else {
                        this.d_switch.addClass('active')
                    }
                },
                'click .j_start_city': 'toStartCity',
                'click .j_end_city': 'toEndCity',
                'click .js_search_date': 'selectDate',
                'click .js_swap_city': 'swapCity',
                'click .js_search_list': 'searchList',
                'click .js_tool_bar li': 'navigateTo',
                'click .js_his_route_list li': 'setHisRoute'
            };

            //预加载本页需要点击才会使用的UI资源
            //首页预加载，保证首屏快速展示
            setTimeout(function () {
                requirejs(['UICalendarBox']);
                scope.preSaleModel.execute(function (data) {
                    scope.endTime = (data.normal + data.qiang) * 86400 * 1000 - 86400000;
                    scope.qiangpiao = data.qiang;
                });
            }, 100);


        },

        initHeader: function () {
            var host = window.location.host;
            var u = _.getUrlParam().u;
            var opts = {
                view: this,
                title: '火车票查询',
                back: function() {
                    this.jump('flight/index', null, null, 'pop');
                }
            };

            this.header.set(opts);



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

        searchList: function () {
            _hmt.push(['_trackEvent', 'train.index.search', 'click']);

            var start_id = this.d_start_txt.attr('data-name');
            var end_id = this.d_end_txt.attr('data-name');
            var date = this.d_date.attr('data-date');

            var ids = [];

            var param = {};

            if (!start_id) {
                this.showToast('请选择出发城市');
                return;
            }

            if (!end_id) {
                this.showToast('请选择到达城市');
                return;
            }

            if (!date) {
                this.showToast('请选择出发日期');
                return;
            }

            if (start_id == end_id) {
                this.showToast('出发和到达城市不能一样');
                return;
            }

            var name = start_id + '|' + end_id;

            param = {
                startdatetime: date,
                startname: start_id,
                arrivename: end_id
            };

            if (this.d_switch.hasClass('active')) {
                param.flag = 'g';
            }

            this.insertHisRoute(name);
            this.startCityStore.set(start_id);
            this.endCityStore.set(end_id);

            this.forward('list', param);

        },

        //存入数据
        insertHisRoute: function (name) {

            if (!name) return;
            var arr = this.hisRouteStore.get();
            var i, len;
            if (!arr) arr = [];

            arr = arr.reverse();
            len = arr.length;
            //如果传入id已经存在便将其剔除
            for (i = 0; i < len; i++) {
                if (arr[i] == name) { arr.splice(i, 1); break; }
            }

            arr.push(name);
            arr = arr.reverse();
            arr = arr.slice(0, 4);
            this.hisRouteStore.set(arr);
        },

        swapCity: function () {
            _hmt.push(['_trackEvent', 'train.index.swapcity', 'click']);

            var scope = this;
            var start_id = this.d_start_txt.attr('data-name');
            var end_id = this.d_end_txt.attr('data-name');


            if (!start_id) {
                this.showToast('请选择出发城市');
                return;
            }

            if (!end_id) {
                this.showToast('请选择达到城市');
                return;
            }

            this.d_start_txt.attr('data-name', end_id);
            this.d_end_txt.attr('data-name', start_id);
            this.d_start_txt.text(end_id);
            this.d_end_txt.text(start_id);
        },

        _initDate: function (date) {
            var id, name, s, dateDetail;
            if (!date) {
                date = new Date();
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            //转换日期，时区问题/*bug*/
            //      date = _.dateUtil.setBeijingDate(date);
            id = date.getTime();
            dateDetail = _.dateUtil.getDetail(date);

            name = dateDetail.month + '月' + dateDetail.day + '日' + (dateDetail.day1 ? '(' + dateDetail.day1 + ')' : '');
            this.d_date.html(name);
            this.d_date.attr('data-date', id);
        },

        //首页预加载操作
        selectDate: function () {
            var scope = this;
            if (this.loadingCalendar) return;

            this.loadingCalendar = true;
            requirejs(['UICalendarBox'], function (UICalendarBox) {
                scope.loadingCalendar = false;
                scope._selectDate(UICalendarBox);
            });
        },

        _selectDate: function (UICalendarBox) {
            _hmt.push(['_trackEvent', 'train.index.selectdate', 'click']);

            var scope = this;
            var secDate = this.d_date.attr('data-date');
            var t = secDate, endDate = new Date();

            var start_name = this.d_start_txt.attr('data-name');
            var end_name = this.d_end_txt.attr('data-name');


            if (!start_name) {
                this.showToast('请选择出发城市');
                return;
            }

            if (!end_name) {
                this.showToast('请选择达到城市');
                return;
            }

            if (secDate) {
                secDate = new Date();
                secDate.setTime(t);
            } else {
                secDate = new Date();
            }
            //            endDate.setTime(new Date().getTime() + 518400000);
            endDate.setTime(new Date().getTime() + this.endTime);
            var _endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            if (scope.endTime)
                if (!this.calendar)
                    this.calendar = new UICalendarBox({
                        selectDate: secDate,
                        endTime: endDate,
                        dayItemAction: function (dayObj, year, month, day, dateObj, difftime) {
                            var isMulti = false;
                            var dayStrArr = [];
                            var qiang = '';

                            //计算抢票用
                            var differDay = (_endTime.getTime() - dateObj.getTime()) / 86400000;

                            dayStrArr[0] = '<div class="cm-field-title">' + (dayObj.day1 || dayObj.day) + '</div>';
                            if (dayObj.solarHoliday || dayObj.lunarHoliday) {
                                isMulti = true;
                                dayStrArr[0] = '<div class="cm-field-title">' + (dayObj.lunarHoliday || dayObj.solarHoliday) + '</div>';
                            }

                            if (differDay >= 0 && differDay < scope.qiangpiao) {
                                qiang = '<span class="qiang">抢</span>';
                            }

                            return '<div class="cm-field-wrapper ' + (isMulti ? 'multi-item' : '') + '">' + dayStrArr.join('') + qiang + '</div>';
                        },
                        onItemClick: function (date, el, e) {
                            scope._initDate(date);
                            this.hide();
                        }
                    });
            this.calendar.show();
        },

        toCity: function (city) {
            var scope = this;

            this.showPageview('city', {
                flag: city,
                startId: this.d_start_txt.attr('data-key'),
                type: this.d_start_txt.attr('data-type'),
                onCityItemClick: function (name) {
                    scope['d_' + city + '_txt'].text(name);
                    scope['d_' + city + '_txt'].attr('data-name', name);
                    if (scope[city + 'CityStore']) scope[city + 'CityStore'].set(name);
                    history.back();
                },
                onBackAction: function () {
                    history.back();
                }
            });
        },

        toStartCity: function () {
            _hmt.push(['_trackEvent', 'train.index.start', 'click']);

            this.toCity('start');
        },

        toEndCity: function () {
            _hmt.push(['_trackEvent', 'train.index.end', 'click']);

            var start_name = this.d_start_txt.attr('data-name');
            if (!start_name) {
                this.showToast('请选择出发城市');
                return;
            }

            this.toCity('end');
        },

        cityInit: function () {
            var s = this.startCityStore.get();
            var e = this.endCityStore.get();
            if (s) {
                this.d_start_txt.text(s);
                this.d_start_txt.attr('data-name', s);
            }
            if (e) {
                this.d_end_txt.text(e);
                this.d_end_txt.attr('data-name', e);
            }
        },

        navigateTo: function (e) {

            var el = $(e.currentTarget);
            var name = el.attr('data-name');
            var scope = this;

            _hmt.push(['_trackEvent', 'train.index.tab-' + name, 'click']);

            if (name == 'orderlist') {
                //强制验证登录
                this.userModel.baseDataValidate = function (data) {
                    if (data.errno == '20001') {
                        cUser.login('http://kuai.baidu.com/webapp/train/orderlist.html');

                        return false;
                    }
                    return true;
                };
                this.userModel.execute(function (data, odata) {

                    scope.forward('orderlist');

                    return;
                    var url = 'http://m.ctrip.com/webapp/myctrip/orders/trainorderlist?allianceid=106175&sid=549977&showhead=0';

                    window.location = url;
                }, function (data) {
                    if (data && data.msg) scope.showToast(data.msg);
                }, true);

                return;
            }

            this.forward(name);
        },

        bannerInit: function () {
            if (_.getHybridInfo().platform == 'nuomi') {
                this.d_js_banner_wrapper.height('120px');
                this.d_js_banner_wrapper.html('<img src="./static/images/p-w-540-150.jpg" style=" width: 100%; height: 120px;" >');
                return;
            }

            var scope = this;
            var param = {
                bannerwide: 540,
                bannerhigh: 150,
                app: 1,
                screenwide: $(window).width(),
                screenhigh: $(window).height()
            };

            if ($.os.android) {
                param.system = 1;
                if (_.isWeiXin()) param.system = 3;
            }

            if ($.os.ios) {
                param.system = 2;
            }

            this.initModel.setParam(param);
            this.initModel.execute(function (data) {
                var banner = data.subbanners ? data.subbanners['train'] : data.banner;
                scope.initBanner(banner);
            });

        },

        initBanner: function (banner) {
            var scope = this;
            if (this.loadingImageSlider) return;

            this.loadingImageSlider = true;
            requirejs(['UIImageSlider'], function (UIImageSlider) {
                scope.loadingImageSlider = false;
                scope._initBanner(banner, UIImageSlider);
            });
        },

        _initBanner: function (banner, UIImageSlider) {
            if (!banner || banner.length === 0) {
                this.d_js_banner_wrapper.remove();
                return;
            }
            var scope = this;

            if (banner.length == 1) {
                this.d_js_banner.attr('href', banner[0].url || 'javascript:;');
                this.d_js_banner.find('img').attr('src', banner[0].picurl);
                return;
            }

            //暂时写死
            this.d_js_banner_wrapper.height('100px');
            this.d_js_banner_wrapper.html('');

            if (!this.imageslider) {
                this.imageslider = new UIImageSlider({
                    autoPlay: true,
                    wrapper: this.d_js_banner_wrapper,
                    data: banner,
                    onShow: function () {
                        var self = this;
                        var img = this.$('img').eq(0);
                        img.one('load', function () {
                            scope.d_js_banner_wrapper.height(img.height() + 'px');
                            self.resizeRefresh();
                        });
                    },
                    itemClick: function (item) {
                        if (item.url) window.location.href = item.url;
                    },
                    itemFn: function (item) {
                        return '<a href="' + item.url + '"><img class="cm-ad-img" src="' + item.picurl + '" data-link="' + item.url + '"></a>';
                    }
                });
            }
            this.imageslider.show();
        },


        // **bug** 需要重构
        initHisRoute: function () {
            var data = this.hisRouteStore.get();

            var arr = [], i, len, id, name;
            if (!data || data.length == 0) return;
            this.d_js_his_route.show();

            for (i = 0, len = data.length; i < len; i++) {
                id = data[i];
                if (!id) return;
                if (id.indexOf('|') === -1) continue;
                id = id.split('|');
                if (id.length != 2) return;
                arr.push('<li ');
                arr.push('data-sname="' + id[0] + '" data-ename="' + id[1] + '" >' + id[0] + '-' + id[1] + '</li>');
            }
            this.js_his_route_list.html(arr.join(''));
        },

        // **bug** 需要重构
        setHisRoute: function (e) {
            var el = $(e.currentTarget);
            var sname = el.attr('data-sname');
            var ename = el.attr('data-ename');

            if (sname && ename) {
                this.d_start_txt.attr('data-name', sname);
                this.d_start_txt.text(sname);

                this.d_end_txt.attr('data-name', ename);
                this.d_end_txt.text(ename);
            }

            window.scroll(0, 0);
        },

        addEvent: function () {
            this.on('onShow', function () {
                this._initDate();
                this.initHisRoute();
                this.cityInit();
                this.bannerInit();
                var scope = this;
                _.hybridCallback({
                    callback: function () {
                    },
                    bdbus_callback: function () {
                        scope.$('.js_tool_bar').hide();
                    }
                });
            });

            this.on('onHide', function () {
                if (this.calendar) this.calendar.hide();
            });
        }

    });

});
