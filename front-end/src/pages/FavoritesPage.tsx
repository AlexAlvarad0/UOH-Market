import { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Card } from 'antd';
import { HeartFilled } from '@ant-design/icons';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Aquí irá la lógica para cargar los favoritos
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mis Favoritos
      </Typography>

      <Grid container spacing={3}>
        {favorites.map((item: any) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              cover={<img alt={item.title} src={item.image} />}
              actions={[
                <HeartFilled key="heart" style={{ color: '#ff4d4f' }} />
              ]}
            >
              <Card.Meta
                title={item.title}
                description={`$${item.price}`}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {favorites.length === 0 && (
        <Typography variant="body1" sx={{ mt: 3 }}>
          No tienes productos favoritos
        </Typography>
      )}
    </Box>
  );
};

export default FavoritesPage;
