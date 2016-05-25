define([
    'BaseView',
    'text!TransPath/city/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'TransStore',
    'text!TransPath/city/city.css'
], function (BaseView,
             layoutHtml,
             commonStyle,
             TransModel,
             TransStore,
             style) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            // this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;

            this.model = TransModel.City1Model.getInstance();

            this.events = {
                'click .js-list .js-item': 'listAction',
                'click .js-nav-list li': 'groupAction'
            };

        },

        listAction: function (e) {
            var el = $(e.currentTarget);
            var id = el.attr('data-id');
            var name = el.attr('data-name');

            if(!id) return;

            this.onListClick(id, name);
        },

        groupAction: function (e) {
            var el = $(e.currentTarget);
            var top = el.attr('data-top');
            var is6PS = $(window).width() > 375 ? true : false;
            e.preventDefault();

            if (is6PS) {
                window.scroll(0, top - 55);
            } else {
                window.scroll(0, top - 50);
            }

        },

        //overrid
        onListClick: function (id) {
            this.back();
        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '选择城市',
                back: function () {
                    this.onBackAction();
                }
            };

            this.header.set(opts);
        },

        onBackAction: function () {
            this.back();
        },
        
        initElement: function () {
            this.$geoEl = this.$('.js-geo-item');
            this.$geoName = this.$('.js-geo-name');
        },

        initCityList: function () {
            var scope = this;
            this.showLoading();
            this.model.get(function (data) {
                scope.renderCitys(data);
                scope.initElement();
                scope.initGeoData();
            });
        },

        getCityInfo: function (longitude, latitude) {
            var model = TransModel.GeoAreaModel.getInstance();
            var scope = this;
            model.setParam({
                lng: longitude,
                lat: latitude
            });

            model.get(function (data) {
                scope.$geoEl.attr('data-id', data.areaId);
                scope.$geoEl.attr('data-name', data.name);
                scope.$geoName.html(data.name);

            });

        },

        initGeoData: function () {
            var scope = this;
            navigator.geolocation.getCurrentPosition(function (data) {
                scope.getCityInfo(data.coords.longitude, data.coords.latitude)

            }, function (data) {
                scope.$geoName.html('定位失败');
            });

        },

        groupData: function (data) {
            var sortCitys = [], len, obj, k;

            for (var i = 65; i < 91; i++) {
                tmp = {};
                tmp[String.fromCharCode(i)] = [];
                sortCitys.push(tmp);
            }

            for(i = 0, len = data.length; i < len; i++) {
                obj = sortCitys[data[i].pinyin.toUpperCase().charCodeAt() - 65];
                for(k in obj) {
                    obj[k].push(data[i]);
                }
            }

            return sortCitys;
        },
        
        renderCitys: function (data) {
            data = this.groupData(data);
            var html = this.renderTpl(layoutHtml, {data: data});
            this.$el.html(html);
            this.initNavCity();
            this.initGeoData();
        },

        initNavCity: function () {
            var groups = this.$('.js-group');
            var item, navs = [];
            navs.push('<ul class="js-nav-list nav-bar-list">');
            for (var i = 0, len = groups.length; i < len; i++) {
                item = groups.eq(i);
                navs.push('<li data-top="' + item.offset().top + '">' + item.text() + '</li>');
            }
            navs.push('</ul>');

            this.$el.append(navs.join(''));

        },

        addEvent: function () {
            this.on('onShow', function () {
                this.initCityList();

            });

            this.on('onHide', function () {

            });


        }

    });

});
