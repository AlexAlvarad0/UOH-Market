import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import api from '../services/api';
import { processImages } from '../utils/imageUtils';

const NewProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateProduct = async (productData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Procesando imágenes del producto...");

      // Extraer las imágenes del FormData
      const imageFiles: File[] = [];
      const nonImageEntries: [string, any][] = [];

      productData.forEach((value, key) => {
        if (value instanceof File && value.type.startsWith('image/')) {
          imageFiles.push(value);
        } else {
          nonImageEntries.push([key, value]);
        }
      });

      // Procesar las imágenes para hacerlas cuadradas
      const processedImages = await processImages(imageFiles);

      // Crear nuevo FormData con las imágenes procesadas
      const processedData = new FormData();

      // Agregar entradas que no son imágenes
      nonImageEntries.forEach(([key, value]) => {
        processedData.append(key, value);
      });

      // Agregar las imágenes procesadas con el formato correcto (images[0], images[1], etc.)
      processedImages.forEach((image, index) => {
        processedData.append(`images[${index}]`, image);
      });

      // Establecer la imagen primaria (primera imagen) si hay al menos una
      if (processedImages.length > 0) {
        processedData.append('primary_image_index', '0');
      }

      console.log("Enviando datos del producto con imágenes procesadas");
      
      // Log para verificar que las imágenes estén en el FormData
      console.log("Contenido del FormData:");
      for (let [key, value] of processedData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: archivo - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await api.createProduct(processedData);

      if (response.success && response.data) {
        navigate(`/products/${response.data.id}`);
      } else {
        let errorMessage = 'Error al crear el producto';
        if (response.error) {
          errorMessage = typeof response.error === 'string'
            ? response.error
            : JSON.stringify(response.error);
        }
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      setError(error.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Crear Nuevo Producto
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <ProductForm onSubmit={handleCreateProduct} />
      </Paper>
    </Container>
  );
};

export default NewProductPage;
