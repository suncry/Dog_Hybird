define([
    'BaseView',
    'TransModel',
    'UIDatetimepicker',
    'text!TransPath/docreschedule/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/docreschedule/docreschedule.css'
], function (
    BaseView,
    TransModel,
    Datetimepicker,
    layoutHtml,
    commonStyle,
    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            this.template = layoutHtml;
            this.style = style;
            this.needLogin = true;
            this.commonstyle = commonStyle;
            this.docDetailModel = TransModel.DocDetailModel.getInstance();
            this.postponeModel = TransModel.PostponeModel.getInstance();
            this.events = {
                'click .js-ok' : 'postPoneSubmitAction',
                "click .js-modify-data": 'showCalendar'
            };

        },
        //时间戳转换成需要的时间格式
        timestampToDate: function (timestamp) {
            var time = timestamp,
                date = new Date(parseInt(time) *1000),
                year = date.getFullYear(),
                monthTemp = date.getMonth()+ 1,
                month = monthTemp.toString().length < 2 ? '0' + monthTemp : monthTemp,
                dayTemp = date.getDate(),
                day = dayTemp.toString().length < 2 ? '0' + dayTemp : dayTemp,
                hourTemp = date.getHours(),
                hour = hourTemp.toString().length < 2 ? '0' + hourTemp : hourTemp,
                minitesTemp = date.getMinutes(),
                minites = minitesTemp.toString().length < 2 ? '0' + minitesTemp : minitesTemp;
            return year + '年' + month + '月' + day + '日 ' + hour + ':' + minites;
        },
        /**
         * 时间转换成时间戳
         * @param dateStr eg '2013/3/22'
         */
        dateToTimestamp: function (dateStr) {
            return (new Date(dateStr)).getTime();
        },
        //展示日期控件
        showCalendar: function () {
            var scope = this;
            scope.picker.show();
        },
        //实例化日期控件对象
        dateObj: function () {
            var scope = this,
                nowDate = new Date(),//当前时间
                nowYear = nowDate.getFullYear(),//当前年
                nowMonth = parseInt(nowDate.getMonth(), 10) + 1,//当前月
                nowDay = nowDate.getDate(),//当前天
            //由于传入的是时间戳，因此不必判断是否为闰年或者非闰年或者是月末什么的，直接在day后面加1也是正确的
            //开始时间为当天加1，结束时间为一年以后
                useDay = parseInt(nowDay, 10) + 1,//所用的天
                useYear = parseInt(nowYear, 10) + 1,//所用的年
                beginTime = parseInt(scope.dateToTimestamp(nowYear + '/' + nowMonth + '/' + useDay), 10) / 1000,
                endTime = parseInt(scope.dateToTimestamp(useYear + '/' + nowMonth + '/' + useDay), 10) / 1000;
            return new Datetimepicker({
                        isDownIn: true,
                        title: '选择接诊时间',
                        beginTime: beginTime,
                        endTime:  endTime,
                        onOkAction: function (time) {
                            scope.$dateWrapper.html(scope.timestampToDate(time));
                            scope.$dateWrapper.data('timestamp', time);
                            this.hide();
                        }
                    });
        },
        initHeader: function () {
            var opts = {
                view: this,
                title: '患者改期',
                back: true
            };
            this.header.set(opts);
            // this.header.hide();
        },
        initElement: function () {
            this.$dateWrapper = $('.js-modify-data');
        },
        //初次进入页面拉取数据
        initData: function () {
            var scope = this;
            scope.docDetailModel.urlParam = {
                doctorId : scope.USERINFO.userId,
                orderId : scope.orderId
            };
            scope.docDetailModel.execute(function (data) {
                scope.$dateWrapper.html(scope.timestampToDate(data.treatTime));
                scope.$dateWrapper.data('timestamp', data.treatTime);
                scope.initialTime = data.treatTime;//初始时间，用于判断他是否有真实改期
            });
        },
        //提交数据
        postPoneSubmitAction: function () {
            var scope = this;
            scope.showLoading();
            var finallyTime = scope.$dateWrapper.data('timestamp');
            if (finallyTime != scope.initialTime) {
                scope.postponeModel.urlParam = {
                    doctorId : scope.USERINFO.userId,
                    orderId : scope.orderId
                };
                scope.postponeModel.setParam({
                    treatTime: scope.$dateWrapper.data('timestamp')
                });
                scope.postponeModel.execute(function () {
                    scope.showToast('修改成功', function () {
                        scope.back('index');

                    });
                });
            } else {
                scope.back('index');

            }

        },
        addEvent: function () {
            this.on('onShow', function () {
                var scope = this;
                scope.orderId = _.getUrlParam().orderId;//也是orderId
                if (!scope.orderId) {
                    scope.showToast('参数错误', function () {
                        scope.back();
                    });
                }
                scope.initData();//初始化页面数据执行
                scope.picker = scope.dateObj();//初始化日期组建

            });

            this.on('onHide', function () {
                if (this.picker) {
                    this.picker.hide();
                }

            });
        }

    });

});
