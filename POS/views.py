from django.shortcuts import render, HttpResponse, redirect
from django.db.models import Sum, Count
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import *
from json import dumps, loads
# Create your views here.

# MAIN PAGE
@login_required(login_url='/admin/')
def main(request):
	invoice_id = request.GET.get('invoice-id')
	if invoice_id:
		invoice = Basket.objects.get(id=invoice_id)
		return render(request, 'POS/index.html', {
			'invoice': invoice
		})
	else:
		invoice = Basket.objects.create(handler=request.user)
		return redirect(f'/main-counter/?invoice-id={invoice.id}')

# ------------------------------------------------------
# Product page 

def product_page(request):
	return render(request, 'POS/product_page.html', {
			'products': Product.objects.all(),
			'categories': Category.objects.all(),
		})

def product_page_get_products(request):
	return render(request, 'POS/product_page_product_list.html', {
			'products': Product.objects.all().order_by('name'),
		})

def product_page_get_categories(request):
	categories = [ {'id': i.id, 'name': i.name} for i in Category.objects.all().order_by('name')]
	return HttpResponse(dumps(categories))

def product_page_get_sub_product(request, pk):
	product = Product.objects.get(pk=pk)
	sub_products = product.subproduct_set.all()

	return render(request, 'POS/product_page_sub_product_list.html', {
			'sub_products': sub_products
		})

def product_page_modify_sub_product(request, action, pk):
	if request.method == 'POST':
		sub_product = SubProduct.objects.get(pk=pk)
		if action == 'edit':
			sub_product.description = request.POST.get('description')
			sub_product.unit_price = request.POST.get('unitPrice')
			sub_product.unit_cost = request.POST.get('unitCost')
			sub_product.save()
			return HttpResponse(dumps({ 'productId': sub_product.id, 'message': 'edited' }))			 
		else:
			sub_product_id = sub_product.id
			sub_product.delete()
			return HttpResponse(dumps({'productId': sub_product_id, 'message': 'deleted'}))
	else:
		return redirect('/handler')

def product_page_modify_product(request, pk):
	# TODO: redirect a user to a page where you can edit the product
	return render(request, 'POS/product_page_modify_product.html', {
			'product': Product.objects.get(pk=pk),
			'sub_products': Product.objects.get(pk=pk).subproduct_set.all(),
			'categories': Category.objects.all()
		})

def add_new_product(request):
	if request.method == 'POST':
		category = Category.objects.get(pk=request.POST.get('productCategory'))
		Product.objects.create(category=category, name=request.POST.get('productName'))

		return HttpResponse('Successfully added %s' %(request.POST.get('productName')))
	else:
		return redirect('/handler')

def add_new_category(request):
	if request.method == 'POST':
		Category.objects.create(name=request.POST.get('categoryName'))
		return HttpResponse('Successfully added category %s' %(request.POST.get('categoryName')))
	else:
		return redirect('/handler')

def add_new_sub_product(request, pk):
	if request.method == 'POST':
		product = Product.objects.get(pk=pk)

		SubProduct.objects.create(
			product_family=product, 
			  description=request.POST.get('description'),
			    unit_price=request.POST.get('unitPrice'),
				  unit_cost=request.POST.get('unitCost')
			)

		return HttpResponse('ok')

	else:
		return redirect('/handler')

def edit_product(request, pk):
	if request.method == 'POST':
		product = Product.objects.get(pk=pk)
		category = Category.objects.get(pk=request.POST.get('productCategory'))
		previous_name = str(product.name)
		previous_category = str(product.category.name)

		product.category = category
		product.name = request.POST.get('productName')

		if previous_name != product.name:
			m1 = f'name changed from {previous_name} to {product.name}'
		else:
			m1 = ''
		if previous_category != product.category.name:
			m2 = f' category changed from {previous_category} to {product.category.name}'
		else:
			m2 = ''

		message = f'{m1}{m2}'

		product.save()

		data = {
			'message': message,
			'name': product.name,
			'categoryName': product.category.name,
			'categoryId': product.category.id,
		}

		return HttpResponse(dumps(data))
	else:
		return redirect('/handler')

# -----------------------------------------------------

# COUNTER PAGE
def counter_get_products(request):
	return render(request, 'POS/counter_product_list.html', {
			'products': Product.objects.all().order_by('name')
		})

def get_sub_products_by_id(request):
	prod_id = request.GET.get('product_id')
	return render(request, 'POS/counter_sub_product_list.html', {
			'sub_products': Product.objects.get(id=prod_id).subproduct_set.all().order_by('description')
		})

