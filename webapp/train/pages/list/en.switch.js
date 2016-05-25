define(['AbstractEntity'], function (AbstractEntity) {

    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();
            this.data = false;
        },

        checked: function () {
            if (this.data == true) this.data = false;
            else this.data = true;
            this.update();
        }
    });

    return Entity;
});
