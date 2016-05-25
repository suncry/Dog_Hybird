define([
    'BaseView',
    'TransModel',
    'text!TransPath/cashtixian/tpl.layout.html',
    'text!TransPath/cashtixian/tpl.list.card.html',
    'text!TransStylePath/common.css',
    'text!TransPath/cashtixian/cashtixian.css'
], function (BaseView, TransModel, layoutHtml, cardHtml, commoncss,style) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.needLogin = true;
            this.template = layoutHtml;
            this.commonstyle = commoncss;
            this.accountModel = TransModel.AccountModel.getInstance();
            this.cardListModel = TransModel.CardListModel.getInstance();
            this.cashApplyModel = TransModel.CashApplyModel.getInstance();
            this.style = style;
            this.balance = 0;
            this.bankCardId = 0;
            this.selectCardName = '';
            this.selectCardNo = '';
            this.events = {
                /*'input .tixian-cash': 'validateCashAction',*/
                'blur .js-cash-count': 'blurAction',
                'focus .js-cash-count': 'focusAction',
                "click .js-tixianok": 'transformCashHandler',
                'input .js-cash-count': 'validateCashAction',
                //银行卡点击事件
                'click .bank-list>.tixian-bank': function (e) {
                    var $el = $(e.currentTarget);
                    $el.siblings('.select').each(function () {
                        $(this).removeClass('select');
                    });
                    $el.addClass('select');
                    this.bankCardId = $el.data('cardid');
                    this.selectCardName = $el.data('cardname');
                    this.selectCardNo = $el.data('cardno');
                },
                'click .js-take-all': function () {
                    if (this.balance <= 5000) {
                        this.$tixanCash.val(this.balance == 0.00 ? '' : this.balance);
                    } else {
                        this.$tixanCash.val(5000);
                    }
                    this.validateCashAction();

                }

            };

        },
        // 提现按钮点击事件
        transformCashHandler: function () {
            if (this.$tixianBtn.hasClass('disabled')) {
                return;
            }

            var scope = this;
            if (scope.needAddBankCard) {
                this.showConfirm({
                    content: '使用提现功能需要添加一张支持提现的储蓄卡',
                    'btnNames': ['取消', '添加储蓄卡'],
                    okAction: function () {
                        scope.forward('mybankcard');
                    },
                    cancelAction: function () {
                        this.hide();
                    }
                });
                return;
            }

            var cashNum = this.$tixanCash.val();
            if (cashNum < 10) {
                this.showToast('提现金额最小10元');

                return;
            } else if (cashNum > 5000) {
                this.showToast('提现金额不能超过5000');
                return;
            }


            if (!this.bankCardId) {
                this.showToast('请选择银行卡');
                return;
            }

            //输入密码
            this.showPageview('password', {
                    verifyPage: function() {
                        return true;
                    },
                    onVerifySuccess: function () {
                        scope._tixianAction();
                    },
                    initLayoutData: function() {
                        this._pageData = {
                            cashNum: cashNum,
                            title: '输入支付密码'
                        }
                        this._renderHtml();
                    },
                    setPaypasswordHandler: function () {
                        var that = this;
                        var pwd = this.$paypassword.val();
                        if(this.successFlag) return;

                        that.setPasswordBlock(pwd);

                        if (pwd.length == 6) {
                            this.successFlag = true;

                            that._verifyPwd(pwd);
                        }
                    },
                    initHeader: function () {
                        var opts = {
                            view: this,
                            title: '输入支付密码',
                            back: true
                        };
                        this.header.set(opts);
                    }
                }
            );

        },
        focusAction: function () {
            $('.js-tixianok').css('position', 'static');
        },

        blurAction: function () {
            $('.js-tixianok').removeAttr('style');
        },

        validateCashAction: function () {
            var scope = this;
            var cashVal = scope.$tixanCash.val();
            var _cashVal=cashVal.match(/^[1-9]\d*(?:\.\d{0,2})?/);
            scope.$tixanCash.val(_cashVal);
            //输入不能小于10 大于5000 大于当前余额
            if (cashVal >= 10 && cashVal <= 5000 && parseFloat(cashVal) <= parseFloat(scope.balance)) {
                this.$tixianBtn.removeClass("disabled");
            } else {
                if (this.$tixianBtn.hasClass("disabled"))return;
                this.$tixianBtn.addClass("disabled");
            }
           
            

        },
        _tixianAction: function () {
            var scope = this;
            this.cashApplyModel.urlParam = {'doctorId': this.USERINFO.userId, 'bankCardId': this.bankCardId};
            this.cashApplyModel.setParam(
                {
                    'doctorId': this.USERINFO.userId,
                    'bankCardId': this.bankCardId,
                    'money': this.$tixanCash.val()
                }
            );
            this.showLoading();

            this.cashApplyModel.post(
                function () {
                    //跳到提现结果页
                    scope.forward("applycash", {
                        'cashNum': scope.$tixanCash.val(),
                        'cardNo': scope.selectCardNo,
                        'cardName': scope.selectCardName
                    });
                }
            );
        },
        initHeader: function () {
            var opts = {
                view: this,
                title: '余额提现',
                back: true
            };

            this.header.set(opts);
        },

        //获取用户银行卡列表
        _loadCards: function () {
            var scope = this;
            this.cardListModel.urlParam = {"doctorId": this.USERINFO.userId};
            this.cardListModel.get(
                function (data) {
                    if (data.length > 0) {
                        var html = scope.renderTpl(cardHtml, {'cardList': data});
                        scope.$cardListContianer.html(html);
                    } else {
                        scope.needAddBankCard = true;
                    }

                },
                function () {
                    scope.showToast('获取银行卡失败！');
                }
            );
        },
        initElement: function () {
            this.$balance = $('.balance');
            this.$cardListContianer = $('.bank-list');
            this.$submitBtn = $('.submit-btn');
            this.$tixanCash = $('.js-cash-count');
            this.$tixianBtn = $(".js-tixianok div")
        },

        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;
                this.showLoading();
                this.accountModel.urlParam = {'userId': this.USERINFO.userId};
                this.accountModel.get(function (data) {
                    if (data && data.balance.availableMoney) {
                        scope.balance = data.balance.availableMoney;
                        scope.$balance.text(scope.balance);
                        scope.$submitBtn.removeClass('disabled');
                    } else {
                        scope.$('.js-take-all').hide();
                    }
                }, null, true);
                this._loadCards();
            });
            this.on('onHide', function () {
            });
        }
    });
});
