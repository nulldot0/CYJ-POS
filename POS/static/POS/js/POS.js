$(document).ready(function() {
	let customerIdInp = $('input[name="customer-id"]')
	$('#newCustomerModal').click(function(e) {
		if ($(e.target).attr('id') == 'add' ) {
			let nameInp = $($(this).find('input[name="name"]'))
			if (nameInp.val()) {
				addCustomer(nameInp.val())
				nameInp.val('')
				$(this).modal('hide')
			}
			
		}	
	})

	// customer selection search
	$('#selection-customer-search').keyup(function() {
		search($(this).val(), $('#customer-selection-ul'))
	})

	$('#selectionCustomerModal').click(function(e) {
		if ($(e.target).hasClass('list-group-item-action')) {
			$(this).modal('hide')
			$('#customer-name-text').text($(e.target).attr('name'))
			changeCustomer($(e.target).attr('id'))
		}
	})

	btnGroupEvent()
	getCounter()
	updateSubProductEvent()
})

let loader = $('.spinner-border')

let getProducts = (targetDiv=$('#products-div'), category='all') => {
	loader = loader.clone().removeClass('d-none')
	targetDiv.empty().append(loader)
	$.get('/get-products', {category: category})
	.done(function(data) {
		targetDiv.empty().removeClass('justify-content-center').html(data)
	})
}

let getFavorites = (userID, targetDiv=$('#favorites-div')) => {
	loader = loader.clone().removeClass('d-none')
	targetDiv.empty().html(loader)
}

let getCustomers = (targetDiv=$('#selectionCustomerModal .modal-body')) => {
	$.get('get-customers/').done(function(data) {
		targetDiv.empty().html(data)
	})
}

// Get sub products by their product Id
let getSubProductById = (prodId) => {
	let modalBody = $('#subProductsModal .modal-body')
	modalBody.empty()

	$.get(`get-sub-products-by-id/`, {
		product_id:prodId
	}).done(function(data) {
		modalBody.html(data)

		getSubProductUnits()
	})
}

// Get the Sub Products no. of units
let getSubProductUnits = () => {
	let prodIds = []

	$($('#subProductsModal .modal-body').children()).each(function(index, value) {
		prodIds.push($(value).data('prod-id'))
	})

	$.get(`/get-sub-product-units/${$('input[name="invoice-id"]').val()}`, 
		{'subProductIds[]': prodIds}
	).done(function(data) {
		data = JSON.parse(data)
		for (i=0; i<data.data.length; i++) {
			$('#subProductsModal .modal-body .card').each(function(index, value) {
				if ($(this).data('prod-id') == data.data[i].productId) {
					$($(this).find('input')).attr('value', data.data[i].units)
				}
			})
		}
	})
}

let addCustomer = (name) => {
	$.post('add-customer/', {
		name:name,
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
	})
	.done(function(data) {
		console.log(data)

		getCustomers()
	})
}

let changeCustomer = (custId) => {
	$.post('change-customer/', {
		invoice_id: $('input[name="invoice-id"]').val(),
		customer_id: custId,
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
	})
	.done(function(data) {
		console.log(data)
	})
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

let getCounter = () => {
	let invId = $('input[name="invoice-id"]').val()
	$.get(`/counter/${invId}`, function(data) {
		$('.container').empty().html(data)
	}).done(function() {
		getProducts()
		getFavorites()
		getCustomers()
		productCounter()
		getTotal()
	})
}


let getInvoice = () => {
	let invId = $('input[name="invoice-id"]').val()
	console.log('test')
}

let getPay = () => {

}

let productCounter = () => {
	// Gets all subproducts
	$('#main-product-container').click(function(e) {
		if ($(e.target).data('prod-id')) {
			let prodId = $(e.target).data('prod-id')
			let prodName = $(e.target).data('prod-name')
			$($('#subProductsModal .modal-title')).text(prodName)
			getSubProductById(prodId=$(e.target).data('prod-id'))

			$($('#subProductsModal #save')).off()
			$($('#subProductsModal #save')).click(function() {
				subProductSaveBtn()

			})
		}
	})
}

let btnGroupEvent = () => {
	$('#btnGroup').click(function(e) {
		if ($(e.target).data('btn-path')) {
			if (!($(e.target).hasClass('active'))) {
				let invId = $('input[name="invoice-id"]').val()

				if ($(e.target).data('btn-path') == 'counter') {
						getCounter()
				}

				if ($(e.target).data('btn-path') == 'invoice') {
					// do something
					$.get(`/invoice/${invId}`, function(data) {
						$('.container').empty().html(data)
					})
				}

				if ($(e.target).data('btn-path') == 'pay') {
					// do something
				}

				$($($(e.target).parent()).children()).each(function(index, value) {
					$(value).removeClass('active')
				})

				$(e.target).addClass('active')

			}
		}
	})
}

let subProductSaveBtn = () => {
	var productData = []
		$('#subProductsModal .modal-body .card').each(function(index, value) {
			let card = $(value)
			let prodId = card.data('prod-id')
			let units = $(card.find('input')).val()

			productData.push({
				prodId: prodId,
				units: units
			})
		})
		let invoiceId = $('input[name="invoice-id"]').val()
		
		$.post(`/update-sub-product/${invoiceId}`, { 
					productData: JSON.stringify(productData), 
					csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
				})
		.done(function(data) {
			console.log(data)
			$('#subProductsModal').modal('hide')
			getTotal()
		})


}

// Update Sub Product event
let updateSubProductEvent = () => {
	$('#subProductsModal .modal-body').click(function(e) {
		if ($(e.target).data('action')) {
			let container = $($(e.target).parentsUntil('.modal-body'))

			let subProdId = $(container[container.length-1]).data('prod-id')
			let inp = $($(container).find('input.form-control')[0])

			if ($(e.target).data('action') == 'add') {
				inp.val(Number(inp.val()) + 1)
			} else {
				if ((Number(inp.val())  - 1) >= 0) {
					inp.val(Number(inp.val()) - 1)
				} else {
					inp.val('0')
				}
			}
		}
	})
}

let getTotal = () => {
	$.get(`/get-total/${$('input[name="invoice-id"]').val()}`)
	.done(function(data) {
		if (JSON.parse(data).total_price__sum) {
			$('#total span').html(`₱${JSON.parse(data).total_price__sum}`)
		} else {
			$('#total span').html(`₱0`)
		}
	})
}
