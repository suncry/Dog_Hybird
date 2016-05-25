define(['ModuleView', 'text!TrainListPath/tpl.sort.bar.html'], function (ModuleView, tpl) {
    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.template = tpl;
            this.events = {
                'click .js_sort_item li ': function (e) {
                    var el = $(e.currentTarget);
                    var sort = el.attr('data-sort');
                    _hmt.push(['_trackEvent', 'train.list.sort.' + sort, 'click']);

                    this.sortEntity['set' + sort]();
                }
            };

            this.sortEntity.subscribe('init', this.render, this);
            this.sortEntity.subscribe(this.render, this);

        },

        getViewModel: function () {
            return this.sortEntity.get();
        }

    });

});
