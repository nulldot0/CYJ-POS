$(document).ready(function() {

	$('#menu-btn').click(function() {
		var btn = $(this)
		if ($($(this).parent()).css('margin-left') == '0px') {
			$($(this).parent()).animate({
				'margin-left': '-75%'
			}, function() {
				btn.attr('src', '/static/POS/icons/arrow-right-short.svg')
			})

		} else {
			$($(this).parent()).animate({
				'margin-left': '0%'
			}, function() {
				btn.attr('src', '/static/POS/icons/arrow-left-short.svg')
			})

		}
	})
})