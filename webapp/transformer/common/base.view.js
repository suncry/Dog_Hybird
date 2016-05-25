define([
    'AbstractView',
    'TransModel',
    'WXSDK'

], function (AbstractView, TransModel, WX) {

    return _.inherit(AbstractView, {

        propertys: function ($super) {
            $super();

            //该页面是否需要登录鉴权
            this.needLogin = false;

            this.imgLazyLoad = true;

            //登录后会返回用户数据
            this.USERINFO = {};

            this.accountModel = TransModel.AccountModel.getInstance();

            this.wxConfigModel = TransModel.WxConfigModel.getInstance();


            //$.unbindFastClick();
        },

        //当用户重新登录,或者退出登录时,摧毁用户信息
        destoryUserInfo: function () {

        },

        //注入微信sdk
        _wxconfig: function () {

            var scope = this;

            this.wxConfigModel.setParam({
                'type': 'trans',
                'url': location.href.split('#')[0]
            });

            this.wxConfigModel.get(function (data) {

                console.log(data)


                WX.ready(function () {
                    scope._setShare(
                        '医联转诊-救治你身边更多的患者',
                        '医联:致力于打造为医生提供社交化和O2O服务的互联网平台',
                        'http://' + window.location.hostname + '/transform/', 'http://' + window.location.hostname + '/dist/m/common/img/logo@96x96.png',
                        function () {
                    });
                });

                WX.config({
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']

                });

            });

        },
        _setShare: function (title, desc, url, image, callBack) {

            //分享到朋友圈
            WX.onMenuShareTimeline({
                title: title, // 分享标题
                link: url, // 分享链接
                imgUrl: image, // 分享图标
                success: function () {
                    callBack(true);
                },
                cancel: function () {
                    callBack(false);
                }
            });
            //分享给朋友
            WX.onMenuShareAppMessage({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: url, // 分享链接
                imgUrl: image, // 分享图标
                type: "link", // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    callBack(true);
                },
                cancel: function () {
                    callBack(false);
                }
            });
            //分享到qq
            WX.onMenuShareQQ({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: url, // 分享链接
                imgUrl: image, // 分享图标
                success: function () {
                    callBack(true);
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
            //分享到腾讯微博
            WX.onMenuShareWeibo({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: url, // 分享链接
                imgUrl: image, // 分享图标
                success: function () {
                    callBack(true);
                },
                cancel: function () {
                    callBack(false);
                }
            });
            //分享到qq空间
            WX.onMenuShareQZone({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: url, // 分享链接
                imgUrl: image, // 分享图标
                success: function () {
                    callBack(true);
                },
                cancel: function () {
                    callBack(false);
                }
            });
        },

        _show: function (noEvent) {
            if (noEvent) {
                this.status = 'show';
                this.$el.show();
                return;
            }


            this.trigger('onPreShow');
            //      //如果包含就不要乱搞了
            //      if (!$.contains(this.wrapper[0], this.$el[0])) {
            //        //如果需要清空容器的话便清空
            //        if (this.needEmptyWrapper) this.wrapper.html('');
            //        this.wrapper.append(this.$el);
            //      }

            window.scrollTo(0, 0);
            this.$el.show();
            this.status = 'show';

            this.bindEvents();

            // this.initHeader();
            this.trigger('onShow');
            if (_.isWeiXin()) {
                this._wxconfig();
            }
        },

        __setUserInfo: function (callback) {
            this.accountModel.get(function (data) {

                s = '';
                callback && callback();

            });
        },

        show: function (noEvent) {
            var scope = this;
            this.initHeader();

            // this.__setUserInfo();
            // this._show(noEvent);
            //
            // return;

            //如果需要登录得先走登录逻辑校验
            if (this.needLogin) {
                scope.showLoading();
                this.accountModel.urlParam = {'userId': 0};
                this.accountModel.get(function (data) {
                    scope.USERINFO = data;
                    scope.hideLoading();
                    scope._show(noEvent);
                });

            } else {
                this._show(noEvent);
            }

            //做图片延迟加载
            this.viewImgLazyLoad();


        },

        viewImgLazyLoad: function () {
            if (!this.imgLazyLoad) return;

            var imgs = this.$('img');
            var img;
            var dataSrc;
            var src;
            var tmp = {};

            for (var i = 0, len = imgs.length; i < len; i++) {
                img = imgs.eq(i);
                dataSrc = img.attr('data-src');
                src = img.attr('src');
                if (!dataSrc || dataSrc == src) continue;
                this._loadImg(img, dataSrc);
            }

        },

        _loadImg: function (img, dataSrc) {
            $(new Image()).on('load', function () {
                img.attr('src', dataSrc);
            }).attr('src', dataSrc);
        }


    });

});
