define([
    'BaseView',
    'TransModel',
    'text!TransPath/acceptnotice/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/acceptnotice/acceptnotice.css'
], function (BaseView, TransModel, layoutHtml, commonStyle, style) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();
            this.needLogin = false;
            var scope = this;
            //this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this.acceptnoticeModel = TransModel.AcceptnoticeModel.getInstance();
            this.agreenodticeModel = TransModel.AgreenodticeModel.getInstance();
            this.refusenodticeModel = TransModel.RefusedModel.getInstance();
            this.events = {
                'click .js-refusedoctor': 'refuseAction',
                'click .js-tel': 'callAction',
                'click .js-evaluate': 'evaluateAction',
                'click .js-agreedoctor': 'agreeAction',
                'click .js-getmap':'getMapAction'
                
            };
        },
        refuseAction: function () {
            this.forward("refusedoctor", {
                id: this.id
            });
        },
        callAction: function () {
            window.location.href = 'tel://' + this.data.cellphone;
        },
        agreeAction: function () {
            var scope = this;
            this.showConfirm({
                content: '确认同意赴诊',
                okAction: function () {
                    scope.agreenDoc(function () {
                        scope.hideConfirm();

                    });

                },
                cancelAction: function () {
                    this.hide();
                }
            });
        },
        getMapAction:function(){
             var Lat=this.data.hospitalLat;
             var lng=this.data.hospitalLng;
             var address=encodeURIComponent(this.data.hospitalAddress);
             var hospital=encodeURIComponent(this.data.hospital);
             window.location.href=encodeURI('http://'+window.location.hostname+'/webapp/transformer/map.html?hospitalLat=' +Lat+ '&hospitalLng=' +lng+ '&hospitalAddress=' +address+ '&hospital=' +hospital);

        },
        initHeader: function () {
            var opts = {
                view: this,
                title: '赴诊通知',
                back: false
            };

            this.header.set(opts);
        },


        initElement: function () {
            this.$statusbar = this.$(".status-bar");
        },
        initData: function () {
            var scope = this;
            var doctorId = _.getUrlParam().docId;
            if (!doctorId) doctorId = this.USERINFO.userId;
            scope.id = _.getUrlParam().id;
            if (!scope.id) {
                this.showToast('网页参数丢失,请返回首页');
                return;
            }
            this.acceptnoticeModel.urlParam = {
                id: scope.id
            };
            this.showLoading();
            this.acceptnoticeModel.execute(function (data) {
                var html = scope.renderTpl(layoutHtml, data);
                scope.data = data;
                scope.$el.html(html);
                if((data.orderStatusId==8 || data.orderStatusId==9 ||data.orderStatusId==10) && data.evaluated === false){
                    scope.forward("evaluatedoctor", {
                        id: scope.id
                    })
                }else if(data.orderStatusId==10){
                    scope.forward('evaluationback');
                }
            });
        },
        agreenDoc: function (callback) {
            var scope = this;
            this.agreenodticeModel.urlParam = {
                id: scope.id
            }
            this.agreenodticeModel.execute(function () {
            	var date = new Date();
	            date.setTime(scope.data.treatTime  * 1000);
	            var _date = _.dateUtil.format(date, 'Y.M.D H:F');
	            scope.$el.find(".toolbar-wrap").hide();
                scope.$el.find(".orderStatus-msg").empty().html("<div class='item-ft'><span>已同意,请你 "+_date+" 赴诊</span></div>");
            });
            callback();
        },
        addEvent: function () {
            this.on('onShow', function () {
                /*初始化数据*/
                this.initData();
            });

            this.on('onHide', function () {
            });
        }

    });

});
