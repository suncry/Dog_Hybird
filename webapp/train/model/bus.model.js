define(['AbstractModel', 'TrainBusStore', 'cUser'], function (AbstractModel, BusStore, cUser) {

    var ERROR_CODE = {
        'NOT_LOGIN': '20001'
    };

    //获取产品来源
    var getUs = function () {
        var us = 'webapp';
        var hybridMap = {
            'baidubox': 'mobilebd',
            'baidumap': 'map',
            'baidu_bus': $.os.iphone ? 'ios' : 'android'
        };

        //如果处于Hybrid中，则读出相关版本
        if (_.getHybridInfo().platform && hybridMap[_.getHybridInfo().platform]) {
            us = hybridMap[_.getHybridInfo().platform];
        }

        //如果url具有us标志，则首先读取
        if (_.getUrlParam().us) {
            us = _.getUrlParam().us;
        }

        return us;
    };

    var SIGN_STR = 'bdbus&luzhandui2015~Y~';

    var BaseModel = _.inherit(AbstractModel, {

        initDomain: function () {
            var host = window.location.host;

            //      this.domain = 'nj03-bus-app00.nj03.baidu.com:8912';

            this.domain = host;
                this.domain = 'api.kuai.baidu.com';

        },

        propertys: function ($super) {
            $super();

            this.initDomain();

            var t = (new Date().getTime()).toString();
            this.path = '';
            //      this.path = '/cserver';

            this.ajaxOnly = false;
            this.cacheData = null;
            this.param = {
                head: {
                    us: getUs(),
                    version: '2.2.0',
                    ct: 3,
                    time: t.substr(0, t.length - 3),
                    sign: null
                }
            };
            this.dataType = 'jsonp';

            this.errorCallback = function () { };

            //统一处理分返回验证
            this.pushValidates(function (data) {
                return this.baseDataValidate(data);
            });

        },

        //首轮处理返回数据，检查错误码做统一验证处理
        baseDataValidate: function (data) {
            //记录请求返回
            _hmt.push(['_trackPageview', '/api' + this.url + '/response/' + new Date().getTime()]);
            if (!data) {
                window.APP.showToast('服务器出错，请稍候再试', function () {
                    window.location.href = 'http://kuai.baidu.com/webapp/bus/index.html';
                });
                return;
            }

            if (_.isString(data)) data = JSON.parse(data);
            if (data.errno === 0) return true;

            //处理统一登录逻辑
            if (data.errno == ERROR_CODE['NOT_LOGIN']) {
                cUser.login();
                return false;
            }

            //班次不存在的情况，这个代码应该移除
            //            if (data.errno == 30002) {
            //                this.errorCallback();
            //                return false;
            //            }

            if (window.APP && data && data.msg) window.APP.showToast(data.msg, this.errorCallback);

            return false;
        },

        dataformat: function (data) {
            if (_.isString(data)) data = JSON.parse(data);
            if (data.data) return data.data;
            return data;
        },

        buildurl: function () {
            return this.protocol + '://' + this.domain + this.path + (typeof this.url === 'function' ? this.url() : this.url);
        },

        getSign: function () {
            var param = _.extend({}, this.getParam() || {});
            if (param.head) delete param.head;
            return JSON.stringify(param);
        },

        onDataSuccess: function (fdata, data) {
            if (this.cacheData && this.cacheData.set)
                this.cacheData.set(fdata, this.getSign());
        },


        //重写父类getParam方法，加入方法签名
        getParam: function () {
            var param = _.clone(this.param || {});
            var k, i, len, signArr = [], signStr = '';
            if (!param.head) return this.param;

            for (k in param) {
                if (k == 'head') continue;
                signArr.push({ key: k, value: param[k] });
            }
            signArr = _.sortBy(signArr, 'key');

            for (i = 0, len = signArr.length; i < len; i++) {
                if (typeof signArr[i].value == 'object') {
                    signStr += encodeURIComponent(signArr[i].key) + '=' + encodeURIComponent(JSON.stringify(signArr[i].value)).replace(/%20/g, '+');
                } else {
                    signStr += encodeURIComponent(signArr[i].key) + '=' + encodeURIComponent(signArr[i].value).replace(/%20/g, '+');
                }
            }
            //特殊标志'的处理
            if (signStr.indexOf(".")) signStr = signStr.replace(/'/g, '%27');
            this.param.head.sign = _.getMD5String(signStr + SIGN_STR);

            if (_.getUrlParam().us == 'wap_sem' && _.getUrlParam().hmkw) {
                this.param.head.extra = _.getUrlParam().hmkw;
            }

            this.param = param;
            return this.param;
        },

        execute: function ($super, onComplete, onError, ajaxOnly, scope) {
            var data = null;
            if (!ajaxOnly && !this.ajaxOnly && this.cacheData && this.cacheData.get) {
                data = this.cacheData.get(this.getSign());
                if (data) {
                    onComplete(data);
                    return;
                }
            }

            //记录请求发出
            _hmt.push(['_trackPageview', '/api' + this.url + '/request/' + new Date().getTime()]);
            $super(onComplete, onError, ajaxOnly, scope);
        }

    });


    return {

        InitAppModel: _.inherit(BaseModel, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.url = '/user/initapp';
                this.ajaxOnly = true;
            }
        }),

        //城市列表
        CityModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                //                this.domain = 'dev047.baidu.com:8811';
                this.cacheData = BusStore.CityStore.getInstance();
                this.url = '/train/city';
                this.path = '/cserver';
            }
        }),

        //火车票班次列表
        ListModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                //                this.domain = 'dev047.baidu.com:8811';
                //                this.cacheData = BusStore.ListStore.getInstance();
                this.url = '/train/search';
                this.path = '/cserver';
            }
        }),

        UserInfoModel: _.inherit(BaseModel, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.url = '/user/login';
                this.type = 'POST';

            }
        }),

        //火车票预售期
        PreSaleModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                //                this.domain = 'dev047.baidu.com:8811';
                this.cacheData = BusStore.PreSaleStore.getInstance();
                this.url = '/train/presaleperiod';
                this.path = '/cserver';
            }
        }),

        //订单列表
        OrderListModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/train/orderlist';
                this.path = '/cserver';
            }
        }),

        //订单列表
        TrainNoModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/train/trainno';
                this.path = '/cserver';
            }
        })

    };
});
