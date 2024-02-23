jQuery.Class('App', {
    stateTitle: null,
    linkBeforeAjax: 'App.Link.BeforeAjax',
    linkAfterAjax: 'App.Link.AfterAjax',
    formBeforeSubmit: 'App.Form.BeforeSubmit',
    formAfterSubmit: 'App.Form.AfterSubmit',
    formAfterSubmitFail: 'App.Form.AfterSubmitFail',
    // 一开始是否要初始化select2
    initSelect2: 'app.yes',

    loadPageOneCallback: function () {
        if (typeof loadPageOneCallback == 'function') {
            loadPageOneCallback();
            loadPageOneCallback = null;
        }
    },

    loadAjaxPageTarget: function (target, url, params, changeUrl = true) {
        var dtd = jQuery.Deferred();

        var targetElement = jQuery(target);

        if (targetElement.length <= 0) {
            dtd.reject(); //失败
            return false;
        }

        var settings = {
            title: false,
            ajaxData: {}
        };
        if (typeof params == 'string') {
            settings.title = params;
        } else if (typeof params == 'object') {
            settings = jQuery.extend(settings, params);
        }

        if (settings.title && changeUrl) {
            var state = {
                title: settings.title + " | " + App.stateTitle
            };
            try {
                window.history.pushState(state, state.title, url);
                document.title = state.title;
            } catch (e) {
            }
        }
        // var top = targetElement.offset().top;
        targetElement.data('ajax-url', url);
        if (settings.progressing == 'top') {
            Helper.pageProgressing();
        } else {
            targetElement.showProcessing();
        }
        targetElement.removeClass("animated").removeClass('fadeIn');
        targetElement.load(url, settings.ajaxData, function (response, status, xhr) {
            try {
                var data = eval('(' + response + ')');
                if (data.success && data.success == '#login') {
                    App.loadAjaxPageTarget('#containerBody', webUrl + '/login.html', {
                        title: 'Login',
                        ajaxData: {
                            return_url: data.data.return_url
                        }
                    });

                    dtd.reject(); //失败
                }
            } catch (e) {

            }
            if (settings.progressing == 'top') {
                //jQuery('.header .nav.TopTools a[data-ajax="true"]').on(App.linkAfterAjax, function (e) {
                jQuery('html').animate({scrollTop: 0}, 300);
                // });
                Helper.pageHideProgressing();
            } else {
                targetElement.removeClass('loading-parent');
            }
            if (status == 'error') {
                dtd.reject(); //失败
            } else {
                if (settings.progressing != 'top')
                    targetElement.addClass("animated").addClass('fadeIn');
                // $("html,body").animate({scrollTop: top}, 500);
                Helper.select2(jQuery('select, .select2'));

                App.loadPageOneCallback();

                dtd.resolve(); //已经完成
            }
        });

        return dtd.promise();
    },

    registerLocationSelectEvent: function (countryElement, stateElement, cityElement) {
        if (typeof countryElement == 'string')
            countryElement = jQuery(countryElement);
        if (typeof stateElement == 'string')
            stateElement = jQuery(stateElement);
        if (typeof cityElement == 'string')
            cityElement = jQuery(cityElement);

        if (!countryElement || countryElement.length <= 0 || !stateElement || stateElement.length <= 0)
            return false;

        countryElement.change(function () {
            var parent_id = jQuery(this).val();
            jQuery.post(webUrl + '/location.html', {parent_id: parent_id}, function (result) {
                stateElement.empty();
                if (result.success && result.data.length > 0) {
                    var state_id = stateElement.attr('data-value');
                    jQuery.each(result.data, function (i, row) {
                        if (state_id == row.id) {
                            stateElement.append('<option value="' + row.id + '" selected="selected">' + row.name + '</option>');
                        } else {
                            stateElement.append('<option value="' + row.id + '">' + row.name + '</option>');
                        }
                    });
                    Helper.select2(stateElement);
                    stateElement.trigger('change');
                }
            }, 'json');
        });
        countryElement.trigger('change');

        if (!cityElement || cityElement.length <= 0)
            return false;

        stateElement.change(function () {
            var parent_id = jQuery(this).val();
            jQuery.post(webUrl + '/location.html', {parent_id: parent_id}, function (result) {
                cityElement.empty();
                if (result.success && result.data.length > 0) {
                    var city_id = cityElement.attr('data-value');
                    jQuery.each(result.data, function (i, row) {
                        if (city_id == row.id) {
                            cityElement.append('<option value="' + row.id + '" selected="selected">' + row.name + '</option>');
                        } else {
                            cityElement.append('<option value="' + row.id + '">' + row.name + '</option>');
                        }
                    });
                    Helper.select2(cityElement);
                }
            }, 'json');
        });

    },

    webShowDateTimePickerElementView: function (datetimeElement, params, data) {
        if (typeof params == 'string') {
            if (typeof data == 'undefined') {
                datetimeElement.datetimepicker(params);
            } else {
                datetimeElement.datetimepicker(params, data);
            }
        } else {
            if (typeof params == 'undefined')
                params = {};

            params = jQuery.extend({
                language: lang,
                minView: 2,
                step: 1,
                autoclose: true,
                todayBtn: true,
                keyboardNavigation: true,
                todayHighlight: true,
                format: 'yyyy-mm-dd'
            }, params);

            datetimeElement.datetimepicker(params);
        }
    }

}, {
    registerLinkClickEvent: function () {
        jQuery('body').on('click', 'a[data-ajax="true"]', function (e) {
            e.preventDefault();

            var element = jQuery(this);
            var url = jQuery(this).attr('href');
            var target = jQuery(this).attr('data-ajax-target');
            var progressing = jQuery(this).attr('data-ajax-progressing');
            var changeUrl = eval(jQuery(this).attr('data-ajax-changeUrl'));

            if (target == 'post') {
                jQuery('body').showProcessing();

                jQuery.post(url, function (result) {
                    jQuery('body').hideProcessing();
                    if (result.success) {
                        var linkAfterAjaxEvent = jQuery.Event(App.linkAfterAjax);
                        element.trigger(linkAfterAjaxEvent, result);
                    } else {
                        if (result.message) {
                            Helper.errorMsg(result.message);
                        } else {
                            Helper.errorMsg($.i18n.map['submit fail']);
                        }
                    }
                }, 'json');
            } else if (target != undefined || target != '') {

                var linkBeforeAjaxEvent = jQuery.Event(App.linkBeforeAjax);
                element.trigger(linkBeforeAjaxEvent);

                if (element.data('ajax-valid-false')) {
                    element.data('ajax-valid-false', false);
                    return false;
                }

                var params = {
                    progressing: progressing,
                    title: element.text(),
                };
                if (element.data('ajax-params')) {
                    if (typeof element.data('ajax-params') == 'object') {
                        params = jQuery.extend(params, element.data('ajax-params'));
                    }
                }

                App.loadAjaxPageTarget(target, url, params, changeUrl).done(function () {
                    var linkAfterAjaxEvent = jQuery.Event(App.linkAfterAjax);
                    element.trigger(linkAfterAjaxEvent);
                });
            }
        });
    },

    registerNavEvents: function () {
        //二级导航
        jQuery('body').on(App.linkBeforeAjax, '.banner-top-nav li a', function () {
            var element = jQuery(this);

            var ajaxLayout = 2;

            element.data('ajax-params', {
                ajaxData: {
                    ajaxLayout: ajaxLayout
                }
            });
        });
        jQuery('body').on(App.linkAfterAjax, '.banner-top-nav li a', function () {
            jQuery(this).parent().parent().find('.banner-btn-active').removeClass('banner-btn-active');
            jQuery(this).addClass('banner-btn-active');
        });

        //三级导航
        jQuery('body').on(App.linkBeforeAjax, '.subcategory-bg li a', function () {
            var element = jQuery(this);

            var ajaxLayout = 3;

            element.data('ajax-params', {
                ajaxData: {
                    ajaxLayout: ajaxLayout
                }
            });
        });
        jQuery('body').on(App.linkAfterAjax, '.subcategory-bg li a', function () {
            //jQuery('.product-bg .subcategory-bg li a.category-btn-active').removeClass('category-btn-active');
            jQuery(this).parent().parent().find('li a.category-btn-active').removeClass('category-btn-active');
            jQuery(this).addClass('category-btn-active');
        });

        //移动端导航
        jQuery(".menubtnwrapper").click(function () {
            jQuery(this).toggleClass("active");
            jQuery("body").toggleClass("gn-list-active");
        });


    },

    registerSearchFaqFormEvents: function () {

        jQuery('body').on('click', '#searchFaqForm .subcategory-search .icon-search_line', function (e) {
            jQuery('#searchFaqForm').submit();
        });

        jQuery('body').on('submit', '#searchFaqForm', function (e) {
            e.preventDefault();

            var params = jQuery(this).serialize();
            //var url = jQuery('#faqList').data('ajax-url');
            //if (typeof url == 'undefined') {
            var url = jQuery('#supportContent .subcategory-category li  a.category-btn-active').attr('href')
            //}

            url = Helper.joinUrlParams(url, params);
            App.loadAjaxPageTarget('#faqList', url, 'Search FAQ');
        });

        jQuery('body').on('click', '#supportContent .subcategory-category li a', function (e) {
            e.preventDefault();

            var form = jQuery('#searchFaqForm');
            var url = jQuery(this).attr('href');
            var product_category = jQuery('[name="product_category"]', form).val();
            var product_id = jQuery('[name="product_id"]', form).val();
            var keyword = jQuery('[name="keyword"]', form).val();
            if (product_category != 0 || product_id != 0 || keyword != '') {
                var params = form.serialize();
                url = Helper.joinUrlParams(url, params);
            }

            jQuery(this).parent().parent().find('a.category-btn-active').removeClass('category-btn-active');
            jQuery(this).addClass('category-btn-active');

            App.loadAjaxPageTarget('#faqList', url, 'Search FAQ');
        });
    },

    registerSearchDownloadFormEvents: function () {
        jQuery('body').on('click', '#searchDownloadForm .subcategory-search .icon-search_line', function (e) {
            jQuery('#searchDownloadForm').submit();
        });

        jQuery('body').on('submit', '#searchDownloadForm', function (e) {
            e.preventDefault();

            var params = jQuery(this).serialize();
            var url = jQuery('#downloadList').data('ajax-url');
            if (typeof url == 'undefined') {
                url = jQuery('.support-download-banner .banner-top-nav li  a.banner-btn-active').attr('href')
            }
            url = url.replace('download/entries/index', 'download/entries/list');

            url = Helper.joinUrlParams(url, params);
            App.loadAjaxPageTarget('#downloadList', url, {
                title: 'Search Download',
                ajaxData: {
                    search: true
                }
            });
        });
    },

    registerSolutionLinkEvent: function () {
        jQuery('body').on(App.linkBeforeAjax, '.solution-security-list .solution-info-list .solution-info-item a', function (e) {
            var element = jQuery(this);

            element.data('ajax-params', {
                ajaxData: {
                    ajaxLayout: 1
                }
            });
        });
    },

    registerAjaxFormSubmitEvent: function (formElement) {
        if (typeof formElement == 'string') {
            formElement = jQuery(formElement);
        }

        /**
         * 由于可能生成多个textarea，所以用id去编辑textarea就不合适了。
         * https://www.anviz.com/
         * 其他页面的textarea统计数字功能依然能正常使用
         */
        jQuery(formElement).on('keyup', 'textarea', function () {
            var word_length = jQuery(this).val().length;
            var target_span_element = jQuery(this).next('div.words-num').find('span.textarea-words');
            if (target_span_element.length > 0) {
                target_span_element.text(' ' + word_length + ' ');
            }
        });

        formElement.submit(function (e) {
            e.preventDefault();
            if (typeof formElement.data('submit') != 'undefined') {
                return false;
            } else {
                formElement.data('submit', true);

                //表单提交之前
                var beforeSubmitEvent = jQuery.Event(App.formBeforeSubmit);
                formElement.trigger(beforeSubmitEvent);
                if (beforeSubmitEvent.isDefaultPrevented()) {
                    if (beforeSubmitEvent.result == false) {
                        formElement.removeData('submit');
                        jQuery('[type="submit"]', formElement).removeClass('btn-loading');
                        jQuery('[type="submit"]', formElement).removeAttr('disabled');

                        //有些提交按钮，有自己的信息，而不是显示"submit"
                        var submit_label = jQuery('[type="submit"]', formElement).attr('data-submit-key');
                        if (Helper.isEmpty(submit_label)) {
                            jQuery('[type="submit"]', formElement).text($.i18n.map['Submit']);
                            jQuery('[type="submit"]', formElement).val($.i18n.map['Submit']);
                        } else {
                            jQuery('[type="submit"]', formElement).text($.i18n.map[submit_label]);
                            jQuery('[type="submit"]', formElement).val($.i18n.map[submit_label]);
                        }

                        return false;
                    }
                }

                //表单提交之后
                var afterSubmitEvent = jQuery.Event(App.formAfterSubmit);
                var afterSubmitFailEvent = jQuery.Event(App.formAfterSubmitFail);
                var options = {
                    dataType: 'json',
                    success: function (responseText, statusText, xhr, form) {
                        formElement.hideProcessing();
                        formElement.removeData('submit');
                        if (responseText.success == false) {
                            formElement.trigger(afterSubmitFailEvent, responseText);
                            formElement.showError(responseText.data, responseText.message);
                        } else {
                            formElement.trigger(afterSubmitEvent, responseText);
                        }

                        //不管返回的response是true还是false，只要有返回，都要重置submit按钮
                        jQuery('[type="submit"]', form).removeClass('btn-loading');

                        //有些提交按钮，有自己的信息，而不是显示"submit"
                        var submit_label = jQuery('[type="submit"]', formElement).attr('data-submit-key');
                        if (Helper.isEmpty(submit_label)) {
                            jQuery('[type="submit"]', formElement).text($.i18n.map['Submit']);
                            jQuery('[type="submit"]', formElement).val($.i18n.map['Submit']);
                        } else {
                            jQuery('[type="submit"]', formElement).text($.i18n.map[submit_label]);
                            jQuery('[type="submit"]', formElement).val($.i18n.map[submit_label]);
                        }
                        jQuery('[type="submit"]', formElement).removeAttr('disabled');

                        //刷新验证码
                        jQuery('#yw0').trigger('click');
                    },
                    error: function () {
                        formElement.hideProcessing();
                        formElement.removeData('submit');
                    }
                };

                options.beforeSerialize = function () {
                    try {
                        for (instance in CKEDITOR.instances) {
                            CKEDITOR.instances[instance].updateElement();
                        }
                    } catch (e) {
                    }
                };
                formElement.showError('hide');
                formElement.showProcessing();
                formElement.ajaxSubmit(options);
            }
        });
    },

    registerBasicEvents: function () {
        App.loadPageOneCallback();

        this.registerSolutionLinkEvent();
    },

    registerEvents: function () {
        App.stateTitle = document.title;

        window.addEventListener('popstate', function (evt) {
            if (window.location.href.indexOf('#product') > 0) {

            } else {
                // window.location.reload();
            }
        }, false)

        if (App.initSelect2 == 'app.yes') {
            Helper.select2(jQuery('select, .select2'));
        }

        this.registerNavEvents();
        this.registerLinkClickEvent();

        //FAQ
        // this.registerSearchFaqFormEvents();
        //Download
        // this.registerSearchDownloadFormEvents();
        this.registerBasicEvents();
    }
});

