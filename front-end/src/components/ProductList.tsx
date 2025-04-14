import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, CardActions, IconButton, Skeleton, Box } from '@mui/material';
import { Favorite, FavoriteBorder, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface ProductListProps {
  products: any[];
  onFavoriteClick?: (id: number) => void;
  isLoading?: boolean;
  itemsPerRow?: number;
  uniformSize?: boolean;
  cardHeight?: number;
  imageHeight?: number;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onFavoriteClick, 
  isLoading = false,
  itemsPerRow = 4,
  uniformSize = false,
  cardHeight = 380, // Valor por defecto aumentado
  imageHeight = 210  // Valor por defecto aumentado
}) => {
  // Función para obtener la URL de la imagen del producto
  const getProductImageUrl = (product: any) => {
    // Primero verificar si hay imágenes en el objeto product
    if (product.images && product.images.length > 0) {
      return product.images[0].image;
    }
    
    // Si hay una propiedad image directa
    if (product.image) {
      return product.image;
    }
    
    // Si no hay imagen, retornar un placeholder
    return 'https://placehold.co/300x200?text=No+Image';
  };

  // Calcular los breakpoints según itemsPerRow
  const getGridItemSize = () => {
    switch(itemsPerRow) {
      case 5:
        // Usando fracciones exactas para 5 elementos por fila
        return { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2.4 };
      case 4:
        return { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 };
      case 3:
        return { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 };
      case 2:
        return { xs: 12, sm: 6, lg: 6, xl: 6 };
      default:
        return { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 };
    }
  };

  const gridSize = getGridItemSize();

  if (isLoading) {
    // Show loading skeleton
    return (
      <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
        {[...Array(itemsPerRow * 2)].map((_, index) => (
          <Grid item xs={gridSize.xs} sm={gridSize.sm} md={gridSize.md} lg={gridSize.lg} xl={gridSize.xl} key={`skeleton-${index}`}>
            <Card sx={{ height: cardHeight, width: '100%' }}>
              <Skeleton variant="rectangular" height={imageHeight} />
              <CardContent>
                <Skeleton height={30} width="80%" />
                <Skeleton height={20} width="50%" />
                <Skeleton height={20} width="70%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
      {products.map((product) => (
        <Grid item xs={gridSize.xs} sm={gridSize.sm} md={gridSize.md} lg={gridSize.lg} xl={gridSize.xl} key={product.id}>
          <Card 
            sx={{ 
              height: uniformSize ? cardHeight : '100%',
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              overflow: 'hidden',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6
              }
            }}
          >
            <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ position: 'relative', height: imageHeight, width: '100%' }}>
                <CardMedia
                  component="img"
                  height={imageHeight}
                  image={getProductImageUrl(product)}
                  alt={product.title}
                  sx={{ 
                    objectFit: 'cover',
                    width: '100%'
                  }}
                />
              </Box>
              
              <CardContent sx={{ 
                flexGrow: 1, 
                pb: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: `calc(${cardHeight}px - ${imageHeight}px - 48px)`, // Ajuste para mantener altura consistente
              }}>
                <Box>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h2" 
                    noWrap 
                    sx={{ 
                      fontSize: '1.1rem', // Aumentado ligeramente
                      fontWeight: 'bold',
                      mb: 0.5
                    }}
                  >
                    {product.title}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="primary" 
                    sx={{ fontSize: '1.2rem', mb: 1 }} // Aumentado ligeramente
                  >
                    ${product.price?.toLocaleString()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3, // Aumentado a 3 líneas
                      WebkitBoxOrient: 'vertical',
                      minHeight: '60px' // Altura para 3 líneas aproximadamente
                    }}
                  >
                    {product.description}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility fontSize="small" sx={{ mr: 0.5 }} />
                    {product.views_count || 0}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      textTransform: 'capitalize',
                      backgroundColor: '#f0f0f0',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5
                    }}
                  >
                    {product.condition === 'new' ? 'Nuevo' : 
                     product.condition === 'like_new' ? 'Como nuevo' : 
                     product.condition === 'good' ? 'Buen estado' : 
                     product.condition === 'fair' ? 'Estado aceptable' : 
                     product.condition === 'poor' ? 'Deteriorado' : 
                     product.condition}
                  </Typography>
                </Box>
              </CardContent>
            </Link>
            
            {onFavoriteClick && (
              <CardActions disableSpacing sx={{ justifyContent: 'flex-end', pt: 0, mt: 'auto' }}>
                <IconButton 
                  aria-label="add to favorites" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavoriteClick(product.id);
                  }}
                >
                  {product.is_favorite === true ? 
                    <Favorite color="error" /> : 
                    <FavoriteBorder />
                  }
                </IconButton>
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
