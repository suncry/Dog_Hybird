define([
    'AbstractStore',
    'BaseView',
    'text!TransPath/index/tpl.layout.html',
    'text!TransPath/index/tpl.list1.html',
    'text!TransPath/index/tpl.list2.html',
    'text!TransPath/index/tpl.list3.html',
    'AbstractEntity',

    'TransModel',
    'TransStore',

    'text!TransStylePath/common.css',
    'text!TransPath/index/index.css'
], function (
    AbstractStore,
    BaseView,
    layoutHtml,
    listHtml1,
    listHtml2,
    listHtml3,
    AbstractEntity,

    TransModel,
    TransStore,

    commoncss,
    style
) {

    //城市实体
    var CityEntity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();

            this.data = {
                //是否定位结束
                hasGeo: false,
                id: 0,
                name: '全国'
            };
        },

        setGeo: function() {
            this.data.hasGeo = true;
        },

        getGeo: function () {
            return this.data.hasGeo;
        },

        getName: function () {
            return this.data.name;
        },

        getId: function () {
            return this.data.id;
        },

        setCity: function (data) {
            if(!data) return;
            this.data.id = data.id;
            this.data.name = data.name;
            this.update();
        }

    });

    //当前标签实体
    var TabEntity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();

            this.data = {
                index: 2
            };
        },

        setIndex: function (index) {
            this.data.index = index;
            this.update();
        },

        getIndex: function () {
            return this.data.index;
        }

    });


    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var userCityStore;
            var scope = this;

            // this.template = layoutHtml;

            this.commonstyle = commoncss;
            this.needLogin = true;
            this.style = style;

            this.tagStore = TransStore.IndexTagStore.getInstance();

            this.userCityStore = TransStore.UserCityStore.getInstance();
            userCityStore = this.userCityStore.get();

            this.cityEntity = new CityEntity();
            this.cityEntity.subscribe(this.onCityChange, this);

            if(userCityStore) {
                this.cityEntity.initData({
                    hasGeo: true,
                    id: userCityStore.id,
                    name: userCityStore.name
                });
            }

            this.tabEntity = new TabEntity();
            this.tabEntity.subscribe(this.onTabIndexChange, this);

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

            this.authMsg = {
                auth1:  '审核未通过',
                auth2:  '审核通过',
                auth3:  '资格认证审核中，暂时无法接、转诊。',
                auth4:  '未提交审核'
            };

            this.authMsg2 = {
                auth1:  '请先进行资质认证',
                auth3:  '资质审核中，暂无该权限',
                auth4:  '未提交审核'
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
                {'<li class="flex-item " data-tag="pay" >去付款</li>': [2]},
                {'<li class="flex-item " data-tag="reschedule" >患者改期</li>': [3, 4]},
                {'<li class="flex-item " data-tag="accept" >接收转诊</li>': [1]},
                {'<li class="flex-item " data-tag="accepted" >已接收患者</li>': [3, 4]},
                {'<li class="flex-item " data-tag="end" >患者已出院</li>': [7]}
            ];

            //分页参数
            this.page = -1;
            //每页数量
            this.pageNum = 15;

            this.events = {
                'click .js-item': 'itemAction',
                'click .js-switch-list li': 'switchList',
                'click .js-to-item': 'toDetailAction',
                'click .js-click-items li': 'handleItemAction',
                'click .js-topage': 'toHomeAction',
                'click .js-order-items': 'orderItemAction',
                'click .js-user-city': 'cityAction',
                'click .js-auth-btn': 'authAction'
            };

            //判断是否离开页面,如果离开后,地图回调不能执行
            this.leavePage = false;

        },

        authAction: function (e) {

            var el = $(e.currentTarget);
            if(el.hasClass('disabled')) return;

            this.forward('pageview', {
                url: encodeURIComponent( window.location.origin + '/m/join/register-authe?type=authe'),
                title: '资格认证'
            });
        },

        //是否通过认证
        isVerifyStatus: function () {
            if(this.USERINFO.verifyStatus == 2) return true;

            if(this.USERINFO.verifyStatus != 4)
                this.$('.js-auth-text').html(this.authMsg['auth' + this.USERINFO.verifyStatus]);

            if(this.USERINFO.verifyStatus == 3) {
                this.$('.js-auth-btn').addClass('disabled');
                this.$('.js-auth-btn').html('资格认证审核中');
            } else {
                this.$('.js-auth-btn').removeClass('disabled');
                this.$('.js-auth-btn').html('去认证');
            }

            return false;
        },

        cityAction: function () {
            if(!this.isVerifyStatus()) {
                this.showToast(this.authMsg2['auth' + this.USERINFO.verifyStatus] || '');
                return;
            }
            var scope = this;
            // this.unbindScrollEvent();
            this.showPageview('city', {
                onListClick: function (id, name) {
                    scope.back();

                    scope.cityEntity.setGeo();

                    scope.cityEntity.setCity({
                        id: id,
                        name: name
                    });
                }
            });
        },

        onCityChange: function () {
            window.scroll(0, 0);
            this.$city.html(_.mySubstr(this.cityEntity.getName(), 3));
            var scope = this;

            this.userCityStore.set({
                id: this.cityEntity.getId(),
                name: this.cityEntity.getName()
            });

            //如果城市切换,并且当前tab为转诊需求池的话就重新加载数据
            if(this.tabEntity.getIndex() == 1) {
                this.initPageData()
                this.initList();
            }
            this.bindScrollEvent();
            // setTimeout(function () {
            //     scope.tabEntity.setIndex(1);
            // });
        },


        onTabIndexChange: function () {
            var index = this.tabEntity.getIndex();

            var els = this.$('.js-switch-list li');
            els.removeClass('active');
            this.$('.js-switch-list').find('li[data-tag="' + index + '"]').addClass('active');

            this.tagStore.set(index);

            this.initPageData()

            if(index == 1 || index == 2) {
                this.$noneDataText.html('暂无转诊');
            } else {
                this.$noneDataText.html('暂无接诊');
            }

            this.initList();
            this.bindScrollEvent();

        },

        orderItemAction: function (e) {
            var el = $(e.currentTarget);
            var doc = el.attr('data-docid');
            var id = el.attr('data-id');

            this.forward('details', {
                'doctorId': doc,
                'orderId': id,
                'flag': this.tabEntity.getIndex()
            });

        },

        toHomeAction: function () {

            this.forward('personalcenter')
        },

        _getItemData: function (e) {
            var el = $(e.currentTarget);
            el = el.closest('.js-item-root');
            var id = el.attr('data-id');
            var doc = el.attr('data-docid');
            var tel = el.attr('data-tel');
            var time = el.attr('data-time');

            return {
                treatTime: time,
                orderId: id,
                doctorId: doc,
                flag: this.tabEntity.getIndex(),
                tel: tel
            };

        },

        _ItemDomHandle: function (parent, root, data) {
            var str = '';
            var flag = true;
            var item = {};
            var k;
            var index = this.tabEntity.getIndex();
            var map;

            if(index == 2) {
                map = this.map1;
            } else {
                map = this.map2;
            }

            for(var i = 0, len = map.length; i < len; i++) {
                item = map[i];
                for(k in item) {
                    if(_.indexOf(item[k], data.orderStatusId) != -1) {
                        str += k;
                        flag = false;
                    }
                }
            }

            //代表没有项目的意思
            if(flag) {
                parent.hide();
                root.find('.js-status2').html('<div class="item-ft "><span class="js-status2-txt">' + (data.orderStatus.detail || '') + '</span></div>');

            } else {
                parent.show();
                root.find('.js-status2').hide();
            }

            parent.html(str);
            root.find('.js-status').html(data.orderStatus.list || '');
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
                scope._ItemDomHandle(parent, root, data);
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


                this._handleItemAction(e, this.tagModel[tag]);
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

            model.urlParam = {
                doctorId: param.doctorId,
                orderId: param.orderId
            };
            this.showLoading();
            model.get(function (data) {

                var url;
                //只有状态2才会跳转
                if(data.orderStatusId == 2) {
                    scope.forward('rxaccept',{'doctorId':scope.USERINFO.userId,'orderId':data.orderId, 'flag': data.direct === 0 ? 1 : 3});
                    return;
                }

                //状态不对更新状态
                scope.showMessage({
                    content: '该患者已被他人接诊',
                    btns: [
                        { name: '知道了', className: 'js_ok' }
                    ],
                    okAction: function () {
                        scope._handleItem_pay(e, data);
                        this.hide();
                    }

                });
            });
        },

        handleItem_reschedule: function (data) {
            this.forward('docreschedule', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'treatTime': data.treatTime,
                'flag': this.tabEntity.getIndex()
            });
        },

        handleItem_accept: function (data) {
            var scope=this;
            this.acceptOrderModel=TransModel.DocAcceptModel.getInstance();
            this.acceptOrderModel.urlParam = {'doctorId': this.USERINFO.userId, 'orderId': data.orderId};
            this.showLoading();
            this.acceptOrderModel.post(
                function(){
                    scope.forward('rxaccept', {
                        'doctorId': data.doctorId,
                        'orderId': data.orderId,
                        'flag': scope.tabEntity.getIndex()
                    });
                }
            ),function(){
                scope.showToast('操作失败，请重试！');
            };
        },

        handleItem_miss: function (data) {
            this.forward('losepatient', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'flag': this.tabEntity.getIndex()
            });
        },

        handleItem_contact: function (data) {
            window.location.href = 'tel://' + data.tel;
        },

        handleItem_edit: function (data) {
            this.forward('publish', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'flag': this.tabEntity.getIndex()
            });
        },

        toDetailAction: function (e) {

            var target = $(e.target);

            if(target.attr('href')) {
                return;
            }

            var data = this._getItemData(e);

            this.forward('details', {
                'doctorId': data.doctorId,
                'orderId': data.orderId,
                'flag': data.flag
            });
        },

        itemAction: function (e) {
            var el = $(e.currentTarget);
            el = el.parent();

            var flag = el.hasClass('active');
            this.$('.js-item').parent().removeClass('active');

            if(!flag) {
                el.addClass('active');
            }

            //将当前点击元素显示出来
            this.setELDisplay(el);

        },

        setELDisplay: function (el) {
            if(!el[0]) return;

            var wh = $(window).height();
            var h = el.height();
            var sTop = window.scrollY;
            var offsetTop = 0;

            offsetTop = el[0].offsetTop;

            if(offsetTop + h > wh + sTop) {
                window.scrollTo(0, sTop + (offsetTop + h) - (wh + sTop));
            }


        },

        switchList: function (e) {
            var el = $(e.currentTarget);
            var tag = el.attr('data-tag');

            this.tabEntity.setIndex(tag);

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '医联转诊',
                right: [
                    {
                        tagname: 'add',
                        value: '发布',
                        callback: function () {

                            if(!this.isVerifyStatus()) {
                                this.showToast(this.authMsg2['auth' + this.USERINFO.verifyStatus] || '');

                                return;
                            }

                            if(!this.USERINFO.isDirectional) {
                                this.forward('publish', {
                                    flag: 1
                                });
                            } else {
                                this.forward('publish');
                            }
                        }
                    }
                ]
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {

        },


        initPageData: function () {
            //如果需要认证则不执行后续操作
            if(!this.isVerifyStatus()) return;

            var _flag;

            this.page = -1;
            this.$authWrapper.hide()
            this.$noneData.hide();
            this.$loading.hide();
            this.$loadingEnd.hide();
            this.$listWrapper.html('');
            this.isLoading = false;

        },

        initElementAfterShow: function () {
            this.$listWrapper = this.$('.js-list-wrapper');
            this.$noneData = this.$('.js-none-data');
            this.$noneDataText = this.$('.js-icon-text');

            this.$loading = this.$('.js-loading');
            this.$loadingEnd = this.$('.js-loading-end');
            this.$authWrapper = this.$('.js-auth-wrapper');
            this.$city = this.$('.js-user-city');

        },

        initList: function () {

            if(!this.isVerifyStatus()) {
                this.$authWrapper.show();
                return;
            }

            var tabIndex = this.tabEntity.getIndex();
            var scope = this;
            var _tpl;
            var model;
            var map = {};


            if(tabIndex == 1) {
                _tpl = listHtml1;
                model = TransModel.OrderPoolModel.getInstance();
                model.setParam({
                    areaId: this.cityEntity.getId()
                });

            } else if(tabIndex == 2) {

                _tpl = listHtml2;

                model = TransModel.DocPubOrders.getInstance();
                map = this.map1;
            } else if(tabIndex == 3) {

                _tpl = listHtml3;

                model = TransModel.MyJiezhengListModel.getInstance();
                map = this.map2;
            }

            this.page++;

            model.urlParam = {
                doctorId: this.USERINFO.userId
            };

            model.setParam('start', this.page * this.pageNum);
            model.setParam('limit', this.pageNum);

            this.$loading.show();

            this.isLoading = true;
            this.showLoading();

            model.get(function (data) {
                scope.isLoading = false;

                scope.$loading.hide();

                if(data.list.length == 0 && scope.page === 0) {
                    scope.$noneData.show();
                    return;
                }

                if(data.more === 0 ){
                    scope.$loadingEnd.show();
                    scope.unbindScrollEvent();
                }

                data.map = map;

                //首次做覆盖
                scope.$listWrapper.append(scope.renderTpl(_tpl, data));

                scope.initGeoData();

            });

        },

        initLayoutData: function () {
            var userData = this.USERINFO;
            var scope = this;

            userData.tabIndex = this.tabEntity.getIndex();
            userData.cityName = this.cityEntity.getName();

            // console.log(userData);
            scope.$el.html(scope.renderTpl(layoutHtml, userData));
            scope.viewImgLazyLoad();

            //渲染后重新绑定元素
            this.initElementAfterShow();

            // 初始化页面数据
            this.initPageData();

            // 开始加载列表数据
            this.initList();

        },

        bindScrollEvent: function () {

            if(!this.isVerifyStatus()) return;

            this.unbindScrollEvent();

            $(window).on('scroll.scollload' + this.id, $.proxy(function () {
                //如果正在加载便不可用
                if (this.isLoading) return;

                //滑到最低的时候才能刷新
                if (window.scrollY + document.documentElement.clientHeight < document.documentElement.scrollHeight - 50) return;

                this.initList();

            }, this));

        },

        unbindScrollEvent: function () {
            $(window).off('.scollload' + this.id);
        },

        //百度地图接口
        getCityInfo: function (longitude, latitude) {
            var model = TransModel.GeoAreaModel.getInstance();
            var scope = this;
            model.setParam({
                lng: longitude,
                lat: latitude,
                'scope': 'city'
            });

            this.showLoading();
            model.get(function (data) {
                scope.cityEntity.setGeo();
                scope.cityEntity.setCity({
                    id: data.areaId,
                    name: data.name
                })
            });

        },

        onErrorGetGeoData: function () {
            var scope = this;

            if(this.leavePage) return;

            this.showConfirm({
                content:'您已拒绝开启定位,请手动选择城市',
                btns: [
                    { name: '选择城市', className: 'js_ok cm-btns-ok' },
                    { name: '取消', className: 'js_cancel cm-btns-cancel' },
                ],
                okAction: function () {
                    var that = this;
                    setTimeout(function () {
                        scope.cityAction();
                        that.hide();
                    }, 20);

                },
                cancelAction: function () {

                    scope.cityEntity.setCity({
                        id: 0,
                        name: '全国'
                    });
                    scope.cityEntity.setGeo();
                    this.hide();
                }
            });

        },

        initGeoData: function () {

            //如果是非定向变不执行相关逻辑
            if(this.USERINFO.isDirectional) return;
            //如果已经定位结束,也不执行相关逻辑
            if(this.cityEntity.getGeo()) return;

            var scope = this;
            navigator.geolocation.getCurrentPosition(function (data) {
                scope.getCityInfo(data.coords.longitude, data.coords.latitude)

            }, function (data) {
                scope.onErrorGetGeoData();
                return;

                switch (data.code) {
                    case 0:
                        scope.showMessage('尝试获取您的位置信息时发生错误：' + error.message);
                        break;
                    case 1:
                        scope.onErrorGetGeoData();
                        break;
                    case 2:
                        scope.showMessage('浏览器无法获取您的位置信息。');
                        break;
                    case 3:
                        scope.showMessage('获取您位置信息超时。');
                        break;
                }

            });
        },

        initTagInfo: function () {
            var tagIndex = 2;
            var tagStore = this.tagStore.get();

            if(tagStore) {
                tagIndex = tagStore;
            } else {
                if(this.USERINFO.isDirectional) {
                    tagIndex = 2;
                } else {
                    tagIndex = 1;
                }
            }

            this.tabEntity.initData({
                index: tagIndex
            });
        },



        addEvent: function () {

            this.on('onPreShow', function () {
                if(this.USERINFO.verifyStatus && this.USERINFO.verifyStatus != 2) {
                    AbstractStore.clearData();
                }
            });

            this.on('onShow', function () {
                this.setViewportSize();
                this.initTagInfo();
                this.initLayoutData();
                this.bindScrollEvent();

            });

            this.on('onHide', function () {
                this.unbindScrollEvent();
                this.leavePage = true;
            });
        }

    });

});
