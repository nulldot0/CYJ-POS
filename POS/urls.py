from django.urls import path
from . import views

urlpatterns = [
    path('', views.handler_page),
    path('main-counter/', views.main, name='main-counter'),

    path('handler/', views.handler_page, name='handler-page'),
    path('handler/get-invoices/', views.handler_get_invoice),

    path('product-page/', views.product_page, name='product-page'),
    path('product-page/get-products/', views.product_page_get_products),
    path('product-page/get-categories/', views.product_page_get_categories),
    path('product-page/modify-product/<int:pk>', views.product_page_modify_product, name='modify-product'),
    path('product-page/get-sub-product/<int:pk>', views.product_page_get_sub_product),
    path('product-page/modify-sub-product/<str:action>/<int:pk>', views.product_page_modify_sub_product),
   
    path('sub-product-page/', views.sub_product_page, name='sub-product-page'),
    path('get-sub-products/', views.get_sub_products),
    
    path('add-new-product/', views.add_new_product),
    path('add-new-sub-product/<int:pk>', views.add_new_sub_product),
    path('add-new-category/', views.add_new_category),
    path('edit-product/<int:pk>', views.edit_product),

    path('get-products/', views.counter_get_products),
    path('add-customer/', views.add_customer),
    path('get-customers/', views.get_customers),
    path('get-sub-products-by-id/', views.get_sub_products_by_id),
    path('get-sub-product-units/<int:pk>', views.get_sub_products_units),
    path('change-customer/', views.change_customer),
    path('update-sub-product/<int:pk>', views.update_sub_product),

    path('counter/<int:pk>', views.counter, name='counter'),

    path('invoice-get-sub-product/<int:pk>', views.invoice_get_sub_product),
    path('invoice/<int:pk>', views.invoice, name='invoice'),

    path('pay/<int:pk>', views.pay_page, name='pay'),
    path('pay/payment/<str:method>/<int:pk>', views.pay_payment),
    path('get-total/<int:pk>', views.get_invoice_total),
]