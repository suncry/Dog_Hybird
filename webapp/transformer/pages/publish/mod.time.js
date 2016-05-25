define(['ModuleView', 'UIGroupSelect'], function (ModuleView, UIGroupSelect) {

    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.events = {
                'click': 'openTime'
            };

            //当前正在上传的图片dom结构
            this.curUpPic = null;

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

            date.setTime(time);

            data1.push({
                _name: _.dateUtil.format(date, 'Y-M-D'),
                name: '今天',
                id: time
            });

            date.setTime(time + 86399999);

            data2.push({
                _name: _.dateUtil.format(date, 'Y-M-D'),
                name: '今天',
                id: time + 86399999
            });

            //生成时段数据
            for(var i = 0; i < 60; i++) {
                date.setTime(time + 86400000 * (i + 1));
                data1.push({
                    name: _.dateUtil.format(date, 'Y-M-D'),
                    id: date.getTime()
                });
                date.setTime(time + 86400000 * (i + 1) + 86399999);
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

                        var name1 = items[0].name;
                        var name2 = items[1].name;

                        if(name1 == '今天') {
                            name1 = items[0]._name;
                        }

                        if(name2 == '今天') {
                            name2 = items[1]._name;
                        }

                        scope.$time.html(name1+ ' - ' + name2);
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

        getTimeInfo: function () {
            if(this.uiTime) {
                return {
                    treatStartTime: this.uiTime.scrollArr[0].getSelected().id,
                    treatEndTime: this.uiTime.scrollArr[1].getSelected().id
                };
            }

            if(this.start && this.end) {
                return {
                    treatStartTime: this.start,
                    treatEndTime: this.end
                };
            }

            return false;
        },

        initElement: function () {

            this.$time = this.$('.js-time');

        },

        onHide: function () {
            if(this.uiTime) this.uiTime.hide();
        },

    });

});
