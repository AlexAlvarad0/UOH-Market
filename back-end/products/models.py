from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import os

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Product(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    condition = models.CharField(max_length=50, choices=[
        ('new', 'Nuevo'),
        ('like_new', 'Como nuevo'),
        ('good', 'Buen estado'),
        ('fair', 'Estado aceptable'),
        ('poor', 'Mal estado'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_available = models.BooleanField(default=True)
    views_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.title

def validate_image(image):
    # Temporarily make validation less strict for debugging
    # Validar tamaño máximo (10MB en lugar de 5MB)
    max_size = 10 * 1024 * 1024  # 10MB en bytes
    if image.size > max_size:
        raise ValidationError(f'La imagen no debe superar los 10MB (tamaño actual: {image.size / 1024 / 1024:.2f}MB)')
    
    # Accept more image formats
    ext = os.path.splitext(image.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    if ext not in valid_extensions:
        raise ValidationError(f'Formato de imagen no soportado. Por favor, suba una imagen en formato: {", ".join(valid_extensions)}')

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/', validators=[validate_image])
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image for {self.product.title}"

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        
    def __str__(self):
        return f"{self.user.username} favorited {self.product.title}"