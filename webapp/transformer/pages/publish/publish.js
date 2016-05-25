define([
    'BaseView',
    'text!TransPath/publish/tpl.layout.html',
    'text!TransPath/publish/tpl.layout1.html',
    'text!TransPath/publish/tpl.render.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'TransStore',
    'cValidate',

    'TransPath/publish/en.page',

    'TransPath/publish/mod.pics',
    'TransPath/publish/mod.ids',
    'TransPath/publish/mod.doc',
    'TransPath/publish/mod.time',

    'text!TransPath/publish/publish.css'
], function (
    BaseView,
    layoutHtml,
    layoutHtml1,
    renderHtml,
    commonStyle,
    TransModel,
    TransStore,
    cValidate,

    PageEntity,

    PicsModule,
    IdsModule,
    DocModule,
    TimeModule,

    style
) {

    return _.inherit(BaseView, {

        _initEntity: function () {
            this.pageEntity = new PageEntity();
            //页面监控页面数据变化时执行的事件
            this.pageEntity.subscribe(this.onStepChange, this);
        },

        _initModule: function (data) {
            var rxDoc =null;

            if(!data) {
                data = {};
            } else {
                rxDoc = {};
                rxDoc.doctorId = data.toDoctorId;
                rxDoc.hospital = data.rxDoctorHospital;
                rxDoc.name = data.rxDoctorName;
                rxDoc.title = data.rxDoctorTitle;
                rxDoc.phone = data.rxDoctorPhone;
            }

            //图片上传模块
            this.picMod = new PicsModule({
                view: this,
                selector: '.js-pics-wrap'
            });

            //身份证模块
            this.idsMod = new IdsModule({
                view: this,
                selector: '.js-wrapper'
            });

            if(!_.getUrlParam().flag) {

                //医生模块
                this.docMod = new DocModule({
                    view: this,
                    rxDoc: rxDoc,
                    docId: _.getUrlParam().doctorId || this.USERINFO.userId,
                    selector: '.js-to-doctor'
                });
            }

            //时间段模块
            this.timeMod = new TimeModule({
                view: this,
                start: data.treatStartTime * 1000,
                end: data.treatEndTime * 1000,
                selector: '.js-time-action'
            });

        },

        propertys: function ($super) {
            $super();

            var scope = this;

            this.needLogin = true;

            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this._initEntity();

            if(_.getUrlParam().flag) {
                this.template = layoutHtml1;
                this.pageEntity.setNondirectional();
            }

            if(_.getUrlParam().orderId && _.getUrlParam().doctorId) {
                this.pageEntity.setEdit();
                this.needLogin = false;
            }

            this.detailModel = TransModel.DocOrderDetail.getInstance();

            this.events = {
                'blur .js-money': 'moneyChanged',

                'focus .js-name': 'focusAction',
                'blur .js-name': 'blurAction',
                'focus .js-tel': 'focusAction',
                'blur .js-tel': 'blurAction',
                'focus .js-ids': 'focusAction',
                'blur .js-ids': 'blurAction',
                'focus .js-type': 'focusAction',
                'blur .js-type': 'blurAction',
                'focus .js-desc': 'focusAction',
                'blur .js-desc': 'blurAction',
                'focus .js-money': 'focusAction',
                'compositionstart .js-name' : 'lockInput',
                'compositionend .js-name' : 'unlockInput',
                'input .js-name' : 'limtCharActiton'
            };

        },

        focusAction: function () {
            $('.cm-header').css('position', 'static');
        },

        blurAction: function () {
            $('.cm-header').removeAttr('style');
        },

        onStepChange: function () {
            var step = this.pageEntity.getStep();
            window.scrollTo(0, 0);
            this.$('.js-step').hide();
            this.$('.js-step' + step).show();
            this.initHeader();
        },
        lockInput : function (){
          this._nameInpLock = true;
        },
        unlockInput : function() {
          this._nameInpLock = false;
        }, 
        //限制姓名输入长度
        limtCharActiton:function(){
          if (!this._nameInpLock) {
            var val = this.$name.val();
            var nameStr=this.InterCharAction(val, 32);
            if (val !== nameStr) {
              this.$name.val(nameStr);
            }
          }
         },
        //姓名 截取32个字节数
        InterCharAction:function(argStr,count){
           var scope=this;
           var bytesCount=0;
           var subStr="";
          for (var i = 0; i < argStr.length; i++) {
            var c = argStr.charAt(i);
           //匹配双字节 
            if (/^[\u0000-\u00ff]$/.test(c)) 
            {
               bytesCount += 1;
            }
            else
            {
              bytesCount += 2;
            }
            if (bytesCount <= count) {
              subStr+=c;
            } else {
              break;
            }
          }
          return subStr;
	   },
      initHeader: function () {
            var scope = this;
            var step = this.pageEntity.getStep();

            var opts = {
                view: this,
                title: this.pageEntity.getTitle(),
                back: function () {
                    var step = this.pageEntity.getStep();

                    //这块代码要重写
                    if(step == 0) {

                        scope.showConfirm({
                            content: '确认退出发布？',
                            okAction: function () {
                                this.hide();
                                scope.back('index');
                            },
                            cancelAction: function () {
                                this.hide();
                            }
                        });

                        return;
                    }

                    this.pageEntity.setStep(0);
                },
                right: [
                    {
                        tagname: 'next',
                        value: '下一步',
                        callback: function () {
                            scope.headerNextAction();
                        }
                        
                    }
                ]
            };

            this.header.set(opts);
            // this.header.hide();
        },

        //非定向发布逻辑,这里有点硬编码了,需要重构掉
        headerNextAction1: function () {
            var param = this.getPostParam1();

            if(!param) return;

            var money = _.removeAllSpace(this.$money.val());
            if(money.indexOf('元') != -1) {
                money = money.substr(0, money.length - 1);
            }
            money = parseInt(money);
            if(!money) {
                this.showToast('请输入正确转诊费用');
                return false;
            }

            if(money < 1 || money > 999999) {
                this.showToast('转诊费用在1到999999之间');
                return false;
            }

            param.money = money;
            param.showOkBtn = true;

            var _time = this.timeMod.getTimeInfo();

            if(!_time) {
                this.showToast('请选择就诊时段');
                return false;
            }

            param.treatStartTime = parseInt(_time.treatStartTime / 1000);
            param.treatEndTime = parseInt(_time.treatEndTime / 1000);

            this.onPreSuccess(param, _.getUrlParam().doctorId || this.USERINFO.userId, _.getUrlParam().orderId);

        },

        headerNextAction: function () {
            if(_.getUrlParam().flag) {
                this.headerNextAction1();
                return;
            }
            var step = this.pageEntity.getStep();
            var param1 ;
            var scope = this;

            if(step == 0) {
                param1 = this.getPostParam1();
                if(!param1) return;
                this.pageEntity.setStep(1);
                return;
            }

            if(step == 1) {
                param1 = this.getPostParam1();
                if(!param1) return;

                param2 = this.getPostParam2();
                if(!param2) return;

                var data = _.extend(param1, param2);
                data.showOkBtn = true;

                // if(!_.getUrlParam().id) {
                //     this.showToast('订单参数丢失', function () {
                //         scope.back('index');
                //     });
                //
                //     return;
                // }

                this.onPreSuccess(data, _.getUrlParam().doctorId || this.USERINFO.userId, _.getUrlParam().orderId);
            }

        },
        /*跳转到详情页*/
        onPreSuccess: function (data, docId, orderId) {
        	
            var scope = this;
            var _images = data.images;
            var flag = _.getUrlParam().flag;

            data.rxDoctorHospital = data.doctorHospital;
            data.rxDoctorName = data.doctorName;
            data.rxDoctorTitle = data.doctorTitle;
            data.rxDoctorPhone = data.doctorPhone;
            data.orderStatusId = 1;

            this.showLoading();
            this.showPageview('details', {
                propertys: function ($super) {
                    $super();
                    this.needLogin = false;
                    this.flag = 1;
                },
                okAction: function () {
                    var model;
                    if(orderId) {
                        model = TransModel.DocOrderDetail.getInstance();
                        model.urlParam = {'doctorId': docId, 'orderId': orderId };

                    } else {
                        model = TransModel.DocPubOrders.getInstance();
                        model.urlParam = {'doctorId': docId};
                    }
                    var images = _images;
                    var tmp = [];
                    for(var i = 0, len = images.length; i < len; i++) {
                        tmp.push(images[i].fileId);
                    }
                    data.images = tmp;


                    model.errCodeCallback['6000002'] = function (code, msg) {
                        scope.showMessage({
                            content: msg,
                            btns: [
                                { name: '返回首页', className: 'js_ok' }
                            ],
                            okAction: function () {
                                scope.forward('index');
                                this.hide();
                            }
                        });
                    };

                    model.setParam(data);
                    scope.showLoading();
                    model.post(function (data) {

                        var tagStore = TransStore.IndexTagStore.getInstance();
                        tagStore.set(2);

                        scope.forward('index');
                    });
                },
                initData: function () {
                    this.hideLoading();

                    data.treatTime = 0;
                    var tmp = {};
                    for(var k in data) {
                        tmp[k] = data[k]
                    }
                    this.renderPage(tmp, flag || 2);
                }

            });

        },

        initElement: function () {
            this.$name = this.$('.js-name');
            this.$tel = this.$('.js-tel');
            this.$type = this.$('.js-type');
            this.$desc = this.$('.js-desc');
            this.$money = this.$('.js-money');

        },

        moneyChanged: function () {
            this.blurAction();
            var money = _.removeAllSpace(this.$money.val());
            if(money.indexOf('元') != -1) {
                money = money.substr(0, money.length - 1);
            }
            money = parseInt(money);
            if(!money) {
                this.$money.val('');
                return;
            }

            money = money + '元';

            this.$money.val(money);
        },

        getPostParam2: function () {
            var param = {};
            var _doc = this.docMod.getDocInfo();
            var _time;

            if(!_doc) {
                this.showToast('请选择接诊医生');
                return false;
            }

            param.toDoctorId = _doc.doctorId;
            param.doctorHospital = _doc.hospital;
            param.doctorName = _doc.originName;
            param.doctorTitle = _doc.title;
            param.doctorPhone = _doc.phone;

            var money = _.removeAllSpace(this.$money.val());
            if(money.indexOf('元') != -1) {
                money = money.substr(0, money.length - 1);
            }
            money = parseInt(money);
            if(!money) {
                this.showToast('请输入正确转诊费用');
                return false;
            }

            if(money < 1 || money > 999999) {
                this.showToast('转诊费用在1到999999之间');
                return false;
            }

            param.money = money;

            _time = this.timeMod.getTimeInfo();

            if(!_time) {
                this.showToast('请选择就诊时段');
                return false;
            }

            param.treatStartTime = parseInt(_time.treatStartTime / 1000);
            param.treatEndTime = parseInt(_time.treatEndTime / 1000);

            return param;

        },

        getPostParam1: function () {
            var param = {};
            var userInfo;
            var tmp = {}


            param.patientName = _.removeAllSpace(this.$name.val());

            if(param.patientName == '') {
                this.showToast('请输入患者姓名');
                return false;
            }

            param.patientPhone = _.removeAllSpace(this.$tel.val());

            if(!cValidate.isMobile(param.patientPhone)) {
                this.showToast('请输入正确的手机号');
                return false;
            }

            tmp = this.idsMod.getUserInfo();

            if(!tmp) {
                return false;
            }

            param.patientIDNo = tmp.patientIDNo;
            param.patientAge = tmp.patientAge;
            param.patientGender = tmp.patientGender;

            param.symptomsType = this.$type.val();

            if(param.symptomsType == '') {
                this.showToast('请输入病症类型');
                return false;
            }

            if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(param.symptomsType)) {
                this.showToast('请输入正确的病症类型');
                return false;
            }


            param.symptomsDesc = this.$desc.val();

            if(param.symptomsDesc == '') {
                this.showToast('请输入病症说明');
                return false;
            }

            param.images = this.picMod.getPicids();

            return param;

        },

        renderBody: function () {

            //直接发布进入的情况
            if(!_.getUrlParam().orderId) {
                this._initModule();
                return;
            }

            var scope = this;
            var id = _.getUrlParam().orderId;
            var doctorId = _.getUrlParam().doctorId;

            if(!doctorId) doctorId = this.USERINFO.userId;

            if(!id) return;

            this.detailModel.urlParam = {
                doctorId: doctorId,
                // doctorId: 188,
                orderId: id,
            };

            this.showLoading();
            this.detailModel.get(function (data) {
                var html = scope.renderTpl(renderHtml, data );
                scope.$el.html(html);
                scope.initElement();
                scope._initModule(data);
            });

        },

        addEvent: function () {
            this.on('onShow', function () {
                this.renderBody();
                var scope = this;

                // scope.$('.js-step1').show();
                // setTimeout(function () {
                //     scope.$('.js-step1').show();
                // }, 3000)

            });

            this.on('onHide', function () {
            });
        }

    });

});
