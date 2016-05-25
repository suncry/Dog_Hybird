define(['AbstractEntity'], function (AbstractEntity) {

    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();
            var n = new Date();
            var curTime = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
            this.data = {
                maxTime: null,
                date: curTime,
                title: '当前日期'
            };
        },

        setMaxTime: function (t) {
            var d;
            if (t.getFullYear) {
                d = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0);
                t = d.getTime();
            }
            this.data.maxTime = t;
        },

        set: function (date) {
            if (!date) return;
            if (_.isDate(date)) date = date.getTime();
            if (typeof date === 'string') date = parseInt(date);
            this.data.date = date;
            this.update();
        },

        getDateStr: function () {
            var date = new Date();
            date.setTime(this.data.date);
            var dateDetail = _.dateUtil.getDetail(date);
            var name = dateDetail.year + '-' + dateDetail.month + '-' + dateDetail.day + ' ' + dateDetail.weekday + (dateDetail.day1 ? '(' + dateDetail.day1 + ')' : '');
            return name;
        },

        getDateStr2: function () {
            var date = new Date();
            date.setTime(this.data.date);
            var dateDetail = _.dateUtil.getDetail(date);
            var name = dateDetail.year + '/' + dateDetail.month + '/' + dateDetail.day;
            return name;
        },

        getDate: function () {
            return parseInt(this.data.date);
        },

        //是否能够再往前一天
        canPreDay: function () {
            var n = new Date();
            var curTime = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();

            //如果当前日期已经是第一天，则不可预订
            if (curTime <= this.getDate() - 86400000) {
                return true;
            }
            return false;
        },

        //是否能够再往后一天
        canNextDay: function () {
            if (this.data.maxTime === null) return true;

            var maxTime = this.data.maxTime;

            //如果设置了最大时间，并且最大时间比当前时间小，则不能选
            if (maxTime <= this.getDate()) {
                return false;
            }

            return true;
        },

        nextDay: function () {
            if (!this.canNextDay()) return false;
            this.set(this.getDate() + 86400000);
            return true;
        },

        preDay: function () {
            if (!this.canPreDay()) return false;
            this.set(this.getDate() - 86400000);
            return true;
        }

    });

    return Entity;
});
