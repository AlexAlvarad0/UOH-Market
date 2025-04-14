import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// Importamos correctamente desde hooks/useAuth
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ConfigProvider } from 'antd';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditForm from './pages/ProfileEditForm';
import FavoritesPage from './pages/FavoritesPage';
import ChatPage from './pages/ChatPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import PrivateRoute from './components/PrivateRoute';
import NewProductPage from './pages/NewProductPage';
import EditProductPage from './pages/EditProductPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';
import SellerDashboardPage from './pages/SellerDashboardPage';

// Tema personalizado para Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5',
    },
    secondary: {
      main: '#3730a3',
    },
  },
});

// Tema personalizado para Ant Design
const antTheme = {
  token: {
    colorPrimary: '#4f46e5',
    borderRadius: 6,
  },
};

// Componente interno para acceder a los hooks de navegación
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleAddProduct = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Ya no verificamos si el usuario es vendedor
    // Todos los usuarios pueden publicar productos
    navigate('/product/new');
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      <ThemeProvider theme={theme}>
        <ConfigProvider theme={antTheme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              } />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="confirm-email/:uid/:token" element={<ConfirmEmailPage />} />
              <Route 
                path="products/:productId" 
                element={<ProductDetailPage />} 
              />
              
              {/* Rutas protegidas */}
              <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="profile/edit" element={<PrivateRoute><ProfileEditForm /></PrivateRoute>} />
              <Route path="favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
              <Route path="chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="chat/:conversationId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="product/new" element={<PrivateRoute><NewProductPage /></PrivateRoute>} />
              <Route path="product/edit/:id" element={<PrivateRoute><EditProductPage /></PrivateRoute>} />
              
              {/* Seller routes */}
              <Route path="seller/dashboard" element={<PrivateRoute><SellerDashboardPage /></PrivateRoute>} />
              
              {/* Página 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>

          {/* Floating Action Button for adding new products */}
          <Fab 
            color="primary" 
            aria-label="add" 
            onClick={handleAddProduct}
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16 
            }}
          >
            <AddIcon />
          </Fab>
        </ConfigProvider>
      </ThemeProvider>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;