define([
    'BaseView',
    'text!TransPath/login/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'TransStore',
    'cValidate',
    'text!TransPath/login/login.css'
], function (BaseView, layoutHtml, commonStyle, TransModel, TransStore, cValidate, style) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();
            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;
            this.smsModel = TransModel.SmsCodeModel.getInstance();
            this.loginModel = TransModel.LoginModel.getInstance();
            this.loginStore = TransStore.LoginData.getInstance();
            this.codeTxt1 = '发送验证码';
            this.codeTxt2 = '秒后重发';
            this.initSecond = 60;
            this.second = this.initSecond;
            this.Timer = null;

            this.events = {
                'click  .js-login': 'loginAction',
                'click  .js-getcode': 'getCodeAction',
                'click  .js-reg': 'regAction',
                'click .captcha-code': 'changeCaptcha'
            };


            // this.model = TransModel.LogoutModel.getInstance();
            // this.model.execute();

        },

        //所有的跳转必须封装,这里暂时如此 ***bug***
        regAction: function () {
            var registerUrl = window.location.protocol + '//' + window.location.hostname + '/m/join/register-authe?telephone=' + this.$phone.val();

            var url = encodeURIComponent(window.location.href);

            this.forward('pageview', {'url': encodeURIComponent(registerUrl), 'sourceurl': url, 'title': '注册'
            });
        },

        changeCaptcha: function () {
            $('.captcha-code>img').attr('src', '/util/captcha?' + Math.random());
            this._disabledCCode();
        },
        getCodeAction: function () {
            if (this.$codebtn.hasClass('disabled')) {
                return;
            }
            var scope = this;
            var phone =_.removeAllSpace(this.$phone.val());

            var captchaCode =_.removeAllSpace(this.$captchCode.val());
            /*只需验证11位数字即可 */
            if (!cValidate._isMobile(phone)) {
                this.showToast('请输入正确的手机号');
                /*重新刷新验证码*/
                this.changeCaptcha();
                return;
            }
            if (!captchaCode) {
                this.showToast("请输入校验码");
                return;
            }
            scope.disabledCodeBtn();
            //失败时的回调
            this.smsModel.errorCallback = function () {
                scope.$code.attr("readonly","readonly");
                scope.$code.blur();
                scope.changeCaptcha();
                scope._disabledCCode();
            };

            this.smsModel.setParam({'phone': phone, 'captcha': captchaCode});

            //this.smsModel.ajaxAsync = false;
            scope.$code.removeAttr("readonly");
            scope.$code.focus();
            
            this.smsModel.get(
                function (data) {
                    //如果手机号未注册的情况
                    if (!data.verifyCode) {
                        scope._disabledCCode();
                        scope.leadReg();
                        return;
                    }
                    scope.rightCaptchaCode = captchaCode;
                    
                },
                function (msg) {
                    scope._disabledCCode();
                }
            );

        },

        //引导注册
        leadReg: function () {
            var scope = this;
            this.showConfirm({
                content: '未检测到该手机号注册的用户',
                btns: [
                    { name: '取消', className: 'js_cancel cm-btns-cancel' },
                    { name: '去注册', className: 'js_ok cm-btns-ok' }
                ],
                okAction: function () {
                    scope.regAction();
                    this.hide();
                },
                cancelAction: function () {
                    this.hide();
                }
            });
        },

        //医联审核失败需要重新提交资料
        verifyFail: function () {
            var scope = this;
            this.showConfirm({
                content: '审核失败,请重新提交资料',
                btns: [
                    { name: '取消', className: 'js_cancel cm-btns-cancel' },
                    { name: '重新提交', className: 'js_ok cm-btns-ok' }
                ],
                okAction: function () {
                    scope.regAction();
                    this.hide();
                },
                cancelAction: function () {
                    this.hide();
                }
            });
        },
        //将发送验证码搞成不可点击 
        disabledCodeBtn: function () {
            var scope = this;
            this.$codebtn.addClass('disabled');
            this.second--;

            if (this.second > 0) {
                this.$codebtn.html(this.second + this.codeTxt2);
                this.$parent
                    .addClass('countdown')
                    .removeClass('auto');
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
            if (this.Timer) {
                this.$parent
                    .addClass('auto')
                    .removeClass('countdown');
                clearTimeout(this.Timer);
            }
            this.second = this.initSecond;
            this.$codebtn.html(this.codeTxt1);
            this.$codebtn.removeClass('disabled');
            //this.$code.attr("readonly", "readonly");
            this.$code.val("");

        },

        loginAction: function () {
            var phone = this.$phone.val();
            var code = this.$code.val();
            var captchaCode = this.$captchCode.val();
            var scope = this;

            if (!cValidate._isMobile(phone)) {
                this.showToast('请输入正确的手机号');
                return;
            }
            if (!captchaCode) {
                this.showToast("请输入校验码");
                return;
            }
            if (!code) {
                this.showToast('请输验证码');
                return;
            }
            if (captchaCode != scope.rightCaptchaCode) {
                this.showToast("请输入正确的校验码");
                scope.changeCaptcha();
                scope._disabledCCode();
                return;
            }

            this.loginModel.setParam({
                account: phone,
                smsCode: code
            });

            this.showLoading();

            //如果错误码是未注册,则引导注册
            this.loginModel.errCodeCallback['20005'] = function (code, msg) {
                scope.leadReg();
            };
            //医联审核失败
            this.loginModel.errCodeCallback['20011'] = function () {
                scope.verifyFail();
            };
            //医联审核中
            this.loginModel.errCodeCallback['20012'] = function () {
                scope.showToast('信息审核中,暂时无法登录');
                return;
            };
            //验证码错误
            this.loginModel.errCodeCallback['20003'] =function(){
            	scope.showToast("验证码错误");
            	//scope.changeCaptcha();
            	return;
            };
            this.loginModel.execute(function (data) {

                //保存用户的手机号。下次免输入
                scope.loginStore.set({'phone': scope.$phone.val()});

                //用户类型 type 1 医生用户   2 机构用户  3 游客
                if (data.type == 3) {
                    scope.leadReg();
                    return;
                } else if (data.type == 2) {
                    scope.showToast("机构端开发中，请耐心等待....");
                    return;
                }
                scope.forward("index");
           });

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '登录',
                back: false
            };

            this.header.set(opts);
            this.header.hide();
        },
        initElement: function () {
            this.$phone = this.$('.js-txt-phone');
            this.$code = this.$('.js-code');
            this.$codebtn = this.$('.js-getcode');
            this.$captchCode = this.$('.txt-captcha-code');
            this.$parent = $('.js-getcode').parents('.form-block');

        },
        addEvent: function () {
            this.on('onShow', function () {
                /*进入时重新设置校验码*/
                this.changeCaptcha();
                /*获取缓存账号*/
                var loginData = this.loginStore.get();
                if (loginData && loginData.phone) {
                    this.$phone.val(loginData.phone);
                }

                //this.leadReg();

            });

            this.on('onHide', function () {});
        }

    });

});
