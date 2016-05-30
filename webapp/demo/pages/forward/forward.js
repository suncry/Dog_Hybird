define([
    'BaseView',
    'text!PagePath/forward/tpl.layout.html',
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
                'click .js-btn0': function () {
                    this.forward('index');
                },
                'click .js-btn1': function () {
//这里没写好,要改造
this.forward('index', null, null, 'pop');
                }
            }

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: 'forward Demo',
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
