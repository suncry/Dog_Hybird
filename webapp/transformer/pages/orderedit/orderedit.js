define([
    'BaseView',
    'text!TransPath/orderedit/tpl.layout.html',
    'text!TransStylePath/common.css',
    'TransModel',
    'cValidate',

    'qiniu',

    'text!TransPath/orderedit/orderedit.css'
], function (
    BaseView,
    layoutHtml,
    commonStyle,
    TransModel,
    cValidate,

    Qiniu,

    style
) {

    return _.inherit(BaseView, {
        propertys: function ($super) {
            $super();

            var scope = this;

            // this.template = layoutHtml;
            this.style = style;

            this.commonstyle = commonStyle;

            this.docPubModel = TransModel.DocPubOrders.getInstance();
            this.qiniuModel = TransModel.QiniuModel.getInstance();
            this.publishModel = TransModel.DocPubOrders.getInstance();
            this.publishModel.type = 'POST';
            this.detailModel = TransModel.DocOrderDetail.getInstance();
            this.docListModel = TransModel.DoctorListModel.getInstance();


            //当前正在上传的图片dom结构
            this.curUpPic = null;

            //最多上传数
            this.maxSize = 5;

            this.events = {
                'click .js-remove-pic': 'picRemoveAction',
                'blur .js-ids': 'setUserInfo',
                'click .js-to-doctor': 'openDocAction',
                'click .js-time-action': 'openTime'
            };

        },

        initHeader: function () {
            var opts = {
                view: this,
                title: '编辑转诊信息',
                back: function () {
                    this.back('index');
                },
                right: [
                    {
                        tagname: 'next',
                        value: '保存',
                        callback: function () {
                            // this.forward('publish02');

                            //开启转诊2
                            this.publish02();
                        }
                        
                    }
                ]
            };

            this.header.set(opts);
            // this.header.hide();
        },

        publish02: function () {
            var scope = this;

            if(!scope.getPostParam()) {
                return;
            }

            this.showPageview('publish02', {
                onCompleteAction: function () {
                    if(!this.getPostParam()) {
                        return;
                    }

                    var param1 = scope.getPostParam();
                    var param2 = this.getPostParam();

                    if(!param1 && !param2) return;

                    param1 = _.extend(param1, param2);

                    scope.publish03(param1, this.USERINFO.userId, this)
                },

                validatData: function () { }
                
            });

        },

        //再一次showpageview
        publish03: function (data, docId, that) {
            var scope = this;

            data.showOkBtn = true;

            that.showPageview('details', {
                propertys: function ($super) {
                    $super();
                    this.needLogin = false;
                },
                okAction: function () {
                    scope.publishModel.setParam(data);
                    scope.publishModel.urlParam = {'doctorId': docId};
                    scope.showLoading();
                    scope.publishModel.execute(function (data) {
                        scope.forward('index');
                    });
                },
                initData: function () {
                    this.renderPage(data);
                }

            });

        },

        initElement: function () {
            this.$picList = this.$('.js-pic-list');
            this.$addBtn = this.$('.js-add');
            this.$name = this.$('.js-name');
            this.$tel = this.$('.js-tel');
            this.$ids = this.$('.js-ids');
            this.$type = this.$('.js-type');
            this.$desc = this.$('.js-desc');
            this.$sex = this.$('.js-sex');
            this.$age = this.$('.js-age');

        },

        //当用户获取
        setUserInfo: function () {

            var ids = this.$ids.val();
            var userInfo = null;

            if(ids != '' && !cValidate.isIdCard(ids)) {
                this.showToast('请输入正确的身份证号');
                return false;
            }

            if(ids == '') return;

            userInfo = this._getIdsInfo(ids);

            if(userInfo.sex == 1) {
                this.$sex.html('男');
            } else {
                this.$sex.html('女');
            }
            this.$age.html(userInfo.age);

        },

        _getIdsInfo: function (ids) {
            var UUserCard = ids;
            var data = {};

            UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" + UUserCard.substring(12, 14);
            if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
                data.sex = 1;
            } else {
                data.sex = 2;
            }
            var myDate = new Date();
            var month = myDate.getMonth() + 1;
            var day = myDate.getDate();
            var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
            if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
                age++;
            }
            data.age = age;

            return data;
        },

        //获取发布1中所有的请求参数
        getPostParam: function () {

            var param = {};
            var userInfo;

            param.patientName = this.$name.val();

            if(param.patientName == '') {
                this.showToast('请输入患者姓名');
                return false;
            }

            param.patientPhone = this.$tel.val();

            if(!cValidate.isMobile(param.patientPhone)) {
                this.showToast('请输入正确的手机号');
                return false;
            }

            param.patientIDNo = this.$ids.val();

            if(!cValidate.isIdCard(param.patientIDNo)) {
                this.showToast('请输入正确的身份证号');
                return false;
            }

            userInfo = this._getIdsInfo(param.patientIDNo);

            //再设置
            param.patientAge = userInfo.age;
            param.patientGender = userInfo.sex;

            param.symptomsType = this.$type.val();

            if(param.symptomsType == '') {
                this.showToast('请输入病症类型');
                return false;
            }

            param.symptomsDesc = this.$desc.val();

            if(param.symptomsDesc == '') {
                this.showToast('请输入病症说明');
                return false;
            }

            param.images = this.getPicids();

            return param;
        },

        //初始化七牛配置
        initQiniuSetting: function () {
            var scope = this;
            this.qiniuModel.setParam({
                isPublic: 1,
                bucket: 'transform',
                isWatermark: 0

            });
            this.qiniuModel.execute(function (data) {
                scope.uploadSet(data.uptoken, data.domain)
            });
        },

        uploadSet: function (uptoken, domain) {
            var scope = this;
            var uploader = Qiniu.uploader({

                filters: {
                    mime_types : [ //只允许上传图片和zip文件
                        { title : "Image files", extensions : "jpg,gif,png,bmp,jpeg" },
                    ],
                    prevent_duplicates : false //不允许选取重复文件
                },
                unique_names: true,
                runtimes: 'html5,flash,html4',
                browse_button: 'pickfiles',
                container: 'container',
                drop_element: 'container',
                max_file_size: '1000mb',
                flash_swf_url: 'bower_components/plupload/js/Moxie.swf',
                dragdrop: true,
                chunk_size: '4mb',

                uptoken: uptoken,
                domain: domain,

                // domain: "domain",
                // uptoken_url: "/token/qiniu?isPublic=1&isWatermark=0&bucket=avatar",
                // uptoken_bucket: "avatar",
                // uptoken_bucketL: "avatar",

                get_new_uptoken: false,
                auto_start: true,
                log_level: 5,
                init: {
                    'FilesAdded': function(up, files) {
                        scope.preUpload(up, files);
                    },
                    'BeforeUpload': function(up, file) {
                    },
                    'UploadProgress': function(up, file) {
                        // scope.onUpdating(up, file);
                    },
                    'UploadComplete': function() {
                    },
                    'FileUploaded': function(up, file, info) {
                        scope.afterUpload(up, file, info);
                    },
                    'Error': function(up, err, errTip) {
                        scope.errrUpload(up, err, errTip);
                    }
                }
            });
        },

        //上传前,这里需要判断上传的是不是图片
        preUpload: function (up, files) {
            //这里应该使用模块化的做法
            var item = [
                '<li class="js-pic-item js-cur-item progress-wrap">',
                '<div class="progress"><div class="rect1">&nbsp;</div><div class="rect2">&nbsp;</div><div class="rect3">&nbsp;</div><div class="rect4">&nbsp;</div><div class="rect5">&nbsp;</div></div>',
                '</li>'
            ].join('');

            var el = $(item);
            this.curUpPic = el;

            //获取当前第一个元素
            el.insertBefore(this.$addBtn);
            this.setAddBtnStatus();

        },

        isImage: function(url) {
            var res, suffix = "";
            var imageSuffixes = ["png", "jpg", "jpeg", "gif", "bmp"];
            var suffixMatch = /\.([a-zA-Z0-9]+)(\?|\@|$)/;

            if (!url || !suffixMatch.test(url)) {
                return false;
            }
            res = suffixMatch.exec(url);
            suffix = res[1].toLowerCase();
            for (var i = 0, l = imageSuffixes.length; i < l; i++) {
                if (suffix === imageSuffixes[i]) {
                    return true;
                }
            }
            return false;
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


            var item = [
                '<img src="' + url + '" alt="">',
                '<span class="icon-input-clear js-remove-pic"><i class="icon-cross"></i></span>',
            ].join('');

            this.curUpPic.attr('data-id', url);

            var tmpImg = $(new Image());
            tmpImg.on('load', function () {
                scope.curUpPic.html(item);
                scope.curUpPic = null;
            }).attr('src', url);

        },

        picRemoveAction: function (e) {
            var el = $(e.currentTarget);
            el.parent().remove();
            this.setAddBtnStatus();

        },

        setAddBtnStatus: function () {

            if(this.$picList.find('.js-pic-item').size() == this.maxSize) {
                this.$addBtn.hide();
                return;
            }
            this.$addBtn.show();

        },

        //上传失败
        errrUpload: function (up, err, errTip) {
            var s = '';
            this.showToast(errTip);
            if(this.curUpPic) this.curUpPic.remove();
            this.curUpPic = null;
            this.setAddBtnStatus();

        },

        getPicids: function () {
            var els = this.$picList.find('.js-pic-item');
            var arr = [];

            for(var i = 0, len = els.length; i < len; i++){
                arr.push(els.eq(i).attr('data-id'));
            }

            return arr;

        },

        //渲染页面
        renderBody: function () {
            if(!_.getUrlParam().id) {
                this.showToast('网页参数丢失,请返回首页');
                this.back('index');
            }

            var scope = this;
            var id = _.getUrlParam().id;
            var doctorId = _.getUrlParam().docId;

            if(!doctorId) doctorId = this.USERINFO.userId;

            if(!id) return;

            this.detailModel.urlParam = {
                doctorId: doctorId,
                // doctorId: 188,
                orderId: id,
            };

            this.showLoading();
            this.detailModel.execute(function (data) {
                var html = scope.renderTpl(layoutHtml, data );
                scope.$el.html(html);
                scope.initElement();
                scope.initQiniuSetting();
            });


        },

        addEvent: function () {
            this.on('onShow', function () {
                this.renderBody();
            });

            this.on('onHide', function () {

            });
        }

    });

});