//loadingToggle  是否加载中： true,加载中; false,加载完成
//这个参数很多地方用到，比如news，product，所以，不能移到product或者news里面
var loadingToggle = true;
jQuery.Class('Register', {
    app: function () {
        if (typeof AppInstance == 'undefined') {
            AppInstance = new App();
        }

        return AppInstance;
    },

    ErrorPageEvent: function () {
        var t;
        var func = function () {
            var s = parseInt(jQuery('#errorSecond').text());
            if (s <= 1) {
                location.href = webUrl;
            } else {
                jQuery('#errorSecond').text(s - 1);
                setTimeout(func, 1000);
            }
        };
        setTimeout(func, 1000);
    },

    Layout: function () {
        AOS.init();
    },

    Index: function () {

    },

    LoginForm: function () {
        var thisInstance = this;
        var app = thisInstance.app();

        var form = jQuery('#LoginFormWin');

        form.on(App.formBeforeSubmit, function () {
            if (jQuery('[name="email"]', form).val() == '') {
                form.showError('email', $.i18n.map['email not null']);
                return false;
            }
            return true;
        });

        form.on(App.formAfterSubmit, function (e, result) {
            Helper.successMsg($.i18n.map['login successfully']).done(function () {
                if (result.data.return_url) {
                    window.location.href = result.data.return_url;
                } else {
                    window.location.href = webUrl + '/account/information.html';
                }
            });
        });

        app.registerAjaxFormSubmitEvent(form);
    },

    RegisterForm: function () {
        var thisInstance = this;
        var app = thisInstance.app();

        var form = jQuery('#RegisterFormWin');

        /*toggle checkbox class*/
        $('.checkbox-warp').on('click', 'input[type="checkbox"]', function () {
            $(this).parents('.checkbox-warp').toggleClass('checked');
        });

        if (form.length > 0) {
            App.registerLocationSelectEvent(jQuery('[name="country_id"]', form), jQuery('[name="state_id"]', form), jQuery('[name="city_id"]', form));

            form.on(App.formBeforeSubmit, function (result) {
                var checkboxElement = jQuery('#register_Agreement');
                var isChecked = checkboxElement.prop('checked');
                if (!isChecked) {
                    Helper.errorMsg($.i18n.map['register.error.agreement']);
                    return false;
                }
            });

            form.on(App.formAfterSubmit, function (result) {
                App.loadAjaxPageTarget('#containerBody', webUrl + '/register/success.html?email=' + jQuery('[name="email"]', form).val());
            });

            app.registerAjaxFormSubmitEvent(form);

        }

        //文本框、密码框获得焦点事件：删除错误提示
        jQuery('input[type="email"],input[type="text"],input[type="password"]', form).each(function () {
            jQuery(this).focus(function () {
                jQuery(this).parents('.form-group').removeClass('has-error');
                jQuery('span', jQuery(this).parents('.form-group')).remove();
            });
        });

        //获取验证码
        $('#captchaBtn').click(function () {
            //发送验证码
            var emailElement = jQuery('input[name="email"]', form);
            var email = emailElement.val();

            //邮箱不能为空
            if (Helper.isEmpty(email)) {
                emailElement.parent('div').addClass('has-error');
                if (emailElement.parent('div').children('span').length == 0) {
                    emailElement.parent('div').append('<span class="help-block">' + $.i18n.map['email not null'] + '</span>');
                }
                return false;
            }
            //邮箱格式必须正确
            if (!Helper.isEmail(email)) {
                emailElement.parent('div').addClass('has-error');
                if (emailElement.parent('div').children('span').length == 0) {
                    emailElement.parent('div').append('<span class="help-block">' + $.i18n.map['enter right email'] + '</span>');
                }
                return false;
            }

            //可以发送验证码到客户的email了
            var url = webUrl + '/register/sendCode.html';
            var data = {email: email};

            $.post(url, data, function (responseText) {
                if (responseText.success == false) {
                    //获取验证码失败，在字段边上显示错误提示
                    form.showError(responseText.data, responseText.message);
                } else {
                    //获取验证码成功，提示客户去邮箱获取验证码
                    Helper.successMsg($.i18n.map['get verification code successfully']);
                }
            }, 'json');

            //获取验证码，需要１分钟之后，才可以重新获取验证码
            $(this).attr('disabled', 'disabled');
            var totalTime = 60;
            $(this).html(totalTime + 's');

            //定时器60秒
            function getCaptcha() {
                setTimeout(function () {
                    $('#captchaBtn').html(totalTime + 's');
                    if (totalTime > 0) {
                        getCaptcha();
                    } else {
                        $('#captchaBtn').html('Verify');
                        $('#captchaBtn').removeAttr('disabled');
                    }
                }, 1000)
                totalTime--;
            }

            getCaptcha();
        });
    },

    ForgotForm: function () {
        var thisInstance = this;
        var app = thisInstance.app();

        var form1 = jQuery('#ForgotEmailForm');
        var form2 = jQuery('#ForgotCodeForm');
        var form3 = jQuery('#ForgotPasswordForm');

        var your_email = '';

        //表单1
        //验证email不能为空
        form1.on(App.formBeforeSubmit, function () {
            your_email = jQuery('[name="email"]', form1).val();
            if (Helper.isEmpty(your_email)) {
                form1.showError('email', $.i18n.map['email not null']);
                return false;
            }

            if (!Helper.isEmail(your_email)) {
                form1.showError('email', $.i18n.map['forgot page, enter right email']);
                return false;
            }
            return true;
        });
        //顺利通过之后，隐藏form1，显示form2
        form1.on(App.formAfterSubmit, function (e, result) {
            form1[0].reset();
            if (result.success == true) {
                jQuery('#your_email').text(Helper.encryptedMailBox(your_email));
                jQuery('[name="email"]', form2).val(your_email);
                form1.parents('li').removeClass('active').addClass('hide');
                form2.parents('li').removeClass('hide').addClass('active');
            }
        });

        //表单2
        //验证code不能为空
        form2.on(App.formBeforeSubmit, function () {
            if (jQuery('[name="code"]', form2).val() == '') {
                form2.showError('code', $.i18n.map['code not null']);
                return false;
            }
            return true;
        });
        //顺利通过之后，隐藏form2，显示form3
        var your_code = '';
        form2.on(App.formAfterSubmit, function (e, result) {
            your_code = jQuery('[name="code"]', form2).val();
            form2[0].reset();
            if (result.success == true) {
                jQuery('[name="email"]', form3).val(your_email);
                jQuery('[name="code"]', form3).val(your_code);
                form2.parents('li').removeClass('active').addClass('hide');
                form3.parents('li').removeClass('hide').addClass('active');
            }
        });

        //表单3
        //密码不能为空，两次密码必须一致
        form3.on(App.formBeforeSubmit, function () {
            var password = jQuery('[name="password"]', form3).val();
            var re_password = jQuery('[name="re_password"]', form3).val();
            if (password == '') {
                form3.showError('password', $.i18n.map['password not null']);
                return false;
            }

            if (password != re_password) {
                form3.showError('re_password', $.i18n.map['enter the same password']);
                return false;
            }

            return true;
        });
        form3.on(App.formAfterSubmit, function (e, result) {
            //修改密码成功，隐藏form3，显示第4个内容
            if (result.success == true) {
                form3.parents('li').removeClass('active').addClass('hide');
                form3.parents('li').next('li').removeClass('hide').addClass('active');
            }
        });

        app.registerAjaxFormSubmitEvent(form1);
        app.registerAjaxFormSubmitEvent(form2);
        app.registerAjaxFormSubmitEvent(form3);

        //文本框、密码框获得焦点事件：删除错误提示
        jQuery('input[type="email"],input[type="text"],input[type="password"]', 'ul.steps').each(function () {
            jQuery(this).focus(function () {
                jQuery(this).parents('.form-group').removeClass('has-error');
                jQuery('span', jQuery(this).parents('.form-group')).remove();
            });
        });
        jQuery('#back_btn').on('click', function () {
            form2.parents('li').removeClass('active').addClass('hide');
            form1.parents('li').removeClass('hide').addClass('active');
        });
    },

    PasswordForm: function () {
        var thisInstance = this;
        var app = thisInstance.app();

        var form = jQuery('#PasswordForm');

        form.on(App.formBeforeSubmit, function () {
            form.showError('hide');
            if (jQuery('[name="old_password"]', form).val() == '') {
                form.showError('old_password', $.i18n.map['password.error.old_password']);
                return false;
            }
            if (jQuery('[name="password"]', form).val() == '') {
                form.showError('password', $.i18n.map['password.error.password']);
                return false;
            }
            if (jQuery('[name="confirm_password"]', form).val() != jQuery('[name="password"]', form).val()) {
                form.showError('confirm_password', $.i18n.map['password.error.confirm_password']);
                return false;
            }
            return true;
        });

        form.on(App.formAfterSubmit, function (result) {
            Helper.successMsg($.i18n.map['password.success']);
            form[0].reset();
        });

        app.registerAjaxFormSubmitEvent(form);
    },

    AccountInformationForm: function () {
        var thisInstance = this;
        var app = thisInstance.app();

        var form = jQuery('#AccountInformationFormWin');

        App.registerLocationSelectEvent(jQuery('[name="country_id"]', form), jQuery('[name="state_id"]', form), jQuery('[name="city_id"]'));

        form.on(App.formBeforeSubmit, function () {
            form.showError('hide');

            return true;
        });

        form.on(App.formAfterSubmit, function (result) {
            Helper.successMsg($.i18n.map['update successfully']);
        });

        app.registerAjaxFormSubmitEvent(form);
    },

    NewsSearch: function () {
        var form = jQuery('#searchNewsForm');
        if (form.length <= 0)
            return false;

        form.submit(function (e) {
            e.preventDefault();

            var keyword = jQuery('input[name="keyword"]', form).val();

            var url = webUrl + '/news/entries.html?keyword=' + encodeURIComponent(keyword);

            App.loadAjaxPageTarget('#NewsList', url, {
                title: 'Search News'
            });
        });
    },

    NewsListRollLadd: function () {
        $(window).scroll(function () {
            //固定的 footer 高度
            var footerHeight = $("footer").height();

            //在footerHeight再往上100像素触发滚动加载
            if ($(document).scrollTop() + footerHeight + 100 > $(document).height() - $(window).height()) {
                if (loadingToggle == true) {
                    loadingToggle = false;
                    $('.load-more').removeClass('load-more-hide');
                    Register.NewsRollLoading(function () {
                        $('.load-more').addClass('load-more-hide');
                        loadingToggle = true;
                    });
                }
            }
        });
    },

    CasestudyListRollLadd: function () {
        $(window).scroll(function () {
            //固定的 footer 高度
            var footerHeight = $("footer").height();

            //在footerHeight再往上100像素触发滚动加载
            if ($(document).scrollTop() + footerHeight + 100 > $(document).height() - $(window).height()) {
                if (loadingToggle == true) {
                    loadingToggle = false;
                    $('.load-more').removeClass('load-more-hide');
                    Register.CasestudyRollLoading(function () {
                        $('.load-more').addClass('load-more-hide');
                        loadingToggle = true;
                    });
                }
            }
        });
    },

    DownloadListRollLadd: function () {
        $(window).scroll(function () {
            //固定的 footer 高度
            var footerHeight = $("footer").height();

            //在footerHeight再往上100像素触发滚动加载
            if ($(document).scrollTop() + footerHeight + 100 > $(document).height() - $(window).height()) {
                if (loadingToggle == true) {
                    loadingToggle = false;
                    $('.load-more').removeClass('load-more-hide');
                    Register.DownloadRollLoading(function () {
                        $('.load-more').addClass('load-more-hide');
                        loadingToggle = true;
                    });
                }
            }
        });
    },

    FaqListRollLadd: function () {
        $(window).scroll(function () {
            //固定的 footer 高度
            var footerHeight = $("footer").height();

            //在footerHeight再往上100像素触发滚动加载
            if ($(document).scrollTop() + footerHeight + 100 > $(document).height() - $(window).height()) {
                if (loadingToggle == true) {
                    loadingToggle = false;
                    $('.load-more').removeClass('load-more-hide');
                    Register.FaqRollLoading(function () {
                        $('.load-more').addClass('load-more-hide');
                        loadingToggle = true;
                    });
                }
            }
        });
    },

    MarketingListRollLadd: function () {
        $(window).scroll(function () {
            //固定的 footer 高度
            var footerHeight = $("footer").height();

            //在footerHeight再往上100像素触发滚动加载
            if ($(document).scrollTop() + footerHeight + 100 > $(document).height() - $(window).height()) {
                if (loadingToggle == true) {
                    loadingToggle = false;
                    $('.load-more').removeClass('load-more-hide');
                    Register.MarketingRollLoading(function () {
                        $('.load-more').addClass('load-more-hide');
                        loadingToggle = true;
                    });
                }
            }
        });
    },

    TechnologyTab: function () {
        $('.core-tab .core-nav .nav-item').hover(function () {
            var index = $(this).index();
            $(this).addClass('core-active').siblings().removeClass('core-active');
            $('.core-tab .core-content .core-item').eq(index).addClass('active').siblings().removeClass('active');
        });

        $(window).scroll(function () {
            var cur = $(this).scrollTop();
            var coreTab = $('.core-tab').offset().top;
            if (cur >= coreTab) {
                $('.core-tab').children('.core-nav').addClass('fiexd-core-nav');
            } else if (cur < coreTab) {
                $('.core-tab').children('.core-nav').removeClass('fiexd-core-nav');
            }
        })
    },

    AboutAnvizSwiper: function () {
        var mySwiper = new Swiper('.smarter-contaier', {
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 30,
            speed: 300,
            autoplay: {
                disableOnInteraction: false,
                delay: 3000
            },
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
        /*鼠标移入停止轮播，鼠标离开 继续轮播*/
        mySwiper.el.onmouseover = function () { //鼠标放上暂停轮播
            mySwiper.autoplay.stop();
        }
        mySwiper.el.onmouseleave = function () {
            mySwiper.autoplay.start();
        }

    },

    TopNav: function () {
        //顶部搜索栏,如果长度小于2，就不允许搜索,如：m5就可以搜索
        jQuery('#topSearchForm').submit(function (e) {
            var keyword = jQuery('[name="keyword"]', this).val();
            if (keyword.length < 2) {
                jQuery('.icon-search', this).showError('keyword', $.i18n.map['topNav.error.search']);
                return false;
            }
        });

        //用户中心 my-anviz 移动端导航
        jQuery(".fixed-menu .icon-menu").click(function () {
            jQuery("body").toggleClass("show-sidebar no-scroll");
        });
        jQuery('.full').click(function () {
            jQuery("body").removeClass("show-sidebar no-scroll");
        });
        //手机端点击左侧导航栏菜单按钮出现菜单栏
        $('.nav-content .js-content').mouseleave(function () {
            var index = $(this).attr('data-index');
            $('.nav-content .js-content').removeClass('active');
        });
        $('.js-header-item').on('click', '.menu-btn', function () {
            $(this).toggleClass('active-menu');
            $('header').toggleClass('mobile');
            $('body').toggleClass('no-scroll');
            $('html').toggleClass('ac-gn-noscroll');
            $('html').toggleClass('ac-gn-noscroll-long');
        });

        //窗口滚动超过35px时顶部导航栏fixed定位
        window.onscroll = function () {
            if ($(this).scrollTop() >= 35) {
                $(".product-nav").addClass("scroll-active")
            } else {
                $(".product-nav").removeClass("scroll-active")
            }
            ;
        };

        //浏览器窗口变化后需要做的事情
        window.onresize = function () {

            if ($(this).width() > 1240 && $(".menu-btn").hasClass('active-menu')) {
                $(".menu-btn").click();
            }
            if ($(this).width() <= 1240 && $(".product-nav").hasClass('show')) {
                $(".show>.search-form>.close").click();
            }
        };

        //导航栏鼠标移入去除border
        $(".product-nav").mouseover(function () {
            $(this).css("border", "none")
        });

        //判断页面有无class="rotation_chart"(即为判断有无轮播图)给content添加border
        if ($('.rotation_chart').length > 0) {
            $(".content").css({
                "border-top": "none"
            });
            $('.page-banner-info').css({
                'padding-top': '8%'
            });
            $(".content").removeClass('rotation_chart');
        } else {
            $("body > .content").css({
                "border-top": "55px solid #4a4a4a"
            })
        }
        ;

        //页面刷新时保持顶部导航栏状态
        window.onload = function () {
            if ($(this).scrollTop() >= 35) {
                $(".product-nav").addClass("scroll-active")
            } else {
                $(".product-nav").removeClass("scroll-active")
            }
            ;
        };

        //顶部导航栏语言切换
        $('.top-nav .language').click(function () {
            $(this).parents('.nav-series-list').toggleClass("language-active");
        });
        $('.series-pro-nav .language').hover(function () {
            $(this).toggleClass('mobile-hover');
        });

        //顶部导航栏搜索框点击X按钮关闭搜索框
        $(".search-bar, .search-form .close").click(function () {
            $(".product-nav").toggleClass("show");
            $(".product-nav .search-form form .search-input .form-control").val("")
        });

        //手机端导航栏SOLUTIONS和SUPPORT点击事件
        $(".support-nav").click(function () {
            $(this).toggleClass("mobile-hover").siblings().removeClass("mobile-hover");
            $(this).children(".sub-nav").toggleClass("sub-nav-select").parent().siblings().children(".sub-nav").removeClass("sub-nav-select");
        });
    },

    FooterNav: function () {
        // $('.other-box').hover(function () {
        //     $('.gtranlate-other-content').show();
        // },function () {
        //     $('.gtranlate-other-content').hide();
        // })
        /**
         * 因为一个页面可能有多个提交表单的form，如：
         * https://www.anviz.com/cloud-based-time-and-attendance-solution-crosschex-cloud.html?lang=en_us
         * 既有上面的订阅，也有底部的订阅
         */
        jQuery('.subscribeForm').each(function () {
            var form = jQuery(this);
            let type = form.data('subscribe');

            var inputElement = jQuery('input[name="subscribe_email"]', form);
            form.on(App.formBeforeSubmit, function () {
                var subscribe_email = inputElement.val();
                if (!Helper.isEmail(subscribe_email)) {
                    Helper.errorMsg($.i18n.map['enter right email']);
                    inputElement.parent('div').addClass('error');
                    return false;
                }
                jQuery('[type="submit"]', form).addClass('btn-loading');
            });

            form.on(App.formAfterSubmit, function () {
                var subscribe_email = inputElement.val();
                form[0].reset();
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                var url = webUrl + '/email/send/subscribe';
                var data = {email: subscribe_email,type:type};

                $.post(url, data, function (result) {
                    if (JSON.parse(result).success) {
                        console.log('send email to subscribe customer success!');
                    } else {
                        console.log('send email to subscribe customer fail!');
                    }
                });

                /**
                 * 订阅后，弹出消息：Thank You For Subscribing!
                 * 将消息x掉之后，根据form属性的值data-return_url跳转
                 */
                var return_url = form.attr('data-return_url');
                var return_message_key = form.attr('data-return_message_key');
                if (Helper.isEmpty(return_url)) {
                    Helper.successMsg($.i18n.map['subscribe successfully']);
                } else {
                    Helper.successMsg($.i18n.map[return_message_key]).done(function () {
                        window.location.href = return_url;
                    });
                }
            });
            inputElement.focus(function () {
                jQuery(this).parent('div').removeClass('error');
            });

            AppInstance.registerAjaxFormSubmitEvent(form);
        });
    },

    GetMediaDataUrl: function (url, posterPic) {
        var settings = {
            id: 'myModal'
        };

        var urlType = url.split(".").pop();
        var videoParent = jQuery('<video width="100%" height="auto" poster="' + posterPic + '" controls="controls"></video>');

        var videoMp4 = jQuery('<source src="' + url + '" type="video/mp4"></source>');
        var videoOgg = jQuery('<source src="' + url + '" type="video/ogg"></source>');
        var videoWebm = jQuery('<source src="' + url + '" type="video/webm"></source>');
        if (urlType == 'mp4' || urlType == 'html' ) {
            videoParent.append(videoMp4);
        } else if (urlType == 'ogg') {
            videoParent.append(videoOgg);
        } else if (urlType == 'webm') {
            videoParent.append(videoWebm);
        }

        if (jQuery('#' + settings.id).length <= 0) {
            var parent = jQuery('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="gridSystemModalLabel" id="' + settings.id + '">');
            var content = jQuery('<div class="modal-dialog" role="document"><div class="modal-content modal-video"><div class="modal-body"></div></div></div>');
            var bg = jQuery('<div class="modal-backdrop fade in"></div>');
            
            var closeBtn = jQuery('<button type="button" class="close video-close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

            content.append(closeBtn);
            content.append(videoParent);
            parent.append(content);
            $('body').append(bg)

            parent.appendTo(jQuery('body'));
        }
        ;
    },

    YoutobeVideo: function () {
        $('.opendivbtn').click(function () {
            $('.opendiv.video iframe').attr('src', $(this).attr('href'));
            $('.opendiv.video,.opendivmask').addClass('active');
            return false;
        })
        $('.opendivmask').click(function () {
            $('.opendiv.video iframe').attr('src', '');
            $('.opendiv.video,.opendivmask').removeClass('active');
        });
        $('.opendivmask').click(function () {
            $('.opendiv,.opendivmask').removeClass('active');
            $('html,body').css('overflow', 'auto');
        });
        $('.opendiv .closediv').click(function () {
            $('.opendivmask').trigger("click");
        });
    },

    ShowDataUrl: function () {
        //必须给 modal-url 添加 data-toggle="modal" data-target="#myModal" class="modal-url"  属性
        $('.modal-url').click(function () {
            var url = $(this).attr('data-url');
            var posterPic = $(this).attr('data-poster');

            Register.GetMediaDataUrl(url, posterPic);
        })
    },

    Once: function (flag) {
        if (flag) {
            Register.CutEmailName();
            flag = false;
        } else {
            return;
        }
    },

    CutEmailName: function () {
        var str = jQuery('.my-anviz-nav').find('header>h3').text();
        if (str.indexOf('@')) {
            var emailName = str.slice(0, str.indexOf('@'));
            jQuery('.my-anviz-nav header>h3').text(emailName);
        }
    },

    IsMobile: function () {
        if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
            return true;
        } else {
            return false;
        }
    },

    BindSeriesCompareTable: function () {
        $('.compare-download .item-warp:first-child').click(function () {
            $(this).toggleClass('active');
            $('.compare-table-sction').slideToggle('show');
        })
    },

    BindProductTagsNav: function () {

    },

    HomePage: function () {
        //tab
        $('.tab-nav li').hover(function () {
            var index = $(this).index();
            $(this).addClass('tab-nav-active').siblings().removeClass('tab-nav-active');

            $('.tab-content').children().eq(index).addClass('tab-content-active').siblings().removeClass('tab-content-active');
        });
    },

    LunBo: function () {
        var mySwiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            speed: 300,
            autoplay: {
                delay: 3000
            },
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                bulletElement: 'span',
                clickable: true
            },
            //窗口缩放时设置width
            on: {
                resize: function () {
                    this.params.width = window.innerWidth;
                    this.update();
                }
            }
        });
    },

    ProductRollLoading: function (tagSignElement, extraTag, callback) {
        //tagSignElement 为每一次tags组合的整体，是jQuery对象
        var productListElement = jQuery('[data-id="productList"]', tagSignElement);
        var pagesElement = jQuery('input[name="pages[]"]', productListElement).last();
        var tags = productListElement.attr('data-tags');

        var page = pagesElement.attr('data-page');
        var pageCount = pagesElement.attr('data-pageCount');
        var itemCount = pagesElement.attr('data-itemCount');
        //一开始就没有分页，就更不需要加载分页了
        if (typeof page == 'undefined' || typeof pageCount == 'undefined' || typeof itemCount == 'undefined') {
            jQuery('.product-warp .page-item .load-more').hide();
            return false;
        }
        //控制每个页面显示大小
        var pageSize = 8;
        //加载到最后一页之后，停止加载
        if (parseInt(page) + 1 > parseInt(pageCount)) {
            productListElement.siblings('.product-warp .page-item .load-more').hide();
            //上一个tag组合是否已经全部加载完成: true,已经加载完成; false 未加载完成
            tagComposeIsFinishedToggle = true;
            return false;
        }
        var url = webUrl + '/product/rollloading';
        var params = {page: parseInt(page) + 1, pageSize: pageSize, extraTag: extraTag, tags: tags};
        //加载页面之前，显示loading友好提示
        productListElement.siblings('.product-warp .page-item .load-more').removeClass('load-more-hide');
        jQuery.get(url, params, function (result) {
            productListElement.append(result);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    ProductList: function () {
        /**
         * product list featuer list(可能是手机端用到的js)
         */
        jQuery('.article-tags .product-tag-more').on('click', function (e) {
            e.preventDefault();

            var learnMoreHeight = jQuery('.learn-more-show').height() + 'px';
            jQuery(this).toggleClass('tag-more-active');
            jQuery(this).parents('.learn-more').toggleClass('learn-more-show');
        });

        //Paging loading
        var maxProductListElement = jQuery('#maxProductList');
        var showListTags = maxProductListElement.attr('data-showListTags');
        var extraTag = maxProductListElement.attr('data-extraTag');
        var tagsCount = parseInt(maxProductListElement.attr('data-tagsCount'));

        $(window).scroll(function () {
            //固定的 footer 高度
            var footerHeight = $("footer").height();

            //在footerHeight再往上100像素触发滚动加载
            if ($(document).scrollTop() + footerHeight + 100 > $(document).height() - $(window).height()) {
                // console.log(tagComposeIsFinishedToggle + '------------' + loadingToggle);
                /**
                 * tagComposeIsFinishedToggle  上一个tag组合是否已经全部加载完成: true,已经加载完成; false 未加载完成
                 * loadingToggle  是否加载中： true,加载中; false,加载完成
                 */
                if (tagComposeIsFinishedToggle) {
                    tagComposeIsFinishedToggle = false;
                    var url = webUrl + '/product/maxRollloading';
                    var tagsIndex = parseInt(maxProductListElement.attr('data-tagsIndex')) + 1;
                    var params = {tagsIndex: tagsIndex, extraTag: extraTag, showListTags: showListTags};
                    //如果有Ｎ个tag组合，那么最大的tagsIndex = tagsCount - 1
                    if (tagsIndex < tagsCount) {
                        //tags组合加载之前,显示loading提示
                        $('.product-warp .page-item .load-more').last().removeClass('load-more-hide').show();
                        jQuery.get(url, params, function (result) {
                            maxProductListElement.append(result);
                            maxProductListElement.attr('data-tagsIndex', tagsIndex);

                            //加载了整体的某个tags组合之后，里面的内容就可以启用分页加载了
                            loadingToggle = true;

                            //tags组合已经开始加载了,就隐藏loading提示,之所以-2,因为last()是自己的,-2才是上一个
                            $('.product-warp .page-item .load-more').eq(-2).addClass('load-more-hide');
                        });
                    }
                }

                /**
                 * 加载具体的product list
                 */
                if (!tagComposeIsFinishedToggle && loadingToggle) {
                    loadingToggle = false;
                    //要加载的是那个tags组合
                    var tagSignElement = jQuery('div[data-tagSign="just sign"]').last();

                    Register.ProductRollLoading(tagSignElement, extraTag, function () {
                        //加载完毕，去掉loading提示
                        $('.product-warp .page-item .load-more', tagSignElement).addClass('load-more-hide');
                        loadingToggle = true;
                    });
                }
            }
        });

        function loadMoreTagsList() {
            /**
             * 如果第一个tags组合小于４个，触发两次jQuery(window).trigger('scroll')以确保下一个tags组合能加载;
             * 至少触发两次，才能起到我们想要的结果，一次不行！
             * 这个功能解决bug:第一个tags组合小于４个的时候，后面的内容不自动加载
             */
            var tagsIndex = parseInt(jQuery('#maxProductList').attr('data-tagsIndex'));
            var itemCount = parseInt(jQuery('input[name="pages[]"]', '#maxProductList').first().attr('data-itemCount'));
            if (tagsIndex == 0 && itemCount <= 4) {
                for (var i = 0; i < 2; i++) {
                    jQuery(window).trigger('scroll');
                }
            }
        }

        loadMoreTagsList();

    },

    ProductView: function (product_id) {
        jQuery('body').scrollspy({target: '#productDetailsNav'});

        jQuery('.photos-item').click(function (e) {
            e.preventDefault();

            jQuery(this).addClass('active').siblings().removeClass('active');

            var sourceUrl = jQuery('img', jQuery(this)).attr('data-src');
            jQuery('.photo-animated > .img-responsive').attr('src', sourceUrl);

            jQuery('.photo-animated').addClass('animated fadeIn');
        });

        /**图片缩略图左右滑动
         * 默认滚动一次移动5个img
         * 默认当前区域显示为1可见list
         */
        if (jQuery('.photos-paginations li').length < 5) {
            jQuery('.photos-paginations').css({
                maxWidth: '384px',
                display: 'flex',
                justifyContent: 'center'
            });
        }
        var page = 1;
        jQuery('.anviz-path-btn').on('click', function (e) {
            var i = 5;
            e.preventDefault();
            parent = jQuery(this).parents('.product-photos');
            previewList = parent.find('.photos-list-box');
            //一个page的宽度
            showWidth = (previewList.find('li').width() + 20) * i;
            //所有的图片数量
            len = previewList.find('li').length;
            //向左或向右一次可以滑动几个
            totalPage = Math.ceil(len / i);
            if (jQuery(this).hasClass('anviz-scroll-left-btn')) {
                if (page == 1 || totalPage == 1)
                    return false;
                jQuery('.photos-paginations').animate({
                    left: '+=' + showWidth
                }, 'swing');
                page--;
            }
            if (jQuery(this).hasClass('anviz-scroll-right-btn')) {
                if (page >= totalPage)
                    return false;
                jQuery('.photos-paginations').animate({
                    left: '-=' + showWidth
                }, 'swing');
                page++;
            }
        });


        /**
         * 详情页锚点平滑过度PC:290
         */
        jQuery('.nav-item a').on('click', function () {
            var itemBox = $('.pro-content-info').find('li');
            var href = $.attr(this, 'href');
            $('html,body').animate({
                scrollTop: $(href).offset().top
            }, 1000);
        });

        $(window).scroll(function () {
            if ($(this).scrollTop() >= 40) {
                $('body').addClass('nav-two-fixed')
            } else {
                $('body').removeClass('nav-two-fixed')
            }
        });
        $(window).trigger('scroll');

        jQuery('.cross-chex-tab .tab-header-item').click(function (e) {
            var url = jQuery(this).attr('data-url');
            var _this = jQuery(this);

            App.loadAjaxPageTarget('#CrossChexEntries', url).done(function () {
                jQuery('.cross-chex-tab .tab-header-item.active').removeClass('active');
                _this.addClass('active');
            });
        });

        /*以后所有类似结构通用样式与nav切换*/
        jQuery('.feature-nav-content ul li a').on(App.linkAfterAjax, function (e) {
            jQuery('.feature-nav-content ul li a.nav-btn-active').removeClass('nav-btn-active');
            jQuery(this).addClass('nav-btn-active');
        });

        /** Download List **/
        jQuery.get(webUrl + '/download/entries/list', {search: true, product_id: product_id}, function (html) {
            jQuery('#productDownload').append(html);
        }, 'html');
    },

    NewsRollLoading: function (callback) {
        var newListElement = jQuery('#newsList');
        var pagesElement = jQuery('input[name="pages[]"]').last();
        var tag = newListElement.attr('data-tag');
        var year = newListElement.attr('data-year');

        var page = pagesElement.attr('data-page');
        var pageCount = pagesElement.attr('data-pageCount');
        var itemCount = pagesElement.attr('data-itemCount');
        //一开始就没有分页，就更不需要加载分页了
        if (typeof page == 'undefined' || typeof pageCount == 'undefined' || typeof itemCount == 'undefined') {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        //控制每个页面显示大小
        var pageSize = 6;
        //加载到最后一页之后，停止加载
        if (parseInt(page) + 1 > parseInt(pageCount)) {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        var url = webUrl + '/news/index/rollloading';
        var params = {tag: tag, year: year, page: parseInt(page) + 1, pageSize: pageSize};
        jQuery.get(url, params, function (result) {
            newListElement.append(result);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    CasestudyRollLoading: function (callback) {
        var casestudyListElement = jQuery('#casestudyList');
        var pagesElement = jQuery('input[name="pages[]"]').last();
        var tag = casestudyListElement.attr('data-tag');

        var page = pagesElement.attr('data-page');
        var pageCount = pagesElement.attr('data-pageCount');
        var itemCount = pagesElement.attr('data-itemCount');
        //一开始就没有分页，就更不需要加载分页了
        if (typeof page == 'undefined' || typeof pageCount == 'undefined' || typeof itemCount == 'undefined') {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        //控制每个页面显示大小
        var pageSize = 6;
        //加载到最后一页之后，停止加载
        if (parseInt(page) + 1 > parseInt(pageCount)) {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        var url = webUrl + '/casestudy/index/rollloading';
        var params = {tag: tag, page: parseInt(page) + 1, pageSize: pageSize};
        jQuery.get(url, params, function (result) {
            casestudyListElement.append(result);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    DownloadRollLoading: function (callback) {
        var downloadListElement = jQuery('#downloadList');
        var pagesElement = jQuery('input[name="pages[]"]').last();
        var download_tag = downloadListElement.attr('data-tag');
        var product_tag = jQuery('select[name="product_tag"]').val();
        var product_id = jQuery('select[name="product_id"]').val();
        var keyword = jQuery('input[name="keyword"]', '#searchDownloadForm').val();

        var page = pagesElement.attr('data-page');
        var pageCount = pagesElement.attr('data-pageCount');
        var itemCount = pagesElement.attr('data-itemCount');
        //一开始就没有分页，就更不需要加载分页了
        if (typeof page == 'undefined' || typeof pageCount == 'undefined' || typeof itemCount == 'undefined') {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        //控制每个页面显示大小
        var pageSize = 15;
        //加载到最后一页之后，停止加载
        if (parseInt(page) + 1 > parseInt(pageCount)) {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        var url = webUrl + '/download/index/rollloading';
        var params = {
            download_tag: download_tag,
            product_tag: product_tag,
            product_id: product_id,
            keyword: keyword,
            page: parseInt(page) + 1,
            pageSize: pageSize
        };
        jQuery.get(url, params, function (result) {
            downloadListElement.append(result);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    FaqRollLoading: function (callback) {
        var faqListElement = jQuery('#faqList');
        var pagesElement = jQuery('input[name="pages[]"]').last();
        var faq_tag = faqListElement.attr('data-tag');
        var product_tag = jQuery('select[name="product_tag"]').val();
        var product_id = jQuery('select[name="product_id"]').val();
        var keyword = jQuery('input[name="keyword"]', '#searchFaqForm').val();

        var page = pagesElement.attr('data-page');
        var pageCount = pagesElement.attr('data-pageCount');
        var itemCount = pagesElement.attr('data-itemCount');
        //一开始就没有分页，就更不需要加载分页了
        if (typeof page == 'undefined' || typeof pageCount == 'undefined' || typeof itemCount == 'undefined') {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        //控制每个页面显示大小
        var pageSize = 15;
        //加载到最后一页之后，停止加载
        if (parseInt(page) + 1 > parseInt(pageCount)) {
            jQuery('.search-warp .page-item .load-more').hide();

            return false;
        }
        var url = webUrl + '/faq/index/rollloading';
        var params = {
            faq_tag: faq_tag,
            product_tag: product_tag,
            product_id: product_id,
            keyword: keyword,
            page: parseInt(page) + 1,
            pageSize: pageSize
        };
        jQuery.get(url, params, function (result) {
            faqListElement.append(result);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    MarketingRollLoading: function (callback) {
        var marketingListElement = jQuery('#marketingList');
        var pagesElement = jQuery('input[name="pages[]"]').last();
        var tag = marketingListElement.attr('data-tag');

        var page = pagesElement.attr('data-page');
        var pageCount = pagesElement.attr('data-pageCount');
        var itemCount = pagesElement.attr('data-itemCount');
        //一开始就没有分页，就更不需要加载分页了
        if (typeof page == 'undefined' || typeof pageCount == 'undefined' || typeof itemCount == 'undefined') {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        //控制每个页面显示大小
        var pageSize = 6;
        //加载到最后一页之后，停止加载
        if (parseInt(page) + 1 > parseInt(pageCount)) {
            jQuery('.search-warp .page-item .load-more').hide();
            return false;
        }
        var url = webUrl + '/marketing/index/rollloading';
        var params = {tag: tag, page: parseInt(page) + 1, pageSize: pageSize};
        jQuery.get(url, params, function (result) {
            marketingListElement.append(result);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    registerSearchByProductSelectEvent: function (searchFormElement) {
        if (typeof searchFormElement == 'string')
            searchFormElement = jQuery(searchFormElement);

        if (searchFormElement.length <= 0)
            return false;

        //函数中定义函数，纯粹的通过product_tag，找出product_id
        function loadProductId() {
            var product_tag = jQuery('[name="product_tag"]', searchFormElement).val();
            var productSelectElement = jQuery('[name="product_id"]', searchFormElement);

            jQuery.post(webUrl + '/ajax/selectProduct.html', {product_tag: product_tag}, function (result) {
                var value = productSelectElement.attr('data-value');
                productSelectElement.empty();
                productSelectElement.append('<option value="0">' + $.i18n.map['Select Model'] + '</option>');
                if (result.success && result.data.length > 0) {
                    jQuery.each(result.data, function (i, row) {
                        if (value == row.id) {
                            productSelectElement.append('<option value="' + row.id + '" selected="selected">' + row.model + '</option>');
                        } else {
                            productSelectElement.append('<option value="' + row.id + '">' + row.model + '</option>');
                        }
                    });
                    Helper.select2(productSelectElement);
                }
            }, 'json');
        }

        jQuery('[name="product_tag"]', searchFormElement).change(function () {
            searchFormElement.submit();
        });
        jQuery('[name="product_id"]', searchFormElement).change(function () {
            searchFormElement.submit();
        });

        //每次加载页面，都要触发一次：通过product_tag找product_id的函数
        loadProductId();
    },

    //手机模式下，点击^或者√，显示或者隐藏菜单
    Dropdownbox: function () {
        var flag = true;
        $(".select_img").click(function () {
            if (flag) {
                $(".select_box").addClass("show");
                $(".select_img").removeClass("icon-down").addClass("icon-up");
                flag = false;
            } else {
                $(".select_box").removeClass("show");
                $(".select_img").removeClass("icon-up").addClass("icon-down");
                flag = true;
            }
        })
        $(".select_tit>a").text($(".tag_nav_active>a").text());
    },

    Wheretobuy: function () {
        jQuery('#partnerLocation').change(function (e) {
            var location_id = jQuery(this).val();
            var url = webUrl + '/company/wheretobuy/index.html?location_id=' + location_id;
            var target = jQuery('#partnerEntriesContent');
            App.loadAjaxPageTarget(target, url);
        });
    },

    ActivityRegisterForm: function () {
        var thisInstance = this;
        var app = thisInstance.app();

        var form = jQuery('#ActivityRegisterFormWin');

        if (form.length > 0) {
            form.on(App.formAfterSubmit, function (e, result) {
                var id = jQuery('input[name="id"]', form).val();
                var customertype = jQuery('input[name="customertype"]:checked', form).val();

                var interested_array = new Array();
                jQuery('input[name="interested[]"]:checked', form).each(function () {
                    interested_array.push($(this).val());//向数组中添加元素
                });
                var interested = interested_array.join(',');//将数组元素连接起来以构建一个字符串
                var email = jQuery('input[name="email"]', form).val();

                //1.发送一封邮件给客户，感谢客户关注我们的展会
                var url = webUrl + '/activity/register/sendEmailToCustomer.html';

                var data = {
                    id: id,
                    email: email
                };
                $.post(url, data, function (result) {
                    console.log('send email to customer success');
                    // console.log(result);
                });

                //2.发送一封邮件到marketing@anviz.com,通知管理人员，有新的用户关注我们展会了
                var url = webUrl + '/activity/register/sendEmailToSelf.html';
                var data = {
                    id: id,
                    customertype: customertype,
                    interested: interested,
                    email: email
                };
                $.post(url, data, function (result) {
                    console.log('send email to marketing success');
                    // console.log(result);
                });
                Helper.successMsg($.i18n.map['regsiter successfully']).done(function () {
                    //3.重置表单
                    form[0].reset();
                });
            });

            app.registerAjaxFormSubmitEvent(form);
        }
    },

    Leave: function () {
        //Leave a message, send email
        var form = jQuery('#emailSendForm');

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且隐藏弹出的表单
        form.on(App.formAfterSubmit, function (e, result) {
            form[0].reset();
            jQuery('#myLeave').trigger('click');
            Helper.successMsg($.i18n.map['leave a message successfully']);
        });

        AppInstance.registerAjaxFormSubmitEvent(form);

        jQuery('div.radio-box .radio', form).each(function () {
            $(this).click(function () {
                //下面两行的顺序不能颠倒，一定要先将兄弟节点设为false，再将自身设为true。否则会出现点击按钮，radio却无法选中的情况。
                jQuery(this).siblings('div').children('input[type="radio"]').attr('checked', false);
                jQuery(this).children('input[type="radio"]').attr('checked', true);

                var name = jQuery('input[type="radio"]', this).attr('name');
                var value = jQuery('input[type="radio"]', this).val();

                //显示对应的表单域
                if (name == 'messageType') {
                    jQuery('li', form).each(function () {
                        var belong = jQuery(this).attr('data-belong');
                        //如果data-belong的值，包含value的值
                        if (!Helper.isEmpty(belong) && belong.indexOf(value) !== -1) {
                            jQuery(this).show();
                        } else {
                            jQuery(this).hide();
                        }
                    });

                    /**
                     * 点击messageType的时候，如果是support: Product Model和Serial Number默认必填
                     * 否则Product Model和Serial Number不是必填
                     */
                    if (value == 'support') {
                        //下面两行的顺序不能颠倒，一定要先将兄弟节点设为false，再将自身设为true。否则会出现点击按钮，radio却无法选中的情况。
                        jQuery('input[name="issues_type"]', form).attr('checked', false);
                        jQuery('input[name="issues_type"][value="Hardware"]', form).attr('checked', true);

                        jQuery('select[name="product_model"]', form).parent().addClass('required');
                        jQuery('input[name="serial_number"]', form).parent().addClass('required');
                    } else {
                        jQuery('input[name="issues_type"][value="Hardware"]', form).attr('checked', false);
                        jQuery('select[name="product_model"]', form).parent().removeClass('required');
                        jQuery('input[name="serial_number"]', form).parent().removeClass('required');
                    }
                }

                if (name == 'issues_type') {
                    //Issues Type 值为 Hardware的时候，Product Model和Serial Number两个必填
                    if (value == 'Hardware') {
                        jQuery('[name="product_model"]', form).parent().addClass('required');
                        jQuery('[name="serial_number"]', form).parent().addClass('required');
                    } else {
                        jQuery('[name="product_model"]', form).parent().removeClass('required');
                        jQuery('[name="product_model"]', form).parent().removeClass('error');
                        jQuery('[name="serial_number"]', form).parent().removeClass('required');
                        jQuery('[name="serial_number"]', form).parent().removeClass('error');
                    }
                }

            });
        });
    },

    ticket: function () {
        //Leave a message, message type = Tichnical Support，单独放一个页面
        var form = jQuery('#ticketForm');
        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);
                    jQuery('[name="issues_type"]', form).eq(0).trigger('click');

                    Helper.successMsg($.i18n.map['leave a message successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);

        jQuery('div.radio-box .radio', form).each(function () {
            jQuery(this).click(function () {
                // //下面两行的顺序不能颠倒，一定要先将兄弟节点设为false，再将自身设为true。否则会出现点击按钮，radio却无法选中的情况。
                jQuery(this).siblings('div').children('input[type="radio"]').attr('checked', false);
                jQuery(this).children('input[type="radio"]').attr('checked', true);

                var name = jQuery('input[type="radio"]', this).attr('name');
                var value = jQuery('input[type="radio"]', this).val();

                if (name == 'issues_type' && value == 'Hardware') {
                    jQuery('[name="software_type"]', form).parents('li').hide();
                    jQuery('[name="software_type"]', form).parent('div').removeClass('required');
                    jQuery('[name="product_model"]', form).parent('div').addClass('required');
                    jQuery('[name="serial_number"]', form).parent('div').addClass('required');
                    jQuery('[name="firmware_version"]', form).parents('li').show();
                } else if (name == 'issues_type' && value == 'Software') {
                    jQuery('[name="software_type"]', form).parents('li').show();
                    jQuery('[name="software_type"]', form).parent('div').addClass('required');
                    jQuery('[name="product_model"]', form).parent('div').addClass('required');
                    jQuery('[name="serial_number"]', form).parent('div').removeClass('required');
                    jQuery('[name="firmware_version"]', form).parents('li').hide();
                } else if (name == 'issues_type' && value == 'Others') {
                    jQuery('[name="software_type"]', form).parents('li').hide();
                    jQuery('[name="software_type"]', form).parent('div').removeClass('required');
                    jQuery('[name="product_model"]', form).parent('div').removeClass('required');
                    jQuery('[name="serial_number"]', form).parent('div').removeClass('required');
                    jQuery('[name="firmware_version"]', form).parents('li').hide();
                }
            });
        });
    },

    usapartner: function () {
        var form = jQuery('#dealerForm');

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    Helper.successMsg($.i18n.map['leave a message successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);
    },

    inquiry: function () {
        //static page页面，用到inquiryForm表单的引用，这个时候，AppInstance会为空
        //表templete_block -->> '%inquiry%',提交到{{%home_url%}}/mycaptcha/index/leaveAMessage.html
        if (Helper.isEmpty(AppInstance)) {
            var AppInstance = new App();
        }

        //Leave a message, message type = sales，单独放一个页面
        var form = jQuery('#inquiryForm');
        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    //保存跳转成功页面，是一个静态页:https://www.anviz.com/thank-you-fill-in.html
                    // Helper.successMsg($.i18n.map['leave a message successfully']);
                    window.location.href = result.data.url;
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);

        /**
         * 生成验证码，插入到指定的位置。
         * 为了避免jQuery发生冲突，在生成的这个页面中，不加载Yii自带的jQuery框架，在main.php里面配置
         * 只有static_page中，才有id="CCaptcha"
         */
        if (jQuery('#CCaptcha').length > 0) {
            var url = webUrl + '/mycaptcha';
            $.get(url, function (data, status) {
                jQuery('#CCaptcha').before(data);
            });

            if (!Helper.isEmpty(static_page_form_values)) {
                /**
                 * 通过获取cookie:static_page_form,初始化表单inquiry_form
                 * 如页面：https://www.anviz.com/wisdom-series.html
                 */
                if (static_page_form_values.hasOwnProperty('phone_number')) {
                    jQuery('[name="phone_number"]', form).val(static_page_form_values.phone_number);
                }

                if (static_page_form_values.hasOwnProperty('company_name')) {
                    jQuery('[name="company_name"]', form).val(static_page_form_values.company_name);
                }

                if (static_page_form_values.hasOwnProperty('title')) {
                    jQuery('[name="title"]', form).val(static_page_form_values.title);
                }

                if (static_page_form_values.hasOwnProperty('country_id')) {
                    jQuery('[name="country_id"]', form).val(static_page_form_values.country_id).trigger('change');
                }

                if (static_page_form_values.hasOwnProperty('your_role')) {
                    jQuery('[name="your_role"]', form).val(static_page_form_values.your_role).trigger('change');
                }

                if (static_page_form_values.hasOwnProperty('content')) {
                    jQuery('[name="content"]', form).text(static_page_form_values.content);
                }
            }
        }
    },

    form_contactus: function () {
        //Leave a message, message type = contact sales，单独放一个页面
        var form = jQuery('#contactusForm');
        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        jQuery('input[type="checkbox"]', form).click(function () {
            jQuery(this).parent().parent().toggleClass('checked');
        });

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    Helper.successMsg($.i18n.map['contact us successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);
    },
    form_all: function () {
        $('.form_date').datetimepicker({
            weekStart: 1,
            todayBtn:  1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        });
        $('.type0').show();


        var form = jQuery('#myForm');

        //调用公用的方法
        Helper.validateForm(form);



        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);
                        jQuery('[type="radio"]', form).prop('checked', false).removeAttr('checked');
                        jQuery('[type="checkbox"]', form).prop('checked', false).removeAttr('checked');
                relation_component_event()
                    Helper.successMsg(jQuery('.submit-message').text());
            }
        });


        AppInstance.registerAjaxFormSubmitEvent(form);

        App.registerLocationSelectEvent(jQuery('[name="country_id"]', form), jQuery('[name="state_id"]', form), jQuery('[name="city_id"]', form));

        $('.relation_component').change(function () {
            relation_component_event()
        });
        relation_component_event()
        function relation_component_event(){
            $('.form_component').hide();
            $('.type0').show();
            var types = [];
            $('input[type=radio]:checked').each(function () {
                if ($(this).parents('.item').css('display') !== 'none' && $(this).data('id') !== undefined) {
                    let type = $(this).data('id').toString();
                    console.log(type);
                    $('.type' + type).show();
                    types.push(type);
                }
            })
            $('.type' +getTypes(types)).show();
        }

        function getTypes(types) {
            return types.join('-');
        }

        var upload_default_text = $('.file-upload span').first().text();
        $('.file-upload').on('click', function () {
            $(this).next('.file').click();
        });
        $('input.file').on('change', function () {
            if ($(this).val() == '') {
                $(this).prev().find('span').text(upload_default_text);
                return false;
            }
            $(this).prev().find('span').text($(this).val());
        });
    },
    form_distributor: function () {
        var form = jQuery('#distributorForm');
        //日历控件，只显示年份
        var params = {
            language: lang,
            startView: 'decade',
            minView: 'decade',
            format: 'yyyy',
            maxViewMode: 2,
            minViewMode: 2,
            autoclose: true
        };
        App.webShowDateTimePickerElementView(jQuery('input[name="year"]'), params);

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //初始化upload按钮，让美化之后的upload起作用
        Helper.init_upload();

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    //登录后跳转回来，Upload可能会被标记红色框，保存成功，可以去掉这个红色框。
                    jQuery('[type="file"]', form).each(function () {
                        //文字也初始化
                        jQuery(this).val('');
                        jQuery(this).trigger('change');
                        //去掉红框
                        jQuery(this).parent('div.upload').removeClass('error');
                    });

                    Helper.successMsg($.i18n.map['partner successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);

        //用js初始化表单上传附件的状态，是否要用红框圈起来
        if (!Helper.isEmpty(showroom_picture)) {
            jQuery('[name="showroom_picture"]', form).parent('div.upload').addClass('error');
        }

        if (!Helper.isEmpty(warehouse_picture)) {
            jQuery('[name="warehouse_picture"]', form).parent('div.upload').addClass('error');
        }
    },

    active_request: function () {
        var form = jQuery('#active_request');
        //日历控件，只显示年份
        //调用公用的方法
        Helper.validateForm(form);

        // //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
        //     if (result.success) {
        //
                jQuery('[type="submit"]', form).removeClass('btn-loading');
        //         jQuery('[type="submit"]', form).text($.i18n.map['Submit']);
        //
        //         //JS之判断json对象中是否含有某个key值
        //         if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
        //             //跳转
        //             Helper.warningMsg(result.message).done(function () {
        //                 window.location.href = result.data.redirect_url;
        //             });
        //         } else {
        //             //保存成功才重置表单，否则就不用重置表单
        //             Helper.reset_our_form(form);
                  // 1.发送一封邮件给客户，感谢客户关注我们的展会
                   var id = jQuery('input[name="campaigns_id"]', form).val();
                   var email = jQuery('input[name="email"]', form).val();
                    var url = webUrl + '/activity/register/sendEmailToCustomer.html';
                    var data = {
                        id: id,
                        email: email
                    };
                    $.post(url, data, function (result) {
                        console.log('send email to customer success');
                        // console.log(result);
                    });

                    //2.发送一封邮件到marketing@anviz.com,通知管理人员，有新的用户关注我们展会了
                    // var url = webUrl + '/activity/register/sendEmailToSelf.html';
                    // var data = {
                    //     id: id,
                    //     customertype: customertype,
                    //     interested: interested,
                    //     email: email
                    // };
                    Helper.successMsg($.i18n.map['regsiter successfully']).done(function () {
                        //3.重置表单
                        form[0].reset();
                    });
        //         }
        //     }
        });
        //
        AppInstance.registerAjaxFormSubmitEvent(form);
        //
        // //用js初始化表单上传附件的状态，是否要用红框圈起来
        // if (!Helper.isEmpty(showroom_picture)) {
        //     jQuery('[name="showroom_picture"]', form).parent('div.upload').addClass('error');
        // }
        //
        // if (!Helper.isEmpty(warehouse_picture)) {
        //     jQuery('[name="warehouse_picture"]', form).parent('div.upload').addClass('error');
        // }
    },

    form_rma: function () {
        var form = jQuery('#rmaForm');

        Helper.validateForm(form, $.i18n.map['Submitting']);

        //初始化upload按钮，让美化之后的upload起作用
        Helper.init_upload();
        //初始化country_id，让select变成select2
        Helper.select2(jQuery('[name="country_id"]', form));

        /**
         *将子模块中的name全部重置，如：product_model[0]，product_model[１]...
         * 这样做的目的，是为了给每一个输入的元素有不同的name，方便保存失败的时候，
         * $this->response(false,'field_name',$message)，前台能通过field_name添加.error，
         * 从而给客户提示输入不合法的字段
         * 如果都类似product_model[]这样，就不好区分了
         * 写成共用方法，方便调用
         */
        function init_son_module_name() {
            jQuery('#proof_list ul').each(function (index) {
                //此处this表示当前ul标签元素，index为当前ul标签元素的索引
                jQuery('input,select,textarea', this).each(function () {
                    //这里的每个this，代表input,select,textarea标签元素
                    var name = jQuery(this).attr('name');
                    //将[index],[0],[1],[2]...，全部替换成[0],[1],[2]...，不管[]里面的顺序有多乱，替换之后，都是0,1,2...
                    name = name.replace(/\[\S+\]/g, '[' + index + ']');
                    jQuery(this).attr('name', name);
                });
            });
        }

        /**
         * 初始化，让第一个【购买凭证】显示出来
         * 之所以第一个【购买凭证】都用js显示，是为了维护方便，只需要维护一个【购买凭证】即可
         */
        var proof_template = jQuery('#proof_template');
        if (jQuery('#proof_list ul').length <= 1) {
            //先深度拷贝一份proof_template出来，在这个基础上初始化，第一个【购买凭证】的[-]是灰色的，有disable
            proof_template_clone = proof_template.clone(true).removeAttr('id').removeAttr('hidden');
            jQuery('button.delete_self', proof_template_clone).addClass('disable');

            jQuery('#proof_list').append(proof_template_clone);

            //将name中的index替换成0
            init_son_module_name();

            //激活拷贝过来的select成为select2
            jQuery('select', proof_template_clone).select2();
        }

        //add more，添加【购买凭证】模块
        jQuery('.add_more').on('click', function () {
            //插到自己的下面
            jQuery(this).parents('ul.proof_module').after(proof_template.clone(true).removeAttr('id').removeAttr('hidden'));

            //将name中的index替换成0,1,2...
            init_son_module_name();

            //激活拷贝过来的select成为select2
            jQuery(this).parents('ul.proof_module').next().find('select').select2();

            //第一个【购买凭证】模块的时候，[-]可以使用，去掉disable
            jQuery('#proof_list ul').children(':first').find('button.delete_self').removeClass('disable');
        });

        //删除【购买凭证】，当只有一个【购买凭证】模块的时候，[-]禁用
        jQuery('.delete_self').on('click', function () {
            //如果只有一个【购买凭证】，删除无效
            if (jQuery('#proof_list ul').length <= 1) {
                return false;
            }

            //删除【购买凭证】模块
            jQuery(this).parents('ul.proof_module').remove();

            //如果只剩下１个【购买凭证】，[-]按钮变灰色
            if (jQuery('#proof_list ul').length <= 1) {
                jQuery('button.delete_self', '#proof_list').addClass('disable');
            }

            //将name中的index替换成0,1,2...
            init_son_module_name();
        });

        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    //删除多余的子模块，只留下一个子模块即可
                    jQuery('.delete_self', form).each(function () {
                        jQuery(this).trigger('click');
                    });

                    //留下的最后一个子模块，Upload可能会被标记红色框，去掉这个红色框。
                    jQuery('[type="file"]', form).each(function () {
                        //文字也初始化
                        jQuery(this).val('');
                        jQuery(this).trigger('change');
                        //去掉红框
                        jQuery(this).parent('div.upload').removeClass('error');
                    });

                    Helper.successMsg($.i18n.map['rma successfully']);
                }
            }
        });

        //提交失败，需要做一些js动作。这里是附件超过20M或者格式不对
        form.on(App.formAfterSubmitFail, function (e, result) {
            if (!result.success) {
                var name = result.data;
                //如果提交的附件超过20M，会走到下面这一步。
                var fileElement = jQuery('[name="' + name + '"][type="file"]', form);
                if (fileElement.length > 0) {
                    //我们给出error的红色提示
                    fileElement.parent('div.upload').addClass('error');
                    //同时给出文件提示：Only upload the PDF/JPG files that less than 20M
                    fileElement.prev('div').children('span').text($.i18n.map['rma file upload limit'])
                }
            }
        });

        /**
         * 附件不是必填，但如果一旦填了，超过20M，或者不是pdf、jpg格式，就会有错误提示
         * 附件获得焦点，红色框去掉
         * 包括【未来的】附件
         */
        jQuery('form').on('click', 'div.upload.error', function () {
            jQuery(this).removeClass('error');
        });

        AppInstance.registerAjaxFormSubmitEvent(form);

        /**
         * son_model的数据通过cookie获取而来，如果不为son_model空，说明有子模块数据保存在cookie之中。
         * 用son_model里面的数据，初始化所有的子模块。
         */
        if (!Helper.isEmpty(son_model)) {
            var son_model_count = son_model.product_model.length;
            //点子模块的+，生成多个子模块
            var add_more_element = jQuery('.add_more:first', form);
            //由于一开始，已经初始化了一个，所以只需要初始化(son_model_count - 1)个
            for (var i = 0; i < son_model_count - 1; i++) {
                add_more_element.trigger('click');
            }

            //准备好了子模块，接下来就是将数据初始化到子模块里面去
            var product_model = son_model.product_model;
            var serial_number = son_model.serial_number;
            var content = son_model.content;
            var upload_file = son_model.upload_file;
            for (var i = 0; i < son_model_count; i++) {
                jQuery('[name="product_model[' + i + ']"]', form).val(product_model[i]).trigger('change');
                jQuery('[name="serial_number[' + i + ']"]', form).val(serial_number[i]);
                jQuery('[name="content[' + i + ']"]', form).text(content[i]);
                //对于有提交过附件的位置，我们给出error的红色提示
                if (!Helper.isEmpty(upload_file[i])) {
                    jQuery('[name="upload_file[' + i + ']"]', form).parent('div.upload').addClass('error');
                }
            }
        }
    },

    form_service: function () {
        var form = jQuery('#serviceForm');

        //日历控件，只显示年份
        var params = {
            language: lang,
            startView: 'decade',
            minView: 'decade',
            format: 'yyyy',
            maxViewMode: 2,
            minViewMode: 2,
            autoclose: true
        };
        App.webShowDateTimePickerElementView(jQuery('input[name="year"]'), params);

        //调用公用的方法
        // Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    Helper.successMsg($.i18n.map['partner successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);
    },

    form_technology: function () {
        var form = jQuery('#technologyForm');
        //日历控件，只显示年份
        var params = {
            language: lang,
            startView: 'decade',
            minView: 'decade',
            format: 'yyyy',
            maxViewMode: 2,
            minViewMode: 2,
            autoclose: true
        };
        App.webShowDateTimePickerElementView(jQuery('input[name="year"]'), params);

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    Helper.successMsg($.i18n.map['partner successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);
    },

    Lazyload: function () {
        lazyRender();
        var clock;
        $(window).on('scroll', function () {

            if (clock) {
                clearTimeout(clock);
            }
            clock = setTimeout(function () {
                lazyRender();
            }, 300)
        });
        $(window).on('scroll', function () {
            $('body img').each(function () {
                if (checkShow($(this)) && !isLoaded($(this))) {
                    loadImg($(this));
                }
            })
        });

        function checkShow($img) {
            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();
            var offsetTop = $img.offset().top;

            if (offsetTop < (scrollTop + windowHeight) && offsetTop > scrollTop) {
                return true;
            }
            return false;
        }

        function isLoaded($img) {
            return $img.attr('data-src') === $img.attr('src');
        }

        function loadImg($img) {
            $img.attr('src', $img.attr('data-src'));
        }

        function lazyRender() {
            $('body img').each(function () {
                if (checkShow($(this)) && !isLoaded($(this))) {
                    loadImg($(this));
                }
            })
        }
    },

    Drag: function () {
        $('.draggable').draggabilly({containment: true, handle: '.handle'});
        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
            $(".btn-fixed .draggable").css({
                "margin-left": "-40px"
            })
        }

    },

    Partner: function () {
        if (Helper.isEmpty(AppInstance)) {
            var AppInstance = new App();
        }
        var form = jQuery('#partnerForm');

        // 调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        form.on(App.formAfterSubmit, function (e, result) {
            //保存成功才重置表单，否则就不用重置表单
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    //保存跳转成功页面，是一个静态页:https://www.anviz.com/thank-you-fill-in.html
                    // Helper.successMsg($.i18n.map['partner successfully']);
                    window.location.href = result.data.url;
                }
            }
        });

        if (!Helper.isEmpty(static_page_form_values)) {
            /**
             * 通过获取cookie:static_page_form,初始化表单partnerForm
             * 如页面：https://www.anviz.com/partners.html
             */
            if (static_page_form_values.hasOwnProperty('phone_number')) {
                jQuery('[name="phone_number"]', form).val(static_page_form_values.phone_number);
            }

            if (static_page_form_values.hasOwnProperty('company_name')) {
                jQuery('[name="company_name"]', form).val(static_page_form_values.company_name);
            }

            if (static_page_form_values.hasOwnProperty('contact_person')) {
                jQuery('[name="contact_person"]', form).val(static_page_form_values.contact_person);
            }

            if (static_page_form_values.hasOwnProperty('job_title')) {
                jQuery('[name="job_title"]', form).val(static_page_form_values.job_title);
            }

            if (static_page_form_values.hasOwnProperty('website')) {
                jQuery('[name="website"]', form).val(static_page_form_values.website);
            }

            if (static_page_form_values.hasOwnProperty('country_id')) {
                jQuery('[name="country_id"]', form).val(static_page_form_values.country_id).trigger('change');
            }

            if (static_page_form_values.hasOwnProperty('your_role')) {
                jQuery('[name="your_role"]', form).val(static_page_form_values.your_role).trigger('change');
            }

            if (static_page_form_values.hasOwnProperty('product_category')) {
                jQuery('[name="product_category"]', form).val(static_page_form_values.product_category).trigger('change');
            }

            if (static_page_form_values.hasOwnProperty('content')) {
                jQuery('[name="content"]', form).text(static_page_form_values.content);
            }
        }

        AppInstance.registerAjaxFormSubmitEvent(form);

        /**
         * 生成验证码，插入到指定的位置。
         * 为了避免jQuery发生冲突，在生成的这个页面中，不加载Yii自带的jQuery框架，在main.php里面配置
         */
        var url = webUrl + '/mycaptcha';
        $.get(url, function (data, status) {
            jQuery('#CCaptcha').before(data);
        });
    },
    newCrossChexCloud:function (){
        if (Helper.isEmpty(AppInstance)) {
            var AppInstance = new App();
        }
        var form = jQuery('#CrossChexCloudForm');

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);
                    Helper.successMsg($.i18n.map['partner successfully']).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                }
            }
        });

        if (!Helper.isEmpty(static_page_form_values)) {
            /**
             * 通过获取cookie:static_page_form,初始化表单partnerForm
             * 如页面：https://www.anviz.com/partners.html
             */
            if (static_page_form_values.hasOwnProperty('phone_number')) {
                jQuery('[name="phone_number"]', form).val(static_page_form_values.phone_number);
            }

            if (static_page_form_values.hasOwnProperty('number_employees')) {
                jQuery('[name="number_employees"]', form).val(static_page_form_values.number_employees);
            }

            if (static_page_form_values.hasOwnProperty('country_id')) {
                jQuery('[name="country_id"]', form).val(static_page_form_values.country_id).trigger('change');
            }

            if (static_page_form_values.hasOwnProperty('from_url')) {
                jQuery('[name="from_url"]', form).val(static_page_form_values.from_url);
            }
        }

        AppInstance.registerAjaxFormSubmitEvent(form);

        /**
         * 生成验证码，插入到指定的位置。
         * 为了避免jQuery发生冲突，在生成的这个页面中，不加载Yii自带的jQuery框架，在main.php里面配置
         */
        var url = webUrl + '/mycaptcha';
        $.get(url, function (data, status) {
            jQuery('#CCaptcha').before(data);
        });
    },
    /**
     * 露露的表单，static_page页面

     * https://www.anviz.com/cloud-based-time-and-attendance-solution-crosschex-cloud.html
     */
    CrossChexCloud: function () {

        if (Helper.isEmpty(AppInstance)) {
            var AppInstance = new App();
        }
        var form = jQuery('#CrossChexCloudForm');

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    Helper.successMsg($.i18n.map['partner successfully']);
                }
            }
        });

        if (!Helper.isEmpty(static_page_form_values)) {
            /**
             * 通过获取cookie:static_page_form,初始化表单partnerForm
             * 如页面：https://www.anviz.com/partners.html
             */
            if (static_page_form_values.hasOwnProperty('phone_number')) {
                jQuery('[name="phone_number"]', form).val(static_page_form_values.phone_number);
            }

            if (static_page_form_values.hasOwnProperty('number_employees')) {
                jQuery('[name="number_employees"]', form).val(static_page_form_values.number_employees);
            }

            if (static_page_form_values.hasOwnProperty('country_id')) {
                jQuery('[name="country_id"]', form).val(static_page_form_values.country_id).trigger('change');
            }

            if (static_page_form_values.hasOwnProperty('from_url')) {
                jQuery('[name="from_url"]', form).val(static_page_form_values.from_url);
            }
        }

        AppInstance.registerAjaxFormSubmitEvent(form);

        /**
         * 生成验证码，插入到指定的位置。
         * 为了避免jQuery发生冲突，在生成的这个页面中，不加载Yii自带的jQuery框架，在main.php里面配置
         */
        var url = webUrl + '/mycaptcha';
        $.get(url, function (data, status) {
            jQuery('#CCaptcha').before(data);
        });
    },

    /**
     * https://www.anviz.com/sdk-request.html?lang=en_us
     * 页面转移到了：https://www.anviz.com/form/inquirysdk.html
     * 原来是一个static page页面，现在改成php的页面了
     * felix他们会用到这个页面
     */
    inquirySdk: function () {
        var form = jQuery('#inquirySdkForm');

        //调用公用的方法
        Helper.validateForm(form, $.i18n.map['Submitting']);

        //提交信息成功，显示提示信息，并且重置表单
        form.on(App.formAfterSubmit, function (e, result) {
            if (result.success) {
                jQuery('input[name="security_code"]', form).val('');
                jQuery('[type="submit"]', form).removeClass('btn-loading');
                jQuery('[type="submit"]', form).text($.i18n.map['Submit']);

                //JS之判断json对象中是否含有某个key值
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('redirect_url')) {
                    //跳转
                    Helper.warningMsg(result.message).done(function () {
                        window.location.href = result.data.redirect_url;
                    });
                } else {
                    //保存成功才重置表单，否则就不用重置表单
                    Helper.reset_our_form(form);

                    Helper.successMsg($.i18n.map['sdk request successfully']);
                }
            }
        });

        AppInstance.registerAjaxFormSubmitEvent(form);
    },

    EmailCenter: function () {
        var thisInstance = this;
        var app = thisInstance.app();
        var form = jQuery('#EmailForm');
        form.on(App.formAfterSubmit, function (result) {
            form[0].reset();
            Helper.successMsg($.i18n.map['send email successfully']);
        });

        app.registerAjaxFormSubmitEvent(form);
    },

    loadJsLang: function () {
        /**
         * 可能是jquery.i18n的一个bug，lang值里面不能有_，否则就不准确。
         * 通过分析Web/static/js/jquery.i18n.properties.js
         *
         * 发现文件名就取两位，如zh_cn、zh_hk、zh_tw，对应的js文件也只是:strings_zh.properties
         * 如果zh_tw，需要一个单独的文件，不公用strings_zh.properties，可以在下面设置
         *
         * 那么，后台Translation Files，就要考虑一个体系的语言，js用一份就够了。
         */
        switch (lang) {
            case 'en':
            case 'en_us':
                lang = 'en';
                break;
            case 'zh_ch':
            case 'zh':
                lang = 'zh';
                break;
            case 'es':
                lang = 'es';
                break;
            case 'ar':
                lang = 'ar';
                break;
            case 'pt':
                lang = 'pt';
                break;
            case 'ru':
                lang = 'ru';
                break;
            case 'fr':
                lang = 'fr';
                break;
            default:
                lang = 'en';
        }
        jQuery.i18n.properties({//加载资浏览器语言对应的资源文件
            name: 'strings', //资源文件名称
            path: assetsUrl + '/language/', //资源文件路径
            language: lang,
            cache: false,
            mode: 'map', //用Map的方式使用资源文件中的值
            callback: function () {//加载成功后设置显示内容
                // console.log(lang);
                // console.log($.i18n.map);
            }
        });
    },

    //张智俊写的js,Web/themes/default/views/layouts/resource/footerNav.php
    leaveAMessage: function () {
        $('.open-menu').on('click', function (e) {
            e.stopPropagation();
            $(this).toggleClass('active').prev().toggleClass('show-menu');
            $('.shade').toggleClass('show');
        });
        $('.draggable').on('click', function (e) {
            e.stopPropagation();
        });
        $('.shade').on('click', function (e) {
            $(this).removeClass('show');
            $('.open-menu').removeClass('active').prev().removeClass('show-menu');
        });
    },

    agreeCookie: function () {
        $('.cookieBar .btnGroup a').on('click', function () {
            $('.cookieBar').fadeOut()
        });
        $('.cookieBar .btnGroup a.agree').on('click', function () {
            $url = webUrl + '/index/agreePrivacyPolicy.html';
            $.get($url);
        });
    },


    // Download列表中最后copy link 按钮的js事件
    downloadLinkCopy() {
        $('.download-list .copy_link').on('click', function (event) {
            let link = $(this).prev('a').attr('href');
            $(this).attr('data-clipboard-text', link);
            let clip = new ClipboardJS('.copy_link');
            Helper.successMsg($.i18n.map['download link copy successfully']);
            return clip;
        });
    },

    // 获取url上get参数
    getQuery(key){
        let query = window.location.search.substring(1)
        let map  = query.split("&")
        for(let i = 0; i < map.length; i++){
            let pair = map[i].split("=")
            if(pair[0]  == key){
                return pair[1]
            }
        }
    }
}, {});