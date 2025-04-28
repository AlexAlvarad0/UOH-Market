import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers, useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';
import { auth } from '../services/api';
import { register } from '../api';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
          if (!response.data.token) {
            setLoginError('Formato de respuesta inválido: falta el token');
            return;
          }
          
          const loginSuccess = await authLogin(response.data);
          
          if (loginSuccess) {
            navigate('/profile', { replace: true });
          } else {
            setToastMessage('Error al inicializar la sesión');
            setToastType('error');
            setShowToast(true);
          }
        } else {
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
        setToastMessage('Error al iniciar sesión: ' + (error.message || 'Error inesperado'));
        setToastType('error');
        setShowToast(true);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const initialRegisterValues = {
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  };

  const registerValidationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .required('El nombre de usuario es obligatorio'),
    email: Yup.string()
      .email('Correo electrónico inválido')
      .required('El correo electrónico es obligatorio')
      .matches(/@pregrado.uoh\.cl$/, 'Debe ser un correo institucional (@pregrado.uoh.cl)'),
    password: Yup.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .required('La contraseña es obligatoria'),
    password2: Yup.string()
      .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
      .required('Debes confirmar la contraseña'),
    first_name: Yup.string().required('El nombre es obligatorio'),
    last_name: Yup.string().required('El apellido es obligatorio')
  });

  const onRegisterSubmit = async (
    values: typeof initialRegisterValues,
    { setSubmitting, setErrors }: FormikHelpers<typeof initialRegisterValues>
  ) => {
    setApiErrors({});
    console.log('[Registro] Enviando datos:', values);
    try {
      const response = await register(values);
      console.log('[Registro] Respuesta de la API:', response);
      if (response && response.success) {
        setRegistrationSuccess(true);
        setTimeout(() => {
          setRegistrationSuccess(false);
          setIsSignUp(false);
        }, 2000);
      } else {
        console.log('[Registro] Respuesta inesperada:', response);
      }
    } catch (error: any) {
      console.error('[Registro] Error en catch:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data;
        console.log('[Registro] Errores de la API:', errData);
        const formattedErrors: Record<string, string[]> = {};
        Object.keys(errData).forEach(key => {
          if (Array.isArray(errData[key])) {
            formattedErrors[key] = errData[key];
          } else if (typeof errData[key] === 'string') {
            formattedErrors[key] = [errData[key]];
          } else {
            formattedErrors[key] = ['Entrada inválida'];
          }
        });
        setApiErrors(formattedErrors);
        const formikErrors: { [key: string]: string } = {};
        Object.keys(errData).forEach(key => {
          if (key in values) {
            formikErrors[key] = Array.isArray(errData[key]) 
              ? errData[key][0] 
              : String(errData[key]);
          }
        });
        setErrors(formikErrors);
      }
    } finally {
      setSubmitting(false);
      console.log('[Registro] setSubmitting(false)');
    }
  };

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
          <Formik
            initialValues={initialRegisterValues}
            validationSchema={registerValidationSchema}
            onSubmit={onRegisterSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <h1>Crear Cuenta</h1>
                {registrationSuccess && (
                  <div className="alert alert-success">
                    ¡Registro exitoso! Por favor revisa tu correo para verificar tu cuenta.
                  </div>
                )}
                {Object.keys(apiErrors).map((key) =>
                  apiErrors[key].map((error, i) => (
                    <div key={`${key}-${i}`} className="error-text">
                      {key === 'non_field_errors' ? error : `${key}: ${error}`}
                    </div>
                  ))
                )}
                <div className="register-columns">
                  <div className="register-column">
                    <div className="input-container">
                      <PersonIcon className="input-icon" />
                      <Field
                        type="text"
                        name="username"
                        placeholder="Nombre de usuario"
                        className="form-control"
                      />
                    </div>
                    <ErrorMessage name="username" component="div" className="error-text" />

                    <div className="input-container">
                      <PersonIcon className="input-icon" />
                      <Field
                        type="text"
                        name="first_name"
                        placeholder="Nombre"
                        className="form-control"
                      />
                    </div>
                    <ErrorMessage name="first_name" component="div" className="error-text" />

                    <div className="input-container">
                      <PasswordIcon className="input-icon" />
                      <Field
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        className="form-control"
                      />
                    </div>
                    <ErrorMessage name="password" component="div" className="error-text" />
                  </div>
                  <div className="register-column">
                    <div className="input-container">
                      <EmailIcon className="input-icon" />
                      <Field
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        className="form-control"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="error-text" />

                    <div className="input-container">
                      <PersonIcon className="input-icon" />
                      <Field
                        type="text"
                        name="last_name"
                        placeholder="Apellido"
                        className="form-control"
                      />
                    </div>
                    <ErrorMessage name="last_name" component="div" className="error-text" />

                    <div className="input-container">
                      <PasswordIcon className="input-icon" />
                      <Field
                        type="password"
                        name="password2"
                        placeholder="Confirmar contraseña"
                        className="form-control"
                      />
                    </div>
                    <ErrorMessage name="password2" component="div" className="error-text" />
                  </div>
                </div>
                <button type="submit" className="register-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrarse'}
                </button>
              </Form>
            )}
          </Formik>
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