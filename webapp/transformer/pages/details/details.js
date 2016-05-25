define([
    'BaseView',
    'text!TransPath/details/tpl.layout1.html',
    'text!TransPath/details/tpl.layout2.html',
    'text!TransPath/details/tpl.layout3.html',

    'TransModel',

    'text!TransStylePath/common.css',
    'text!TransPath/details/details.css'
], function (
    BaseView,
    layoutHtml1,
    layoutHtml2,
    layoutHtml3,

    TransModel,

    commonStyle,
    style
    ) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            this.needLogin = true;

            var scope = this;
            // this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this.flag = _.getUrlParam().flag || 2;

            this.events = {
                'click .js-click-items li': 'handleItemAction',
                'click .js-ok': 'okAction'
            };

            if(this.flag == 1) {
                this.detailModel = TransModel.OrderPoolDetailModel.getInstance();
            } else if(this.flag == 2) {
                this.detailModel = TransModel.DocOrderDetail.getInstance();
            } else {
                this.detailModel = TransModel.RxOrderDetail.getInstance();
            }

            //列表操作项,model映射,没有映射就需要特殊操作
            this.tagModel = {
                close: TransModel.DocCloseModel.getInstance(),
                open: TransModel.DocOpenModel.getInstance(),
                ok: TransModel.DocSuifangquerenModel.getInstance(),
                accepted: TransModel.DocAcceptPatientModel.getInstance(),
                end: TransModel.DocEndModel.getInstance()
            };

            this.msgMap = {
                close: ['确认要关闭该转诊单?', '是', '否'],
                ok: ['是否已和患者沟通确认?', '已确认', '未确认']
            };

            //我的转诊列表映射
            this.map1 = [
                {'<li class="flex-item " data-tag="close" >关闭</li>': [1, 2]},
                // {'<li class="flex-item " data-tag="edit" >编辑</li>': [1, 2]},
                {'<li class="flex-item " data-tag="open" >开启</li>': [11]},
                {'<li class="flex-item " data-tag="ok" >随访确认</li>': [8]},
                {'<li class="flex-item " data-tag="contact" >联系患者</li>': [5,6,9]}
            ];

            //我的接诊列表状态映射
            this.map2 = [
                {'<li class="flex-item " data-tag="miss" >患者爽约</li>': [3, 4]},
                {'<li class="flex-item js-topay" data-tag="pay" >去付款</li>': [2]},
                {'<li class="flex-item " data-tag="reschedule" >患者改期</li>': [3, 4]},
                {'<li class="flex-item " data-tag="accept" >接收转诊</li>': [1]},
                {'<li class="flex-item " data-tag="accepted" >已接收患者</li>': [3, 4]},
                {'<li class="flex-item " data-tag="end" >患者已出院</li>': [7]}
            ];

        },

        _getItemData: function (e) {

            var el = $(e.currentTarget);
            el = el.parent();
            var id = el.attr('data-id');
            var doc = el.attr('data-docid');
            var tel = el.attr('data-tel');
            var time = el.attr('data-time');

            e.preventDefault();

            return {
                treatTime: time,
                orderId: id,
                doctorId: doc,
                flag: this.flag,
                tel: tel,
                id: id,
                docId: doc
            }

        },

        _handleItemAction: function (e, model) {
            var el = $(e.currentTarget);
            var parent = el.parent();
            var root = el.closest('.js-item-root');
            var scope = this;
            var param = this._getItemData(e);


            model.urlParam = {
                doctorId: param.doctorId,
                orderId: param.orderId
            };

            this.showLoading();
            model.execute(function (data) {
                scope.initData();
            });
        },

        handleItemAction: function (e) {
            var data = this._getItemData(e);
            var el = $(e.currentTarget);
            var tag = el.attr('data-tag');
            var msgArr = this.msgMap[tag];
            var scope = this;

            if(this.tagModel[tag]) {

                if(msgArr) {
                    this.showConfirm({
                        content: msgArr[0],
                        btns: [
                            { name: msgArr[1], className: 'js_ok cm-btns-ok' },
                            { name: msgArr[2], className: 'js_cancel cm-btns-cancel' },
                        ],
                        okAction: function () {
                            scope._handleItemAction(e, scope.tagModel[tag]);
                            this.hide();
                        },
                        cancelAction: function () {
                            this.hide();
                        }
                    });

                    return;
                }

                this._handleItemAction(e, this.tagModel[tag])
                return;
            }

            if(this['handleItem_' + tag]) {
                this['handleItem_' + tag](data, e)
            }

        },

        _handleItem_pay: function (e, data) {
            var el = $(e.currentTarget);
            var parent = el.parent();
            var root = el.closest('.js-item-root');

            this._ItemDomHandle(parent, root, data)

        },

        //特殊处理,得拿到当前订单详情是否是已支付状态,然后才能做跳转
        handleItem_pay: function (param, e) {

            var scope = this;
            //接诊医生详情
            var model = TransModel.RxOrderDetail.getInstance()

            if(this.flag == 1) {
                var model = TransModel.OrderPoolDetailModel.getInstance()
            }

            model.urlParam = {
                doctorId: param.doctorId,
                orderId: param.orderId
            };

            //如果错误码是未注册,则引导注册
            model.errCodeCallback['6000008'] = function (code, msg) {
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

            this.showLoading();
            model.get(function (data) {

                //只有状态2才会跳转
                if(data.orderStatusId == 2) {
                    scope.forward('rxaccept',{'doctorId':scope.USERINFO.userId,'orderId':data.orderId, 'flag': data.direct === 0 ? 1 : 3});
                    return;
                }

                //状态不对更新状态
                scope.showMessage({
                    content: '该单已被锁定,您暂时无法接收',
                    btns: [
                        { name: '查看其它转诊需求', className: 'js_ok' }
                    ],
                    okAction: function () {
                        scope.forward('index');
                        this.hide();
                    }

                });

            });
        },

        handleItem_reschedule: function (data) {
            this.forward('docreschedule', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'treatTime': data.treatTime

            });
        },

        handleItem_accept: function (data) {
            var scope=this;
            this.acceptOrderModel=TransModel.DocAcceptModel.getInstance();
            this.acceptOrderModel.urlParam = {'doctorId': this.USERINFO.userId, 'orderId': data.orderId};

            //如果错误码是未注册,则引导注册
            this.acceptOrderModel.errCodeCallback['6000008'] = function (code, msg) {
                scope.showMessage({
                    content: msg,
                    okAction: function () {
                        scope.forward('index');
                        this.hide();
                    }
                });
            };

            this.showLoading();
            this.acceptOrderModel.post(
                function(data1){
                    scope.forward('rxaccept', {
                        'doctorId': data.doctorId,
                        'orderId': data.orderId,
                        'flag': scope.flag
                    });
                }
            ),function(data){
                scope.showToast('操作失败，请重试！');

            };
        },

        handleItem_miss: function (data) {
            this.forward('losepatient', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'flag': this.flag

            });
        },

        handleItem_contact: function (data) {
            window.location.href = 'tel://' + data.tel;
        },

        handleItem_edit: function (data) {
            this.forward('publish', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'flag': this.flag

            });
        },

        initHeader: function () {

            var title = '转诊单详情';

            if(this.flag == 3) {
                title = '接诊单详情';
            }

            var opts = {
                view: this,
                title: title,
                back: true
            };

            if(history.length == 1) {
                opts.back = function() {
                    this.back('index');
                }
            }

            this.header.set(opts);
            // this.header.hide();
        },

        initData: function () {
            var scope = this;
            var map;
            var _tabName = '发布';
            var tpl;

            if(!_.getUrlParam().orderId) {
                this.showToast('该页面已过期,即将返回首页', function () {
                    scope.back('index');
                });

                return;
            }

            var id = _.getUrlParam().orderId;
            var doctorId = _.getUrlParam().doctorId;

            if(!doctorId) doctorId = this.USERINFO.userId;

            if(!id) return;

            this.detailModel.urlParam = {
                doctorId: doctorId,
                // doctorId: 188,
                orderId: id
            };

            this.detailModel.errCodeCallback['6000011'] = function (code, msg) {
                scope.showMessage({
                    content: msg,
                    okAction: function () {
                        scope.forward('index');
                        this.hide();
                    }
                });
            };

            this.showLoading();
            this.detailModel.get(function (data) {
                scope.renderPage(data, scope.flag);
                if ($('.flex-box li').length == 1 ) {
                    $('.flex-box').addClass('singer');
                }
            });

        },

        //如果是待付款状态需要加入倒计时功能
        countdown: function (data) {
            if(data.orderStatusId != 2) return;
            if(!data.restTime) return;
            var scope = this;
            var $pay = this.$('.js-topay');

            if(this.countdownTimer) _.clearCountdownTimer(this.countdownTimer);
            this.countdownTimer =  _.countdownTimer( parseInt(data.restTime), function (second) {
                $pay.html('去付款' + '(' + _.dateUtil.formatNum(parseInt(second / 60)) + ':' + _.dateUtil.formatNum(second % 60) + '后取消订单)');
            }, function (second) {
                $pay.hide();

                scope.showMessage({
                    content: '规定时间内未付款，请重新接收',
                    okAction: function () {
                        scope.initData();
                        this.hide();
                    }
                });

            });

        },

        renderPage: function (data, flag) {
            var tpl;
            if(flag == 1) {
                data.map = this.map2;

                tpl = layoutHtml1;
            } else  if(flag == 2) {
                data.map = this.map1;
                tpl = layoutHtml2;
            } else {
                data.map = this.map2;
                tpl = layoutHtml3;
            }

            var html = this.renderTpl(tpl, data);
            this.$el.html(html);
            this.viewImgLazyLoad();
            this.countdown(data);

        },

        addEvent: function () {
            this.on('onShow', function () {

                //初始化订单详情数据
                this.initData();

            });

            this.on('onHide', function () {
                if(this.countdownTimer) _.clearCountdownTimer(this.countdownTimer);
            });
        }

    });

});
