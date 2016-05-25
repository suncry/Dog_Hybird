define([
    'AbstractView',
    'text!TransPath/paymentorder/tpl.layout.html',
    'text!TransStylePath/common.css',

    'text!TransPath/paymentorder/paymentorder.css'
], function (
    AbstractView,
    layoutHtml,
    commonStyle,
    style
    ) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this.events = {
            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '支付订单',
                back: true
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {

        },

        addEvent: function () {
            this.on('onShow', function () {
              
            });

            this.on('onHide', function () {

            });
        }

    });

});
