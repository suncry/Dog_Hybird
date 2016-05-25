define(['AbstractEntity'], function (AbstractEntity) {

    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();

            //三个对象，时间，耗时，架构，升序降序，三个数据互斥
            //默认down up null
            this.data = {
                type: false,
                seat: false,
                setout: false,
                more: false
            };
        },

        resetData: function (trigger) {
            this.data = {
                type: false,
                seat: false,
                setout: false,
                more: false
            };
            if (trigger) this.update();
        },

        getSelected: function () {
            for (var key in this.data) {
                if (this.data[key]) return key;
            }
            return null;
        },

        selectType: function () {
            this._setData('type');
        },

        selectSeat: function () {
            this._setData('seat');
        },

        selectSetout: function () {
            this._setData('setout');
        },

        selectMore: function () {
            this._setData('more');
        },

        _setData: function (key) {
            this.resetData();
            this.data[key] = true;
            this.update();
        }

    });

    return Entity;
});
