var historyStack = JSON.parse(sessionStorage.getItem("historyStack") || "[]");
console.log("切切切切切切切切", historyStack);
$(document).ready(function () {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // 如果在App环境下打开
    if (/U-tec_Home_android/i.test(userAgent)) {
        // 添加样式
        var css = 'body.big-header .max-w1440 .main-header-wrapper header {height: 50px;} body.big-header .max-w1440 .main-header-wrapper header .header-actions {height: 50px;} .branding .shop-name{height: 50px;}',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            // 这是为了兼容IE8及以下版本
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);

        $('.branding .shop-name .bgimg2').css('display', 'block');
        $('.branding .shop-name .bgimg1').css('display', 'none');

        localStorage.setItem("logoChanged", "true");
        console.log(navigator.userAgent, 'userAgent99999999999999 App');

    } else {
        $('.branding .shop-name .bgimg1').css('display', 'block');
        $('.branding .shop-name .bgimg2').css('display', 'none');
        console.log(navigator.userAgent, 'userAgent6666666666 浏览器')
    }
    // 存储在本地
    if (localStorage.getItem("logoChanged") === "true") {
        $(".branding .shop-name .bgimg2").css("display", "block");
        $(".branding .shop-name .bgimg1").css("display", "none");
        var css =
            "body.big-header .max-w1440 .main-header-wrapper header {height: 50px;} body.big-header .max-w1440 .main-header-wrapper header .header-actions {height: 50px;} .branding .shop-name{height: 50px;}",
            head = document.head || document.getElementsByTagName("head")[0],
            style = document.createElement("style");
        style.type = "text/css";
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    }

    // 当打开新页面时
    window.onunload = function () {
        var count = parseInt(localStorage.getItem("newPageCount") || "0");
        localStorage.setItem("newPageCount", count + 1);
    }
    // 当页面加载时
    $(document).ready(function () {
        var historyStack = JSON.parse(sessionStorage.getItem("historyStack") || "[]");
        historyStack.push(window.location.href);
        sessionStorage.setItem("historyStack", JSON.stringify(historyStack));
    });

    // 添加点击事件
    $(".branding .shop-name .bgimg2").click(function () {
        var historyStack = JSON.parse(sessionStorage.getItem("historyStack") || "[]");
        if (historyStack.length > 1) { // 如果历史堆栈中有至少两个URL，返回到倒数第二个URL
            historyStack.pop(); // 移除当前页面的URL
            var lastUrl = historyStack.pop(); // 获取倒数第二个URL
            sessionStorage.setItem("historyStack", JSON.stringify(historyStack));
            window.location.href = lastUrl;
            console.log("返回上一步成功HHHHHHHHHHHHHHHH", historyStack);
        } else { // 否则，添加 "#backToApp" 后缀并刷新页面
            window.location.href = window.location.href + "#backToApp";
            window.location.reload();
            console.log("返回App成功wwwwwwww", historyStack);

        }
    });

    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var shouldAddHash = false;

    // 如果在App环境下打开
    if (/U-tec_Home_android/i.test(userAgent)) {
        $('.productList li').on('click', '.add-to-cart', function (event) {
            event.preventDefault();
            var id = $(this).parents('.item').attr('data-variant');
            console.log('data-variant  ' + id)
            window.location.href = window.location.href + "?addToCart" + id + "#toSystemBrowser";
            // window.location.href = window.location.href + "?addToCart=" + id;
            shouldAddHash = true;
            console.log(navigator.userAgent, 'userAgent11111111111111to#SystemBrowser');

            var screenW = window.innerWidth;
            if (screenW < 850) {
                $('.cart-template-fixed').addClass('show-mobile-cart').removeAttr('hidden');
            }

            // $(".add-to-cart").click(function(event){
            //     event.preventDefault();
            //  window.location.href = window.location.href + "?addToCart"+ "#toSystemBrowser";
            //     shouldAddHash = true;
            //     console.log(navigator.userAgent,'userAgent11111111111111to#SystemBrowser');
            // });

        });
    }

    // 检查网页加载时的参数
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('addToCart');
    if (id) {
        addToCart(id);  // 如果参数匹配，调用你的函数
    }
});


