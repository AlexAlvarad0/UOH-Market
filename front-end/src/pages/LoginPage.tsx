import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';
import { auth } from '../services/api';
import PersonIcon from '@mui/icons-material/Person';
import PasswordIcon from '@mui/icons-material/Password';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Toast from '../components/common/Toast';

const LoginPage = () => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  
  // Estados para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para notificaciones toast
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');

  const togglePanel = () => setIsSignUp(!isSignUp);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Correo inválido').required('Requerido'),
      password: Yup.string().required('La contraseña es requerida')
    }),
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      // Verificar si hay campos vacíos
      if (!values.email || !values.password) {
        setToastMessage('Por favor complete todos los campos requeridos');
        setToastType('error');
        setShowToast(true);
        return;
      }

      try {
        setLoginError('');
        const response = await auth.login(values.email, values.password);
        if (response.success && response.data) {
          console.log('Datos recibidos para autenticación:', response.data);
          
          if (!response.data.token) {
            console.error('La respuesta no contiene un token:', response.data);
            setLoginError('Formato de respuesta inválido: falta el token');
            return;
          }
          
          const loginSuccess = await authLogin(response.data);
          
          console.log('Resultado del login en contexto:', loginSuccess);
          
          if (loginSuccess) {
            navigate('/profile', { replace: true });
          } else {
            setToastMessage('Error al inicializar la sesión');
            setToastType('error');
            setShowToast(true);
          }
        } else {
          console.error('Respuesta de error desde el servidor:', response.error);
          
          if (response.error && typeof response.error === 'object') {
            const errorFields = response.error;
            
            if (errorFields.email || errorFields.password) {
              const formikErrors: {email?: string, password?: string} = {};
              
              if (errorFields.email && Array.isArray(errorFields.email)) {
                formikErrors.email = errorFields.email[0];
              }
              
              if (errorFields.password && Array.isArray(errorFields.password)) {
                formikErrors.password = errorFields.password[0];
              }
              
              setErrors(formikErrors);
              setToastMessage('Error en los datos proporcionados. Por favor, verifica tus credenciales.');
              setToastType('error');
              setShowToast(true);
            } else {
              setToastMessage('Error en los datos proporcionados. Por favor, verifica tus credenciales.');
              setToastType('error');
              setShowToast(true);
            }
          } else {
            setToastMessage(response.error || 'Error al iniciar sesión. Verifica tus credenciales.');
            setToastType('error');
            setShowToast(true);
          }
        }
      } catch (error: any) {
        console.error('Error en login:', error);
        setToastMessage('Error al iniciar sesión: ' + (error.message || 'Error inesperado'));
        setToastType('error');
        setShowToast(true);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const registerFormik = useFormik({
    initialValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Requerido'),
      email: Yup.string().email('Correo inválido').required('Requerido'),
      firstName: Yup.string().required('Requerido'),
      lastName: Yup.string().required('Requerido'),
      password: Yup.string().min(8, 'Mínimo 8 caracteres').required('Requerido'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
        .required('Requerido')
    }),
    onSubmit: async (values) => {
      // Verificar si hay campos vacíos
      const requiredFields = ['username', 'email', 'firstName', 'lastName', 'password', 'confirmPassword'];
      const emptyFields = requiredFields.filter(field => !values[field as keyof typeof values]);
      
      if (emptyFields.length > 0) {
        setToastMessage('Por favor complete todos los campos requeridos');
        setToastType('error');
        setShowToast(true);
        return;
      }

      try {
        setRegisterError('');
        // Implementar la lógica de registro aquí
        const response = await auth.register(
          values.username, 
          values.email, 
          values.password,
          values.firstName,
          values.lastName
        );
        if (response && response.success) {
          setToastMessage('¡Registro exitoso! Por favor inicie sesión.');
          setToastType('success');
          setShowToast(true);
          togglePanel(); // Cambia a panel de login después de registro exitoso
        } else {
          setToastMessage('Error al registrar usuario.');
          setToastType('error');
          setShowToast(true);
        }
      } catch (error: any) {
        console.error('Error en registro:', error);
        setToastMessage('Error al registrar: ' + (error.message || 'Error inesperado'));
        setToastType('error');
        setShowToast(true);
      }
    }
  });

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      <Toast 
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={handleCloseToast}
      />
      
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up-container">
          <form onSubmit={registerFormik.handleSubmit}>
            <h1>Crear Cuenta</h1>
            {registerError && <p className="error">{registerError}</p>}
            
            <div className="register-columns">
              {/* Columna izquierda */}
              <div className="register-column">
                <div className="input-container">
                  <PersonIcon className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    name="username"
                    value={registerFormik.values.username}
                    onChange={registerFormik.handleChange}
                  />
                </div>
                {registerFormik.errors.username && registerFormik.touched.username && (
                  <div className="error-text">{registerFormik.errors.username}</div>
                )}
                
                <div className="input-container">
                  <PersonIcon className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nombre"
                    name="firstName"
                    value={registerFormik.values.firstName}
                    onChange={registerFormik.handleChange}
                  />
                </div>
                {registerFormik.errors.firstName && registerFormik.touched.firstName && (
                  <div className="error-text">{registerFormik.errors.firstName}</div>
                )}
                
                <div className="input-container">
                  <PasswordIcon className="input-icon" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    name="password"
                    value={registerFormik.values.password}
                    onChange={registerFormik.handleChange}
                  />
                  <div className="password-toggle" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                    {showRegisterPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </div>
                </div>
                {registerFormik.errors.password && registerFormik.touched.password && (
                  <div className="error-text">{registerFormik.errors.password}</div>
                )}
              </div>
              
              {/* Columna derecha */}
              <div className="register-column">
                <div className="input-container">
                  <EmailIcon className="input-icon" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    name="email"
                    value={registerFormik.values.email}
                    onChange={registerFormik.handleChange}
                  />
                </div>
                {registerFormik.errors.email && registerFormik.touched.email && (
                  <div className="error-text">{registerFormik.errors.email}</div>
                )}
                
                <div className="input-container">
                  <PersonIcon className="input-icon" />
                  <input
                    type="text"
                    placeholder="Apellido"
                    name="lastName"
                    value={registerFormik.values.lastName}
                    onChange={registerFormik.handleChange}
                  />
                </div>
                {registerFormik.errors.lastName && registerFormik.touched.lastName && (
                  <div className="error-text">{registerFormik.errors.lastName}</div>
                )}
                
                <div className="input-container">
                  <PasswordIcon className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    name="confirmPassword"
                    value={registerFormik.values.confirmPassword}
                    onChange={registerFormik.handleChange}
                  />
                  <div className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </div>
                </div>
                {registerFormik.errors.confirmPassword && registerFormik.touched.confirmPassword && (
                  <div className="error-text">{registerFormik.errors.confirmPassword}</div>
                )}
              </div>
            </div>
            
            <button type="submit" className="register-button">Registrarse</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form onSubmit={formik.handleSubmit}>
            <h1>Iniciar Sesión</h1>
            
            <div className="input-container">
              <EmailIcon className="input-icon" />
              <input
                type="email"
                placeholder="Correo"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
            </div>
            {formik.errors.email && formik.touched.email && (
              <div className="error-text">{formik.errors.email}</div>
            )}
            
            <div className="input-container">
              <PasswordIcon className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </div>
            </div>
            {formik.errors.password && formik.touched.password && (
              <div className="error-text">{formik.errors.password}</div>
            )}
            
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Para mantenerse conectado, inicie sesión con su información personal</p>
              <button className="ghost" onClick={togglePanel}>Iniciar Sesión</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¡Hola, amigo!</h1>
              <p>Ingrese sus datos personales y comience su viaje con nosotros</p>
              <button className="ghost" onClick={togglePanel}>Registrarse</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;