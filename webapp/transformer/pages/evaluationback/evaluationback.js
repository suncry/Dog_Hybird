define([
    'AbstractView',
    'text!TransPath/evaluationback/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/evaluationback/evaluationback.css'
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
                title: '',
                right: [
                    {
                        tagname: '',
                        value: '',
                        callback: function () {
                            this.forward('publish01');
                        }
                    }
                ]
            };

            //this.header.set(opts);
            this.header.hide();
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
