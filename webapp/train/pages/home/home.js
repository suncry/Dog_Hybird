define(['AbstractView', 'text!TrainHomePath/tpl.home.html', 'text!TrainHomePath/home.css', 'TrainBusModel', 'cUser'],
function (AbstractView, bodyTpl, css, BusModel, cUser) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            _hmt.push(['_trackEvent', 'train.home.view.', 'click']);

            this.userModel = BusModel.UserInfoModel.getInstance();

            this.style = css;

            this.events = {
                'click .js_tool_bar li': 'navigateTo',
                'click .js_logout': 'logout',
                'click .js_logn': 'login'
            };
        },

        initHeader: function () {

            var opts = {
                view: this,
                back: false,
                title: '我的快行'
            };

            if (_.getHybridInfo().platform == 'nuomi') {
                opts.back = function () {
                    this.back('index');
                }
            }

            this.header.set(opts);

        },

        renderBody: function (data) {
            var html = this.renderTpl(bodyTpl, data);
            this.$el.html(html);

            if (_.getHybridInfo().platform == 'nuomi') {
                this.$('.js_logout').hide();
                this.$('.js_logn').hide();
            }
        },

        initBody: function () {
            var scope = this;

            //强制验证登录
            this.userModel.baseDataValidate = function () {
                return true;
            };
            this.userModel.execute(function (data, originData) {
                if (data) scope.renderBody(data);
            }, function (data) {
                if (data && data.msg) scope.showToast(data.msg);
            }, true);
        },

        logout: function () {
            _hmt.push(['_trackEvent', 'train.home.logout', 'click']);
            var scope = this;

            this.showConfirm({
                content: '确认要退出登录吗？',
                btns: [
                    { name: '取消', className: 'cm-btns-ok js_cancel ' },
                    { name: '退出', className: 'cm-btns-cancel js_ok ' }
                ],
                okAction: function () {
                    scope.showToast('退出成功');
                    cUser.logout();
                }
            });


        },

        login: function () {
            _hmt.push(['_trackEvent', 'train.home.login', 'click']);

            cUser.login();
        },

        navigateTo: function (e) {
            var el = $(e.currentTarget);
            var name = el.attr('data-name');
            var scope = this;

            _hmt.push(['_trackEvent', 'train.home.tab-' + name, 'click']);

            if (name == 'index' || name == 'home') {
                scope.forward(name);
                return;
            }

            if (name == 'feedback') {
                url = 'http://ufosdk.baidu.com/?m=Client&a=postView&appid=1528&hasRt=true&u=' + window.location.href;
                if (_.getHybridInfo().platform == 'nuomi') {
                    url = 'http://ufosdk.baidu.com/?m=Client&a=postView&appid=1528&hasRt=true&hasTitle=false&u=' + window.location.href;
                    url = 'bainuo://web?url=' + encodeURIComponent(url);
                }
                window.location = url;
                return;
            }

            if (name == 'qianbao') {
                url = 'https://m.baifubao.com/';
                if (_.getHybridInfo().platform == 'nuomi') {
                    url = 'bainuo://web?url=' + encodeURIComponent(url);
                }

                window.location = url;
                return;
            }

            if (name == 'about') {
                this.forward('about');
                return;
            }

            if (this.userModel.baseDataValidate) delete this.userModel.baseDataValidate;

            this.userModel.baseDataValidate = function (data) {
                if (data.errno == '20001') {
                    cUser.login('http://kuai.baidu.com/webapp/train/orderlist.html');
                    return false;
                }
                return true;
            };
            this.userModel.execute(function (data, odata) {
                scope.forward(name);
                return;

                var url = 'http://m.ctrip.com/webapp/myctrip/orders/trainorderlist?allianceid=106175&sid=549977&showhead=0';
                window.location = url;
            }, function (data) {
                if (data && data.msg) scope.showToast(data.msg);
            }, true);

        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initBody();
            });
        }

    });

});
