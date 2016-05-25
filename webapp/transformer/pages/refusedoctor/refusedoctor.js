define([
    'BaseView',
    'text!TransPath/refusedoctor/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'text!TransPath/refusedoctor/refusedoctor.css'
], function (
    BaseView,
    layoutHtml,
    commonStyle,
    TransModel,
    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;
            this.refusedModel = TransModel.RefusedModel.getInstance();

            //该页面是否需要登录鉴权
            this.needLogin = false;

            this.events = {
                'click .cm-radio-list li': 'setActive',
                'click .js-submit': 'refusedHandler'
            };

        },

        setActive: function(e) {
            this.$('li.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        },

        refusedHandler: function() {
            var reason = this.$('li.active').text();
            var other = this.$('textarea').val();
            var id = _.getUrlParam().id;
            var scope = this;
            if(reason=='' || reason==null){
            	this.showToast("请选择拒绝赴诊原因");
            	return;
            }

            this.refusedModel.setParam({
                id: id,
                reason: reason,
                other: other
            });

            this.showLoading();

            this.refusedModel.execute(function (data) {

                // //***必须改
                // if(data.sess) {
                //     window.name = data.sess;
                // }

                scope.forward('acceptnotice',{'id': id});

            });
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '请选择原因',
                back: true
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {
        },

        addEvent: function () {
            this.on('onShow', function () {
                var id = _.getUrlParam().id;
                if (!id) {
                    this.showToast('网页参数丢失');
                    this.back();
                    return ;
                }
                this.refusedModel.urlParam = {
                   id: id
                };
            });

            this.on('onHide', function () {

            });
        }

    });

});
