define([
    'BaseView',
    'UISelect',
    'UIGroupSelect',
    'TransModel',
    'TransStore',
    'qiniu',
    'text!TransPath/editdata/tpl.layout.html',
    'text!TransStylePath/common.css',
    'text!TransPath/editdata/editdata.css'
], function (BaseView, UISelect, UIGroupSelect, TransModel, TransStore, Qiniu, layoutHtml, commonStyle, style) {
    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();
            this.needLogin = true;
            var scope = this;
            this.template = layoutHtml;
            this.style = style;
            this.commonstyle = commonStyle;
            this.sectionModel = TransModel.SectionListModel.getInstance();
            this.sectionStore = TransStore.SectionListStore.getInstance();
            this.titleModel = TransModel.TitleModel.getInstance();
            this.titleStore = TransStore.TitleStore.getInstance();
            this.accountModel = TransModel.AccountModel.getInstance();
            this.qiniuModel = TransModel.QiniuModel.getInstance();
            this.logoutModel = TransModel.LogoutModel.getInstance();
            this.userInfoData = {};
            this.events = {
                'click .js-section-select': 'showSectionSelect',
                'click .js-title-select': 'showTitleSelect',
                'click .js-logout': 'logout',
                'click .js-back': 'submitAction'
            };

        },

        logout: function () {
            var scope = this;
            scope.showConfirm({
                content: '是否确认退出登录？',
                okAction: function () {
                    this.hide();
                    scope.logoutModel.execute(
                        function () {
                            window.location.href = window.location.protocol + '//' + window.location.host + '/transform/';
                        }
                    );
                },
                cancelAction: function () {
                    this.hide();
                }
            });
        },

        //科室选择
        showSectionSelect: function () {
            var scope = this;
            var selectData = scope.sectionStore.get(),
                parentIndex = 0,
                parentId = 0,
                subIndex = 0,
                eachReturn = false;

            //如果本地没有则。去服务器取
            if (!selectData) {
                scope.sectionModel.execute(function () {
                    scope.showSectionSelect();
                });
                return;
            }

            if (scope.sectionId) {
                $.each(selectData.subSectionData, function (i, e) {
                    $.each(e, function (a, b) {
                        if (b.id == scope.sectionId) {
                            parentId = i;//parentId
                            subIndex = a;
                            eachReturn = true;//用于退出外层循环
                            return false;
                        }
                    });
                    if (eachReturn) {
                        return false;
                    }
                });
                $.each(selectData.mainSectionData, function (i, e) {
                    if (e.id == parentId) {
                        parentIndex = i;
                        return false;
                    }
                });
            }


            if (!this.groupSelect) {
                this.groupSelect = new UIGroupSelect({
                    isDownIn: true,
                    title: '选择科室',
                    indexArr: [parentIndex, subIndex],
                    data: [selectData.mainSectionData, selectData.subSectionData[parentId]],
                    changedArr: [
                        function (item) {
                            this.scrollArr[1].reload({data: selectData.subSectionData[item.id]});
                        }

                    ],
                    onOkAction: function (item) {
                        scope.$userSection.text(item[1].name);
                        scope.userInfoData.sectionId = item[1].id;
                        scope.userInfoData.section = item[1].name;
                        this.hide();
                    }
                });
            }
            this.groupSelect.show();
        },
        //职称选择
        showTitleSelect: function () {
            var scope = this;
            if (!this.titleSelect) {
                this.titleModel.get(function (data) {
                    var index = -1;
                    _.each(data, function (item, itemIndex) {
                        if (item.id == scope.titleId) {
                            index = itemIndex;
                        }

                    });
                    scope.titleList = data;
                    scope.titleSelect = new UIGroupSelect({
                        isDownIn: true,
                        title: '选择职称',
                        data: [data],
                        indexArr: [index],
                        onOkAction: function (item) {
                            if (item[0].id != scope.userInfoData.titleId) {
                                scope.titleChange = true;
                            }
                            scope.$userTitle.text(item[0].name);
                            scope.userInfoData.titleId = item[0].id;
                            scope.userInfoData.title = item[0].name;
                            this.hide();
                        }
                    });
                });
            }
            this.titleSelect.show();
        },
        createTitleSelect: function () {

        },

        //初始化七牛配置
        initQiniuSetting: function () {
            var scope = this;
            this.qiniuModel.setParam({
                isPublic: 1,
                bucket: 'avatar',
                isWatermark: 0

            });
            this.qiniuModel.execute(function (data) {
                scope.uploadSet(data.uptoken, data.domain)
            });
        },
        uploadSet: function (uptoken, domain) {
            //html5 mime_type 支持
            //全局设置 
            //bugfix ID: 1000343 
            mOxie.Mime.addMimeType("image/*,png jpg jpeg bmp");
            var scope = this;
            var uploader = Qiniu.uploader({
                filters: {
                    mime_types: [ //只允许上传图片和zip文件
                        { title: "Image files", extensions: "png,jpg,jpeg,bmp" }
                    ],
                    prevent_duplicates: false //不允许选取重复文件
                },
                multi_selection: false,
                unique_names: true,
                runtimes: 'html5,flash,html4',
                browse_button: 'selectImage',
                container: 'container',
                drop_element: 'container',
                max_file_size: '1000mb',
                flash_swf_url: 'bower_components/plupload/js/Moxie.swf',
                dragdrop: true,
                chunk_size: '4mb',
                uptoken: uptoken,
                domain: domain,
                get_new_uptoken: false,
                auto_start: true,
                log_level: 5,
                resize: {
                    quality: 30
                },
                init: {
                    'FilesAdded': function (up, files) {
                    },
                    'BeforeUpload': function (up, file) {
                    },
                    'UploadProgress': function (up, file) {
                        // scope.onUpdating(up, file);
                    },
                    'UploadComplete': function () {
                    },
                    'FileUploaded': function (up, file, info) {
                        scope.afterUpload(up, file, info);
                    },
                    'Error': function (up, err, errTip) {
                        scope.errrUpload(up, err, errTip);
                    }
                }
            });
        },
        //上传中
        onUpdating: function (up, file) {
            var chunk_size = this.getOption('chunk_size');
            // progress.setProgress(file.percent + "%", file.speed, chunk_size);
        },

        //上传成功
        afterUpload: function (up, file, info) {
            var scope = this;

            var res = $.parseJSON(info);
            var url;
            if (res.url) {
                url = res.url;
            } else {
                var domain = up.getOption('domain');
                url = domain + encodeURI(res.key);
            }
            scope.$userAvatar.attr('src', url);
            scope.userInfoData.avatar = url;
            scope.photoChange = true;//头像有所改动
        },


        initHeader: function () {
            var scope = this;
            var opts = {
                view: this,
                title: '编辑资料',
                back: function () {
                    scope.submitAction(function () {
                        setTimeout(function () {
                            scope.back('personalcenter');
                        }, 300);
                    });
                },
                right: [
                    {
                        tagname: 'save',
                        value: '保存',
                        callback: function () {
                            scope.submitAction();
                        }

                    }
                ]
            };

            this.header.set(opts);
        },

        submitAction: function (cancelCallback) {
            var scope = this;

            scope.userInfoData.intro = scope.$userIntro.val();
            if (scope.userInfoData.intro != scope.intro
                || scope.photoChange
                || scope.titleId != scope.userInfoData.titleId
                || scope.sectionId != scope.userInfoData.sectionId) {
                scope.showConfirm({
                    content: '是否保存此次修改？',
                    okAction: function () {
                        this.hide();

                        if (!scope.userInfoData.intro.length) {
                            scope.showToast('请填写个人简介');
                            return ;
                        }
                        scope.accountModel.urlParam = {'userId': scope.USERINFO.userId};
                        scope.accountModel.setParam(
                            scope.userInfoData
                        );
                        scope.accountModel.post(
                            function (data) {
                                scope.showToast('保存成功', function () {
                                    scope.back('personalcenter');
                                });
                            },
                            function () {
                                scope.showToast('保存失败', function () {
                                    scope.back('personalcenter');
                                });
                            });
                    },
                    cancelAction: function () {
                        this.hide();
                        if (cancelCallback) {
                            cancelCallback();
                        }
                    }
                });
            } else {
                setTimeout(function () {
                    scope.back('personalcenter');
                }, 300);
            }


        },

        initElement: function () {
            this.$userTitle = $('.user-title');
            this.$userSection = $('.user-section');
            this.$userPhone = $('.user-phone');
            this.$userName = $('.user-name');
            this.$userAvatar = $('.user-avatar>img');
            this.$userIntro = $('.user-intro');
        },

        addEvent: function () {
            this.on('onShow', function () {

                this.photoChange = false;//判断头像是否有改动
                var scope = this;
                this.showLoading();
                this.accountModel.urlParam = {'userId': this.USERINFO.userId};
                this.accountModel.get(function (data) {
                        scope.$userPhone.text(data.phone);
                        scope.$userName.text(data.name);
                        scope.$userSection.text(data.section);
                        scope.$userTitle.text(data.title);
                        scope.$userAvatar.attr('src', data.avatar).show();
                        scope.$userIntro.text(data.intro);
                        scope.userInfoData = data;
                        scope.sectionId = data.sectionId;
                        scope.titleId = data.titleId;
                        scope.intro = data.intro;
                        scope.initQiniuSetting();
                    }, null , true);

            });
            this.on('onHide', function () {
                if (this.groupSelect) {
                    this.groupSelect.hide();
                }
                if (this.titleSelect) {
                    this.titleSelect.hide();
                }
            });
        }
    });
});
