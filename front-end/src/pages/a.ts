import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper
} from '@mui/material';
import { auth } from '../services/api';  // Importando auth del nuevo archivo

const LoginPage = () => {
  const { login: authLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  
  // Añadir log para depuración del estado de autenticación
  useEffect(() => {
    console.log('Estado de autenticación:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Correo electrónico inválido')
        .required('El correo electrónico es requerido'),
      password: Yup.string()
        .required('La contraseña es requerida')
    }),
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        setLoginError('');
        
        // Mostrar información de depuración
        console.log('Intentando iniciar sesión con:', values.email);
        
        // Esta llamada a auth.login hace la petición a la API y devuelve la respuesta
        const response = await auth.login(values.email, values.password);
        
        // Mostrar respuesta para depuración
        console.log('Respuesta completa del servidor:', response);
        
        if (response.success && response.data) {
          console.log('Datos recibidos para autenticación:', response.data);
          
          // Asegurémonos de que los datos tienen la estructura esperada
          if (!response.data.token) {
            console.error('La respuesta no contiene un token:', response.data);
            setLoginError('Formato de respuesta inválido: falta el token');
            return;
          }
          
          // Esta llamada a authLogin NO debe hacer otra petición a la API
          // Solo debe establecer el estado de autenticación con los datos ya obtenidos
          const loginSuccess = await authLogin(response.data);
          
          console.log('Resultado del login en contexto:', loginSuccess);
          
          if (loginSuccess) {
            navigate('/profile', { replace: true });
          } else {
            setLoginError('Error al inicializar la sesión en el contexto de autenticación');
          }
        } else {
          console.error('Respuesta de error desde el servidor:', response.error);
          
          // Manejar errores específicos del campo
          if (response.error && typeof response.error === 'object') {
            const errorFields = response.error;
            
            // Si hay errores específicos para cada campo, mostrarlos en Formik
            if (errorFields.email || errorFields.password) {
              const formikErrors: {email?: string, password?: string} = {};
              
              if (errorFields.email && Array.isArray(errorFields.email)) {
                formikErrors.email = errorFields.email[0];
              }
              
              if (errorFields.password && Array.isArray(errorFields.password)) {
                formikErrors.password = errorFields.password[0];
              }
              
              setErrors(formikErrors);
            } else {
              // Si es otro tipo de error estructurado, mostrar mensaje general
              setLoginError(
                'Error en los datos proporcionados. Por favor, verifica tus credenciales.'
              );
            }
          } else {
            // Si es un mensaje de error simple
            setLoginError(response.error || 'Error al iniciar sesión. Verifica tus credenciales.');
          }
        }
      } catch (error: any) {
        console.error('Error en login:', error);
        setLoginError(error.message || 'Error inesperado al iniciar sesión.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Iniciar Sesión
        </Typography>
        
        {loginError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loginError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Correo Electrónico"
            variant="outlined"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            variant="outlined"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-primary-600 hover:underline">
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;