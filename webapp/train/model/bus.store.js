define(['AbstractStore'], function (AbstractStore) {

    return {
        ListStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_ListStore';
                this.lifeTime = '10D'; //缓存时间
            }
        }),

        CityStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_CityStore';
                this.lifeTime = '10D'; //缓存时间
            }
        }),

        SCityStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_SCityStore';
                this.lifeTime = '10D'; //缓存时间
            }
        }),

        ECityStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_ECityStore';
                this.lifeTime = '10D'; //缓存时间
            }
        }),

        //出发站地图相关接口
        HisCityStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_HisCityStore';
                this.lifeTime = '1D';
            }
        }),

        //历史选择数据
        HisRouteStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_HisRouteStore';
                this.lifeTime = '30D'; //缓存时间
            }
        }),

        //预售期
        PreSaleStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Train_PreSaleStore';
                this.lifeTime = '1H'; //缓存时间
            }
        })

    }

});
