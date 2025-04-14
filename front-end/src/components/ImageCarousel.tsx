import React, { useState } from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ProductImage } from '../types/products';

interface ImageCarouselProps {
  images: ProductImage[];
  height?: string | number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  height = '400px' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Si no hay imágenes, mostrar un placeholder
  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          height,
          width: '100%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
        }}
      >
        <span>No hay imágenes disponibles</span>
      </Box>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Imagen principal */}
      <Box
        sx={{
          height,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 1,
          position: 'relative',
          backgroundColor: '#f5f5f5',
        }}
      >
        <img
          src={images[currentIndex].image}
          alt={`Imagen ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain', // contain para ver la imagen completa
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Imagen+no+disponible';
          }}
        />
        
        {/* Botones de navegación */}
        {images.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 8,
                backgroundColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                backgroundColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}
      </Box>
      
      {/* Miniaturas */}
      {images.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            gap: 1,
            overflowX: 'auto',
            pb: 1,
          }}
        >
          {images.map((image, index) => (
            <Paper
              key={image.id}
              elevation={currentIndex === index ? 4 : 1}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                width: 80,
                height: 80,
                cursor: 'pointer',
                border: currentIndex === index ? '2px solid #1976d2' : '1px solid #ddd',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <img
                src={image.image}
                alt={`Miniatura ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageCarousel;
