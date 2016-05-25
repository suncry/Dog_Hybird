define(['AbstractEntity'], function (AbstractEntity) {

    var Entity = _.inherit(AbstractEntity, {
        propertys: function ($super) {
            $super();

            this.titleMap = [
                '发布转诊信息(1/2)',
                '发布转诊信息(2/2)',
                '预览'
            ];

            //0 为 发布; 1 为发布2≈ß
            this.data = {
                nondirectional: false,
                edit: false,
                step: 0,
                title: '发布转诊信息(1/2)'
            };
        },
        
        setTitle: function (title) {
            this.data.title = title;
            this.update();
        },

        getTitle: function () {
            return this.data.title;
        },

        getStep: function () {
            return this.data.step;
        },

        setEdit: function () {
            this.data.edit = true;
            this.data.title = '编辑转诊信息';
            this.titleMap = [
                '编辑转诊信息',
                '编辑转诊信息',
                '预览'
            ];
        },

        //非定向
        setNondirectional: function () {
            this.data.nondirectional = true;
            this.data.title = '发布转诊信息';
            this.titleMap = [
                '发布转诊信息'
            ];
        },

        //下一步
        setStep: function (step) {
            this.data.step = step;
            this.data.title = this.titleMap[step];
            this.update();

        }


    });

    return Entity;
});
