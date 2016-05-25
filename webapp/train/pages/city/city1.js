define(['AbstractView', 'TrainBusModel', 'TrainBusStore', 'text!TrainCityPath/city.html', 'text!TrainCityPath/city.list.html', 'text!TrainCityPath/city.search.list.html', 'text!TrainCityPath/city.css'
],
function (AbstractView, BusModel, BusStore, html, listTpl, searchTpl, style) {

    return _.inherit(AbstractView, {
        propertys: function ($super) {
            $super();

            _hmt.push(['_trackEvent', 'train.city.view.', 'click']);

            this.style = style;
            this.template = html;
            this.events = {
                'click .js_city_list li': 'cityItemAction',
                'click .js_city_item': 'cityItemAction',
                'input .js_search_text': 'openSearch',
                'click .js_cancel_search': 'closeSearch'
            };

            this.listModel = BusModel.CityModel.getInstance();

            this.hisCity = BusStore.HisCityStore.getInstance();
            this.hotCitys = [
                '北京',
                '上海',
                '广州',
                '深圳',
                '成都',
                '杭州',
                '南江',
                '西安',
                '郑州',
                '重庆',
                '合肥',
                '汉口',
                '武汉',
                '长沙',
                '武昌',
                '太原',
                '苏州',
                '厦门',
                '南昌',
                '沈阳',
                '天津'
            ];
        },

        initHeader: function () {
            var scope = this;
            this.header.set({
                view: this,
                title: '城市选择',
                back: function () {
                    this.onBackAction();
                    this.closeSearch();
                }
            });
        },

        onBackAction: function () {

        },

        initElement: function () {
            this.d_hisCity = this.$('.js_his_city_wrapper');
            this.d_search_txt = this.$('.js_search_text');
            this.d_no_data = this.$('.js_none_data');
            this.d_js_nav_city = this.$('.js_nav_city');
            this.d_js_search_list = this.$('.js_search_list');

            this.d_city_wrapper = this.$('.js_city_wrapper');
            this.js_hot_city_wrapper = this.$('.js_hot_city_wrapper');

        },

        openSearch: function () {
            var scope = this;
            this.d_hisCity.hide();
            this.js_hot_city_wrapper.hide();
            this.d_js_nav_city.hide();
            this.d_city_wrapper.hide();

            this.$el.addClass('search-active');

            var key = this.d_search_txt.val().trim ? this.d_search_txt.val().trim() : this.d_search_txt.val();
            if (key == '') {
                return;
            }

            this.renderCitys(key);

            var d_ret = this.d_js_search_list.find('li[data-filter*=' + key + ']');
            this.d_js_search_list.find('.js-list-search').hide();
            d_ret.parent().parent().show();
            d_ret = this.d_js_search_list.find('.js_city_item[data-filter*=' + key + ']');
            d_ret.parent().show();

            this.d_js_search_list.show();

        },

        closeSearch: function () {
            this.$el.removeClass('search-active');
            this.d_js_nav_city.show();
            this.d_no_data.hide();
            this.d_search_txt.val('');
            this.d_search_txt.blur();
            this.d_hisCity.show();
            this.js_hot_city_wrapper.show();
            this.d_city_wrapper.show();
            this.d_js_search_list.hide();
        },

        cityItemAction: function (e) {

            var i, len;
            var el = $(e.currentTarget);
            var name = el.attr('data-name');

            var arr = this.hisCity.get() || [];

            arr = arr.reverse();
            len = arr.length;

            //存在便不予理睬
            for (i = 0; i < len; i++) {
                if (arr[i] == name) { arr.splice(i, 1); break; }
            }
            arr.push(name);
            arr = arr.reverse();
            arr = arr.slice(0, 6);
            this.hisCity.set(arr);
            this.onCityItemClick(name);
            this.closeSearch();

        },

        onCityItemClick: function (id, name, station, type) {
        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initHisList();
                this.renderHotCitys();
                this.initList();
            });
        },

        initHisList: function () {
            var data = this.hisCity.get();
            data = data || [];
            var html = this.renderTpl(listTpl, { data: { 'key': '历史城市', items: data} });
            this.d_hisCity.html(html);
        },

        getListData: function (data, k) {
            var citys = {}, sortCitys = {};
            var k, gname, name, i, len, tmp = {}, index;

            data = _.filter(data, function (item) {

                //验证
                if (item.city_name && item.city_name.indexOf(k) == 0) {
                    return true;
                }
                if (item.pinyin && item.pinyin.indexOf(k) == 0) {
                    return true;
                }
                if (item.station_name && item.station_name.indexOf(k) == 0) {
                    return true;
                }
                if (item.station_short_name && item.station_short_name.indexOf(k) == 0) {
                    return true;
                }

                return false;
            });


            for (i = 0, len = data.length; i < len; i++) {
                tmp = data[i];

                k = 'key_' + tmp.city;
                if (!sortCitys[k]) {
                    sortCitys[k] = {};
                    sortCitys[k].item = tmp;
                    sortCitys[k].data = [];
                }
                if (tmp.city_name != tmp.station_name)
                    sortCitys[k].data.push(tmp);
            }

            return sortCitys;
        },

        renderHotCitys: function () {
            var html = this.renderTpl(listTpl, { data: { 'key': '热门城市', items: this.hotCitys} });
            this.js_hot_city_wrapper.html(html);
        },

        renderCitys: function (data) {
            var k = '';
            if (typeof data != 'string') {
                this.cityData = data;
            } else {
                k = data;
                data = this.cityData;
            }

            if (k == '') return;

            var citis = this.getListData(data, k);
            var html = this.renderTpl(searchTpl, { data: citis });
            this.d_js_search_list.html(html);
        },

        initList: function () {
            var scope = this;
            this.showLoading();
            setTimeout(function () {
                scope.listModel.execute(function (data) {
                    var html = scope.renderTpl(listTpl, { data: data });

                    console.log(html)
                    return;
                    document.writeln(html)

                    return;
                    scope.renderCitys(data);
                    scope.hideLoading();
                });
            });

        }

    });

});
