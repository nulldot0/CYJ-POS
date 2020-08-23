from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Customer(models.Model):
	name = models.CharField(max_length=100)

	def __str__(self):
		return  self.name

class Category(models.Model):
	name = models.CharField(max_length=100)

	def __str__(self):
		return  self.name

	class Meta:
		verbose_name_plural = 'Categories'

class Product(models.Model):
	name = models.CharField(max_length=30)
	category = models.ForeignKey(Category, on_delete=models.CASCADE, blank=True)

	def __str__(self):
		return  self.name

class SubProduct(models.Model):
	product_family = models.ForeignKey(Product, on_delete=models.CASCADE)
	description = models.TextField()
	unit_price = models.DecimalField(max_digits=8, decimal_places=2)
	stock = models.PositiveIntegerField(default=0)

	def __str__(self):
		return  f'{self.product_family.name} {self.description} @ {self.unit_price}'

class Basket(models.Model):
	customer = models.ForeignKey(Customer, on_delete=models.CASCADE, default=1)
	handler = models.ForeignKey(User, on_delete=models.CASCADE)
	date_created = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=50, choices=[
				('processing', 'processing'),
				('paid', 'paid'),
				('reserved', 'reserved'),
				('for delivery', 'for delivery'),
			], default='processing')

	def __str__(self):
		return f'Basket No.{self.id} handled by {self.handler}'

class ProductTransaction(models.Model):
	basket_id = models.ForeignKey(Basket, on_delete=models.CASCADE)
	no_of_units = models.DecimalField(max_digits=8, decimal_places=2, default=0)
	product = models.ForeignKey(SubProduct, on_delete=models.CASCADE)
	added_by = models.ForeignKey(User, on_delete=models.CASCADE)
	date_added = models.DateTimeField(auto_now_add=True)
	total_price = models.PositiveIntegerField(default=0)

	def save(self, *args, **kwargs): 
		self.total_price = round(float(self.no_of_units) * float(self.product.unit_price))
		super(ProductTransaction, self).save(*args, **kwargs) 

	def __str__(self):
		return f'added {self.product} to Basket No.{self.basket_id.id}  -{self.added_by}' 