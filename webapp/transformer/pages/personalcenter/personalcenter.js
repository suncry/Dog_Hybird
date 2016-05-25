define([
    'BaseView',
    'TransModel',
    'TransStore',
    'text!TransPath/personalcenter/tpl.layout.html',
    'text!TransStylePath/common.css',

    'text!TransPath/personalcenter/personalcenter.css'
], function (AbstractView, TransModel,TransStore, layoutHtml, commonStyle, style) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            var scope = this;
            this.needLogin =true;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;


            this.accountModel = TransModel.AccountModel.getInstance();
            this.accountStore= TransStore.AccountStore.getInstance();

            this.events = {
                'click .js-to-edit': function () {
                    this.forward('editdata')
                },
                'click .js-topage1': function () {
                    //显示输入支付密码
                    this.forward('paypassword',{"status":"apply",'targetView':'mywallet'});
                    //临时去掉密码验证
//                    this.forward('mywallet')
                },
                'click .js-topage2': function () {
                    // this.jump('http://web.medlinker.net/app/privacy')
                    this.forward('pageview',{'url': encodeURIComponent('http://web.medlinker.com/app/privacy'),'title':'隐私声明'});
                },
                'click .js-topage3': function () {
                    // this.jump('http://www.medlinker.com/app/about')
                    this.forward('pageview',{'url': encodeURIComponent('http://www.medlinker.com/app/about'),'title':'关于医联'});
                }


            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '个人中心',
                back: function () {
                    this.forward('index');
                }
            };

            this.header.set(opts);
            // this.header.hide();
        },

        initElement: function () {

        },

        _onShow:function(){
            var scope=this;
            //拉取用户信息
            this.accountModel.urlParam={'userId':this.USERINFO.userId};
            this.accountModel.type = 'get';
            this.accountModel.get(
                function (data) {
                    //更新dom
                    scope.$('.user-name').text(data.name);
                    scope.$('.user-section').text(data.section);
                    scope.$('.user-title').text(data.title);
                    scope.$('.rec-count').text(data.rxOrderCount);
                    scope.$('.trans-count').text(data.orderCount);
                    scope.$('.user-img>img').attr('src',data.avatar);
//
                },
                function () {
                    scope.showToast('无法获取用户信息');
                },true);
        },
        addEvent: function () {
            this.on('onShow', function () {
                this._onShow();
            });

            this.on('onHide', function () {

            });
        }

    });

});
