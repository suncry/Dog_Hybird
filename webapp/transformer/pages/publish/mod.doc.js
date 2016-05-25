define(['ModuleView', 'TransModel', 'UIGroupSelect'], function (ModuleView, TransModel, UIGroupSelect) {

    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.events = {
                'click': 'openDocAction'

            };

            this.docListModel = TransModel.DoctorListModel.getInstance();

            this.docData = null;
            this.initDocData();

        },

        initDocData: function () {

            var scope = this;
            this.docListModel.urlParam = {
                doctorId: this.docId

            };
            this.docListModel.execute(function (data) {
                scope.docData = data.list;
            });

        },

        //当用户获取
        openDocAction: function () {

            var scope = this;

            if(!this.docData) {

                this.showToast('医生数据加载中,请稍候再试');
                return;
            }

            if(this.docData.length === 0) {
                this.showToast('请联系客服创建医生关系链');
                return;
            }

            if(!this.uiList) {

                for(var i = 0, len = this.docData.length; i < len; i++) {
                    this.docData[i].originName = this.docData[i].name;
                    this.docData[i].name = this.docData[i].name + ' ' + this.docData[i].title + ' ' + _.mySubstr(this.docData[i].hospital, 7) + ' ' + _.mySubstr(this.docData[i].section, 5);
                }

                this.uiList = new UIGroupSelect({
                    isDownIn: true,
                    data: [this.docData],
                    onOkAction: function (items) {
                        var data = items[0];
                        // data, index

                        scope.$doc.html(data.originName);
                        this.hide();
                    }
                });
            }

            this.uiList.show();
        },

        getDocInfo: function () {

            if(this.uiList) {
                return this.uiList.scrollArr[0].getSelected();
            }

            if(this.rxDoc) {
                return this.rxDoc;
            }

            return false;

        },

        initElement: function () {

            this.$doc = this.$('.js-to-doctor-txt');

        },

        onHide: function () {
            if(this.uiList) this.uiList.hide();
        }

    });

});
