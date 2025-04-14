import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Container, Typography, Box, CircularProgress, Alert, 
  Pagination, FormControl, InputLabel, Select, MenuItem,
  Grid, Slider, Paper, Chip
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import ProductList from '../components/ProductList';
import api from '../services/api';

const HomePage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: new URLSearchParams(location.search).get('search') || '',
    category: new URLSearchParams(location.search).get('category') || '', // Inicializar category desde URL
    min_price: 0,
    max_price: 1000000,
    condition: '',
    ordering: '-created_at'
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  // Cuando cambie la URL, actualizar los filtros (search y category)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    let updatedFilters = { ...filters };
    let filtersChanged = false;
    
    if (searchParam !== null) {
      updatedFilters.search = searchParam;
      filtersChanged = true;
    } else if (filters.search) {
      updatedFilters.search = '';
      filtersChanged = true;
    }
    
    if (categoryParam !== null) {
      updatedFilters.category = categoryParam;
      filtersChanged = true;
    } else if (filters.category) {
      updatedFilters.category = '';
      filtersChanged = true;
    }
    
    if (filtersChanged) {
      setFilters(updatedFilters);
      setPage(1); // Resetear a la primera página cuando cambian los filtros
    }
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await api.getCategories();
        // Ensure categories is always an array
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        } else {
          console.error("Categories data is not an array:", response.data);
          setCategories([]); // Set to empty array to avoid mapping issues
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]); // Set to empty array on error
      }
    };

    getCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products with filters:', { page, ...filters });
        
        const response = await api.getProducts({
          page,
          search: filters.search,
          category: filters.category,
          min_price: filters.min_price,
          max_price: filters.max_price,
          condition: filters.condition,
          ordering: filters.ordering
        });
        
        console.log('Products response:', response);
        
        if (response.success && response.data) {
          // Handle both paginated and non-paginated responses
          const productData = response.data.results || response.data;
          const totalCount = response.data.count || productData.length;
          
          setProducts(Array.isArray(productData) ? productData : []);
          setTotalPages(Math.ceil(totalCount / 12)); // Assuming 12 items per page
        } else {
          setError("No se pudieron cargar los productos.");
          setProducts([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("No se pudieron cargar los productos. Por favor, inténtelo de nuevo más tarde.");
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [page, filters]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const applyPriceFilter = () => {
    setFilters(prev => ({ 
      ...prev, 
      min_price: priceRange[0], 
      max_price: priceRange[1] 
    }));
    setPage(1);
  };

  const handleFavoriteClick = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login page
      return;
    }
    
    try {
      // Check if product is already in favorites
      const productIndex = products.findIndex(p => p.id === productId);
      const isFavorite = products[productIndex]?.is_favorite;
      
      if (isFavorite) {
        await api.removeFromFavorites(productId);
      } else {
        await api.addToFavorites(productId);
      }
      
      // Update local state to reflect changes
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, is_favorite: !product.is_favorite } 
            : product
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 2,
        px: { xs: 1, sm: 2 }, 
        width: '100%', 
        boxSizing: 'border-box'
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Productos disponibles
      </Typography>

      {/* Filtros - Forma rectangular */}
      <Paper 
        sx={{ 
          mb: 3, 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 2,
          width: '100%',
          maxWidth: '100%',
        }}
        elevation={2}
      >
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.category}
                label="Categoría"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {Array.isArray(categories) ? (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Error cargando categorías</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Condición</InputLabel>
              <Select
                value={filters.condition}
                label="Condición"
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="new">Nuevo</MenuItem>
                <MenuItem value="like_new">Como nuevo</MenuItem>
                <MenuItem value="good">Buen estado</MenuItem>
                <MenuItem value="fair">Estado aceptable</MenuItem>
                <MenuItem value="poor">Deteriorado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filters.ordering}
                label="Ordenar por"
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
              >
                <MenuItem value="-created_at">Más recientes</MenuItem>
                <MenuItem value="price">Precio: menor a mayor</MenuItem>
                <MenuItem value="-price">Precio: mayor a menor</MenuItem>
                <MenuItem value="-views_count">Más vistos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Rango de precios</Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                onChangeCommitted={applyPriceFilter}
                valueLabelDisplay="auto"
                min={0}
                max={1000000}
                valueLabelFormat={(value) => `$${value.toLocaleString()}`}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2">${priceRange[0].toLocaleString()}</Typography>
                <Typography variant="body2">${priceRange[1].toLocaleString()}</Typography>
              </Box>
            </Box>
          </Grid>

          {Object.keys(filters).some(key => filters[key] !== '' && key !== 'ordering') && (
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.75,
                mt: 1
              }}>
                {filters.category && (
                  <Chip 
                    label={`Categoría: ${categories.find(c => c.id === filters.category)?.name || ''}`}
                    onDelete={() => handleFilterChange('category', '')}
                  />
                )}
                {filters.condition && (
                  <Chip 
                    label={`Condición: ${
                      {
                        'new': 'Nuevo',
                        'like_new': 'Como nuevo',
                        'good': 'Buen estado',
                        'fair': 'Estado aceptable',
                        'poor': 'Deteriorado'
                      }[filters.condition] || filters.condition
                    }`}
                    onDelete={() => handleFilterChange('condition', '')}
                  />
                )}
                {filters.min_price > 0 || filters.max_price < 1000000 ? (
                  <Chip 
                    label={`Precio: $${filters.min_price.toLocaleString()} - $${filters.max_price.toLocaleString()}`}
                    onDelete={() => {
                      setPriceRange([0, 1000000]);
                      handleFilterChange('min_price', 0);
                      handleFilterChange('max_price', 1000000);
                    }}
                  />
                ) : null}
                {filters.search && (
                  <Chip 
                    label={`Búsqueda: ${filters.search}`}
                    onDelete={() => handleFilterChange('search', '')}
                  />
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : products.length > 0 ? (
        <>
          <ProductList 
            products={products} 
            onFavoriteClick={handleFavoriteClick}
            isLoading={loading}
            itemsPerRow={6} // Configurar 5 productos por fila
            uniformSize={true} // Garantizar tamaño uniforme
            cardHeight={380} // Aumentado de 320 a 380
            imageHeight={220} // Aumentado de 160 a 210
          />
          <Box sx={{ 
            mt: 2, 
            mb: 2,
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              size="medium"
              siblingCount={0}
              boundaryCount={1}
            />
          </Box>
        </>
      ) : (
        <Alert severity="info" sx={{ my: 2 }}>
          No se encontraron productos que coincidan con los filtros seleccionados.
        </Alert>
      )}
    </Container>
  );
};

export default HomePage;