$(document).ready(function() {
	addProductBtnEvent()
	modifyProductEvent()
	$('#newCategoryModal #save').click(function() {
		addNewCategory($('#newCategoryModal #categoryName').val())
		getCategories()
	})

	$('#searchProduct').keyup(function() {
		search($(this).val(), '#productListContainer')
	})

	// adds event on this container for edit
	getProducts().then(editProductEvent)
	getSubProducts()
	getCategories()


})

let search = (toSearch, targetDivId) => {
	$(`${targetDivId} .card`).each(function(index, value) {
		if (!(String($(value).data('search')).toLowerCase().includes(toSearch.toLowerCase()))) {
			$(value).css('display', 'none')
		} else {
			$(value).css('display', 'block')
		}
	})
}

let addProductBtnEvent = () => {
	$('#addProductBtn').off()
	$('#addProductBtn').click(function() {
		$('#ProductModal #save').off()
			$('#ProductModal #save').click(function() {
				addEditProduct($('#ProductModal #productName').val(), 
					$('#ProductModal #category').val())
			})
	})
}

let editProductEvent = () => {
	$('#productListContainer #editBtn').off()
	$('#productListContainer #editBtn').each(function(index, value) {
		$(value).click(function() {
			$('#ProductModal #productName').val($(this).data('product-name'))
			$('#ProductModal #category').val($(this).data('product-category'))
			$('#ProductModal #save').off()
			$('#ProductModal #save').click(function() {
				addEditProduct($('#ProductModal #productName').val(), 
					$('#ProductModal #category').val(), 
						url=`/edit-product/${$(value).data('product-id')}`)
			})
			
		})
	})
}

let getProducts = () => {
	return new Promise((resolve, reject) => {
		$.get('/product-page/get-products/')
		.done(function(data) {
			$('#productListContainer').empty().html(data)
			resolve()
		}).fail(function() {
			reject('Failed to fetch data.')
		})
	})
}

let getSubProducts = () => {
	if ($('input[name="product-id"]').val()) {
		$.get(`/product-page/get-sub-product/${$('input[name="product-id"]').val()}`)
		.done(function(data) {
			let jsonObj = JSON.parse(data)
			$('#sub-product-container').empty()

			$(jsonObj).each(function(index, value) {
				$('#sub-product-container').append(
				`<div class="card my-2 shadow">
					<div class="card-header">
						<p class="m-0"><span class="font-weight-bold">Description:</span> ${value.description}</p>
						<p class="m-0"><span class="font-weight-bold">Price:</span> ₱${formatNum(value['unit-price'])}</p>
						<p class="m-0"><span class="font-weight-bold">Cost:</span> ₱${formatNum(value['unit-cost'])}</p>
					</div>
				</div>`
				)
			})
		})
	}
}

let getCategories = () => {
	$.get('/product-page/get-categories/')
	.done(function(data) {
		let categories = JSON.parse(data)
		$('#ProductModal #category').empty().append('<option selected="" value="0">Select Category</option>')
		$(categories).each(function(index, value) {
			$('#ProductModal #category').append(`<option value="${value.id}">${value.name}</option>`)
		})
	})
}

let addEditProduct = (productName, productCategory, url="/add-new-product/") => {
	$.post(url, { 
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
		productName: productName, 
		productCategory: productCategory 
	}).done(function(data) {
		console.log(data)
		getProducts().then(editProductEvent)
		$('#ProductModal').modal('hide')
		emptyModal('#ProductModal')
	})
}

let addNewCategory = (categoryName) => {
	$.post('/add-new-category/', {
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
		categoryName: categoryName, 
	}).done(function(data) {
		console.log(data)
		$('#newCategoryModal').modal('hide')
		emptyModal('#newCategoryModal')
	})
}

let addNewSubProduct = () => {
	let productId = $('input[name="product-id"]').val()

	return new Promise((resolve, reject) => {
		$.post(`/add-new-sub-product/${productId}`, {
			csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
			description: $('#newSubProductModal #description').val(),
			unitPrice: $('#newSubProductModal #unit-price').val(),
			unitCost: $('#newSubProductModal #unit-cost').val()
		}).done(function(data) {
			console.log(data)
			$('#newSubProductModal').modal('hide')
			emptyModal('#newSubProductModal')
			resolve()
		})
	})
}

let emptyModal = (targetId) => {
	$(`${targetId} select`).each(function(index, value) {
		$(value).val('0')
	})

	$(`${targetId} textarea`).each(function(index, value) {
		$(value).val('')
	})

	$(`${targetId} input`).each(function(index, value) {
		$(value).val('')
	})
}

let modifyProductEvent = () => {
	let classToggle = () => {
		$('#product-name').toggleClass('d-none')
		$('#product-category').toggleClass('d-none')
		$('input[name="product-name"]').toggleClass('d-none')
		$('select[name="product-category"]').toggleClass('d-none')
		$('#edit').toggleClass('d-none')
		$('#save').toggleClass('d-none')
	}

	$('#edit').click(function() {
		// TODO: show input then change btn
		classToggle()
	})

	$('#save').click(function() {
		// TODO: send post request to change product name
		new Promise((resolve, reject) => {
			let productId = $('input[name="product-id"]').val()
			console.log()
			$.post(`/edit-product/${productId}`, {
				csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
				productName: $('input[name="product-name"]').val(),
				productCategory: $('select[name="product-category"]').val()
			}).done(function(data) {
				let jsonObj = JSON.parse(data)
				$('#product-name').text(jsonObj.name)
				$('#product-category').text(jsonObj.categoryName)

				console.log(jsonObj.message)
				resolve()
			})
		}).then(classToggle)
	})

	$('#newSubProductModal #save').click(function() {
		addNewSubProduct().then(getSubProducts)
	})
}