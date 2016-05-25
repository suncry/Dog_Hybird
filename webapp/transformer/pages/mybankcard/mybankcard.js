define([
    'BaseView',
    'text!TransPath/mybankcard/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'UIAlert',
    'TransStore',
    'text!TransPath/mybankcard/mybankcard.css'
], function (
    BaseView,
    layoutHtml,
    commonStyle,
    TransModel,
    UIAlert,
    TransStore,
    style
    ) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();


            this.needLogin = true;

            this.bankCardModel = TransModel.BankCardModel.getInstance();
            this.cardCacheData = TransStore.CardInfoStore.getInstance();
            this.bindBankCardFromData = TransStore.BindBankCardFromData.getInstance();

            this.style = style;
            this.commonstyle = commonStyle;

            this.events = {
                'click .js-bind-card': 'bindCardHandler',
                'click .js-card': 'cardInfoHandler'
            };

        },

        // 点击卡片
        cardInfoHandler: function(e) {
            var el = $(e.currentTarget);
            var id = el.attr('data-id');
            var index = el.attr('data-index');

            // 缓存银行卡数据
            var data = {
                id: el.attr('data-id'),
                bankName: el.find('.card-name').text(),
                cardTypeName: el.find('.bank-info span').text(),
                cardNo: el.find('.card-num').text(),
                index: index
            };
            this.cardCacheData.set(data);

            this.forward('unbindcard', {
                id: this.USERINFO.userId
            });
        },

        // 点击绑定银行
        bindCardHandler: function() {
            var cardNum = this.$('.bank-card-list li').length;
            if (cardNum < 3) {
                this.bindBankCardFromData.set({name: 'mybankcard'});
                this.forward('bindcard');
            } else {
                this.bindAlert();
            }
        },

        // 超过三张卡不与绑定
        bindAlert: function() {
            var scope = this;
            if (!scope.alert) {
                scope.alert = new UIAlert({
                    title: '提示',
                    content: '最多只能绑定三张银行卡',
                    btns: [
                        { name: '好的', className: 'cui-btns-ok' }
                    ],
                    events: {
                        'click .cui-btns-ok': 'okAction'
                    },
                    okAction: function () {
                        this.hide();
                    }
                });
            }
            scope.alert.show();
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '我的银行卡',
                back: function(){
                    this.forward('mywallet');
                }
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {

        },

        initLayoutData: function() {
            var scope = this;

            this.bankCardModel.urlParam = {
                doctorId: this.USERINFO.userId
            };
            this.showLoading();
            this.bankCardModel.execute(function(data) {

                var list = {
                    'list': data
                };

                var html = scope.renderTpl(layoutHtml, list);
                scope.$el.html(html);
            });

        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initLayoutData();
            });

            this.on('onHide', function () {
                if (this.alert) this.alert.hide();
            });
        }

    });

});
