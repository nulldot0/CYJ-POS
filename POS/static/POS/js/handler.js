$(document).ready(function() {
	getInvoices()

	$('input[name="search-transactions"]').keyup(function() {
		search($(this).val(), $('#invoice-list-div'))
	})
})


let getInvoices = () => {
	$.get('/handler/get-invoices/')
	.done(function(data) {
		$('#invoice-list-div').empty().html(data)
	})
}