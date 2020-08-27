$(document).ready(function() {
	let customerIdInp = $('input[name="customer-id"]').val()
	$('#newCustomerModal #add').click(function(e) {
		if ($('#newCustomerModal input[name="name"]').val()) {
			addCustomer($('#newCustomerModal input[name="name"]').val())
		}

		$('#newCustomerModal input[name="name"]').val('')
		$('#newCustomerModal').modal('hide')
	})

	// customer selection search


	$('#selectionCustomerModal').click(function(e) {
		if ($(e.target).hasClass('list-group-item-action')) {
			$(this).modal('hide')
			$('#customer-name-text').text($(e.target).attr('name'))
			changeCustomer($(e.target).attr('id'))
		}
	})

	btnGroupEvent()
	getCounter()
})


// Events
let loader = $('.spinner-border')

let searchEvent = {
	selectionCustomer: () => {
			$('#selection-customer-search').keyup(function() {
				search($(this).val(), $('#customer-selection-ul'))
			})
		},
	product: () => {
		$('input[name="productSearch"]').keyup(function() {
			search($(this).val(), $('#products-div'))
		})
	}
}

// gets all products
let getProducts = (targetDiv=$('#products-div'), category='all') => {
	loader = loader.clone().removeClass('d-none')
	targetDiv.empty().append(loader)
	$.get('/get-products', {category: category})
	.done(function(data) {
		targetDiv.empty().removeClass('justify-content-center').html(data)
	})
}

// get Favorites
let getFavorites = (userID, targetDiv=$('#favorites-div')) => {
	loader = loader.clone().removeClass('d-none')
	targetDiv.empty().html(loader)
}

// fetch all customer
let getCustomers = (targetDiv=$('#selectionCustomerModal .modal-body')) => {
	$.get('get-customers/').done(function(data) {
		targetDiv.empty().html(data)
	})
}

// Get sub products by their product Id
let getSubProductById = (prodId) => {
	return new Promise((resolve, reject) => {
		let modalBody = $('#subProductsModal .modal-body')
		modalBody.empty()

		$.get(`get-sub-products-by-id/`, {
			product_id:prodId
		}).done(function(data) {
			modalBody.html(data)
			resolve()
		}).fail(function() {
			reject()
		})
	})
	.then(getSubProductUnits)
	.then(subProductAddMinus)
}

// Get the Sub Products no. of units on subProductModal
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

// adds customer
let addCustomer = (name) => {
	return new Promise((resolve, reject) => {
		$.post('add-customer/', {
			name:name,
			csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
		})
		.done(function(data) {
			resolve()
			console.log(data)
		})
	})
	.then(getCustomers)
}

// changes the customer
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
	return new Promise((resolve, reject) => {
		let invId = $('input[name="invoice-id"]').val()
		$.get(`/counter/${invId}`, function(data) {
			$('.container').empty().html(data)
		}).done(function() {
			resolve()
		})
	})

	.then(getProducts)
	.then(getFavorites)
	.then(getCustomers)
	.then(counterEvents)
	.then(getTotal)
	.then(searchEvent.selectionCustomer)
	.then(searchEvent.product)
}

let getPay = () => {

}


let counterEvents = () => {
	// Gets all subproducts
	$('#main-product-container').click(function(e) {
		if ($(e.target).data('prod-id')) {
			let prodId = $(e.target).data('prod-id')
			let prodName = $(e.target).data('prod-name')
			$($('#subProductsModal .modal-title')).text(prodName)
			getSubProductById(prodId)
			$($('#subProductsModal #save')).off()
			$($('#subProductsModal #save')).click(function() {
				subProductSave()
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
					new Promise((resolve, reject) => {
						$.get(`/invoice/${invId}`, function(data) {
							$('.container').empty().html(data)
							resolve()
						})
					})
					.then(getInvoiceItems)
					.then(getTotal)
				}

				if ($(e.target).data('btn-path') == 'pay') {
					// do something
				}

				$(e.target).siblings().each(function(index, value) {
					$(value).removeClass('active')
				})

				$(e.target).addClass('active')
			}
		}
	})
}

let getInvoiceItems = () => {
	let invoiceId = $('input[name="invoice-id"]').val()

	$.get(`/invoice-get-sub-product/${invoiceId}`)
	.done(function(data) {
		$('#invoice-div').empty().html(data)
	})
}

let subProductSave = () => {
	var productData = []
	let invoiceId = $('input[name="invoice-id"]').val()

	$('#subProductsModal .modal-body .card').each(function(index, value) {
		let card = $(value)
		let prodId = card.data('prod-id')
		let units = $(card.find('input')).val()

		if (!(units)) {
			units = 0 
		}

		productData.push({
			prodId: prodId,
			units: units
		})
	})

	new Promise((resolve, reject) => {
		$.post(`/update-sub-product/${invoiceId}`, { 
				productData: JSON.stringify(productData), 
				csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
				})
		.done(function(data) {
			console.log(data)
			$('#subProductsModal').modal('hide')
			resolve()
		})
	}).then(getTotal)
}


let subProductAddMinus = () => {
	$('#subProductsModal .modal-body .card').each(function(index, value) {
		$(value).off()
		$(value).click(function(e) {
			if ($(e.target).data('action') == 'add') {
				let input = $($(value).find('input'))
				input.val(Number(input.val()) + 1)
			} else if ($(e.target).data('action') == 'minus') {
				let input = $($(value).find('input'))
				if ((Number(input.val())  - 1) >= 0) {
					input.val(Number(input.val()) - 1)
				} else {
					input.val('0')
				}
			}
		})
	})
}

let getTotal = () => {
	$.get(`/get-total/${$('input[name="invoice-id"]').val()}`)
	.done(function(data) {
		if (JSON.parse(data).total_price__sum) {
			$('#total span').html(`₱${formatNum(JSON.parse(data).total_price__sum)}`)
		} else {
			$('#total span').html(`₱0`)
		}
	})
}
