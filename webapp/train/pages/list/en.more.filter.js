define(['AbstractEntity'], function (AbstractEntity) {

    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();
            //配置更多弹出层列表是否展示
            this.data = {
                setout: false,
                arrive: false
            };
        },

        selectSetout: function () {
            if (this.data.setout) this.data.setout = false;
            else this.data.setout = true;
            this.update();
        },

        selectArrive: function () {
            if (this.data.arrive) this.data.arrive = false;
            else this.data.arrive = true;
            this.update();
        }
    });

    return Entity;
});
