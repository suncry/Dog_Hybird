define([
    'BaseView',
    'TransModel',
    'UIDatetimepicker',
    'text!TransPath/rxaccept/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/rxaccept/rxaccept.css'
], function (BaseView, TransModel, Datetimepicker, layoutHtml, commonStyle, style) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;
//            this.template = layoutHtml;
            this.needLogin = true;
            this.style = style;
            this.commonstyle = commonStyle;
            this.treatTime = 0;
            this.param = this.getParam();
            if (this.param.flag == 1) {
                //非定向
                this.orderdetail = TransModel.OrderPoolDetailModel.getInstance();
            } else {
                //定向
                this.orderdetail = TransModel.RxOrderDetail.getInstance();
            }
            this.docAcceptModel = TransModel.DocAcceptModel.getInstance();

            this.param = this.getParam();

            this.events = {
                'focus .js-address': function () {
                    this.$('.js-accept').css('position', 'static');
                },
                'blur .js-address': function () {
                    this.$('.js-accept').css('position', 'fixed');
                },
                'click .js-accept': function () {
                    var scope = this;
                    var address = null;
                    var param = {};
                    if(!this.treatTime){
                        this.showToast('请选择赴诊时间');
                        return;
                    }

                    if (this.treatTime < new Date().getTime()/1000) {
                        this.showToast('当前时间大于赴诊时间，请重新选择');
                        return;
                    }


                    if(this.$address[0]) {
                        address = this.$address.val();

                        if(!address) {
                            this.showToast('请输入医院接收地址');
                            return;
                        }
                    }

                    this.docAcceptModel.urlParam = {'doctorId': this.USERINFO.userId, 'orderId': this.param.orderId};

                    param = {'doctorId': this.USERINFO.userId, 'orderId': this.param.orderId, 'treatTime': this.treatTime};

                    if(this.$address[0]) {
                        param.address = address;
                    }

                    this.docAcceptModel.setParam(param);
                    this.showLoading();

                    this.docAcceptModel.errCodeCallback['6000008'] = function (code, msg) {
                        scope.showMessage({
                            content: msg,
                            btns: [
                                { name: '查看其它转诊需求', className: 'js_ok' }
                            ],
                            okAction: function () {
                                scope.forward('index');
                                this.hide();
                            }
                        });
                    };

                    this.docAcceptModel.post(function (data) {
                        window.location.href = scope._generatePayURL(data.payUrl);
                    });
                },
                'click .js-select-time': function () {
                    var scope = this,
                        nowDate = new Date(),
                        nowTime = parseInt(new Date(nowDate.getFullYear() + '/' + parseInt(nowDate.getMonth() + 1) + '/' + nowDate.getDate()).getTime()),//当前时间戳
                        timeIndex,
                        startTime = parseInt(scope.$rxTreatTime.data('start')) * 1000;//希望开始时间
                    //当期望日期大于当前日期时，日期选择器弹出默认显示为期望日期，小于则默认当天
                    if (startTime > nowTime) {
                        timeIndex =  (startTime - nowTime)/86400000;
                    } else {
                        timeIndex = 0;
                    }

                    var picker = new Datetimepicker({
                        isDownIn: true,
                        title: '选择赴诊时间',
                        beginTime: nowTime/1000,
                        endTime: (nowTime + 86400000 * 62)/1000,
                        defaultIndex: [timeIndex, 9, 0],//日期时间默认选择index数组
                        onOkAction: function (time) {
                            scope.treatTime = time;
                            var treatDate = new Date();
                            treatDate.setTime(time * 1000);
                            scope.$rxTreatTime.text(_.dateUtil.format(treatDate, 'Y.M.D H:F'));
                            this.hide();
                        }
                    });
                    this.picker = picker;
                    picker.show();
                }
            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '接收转诊',
                back: true
            };

            this.header.set(opts);
            // this.header.hide();
        },

        _renderLayout: function (data) {
            var html = this.renderTpl(layoutHtml, data);
            this.payUrl = data.payUrl;
            this.$el.html(html);
            this.initElement();
        },
        _initCountdown: function (data) {
            var scope = this;
            var time = data.restTime;
            scope.timeFun = setInterval(function () {
                if (time <= 0) {
                    scope.showMessage({
                        content: '规定时间内未付款，请重新接收',
                        okAction: function () {
                            scope.forward('index');
                            this.hide();
                        }
                    });
                    return;
                }
                time -= 1;
                scope.$countdown.text('(0'+Math.floor(time / 60) + ':' + time % 60+'后取消订单)');
            }, 1000);
        },
        initElement: function () {
            var nowDate = new Date,
                month = parseInt(nowDate.getMonth()) + 1;
            this.$rxTreatTime = $('.rxtreat-time');
            this.treatTime = this.$rxTreatTime.data('start');
            this.$countdown = this.$('.countdown');
            this.$address = this.$('.js-address');

        },

        //拼接付款链接
        _generatePayURL: function (orderPayURL) {
            return orderPayURL + '?callback=' + encodeURIComponent('http://' + window.location.hostname + '/webapp/transformer/paysuccess.html?orderId=' + this.param.orderId) + '&openid=' + this.USERINFO.weixinOpenId || '';
        },
        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;
                this.showLoading();
                this.orderdetail.urlParam = {'doctorId': this.param.doctorId, 'orderId': this.param.orderId};
                this.orderdetail.get(function (data) {
                    scope._renderLayout(data);
                    if (scope.param.flag == 1 && data.orderStatusId == 2 && data.restTime > 0) {
                        scope._initCountdown(data);
                    }
                });
            });
            this.on('onHide', function () {
                this.picker && this.picker.hide();
                this.timeFun && clearInterval(this.timeFun);
            });
        }
    });
});
