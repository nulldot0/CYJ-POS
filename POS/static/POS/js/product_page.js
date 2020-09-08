$(document).ready(function() {
	$('#newCategoryModal #save').click(function() {
		addNewCategory($('#newCategoryModal #categoryName').val())
		getCategories()
	})

	$('#searchProduct').keyup(function() {
		search($(this).val(), $('#productListContainer'))
	})

	$('input[name="sub-product-search"]').keyup(function() {
		search($(this).val(), $('#sub-product-container'))
	})

	$('#addSubProductBtn').click(function() {
		$('#newSubProductModal').find('#save').off()
		$('#newSubProductModal #save').click(function() {
			addNewSubProduct().then(getSubProducts)
		})
	})

	$('#addProductBtn').click(function() {
		$('#ProductModal #save').off()
			$('#ProductModal #save').click(function() {
				addEditProduct($('#ProductModal #productName').val(), 
					$('#ProductModal #category').val())
			})
	})

	modifyProductEvent()

	// adds event on this container for edit
	getProducts().then(editProductEvent)
	getSubProducts()
	getCategories()

	editDeleteSubProductEvent()

})

// let search = (toSearch, targetDivId) => {
// 	$(`${targetDivId} .card`).each(function(index, value) {
// 		if (!(String($(value).data('search')).toLowerCase().includes(toSearch.toLowerCase()))) {
// 			$(value).css('display', 'none')
// 		} else {
// 			$(value).css('display', 'block')
// 		}
// 	})
// }

let editDeleteSubProductEvent = () => {
	$('#sub-product-container').click(function(e) {
		let target = $(e.target)
		if (target.data('action')) {
			let root = target.parentsUntil('#sub-product-container').last()
			

			if (target.data('action') == 'edit') {
				let modal = $('#newSubProductModal')

				// changes title modal
				modal.find('.modal-title')
				.text(`${root.data('title')} - ${root.data('description')}`)
				// changes input on #newSubProductModal
				modal.find('#description').val(root.data('description'))
				modal.find('#unit-price').val(root.data('unit-price'))
				modal.find('#unit-cost').val(root.data('unit-cost'))
				modal.find('input[name="sub-product-id"]').val(root.data('sub-product-id'))

				// adds event onclick on #newSubProductModal
				modal.find('#save').off()
				modal.find('#save').click(function() {
					let subproductId = modal.find('input[name="sub-product-id"]').val()
					$.post(`/product-page/modify-sub-product/edit/${subproductId}`, {
							csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
							description: modal.find('#description').val(),
							unitPrice: modal.find('#unit-price').val(),
							unitCost:modal.find('#unit-cost').val()
						}).done(function(data) {
							console.log(data)
							modal.modal('hide')
							getSubProducts()
						})
				})
			} 

			if (target.data('action') == 'delete') {
				// delete sub product
				let modal = $('#deleteSubProductModal')
				modal.find('input[name="sub-product-id"]').val(root.data('sub-product-id'))
				modal.find('#yes').off()
				modal.find('#yes').click(function() {
					let subproductId = modal.find('input[name="sub-product-id"]').val()
					$.post(`/product-page/modify-sub-product/delete/${subproductId}`, {
						csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
					}).done(function(data) {
						console.log(data)
						modal.modal('hide')
						getSubProducts()
					})
				})

			}
		}
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
			$('#sub-product-container').empty().html(data)
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
}