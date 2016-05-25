
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
    var hybridInfo = _.getHybridInfo();


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


    var isHybrid = hybridInfo.platform == 'hybrid';
    var modules = ['AbstractApp', 'AbstractStore'];

    if (isHybrid) {
        modules.push('HybridHeader');
    } else {
        modules.push('UIHeader');
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
                    andriod: {},
                    ios: {},
                    baidubus: {},
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
                if (isHybrid) {
                    setTimeout(function () {
                        $('body').addClass('baidubox');
                    }, 20);
                }

            },

            viewRootPath: viewRoot
        });

        window.APP.initApp();


    });

})();


