define([
    'AbstractView',
    'text!TransPath/eligibleforf/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/eligibleforf/eligibleforf.css'
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
                title: '申请接诊资格'
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
