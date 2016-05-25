define([
    'BaseView',
    'TransModel',
    'text!TransPath/forgetpassword/tpl.layout.html',
    'text!TransStylePath/common.css',

    'text!TransPath/forgetpassword/forgetpassword.css'
], function (
    BaseView,
    TransModel,
    layoutHtml,
    commonStyle,
    style
    ) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.needLogin =true;
            this.commonstyle = commonStyle;
            this.needLogin = true;

            this.accountModel = TransModel.AccountModel.getInstance();
            this.smsModel = TransModel.ModifyPayPasswdSms.getInstance();
            this.verifySmsModel = TransModel.VerifySmsModel.getInstance();

            this.codeTxt1 = '获取验证码';
            this.codeTxt2 = '秒后重发';
            this.initSecond = 60;
            this.second = this.initSecond ;
            this.Timer = null;
            this.isSubmit = false;

            this.captchaVal = '';

            this.events = {
                'click .js-smscode': 'smsCodeHandler',
                'click .js-captcha-code': 'changeCaptcha',
                'click .js-go-setpwd': 'setPasswordHandler'
            };

        },
        // 校验验证码&去往设置页面
        setPasswordHandler: function() {
            var captcha = this.$captchaVal.val();
            var code = this.$smsCode.val();
            var scope = this;

            if (this.isSubmit) {
                return;
            }


            if(!captcha) {
                this.showToast('请输校验码');
                return;
            } else if (this.captchaVal != captcha) {
                this.showToast('校验码错误');
                this.changeCaptcha();
                this._disabledCCode();
                return ;
            }

            if(!code) {
                this.showToast('请输验证码');
                return;
            }

            this.isSubmit = true;

            this.verifySmsModel.setParam({
                'doctorId': this.USERINFO.userId,
                'verifyCode' : code
            });

            this.verifySmsModel.execute(function() {
                scope.forward('paypassword', {
                    'verifyCode': code,
                    'type': 'forgetpwd',
                    'targetView': 'personalcenter'
                });
            });
            this.verifySmsModel.errorCallback = function () {
                scope.changeCaptcha();
                scope._disabledCCode();
                scope.isSubmit = false;
            };

        },

        // 校验图形验证码
        smsCodeHandler: function() {
            if (this.$getCodeBtn.hasClass('disabled')) { return;}

            var captcha =_.removeAllSpace(this.$captchaVal.val());
            var scope = this;

            if(!captcha) {
                this.showToast('请输校验码');
                return;
            }

            scope.disabledCodeBtn();

            scope.$smsCode.removeAttr('readonly');
            scope.$smsCode.focus();

            this.smsModel.setParam({
                'doctorId': this.USERINFO.userId,
                'captcha': captcha
            });

            this.smsModel.execute(function() {
                scope.captchaVal = captcha;

            });
            this.smsModel.errorCallback = function () {
                scope.$smsCode.blur();
                scope.$smsCode.attr("readonly","readonly");
                scope.changeCaptcha();
                scope._disabledCCode();
            };


        },

        // 修改图形验证码
        changeCaptcha: function() {
            this.$captchaVal.val('');
            this.$captchaImg.attr('src','/util/captcha?'+ Math.random());
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '修改密码',
                back: true
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {
            this.$userPhone = this.$('.js-phone');
            this.$smsCode = this.$('.js-smscode-input');
            this.$getCodeBtn = this.$(".js-smscode");
            this.$captchaVal = this.$('.js-captcha');
            this.$captchaImg = this.$('.js-captcha-code img');
        },

        //将发送验证码搞成不可点击
        disabledCodeBtn: function () {
            var scope = this;
            this.$getCodeBtn.addClass('disabled');
            this.second--;

            if(this.second > 0) {
                this.$getCodeBtn.html(this.second + this.codeTxt2);
                this.Timer = setTimeout(function () {
                    scope.disabledCodeBtn()
                }, 1000);
            } else {
                //结束倒数
                this._disabledCCode();
            }
        },

        _disabledCCode: function () {
            //结束倒数
            if(this.Timer)  clearTimeout(this.Timer);
            this.second = this.initSecond;
            this.$getCodeBtn.html(this.codeTxt1);
            this.$getCodeBtn.removeClass('disabled');

        },

        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;

                this.smsModel.urlParam = {
                    'doctorId' : this.USERINFO.userId
                };
                this.accountModel.urlParam = {
                    'userId': this.USERINFO.userId
                };
                this.accountModel.execute(function(data) {
                    var num = data.phone.substr(0,3) + '****' + data.phone.substr(7);
                    scope.$userPhone.text(num);
                });
                this.verifySmsModel.urlParam = {
                    'doctorId': this.USERINFO.userId
                };
            });

            this.on('onHide', function () {

            });
        }

    });

});