def get_sub_products_units(request, pk):
	sub_product_ids = request.GET.getlist('subProductIds[]')
	invoice = Basket.objects.get(pk=pk)
	info = {
		'data': []
	}

	for i in sub_product_ids:
		sub_prod = SubProduct.objects.get(pk=i)
		if ProductTransaction.objects.filter(basket_id=invoice, product=sub_prod).exists():
			info['data'].append({
				'productId': i,
				'units':  float(ProductTransaction.objects.filter(basket_id=invoice, product=sub_prod)[0].no_of_units)
				})
		else:
			info['data'].append({
				'productId': i,
				'units':  0
				})

	return HttpResponse(dumps(info))

def update_sub_product(request, pk):
	if request.method == 'POST':
		invoice = Basket.objects.get(pk=pk)
		user = User.objects.get(pk=request.user.id)

		for data in loads(request.POST.get('productData')):
			sub_product = SubProduct.objects.get(pk=data['prodId'])
			if ProductTransaction.objects.filter(product=sub_product, basket_id=invoice).exists():
				transaction = ProductTransaction.objects.filter(product=sub_product, basket_id=invoice)
				if len(transaction) > 2:
					[ i.delete() for i in transaction[1:] ]
					transaction = transaction[0]
				else:
					transaction = transaction[0]

				if float(data['units']) != 0:
					transaction.no_of_units = data['units']
					transaction.save()
				else:
					transaction.delete()
			else:
				if float(data['units']) != 0:
					ProductTransaction.objects.create(basket_id=invoice, 
						product=sub_product, no_of_units=data['units'], added_by=user).save()

		return HttpResponse('Success')
	else:
		return redirect('/handler')
	
def add_customer(request):
	if request.method == 'POST':
		name = ' '.join([x.capitalize() for x in request.POST.get('name').split(' ')])
		Customer.objects.create(name=name)
		return HttpResponse('Customer: %s added successfully.' % (name))
	else:
		return redirect('/')

def change_customer(request):
	if request.method == 'POST':
		invoice_id = request.POST.get('invoice_id')
		invoice = Basket.objects.get(id=invoice_id)
		invoice.customer = Customer.objects.get(id=request.POST.get('customer_id'))
		invoice.save()
		return HttpResponse('changed successfully')
	else:
		return redirect('/')

def counter(request, pk):
	invoice = Basket.objects.get(pk=pk)

	return render(request, 'POS/counter.html', {
			'invoice': invoice,
		})

def get_customers(request):
	return render(request, 'POS/counter_customer_list.html', {
			'customers': Customer.objects.all().order_by('name')
		})

# INVOICE PAGE
def invoice(request, pk):
	invoice = Basket.objects.get(pk=pk)
	return render(request, 'POS/invoice.html', {
			'invoice': invoice,
		})

def invoice_get_sub_product(request, pk):
	return render(request, 'POS/invoice_product_list.html', {
			'items': Basket.objects.get(pk=pk).producttransaction_set.all()
		})


# HANDLER PAGE
@login_required(login_url='/admin/')
def handler_page(request):
	return render(request, 'POS/handler_page.html')

def handler_get_invoice(request):
	return render(request, 'POS/handler_invoice_list.html', {
			'invoices': [ {
				'invoice': i,
				'items': i.producttransaction_set.all().aggregate(Count('id'))['id__count'],
				'total': i.producttransaction_set.all().aggregate(Sum('total_price'))['total_price__sum']
			} for i in request.user.basket_set.all()]
		})

# PAY PAGE
def pay_page(request, pk):
	return render(request, 'POS/pay.html')

def pay_payment(request, method, pk):
	if request.method == 'POST':
		amount_paid = request.POST.get('amountPaid')
		basket = Basket.objects.get(pk=pk)
		if not InvoiceTransaction.objects.filter(basket_id=basket).exists():
			basket_total_price = basket.producttransaction_set.all().aggregate(Sum('total_price'))['total_price__sum']
			if method == 'cash' and (int(amount_paid) - basket_total_price) >= 0:
				basket.status = 'paid'
				basket.save()

			InvoiceTransaction.objects.create(basket_id=basket, payment_method=method, amount_paid=amount_paid)
			
			return HttpResponse('done')
		else:
			invoice = InvoiceTransaction.objects.get(basket_id=basket)
			invoice.amount_paid = amount_paid
			invoice.save()
			return	HttpResponse('invoice already exists')

def get_invoice_total(request, pk):
	invoice = Basket.objects.get(pk=pk)
	total = invoice.producttransaction_set.all().aggregate(
		Sum('total_price'))
	return HttpResponse(dumps(total))

