    define(['AbstractStore'], function (AbstractStore) {

    return {

        //用户最近一次的城市保存
        UserCityStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_User_City';
                this.lifeTime = '1D'; //缓存时间
                this.shouldClear = true;

            }
        }),

        //根据经纬度缓存的数据
        GeoAreaStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_Geo_Area';
                this.lifeTime = '1D'; //缓存时间
                this.shouldClear = true;

            }
        }),

        //用户信息,注意退出登录,重新登录等逻辑时需要清空
        IndexTagStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_Index_Tag';
                this.lifeTime = '1H'; //缓存时间
                this.shouldClear = true;

            }
        }),

        //地理信息
        GeoDataStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_Geo_Data';
                this.lifeTime = '1H'; //缓存时间
                this.shouldClear = true;

            }
        }),

        //用户信息,注意退出登录,重新登录等逻辑时需要清空
        UserStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_UserInfo';
                this.lifeTime = '1H'; //缓存时间
                this.shouldClear = true;
            }
        }),

        //登录后缓存
        LoginStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_Login';
                this.lifeTime = '1H'; //缓存时间
            }
        }),
        AccountStore: _.inherit(AbstractStore, {
                propertys:function($super){
                    $super();
                    this.key='Trans_Account';
                    this.lifeTime = '10H'; //缓存时间
                    this.shouldClear = true;

                }

            }
        ),
        SectionListStore: _.inherit(AbstractStore, {
                propertys:function($super){
                    $super();
                    this.key='Base_Section';
                }

            }
        ),
        TitleStore: _.inherit(AbstractStore,{
            propertys:function($super){
                $super();
                this.key='Base_Title';
            }
        }),
        // 银行卡缓存,重新登录等逻辑时需要清空
        CardInfoStore: _.inherit(AbstractStore, {
            //默认属性
            propertys: function ($super) {
                $super();
                this.key = 'Trans_CardInfo';
                this.lifeTime = '1M'; //缓存时间
                this.shouldClear = true;
            }
        }),
        //城市区域缓存
        CityStore: _.inherit(AbstractStore,{
            propertys:function($super){
                $super();
                this.key='Trans_City';
                this.listKey = 'id';
                this.lifeTime = '30D'; //缓存时间
            }
        }),

        City1Store: _.inherit(AbstractStore,{
            propertys:function($super){
                $super();
                this.key='Trans_City1';
                this.lifeTime = '1D'; //缓存时间
            }
        }),

        LoginData: _.inherit(AbstractStore,{
            propertys:function($super){
                $super();
                this.key='Login_data';
                this.lifeTime = '30D'; //缓存时间
            }
        }),

        BindBankCardFromData: _.inherit(AbstractStore,{
            propertys:function($super){
                $super();
                this.key='BindFrom_data';
                this.lifeTime = '2M'; //缓存时间
            }
        })
    }
});
