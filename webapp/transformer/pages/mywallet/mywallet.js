define([
    'BaseView',
    'TransModel',
    'TransStore',
    'text!TransPath/mywallet/tpl.layout.html',
    'text!TransPath/mywallet/tpl.list.item.detail.html',
    'text!TransStylePath/common.css',
    'text!TransPath/mywallet/mywallet.css'
], function (BaseView, TransModel, TransStore, layoutHtml, itemHtml, commonStyle, style) {
    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.needLogin=true;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;
            this.balance = 10;

            this.dealListModel = TransModel.DealListModel.getInstance();
            this.accountModel = TransModel.AccountModel.getInstance();
            this.bankCardModel = TransModel.BankCardModel.getInstance();
            this.bindBankCardFromData = TransStore.BindBankCardFromData.getInstance();

            this.start=0;
            this.more=0;
            this.dealPassKey=[];
            this.events = {
                'click .js-applycash': 'applycash'
            };
        },
        //渲染交易流水列表
        _renderList: function (data) {
            var html = this.renderTpl(itemHtml, {"itemList": data});
            this.$listContainer.append(html);
        },

        //提现
        applycash: function () {
        	// 按钮置灰 禁止点击
        	if (this.$applyCashBtn.hasClass("disabled")) {
                return;
            }

            this.isBindCard();
        },
        // 显示是否绑定提示
        showBindConfirm: function() {
            var scope = this;
            this.showConfirm({
                content: '使用提现功能需添加一张支持提现的储蓄卡',
                btns: [
                    { name: '取消', className: 'js_cancel cm-btns-cancel' },
                    { name: '添加储蓄卡', className: 'js_ok cm-btns-ok' }
                ],
                okAction: function () {
                    scope.bindBankCardFromData.set({name: 'mywallet'});
                    scope.forward("bindcard");
                    this.hide();
                },
                cancelAction: function () {
                    this.hide();
                }
            });
        },
        bindScrollEvent: function () {

            if(this.USERINFO.type == this.AUTHFLAG) return;

            this.unbindScrollEvent();

            $(window).on('scroll.scollload' + this.id, $.proxy(function () {
                //如果正在加载便不可用
                if (this.isLoading||!this.more) return;

                //滑到最低的时候才能刷新
                if (window.scrollY + document.documentElement.clientHeight < document.documentElement.scrollHeight) return;

                this._loadDealList();

            }, this));

        },

        unbindScrollEvent: function () {
            $(window).off('.scollload' + this.id);
        },
        // 是否绑定过银行卡
        isBindCard: function() {
            var scope = this;
            this.bankCardModel.urlParam = {
                doctorId: this.USERINFO.userId
            };

            this.showLoading();

            this.bankCardModel.execute(function(data) {
                if (data.length) {
                    scope.forward("cashtixian");
                } else {
                    scope.showBindConfirm();
                }
            });
        },
        initHeader: function () {
            var opts = {
                view: this,
                title: '我的钱包',
                right: [
                    {
                        tagname: 'banklist',
                        value: '我的银行卡',
                        callback: function () {
                            this.forward('mybankcard');
                        }
                    }
                ],
                back: function(){
                    this.forward('personalcenter');
                }
            };

            this.header.set(opts);
            // this.header.hide();
        },
        //加载交易流水
        _loadDealList: function () {
            var scope = this;
            this.dealListModel.urlParam={'doctorId':this.USERINFO.userId,'start':this.start,'limit':15};
            scope.$loading.show();
            this.isLoading=true;
            this.dealListModel.get(
                function (data) {
                    scope.isLoading=false;
                    if (data && data.list.length > 0) {
                        var newList= _.map(data.list,function(value,index){
                            //如果已经有当月的明显则忽略
                            if(value.type==50){
                                if(!_.contains(scope.dealPassKey,value.insertTimeF)){
                                    scope.dealPassKey.push(value.insertTimeF);
                                    return value;
                                }else{
                                    return {'type':-50};
                                }

                            }else{
                                return value;
                            }
                        });
                        scope._renderList(newList);
                        scope.$loading.hide();
                        scope.start =data.start;
                        scope.more=data.more;
                        if (!data.more) {
                            scope.$loadingEnd.show();
                        }
                    } else {
                        scope.$loading.hide();
                        scope.$noneData.show();
                    }
                }
            );
        },
        initElement: function () {
            this.$balance = $('.js-balance');
            this.$listContainer = $('.deal-list');
            this.$loading = $('.js-loading');
            this.$noneData = $('.js-none-data');
            this.$loadingEnd = $('.js-loading-end');
            this.$applyCashBtn = $('.js-applycash');
        },
        addEvent: function () {
            this.on('onShow', function () {
                var scope=this;
                this.accountModel.urlParam = {
                    'userId': this.USERINFO.userId
                };
                this.showLoading();
                this.accountModel.get(function(data){
                   if(data.balance){
                       scope.$balance.text(data.balance.availableMoney);
                       scope.balance = data.balance.availableMoney;
                       scope.$applyCashBtn.removeClass('disabled');
                   }
                },null,true);
                this._loadDealList();
                this.bindScrollEvent();
            });
            this.on('onHide', function () {
            });
        }
    });
});
