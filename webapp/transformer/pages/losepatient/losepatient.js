define([
    'BaseView',
    'TransModel',
    'text!TransPath/losepatient/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransStore',
    'text!TransPath/losepatient/losepatient.css'
], function (
    BaseView,
    TransModel,
    layoutHtml,
    commonStyle,
    TransStore,
    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();



            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.needLogin =true;
            this.commonstyle = commonStyle;
            this.losepatientModel = TransModel.LosepatientModel.getInstance();
            this.events = {
                'click .js-ok': 'missAction',
                "click li": 'radioCheck'
            };

        },

        //患者爽约提交数据
        missAction: function () {
            var scope = this;
            scope.losepatientModel.urlParam = {
                'doctorId': this.USERINFO.userId,
                'orderId': scope.orderId
            };
            scope.losepatientModel.setParam({
                'reason': scope.$reasons.find('.active').text(),
                'other': scope.$other.val()
            });
            this.showLoading();
            scope.losepatientModel.post(function () {
                scope.showMessage({
                    content: '<p style="text-align: center">提交成功</p>1-3个工作日会退款到您的医联账户',
                    btns: [
                        { name: '好的', className: 'js_ok' }
                    ],
                    okAction: function () {
                        scope.back('index');
                        this.hide();
                    }

                });
            });
        },
        //radio切换js
        radioCheck: function (e) {
            var $currentTag = $(e.currentTarget);
            if($currentTag.hasClass('active')) {
                return;
            }
            $('.js-radio').parent('li').removeClass('active');
            $currentTag.addClass('active');
        },
        initHeader: function () {
            var scope = this;
            var opts = {
                view: this,
                title: '患者爽约',
                back: function () {
                    var tagStore = TransStore.IndexTagStore.getInstance();
                    tagStore.set(3);

                    scope.back('index');
                }
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {
            this.$reasons = $('.js-reason');
            this.$other = $('.js-other');
        },

        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;
                scope.orderId  = _.getUrlParam().orderId;
                if (!scope.orderId) {
                    scope.showToast('参数错误', function () {
                        scope.back();
                    });
                }
            });

            this.on('onHide', function () {

            });
        }

    });

});
