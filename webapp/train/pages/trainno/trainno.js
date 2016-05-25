define(['AbstractView', 'text!TrainPath/trainno/tpl.layout.html', 'text!TrainPath/trainno/tpl.list.html', 'text!TrainPath/trainno/trainno.css', 'TrainBusModel', 'cUser', 'AbstractEntity'],
function (AbstractView, bodyTpl, listTpl, css, BusModel, cUser, AbstractEntity) {

    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();
            this.data = {
                data: [],
                select: []
            }
        },

        setData: function (data) {
            this.data.data = data;
        },

        getDepart: function () {
            if (this.data.select.length == 2)
                return this.data.data[this.data.select[0]].station_name;
            return null;
        },

        getArrive: function () {
            if (this.data.select.length == 2)
                return this.data.data[this.data.select[1]].station_name;
            return null;
        },

        setIndex: function (i) {
            i = parseInt(i);
            var tmp;
            if (this.data.select.length < 2) {
                if (i === this.data.select[0]) {
                    this.data.select = [];
                    this.update();
                    return;
                }
                this.data.select.push(i);
            } else {

                if (i === this.data.select[1]) {
                    tmp = this.data.select[0];
                    this.data.select = [];
                    this.data.select[0] = tmp;
                    this.update();
                    return;
                }

                if (i === this.data.select[0]) {
                    tmp = this.data.select[1];
                    this.data.select = [];
                    this.data.select[0] = tmp;
                    this.update();
                    return;
                }

                if (i > this.data.select[0] && i < this.data.select[1]) this.data.select[0] = i;
                if (i < this.data.select[0]) this.data.select[0] = i;
                if (i > this.data.select[1]) this.data.select[1] = i;

            }

            if (this.data.select.length < 2) {
                this.update();
                return;
            }
            var data = this.data.select.sort(function (s1, s2) {
                return s1 > s2;
            });

            this.data.select = [];
            this.data.select.push(data[0]);
            this.data.select.push(data[data.length - 1]);

            this.update();

        }

    });

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();
            var scope = this;
            this.template = bodyTpl;
            this.style = css;

            this.departdate = null;
            this.trainname = null;

            this.listModel = BusModel.TrainNoModel.getInstance();
            this.userModel = BusModel.UserInfoModel.getInstance();

            this.entity = new Entity();
            this.entity.subscribe(this.renderListActive, this);
            this.entity.subscribe(this.renderBar, this);

            if (!_.getUrlParam().trainno) {
                this.showToast('班次数据缺失', function () {
                    scope.back('index');
                });
            }

            this.events = {
                'click .js_item': 'itemClickAction',
                'click .js_buy': 'buyAction'
            };
        },

        renderListActive: function () {
            var items = this.$('.js_item');
            var i, len = this.entity.get().data.length;
            items.removeClass('active');
            //            items.removeClass('error');
            items.removeClass('disabled');

            if (this.entity.data.select.length == 1) {
                this.$('.js_item[data-index="' + this.entity.data.select[0] + '"]').addClass('active');
            } else if (this.entity.data.select.length == 2) {

                //权宜之计，选择器不支持
                for (i = 0; i < len && i < this.entity.data.select[0]; i++) {
                    this.$('.js_item[data-index="' + i + '"]').addClass('disabled');
                }

                for (; i < len && i < this.entity.data.select[1]; i++) {
                    this.$('.js_item[data-index="' + i + '"]').removeClass('disabled');
                }
                i++;
                for (; i < len; i++) {
                    this.$('.js_item[data-index="' + i + '"]').addClass('disabled');
                }

                this.$('.js_item[data-index="' + this.entity.data.select[0] + '"]').addClass('active');
                this.$('.js_item[data-index="' + this.entity.data.select[1] + '"]').addClass('active');

            }

        },

        renderBar: function () {
            if (this.entity.data.select.length == 2) {
                this.$('.js_buy_bar').addClass('active');
                this.$('.js_setout_arrive').html(this.entity.getDepart() + ' - ' + this.entity.getArrive());

            } else {
                this.$('.js_buy_bar').removeClass('active');
                this.$('.js_setout_arrive').html('请选择车站');
            }

        },

        itemClickAction: function (e) {
            var el = $(e.currentTarget);
            var index = el.attr('data-index');
            this.entity.setIndex(index);
        },

        buyAction: function () {
            _hmt.push(['_trackEvent', 'train.trainno.tobooking', 'click']);
            var scope = this;

            var param = {};
            param.departdate = this.departdate;
            param.trainname = this.trainname;
            //            param.departcityname = encodeURIComponent(this.entity.getDepart());
            //            param.arrivecityname = encodeURIComponent(this.entity.getArrive());

            param.departcityname = this.entity.getDepart();
            param.arrivecityname = this.entity.getArrive();

            this.authentication(function (data) {

                var url = scope._getCtripUrl('http://m.ctrip.com/webapp/train/home/trainx', param, data);

                //糯米特制
                if (_.getHybridInfo().platform == 'nuomi') {
                    url = 'bainuo://web?url=' + encodeURIComponent(url);
                }

                window.location = url;

                return;
            });

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
                    cUser.login();
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

        initHeader: function () {

            var opts = {
                view: this,
                back: function () {
                    this.back('index');
                },
                title: '选择出发和到达'
            };

            this.header.set(opts);

        },

        initBody: function () {
            var scope = this;
            var date = _.getUrlParam().date;
            var n = new Date();
            var param = {};

            //如果date不存在，默认第二天
            if (!date) {
                date = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
            } else if (typeof date == 'string' && date.indexOf('-')) {
                if (date.indexOf('-') == -1) {
                    //传人的是时间戳
                    n.setTime(date);
                    date = n;
                } else {
                    //如果传人的不是时间戳2016-01-01
                    //手白有BUG
                    var date = date.split('-');
                    if (date.length != 3) {
                        date = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
                    } else {
                        if (date[1].indexOf('0') === 0) {
                            date[1] = date[1].substr(1);
                        }
                        if (date[2].indexOf('0') === 0) {
                            date[2] = date[2].substr(1);
                        }
                        date = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]));
                    }
                }
            }

            var dateDetail = _.dateUtil.getDetail(date);

            param.date = dateDetail.year + '/' + _.dateUtil.formatNum(dateDetail.month) + '/' + _.dateUtil.formatNum(dateDetail.day);
            param.trainno = _.getUrlParam().trainno;
            this.departdate = param.date;

            this.showLoading();
            this.listModel.setParam(param);
            this.listModel.execute(function (data) {
                scope.hideLoading();
                if (data && data.stations && data.stations.length > 0) {
                    scope.renderList(data.stations);
                } else {
                    scope.showToast('暂无班次信息，即将返回首页', function () {
                        scope.back('index');
                    });
                }
            });
        },

        initElement: function () {
            this.d_list_wrapper = this.$('.js_list_wrapper');
        },

        renderBody: function (setout, arrive) {
            this.trainname = setout.sub_train_num;

            this.$('.js_trainno').html(setout.sub_train_num);
            this.$('.js_setout').html(setout.station_name);
            this.$('.js_arrive').html(arrive.station_name);
        },

        renderList: function (data) {
            this.entity.setData(data);

            this.renderBody(data[0], data[data.length - 1]);

            this.d_list_wrapper.show();
            html = this.renderTpl(listTpl, { data: data });
            this.d_list_wrapper.html(html);
        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initBody();
            });
        }

    });

});
