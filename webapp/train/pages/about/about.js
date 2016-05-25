define(['AbstractView',
        'text!TrainPath/about/tpl.about.html',
        'text!TrainPath/about/about.css',

        'UIScrollLayer',
        'text!TrainPath/about/tpl.goupiao.tips.html',
        'text!TrainPath/about/tpl.mianze.tips.html'
    ],
    function (AbstractView, bodyTpl, css, UIScrollLayer, tpl1, tpl2, tpl3, tpl4, tpl5) {
        var tip_title = ['购票说明', '取票说明', '退票说明', '改签说明', '免责声明'];
        var tips = [tpl1, tpl2, tpl3, tpl4, tpl2];
        return _.inherit(AbstractView, {
            propertys: function ($super) {
                $super();

                this.style = css;

                this.events = {
                    'click .js_tool_bar li': 'showTips'
                };
                this.tips = [];

                _hmt.push(['_trackEvent', 'train.about.view.', 'click']);

            },

            initHeader: function () {
                this.header.set({
                    view: this,
                    title: '关于我们',
                    back: function () {
                        this.onBackAction();
                    }
                });
            },

            onBackAction: function () {
                this.back('home');
            },

            renderBody: function (data) {
                var html = this.renderTpl(bodyTpl, data);
                this.$el.html(html);
            },

            initBody: function () {
                var scope = this;
                this.renderBody();
                if (_.getHybridInfo().version) this.$('.js_ver').html(_.getHybridInfo().version);
            },
            _showTips: function (tip) {
                if (!this.tips[tip]) {
                    this.tips[tip] = new UIScrollLayer({
                        title: tip_title[tip],
                        html: tips[tip]
                    });
                }
                this.tips[tip].show();
            },
            showTips: function (e) {
                var el = $(e.currentTarget);
                var name = el.attr('data-name');
                var tip = null;
                switch (name) {
                    case 'goupiao':
                        this._showTips(0);
                        break;
                    case 'qupiao':
                        this._showTips(1);
                        break;
                    case 'tuipiao':
                        this._showTips(2);
                        break;
                    case 'gaiqian':
                        this._showTips(3);
                        break;
                    case 'mianze':
                        this._showTips(4);
                        break;
                    case 'haoping':
                        window.location = 'https://m.baifubao.com/';
                }
            },

            addEvent: function () {
                this.on('onShow', function () {
                    this.initBody();
                });

                this.on('onHide', function () {
                    for (var i = 0, len = this.tips.length; i < len; i++) {
                        if (this.tips[i]) this.tips[i].hide();
                    }
                });

            }

        });

    });
