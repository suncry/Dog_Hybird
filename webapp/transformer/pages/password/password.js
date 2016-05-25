define([
    'BaseView',
    'TransModel',
    'text!TransPath/password/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/password/password.css'
], function (BaseView, TransModel, layoutHtml, commonStyle, style) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.needLogin = true;
            this.style = style;
            this.commonstyle = commonStyle;
            this.logicType = 'verify';

            this.accountModel = TransModel.AccountModel.getInstance();
            this.verifyPaypasswordModel = TransModel.VerifyPaypasswordModel.getInstance();
            this.setPaypasswordModel = TransModel.SetPaypasswordModel.getInstance();

            this.successFlag = false;

            this.setPwd = '';
            this.events = {
                'input .js-paypassword': 'setPaypasswordHandler',
                'focus .js-paypassword': 'hideForgetBtn',
                'blur .js-paypassword': 'showForgetBtn'
            };

        },

        // 安卓输入框bugfix
        hideForgetBtn: function () {
            this.$forgetbtn.css('position', 'static');
        },
        showForgetBtn: function () {
            this.$forgetbtn.css('position', 'absolute');
        },

        // 监听输入事件
        setPaypasswordHandler: function () {
            var scope = this;
            var pwd = this.$paypassword.val();

            if(this.successFlag) return;

            scope.setPasswordBlock(pwd);

            if (pwd.length == 6) {
                this.successFlag = true;
                if (scope.logicType == 'verify' || scope.logicType == 'tixian') {
                    scope._verifyPwd(pwd);
                } else if (scope.logicType == 'setpwd') {
                    scope.setPwd = pwd;
                    scope.logicType = 'confirm';
                    scope._clearInput();
                    scope._renderHtml({'title': '请再次确认支付密码', 'cashNum': 0});
                } else if (scope.logicType == 'confirm') {
                    if (scope.setPwd == pwd) {
                        scope._setPwd(pwd);
                    } else {
                        scope._clearInput();
                        scope.showToast('2次输入密码不一致,请重新输入')
                    }
                }
            }
        },

        // 图形转换
        setPasswordBlock: function (pwd) {
            var length = pwd.length;
            var active = $('.password-block .active');
            active.removeClass('active');
            for (var i = 0; i < length; i++) {
                $(this.$borderbloce[i]).addClass('active');
            }
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '',
                back: true
            };
            this.header.set(opts);
        },
        _setHeader: function (titleName) {
            var opts = {
                view: this,
                title: titleName,
                back: true
            };
            this.header.set(opts);
        },

        _initElement: function () {
            this.$paypassword = $('.js-paypassword');
            this.$borderbloce = $('.js-border');
            this.$forgetbtn = $('.js-forget');
        },

        _verifyPwd: function (pwd) {
            var scope = this;
            this.verifyPaypasswordModel.urlParam = {
                'doctorId': this.USERINFO.userId
            };
            this.verifyPaypasswordModel.setParam({
                'doctorId': this.USERINFO.userId,
                'payPasswd': pwd
            });
            this.showLoading();
            this.verifyPaypasswordModel.execute(function (data) {
                if (data.valid) {
                    scope.onVerifySuccess();
                    scope.targetViewId && scope.forward(scope.targetViewId);
                } else {
                    scope.showToast('密码输入错误,请重新输入');
                    scope._clearInput();
                }
            }, function() {
                scope._clearInput();
            });

        },
        onVerifySuccess: function () {

        },

        // 清空输入框
        _clearInput: function () {
            this.$paypassword.val('');
            this.successFlag = false;
            this.$borderbloce.removeClass('active');
        },
        _setPwd: function (pwd) {
            var scope = this;
            this.setPaypasswordModel.urlParam = {
                'doctorId': this.USERINFO.userId
            };
            this.setPaypasswordModel.setParam({
                'doctorId': this.USERINFO.userId,
                'verifyCode': scope.verifyCode || '',
                'payPasswd': pwd
            });
            this.setPaypasswordModel.execute(function (data) {
                if (data) {
                    scope.showToast('设置成功');
                    scope.forward(scope.targetViewId);
                } else {
                    scope.showToast('设置失败');
                }
            });
        },
        _renderHtml: function (tmpData) {

            if(!tmpData) {
                tmpData = this._pageData;
            }

            var html = this.renderTpl(layoutHtml, tmpData);
            this.$el.html(html);
            this._initElement();
        },

        //@override
        initLayoutData: function () {
            var scope = this;
            var urlParam = this.getParam();

            this.accountModel.urlParam = {'userId': this.USERINFO.userId};
            this.targetViewId = urlParam.targetView;
            //短信验证码。用于重置支付密码时使用
            this.verifyCode = urlParam.verifyCode;
            this.showLoading();
            this.accountModel.get(function (data) {
                var titleName = '输入支付密码';
                var tmpData = {'title': '输入支付密码', 'cashNum': 0};
                //如果是首次使用。或者是重置支付密码
                if (!data.isSetPasswd || urlParam.type == 'forgetpwd') {
                    titleName = '设置支付密码';
                    tmpData.title = '请设置支付密码';
                    scope.logicType = 'setpwd';
                } else if (urlParam.type == 'tixian') {
                    tmpData.cashNum = urlParam.cashNum;
                    scope.logicType = 'tixian';
                }
                scope._setHeader(titleName);
                scope._renderHtml(tmpData);
                $('.js-paypassword').click();
            }, null, true);
        },

        //该页面不能单独存在
        //@override
        verifyPage: function() {
            return false;
        },

        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;
                if(!this.verifyPage()) {
                    this.showToast('页面已经失效,即将返回上一个页面', function() {
                        scope.back();
                    });
                    return
                }

                this.$el.html('');
                this.initLayoutData();
            });

            this.on('onHide', function () {
            });
        }

    });

});
