define([
    'BaseView',
    'text!TransPath/unbindcard/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'TransStore',
    'text!TransPath/unbindcard/unbindcard.css'
], function (
    BaseView,
    layoutHtml,
    commonStyle,
    TransModel,
    TransStore,
    style
    ) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            this.needLogin = true;

            this.unbindCardModel = TransModel.UnbindCardModel.getInstance();
            this.cardCacheData = TransStore.CardInfoStore.getInstance();

            this.style = style;
            this.commonstyle = commonStyle;

            this.events = {
                'click .js-unbind': 'unbindHandler'
            };

        },

        // 解除绑定事件
        unbindHandler: function() {
            var scope = this;

            this.unbindCardModel.setParam ({
                doctorId: this.USERINFO.userId,
                bankCardId: this.cardId
            });
            this.unbindCardModel.execute(function() {
                scope.showToast('解绑成功！',function() {
                    scope.forward('mybankcard');
                });


            });
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
            // 非从我的银行卡入口进入
            if(!_.getUrlParam().id) {
              this.back();
              return;
            }

            // 取缓存银行卡数据
            var data = this.cardCacheData.get();
            this.cardId = data.id;

            this.unbindCardModel.urlParam = {
                doctorId: this.USERINFO.userId,
                bankCardId: this.cardId
            };

            var html = this.renderTpl(layoutHtml, data);
            this.$el.html(html);
        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initLayoutData();

            });

            this.on('onHide', function () {

            });
        }

    });

});
