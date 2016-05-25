
//百度统计代码
var _hmt = _hmt || [];
(function () {
    var hm = document.createElement("script");
    hm.src = "//hm.baidu.com/hm.js?3ecbace08c1d50e4451d2d1a82706ab8";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();


(function () {

    var project = './';
    var viewRoot = 'pages';
    var templateRoot = 'templates';

    window.GetViewTemplatePath = function (path) {
        return 'text!' + templateRoot + '/' + path + '.html';
    };

    window.GetViewPath = function (path) {
        return viewRoot + '/' + path + '/' + path;
    };
    var version = 201602291722;
    require.config({
        shim: {
            BaiduBox: {
                deps: ['OpenJs'],
                exports: 'clouda'
            }
        },
        urlArgs: 'version=' + version,
        paths: {
            OpenJs: 'http://static1.searchbox.baidu.com/static/searchbox/openjs/aio.js?v=201502',
            BaiduBox: 'http://apps.bdimg.com/blend/loader.js',

            //BUS相关模板根目录
            TrainBookingPath: project + 'pages/booking',
            TrainIndexPath: project + 'pages/index',
            TrainListPath: project + 'pages/list',
            TrainCityPath: project + 'pages/city',
            TrainHomePath: project + 'pages/home',
            TrainPath: project + 'pages',

            //所有样式所处地址
            TrainStylePath: project + 'static/css',

            TrainBusStore: project + 'model/bus.store',
            TrainBusModel: project + 'model/bus.model'
        }
    });


    var isbaidubox = _.getHybridInfo().platform == 'baidubox';
    var modules = ['AbstractApp', 'AbstractStore'];

    //处理header
    if(_.getHybridInfo().platform == 'baidubox' ||  _.getHybridInfo().platform == 'baidumap' || _.getHybridInfo().platform == 'baidu_bus') {
        modules.push('APPUIHeader');
    } else if(_.getHybridInfo().platform == 'nuomi') {
        modules.push('NuomiHeader');
    } else {
        modules.push('UIHeader');
    }

    if (isbaidubox) {
        modules.push('BaiduBox');
    }

    //t为用户期待在该时间后的用户，全部清理缓存再使用
    function initCacheSet(AbstractStore, t) {

        //如果版本更新需要清楚所有缓存便再次设置
        var InitSetStore = _.inherit(AbstractStore, {
            propertys: function ($super) {
                $super();
                this.key = 'Sys_VersionStore';
                this.lifeTime = '100D'; //缓存时间
            }
        });
        var store = InitSetStore.getInstance();

        //如果没有记录则直接清理缓存，如果记录存在，但是版本号比当前小，也需要清理缓存
        //最后需要设置新的版本id
        if (!store.get() || store.get() < t) {
            window.localStorage.clear();
            store.set(t)
        }
    }

    require(modules, function (APP, AbstractStore, UIHeader) {
        var _year = 2016;
        var _month = 1;
        var _day = 21;

        //暂时以当天发布时间戳为版本号，期望更新才改这个数据，否则不做更改
        var t = new Date(_year, _month - 1, _day).getTime();
        initCacheSet(AbstractStore, t);

        window.APP = new APP({
            //开启单页应用
            isOpenWebapp: true,
            UIHeader: UIHeader,

            //配置重构的3个页面 
            viewMapping: {
                index: 'pages/index/index',
                list: 'pages/list/list',
                city: 'pages/city/city',
                about: 'pages/about/about',
                orderlist: 'pages/orderlist/orderlist',
                trainno: 'pages/trainno/trainno',
                home: 'pages/home/home'
            },
            initAppMapping: function () {
                var _k, _name, _item;
                var App_Mapping = {
                    andriod: {
                    },
                    ios: {
                    },
                    baidubus: {
                    },
                    baidubox: {}
                };

            for (_k in App_Mapping) {
                _item = App_Mapping[_k];
                for (_name in _item) {
                    App_Mapping[_k][_name] = _k + '/' + _item[_name];
                }
            }
            this.App_Mapping = App_Mapping;

            //如果处于手白或者地图中，需要去头处理
            if (_.getHybridInfo().platform == 'baidubox' || _.getHybridInfo().platform == 'baidumap' || _.getHybridInfo().platform == 'nuomi' || _.getHybridInfo().platform == 'baidu_bus') {
                setTimeout(function () {
                    $('body').addClass('baidubox');
                }, 20);
            }

        },
        buildUrl: function (path) {

            var viewsign = path;
            var phoneHost = $.os.ios ? 'ios' : 'andriod';
            var hybridInfo = _.getHybridInfo();

            if (hybridInfo.platform == 'baidu_bus') {
                //快行独立app
                if (this.App_Mapping[phoneHost][viewsign]) path = this.App_Mapping[phoneHost][viewsign];

                //若是公共的，以公共为主
                if (this.App_Mapping['baidubus'][viewsign]) path = this.App_Mapping['baidubus'][viewsign];

            } else if (hybridInfo.platform == 'baidubox') {
                //手机百度容器
                if (this.App_Mapping['baidubox'][viewsign]) path = this.App_Mapping['baidubox'][viewsign];

                var appid = '2387396';
                var ak = 'iDVSEkCVfX4GUB1NORMk6LTr';

                if (window.location.host.indexOf('kuai.baidu.com') != -1) {
                    appid = '6417053';
                    ak = 'M0ttcxR0z3EQXGWTPODnoqVy';
                }

                window.bd && bd._qdc && bd._qdc.init({
                    app_id: appid
                });

                //如果是手机百度内部需要加载其框架
                clouda.lightInit({
                    ak: ak,
                    module: ["account", "pay"]
                });
            }

            var mappingPath = this.viewMapping[path] ? this.viewMapping[path] : null;

            if (_.getUrlParam().view) {
                return _.getUrlParam().view;
            }

            return mappingPath ? mappingPath : this.viewRootPath + '/' + path;
        },
        viewRootPath: viewRoot
    });

        
        //糯米渠道
        if(_.getHybridInfo().platform == 'nuomi') {
            var BNJSReady = function (readyCallback) {
                if (readyCallback && typeof readyCallback == 'function') {
                    if (window.BNJS && typeof window.BNJS == 'object' && BNJS._isAllReady) {
                        readyCallback();
                    } else {
                        document.addEventListener('BNJSReady', function () {
                            readyCallback();
                        }, false)
                    }
                }
            };
            BNJSReady(function () {

                window.BNJS.ui.hideLoadingPage();
                window.APP.initApp();

            });
            return;
        }

        window.APP.initApp();

        if (window.Box) {
            window.Box.nativeShare({
                source: 'test',
                theme: 'test',
                // 内容
                content: '过年回家走一“票”--最走心的抢票工具',
                iconUrl: 'http://kuai.baidu.com/webapp/bus/static/images/logo.240.png',
                imageUrl: 'http://kuai.baidu.com/webapp/bus/static/images/logo.240.png',
                // 分享的url
                linkUrl: 'http://kuai.baidu.com/webapp/train/index.html',
                // 分享的面板，一般是all，全面版
                title: '百度快行-春运抢票！'
            });
        }

});

})();


