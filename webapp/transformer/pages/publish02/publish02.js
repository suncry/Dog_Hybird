define([
    'BaseView',
    'text!TransPath/publish02/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',

    'UIRadioList',
    'UIGroupSelect',

    'text!TransPath/publish02/publish02.css'
], function (
    BaseView,
    layoutHtml,
    commonStyle,

    TransModel,
    UIRadioList,
    UIGroupSelect,

    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();
            this.needLogin = true;

            this.docListModel = TransModel.DoctorListModel.getInstance();

            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this.events = {
                'click .js-to-doctor': 'openDocAction',
                'click .js-time-action': 'openTime'
            };

            this.docData = null;

        },


        _getDisabledData: function (key, data) {

            for(var i = 0, len = data.length; i < len; i++) {
                if(data[i].id < key) {
                    //不可用
                    data[i].disabled = false;
                } else {
                    //可用
                    data[i].disabled = true;

                }

            }

            return data;
        },

        openTime: function () {
            var scope = this;
            var data1 = [];
            var data2 = [];
            var item = {};
            var time;
            var d = new Date();
            var date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            time = date.getTime();

            data1.push({
                name: '今天',
                id: time
            });
            data2.push({
                name: '今天',
                id: time
            });

            //生成时段数据
            for(var i = 0; i < 60; i++) {
                date.setTime(time + 86400000 * (i + 1));
                data1.push({
                    name: _.dateUtil.format(date, 'Y-M-D'),
                    id: date.getTime()
                });
                data2.push({
                    name: _.dateUtil.format(date, 'Y-M-D'),
                    id: date.getTime()
                });
            }

            if(!this.uiTime) {

                this.uiTime = new UIGroupSelect({
                    isDownIn: true,

                    onOkAction: function (items) {
                        var key1 = items[0].id;
                        var key2 = items[1].id;
                        scope.$time.html(items[0].name + ' - ' + items[1].name);
                        scope.$time.attr('data-s', key1);
                        scope.$time.attr('data-e', key2);
                        this.hide();
                    },

                    data: [
                        data1, data2
                    ],
                    changedArr: [
                        function (item) {
                            var data = scope._getDisabledData(item.id, data2);
                            this.scrollArr[1].reload({data: data});
                        },
                        function (item) {
                            
                        }
                    ]

                });
            }

            this.uiTime.show();


        },

        openDocAction: function () {

            var scope = this;

            if(!this.docData) {

                this.showToast('医生数据加载中,请稍候再试');

                return;
            }

            if(!this.uiList) {
                this.uiList = new UIRadioList({
                    data: this.docData,
                    itemFn: function (data) {
                        return data.name + ' ' + data.title + ' ' + (data.hospital.length > 10 ? data.hospital.substr(0, 9) + '...' :  data.hospital);
                    },
                    onClick: function (data, index) {
                        scope.$doc.html(data.name);
                        scope.$doc.attr('data-id', data.doctorId);
                        this.hide();
                    }
                });
            }

            this.uiList.show();

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '发布转诊信息(2/2)',
                back: true,
                right: [
                    {
                        tagname: 'next',
                        value: '下一步',
                        callback: function () {
                            this.onCompleteAction()
                        }
                    }
                ]
            };

            this.header.set(opts);
            // this.header.hide();
        },

        //因为发布二的数据必须依赖于1,所以不是从写的情况下一定不能打开
        validatData: function () {

            // this.back('publish01');

        },

        //点击完成
        onCompleteAction:function () {

        },

        initElement: function () {

            this.$toDoc = this.$('.js-to-doctor');
            this.$money = this.$('.js-money');
            this.$time = this.$('.js-time');
            this.$doc = this.$('.js-to-doctor-txt');

        },

        //获取发布1中所有的请求参数
        getPostParam: function () {

            var param = {};
            var docInfo = {};

            param.toDoctorId = this.$doc.attr('data-id');

            if(!param.toDoctorId) {
                this.showToast('请选择接诊医生');
                return false;
            }

            param.money = this.$money.val();

            if(!this.uiList || !this.uiList.getSelected()) {
                this.showToast('请选择接诊医生');
                return false;
            }

            docInfo = this.uiList.getSelected();

            param.toDoctorId = docInfo.doctorId;
            param.doctorHospital = docInfo.hospital;
            param.doctorName = docInfo.name;
            param.doctorTitle = docInfo.title;
            param.doctorPhone = docInfo.phone;
            // param.doctorTitle = docInfo.section;

            if(param.money == '' || param.money < 0) {
                this.showToast('请输入正确转诊费用');
                return false;
            }

            param.treatStartTime = parseInt(this.$time.attr('data-s')) / 2;
            param.treatEndTime = parseInt(this.$time.attr('data-e')) / 2;

            if(!param.treatEndTime || !param.treatStartTime) {
                this.showToast('请选择就诊时段');
                return false;
            }

            return param;
        },

        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;

                this.validatData();

                this.docListModel.urlParam = {
                    doctorId: this.USERINFO.userId

                };
                this.docListModel.execute(function (data) {
                    scope.docData = data.list;
                });


            });

            this.on('onHide', function () {

            });
        }

    });

});
