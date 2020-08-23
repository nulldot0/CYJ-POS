from django.shortcuts import render, HttpResponse, redirect
from django.db.models import Sum
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import *
from json import dumps, loads
# Create your views here.

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
		return redirect(f'/?invoice-id={invoice.id}')

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

def get_favorites(request):
	pass

def get_products(request):
	return render(request, 'POS/counter_product_list.html', {
			'products': Product.objects.all()
		})

def get_sub_products_by_id(request):
	prod_id = request.GET.get('product_id')
	return render(request, 'POS/sub_product_list.html', {
			'sub_products': Product.objects.get(id=prod_id).subproduct_set.all()
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

				transaction.no_of_units = data['units']
				transaction.save()
			else:
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

def add_sub_product(request):
	pass

def invoice_details(request, pk):
	invoice = Basket.objects.get(pk=pk)
	return render(request, 'POS/invoice_details.html', {
			'invoice': invoice,
			'items': invoice.producttransaction_set.all()
		})
def invoice_counter(request, pk):
	invoice = Basket.objects.get(pk=pk)

	return render(request, 'POS/counter.html', {
			'invoice': invoice,
		})


def get_customers(request):
	return render(request, 'POS/customer_list.html', {
			'customers': Customer.objects.all().order_by('name')
		})

@login_required(login_url='/admin/')
def handler_page(request):
	return render(request, 'POS/handler_page.html', { 
		'invoices': request.user.basket_set.all()
		})

def get_invoice_total(request, pk):
	invoice = Basket.objects.get(pk=pk)
	total = invoice.producttransaction_set.all().aggregate(
		Sum('total_price'))
	return HttpResponse(dumps(total))

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