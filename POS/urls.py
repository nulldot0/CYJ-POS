from django.urls import path
from . import views

urlpatterns = [
    path('', views.main),
    path('product_page/', views.product_page, name='product-page'),
    path('product-page-get-products/', views.product_page_get_products),
    path('product-page-get-categories/', views.product_page_get_categories),
    path('add-new-product/', views.add_new_product),
    path('add-new-category/', views.add_new_category),
    path('get-products/', views.get_products),
    path('add-customer/', views.add_customer),
    path('get-customers/', views.get_customers),
    path('get-sub-products-by-id/', views.get_sub_products_by_id),
    path('get-sub-product-units/<int:pk>', views.get_sub_products_units),
    path('handler/', views.handler_page),
    path('change-customer/', views.change_customer),
    path('invoice/<int:pk>', views.invoice_details, name='invoice'),
    path('counter/<int:pk>', views.invoice_counter, name='counter'),
    path('update-sub-product/<int:pk>', views.update_sub_product),
    path('get-total/<int:pk>', views.get_invoice_total)
]