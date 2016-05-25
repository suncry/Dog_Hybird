/**
 * @fileoverview  输入框增加"X",删除按钮，并绑定事件
 * @author Zhao Li
 * @vision 1.0.0
 * @param  opt {object}
 *          {
 *              $parentWrapper: $('body'), //在哪个父框的下面筛选需要绑定事件的控件,默认是body
                inputStr: 'input[type=text]' //给什么控件绑定事件
 *          }
 * @example
 *    require([
 *      '../../pages/demo1/inputValDelete'
 *    ], function (input) {
 *      input();
 *    })
 */
define([
    'text!TransPath/demo1/input.css'
], function (Style) {

    function InputValDelete (setting) {
        /**
         * 用了框架以下加载css方法会删除
         * @type {*|jQuery|HTMLElement}
         */
        var style = $('<style type="text/css">' + Style + '</style>');
        $('head').append(style);

        this.option = $.extend({
            $parentWrapper: $('body'),
            inputStr: 'input[type=text]'
        }, setting);

        this.$inputArr = this.option.$parentWrapper.find(this.option.inputStr);

        /**
         * 给需要绑定事件的控件以及parent增加特定样式，以及增加和获取删除按钮
         */
        this.addDeleteElement();
        /**
         * 给输入框输入绑定事件
         */
        this.bindInputEvt();
        /**
         * 给删除按钮绑定事件
         */
        this.bindDeleteEvt();


    }

    InputValDelete.prototype.addDeleteElement = function () {
        var that = this,
            deleteStr = '<i class="close js-input-delete">×</i>',
            $parent;
        if (that.$inputArr.length) {
            $.each(that.$inputArr, function (i, e) {
                $parent = $(e).parent();
                $parent.addClass('v');
                $parent.append(deleteStr);
            });
        }
        that.$deleteBtnArr = that.option.$parentWrapper.find('.js-input-delete');
    };

    InputValDelete.prototype.bindInputEvt = function () {
        this.$inputArr.on('input', function () {
            var $this = $(this),
                $parent = $this.parent();
            if ($this.val().length) {
                $parent.addClass('current');
            } else {
                $parent.removeClass('current');
            }
        });
    };

    InputValDelete.prototype.bindDeleteEvt = function () {
        var that = this;
        that.$deleteBtnArr.on('click', function () {
            var $this = $(this),
                $parent = $this.parent(),
                $input = $parent.find(that.option.inputStr);
            $input.val('');
            $parent.removeClass('current');
        });
    };

    return function (opt) {
        return new InputValDelete(opt);
    }


});