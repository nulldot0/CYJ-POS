from django.shortcuts import render
from .models import *
# Create your views here.
def main(request):
	return render(request, 'POS/index.html', {
			'favorites': 'jong',
			'products': SubProduct.objects.all()
		})

def get_favorites(request):
	pass

def get_products(request):
	pass

def add_customer(request):
	pass

def change_customer(request):
	pass

def update_sub_product(request):
	pass