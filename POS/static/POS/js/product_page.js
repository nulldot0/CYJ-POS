$(document).ready(function() {
	getProducts()
	getCategories()

	$('#newProductModal #save').click(function() {
		addNewProduct($('#newProductModal #productName').val(), $('#newProductModal #category').val())
	})

	$('#newCategoryModal #save').click(function() {
		addNewCategory($('#newCategoryModal #categoryName').val())
		getCategories()
	})

	$('#searchProduct').keyup(function() {
		search($(this).val(), '#productListContainer')
	})
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

let getProducts = () => {
	$.get('/product-page-get-products/')
	.done(function(data) {
		$('#productListContainer').empty().html(data)
	})
}

let getCategories = () => {
	$.get('/product-page-get-categories/')
	.done(function(data) {
		let categories = JSON.parse(data)
		$('#newProductModal #category').empty().append('<option selected="" value="0">Select Category</option>')
		$(categories).each(function(index, value) {
			$('#newProductModal #category').append(`<option value="${value.id}">${value.name}</option>`)
		})
	})
}

let addNewProduct = (productName, productCategory) => {
	$.post('/add-new-product/', { 
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
		productName: productName, 
		productCategory: productCategory 
	}).done(function(data) {
		console.log(data)
		getProducts()
		$('#newProductModal').modal('hide')
		emptyModal('#newProductModal')
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

let emptyModal = (targetId) => {
	$(`${targetId} select`).each(function(index, value) {
		$(value).val('0')
	})

	$(`${targetId} input`).each(function(index, value) {
		$(value).val('')
	})
}