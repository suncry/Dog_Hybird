define(['ModuleView', 'cValidate'], function (ModuleView, cValidate) {

    return _.inherit(ModuleView, {

        //此处若是要使用model，处实例化时候一定要保证entity的存在，如果不存在便是业务BUG
        initData: function () {

            this.events = {
                'blur .js-ids': 'setUserInfo'
            };

            //当前正在上传的图片dom结构
            this.curUpPic = null;

        },

        //当用户获取
        setUserInfo: function () {

            var ids = _.removeAllSpace(this.$ids.val());
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

        getUserInfo: function () {
            var param = {};

            param.patientIDNo = _.removeAllSpace(this.$ids.val());

            if(!cValidate.isIdCard(param.patientIDNo)) {
                this.showToast('请输入正确的身份证号');
                return false;
            }

            var userInfo = this._getIdsInfo(param.patientIDNo);

            //再设置
            param.patientAge = userInfo.age;
            param.patientGender = userInfo.sex;

            return param;
        },

        initElement: function () {

            this.$ids = this.$('.js-ids');
            this.$sex = this.$('.js-sex');
            this.$age = this.$('.js-age');

        }

    });

});
