(function () {

    var project = './';
    var viewRoot = 'pages';
    var templateRoot = 'templates';

    var version = 201602291722;
    require.config({
        shim: {
            qiniu: {
                deps: ['uploader'],
                exports: 'Qiniu'
            },
            uploader: {
                exports: 'uploader'
            }
        },
        urlArgs: 'version=' + version,
        paths: {

            uploader: project + 'common/plupload.full.min',
            qiniu: project + 'common/qiniu',

            //业务频道基类
            BaseView: project + 'common/base.view',

            TransPath: project + 'pages',

            //所有样式所处地址
            TransStylePath: project + 'static/css',

            TransStore: project + 'model/trans.store',
            TransModel: project + 'model/trans.model',

            //微信sdk
            WXSDK:'http://res.wx.qq.com/open/js/jweixin-1.1.0'
        }
    });

    var modules = ['AbstractApp', 'AbstractStore', 'UIHeader'];

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
        var _month = 4;
        var _day = 19;

        //暂时以当天发布时间戳为版本号，期望更新才改这个数据，否则不做更改
        var t = new Date(_year, _month - 1, _day).getTime();
        initCacheSet(AbstractStore, t);

        window.APP = new APP({
            //开启单页应用
            isOpenWebapp: true,
            UIHeader: UIHeader,
            initAppMapping: function () {
            },
            viewRootPath: viewRoot
        });
        window.APP.initApp();

    });

})();


