define(['AbstractModel', 'AbstractStore', 'cUser', 'TransStore'], function (AbstractModel, AbstractStore, cUser, TransStore) {

    var ERROR_CODE = {
        'NOT_LOGIN': '3',
        'NO_USER': '6000020'
    };

    //获取产品来源
    var getUs = function () {
        var us = 'webapp';

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

            this.domain = host;

            // QA环境
            if (host.indexOf('cp01-tuangou-qa01.cp01.baidu.com') !== -1) {
                this.domain = 'cp01-tuangou-qa01.cp01.baidu.com:8123';
            }
            //正式环境
            if (host.indexOf('kuai.baidu.com') != -1 || host.indexOf('bus.baidu.com') != -1) {
                this.domain = 'api.kuai.baidu.com';
            }

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
                // head: {
                //     us: getUs(),
                //     version: '2.2.0',
                //     ct: 3,
                //     time: t.substr(0, t.length - 3),
                //     sign: null
                // }
            };
            this.dataType = 'json';

            this.shoulClear = false;

            this.errorCallback = function () {

            };

            //特殊错误码处理程序
            this.errCodeCallback = {};

            //统一处理分返回验证
            this.pushValidates(function (data) {
                return this.baseDataValidate(data);
            });

        },

        //首轮处理返回数据，检查错误码做统一验证处理
        baseDataValidate: function (data) {
            window.APP.hideLoading();

            //记录请求返回
            if (!data) {
                window.APP.showToast('服务器出错，请稍候再试');
                return;
            }

            if (_.isString(data)) data = JSON.parse(data);
            if (data.errcode === 0) return true;

            //处理统一登录逻辑
            if (data.errcode == ERROR_CODE['NOT_LOGIN']) {
                // cUser.login();

                return;

                window.APP.showToast(data.errmsg, function () {
                    window.APP.showLoading();
                    window.location.href=window.location.protocol+'//'+window.location.host+'/transform/';
//                    APP.forward('login', {

//                    });
                });

                return false;
            }

            //用户不存在情况
            if( data.errcode == ERROR_CODE['NO_USER']) {
                APP.forward('login');
                return false;
            }


            if(this.errCodeCallback[data.errcode]) {
                this.errCodeCallback[data.errcode](data.errcode, data.errmsg, data);
                return false;
            }

            if (window.APP && data && data.errmsg) window.APP.showToast(data.errmsg, this.errorCallback);

            return false;
        },

        dataformat: function (data) {
            if (_.isString(data)) data = JSON.parse(data);
            if (data.data) return data.data;
            return data;
        },

        buildurl: function () {
            var url = this.url;
            var scope = this;
            var reg = /\{([\s\S]+?)\}|$/g;
            var _url = '';
            var index = 0;

            url.replace(reg, function (key, name, offset) {

                _url += url.slice(index, offset)
                if(name) {
                    _url += scope.urlParam[name];
                }
                index = offset + key.length;
                return key;
            });

            return this.protocol + '://' + this.domain + this.path + _url;
        },

        getSign: function () {
            var param = _.extend({}, this.getParam() || {});
            if (param.head) delete param.head;
            return JSON.stringify(param);
        },

        onDataSuccess: function (fdata, data) {
            //暂时只存储get请求数据
            if (this.cacheData && this.cacheData.set && this.type.toLowerCase() == 'get') {
                var key = this.cacheData.key;
                var tmp;
                var listKey = this.cacheData.listKey;

                if(listKey) {
                    tmp = this.urlParam[listKey]
                    if(tmp === undefined)
                        tmp = this.param[listKey]
                    if(tmp !== undefined)
                        key = key + '_' + tmp;
                }

                this.cacheData.key = key;
                this.cacheData.set(fdata, this.getSign());

            }
        },


        //重写父类getParam方法，加入方法签名
        getParam: function () {
            var param = _.clone(this.param || {});
            // var k, i, len, signArr = [], signStr = '';
            // if (!param.head) return this.param;

            // for (k in param) {
            //     if (k == 'head') continue;
            //     signArr.push({ key: k, value: param[k] });
            // }
            // signArr = _.sortBy(signArr, 'key');
            //
            // for (i = 0, len = signArr.length; i < len; i++) {
            //     if (typeof signArr[i].value == 'object') {
            //         signStr += encodeURIComponent(signArr[i].key) + '=' + encodeURIComponent(JSON.stringify(signArr[i].value)).replace(/%20/g, '+');
            //     } else {
            //         signStr += encodeURIComponent(signArr[i].key) + '=' + encodeURIComponent(signArr[i].value).replace(/%20/g, '+');
            //     }
            // }

            //特殊标志'的处理
            // if (signStr.indexOf(".")) signStr = signStr.replace(/'/g, '%27');
            // this.param.head.sign = _.getMD5String(signStr + SIGN_STR);

            if (param.head) delete param.head;

            this.param = param;
            return this.param;
        },

        //当执行登录,登出,编辑用户资料等数据请求时,需要清理一些用户相关或者敏感数据
        //@override
        clearBusinessData: function () {
            //如果非业务数据,则不需要关注
            if(!(this.shoulClear && this.type.toLowerCase() == 'post')) return;

            AbstractStore.clearData();

            var s = '';
        },

        execute: function ($super, onComplete, onError, ajaxOnly, scope) {

            this.clearBusinessData();

            var data = null;
            if (!ajaxOnly && !this.ajaxOnly && this.cacheData && this.cacheData.get) {

                var key = this.cacheData.key;
                var listKey = this.cacheData.listKey;

                //暂时只存储get请求数据
                if(listKey) {
                    tmp = this.urlParam[listKey]
                    if(tmp === undefined)
                        tmp = this.param[listKey]
                    if(tmp !== undefined)
                        key = key + '_' + tmp;
                }

                this.cacheData.key = key;

                data = this.cacheData.get(this.getSign());
                if (data) {
                    window.APP.hideLoading();
                    onComplete(data);
                    return;
                }
            }

            $super(onComplete, onError, ajaxOnly, scope);
        }

    });


    return {

        UserInfoModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/user-info';
                this.cacheData = TransStore.UserStore.getInstance();
            }
        }),

        SmsCodeModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                 this.url = '/transform/login/sms-code';

            }
        }),

        LoginModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/login';
                this.shoulClear = true;
            }
        }),

        LogoutModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/logout';
            }
        }),
        /*赴诊通知*/
        AcceptnoticeModel:_.inherit(BaseModel,{
            propertys:function($super){
                $super();
                this.url='/transform/treat-notices/{id}';
            }
        }),
        /*同意赴诊*/
        AgreenodticeModel:_.inherit(BaseModel,{
            propertys:function($super){
                $super();
                this.type = 'POST';
                this.url="/transform/treat-notices/{id}/accept"
            }

        }),

        /*拒绝赴诊*/
        refusenodticeModel:_.inherit(BaseModel,{
            propertys:function($super){
                $super();
                this.type = 'POST';
                this.url="/transform/treat-notices/{id}/reject"
            }
        }),
        QiniuModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/token/qiniu';
            }
        }),

        //用户信息相关
        AccountModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/accounts/{userId}';
                this.cacheData = TransStore.AccountStore.getInstance();
                this.shoulClear = true;

            }
        }),

        //发布转诊 我的转诊
        DocPubOrders: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/doctors/{doctorId}/trans-orders';
            }
        }),

        //我的接诊
        MyJiezhengListModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders';
            }
        }),

        //转诊医生列表
        DoctorListModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/doctors/{doctorId}/rx-doctors';
            }
        }),

        //患者爽约
        LosepatientModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}/miss';
            }
        }),

        //发布转诊,转诊详情
        DocOrderDetail: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/doctors/{doctorId}/trans-orders/{orderId}';
            }
        }),

        //接诊医生,看到的转诊详情
        RxOrderDetail: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}';
            }
        }),

        //随访确认
        DocSuifangquerenModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/doctors/{doctorId}/trans-orders/{orderId}/follow-up';
                this.type = 'POST';
            }
        }),

        //关闭转诊单
        DocCloseModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/doctors/{doctorId}/trans-orders/{orderId}/close';
                this.type = 'POST';
            }
        }),

        //开启转诊单
        DocOpenModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/doctors/{doctorId}/trans-orders/{orderId}/open';
                this.type = 'POST';
            }
        }),

        //我的接诊 - (待)接诊单详情
        DocDetailModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}';
                this.type = 'GET';
            }
        }),

        //确认接收
        DocAcceptModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}/accept';
                this.type = 'POST';
            }
        }),

        //接收患者
        DocAcceptPatientModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}/receive-patient';
                this.type = 'POST';
            }
        }),

        //患者出院
        DocEndModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}/treat-finish';
                this.type = 'POST';
            }
        }),


        TitleModel: _.inherit(BaseModel, {
            propertys:function($super){
                $super();
                this.url = '/register/titles';
                this.cacheData = TransStore.TitleStore.getInstance();
            },
            dataformat:function(data){
                return data.data.titleList;
            }
        }),
        SectionListModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.url = '/register/sections';
                this.cacheData = TransStore.SectionListStore.getInstance();
            },
            dataformat: function (data) {
                var mainSection = [];
                var subSection = {};
                _.each(data.data.sectionList, function (val, key, list) {
                    mainSection.push({name: val.name, id: val.id});
                    subSection[val.id] = [];
                    if (val.childList) {
                        _.each(val.childList, function (subVal) {
                            subSection[val.id].push({name: subVal.name, id: subVal.id});
                        })
                    }
                });
                return {'mainSectionData': mainSection, 'subSectionData': subSection};
            }
        }),

        // 患者拒绝赴诊
        RefusedModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/treat-notices/{id}/reject';
            }
        }),

        // 赴诊通知
        TreatNoticesModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'GET';
                this.url = '/transform/treat-notices/{id}';
            }
        }),

        // 银行卡号验证
        BankCardCheckModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/accounts/{doctorId}/bankcards/{cardNo}/check';
            }
        }),

        // 添加银行卡的发送验证码
        GetSmsAddCardModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/accounts/{doctorId}/bankcards/sms';
            }
        }),

        // 添加银行卡
        BankCardAddModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/accounts/{doctorId}/bankcards';
            }
        }),


        //患者改期提交数据
        PostponeModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/rx-doctors/{doctorId}/trans-orders/{orderId}/treat-time';
            }
        }),

        // 评价医生
        EvaluateDoctorModel: _.inherit(BaseModel, {
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url = '/transform/treat-notices/{id}/evaluations'
            }
        }),
        //我的钱包-交易流水
        DealListModel: _.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/transform/accounts/{doctorId}/deals?start={start}&limit={limit}';
            }
        }),
        //我的银行卡列表
        CardListModel: _.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/transform/accounts/{doctorId}/bankcards';
            }
        }),
        //验证支付密码
        VerifyPaypasswordModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url='/transform/accounts/{doctorId}/pay-passwd/verify';
            }
        }),
        //设置支付密码
        SetPaypasswordModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.shoulClear=true;
                this.type = 'POST';
                this.url='/transform/accounts/{doctorId}/pay-passwd';
            }
        }),
        //提现申请
        CashApplyModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.shoulClear=true;
                this.url='/transform/accounts/{doctorId}/bankcards/{bankCardId}/cash';
            }
        }),


        // 我的银行卡
        BankCardModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/transform/accounts/{doctorId}/bankcards';
            }
        }),
        // 解绑银行卡
        UnbindCardModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url='/transform/accounts/{doctorId}/bankcards/{bankCardId}/delete';
            }
        }),
        // 修改支付密码的验证码
        ModifyPayPasswdSms:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url='/transform/accounts/{doctorId}/pay-passwd/sms';
            }
        }),

        //需求池
        OrderPoolModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/transform/order-pool';
            }
        }),

        //需求池详情
        OrderPoolDetailModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/transform/order-pool/{orderId}';
            }
        }),

        //区域数据
        CityModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/area/{id}';
                this.cacheData = TransStore.CityStore.getInstance();

            }
        }),

        //城市列表
        City1Model:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/transform/order-pool/areas';

            }
        }),

        //根据经纬度获取区域
        GeoAreaModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/location/area';
                this.cacheData = TransStore.GeoAreaStore.getInstance();

            }
        }),
        WxConfigModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.url='/wx/config-data';
            }
        }),

        // 校验验证码
        VerifySmsModel:_.inherit(BaseModel,{
            propertys: function ($super) {
                $super();
                this.type = 'POST';
                this.url='/transform/accounts/{doctorId}/pay-passwd/sms/verify';
            }
        })

    };
});
