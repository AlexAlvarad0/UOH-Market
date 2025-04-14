import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Paper, 
  Chip, Button, Divider, Alert, CircularProgress, 
  ImageList, ImageListItem, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  Snackbar
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import EditButton from '../components/buttons/EditButton';
import DeleteButton from '../components/buttons/DeleteButton';
import EditProductModal from '../components/EditProductModal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Tipo para el producto
interface ProductType {
  id: number;
  title: string;
  description: string;
  price: number | string; // Cambiado para aceptar string o number
  category: {
    id: number;
    name: string;
  };
  condition: string;
  seller: {
    id: number;
    username: string;
    email: string;
  };
  images: {
    id: number;
    image: string;
    is_primary: boolean;
  }[];
  created_at: string;
  views_count: number;
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Determinar si el usuario actual es el propietario del producto
  const isOwner = user && product && user.id === product.seller.id;

  // Mapeo de condiciones de inglés a español
  const conditionMap: Record<string, string> = {
    'new': 'Nuevo',
    'like_new': 'Como nuevo',
    'good': 'Buen estado',
    'fair': 'Estado aceptable',
    'poor': 'Mal estado'
  };

  // Función auxiliar para obtener el nombre de la categoría
  const getCategoryName = (product: ProductType) => {
    // Si la categoría es un objeto con propiedad name
    if (product.category && typeof product.category === 'object' && product.category.name) {
      return product.category.name;
    }
    // Si hay una propiedad category_name directa
    if (product.category_name) {
      return product.category_name;
    }
    // Si la categoría es un string directamente
    if (typeof product.category === 'string') {
      return product.category;
    }
    // Valor por defecto
    return "Categoría no disponible";
  };

  // Función para obtener el nombre traducido de la condición
  const getConditionName = (condition: string) => {
    return conditionMap[condition] || condition;
  };

  useEffect(() => {
    const getProductDetails = async () => {
      // Log para depuración
      console.log('productId desde useParams:', productId);
      
      // Validación de ID
      if (!productId) {
        console.error('ID de producto no disponible en los parámetros de la URL');
        setError('ID de producto no proporcionado');
        setLoading(false);
        return;
      }
      
      const numericId = parseInt(productId, 10);
      if (isNaN(numericId)) {
        console.error('El ID de producto no es un número válido:', productId);
        setError(`ID de producto inválido: ${productId}`);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Solicitando detalles del producto con ID: ${numericId}`);
        const response = await api.getProductById(numericId);
        
        console.log('Respuesta de la API:', response);
        
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          console.error('Error en respuesta de API:', response.error);
          setError(response.error || 'No se pudo cargar el producto');
        }
      } catch (err: any) {
        console.error('Error en la obtención de detalles:', err);
        setError(err.message || 'Error desconocido al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    getProductDetails();
  }, [productId]);

  const reloadProductData = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const numericId = parseInt(productId, 10);
      const response = await api.getProductById(numericId);
      
      if (response.success && response.data) {
        setProduct(response.data);
        setNotification({ 
          message: 'Producto actualizado correctamente', 
          type: 'success' 
        });
      } else {
        console.error('Error recargando datos del producto:', response.error);
      }
    } catch (err) {
      console.error('Error al recargar producto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!product || !isAuthenticated) return;
    
    try {
      const response = await api.addToFavorites(product.id);
      if (response.success) {
        // Mostrar mensaje de éxito
        alert('Producto añadido a favoritos');
      } else {
        // Mostrar mensaje de error
        alert(response.error || 'Error al añadir a favoritos');
      }
    } catch (err: any) {
      console.error('Error adding to favorites:', err);
      alert('Error al añadir a favoritos');
    }
  };

  const handleContactSeller = () => {
    if (!product || !isAuthenticated) return;
    
    // Navegar a la página de chat con el vendedor
    navigate(`/chat/${product.seller.id}?product=${product.id}`);
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      const response = await api.deleteProduct(product.id);
      
      if (response.success) {
        // Cerrar el diálogo
        setDeleteDialogOpen(false);
        
        // Mostrar mensaje de éxito
        setNotification({
          message: 'Producto eliminado correctamente',
          type: 'success'
        });
        
        // Navegar a la página principal después de un breve retraso
        // Cambiamos la redirección de '/dashboard' a '/'
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(response.error || 'Error al eliminar el producto');
        setDeleteDialogOpen(false);
      }
    } catch (err: any) {
      console.error('Error al eliminar el producto:', err);
      setError(err.message || 'Error desconocido al eliminar el producto');
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Renderizamos diferentes estados de la UI
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" mt={2}>Cargando detalles del producto...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Volver atrás
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          No se encontró información del producto.
        </Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Volver atrás
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        message={notification?.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          '& .MuiSnackbarContent-root': { 
            bgcolor: notification?.type === 'success' ? 'success.main' : 'error.main'
          }
        }}
      />
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Imágenes del producto */}
          <Grid item xs={12} md={6}>
            {product.images && product.images.length > 0 ? (
              <Box sx={{ position: 'relative' }}>
                <Carousel>
                  <CarouselContent>
                    {product.images.map((img) => (
                      <CarouselItem key={img.id}>
                        <img
                          src={img.image}
                          alt={`Vista ${img.id}`}
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                          }}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '10px',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                    }}
                  />
                  <CarouselNext
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                    }}
                  />
                </Carousel>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  height: 300, 
                  bgcolor: 'grey.200', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Typography variant="subtitle1" color="text.secondary">
                  No hay imagen disponible
                </Typography>
              </Box>
            )}
            
            {/* Botones de edición y eliminación solo para el propietario - movidos debajo de la imagen */}
            {isOwner && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <EditButton 
                    onClick={() => setEditModalOpen(true)}
                    buttonText="Editar"
                  />
                </Box>
                
                <Box>
                  <DeleteButton 
                    onClick={() => setDeleteDialogOpen(true)}
                    buttonText="Eliminar"
                  />
                </Box>
              </Box>
            )}
          </Grid>
          
          {/* Detalles del producto */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.title}
              </Typography>
              
              {/* Eliminado el contenedor de botones de aquí */}
            </Box>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ${typeof product.price === 'number' 
                ? product.price.toFixed(2) 
                : parseFloat(product.price).toFixed(2)}
            </Typography>
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Chip 
                label={getCategoryName(product)} 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={getConditionName(product.condition)} 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Vendedor: {product.seller.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Publicado el: {new Date(product.created_at).toLocaleDateString()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Visitas: {product.views_count}
              </Typography>
            </Box>
            
            <Divider sx={{ mt: 2, mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Descripción
            </Typography>
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Divider sx={{ mt: 2, mb: 2 }} />
            
            {/* Botones de acción para usuarios no propietarios */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {isAuthenticated ? (
                !isOwner ? (
                  <>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleContactSeller}
                    >
                      Contactar Vendedor
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      fullWidth 
                      onClick={handleAddToFavorites}
                    >
                      Añadir a Favoritos
                    </Button>
                  </>
                ) : (
                  <Typography variant="subtitle2" color="text.secondary">
                    Este es tu producto. Los usuarios interesados podrán contactarte.
                  </Typography>
                )
              ) : (
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => navigate('/login')}
                >
                  Inicia sesión para contactar
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteProduct} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de edición rápida */}
      {product && (
        <EditProductModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          product={product}
          onSuccess={reloadProductData}
        />
      )}
    </Container>
  );
};

export default ProductDetailPage;
