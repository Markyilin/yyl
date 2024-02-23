var imgSwiper = new Swiper('.img-swiper', {
	direction: 'vertical',
	watchSlidesVisibility: true,//防止不可点击
	loop: true,
	speed: 700,
}) 
var txtSwiper = new Swiper('.txt-swiper', {
	direction: 'vertical',
	loop: true,
	speed: 700,
	mousewheel: true,
	autoplay: {
		delay: 6000,
		disableOnInteraction: false,
	},
	navigation: {
		nextEl: '.txt-swiper .swiper-button-next',
		prevEl: '.txt-swiper .swiper-button-prev',
	},
	thumbs: {
		swiper: imgSwiper,
	},
	on: {
		transitionEnd: function() {
			delay = this.params.autoplay.delay - 1000; 
			anime({//用animejs画圈
				targets: '.path-loop',
				delay: 750,
				strokeDashoffset: function(el) {
					var svgLength = anime.setDashoffset(el);
					return [svgLength, 0];
				},
				easing: 'linear',
				duration: delay,
			});
		},
		init: function() {
			numList = '<ul>';
			for (p = 1; p <= (this.slides.length - 2); p++) {
				numList += '<li>' + p + '</li>';
			}
			numList += '</ul>';
			this.$el.find('.swiper-pagination').html(numList + ' - <span class="total">' + (this.slides.length - 2) + '</span>');
			//paginationRender会每次更新dom，无法产生动画效果,所以使用html()生成pagination
			this.emit('transitionStart');
		},
		transitionStart: function() {
			realIndex = this.realIndex; 
			speed = this.params.speed; 
			bullets = this.$el.find('.swiper-pagination li'); 
			sldieLength = bullets.length;
			for (i = 0; i < sldieLength; i++) {
				if ((i - realIndex) > Math.floor(sldieLength/2)) {
					difference = i - sldieLength - realIndex;
				} else if ((i - realIndex) < -Math.floor(sldieLength/2)) {
					difference = i + sldieLength - realIndex;
				} else {
					difference = i - realIndex;
				}
				bullets.eq(i).transition(speed);
				bullets.eq(i).transform('rotateX(' + difference * 30 + 'deg) translate3d(0, ' + difference * 30 + 'px, 0)') ;
				bullets.eq(i).css('opacity', 1 - Math.abs(difference));
			}
		}
	}
});

//打散文字
txt = document.querySelectorAll("h2");

for(h = 0;h < txt.length; h++){
      cache = txt[h].innerHTML;	
word = cache.split(" ");
newTxt = '';
for (i = 0; i < word.length; i++) {
	newTxt += '<div class="word">'
	for (j = 0; j < word[i].length; j++) {
		newTxt += '<div class="letter">' + word[i][j] + '</div>';
	}
	newTxt += '</div> '
}
txt[h].innerHTML = newTxt;
words = document.querySelectorAll('.word')

//排列文字
function txtArray() {
	vw = document.body.offsetWidth / 100
	for (j = 0; j < words.length; j++) {
		wn = 0;
		anime({
			targets: words[j].querySelectorAll('.letter'),
			rotateY: function(el, i, l) {
				wo = wn
				wn += el.offsetWidth
				return wo * 2.5 / (vw);
				//数值越小字母旋转角越大
			},
			translateZ: vw * 25,
			    //数值越大字母间距越大
			duration: 0,
		});
	}
}
}

window.onresize = function() {
	txtArray();
}
txtArray();

//旋转文字
document.onmousemove = function(e) {
	e = e || window.event;
	if (e.pageX || e.pageY) {
		movex = e.pageX;
		movey = e.pageY
	}

	anime({
		targets: 'h2',
		translateX: movex / 25,
		translateY: movey / 25,
		rotateX: -movey / 150,
		rotateY: movex / 150,
		duration: 2000,
		easing: 'easeOutCirc'
	});
	
	anime({
		targets: '.img-swiper',
		translateX: movex / 130,
		translateY: movey / 130,
		duration: 2000,
		easing: 'easeOutCirc'
	});
	

}