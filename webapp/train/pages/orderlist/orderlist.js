define(['AbstractView', 'text!TrainPath/orderlist/tpl.layout.html', 'text!TrainPath/orderlist/tpl.list.html', 'text!TrainPath/orderlist/orderlist.css', 'TrainBusModel', 'cUser'],
function (AbstractView, layoutHtml, listTpl, css, BusModel, cUser) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();
            this.template = layoutHtml;
            this.style = css;

            this.events = {
                'click .js_tool_bar li': 'navigateTo',
                'click .js_order_list .js_pay_bar': 'toPay',
                'click .js_item': 'toDetail',
                'click .js-to-carpool': function () {
                    this.jump('carpool/order-user-list');
                }
            };

            this.listModel = BusModel.OrderListModel.getInstance();
            this.userModel = BusModel.UserInfoModel.getInstance();

            this.index = 0;
            this.loadingStatus = false;
        },

        initHeader: function () {
            var title = '订单列表';
            var opts = {
                view: this,
                title: title,
                back: function () {
                    this.back('index');
                }
            };

            //糯米适配
            if (_.getUrlParam().toolbar == 'false') {
                opts.title = "百度快行-订单列表";
                opts.back = function () {
                    BNJS.page.back();
                }
            }

            this.header.set(opts);
        },

        initElement: function () {
            this.d_list_wrapper = this.$('.js_list_wrapper');
            this.d_none_data = this.$('.js_none_data');
            this.d_js_tool_bar = this.$('.js_tool_bar');

            this.d_js_list_loading = this.$('.js_list_loading');

        },


        navigateTo: function (e) {
            var el = $(e.currentTarget);
            var name = el.attr('data-name');
            this.forward(name);
        },

        toPay: function (e) {
            var el = $(e.currentTarget);
            el = el.find('.js_pay_state');
            var state = parseInt(el.attr('data-state'));
            if (state !== 0) return;
            var orderid = el.attr('data-key');

            this.onPayAction(orderid)
        },

        onPayAction: function (orderid) {
            if (!orderid) return;
            var scope = this;
            var param = {};

            param.orderid = orderid;
            this.payModel.setParam(param);

            this.showLoading();
            this.payModel.execute(function (data) {
                scope.hideLoading();
                scope.onBaifubaoAction(data);
                scope.hideLoading();
            }, function (data) {
                scope.hideLoading();
                if (data && data.msg) scope.showToast(data.msg);
            });
        },

        //创建订单成功后去百度钱包支付
        onBaifubaoAction: function (data) {
            var str = '', k;
            if (!data) return;

            //百度轻应用吊起百度钱包
            if (_.getHybridInfo().platform == 'baidubox') {
                data.payParam.reqData = JSON.stringify({ cf: 'lightapp' });

                for (k in data.payParam) {
                    str += k + '=' + encodeURIComponent(data.payParam[k]) + '&';
                }
                str = str.substr(0, str.length - 1);
                str = data.payPreUrl + str;

                window.location = str;
            } else {
                window.location.href = data.payUrl;
            }

        },

        toDetail: function (e) {
            var scope = this;
            var el = $(e.currentTarget)
            var key = el.attr('data-key');
            if (!key) return;

            var param = {};
            param.orderId = key;

            this.authentication(function (data) {

                var url = scope._getCtripUrl('http://m.ctrip.com/webapp/train/home/bookingdetails', param, data);

                //糯米特制
                if (_.getHybridInfo().platform == 'nuomi') {
                    url = 'bainuo://web?url=' + encodeURIComponent(url);
                }
                console.log(url);

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


        renderList: function (data) {
            var html = '';

            if (data.list.length === 0 && this.index === 0) {
                this.d_none_data.show();
                this.d_list_wrapper.hide();
                return;
            } else {
                this.d_none_data.hide();
                this.d_list_wrapper.show();
            }

            html = this.renderTpl(listTpl, { data: data.list });
            this.d_list_wrapper.append(html);
        },

        initList: function () {
            var scope = this;
            this.d_js_list_loading.show();
            this.loadingStatus = true;

            this.listModel.setParam({ page: this.index + 1 });
            this.listModel.execute(function (data) {
                scope.d_js_list_loading.hide();
                scope.loadingStatus = false;

                if (!data || !data.list || data.list.length == 0) {
                    scope.unbindScrollEvent();
                } else {
                    scope.index++;
                }

                scope.renderList(data);
            }, function (data) {
                if (data.msg)
                    scope.showToast(data.msg);
            });
        },

        bindScrollEvent: function () {
            this.unbindScrollEvent();

            $(window).on('scroll.scollload' + this.id, $.proxy(function () {
                //如果正在加载便不可用
                if (this.loadingStatus) return;

                //滑到最低的时候才能刷新
                if (window.scrollY + document.documentElement.clientHeight < document.documentElement.scrollHeight - 50) return;

                this.initList();

            }, this));
        },

        unbindScrollEvent: function () {
            $(window).off('.scollload' + this.id);
        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initList();
                this.bindScrollEvent();

                //糯米适配
                if (_.getUrlParam().toolbar == 'false') {
                    this.$('.js_tool_bar').hide();
                }

            });

            this.on('onHide', function () {
                this.unbindScrollEvent();
            });

        }

    });

});
