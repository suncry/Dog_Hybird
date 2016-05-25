define([
    'BaseView',
    'text!TransPath/applycash/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/applycash/applycash.css'
], function (
    BaseView,
    layoutHtml,
    commoncss,
    style
) {

        return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();
            var scope = this;
            this.needLogin=true;
            this.template = layoutHtml;
            this.commonstyle = commoncss;
            this.style = style;
            this.events = {
                'click .js-ok':function(){
                    this.forward('mywallet');
                }
            };

        },
        initHeader: function () {
            var opts = {
                view: this,
                title: '提现申请',
                back: function () {
                    this.back('mywallet');
                }
            };

            this.header.set(opts);
//             this.header.hide();
        },

        initElement: function () {
            this.$tixanCash=$('.tixian-cash');
            this.$cardNo=$('.card-no');
            this.$cardName=this.$('.card-name');
        },

        addEvent: function () {
            this.on('onShow', function () {
                var param=this.getParam();
                this.$cardNo.text('尾号'+param.cardNo.substr(-4));
                this.$tixanCash.text(param.cashNum+'元');
                this.$cardName.text(param.cardName);
            });
            this.on('onHide', function () {
            });
        }

    });

});
