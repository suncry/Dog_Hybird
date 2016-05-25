define(['AbstractEntity'], function (AbstractEntity) {

    //基础数据实体
    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();

            this.data = {
                images: []
            };
        },
        
        getLength: function () {
            return this.data.images.length;
        },
        
        add: function (url) {
            this.data.images.push({id: null, url: url});
            this.update();
        },

        setImages: function (images) {
            this.images = images;
        },
        
        remove: function (index) {
            if(!index) return;
            this.data.splice(index, 1);
            this.update();
        }


    });

    return Entity;
});
