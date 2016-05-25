define([
    'AbstractView',
    'text!TrainListPath/list.css',
    'text!TrainListPath/tpl.list.html',
    'text!TrainListPath/tpl.redirect.html',

    'TrainListPath/en.search.bar',
    'TrainListPath/en.date',
    'TrainListPath/en.sort',
    'TrainListPath/en.check.box',
    'TrainListPath/en.radio.box',
    'TrainListPath/en.switch',

    'TrainListPath/mod.date',
    'TrainListPath/mod.sort',
    'TrainListPath/mod.check.box',
    'TrainListPath/mod.more.filter',

    'TrainBusModel',

    'text!TrainListPath/tpl.layout.html',
    'text!TrainListPath/tpl.search.box.html',
    'cUser'

], function (
    AbstractView,
    style,
    listTpl,
    redirectTpl,

    SearchBarEntity,
    DateEntity,
    SortEntity,
    CheckBoxEntity,
    RadioBoxEntity,
    SwitchEntity,

    DateModule,
    SortModule,
    CheckBoxModule,
    MoreFilterModule,

    BusModel,

    layoutHtml,
    searchBoxHtml,
    cUser
) {
    return _.inherit(AbstractView, {

        _initEntity: function () {

            this.searchBarEntity = new SearchBarEntity();
            this.searchBarEntity.subscribe(this.renderSearchBar, this);

            var n = new Date();
            //首先初始化日历信息
            var date = _.getUrlParam().date;
            if (date) {
                n.setTime(date);
            }
            this.dateEntity = new DateEntity({ date: date });
            this.dateEntity.subscribe(this.listInit, this);

            this.sortEntity = new SortEntity();
            this.sortEntity.subscribe(this.renderList, this);

            this.trainTypeEntity = new CheckBoxEntity({
                data: [
                    { name: '全部车次', id: 'all', checked: true },
                    { name: '高铁城际(G/C)', id: 'g' },
                    { name: '动车(D)', id: 'd' },
                    { name: '特快(T)', id: 't' },
                    { name: '其它类型', id: 'other' }
                ]
            });
            this.trainTypeEntity.subscribe(this.renderList, this)

            this.setoutEntity = new CheckBoxEntity({
                data: [
                    { name: '全部出发站', id: 'all' }
                ]
            });
            this.setoutEntity.subscribe(this.renderList, this)

            //出发时段
            this.setoutTimeEntity = new RadioBoxEntity({
                data: [
                    { name: '全天', id: 'all', checked: true },
                    { name: '早上 00:00-06:00', id: '0-6' },
                    { name: '上午 06:00-12:00', id: '6-12' },
                    { name: '下午 12:00-18:00', id: '12-18' },
                    { name: '晚上 18:00-24:00', id: '18-24' }
                ]
            });

            //到达时段
            this.arriveTimeEntity = new RadioBoxEntity({
                data: [
                    { name: '全天', id: 'all', checked: true },
                    { name: '早上 00:00-06:00', id: '0-6' },
                    { name: '上午 06:00-12:00', id: '6-12' },
                    { name: '下午 12:00-18:00', id: '12-18' },
                    { name: '晚上 18:00-24:00', id: '18-24' }
                ]
            });

            //仅显示始发站
            this.shifaEntity = new SwitchEntity();

            //仅显示到达站
            this.yupiaoEntity = new SwitchEntity();


        },

        _initModule: function () {
            this.dateModule = new DateModule({
                view: this,
                selector: '.js_calendar_wrapper',
                dateEntity: this.dateEntity
            });

            this.sortModule = new SortModule({
                view: this,
                selector: '.js_sort_wrapper',
                sortEntity: this.sortEntity
            });

            this.trainTypeModule = new CheckBoxModule({
                view: this,
                selector: '.js_type',
                tagname: 'Type',
                searchBarEntity: this.searchBarEntity,
                entity: this.trainTypeEntity
            });

            this.setoutModule = new CheckBoxModule({
                view: this,
                selector: '.js_setout',
                tagname: 'Setout',
                searchBarEntity: this.searchBarEntity,
                entity: this.setoutEntity
            });

            this.moreFilterModule = new MoreFilterModule({
                view: this,
                tagname: 'More',
                searchBarEntity: this.searchBarEntity,
                setoutTimeEntity: this.setoutTimeEntity,
                arriveTimeEntity: this.arriveTimeEntity,
                shifaEntity: this.shifaEntity,
                yupiaoEntity: this.yupiaoEntity,
                selector: '.js_more'
            });

        },

        renderSearchBar: function () {
            var key = this.searchBarEntity.getSelected();
            this.d_js_tabs.css('z-index', '500');
            this.d_js_tabs.find('li').removeClass('active');
            var mapping = {
                type: this.trainTypeModule,
                setout: this.setoutModule,
                more: this.moreFilterModule
            };

            for (var k in mapping) {
                if (k != key) mapping[k].hideLayer();
            }

            if (key) {
                this.$('.js_' + key).addClass('active');
                this.d_js_tabs.css('z-index', '3000');
            }
        },

        propertys: function ($super) {
            $super();

            _hmt.push(['_trackEvent', 'train.list.view.', 'click']);

            this.style = style;
            this.template = layoutHtml;

            this.listModel = BusModel.ListModel.getInstance();
            this.userModel = BusModel.UserInfoModel.getInstance();

            //列表首次请求数据，缓存起来
            this.listData = [];

            this.events = {
                'click .js_bus_list li': 'toBooking',
                'click .js-redirect': function (e) {
                    if (!this.recommendData) return;
                    var map = {
                        '1': 'bus',
                        '2': 'carpool',
                        '4': 'intercitybus'
                    };
                    var urlParams = this.getParam();
                    var el = this.$(e.currentTarget);
                    var action = el.attr('data-action');

                    var start = this.recommendData[map[this.recommendData.type]].departureregion.city;
                    var end = this.recommendData[map[this.recommendData.type]].arrivalregion.city;

                    var params = {
                        startdatetime: this.dateEntity.getDate() || urlParams.startdatetime,
                        startcityid: this.recommendData.type == 1 ? this.recommendData[map[this.recommendData.type]].departureregionid : start.regionid,
                        arrivalcityid: this.recommendData.type == 1 ? this.recommendData[map[this.recommendData.type]].arrivalregionid : end.regionid
                    };
                    if (urlParams.startname) {
                        params.startname = urlParams.startname;
                    }
                    if (urlParams.arrivename) {
                        params.arrivename = urlParams.arrivename;
                    }
                    window.APP.closeWebapp();
                    this.jump(action, params);
                }
            };

        },

        toBooking: function (e) {
            _hmt.push(['_trackEvent', 'train.list.tobooking', 'click']);
            var el = $(e.currentTarget);

            if (el.hasClass('lazy-load')) {
                return;
            }

            if (el.hasClass('disabled')) {
                this.showToast('不可预订');
                return;
            }

            var dstation = decodeURIComponent(el.attr('data-dstation'));
            var astation = decodeURIComponent(el.attr('data-astation'));

            //            var dstation = el.attr('data-dstation');
            //            var astation = el.attr('data-astation');
            var trainnumber = el.attr('data-trainnumber');
            var date = this.dateEntity.getDateStr2();
            var scope = this;
            var param = {};
            param.dstation = dstation;
            param.astation = astation;
            param.ddate = date;
            param.trainnumber = trainnumber;

            if (_.getHybridInfo().platform != 'nuomi') {
                var url = this._getNimingUrl('http://m.ctrip.com/webapp/train/home/trainx', param);
                window.location = url;
                return;
            }
            this.authentication(function (data) {
                var url = scope._getCtripUrl('http://m.ctrip.com/webapp/train/home/trainx', param, data);

                //糯米特制
                if (_.getHybridInfo().platform == 'nuomi') {
                    url = 'bainuo://web?url=' + encodeURIComponent(url);
                }
                window.location = url;
            });

        },
        // bugfix 新增匿名购票临时逻辑, 以后待修复
        _getNimingUrl: function (url, param) {
            url = url + '?autoawaken=close&popup=close&allianceid=106175&sid=549977&showhead=0&us=' + (_.getUrlParam().us || '');
            for (var k in param) {
                url = url + '&' + k + '=' + param[k];
            }
            url = encodeURIComponent(url);
            url = 'http://api.kuai.baidu.com/train/redirectctrip?u=' + url + '&us=' + (_.getUrlParam().us || '');
            return url;
        },
        _getCtripUrl: function (url, param, data) {
            if (!data) return '';
            if (_.getHybridInfo().platform == 'nuomi') {
                url = url + '?autoawaken=close&popup=close&allianceid=106175&sid=549977&showhead=0&ouid=' + data.userid + '-nuomi-&us=' + (_.getUrlParam().us || '');
            } else {
                url = url + '?autoawaken=close&popup=close&allianceid=106175&sid=549977&showhead=0&ouid=' + data.userid + '&us=' + (_.getUrlParam().us || '');
            }

            for (var k in param) {
                url = url + '&' + k + '=' + param[k];
            }

            if (_.getHybridInfo().platform != 'nuomi') {
                url = encodeURIComponent(url);
                url = 'http://api.kuai.baidu.com/train/redirectctrip?u=' + url + '&us=' + (_.getUrlParam().us || '');
            }

            return url;
        },

        //用户鉴权，需要统一封装，暂时如此，会返回所有用户数据
        authentication: function (callback) {
            var scope = this;
            //强制验证登录
            this.userModel.baseDataValidate = function (data) {
                if (data.errno == '20001') {
                    data.msg = '';
                    callback({
                        userid: '0'
                    });
                    return false;
                }
                return true;
            };
            this.showLoading();
            this.userModel.execute(function (data, odata) {
                scope.hideLoading();
                callback && callback(data);
            }, function (data) {
                if (data && data.msg) scope.showToast(data.msg);
            }, true);
        },

        initHeader: function (name) {
            var title = '班次列表';
            this.header.set({
                view: this,
                title: title,
                back: function () {
                    this.back('index');
                }
            });
        },

        initElement: function () {
            this.d_list_wrapper = this.$('.js_list_wrapper');
            this.d_none_data = this.$('.js_none_data');

            this.d_js_show_setoutdate = this.$('.js_show_setoutdate');
            this.d_js_show_setstation = this.$('.js_show_setstation');
            this.d_js_show_arrivalstation = this.$('.js_show_arrivalstation');
            this.d_js_list_loading = this.$('.js_list_loading');
            this.d_js_tabs = this.$('.js_tabs');

            this.d_js_day_sec = this.$('.js_day_sec');
            this.d_js_start_sec = this.$('.js_start_sec');
            this.d_js_arrival_sec = this.$('.js_arrival_sec');
            this.dTips = this.$('.js-list-tip');

        },

        //时段只有变化时候才具有显示状态
        renderTime: function () {
            var name = this.timeEntity.getName();
            this.d_js_day_sec.html(name);
        },

        listInit: function () {
            var scope = this, i, len, k, param = {}, d = new Date();
            var dateDetail = _.dateUtil.getDetail(this.dateEntity.getDate());

            param.from = _.getUrlParam().startname;
            param.to = _.getUrlParam().arrivename;
            param.date = dateDetail.year + '' + _.dateUtil.formatNum(dateDetail.month) + _.dateUtil.formatNum(dateDetail.day);

            param.recommend = 1;
            param.new_format = 1;

            this.showLoading();
            this.listModel.setParam(param);
            this.listModel.execute(function (data) {
                scope.hideLoading();
                //推荐班次
                scope.recommendList(data.recommend);
                scope.formatData(data.train || []);
                scope.initSetout();
                scope.renderList();
            });

        },

        //推荐班次
        recommendList: function (data) {
            if (!data) return;
            // **bug ios快行APP没办法推荐汽车票,城际专线,样式会错乱,先屏蔽
            var isIosApp = $.os.ios && _.getHybridInfo().platform === 'baidu_bus';
            if (data.redirect && data.redirect.count > 0 && !isIosApp) {
                //***bug 硬编码需要改***
                this.recommendData = data.redirect;
                var html = this.renderTpl(redirectTpl, { data: data.redirect });
                this.dTips.html(html).show();
            }
            else {
                this.dTips.hide();
            }

        },

        //由初始数据筛选出所有出发站
        initSetout: function () {
            var data = this.listData;
            var stations = [];
            var stationMap = {};
            var tmp = [{ id: 'all', name: '全部出发站'}];

            for (var i = 0, len = data.length; i < len; i++) {
                stationMap[data[i].from_telecode] = data[i].from_station;
                if (data[i].from_station_type == '起点' && _.indexOf(stations, data[i].from_telecode) == -1) {
                    stations.push(data[i].from_telecode);
                }
            }

            for (i = 0, len = stations.length; i < len; i++) {
                var key = stations[i];
                var value = stationMap[key];
                stations[i] = {
                    id: key,
                    name: value
                };
            }

            tmp = tmp.concat(stations);

            this.setoutEntity.initData(tmp);
            this.setoutEntity.checkAll(true);

        },

        //首次拿到数据后，马上处理数据
        formatData: function (data) {
            var item, seat;
            var typeMap = {
                'g': 'g',
                'd': 'd',
                't': 't',
                'c': 'g'
            };

            //出发时间对应的分钟数
            var fromMinute = 0;

            //获取当前时间对应的分钟
            var d = this.dateEntity.getDate();
            var date = new Date();
            var now = parseInt(date.getTime() / 1000);
            date.setTime(this.dateEntity.getDate())
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var toBegin;
            var seatName, seatIndex, iii;

            //处理坐席问题，仅显示二等座，一等座，特等座 无座
            //                二等座 一等座 商务座 无座 动卧 特等座
            var my_seats = {};
            var seatSort = ['二等座', '一等座', '硬座', '硬卧', '软卧', '商务座', '无座', '动卧', '特等座', '软座'];

            for (var i = 0, len = data.length; i < len; i++) {
                fromMinute = data[i].from_time.split(':');
                fromMinute[0] = fromMinute[0] + '';
                fromMinute[1] = fromMinute[1] + '';
                if ((fromMinute[0].charAt(0) == '0')) fromMinute[0] = fromMinute[0].charAt(1);
                if ((fromMinute[1].charAt(0) == '0')) fromMinute[1] = fromMinute[1].charAt(1);
                date = new Date(year, month, day, fromMinute[0], fromMinute[1], 0);
                fromMinute = parseInt(date.getTime() / 1000)
                toBegin = parseInt((fromMinute - now) / 60);

                data[i].disabled = (toBegin < 35);
                data[i].toBegin = toBegin;

                //处理车次类型问题
                data[i].my_train_number = typeMap[data[i].train_number.charAt(0).toLowerCase()] || 'other';

                seat = data[i].seats;
                //所有余票
                data[i].sum_ticket = 0;
                //最低价
                data[i].min_price = null;

                for (var j = 0, len1 = seat.length; j < len1; j++) {
                    if (!data[i].min_price || data[i].min_price > seat[j].seat_price) data[i].min_price = parseFloat(seat[j].seat_price);
                    data[i].sum_ticket += parseInt(seat[j].seat_yupiao);

                    //坐席问题如果坐席不包括上中下则去掉
                    seatName = seat[j].seat_name;
                    //去掉上中下
                    seatName = seatName.replace(/上|中|下/g, '');
                    if (!my_seats[seatName]) {
                        my_seats[seatName] = parseInt(seat[j].seat_yupiao);
                    } else {
                        my_seats[seatName] = my_seats[seatName] + parseInt(seat[j].seat_yupiao);
                    }
                }
                //这里myseat为对象，需要转换为数组
                //将定制坐席转为排序后的数组
                data[i].my_seats = [];
                for (iii = 0; iii < seatSort.length; iii++) {
                    if (typeof my_seats[seatSort[iii]] == 'number') data[i].my_seats.push({ name: seatSort[iii], yupiao: my_seats[seatSort[iii]] });
                }

                my_seats = {};
            }

            this.listData = data;
        },

        //根据车次类型做筛选
        getTypeData: function (data) {
            var typeKeys = this.trainTypeEntity.getCheckedKey();
            if (!typeKeys) return data;
            var tmp = _.filter(data, function (item) {
                var no = item.my_train_number;
                if (_.indexOf(typeKeys, no) != -1) {
                    return true;
                }
                return false;
            });

            return tmp;
        },

        //根据出发站做筛选
        getSetoutData: function (data) {
            var keys = this.setoutEntity.getCheckedKey();
            if (!keys) return data;

            var tmp = _.filter(data, function (item) {
                var no = item.from_telecode;
                if (_.indexOf(keys, no) != -1)
                    return true;
                return false;
            });

            return tmp;
        },

        _timeSort: function (data, sort) {
            data = _.sortBy(data, function (item) {
                item = item.from_time.split(':');
                item = item[0] + '.' + item[1];
                item = parseFloat(item);
                return item;
            });
            if (sort == 'down') data.reverse();
            return data;
        },

        _sumTimeSort: function (data, sort) {
            data = _.sortBy(data, function (item) {
                return parseInt(item.use_time);
            });
            if (sort == 'down') data.reverse();
            return data;
        },

        _priceSort: function (data, sort) {
            data = _.sortBy(data, function (item) {
                return item.min_price;
            });
            if (sort == 'down') data.reverse();
            return data;
        },

        //数据排序
        getSortData: function (data) {
            var tmp = [];
            var sort = this.sortEntity.get();

            for (var k in sort) {
                if (sort[k].length > 0) {
                    tmp = this['_' + k + 'Sort'](data, sort[k])
                    return tmp;
                }
            }

        },

        //筛选出发时段
        getSetoutTime: function (data) {
            var tmp = [];
            //获取界限值
            var time = this.setoutTimeEntity.getCheckedKey();

            //全部则不予理睬
            if (time == 'all') return data;

            var time = this.setoutTimeEntity.getCheckedKey().split('-');
            time[0] = parseInt(time[0]);
            time[1] = parseInt(time[1]);

            var tmp = _.filter(data, function (item) {
                item = item.from_time.split(':');
                item = item[0] + '.' + item[1];
                item = parseFloat(item);

                return item >= time[0] && item < time[1];

            });

            return tmp;
        },

        //筛选到达时段，和上面代码可以重构掉，但是算了吧。。。
        getArriveTime: function (data) {
            var tmp = [];
            //获取界限值
            var time = this.arriveTimeEntity.getCheckedKey();

            //全部则不予理睬
            if (time == 'all') return data;

            var time = this.arriveTimeEntity.getCheckedKey().split('-');
            time[0] = parseInt(time[0]);
            time[1] = parseInt(time[1]);

            var tmp = _.filter(data, function (item) {
                item = item.to_time.split(':');
                item = item[0] + '.' + item[1];
                item = parseFloat(item);

                return item >= time[0] && item < time[1];

            });

            return tmp;
        },

        //仅显示首发站
        getShifa: function (data) {
            var tmp = [];
            var checked = this.shifaEntity.get();
            if (!checked) return data;

            var tmp = _.filter(data, function (item) {
                return item.from_station_type == '起点';
            });
            return tmp;
        },

        //仅有余票的
        getYupiaofa: function (data) {
            var tmp = [];
            var checked = this.yupiaoEntity.get();
            if (!checked) return data;

            var tmp = _.filter(data, function (item) {
                return item.sum_ticket > 0;
            });
            return tmp;
        },

        //获取能预订的班次
        getAbledData: function (data) {
            var tmp = _.filter(data, function (item) {
                return item.disabled === false;
            });
            return tmp;
        },

        //完成所有的筛选条件，逻辑比较重
        getFilteData: function () {
            var data = this.listData;
            data = this.getTypeData(data);
            data = this.getSetoutData(data);
            data = this.getSortData(data);
            data = this.getSetoutTime(data);
            data = this.getArriveTime(data);
            data = this.getShifa(data);
            data = this.getAbledData(data);

            return data;
        },

        renderList: function () {
            //获取筛选过的数据，到这里完全满足条件了
            var data = this.getFilteData();
            var html = '';
            var showNum = 5;
            var needLazyLoad = false;

            window.scrollTo(0, 0);

            if (data.length === 0) {
                this.d_none_data.show();
                this.d_list_wrapper.hide();
                return;
            }

            needLazyLoad = (data.length > 20 && $.os.android);

            this.d_none_data.hide();
            this.d_list_wrapper.show();
            html = this.renderTpl(listTpl, { data: data, showNum: showNum, needLazyLoad: needLazyLoad });
            this.d_list_wrapper.html(html);

            if (needLazyLoad) {
                //延迟加载
                this.bindScrollEvent(showNum);
            } else {
                this.unBindScrollEvent();
            }
        },

        loadLazyItem: function (showNum) {
            var scope = this;
            var height = 120;
            var el = $('.js_list_wrapper');
            var top = el.offset().top;
            var index = 0, i;
            var y = window.scrollY;

            if (y - top < 0) return;
            index = parseInt((y - top) / height);

            this.d_list_wrapper.find('li').addClass('lazy-load');

            for (i = 0; i < showNum + 3; i++) {
                this.d_list_wrapper.find('li[data-index="' + i + '"]').removeClass('lazy-load');
            }
            for (i = index; i < index + showNum + 3; i++) {
                this.d_list_wrapper.find('li[data-index="' + i + '"]').removeClass('lazy-load');
            }

        },

        bindScrollEvent: function (showNum) {
            var scope = this;

            this.unBindScrollEvent();
            $(window).on('scroll.trainlistlazyload' + this.id, function () {
                if (scope.lazyTimer) clearTimeout(scope.lazyTimer);
                scope.lazyTimer = setTimeout(function () {
                    scope.loadLazyItem(showNum);
                }, 50);
            });

        },

        unBindScrollEvent: function (data) {
            if (this.lazyTimer) clearTimeout(this.lazyTimer);
            $(window).off('.trainlistlazyload' + this.id);
        },

        _setTrainType: function (flag) {
            flag = flag.toLowerCase();
          
            var arr = flag.split(',');
            var flag = true;
            var item;
            var map = {
                'g': 1,
                'd': 2,
                't': 3,
                'other': 4
            };

            if (arr.length == 0) {
                arr = [flag];
            }

            for (var i = 0; i < arr.length; i++) {
                item = arr[i];

                if (item === '0') item = 'other';
                if (item === 'k') item = 'other';

                if (map[item]) {
                    this.trainTypeEntity.setIndex(map[item], true);
                    flag = false;
                }
            }
            if (flag) {
                this.trainTypeEntity.checkAll();
            }
        },

        addEvent: function () {
            this.on('onShow', function () {

                this._initEntity();
                this._initModule();

                if (_.getUrlParam().flag) {
                    this._setTrainType(_.getUrlParam().flag);
                }

                //初始化date数据
                this.dateModule.initDate();
                //初始化排序工具条
                this.sortEntity.initData();

                //初始化时段选择
                this.listInit();

            });



        }

    });

});
