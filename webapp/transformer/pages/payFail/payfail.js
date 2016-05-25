define([
    'AbstractView',
    'text!TransPath/payfail/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/payfail/payfail.css'
], function (
    AbstractView,
    layoutHtml,
    commoncss,
    style
) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.template = layoutHtml;
            this.commonstyle = commoncss;

            this.style = style;

            this.events = {
            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '付款失败',
                right: [
                    {
                        tagname: '',
                        value: '',
                        callback: function () {
                            
                        }
                    }
                ]
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
