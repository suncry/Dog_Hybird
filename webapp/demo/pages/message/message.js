define([
    'BaseView',
    'text!PagePath/message/tpl.layout.html',
    'text!StylePath/common.css'
], function (AbstractView,
             layoutHtml,
             commonStyle) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {

            $super();

            this.template = layoutHtml;
            this.commonstyle = commonStyle;

            this.events = {

            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '组件通信 Demo',
                back: function () {
                    this.back();
                }
            };
            this.header.set(opts);
        },

        initElement: function () {

        },

        addEvent: function ($super) {
            $super();

            this.on('onShow', function () {


            });
        }

    });

});
