define(['ModuleView', 'TransModel', 'qiniu'], function (ModuleView, TransModel, Qiniu) {

    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.events = {
                'click .js-remove-pic': 'picRemoveAction'
            };

            //当前正在上传的图片dom结构
            this.curUpPic = null;

            //最多上传数
            this.maxSize = 5;

            this.qiniuModel = TransModel.QiniuModel.getInstance();

            //初始化七牛数据
            this.initQiniuData();

        },

        picRemoveAction: function (e) {
            var el = $(e.currentTarget);
            el.parent().remove();
            this.setAddBtnStatus();

        },

        changed: function () {
        },

        initQiniuData: function () {
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
            mOxie.Mime.addMimeType("image/*,png jpg jpeg bmp");
            var uploader = Qiniu.uploader({

                filters: {
                    mime_types : [ //只允许上传图片和zip文件
                        { title : "Image files", extensions : "png,jpg,jpeg,bmp" },
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
                multi_selection: false,
                uptoken: uptoken,
                domain: domain,
                resize: {
                    quality: 30
                },
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
            
            this.showLoading();
            
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
            this.curUpPic.attr('data-url', url);

            var tmpImg = $(new Image());
            tmpImg.on('load', function () {
                scope.curUpPic.html(item);
                scope.curUpPic = null;
                scope.hideLoading();

            }).on('error', function () {
                scope.hideLoading();
            }).attr('src', url);

        },

        picRemoveAction: function (e) {
            var el = $(e.currentTarget);
            el.parent().remove();
            this.setAddBtnStatus();

        },

        setAddBtnStatus: function () {

            var size = this.$picList.find('.js-pic-item').size();
            this.$picSize.html(size);

            if(size == this.maxSize) {
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
                arr.push({fileId: els.eq(i).attr('data-id'), fileUrl: els.eq(i).attr('data-url')});
            }
            return arr;
        },

        initElement: function () {
            this.$picList = this.$('.js-pic-list');
            this.$addBtn = this.$('.js-add');
            this.$picSize = this.$('.js-pics-size');

        }

    });

});
