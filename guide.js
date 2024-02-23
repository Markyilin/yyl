
jQuery('body').on('click','.cart_close',function(e){
    e.stopPropagation()
    jQuery('#shopify-section-cart-template').hide().removeClass('show-all')
    localStorage.setItem("cart_states","false")
   $('.cart-template-fixed').hide()
  });
  jQuery.getJSON('/cart.js',function(res){
    if(res.item_count>0){
       $('.cart-template-fixed').show()
    }else{
       $('.cart-template-fixed').hide()
    }
  })
  function onShoppingCart(params) {
     // e.preventDefault();
     $.ajax({
        url:'/cart/add.js',
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        headers:{},
        dataType: 'text',
        data:{
        "quantity": 1, // 数量
        "id": sessionStorage.getItem('id') // 商品ID
       },
      success: function() {
        colorbar.go(99.999999)
        // 加入购物车成功后重新加载购物车弹窗
        jQuery.getJSON('/cart.js',function(res){
          // console.log(res,'resres')
          if(res.item_count>0){
             $('.cart-template-fixed').removeAttr('hidden');
            $('.cart-template-fixed .shopify-section').css({
              'bottom': '-31px'
            });
            
            jQuery('.cart-template-fixed').load('/pages/cart-1.html #shopify-section-cart-template',()=>{
            let titleList = jQuery('.cart-info .pro-title')
            for(let i = 0 ; i<titleList.length ; i++){
              let title = jQuery('.cart-info .pro-title:eq(' + i + ')').text().split('/')
              title = title.join('-')
              jQuery('.cart-info .pro-title:eq(' + i + ')').text(title)
            }
            jQuery('.cart-header').css("display","none")  
          window.dispatchEvent(new CustomEvent('initCartOffers'));
            })
           $('.cart-template-fixed').show()
            }else{
               $('.cart-template-fixed').attr('hidden')
              $('.cart-template-fixed').hide()
            }
          })
     },
      error: function(data) {
        console.log(data,'data')
        alert(data.statusText);
      // 处理请求失败的响应数据
    }
    })
  }
  
  //更新
  function updatePro(){
    var updates = [];
    $('.cart-box ul').each(function(){
        var li = $(this)[0].children;
      updates = []
      for(var i = 0; i < li.length; i++){
          var num = li[i].dataset.num;
          updates.push(num);
      };
  
      // var url = 'https://u-tec.com/cart';
      var url = '/cart';
      var data = {
            "updates":updates
      };
      $.post(url,data,function($result){
          // EXTEND -- Call initCartOffers on updating item
            window.dispatchEvent(new CustomEvent('initCartOffers'));
      })
    })
  }
  
  // 点击分享icon展示输入框
  function onsharenone(){
      document.getElementById('ico-int-eml').className="ico-int-emls"
      document.getElementById('share_ic_int-eml').className="int-emlblack"
  }
  // 吸顶
  var speedOfprogress=document.getElementById('speedOfprogress')  
  let speedOfprogressFixed = document.querySelector(".speedOfprogressFixed")
  document.addEventListener("scroll",(e)=>{
    if(document.documentElement.scrollTop>100){
       speedOfprogressFixed.classList.add('fix')
    }else{
       speedOfprogressFixed.classList.remove('fix')
    }
  })
  // var DoorMantle=document.getElementById('doorMantle').style.display='none'
  // 点击进度标题事件
  function onDesignMyDoo(){
     document.querySelector('#door').scrollIntoView(true)
  window.scrollBy(0, -110); // Adjust scrolling with a negative value here
  }
  function onFilterLockType(){
     document.querySelector('#title').scrollIntoView(true)
  window.scrollBy(0, -240); // Adjust scrolling with a negative value here
  }
  function onGotoBuy(){
   // document.getElementById('GotoBuy').getElementsByTagName('a').src
    if(sessionStorage.getItem('linkjump')){
     document.getElementById('GotoBuy').getElementsByTagName('a')[0].href= sessionStorage.getItem('linkjump')
      colorbar.go(99.999999)
      
    }else{
      alert('Please select a product. ')
    }
  }
   var colorbar = new Nanobar({target: document.getElementById('color')});
   colorbar.go(33);
   var progressColorbar = new Nanobar({target: document.getElementById('progressColor')});
    progressColorbar.go(25);
  // 刷新页面调用
  window.addEventListener('beforeunload', function(event) {
        sessionStorage.removeItem('doorindex')
      sessionStorage.removeItem('doorStepthree')
      sessionStorage.removeItem('doorStepfour')
      sessionStorage.removeItem('GotoBuyStepthree')
      sessionStorage.removeItem('linkjump')
      sessionStorage.removeItem('price')
      sessionStorage.removeItem('id')
    
  }, false);
  function onshare(){
    sessionStorage.setItem("doorStepfour",4)
    if(!document.getElementById("CSDN_NAME").value){
      alert("Please enter email. ")
      return
    }else{
      document.getElementById('share_ic_int-eml').className="int-eml"
      document.getElementById('ico-int-eml').className='ico-int-eml'
      alert("Share success")
    }
    new html2canvas(document.getElementById('let-scenery-content'),{    
        allowTaint: true,  //开启跨域
        useCORS: true,
      }).then(function(canvas) {
          let tempImg = new Image();
          tempImg.src = canvas.toDataURL("image/png") // 导出图片
          // 本地
          // b6转换url
          if(tempImg.src&&document.getElementById("CSDN_NAME").value){
            axios({
              baseURL: 'https://my.u-tec.com/api',
              url:'/file/upload',
              method: 'post', // 默认值
             headers:{'Content-Type': 'application/json',
                      "Access-Control-Allow-Origin": "*",
                      'Accept': 'application/json'
                     },
              data:{
                base64:tempImg.src
              }
            }).then(function (response) {
              if(response.status==200){
                axios({
                    baseURL: 'https://my.u-tec.com/api',
                    url:'/email/send ',
                    method: 'post', // 默认值
                    // timeout: 1000,
                   headers:{'Content-Type': 'application/json',
                            "Access-Control-Allow-Origin": "*",
                            'Accept': 'application/json'
                           },
                    data:{
                      // base64:tempImg.src
                        "email": document.getElementById("CSDN_NAME").value,
                      //  <br />
                        "description":"I found the perfect ULTRALOQ for my door. <br />Shop now: " +  sessionStorage.getItem("linkjump"),
                        "image":response.data.data.path,
                        "template_id":'22'
                    }
                  }) .then(function (response) {
                    document.getElementById("CSDN_NAME").value=''
                  }) .catch(function (error) {
                  })
              }
            })
            .catch(function (error) {
              // console.log(error);
            })
          }else{
            alert('Please enter an email address to send your design.')
          }
    });
  }
  function GotoBuy() {
     if(sessionStorage.getItem('linkjump')){
      var Countryna=window.location.href.substring(18,23)
       var Countrynaname= sessionStorage.getItem('alllockintname')
        if(Countryna=="en-ca"||Countryna=="en-au"){
             let newStr = sessionStorage.getItem('linkjump').slice(0, 18) + Countryna+'/' +  sessionStorage.getItem('linkjump').slice(18);
            document.getElementById('gotoBuystys').getElementsByTagName('a')[0].href= newStr
           
         
       
        }else {
          document.getElementById('gotoBuystys').getElementsByTagName('a')[0].href= sessionStorage.getItem('linkjump')
        }
    }else{
      alert('Please select a product! ')
    }
     var GotoBuy=document.getElementById('GotoBuy')
     colorbar.go(99.99999)
     sessionStorage.setItem("GotoBuyStepthree",3)
     GotoBuy.className="speedOfprogressFixed-item"
  }
  
  window.onload = function(){
     document.getElementById('doorMantle').src='https://cdn.shopify.com/s/files/1/0795/7689/files/Door.png?v=1672969692'
  // 数据
  var listAlllock={
     AlllockList:[
      {
        index:1,
        id:'43330938732785',
        Lockname:"U-Bolt Pro WiFi",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_Pro_WiFi.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_pro-black.png?v=1676446234',
        Price:'199.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-pro-series?variant=43330938732785',
        color:"Black",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
         icon:[
          'icon-wifi',
          'icon-pro-bluetooth'
        ],
      },{
        index:2,
        id:'43330938667249',
        Lockname:"U-Bolt Pro with Bridge",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_Pro_with_Bridge.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_pro-black.png?v=1676446234',
        Price:'169.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-pro-series?variant=43330938667249',
        color:"Black",
        funName:'Bluetooth, WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:3,
        id:'43330938798321',
        Lockname:"U-Bolt Pro Z-Wave",
        lockimg:'https://cdn.shopifycdn.net/s/files/1/0795/7689/files/U-BoltProZ-Wave.png?v=1683616165',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_pro-black.png?v=1676446234',
        Price:'199.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-pro-series?variant=43330938798321',
        
        color:"Black",
        funName:'Bluetooth, Z-Wave',
        discount:'20% OFF with code EASTER20',
        icon:[
        'icon-Z-wave',
        'icon-pro-bluetooth'
        ]
        
      },{
        index:4,
        id:'42741866299633',
        Lockname:"U-Bolt Pro",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_Pro.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_pro-black.png?v=1676446234',
        Price:'149.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-pro-series?variant=42741866299633',
        color:"Black",
        funName:'Bluetooth',
        discount:'20% OFF with code EASTER20'   ,   
        icon:[
        'icon-pro-bluetooth'
        ]
  
      },{
        index:5,
        id:'43330938241265',
        Lockname:"U-Bolt WiFi",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_B_WiFi.png?v=1672902202',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-Black.png?v=1676446458',
        Price:'149.99',
        Linkjump:'https://u-tec.com/products/u-bolt-wifi-smartlock',
        color:"Black",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:6,
        id:'43330938208497',
        Lockname:"U-Bolt WiFi",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/4_U-Bolt_S_WiFi.png?v=1675666647',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-yinse.png?v=1676446458',
        Price:'149.99',
        Linkjump:'https://u-tec.com/products/u-bolt-wifi-smartlock',
        color:"Satin Nickel",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:7,
        id:'43330938175729',
        Lockname:"U-Bolt with Bridge",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/5_U-Bolt_B_with_Bridge.png?v=1675665962',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-Black.png?v=1676446458',
        Price:'109.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-bluetooth-enabled-and-keypad-smart-deadbolt',
        color:"Black",
        funName:'Bluetooth, WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:8,
        id:'43330938142961',
        Lockname:"U-Bolt with Bridge",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_S_with_Bridge.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-yinse.png?v=1676446458',
        Price:'109.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-bluetooth-enabled-and-keypad-smart-deadbolt',
        color:"Satin Nickel",
        funName:'Bluetooth, WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:9,
        id:'43330938306801',
        Lockname:"U-Bolt Z-Wave",
        lockimg:'https://cdn.shopifycdn.net/s/files/1/0795/7689/files/ultraloq-u-bolt-series-wifi-black-ga-145.png?v=1683364935',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-Black.png?v=1676446458',
        Price:'159.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-z-wave-smart-lock',
        color:"Black",
        funName:'Bluetooth, Z-Wave',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-Z-wave',
          'icon-pro-bluetooth'
        ]
      },{
        index:10,
        id:'43330938274033',
        Lockname:"U-Bolt Z-Wave",
        lockimg:' https://cdn.shopifycdn.net/s/files/1/0795/7689/files/ultraloq-u-bolt-series-z-wave-satin-nickel-ga-916.png?v=1683364928',
        // https://cdn.shopify.com/s/files/1/0795/7689/files/6_U-Bolt_S_Z-Wave.png?v=1675666118
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-yinse.png?v=1676446458',
        Price:'159.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-z-wave-smart-lock',
        color:"Satin Nickel",
        funName:'Bluetooth, Z-Wave',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-Z-wave',
          'icon-pro-bluetooth'
        ]
      },{
        index:11,
        id:'43330938110193',
        Lockname:"U-Bolt",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_Pro.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-Black.png?v=1676446458',
        Price:'89.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-series?variant=42741869019377',
        color:"Black",
        funName:'Bluetooth',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-pro-bluetooth'
        ]
  
      },{
        index:12,
        id:'42741869019377',
        Lockname:"U-Bolt",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/U-Bolt_S.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-U-Bolt_-yinse.png?v=1676446458',
        Price:'89.99',
        Linkjump:'https://u-tec.com/products/ultraloq-u-bolt-series?variant=42741869019377',
        color:"Satin Nickel",
        funName:'Bluetooth',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-pro-bluetooth'
        ]
  
      },{
        index:13,
        id:'43153464951025',
        Lockname:"Latch 5 Fingerprint",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/8_Latch_5_F_B.png?v=1675666404',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-Latch_5-F-Black.png?v=1676446662',
        Price:'249.99',
        Linkjump:'https://u-tec.com/products/latch-5-fingerprint',
        color:"Black",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:14,
        id:'43153464983793',
        Lockname:"Latch 5 Fingerprint",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Latch_5_F_S.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-Latch-5-F-SN?v=1676449602',
        Price:'249.99',
        Linkjump:'https://u-tec.com/products/latch-5-fingerprint',
        color:"Satin Nickel",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:15,
        id:'43330956951793',
        Lockname:"UL3 with Bridge",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/UL3_black_app_bridge.png?v=1676447518',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/UL3-BK?v=1676449602',
        Price:'209.99',
        Linkjump:'https://u-tec.com/products/ultraloq-ul3-bt-2ndgen-bluetooth-enabled-fingerprint-and-touchscreen-smart-lock-handle?variant=43330956919025',
        color:"Black",
        funName:'Bluetooth, WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:16,
        id:'43330956919025',
        Lockname:"UL3 with Bridge",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/UL3_silver_app_bridge.png?v=1676447518',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-UL3_-yinse.png?v=1676446840',
        Price:'209.99',
        Linkjump:'https://u-tec.com/products/ultraloq-ul3-bt-2ndgen-bluetooth-enabled-fingerprint-and-touchscreen-smart-lock-handle?variant=43330956919025',
        color:"Satin Nickel",
        funName:'Bluetooth, WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:17,
        id:'43330942009585',
        Lockname:"Lever with Bridge",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Lever_with_Bridge.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-Lever-black.png?v=1676446897',
        Price:'209.99',
        Linkjump:'https://u-tec.com/products/ultraloq-lever-bluetooth-enabled-fingerprint-and-touchscreen-smart-lock-handle?variant=43330942009585',
        color:"Black",
        funName:'Bluetooth, WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:18,
        id:'43330956853489',
        Lockname:"UL3",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/UL3_black_app.png?v=1676447706',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/UL3-BK?v=1676449602',
        Price:'189.99',
        Linkjump:'https://u-tec.com/products/ultraloq-ul3-bt-2ndgen-bluetooth-enabled-fingerprint-and-touchscreen-smart-lever-lock',
        color:"Black",
        funName:'Bluetooth',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-pro-bluetooth'
        ]
  
      },{
        index:19,
        id:'39990519300295',
        Lockname:"UL3",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/UL3_silver_app.png?v=1676447705',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-UL3_-yinse.png?v=1676446840',
        Price:'189.99',
        Linkjump:'https://u-tec.com/products/ultraloq-ul3-bt-2ndgen-bluetooth-enabled-fingerprint-and-touchscreen-smart-lever-lock',
        color:"Satin Nickel",
        funName:'Bluetooth',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-pro-bluetooth'
        ]
  
      },{
        index:20,
        id:'42233567346929',
        Lockname:"Lever",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/12_Lever.png?v=1672901836',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-Lever-black.png?v=1676446897',
        Price:'189.99',
        Linkjump:'https://u-tec.com/products/ultraloq-lever-bluetooth-enabled-fingerprint-and-touchscreen-smart-lever-lock',
        color:"Black",
        funName:'Bluetooth',
        discount:'20% OFF with code EASTER20',
        icon:[
        'icon-pro-bluetooth'
        ]
  
  
      },{
        index:21,
        id:'43153465508081',
        Lockname:"Latch 5 NFC",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/8_Latch_5_F_B.png?v=1675666404',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-Latch_5-NFC-Black.png?v=1676446961',
        Price:'229.99',
        Linkjump:'https://u-tec.com/products/latch-5-nfc',
        color:"Black",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      },{
        index:22,
        id:'43153465540849',
        Lockname:"Latch 5 NFC",
        lockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Latch_5_N_S.png?v=1672902201',
        changedlockimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/new-Latch-5-N-SN?v=1676449602',
        Price:'229.99',
        Linkjump:'https://u-tec.com/products/latch-5-nfc',
        color:"Satin Nickel",
        funName:'Bluetooth, Built-in WiFi',
        discount:'20% OFF with code EASTER20',
        icon:[
          'icon-wifi',
          'icon-pro-bluetooth',
        ]
      }
   ]
  }
  var DesignMyDoor=document.getElementById('DesignMyDoor')
    // 获取Question 2里面的三块点击div
    var div1=document.getElementById('div1').getElementsByTagName('div')
    var div2=document.getElementById('div2').getElementsByTagName('div')
    var div3=document.getElementById('div3').getElementsByTagName('div')
    var allTypeData=  document.getElementById('allType').getElementsByTagName('li')
       // 获取Question 2里面的class
    var ul1cl= document.getElementsByClassName('no')
    var ul2cl= document.getElementsByClassName('ul2')
    var ul3cl= document.getElementsByClassName('ul3')
    var shudiva1= ul1cl[0].attributes.int.value
    var shudiva2= ul2cl[0].attributes.div2int.value
     console.log(ul3cl[1],'ul3cl[1].attributes.div3int')
    var shudiva3= ul3cl[1].attributes.div3int?ul3cl[1].attributes.div3int.value:ul3cl[2].attributes.div3int.value
    // 去购买的事件
         // 循环拼接
  
    var Alllockimg
    // listAlllock.AlllockList.forEach((e,index) => {
    //      console.log(listAlllock.AlllockList,'  9999999999999999999999999999999999')
    //     Alllockimg +='<li class="lockall" Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '" Price="'+e.Price+'"  RecommendedProduct="'+e.RecommendedProducts+'"  index="'+index+'" ids="' + e.id + '">'+
    //       '<div   class="lockallContent" Linkjump="'+e.Linkjump+'" Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '" Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'
    //       +'<img src="' + e.lockimg + '"  Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '"  Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'+
    //       '<p class="Alllockcolor"  Linkjump="'+e.Linkjump+'" Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '"  Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'+e.color+'</p>'+
    //       '<p class="AllName"   Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '"  Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '" style="font-weight:bold">'+e.Lockname+'</p>'+
    //       '<p class="AllfunName"  Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '"  Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'+e.funName+'</p>'+
    //       '</div>'
    //       +'<div class="pridiv" Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '" Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'+
    //       '<div class="AllPrice" Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '" Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'+
    //       '<span>'+ '$' +'</span>' +'<span class="spanprice" Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '"  Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'  +e.Price +
    //       '</span>'+
    //       '</div>'+
    //       '<div class="Alldiscount" Linkjump="'+e.Linkjump+'"  Alllockint=" '+ e.Lockname + '" Alllockcolor=" '+ e.color + '" Price="'+e.Price+'" RecommendedProduct="'+e.RecommendedProducts+'" index="'+index+'" ids="' + e.id + '">'+e.discount+'</div>'+'</div>'
    //       +'</li>'
    // });
    //  document.getElementById('allType').innerHTML =Alllockimg.substring(9)
  
    for(var p = 0; p < listAlllock.AlllockList.lenght; p++ ){
      var item = listAlllock.AlllockList[p];
      
      Alllockimg = `<li class="lockall" 
                        data-Linkjump="${item.Linkjump}"
                        data-Alllockint="${item.Lockname}"
                        data-Alllockcolor="${item.color}"
                        data-Price="${item.Price}"
                        data-RecommendedProduct="${item.RecommendedProducts}"
                        data-index="${item.index}"
                        data-ids="${item.id}">
                          <div class="lockallContent">
                              <img src="${item.lockimg}" />
                              <p class="Alllockcolor">${item.color}</p>
                              <p class="AllName">${item.Lockname}</p>
                              <p class="AllfunName">${item.funName}</p>
                          </div>
                          <div class="pridiv">
                              <div class="AllPrice">
                                <span>
                                    ${item.Price}
                                </span>
                              </div>
                          </div>
                          <div class="Alldiscount">
                              ${item.discount}
                          </div>
                    </li>`;
  
      $('#allType').append(Alllockimg);
    }
    
  
    //第一部分的点击事件循环
    for(var i=0;i<allTypeData.length;i++){
      allTypeData[i].onclick = function(i){
         // i.stopPropagation();  //禁止事件冒泡
         if(sessionStorage.getItem("GotoBuyStepthree")){
             colorbar.go(99.999999)
         }else{
          colorbar.go(66)
         }
         // 进度条
         DesignMyDoor.className="speedOfprogressFixed-item"
            // 点击向上滑动
         // document.querySelector('#door').scrollIntoView(true)
         // window.scrollBy(0, -110); // Adjust scrolling with a negative value here
  const dom = document.querySelector('#Anchorpoint').offsetTop
        
        const domspeedOfprogressFixed = document.querySelector('.speedOfprogressFixed').offsetHeight
        var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  
      window.scrollTo({
        top: dom-domspeedOfprogressFixed, //需要滚动的距离
        behavior: 'smooth',
      })
        
   const now = window.scrollY
         var MaskSwitch=document.getElementById('Masksty')
         MaskSwitch.style.display="none"
        
          var share=document.getElementById('shareBut').style.display="block"
        // 获取名称与价钱
           sessionStorage.setItem('alllockintname',i.srcElement.parentElement.attributes[2].value)
           sessionStorage.setItem('price',i.srcElement.parentElement.attributes[4].value)
           sessionStorage.setItem('id',i.srcElement.parentElement.attributes[7].value)
        // 向dom填写内容
           document.getElementById('alllockintname').innerHTML =sessionStorage.getItem('alllockintname')
          document.getElementById('price').innerHTML = '$' + sessionStorage.getItem('price')
          document.getElementById('div3').getElementsByTagName('div')
         // var name=i.srcElement.attributes.length>3?i.srcElement.attributes[2].value:i.srcElement.attributes[1].value
         var color=i.srcElement.attributes[3].value
        var name=i.srcElement.attributes[2].value
        // var color=
         
         listAlllock.AlllockList.forEach((e ,index)=> {
            if(e.Lockname.replace(/\ +/g,"") == name.replace(/\ +/g,"")){
              let Alllock
              Alllock+='<i class="'+ e.icon[0] + '">'+'</i>'+'<i class="'+ e.icon[1] + '">'+'</i>'
              document.getElementById('allicon').innerHTML=Alllock.substring(9)
              if(e.color.replace(/\ +/g,"") == color.replace(/\ +/g,"") ){
                  document.getElementById('lockleftimg').src=e.changedlockimg
                  for(var j=0;j<allTypeData.length;j++){
                    if(allTypeData[j].className == 'border-btm'){
                      allTypeData[j].className="lockall"
                    }
                    
                    if(allTypeData[j].getElementsByTagName('div')[0].className=='gh'){
                      allTypeData[j].getElementsByTagName('div')[0].className="lockallContent"
                    }
                    allTypeData[e.index-1].getElementsByTagName('div')[0].className='gh'
                  }
                allTypeData[e.index-1].className="border-btm"
             }
            }
           
        });
         var cccc=document.getElementById('lock')
         var  shudiva1= ul2cl[0].attributes.div2int.value
         var gotoBuystys = document.getElementById("gotoBuystys");
        var ShoppingCart=document.getElementById("ShoppingCart");
         //获取改属性的唯一值，确定当前坐在位置，用来判断分类的状态
         var  shudiva2= ul2cl[0].attributes.div2int.value
         console.log(ul3cl[1].attributes.div3int,'获取当前所在位置')
         // var  shudiva3= ul3cl[1].attributes.div3int.value
         var shudiva3= ul3cl[1].attributes.div3int?ul3cl[1].attributes.div3int.value:ul3cl[2].attributes.div3int.value
        sessionStorage.setItem('linkjump',i.srcElement.parentElement.attributes[1].value)
  
       var Countryna=window.location.href.substring(18,23)
       var alllockintname= sessionStorage.getItem('alllockintname').replace(/\s+/g, "")
      if(Countryna=="en-ca"||Countryna=="en-au"){
        if(alllockintname=='Lever'||alllockintname=='UL3' ||alllockintname=='UL3 with Bridge' .replace(/\s+/g, "") ||alllockintname=='Lever with Bridge' .replace(/\s+/g, "")){
          gotoBuystys.style.display = "none";
          ShoppingCart.style.display = "none";
          
  
        }else{
          gotoBuystys.style.display = "block";
           ShoppingCart.style.display =  "block";
        }
      }
        
       }
    }
  
   
    //初始化时候给的默认值
    if(shudiva1 == 1 && shudiva2 == 1 && shudiva3 == 1){
      // Outdoor与Indoor的dom当前的下表
      // allTypeData[0-13].style.display='none'
      for (let i = 0; i < allTypeData.length; i++) {
        allTypeData[i].style.display='none'
        allTypeData[0].style.display='block'
        // 默认选择锁类型--注释
        // allTypeData[0].className = 'border-btm'
        //  allTypeData[0].getElementsByClassName('lockallContent').forEach((item,index)=>{
        //    item.className="gh"
        //  })
        var name=allTypeData[0].getElementsByTagName('div')[0].innerText
          listAlllock.AlllockList.forEach(e => {
           if(e.Lockname==name){
              document.getElementById('lockleftimg').src=e.changedlockimg
            }
          })
         allTypeData[1].style.display='block'
      }
      var listdata=document.getElementById('listdata').getElementsByTagName('li')
    }
     
    //第一部分的点击事件循环
    for(var i=0;i<div1.length;i++){
      //点击事件
        div1[i].onclick = function(){
          var shu=this.getAttribute('int');
          var name=this.getAttribute('name');
          var classa=this.getAttribute('class');
          for(var j=0;j<div1.length;j++){
            if(div1[j].className == 'no'){
              div1[j].className=""
            }
          }
          div1[shu-1].className="no"
          shudiva1=shu
          //获取改属性的唯一值，确定当前坐在位置，用来判断分类的状态
          var  shudiva2= ul2cl[0].attributes.div2int.value
          var shudiva3= ul3cl[1].attributes.div3int?ul3cl[1].attributes.div3int.value:ul3cl[2].attributes.div3int.value	
           // var  shudiva3= ul3cl[1].attributes.div3int.value
          //判断分类状态
         if(shu == 1 && shudiva2 == 1 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
               allTypeData[i].style.display='none'
               allTypeData[0].style.display='block'
               allTypeData[1].style.display='block'
            }
           document.getElementById('titlename').innerHTML=''
            
          }else if(shu == 1 && shudiva2 == 1 && shudiva3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
               allTypeData[2].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shu == 1 && shudiva2 == 1 && shudiva3 == 3){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[3].style.display='block'
            }
           document.getElementById('titlename').innerHTML=''
           
          }else if(shu == 1 && shudiva2 == 3 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
               allTypeData[i].style.display='none'
               allTypeData[4].style.display='block'
               allTypeData[5].style.display='block'
               allTypeData[6].style.display='block'
               allTypeData[7].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shu == 1 && shudiva2 == 3 && shudiva3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[8].style.display='block'
                allTypeData[9].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shu == 1 && shudiva2 == 3 && shudiva3 == 3){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[10].style.display='block'
               allTypeData[11].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }
          else if(shu == 2 && shudiva2 == 1 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[12].style.display='block'
                 allTypeData[13].style.display='block'
                 allTypeData[14].style.display='block'
               allTypeData[15].style.display='block'
               allTypeData[16].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shu == 2 && shudiva2 == 1 && shudiva3 == 3){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[17].style.display='block'
              allTypeData[18].style.display='block'
               allTypeData[19].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shu == 2 && shudiva2 == 2 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[20].style.display='block'
               allTypeData[21].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shu == 1 && shudiva2 == 2 && shudiva3 == 3){
           for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else if(shu == 1 && shudiva2 == 2 && shudiva3 == 2){
           for (let i = 0; i < allTypeData.length; i++) {
              if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro Z-Wave').replace(/\ +/g,"")){
                allTypeData[i].style.display='block'
              }else{
                allTypeData[i].style.display='none'
              }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
          }else if(shu == 1 && shudiva2 == 2 && shudiva3 == 1){
           for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro WiFi').replace(/\ +/g,"")){
                  allTypeData[i].style.display='block'
                }else{
                allTypeData[i].style.display='none'
              }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else if(shu == 2 && shudiva2 == 1 && shudiva3 == 2){
            for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 Fingerprint').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
          }else if(shu == 2 && shudiva2 == 2 && shudiva3 == 3||shu == 2 && shudiva2 == 2 && shudiva3 == 2){
            for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 NFC').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else if(shu == 2 && shudiva2 == 3 && shudiva3 == 1 || shu == 2 && shudiva2 == 3 && shudiva3 == 2 ||shu == 2 && shudiva2 == 3 && shudiva3 == 3){
            for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 Fingerprint').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
          }
      }
    }
     
        for(var i=0;i<div2.length;i++){
        div2[i].onclick = function(){
          var shudiv2=this.getAttribute('div2int');
          
          for(var j=0;j<div2.length;j++){
            if(div2[j].className == 'ul2'){
              div2[j].className=""
            }
          }
          div2[shudiv2-1].className="ul2"
          var  shudiva1= ul1cl[0].attributes.int.value
          var shudiva3= ul3cl[1].attributes.div3int?ul3cl[1].attributes.div3int.value:ul3cl[2].attributes.div3int.value	
          // var  shudiva3= ul3cl[1].attributes.div3int.value
          if(shudiva1 == 1 && shudiv2 == 1 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
               allTypeData[i].style.display='none'
               allTypeData[0].style.display='block'
               allTypeData[1].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiv2 == 1 && shudiva3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
               allTypeData[2].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiv2 == 1 && shudiva3 == 3){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[3].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiv2 == 3 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
               allTypeData[i].style.display='none'
               allTypeData[4].style.display='block'
               allTypeData[5].style.display='block'
               allTypeData[6].style.display='block'
               allTypeData[7].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiv2 == 3 && shudiva3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[8].style.display='block'
                allTypeData[9].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiv2 == 3 && shudiva3 == 3){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[10].style.display='block'
               allTypeData[11].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }
          else if(shudiva1 == 2 && shudiv2 == 1 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[12].style.display='block'
                 allTypeData[13].style.display='block'
                 allTypeData[14].style.display='block'
               allTypeData[15].style.display='block'
               allTypeData[16].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 2 && shudiv2 == 1 && shudiva3 == 3){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[17].style.display='block'
              allTypeData[18].style.display='block'
               allTypeData[19].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 2 && shudiv2 == 2 && shudiva3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[20].style.display='block'
               allTypeData[21].style.display='block'
            }
  document.getElementById('titlename').innerHTML=''
            
          }
          else if(shudiva1 == 1 && shudiv2 == 2 && shudiva3 == 3){
             for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }else if(shudiva1 == 1 && shudiv2 == 2 && shudiva3 == 2){
            for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro Z-Wave').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          } else if(shudiva1 == 1 && shudiv2 == 2 && shudiva3 == 1){
             for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro WiFi').replace(/\ +/g,"")){
                    allTypeData[i].style.display='block'
                }else{
                     allTypeData[i].style.display='none'
                }
           
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }else if(shudiva1 == 2 && shudiv2 == 1 && shudiva3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
             
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 Fingerprint').replace(/\ +/g,"")){
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }else if(shudiva1 == 2 && shudiv2 == 2 && shudiva3 == 3 ||shudiva1 == 2 && shudiv2 == 2 && shudiva3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 NFC').replace(/\ +/g,"")){
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else if(shudiva1 == 2 && shudiv2 == 3 && shudiva3 == 1 || shudiva1 == 2 && shudiv2 == 3 && shudiva3 == 2 ||shudiva1 == 2 && shudiv2 == 3 && shudiva3 == 3){
           for (let i = 0; i < allTypeData.length; i++) {
              if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 Fingerprint').replace(/\ +/g,"")){
                allTypeData[i].style.display='block'
              }else{
                allTypeData[i].style.display='none'
              }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
          }
  
      }
    }
     for(var i=0;i<div3.length;i++){
        div3[i].onclick = function(){
           var shudiv3=this.getAttribute('div3int');
          var classname= document.getElementsByClassName('ul3')
  
          for(var j=0;j<div3.length;j++){
            if(div3[j].className == 'ul3'){
              div3[j].className=""
            }
          }
           div3[shudiv3-1].className="ul3"
          var ul1cl= document.getElementsByClassName('no')
          var  shudiva1= ul1cl[0].attributes.int.value
          var  shudiva2= ul2cl[0].attributes.div2int.value
          if(shudiva1== 1 && shudiva2 == 1 && shudiv3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
               allTypeData[2].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiva2 == 1 && shudiv3 == 1){
            for (let i = 0; i < allTypeData.length; i++) {
              
              allTypeData[i].style.display='none'
              allTypeData[0].style.display='block'
               allTypeData[1].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiva2 == 1 && shudiv3 == 3){
            for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[3].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiva2 == 3 && shudiv3 == 1){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[4].style.display='block'
               allTypeData[5].style.display='block'
               allTypeData[6].style.display='block'
               allTypeData[7].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiva2 == 3 && shudiv3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[8].style.display='block'
                allTypeData[9].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else if(shudiva1 == 1 && shudiva2 == 3 && shudiv3 == 3){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[10].style.display='block'
               allTypeData[11].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else  if(shudiva1==2 && shudiva2 == 1 && shudiv3 == 1){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
                 allTypeData[12].style.display='block'
                 allTypeData[13].style.display='block'
                 allTypeData[14].style.display='block'
               allTypeData[15].style.display='block'
               allTypeData[16].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }
          else  if(shudiva1==2 && shudiva2 == 1 && shudiv3 == 3){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
           
              allTypeData[17].style.display='block'
              allTypeData[18].style.display='block'
               allTypeData[19].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }else  if(shudiva1==2 && shudiva2 == 2 && shudiv3 == 1){
             for (let i = 0; i < allTypeData.length; i++) {
              allTypeData[i].style.display='none'
              allTypeData[20].style.display='block'
               allTypeData[21].style.display='block'
            }
            document.getElementById('titlename').innerHTML=''
          }
          
          else if(shudiva1== 1 && shudiva2== 2 && shudiv3==3){
              for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          
          else if(shudiva1== 1 && shudiva2== 2 && shudiv3== 2){
             for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro Z-Wave').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else if(shudiva1== 1 && shudiva2== 2 && shudiv3== 1){
             for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('U-Bolt Pro WiFi').replace(/\ +/g,"")){
                  allTypeData[i].style.display='block'
                }else{
                allTypeData[i].style.display='none'
              }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else  if(shudiva1==2 && shudiva2 == 1 && shudiv3 == 2){
             for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 Fingerprint').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }
          else  if(shudiva1==2 && shudiva2 == 2 && shudiv3 == 2||shudiva1==2 && shudiva2 == 2 && shudiv3 == 3){
              for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 NFC').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
           
          }else  if(shudiva1==2 && shudiva2 == 3 && shudiv3 == 1||shudiva1==2 && shudiva2 == 3 && shudiv3 == 2||shudiva1==2 && shudiva2 == 3 && shudiv3 == 3){
              for (let i = 0; i < allTypeData.length; i++) {
                if(String(allTypeData[i].getAttribute("alllockint").replace(/\ +/g,""))==String('Latch 5 Fingerprint').replace(/\ +/g,"")){
              
                  allTypeData[i].style.display='block'
                }else{
                  allTypeData[i].style.display='none'
                }
            }
           document.getElementById('titlename').innerHTML='No products were found matching your selection. View our suggested products below. '
            
          }
      }
    }
  
  // 更换风景位置
        var outdoorList={
            willList:[
              {
                index:0,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor1.webp?v=1684199346",
                 willint:0
              },{
                index:1,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor2.webp?v=1684199451",
                  willint:1
              },{
                index:2,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor3.webp?v=1684199483",
                  willint:2
              },{
                index:3,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor4.webp?v=1684199504",
                  willint:3
              },{
                index:4,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor5.webp?v=1684199617",
                  willint:4
              },{
                index:5,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor10.webp?v=1684199771",
                willint:5
              },{
                index:6,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/outdoor7.png?v=1672394014",
                willint:6
              },{
                index:7,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/outdoor8.png?v=1672394009",
                willint:7
              },{
                index:8,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/outdoor9.png?v=1672394019",
                willint:8
              },,{
                index:9,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/Which-product-suits-you-best1.jpg?v=1676534077",
                willint:9
              },{
                index:10,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/Which-product-suits-you-best.jpg?v=1676534077",
                willint:10
              },{
                index:11,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor13.webp?v=1684202195",
                willint:11
              },{
                index:12,
                willimg:"https://cdn.shopifycdn.net/s/files/1/0795/7689/files/outdoor14.webp?v=1684202195",
                willint:12
              }
            ],
            doorList:[
              {
                index:0,
                doorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door1-white.png?v=1672997011',
                doorint:1,
                doorListselectcolor:[
                    {index:0,
                     doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door1-white.png?v=1672997011',
                     colorname:'1'},{index:1,
                     doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door1-yellow.png?v=1672997011',
                     colorname:'2'},{index:2,
                     doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door1-blue.png?v=1672997011',
                     colorname:'3'}, {index:3,
                     doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door1-red.png?v=1672997011',
                     colorname:'4'}, {index:4,
                     doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door1-black.png?v=1672997011',
                     colorname:'5'}
                ]
              },
              {index:1,doorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door2-white.png?v=1672969693',
                doorint:2,
                doorListselectcolor:[{ index:0,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door2-white.png?v=1672969693',
                      colorname:'1'},{index:1,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door2-yellow.png?v=1672997011',
                      colorname:'2'}, {
                      index:2,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door2-blue.png?v=1672997011',
                      colorname:'3'}, {
                      index:3,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door2-red.png?v=1672997011',
                      colorname:'4'}, {
                      index:4,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door2-black.png?v=1672997011',
                      colorname:'5'}
                ]
              },
                {index:2,doorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door3-white.png?v=1672969691',
                 doorint:3,
                  doorListselectcolor:[{
                      index:0,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door3-white.png?v=1672969691',
                      colorname:'1'},{
                      index:1,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door3-yellow.png?v=1672997011',
                      colorname:'2'}, {
                      index:2,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door3-blue.png?v=1672997011',
                      colorname:'3'}, {
                      index:3,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door3-red.png?v=1672997011',
                      colorname:'4'}, {
                      index:4,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door3-black.png?v=1672997011',
                      colorname:'5'}
                  ]
                },
              {index:3,doorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door4-white.png?v=1672969689',
               doorint:4,
                doorListselectcolor:[{
                      index:0,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door4-white.png?v=1672969689',
                      colorname:'1'},{
                      index:1,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door4-yellow.png?v=1672997011',
                      colorname:'2'}, {
                      index:2,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door4-blue.png?v=1672997011',
                      colorname:'3'}, {
                      index:3,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door4-red.png?v=1672997011',
                      colorname:'4'}, {
                      index:4,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door4-black.png?v=1672997011',
                      colorname:'5'}
                ]
              },
              {index:4,doorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door5-white.png?v=1672969691',
               doorint:5,
                doorListselectcolor:[{index:0,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door5-white.png?v=1672969691',
                      colorname:'1'},{index:1,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door5-yellow.png?v=1672997011',
                      colorname:'2'}, {index:2,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door5-blue.png?v=1672997011',
                      colorname:'3'}, {index:3,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door5-red.png?v=1672997011',
                      colorname:'4'}, {index:4,
                      doorListselectcolorimg:'https://cdn.shopify.com/s/files/1/0795/7689/files/Door5-black.png?v=1672997011',
                      colorname:'5'}
                  ]
              }
            ]
      }
        var outdoorLists=outdoorList
        var indoorList={
            willList:[{
                index:0,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/wecom-temp.jpg?v=1676604645",
                willint:0},{
                index:1,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/wecom-temp-298946.jpg?v=1676604645",
                willint:1},{
                index:2,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/wecom-temp-356827.jpg?v=1676604645",
                willint:2},{
                index:3,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/wecom-temp-270140.jpg?v=1676604645",
                willint:3},{
                index:4,
                willimg:"https://cdn.shopify.com/s/files/1/0795/7689/files/wecom-temp-265807.jpg?v=1676604645",
                willint:4}
            ],
           doorList:outdoorList.doorList
        }
        var colorList={
          colorLists:[{index:1,color:'#ffffff', colorname:'white',colorint:1,},
                      {index:2,color:'#efe4c2',colorname:'yellow',colorint:2,},
                      {index:3,color:'#4b6984',colorname:'blue',colorint:3,},
                      {index:4,color:'#9f353b',colorname:'red',colorint:4,},
                      {index:5,color:'#3c3c3c',colorname:'black',colorint:5,}
                     ]
        }
        var willOrdoorInt
    // 点击分类下的列表展示
  
  
    // Outdoor与Indoor的dom
    var OutdoorOrIndoor=document.getElementById('OutdoorOrIndoor').getElementsByTagName('span')
    // 墙与门与颜色的dom
    var willOrdoorOrcolor=document.getElementById('willOrdoorOrcolor').getElementsByTagName('li')
    // Outdoor与Indoor的dom当前的下表
    var OutdoorOrIndoorstcla=document.getElementById('OutdoorOrIndoor').getElementsByClassName('stcla')
    var willOrdoorOrcolorint=document.getElementById('willOrdoorOrcolor').getElementsByClassName('door-right-willordoororcolor')
    var text=OutdoorOrIndoorstcla[0].innerText//获取展示列表
    var Outdoorint=OutdoorOrIndoorstcla[0].attributes.int.value//获取展示列表
    var willint=willOrdoorOrcolorint[0].attributes.int.value//获取展示列表
    var StandStra
    const fenlei=document.getElementById('listdata').getElementsByTagName('li')
  
    if(Outdoorint==1&&willint==1){
        // 循环拼接
      outdoorList.willList.forEach((e ,index)=> {
         StandStra +='<li class="listimg" outwillint=" '+index +'">' + '<img doorleftbgint="'+e.willint + '" src="' + e.willimg + '" alt="">'+'</li>'
      });
      document.getElementById('listdata').innerHTML=StandStra.substring(9);
  
      var doorleftbgimg=document.getElementById('doorleftbgimg').src=outdoorList.willList[0].willimg
      var doorleftimg=document.getElementById('doorleftimg').src=outdoorList.doorList[0].doorimg
    }
       // var  outdoorLists
  
    var OutdoorOrIndoorint=''
    
    // 判断是内门还是外门
      if(text=='Outdoor'){
      OutdoorOrIndoorint='Outdoor'
    }else if(text=='indoor'){
       OutdoorOrIndoorint='indoor'
    }
    // Outdoor与Indoor的dom---循环内外们的dom
      for(var i=0;i<OutdoorOrIndoor.length;i++){
        // 点击内外门事件
        OutdoorOrIndoor[i].onclick=function(){
          var intwillall=document.getElementById('willOrdoorOrcolor').getElementsByClassName('door-right-willordoororcolor')[0].getAttribute('int')
          // 获取他的int值
           var OutOrInInt=this.getAttribute('int');
             willOrdoorOrcolor[1].className = ""
             willOrdoorOrcolor[2].className = ""
            willOrdoorOrcolor[0].className = 'door-right-willordoororcolor'
          // 获取分类的dom
           var inwillOrdoorOrcolorint=document.getElementById('willOrdoorOrcolor').getElementsByClassName('door-right-willordoororcolor')
           var inwillint=inwillOrdoorOrcolorint[0].attributes.int.value//获取第一个分类的dom 
           var Standlist
           for(var j=0;j<OutdoorOrIndoor.length;j++){
            if(OutdoorOrIndoor[j].className == 'stcla'){
              OutdoorOrIndoor[j].className=""
            }
          }
           OutdoorOrIndoor[OutOrInInt-1].className="stcla"
          // 判断如果等于内门/外门的时候，更改他的数据
          if(OutOrInInt==1){
            OutdoorOrIndoorint='Outdoor'
             outdoorList=outdoorLists
          }else if(OutOrInInt==2){
            OutdoorOrIndoorint='indoor'
            outdoorList=indoorList
          }
          
        // 四个if判断，根据内门，外门和风景门的样式去展示对应的，门或者风景的数据
          if(OutOrInInt==1 && inwillint==1){
              outdoorList.willList.forEach((e ,index)=> {
                Standlist +='<li class="listimg"  outwillint=" '+index +'">' + '<img doorleftbgint="'+e.willint + '" src="' + e.willimg + '" alt="">'+'</li>'
              });
            document.getElementById('listdata').innerHTML=Standlist.substring(9);
          }
          if(OutOrInInt==1&&inwillint==2){
            outdoorList.doorList.forEach((e,index) => {
              Standlist +='<li class="listimg" outdoorint=" '+ index + '"  >' + '<img   doorint=" '+index + '"  src="' + e.doorimg + '" alt="">'+'</li>'
            });
            document.getElementById('listdata').innerHTML=Standlist.substring(9);
          }
          if(OutOrInInt==2&&inwillint==1){
             indoorList.willList.forEach((e,index) => {
              Standlist +='<li class="listimg" outwillint=" '+index +'" >' + '<img  doorleftbgint="'+index + '"  src="' + e.willimg + '" alt="">'+'</li>'
               
            });
            document.getElementById('listdata').innerHTML=Standlist.substring(9);
          }
          if(OutOrInInt==2&&inwillint==2){
              indoorList.doorList.forEach((e,index) => {
              Standlist +='<li class="listimg" outdoorint=" '+ index + '"  >' + '<img doorint=" '+index + '"  src="' + e.doorimg + '" alt="">'+'</li>'
                   
            });
            document.getElementById('listdata').innerHTML=Standlist.substring(9);
          }
          
            // 页面初始化根据分类展示对应的数据
     var listimglo=document.getElementById('listdata').getElementsByTagName('li')
          var willOrdoorOrcolorint=document.getElementById('willOrdoorOrcolor').getElementsByClassName('door-right-willordoororcolor')
          var willint=willOrdoorOrcolorint[0].attributes.int.value//获取展示列表
            fenlei[0].getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
        for(var i=0;i<fenlei.length;i++){
            fenlei[i].onclick=function(i){
                // console.log(i,'iiiiiiiii')
            var replaceimg=i.target.attributes[1].value||i.srcElement.attributes[1].value
             var valuelist=Number(i.target.attributes[0].value|| i.srcElement.attributes[0].value||i.target.attributes[1].value)
              if(willint==2){
              }
              if(OutOrInInt==1&&willint==1 || OutOrInInt==2&&willint==1){
                document.getElementById('doorleftbgimg').src=replaceimg
              }else if( OutOrInInt==1&&willint==2 || OutOrInInt==2&&willint==2){
               document.getElementById('doorleftimg').src=replaceimg
              }
              // 当不点击选择分类时候点击当前环境列展示高亮
              document.getElementById('doorleftbgimg').setAttribute('doorleftbgint',valuelist)
              Object.values(listimglo).forEach((fenleiite,fenleiind) => {
               if(valuelist== Number(fenleiind)){
                 listimglo[fenleiind] .getElementsByTagName('img')[0].style.borderRadius = "10px"
                  listimglo[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
               }else{
                  listimglo[fenleiind] .getElementsByTagName('img')[0].style.borderRadius = "10px"
                  listimglo[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #ccc"
               }
             })
            }
        }
        }
      }
    // 这里的循环是给三种下面的列表添加点击高亮
        for(var i=0;i<willOrdoorOrcolor.length;i++){
         willOrdoorOrcolor[i].onclick=function(){
            var doorleftbg=document.getElementById('doorleftbgimg').getAttribute("doorleftbgint")
            var doorleftimg=document.getElementById('doorleftimg').getAttribute("doorint")==0?document.getElementById('doorleftimg').getAttribute("doorint"):document.getElementById('doorleftimg').getAttribute("doorint")-1
             willOrdoorInt=this.getAttribute('int');
           for(var j=0;j<willOrdoorOrcolor.length;j++){
            if(willOrdoorOrcolor[j].className == 'door-right-willordoororcolor'){
              willOrdoorOrcolor[j].className=""
            }
          }
            // 步骤样式的高亮
           if(willOrdoorInt==2){
            if(sessionStorage.getItem('doorStepfour') && sessionStorage.getItem('doorStepfour')!==null){
                progressColorbar.go(99.999999);
             }else if(sessionStorage.getItem('doorStepthree')){
               progressColorbar.go(99.999999);
             }else{
              progressColorbar.go(60);
             }
                var  doorlistdata = document.getElementById('doorleftimg')
               document.getElementById('stepul').getElementsByTagName('li')[1].className="StepHighlight"
              // 点击分类的给默认高亮----
              Object.values(fenlei).forEach((item,index)=>{
                if(doorlistdata.getAttribute('doorint')==index){
                  item.className="StepHighlight"
                }
              })
           }
           
           if(willOrdoorInt==3){
             if(sessionStorage.getItem('doorStepfour')&&sessionStorage.getItem('doorStepfour')!==null){
                progressColorbar.go(99.999999);
             }else {
               progressColorbar.go(99.999999);
               sessionStorage.setItem("doorStepthree",3)
             }
            var  doorlistdata = document.getElementById('listdata').getElementsByTagName('li')
             document.getElementById('stepul').getElementsByTagName('li')[2].className="StepHighlight"
           }
           willOrdoorOrcolor[willOrdoorInt-1].className="door-right-willordoororcolor"
           var StandStr = "";
           // 根据类判断
            if(willOrdoorInt==1){
              // 循环拼接
              outdoorList.willList.forEach((e,index) => {
                  StandStr +='<li class="listimg"  outwillint=" '+index +'">'+'<img doorleftbgint="'+e.willint + '" src="' + e.willimg + '" alt="">'+'</li>'
              });
            }else if(willOrdoorInt==2){
               // 循环拼接
              outdoorList.doorList.forEach((e,ind) => {
                  StandStr +='<li class="listimg"   outdoorint=" '+ ind + '">'+'<img  doorint=" '+e.doorint + '" src="'+e.doorimg + '" alt="">'+'</li>'
              });
            }else if(willOrdoorInt==3){
               // 循环拼接
              colorList.colorLists.forEach((e,ind) => {
                  StandStr +='<li class="colorListsblk" style="width: 90%;height: 110px; margin: auto;margin-bottom: 10px; background: '+e.color +';"  colorint=" '+ind + '">'+'</li>'
              });
            }
            document.getElementById('listdata').innerHTML=StandStr;
              Object.values(fenlei).forEach((item,index)=>{
                // willOrdoorInt==1环境
                if(willOrdoorInt==1){
                     if(index==doorleftbg){
                        fenlei[index].getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
                     }
                  // willOrdoorInt==2门
                   }
                if(willOrdoorInt==2){
                     if(index==doorleftimg){
                       fenlei[index].getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
                     }
                   }
                // willOrdoorInt==3颜色
                if(willOrdoorInt==3){
                  var doorindex=sessionStorage.getItem('doorindex')?sessionStorage.getItem('doorindex'):0
                     if(index==doorindex){
                        fenlei[index].className="colorListsblkHighlight"
                     }
                   }
               })
            
              for(var i=0;i<fenlei.length;i++){
                  fenlei[i].onclick=function(i){
                   var doorindex=''
                    // 获取点击的图片路径
                    var replaceimg=i.srcElement?i.srcElement.currentSrc:i.path[0].currentSrc
                  
                    // 获取willOrdoorInt==2（选择门）时的下表值
                    if(i.srcElement.attributes[0]?i.srcElement.attributes[0]:i.path[0].attributes[0]){
                       
                      var dooront=i.srcElement?i.srcElement.attributes[0].value:i.path[0].attributes[0].value
                    }
                    if(willOrdoorInt==1){
                  
                      var valuelist=i.srcElement.attributes[0].value?i.srcElement.attributes[0].value:i.path[1].attributes[1].value
                     var doorleftbg=document.getElementById('doorleftbgimg').getAttribute("doorleftbgint")
         
                      document.getElementById('doorleftbgimg').setAttribute('doorleftbgint',valuelist)
                      document.getElementById('doorleftbgimg').src=replaceimg 
                      sessionStorage.setItem("doorleftbg",valuelist)
                     Object.values(fenlei).forEach((fenleiite,fenleiind) => {
                           if( valuelist==fenleiind){
                             fenlei[fenleiind].getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
                           }else{
                             fenlei[fenleiind].getElementsByTagName('img')[0].style.border = "10px solid #ccc"
                           }
                       })
                    } 
                   
                    if(willOrdoorInt==2 ){
                      var  doorlistdata = document.getElementById('listdata').getElementsByTagName('li')
                      var valuelist= i.target?i.target.attributes[0].value:  i.srcElement?i.srcElement.attributes[0].value:i.path?i.path.attributes[1].value:''
                      // 判断存储中是否有值，有值代表选择过颜色--需要根据颜色展示门
                      if(!sessionStorage.getItem('doorindex')){
                        // 获取
                         var doorleftimg=document.getElementById('doorleftimg').src=replaceimg
                         var doorleftimsg=document.getElementById('doorleftimg')
                         doorleftimsg.setAttribute("doorint",dooront)
                         outdoorList.doorList.forEach((ite,ind) => {
                          if(ind==valuelist-1){
                            Object.values(fenlei)  .forEach((fenleiite,fenleiind) => {
                               if( ind==fenleiind){
                                  fenlei[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
                               }else{
                                  fenlei[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #ccc"
                               }
                             })
                          }
                        })
                      }
                      else{
                        outdoorList.doorList.forEach((ite,ind) => {
                          if(ind==valuelist-1){
                             Object.values(fenlei) .forEach((fenleiite,fenleiind) => {
                               if( ind==fenleiind){
                                   fenlei[fenleiind].getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
                               }else{
                                   fenlei[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #ccc"
                               }
                             })
                           ite.doorListselectcolor.forEach((item,index) => {
                              var doorleftimg=document.getElementById('doorleftimg').src=ite.doorListselectcolor[sessionStorage.getItem('doorindex')].doorListselectcolorimg 
                              var doorleftimsg=document.getElementById('doorleftimg')
                              doorleftimsg.setAttribute("doorint",dooront)
                           })
                          }
                        })
                      }
                    }
                     if(willOrdoorInt == 3 ){
                      // 获取颜色的列表
                       const doorintdoms=document.getElementById('doorleftimg').getAttribute("doorint")
                         const dooritemint=doorintdoms==0?doorintdoms:doorintdoms-1
                      // 循环颜色列表srcElement
                      outdoorList.doorList[dooritemint].doorListselectcolor.forEach((e,index) => {
                        // 判断颜色数据列表与当前点击的是否相等
                          // 相等存储---这里存储是为了选择们的时候根据颜色展示
                                // 将图片替换
                        if(index==Number(i.target.attributes[2].value||i.srcElement.attributes[2].value)){
                            document.getElementById('doorleftimg').src=e.doorListselectcolorimg
                           Object.values(fenlei)  .forEach((fenleiite,fenleiind) => {
                             if( index==fenleiind){
                               sessionStorage.setItem("doorindex",Number(i.target.attributes[2].value||i.srcElement.attributes[2].value))
                               fenlei[fenleiind].className="colorListsblkHighlight"
                             }else{
                             fenlei[fenleiind].className="colorListsblk"
                             }
                           })
                        }
                          // 这里是添加高亮
                        })
                    }
                  }
              }
         }
        }
    // 页面初始化根据分类展示对应的数据
     var listimglo=Array.from(document.getElementById('listdata').getElementsByTagName('li')) 
    fenlei[0].getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
        for(var i=0;i<fenlei.length;i++){
            fenlei[i].onclick=function(i){
                var replaceimg=i.srcElement?i.srcElement.currentSrc:i.path[0].currentSrc
              if(willint==1){
                document.getElementById('doorleftbgimg').src=replaceimg
              }else if( willint==2){
             document.getElementById('doorleftimg').src=replaceimg
              }
              // 当不点击选择分类时候点击当前环境列展示高亮
               var valuelist=Number(i.target.attributes[0].value|| i.srcElement.attributes[0].value|| i.path[1].attributes[1].value||i.target.attributes[1].value)
                     document.getElementById('doorleftbgimg').setAttribute('doorleftbgint',valuelist)
               listimglo.forEach((fenleiite,fenleiind) => {
                   if(valuelist== Number(fenleiind)){
                    listimglo[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #00A0E9"
                   }else{
                       listimglo[fenleiind] .getElementsByTagName('img')[0].style.border = "10px solid #ccc"
                   }
                 })
            }
        }
  }
  