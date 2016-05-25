define([
    'BaseView',
    'cValidate',
    'TransModel',
    'TransStore',
    'UIGroupSelect',
    'text!TransPath/bindcard/tpl.layout.html',
    'text!TransStylePath/common.css',

    'text!TransPath/bindcard/bindcard.css'
], function (
    BaseView,
    cValidate,
    TransModel,
    TransStore,
    UIGroupSelect,
    layoutHtml,
    commonStyle,
    style
    ) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();


            var scope = this;
            this.needLogin = true;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this.getSmsAddCardModel = TransModel.GetSmsAddCardModel.getInstance();
            this.bankCardCheckModel = TransModel.BankCardCheckModel.getInstance();
            this.bankCardAddModel = TransModel.BankCardAddModel.getInstance();
            this.bindBankCardFromData = TransStore.BindBankCardFromData.getInstance();

            this.codeTxt1 = '发送验证码';
            this.codeTxt2 = '秒后重发';
            this.initSecond = 59;
            this.second = this.initSecond ;

            this.Timer = null;

            this.events = {
                'click .js-checkbox': 'radioCheck',
                'click .js-tips': 'showTips',
                'blur .js-card': 'getTypeOfCard',
                'blur .js-ids': 'checkIds',
                'click .js-code-btn': 'getCode',
                'click .js-area': 'selectArea',
                'click .js-submit': 'postData',
                'click .js-delete': 'deleteCardNumber',


                'focus .js-name': 'setStatic',
                'blur .js-name': 'setFixed',
                'focus .js-ids': 'setStatic',
                'focus .js-card': 'setStatic',
                'focus .js-subbranch': 'setStatic',
                'blur .js-subbranch': 'setFixed',
                'focus .js-tel': 'setStatic',
                'blur .js-tel': 'setFixed',
                'focus .js-code': 'setStatic',
                'blur .js-code': 'setFixed'
            };

        },

        //解决安卓和ios的对fix支持度不一样bug
        setStatic: function () {
            var scope = this;
            scope.$submit.addClass('static');
        },
        setFixed: function () {
            var scope = this;
            scope.$submit.removeClass('static');
        },


        deleteCardNumber: function (e) {
            var scope = this;
            this.$card.val('');
            $(e.currentTarget).parents('span').removeClass('relate');
            clearTimeout(scope.t);
        },

        //获取地区
        showTips: function () {
            this.showMessage({
                'title': '手机号说明',
                'content': '银行预留的手机号是办理该银行卡时所填写的手机号；无预留、已忘记或已停用的情况，请联系银行客服更新处理。'
            });
        },

        getDataCityData: function (callback, id) {
            if(!id) id = 0;
            var scope = this;
            var model = TransModel.CityModel.getInstance();

            model.urlParam = {
                id: id
            };

            this.showLoading();
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

            var scope = this;

            if (!this.uiCity) {

                var data1 = this.data1;
                var data2 = this.data2;
                var data3 = this.data3;

                this.uiCity = new UIGroupSelect({
                    isDownIn: true,
                    title: 'groupselect 组件',
                    data: [data1, data2, data3],
                    indexArr: [0, 0, 0 ],
                    changedArr: [
                        function (item) {
                            var uiScope = this;
                            scope.getDataCityData(function (data) {
                                uiScope.data[1] = data;
                                uiScope.scrollArr[1].reload({data: data});
                            }, item.id)
                        },
                        function (item) {
                            var uiScope = this;
                            scope.getDataCityData(function (data) {
                                uiScope.data[2] = data;
                                uiScope.scrollArr[2].reload({data: data});
                            }, item.id)
                        }
                    ],
                    onShow: function () {
                        this.$el.addClass('cm-scroll-select-wrap');
                        this.$('.cm-scroll-select-wrap').width('33%');
                    },
                    onOkAction: function (item) {
                        scope.$areaWord.html(item[0].name + ' ' + item[1].name + ' ' + item[2].name + ' ');
                        scope.areaId = item[2].id;
                        this.hide();
                    }
                });
            }

            this.uiCity.show();

        },
        //判断身份证号是否输入正确
        checkIds: function () {
            var scope = this,
                idsNumber = scope.$ids.val();
            scope.setFixed();
            if (idsNumber.length == 0) {
                scope.idsOk = false;
                return false;
            }
            if (idsNumber.length <= 0 || !cValidate.isIdCard(idsNumber)) {
                scope.showToast('请填写正确的身份证号');
                scope.idsOk = false;
                return false;
            }
            scope.idsOk = true;
            return true;

        },
        //验证银行卡正确与否以及获取银行卡类型
        getTypeOfCard: function (e) {
            var scope = this,
                $curentTag = $(e.currentTarget),
                cardNumber = $curentTag.val();
            scope.setFixed();
            if (cardNumber.length == 0) {
                $curentTag.parents('span').removeClass('relate');
                scope.cardOk = false;
                return;
            }

            $curentTag.parents('span').addClass('relate');

            scope.t = setTimeout(function () {
                if (cardNumber.length < 16 || !cValidate.isCard(cardNumber)) {
                    scope.cardOk = false;
                    scope.showToast('请输入正确的银行卡号');
                    return;
                }
                scope.cardOk = true;
                scope.bankCardCheckModel.urlParam = {
                    'doctorId' : scope.USERINFO.userId,
                    'cardNo' : cardNumber
                };
                scope.bankCardCheckModel.execute(
                    function (data) {
                        scope.$cardType.html(data.bankName + '  ' + data.cardTypeName);
                    }
                );
            }, 200);

        },

        //获取验证码
        getCode: function () {
            if(this.$codebtn.hasClass('disabled')) {
                return;
            }
            var scope = this,
                phone = this.$tel.val();
            if (phone.length == 0 || !cValidate.isMobile(phone)) {
                scope.showToast('请输入正确的手机号');
                return false;
            }
            scope.disabledCodeBtn();
            scope.getSmsAddCardModel.urlParam = {
                'doctorId' : scope.USERINFO.userId
            };
            scope.getSmsAddCardModel.setParam({
                'cardNo': scope.$card.val(),
                'phone': phone
            });
            //失败时的回调
            scope.getSmsAddCardModel.errorCallback = function () {
                scope._disabledCCode();
                scope.showToast('网络错误，请稍后再试！');
                return false;
            };
            this.getSmsAddCardModel.execute(function () {
                scope.smsXhring = false;
            });
        },

        //将发送验证码搞成不可点击
        disabledCodeBtn: function () {
            var scope = this;
            this.$codebtn.addClass('disabled');
            this.second--;

            if(this.second > 0) {
                this.$codebtn.html(this.second + this.codeTxt2);
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
            this.$codebtn.html(this.codeTxt1);
            this.$codebtn.removeClass('disabled');

        },

        //radio切换js
        radioCheck: function (e) {
            var $currentTag = $(e.currentTarget);
            $currentTag.toggleClass('active');
        },

        getPostParam: function () {
            var param = {},
                scope = this;

            param.cardHolder = scope.$name.val();
            if (param.cardHolder.length <= 0) {
                scope.showToast('请输入持卡人姓名');
                return false;
            }

            if (!scope.idsOk) {
                scope.showToast('请输入正确的身份证号');
                return false;
            }
            param.idCardNo = scope.$ids.val();


            if (!scope.cardOk) {
                scope.showToast('请输入正确的卡号');
                return false;
            }
            param.cardNo = scope.$card.val();

            if (!scope.areaId) {
                scope.showToast('请选择开户行地区');
                return false;
            }
            param.areaId = scope.areaId;//卡地区

            param.bank = scope.$subbranch.val();
            if (param.bank.length <= 0 ) {
                scope.showToast('请输入开户行支行');
                return false;
            }
            if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(param.bank)) {
                scope.showToast('请输入正确的开户行支行');
                return false;
            }

            param.phone = scope.$tel.val();
            if (!cValidate.isMobile(param.phone)) {
                scope.showToast('请输入正确的手机号');
                return false;
            }

            param.verifyCode = scope.$code.val();
            if (param.verifyCode.length <= 0) {
                scope.showToast('请输入正确的验证码');
                return false;
            }


            return param;
        },

        postData: function (e) {
            var scope = this,
                $current = $(e.currentTarget),
                param;
            if ($current.hasClass('loading')) {
                return false;
            }
            param = scope.getPostParam();
            if (!param) {
                return false;
            }
            $current.addClass('loading');

            scope.bankCardAddModel.urlParam = {
                'doctorId': scope.USERINFO.userId
            };
            scope.bankCardAddModel.setParam(param);

            //失败时的回调
            scope.bankCardAddModel.errorCallback = function () {
                $current.removeClass('loading');
                scope.showToast('网络错误，请稍后再试！');
                return false;
            };
            scope.bankCardAddModel.post(function () {
                scope.showToast('添加银行卡成功', function () {
                    scope.forward('mybankcard');
                });
            });


        },

        initHeader: function () {
            var scope = this;
            var opts = {
                view: this,
                title: '银行卡',
                back: function(){
                    scope.forward(scope.backUrl || 'mywallet');
                }
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {
            this.$name = $('.js-name');//持卡人名称input
            this.$ids = $('.js-ids');//持卡人身份证input
            this.$card = this.$('.js-card');//卡号input
            this.$subbranch = $('.js-subbranch');//开户支行input
            this.$tel = $('.js-tel');//手机号input
            this.$code = $('.js-code');//验证码input
            this.$codebtn = $('.js-code-btn');//点击获取验证码btn
            this.$cardType = $('.js-card-type');//显示卡类型
            this.$areaWord = $('.js-area-word');//开户地区
            this.$submit = $('.js-submit');

        },

        addEvent: function () {
            this.on('onShow', function () {
                //由于以下都是blur判断，节省判断次数
                this.cardOk = false;//判断银行卡号是否正确
                this.idsOk = false;//判断身份证号输入是否正确
                this.backObj = this.bindBankCardFromData.get();
                this.backUrl =  this.backObj ? this.backObj.name : '';//判断从哪儿调过来的

            });

            this.on('onHide', function () {
                if (this.uiCity) {
                    this.uiCity.hide();
                }
            });
        }

    });

});
