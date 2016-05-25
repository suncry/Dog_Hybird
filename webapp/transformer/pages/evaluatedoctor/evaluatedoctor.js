define([
    'BaseView',
    'text!TransPath/evaluatedoctor/tpl.layout.html',
    'text!TransStylePath/common.css',
    'UIRated',
    'UIAlert',
    'TransModel',
    'text!TransPath/evaluatedoctor/evaluatedoctor.css'
], function (
    BaseView,
    layoutHtml,
    commonStyle,
    UIRated,
    UIAlert,
    TransModel,
    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;

            this.style = style;
            this.commonstyle = commonStyle;

            //该页面是否需要登录鉴权
            this.needLogin = false;

            this.acceptnoticeModel = TransModel.AcceptnoticeModel.getInstance();
            this.evaluateModel = TransModel.EvaluateDoctorModel.getInstance();

            this.events = {
                'click .js-feedback a': 'showFeedback',
                'click .js-submit': 'evaluateHandler'
            };

        },

        showFeedback: function(e) {
            $(e.currentTarget).hide();
            this.$('.js-textarea-block').show();
        },

        evaluateHandler: function() {
            var orderId =_.getUrlParam().id;
            var scope = this;

            this.evaluateModel.setParam({
                id: orderId,
                score: this.rated.getRated(),
                feedback: this.$('.js-textarea').val()
            });

            this.showLoading();


            this.evaluateModel.execute(function () {
                scope.evaluateAlert();
            });

        },

        evaluateAlert: function() {
            var scope = this;
            if (!scope.alert) {
                scope.alert = new UIAlert({
                    content: '评价成功',
                    btns: [
                        { name: '好的', className: 'cui-btns-ok' }
                    ],
                    events: {
                        'click .cui-btns-ok': 'okAction'
                    },
                    okAction: function () {
                        scope.forward('evaluationback');
                        this.hide();
                    }
                });
            }
            scope.alert.show();
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '医生评价'
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {
        },

        initData:function() {
            var scope = this;


            this.acceptnoticeModel.execute(function (data) {
                if (data.evaluated) {
                    scope.forward('evaluationback');
                    return ;
                }
                var html = scope.renderTpl(layoutHtml,data);
                scope.data = data;
                scope.$el.html(html);

                scope.initRated();
            });
        },

        initRated: function () {
            var scope = this;
            this.rated = new UIRated({
                wrapper: this.$('.js-rated-wrapper'),
                changedAction: function (rated) {
                }
            });

            this.rated.show();
        },


        addEvent: function () {
            this.on('onShow', function () {
                var orderId=_.getUrlParam().id;

                if (!orderId) {
                    this.showToast('网页参数丢失');
                    this.back();
                    return ;
                }
                this.acceptnoticeModel.urlParam = {
                    id: orderId
                };
                this.evaluateModel.urlParam = {
                    id: orderId
                };
                this.initData();
            });

            this.on('onHide', function () {

            });
        }

    });

});
