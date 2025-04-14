import React, { useState } from 'react';
import { Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';
import { Product } from '../types/products';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import placeholderImage from '../assets/placeholder-image.png'; // Create a placeholder image in assets folder

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Encontrar la imagen primaria o la primera
  const image = product.images && product.images.length > 0
    ? product.images.find(img => img.is_primary) || product.images[0]
    : null;
  
  const [imageError, setImageError] = useState(false);
  const imageUrl = image && !imageError ? image.image : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} to={`/products/${product.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '100%', // Crea una relación de aspecto cuadrada
          backgroundColor: '#f5f5f5'
        }}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.title} 
              onError={() => setImageError(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }} 
            />
          ) : (
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eeeeee',
              color: '#999'
            }}>
              <Typography variant="body2">Sin imagen</Typography>
            </Box>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 500, 
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.category_name}
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ mt: 'auto', fontWeight: 700 }}>
            ${Number(product.price).toFixed(2)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
