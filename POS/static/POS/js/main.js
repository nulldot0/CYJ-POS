$(document).ready(function() {
	$('#menu-btn').click(function() {
		var btn = $(this)
		if ($($(this).parent()).css('margin-left') == '0px') {
			$($(this).parent()).animate({
				'margin-left': '-75%'
			}, 150, function() {
				btn.attr('src', '/static/POS/icons/arrow-right-short.svg')
			})

		} else {
			$($(this).parent()).animate({
				'margin-left': '0%'
			}, 150, function() {
				btn.attr('src', '/static/POS/icons/arrow-left-short.svg')
			})

		}
	})
})


let formatNum = (num) => {
	if (num < 0) {
		num = String(Math.abs(num)).split('').reverse()
		let ret_num = []
		for (i=0; i < num.length; i++) {
			if (i % 3 == 0 && i != 0) {
				ret_num.push(',')
			}
			ret_num.push(num[i])
		}

		return `-${ret_num.reverse().join('')}`
	} else {
		num = String(num).split('').reverse()
		let ret_num = []
		for (i=0; i < num.length; i++) {
			if (i % 3 == 0 && i != 0) {
				ret_num.push(',')
			}
			ret_num.push(num[i])
		}

		return ret_num.reverse().join('')
	}
}

let search = (q, cont) => {
	$(cont.children()).each(function(index, value) {
		if ($(value).attr('search').toLowerCase().includes(q.toLowerCase())) {
			$(value).css('display', 'block')
		} else {
			$(value).css('display', 'none')
		}
	})
}

