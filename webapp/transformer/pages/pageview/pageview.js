/**
 * Created by xujia on 2016/4/19.
 */
define([
    'BaseView',
    'AbstractStore',
    'text!TransPath/pageview/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/pageview/pageview.css'
], function (BaseView,
             AbstractStore,
             layoutHtml,
             commoncss,
             style) {
    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();
            this.template = layoutHtml;
            this.commonstyle = commoncss;
            this.style = style;
            this.param = this.getParam();
            this.events = {}
        },


        initHeader: function () {
            var scope = this;
            var opts = {
                view: this,
                title: this.param.title || '',
                back: true
            };

            opts.back = function () {
                document.getElementById('main').focus();
                document.activeElement && document.activeElement.blur();

                if(_.getUrlParam().sourceurl) {
                    window.location =  decodeURIComponent(_.getUrlParam().sourceurl);
                } else if (scope.param.backView) {
                    scope.forward(scope.param.backView);
                } else {
                    scope.back();
                }
            };

            this.header.set(opts);
        },

        initElement: function () {
            this.$iframeView = this.$('.iframe-view');
        },
        addEvent: function () {
            this.on('onShow', function () {

                //this.$el.css({
                //    position: 'absolute',
                //    left: '0px',
                //    right: '0px',
                //    bottom: '0px',
                //    top: '2.5rem',
                //    height: 'auto'
                //});

                //this.$el.height($(window).height() - $('#headerview').height());

                this.setViewportSize();

                if (this.param.url) {
                    this.$iframeView.attr('src', decodeURIComponent(this.param.url));
                }
            });

            this.on('onHide', function () {

                AbstractStore.clearData();
                document.activeElement && document.activeElement.blur();

            });

        }
    });
});