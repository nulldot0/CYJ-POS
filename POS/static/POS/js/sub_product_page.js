$(document).ready(function() {
	$.get('/get-sub-products/').done((data) => {
		$('#subProductContainer').empty().html(data)
	})

	$('input[name="search"]').keyup(function() {
		search($(this).val(), $('#subProductContainer'))
	})

	
})