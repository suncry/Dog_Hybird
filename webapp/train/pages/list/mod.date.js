define(['ModuleView', 'UICalendarBox', 'text!TrainListPath/tpl.calendar.bar.html', 'TrainBusModel'], function (ModuleView, UICalendarBox, tpl, BusModel) {
    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {
            var scope = this;
            this.template = tpl;
            this.events = {
                'click .js_pre_day': 'preAction',
                'click .js_next_day': 'nextAction',
                'click .js_show_calendar': 'showCalendar'
            };

            this.preSaleModel = BusModel.PreSaleModel.getInstance();
            //默认两个月日历可选
            this.endTime = 2592000000 * 2 - 86400000;
            //默认不抢票
            this.qiangpiao = 0;

            scope.dateEntity.setMaxTime(scope._getMaxTime(new Date().getTime() + this.endTime));

            //预加载本页需要点击才会使用的UI资源
            //首页预加载，保证首屏快速展示
            setTimeout(function () {
                requirejs(['UICalendarBox']);
                scope.preSaleModel.execute(function (data) {
                    scope.endTime = (data.normal + data.qiang) * 86400 * 1000 - 86400000;
                    scope.qiangpiao = data.qiang;
                    scope.dateEntity.setMaxTime(scope._getMaxTime(new Date().getTime() + scope.endTime));

                    //解决最后一天不能点问题，解决数据异步更新问题，后续需要在体制上优化，***bug
                    scope.render();
                });
            }, 100);

            //初始化时候需要执行的回调
            this.dateEntity.subscribe('init', this.render, this);
            this.dateEntity.subscribe(this.render, this);
            this.dateEntity.subscribe(this.view.refreshList, this.view);

        },

        _getMaxTime: function (t) {
            var endDate = new Date();
            endDate.setTime(t);
            var _endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
            return _endTime;
        },

        onHide: function () {
            if (this.calendar) {
                this.calendar.destroy();
            }
        },

        initDate: function () {
            var t = new Date().getTime();
            var urlDate = _.getUrlParam().startdatetime || _.getUrlParam().date;

            //默认情况下获取当前日期，也有过了18.00就设置为第二天日期
            //当时一旦url上有startdatetime参数的话，便需要使用之
            if (urlDate) {
                var date = urlDate.split('-');

                if (date.length == 3) {
                    if (date[1].indexOf('0') === 0) {
                        date[1] = date[1].substr(1);
                    }
                    if (date[2].indexOf('0') === 0) {
                        date[2] = date[2].substr(1);
                    }
                    date = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]));
                    t = date.getTime();

                } else {
                    t = urlDate;
                }
            }
            this.dateEntity.initData({
                date: t
            });
        },

        getViewModel: function () {
            var data = this.dateEntity.get();
            data.formatStr = this.dateEntity.getDateStr();
            data.canPreDay = this.dateEntity.canPreDay();
            data.canNextDay = this.dateEntity.canNextDay();
            return data;
        },

        preAction: function () {
            _hmt.push(['_trackEvent', 'train.list.preAction', 'click']);

            if (this.dateEntity.preDay()) return;
            this.view.showToast('前一天不可预订');
        },

        nextAction: function () {
            _hmt.push(['_trackEvent', 'train.list.nextAction', 'click']);

            if (this.dateEntity.nextDay()) return;
            this.view.showToast('后一天不可预订');

        },

        showCalendar: function () {
            _hmt.push(['_trackEvent', 'train.list.showCalendar', 'click']);

            var scope = this, endDate = new Date();
            var secDate = new Date();
            secDate.setTime(this.dateEntity.getDate());
            endDate.setTime(new Date().getTime() + this.endTime);
            var _endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            if (!this.calendar) {
                this.calendar = new UICalendarBox({
                    endTime: endDate,
                    selectDate: secDate,
                    dayItemAction: function (dayObj, year, month, day, dateObj, difftime) {
                        var isMulti = false;
                        var dayStrArr = [];
                        var qiang = '';

                        //计算抢票用
                        var differDay = (_endTime.getTime() - dateObj.getTime()) / 86400000;

                        dayStrArr[0] = '<div class="cm-field-title">' + (dayObj.day1 || dayObj.day) + '</div>';
                        if (dayObj.solarHoliday || dayObj.lunarHoliday) {
                            isMulti = true;
                            dayStrArr[0] = '<div class="cm-field-title">' + (dayObj.lunarHoliday || dayObj.solarHoliday) + '</div>';
                        }

                        if (differDay >= 0 && differDay < scope.qiangpiao) {
                            qiang = '<span class="qiang">抢</span>';
                        }

                        return '<div class="cm-field-wrapper ' + (isMulti ? 'multi-item' : '') + '">' + dayStrArr.join('') + qiang + '</div>';
                    },
                    onItemClick: function (date, el, e) {
                        scope.dateEntity.set(date);
                        this.hide();
                    }
                });
            } else {
                this.calendar.calendar.selectDate = secDate;
                this.calendar.calendar.refresh();
            }

            this.calendar.show();


        }

    });

});
