define([
    'BaseView',
    'text!TransPath/paysuccess/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'text!TransPath/paysuccess/paysuccess.css'
], function (
    BaseView,
    layoutHtml,
    commoncss,
    TransModel,
    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            this.needLogin = true;

            var scope = this;
            // this.template = layoutHtml;
            this.commonstyle = commoncss;

            this.style = style;

            this.events = {
                'click .js-home': function () {
                    this.forward('index');
                },
                'click .js-detail': function () {
                    this.forward('details', {
                        orderId: _.getUrlParam().orderId,
                        flag: 3,
                        doctorId: this.USERINFO.userId
                    });
                }
            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '付款成功',
                right: [
                    {
                        tagname: '',
                        value: '',
                        callback: function () {
                            
                        }
                    }
                ],
                back:function(){
                    this.forward('index');
                }
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {

        },

        renderPage: function () {
            var scope = this;
            this.detailModel = TransModel.RxOrderDetail.getInstance();

            this.detailModel.errCodeCallback['6000011'] = function (code, msg) {
                scope.showMessage({
                    content: '转诊单已被关闭，转诊费退款中，请注意查收余额',
                    btns: [
                        { name: '查看余额', className: 'js_ok' }
                    ],
                    okAction: function () {
                        scope.forward('mywallet');
                        this.hide();
                    }
                });
            };

            this.detailModel.urlParam = {
                orderId: _.getUrlParam().orderId,
                doctorId: this.USERINFO.userId
            };

            this.showLoading();
            this.detailModel.get(function (data) {
                var html = scope.renderTpl(layoutHtml, data );
                scope.$el.html(html);
            });

        },

        addEvent: function () {
            this.on('onShow', function () {

                var scope = this;
                if(!_.getUrlParam().orderId) {
                    this.showToast('订单id丢失', function () {
                        scope.forward('index');
                    })
                    return;
                }

                this.renderPage();

            });

            this.on('onHide', function () {

            });
        }

    });

});