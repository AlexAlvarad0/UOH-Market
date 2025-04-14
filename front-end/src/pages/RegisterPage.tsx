import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers, useFormik } from 'formik';
import * as Yup from 'yup';
import { register, registerSimple } from '../api';
import { Alert, Button, Container, Card, Row, Col } from 'react-bootstrap';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  const initialValues: RegisterFormValues = {
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    user_type: 'customer'
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    password2: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    user_type: Yup.string()
      .required('Debes seleccionar un tipo de usuario')
      .oneOf(['customer', 'seller'], 'Tipo de usuario inválido'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',  // Add username field
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('El nombre de usuario es obligatorio')
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
      email: Yup.string()
        .email('Correo electrónico inválido')
        .required('El correo electrónico es obligatorio')
        .matches(/@pregrado.uoh\.cl$/, 'Debe ser un correo institucional (@pregrado.uoh.cl)'),
      password: Yup.string()
        .required('La contraseña es obligatoria')
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
        .required('Debes confirmar la contraseña')
    }),
    onSubmit: async (values) => {
      try {
        const success = await registerSimple(values.username, values.email, values.password);
        if (success) {
          navigate('/');
        } else {
          setRegisterError('Error al registrar la cuenta. Inténtalo nuevamente.');
        }
      } catch (err) {
        setRegisterError('Error al registrar la cuenta. Inténtalo nuevamente.');
      }
    }
  });

  const onSubmit = async (values: RegisterFormValues, { setSubmitting, setErrors }: FormikHelpers<RegisterFormValues>) => {
    setApiErrors({});
    
    try {
      const response = await register(values);
      console.log('Registration successful:', response);
      setRegistrationSuccess(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data) {
        // Format API errors to display them properly
        const errData = error.response.data;
        const formattedErrors: Record<string, string[]> = {};
        
        Object.keys(errData).forEach(key => {
          // Handle both array and string error formats
          if (Array.isArray(errData[key])) {
            formattedErrors[key] = errData[key];
          } else if (typeof errData[key] === 'string') {
            formattedErrors[key] = [errData[key]];
          } else {
            formattedErrors[key] = ['Invalid input'];
          }
        });
        
        setApiErrors(formattedErrors);
        
        // Also set errors in Formik format to highlight fields
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
      setSubmitting(false);  // Always ensure submitting state is reset
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Register</Card.Title>
              
              {registrationSuccess ? (
                <Alert variant="success">
                  Registration successful! Please check your email to verify your account.
                </Alert>
              ) : (
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      {Object.keys(apiErrors).map((key) => (
                        apiErrors[key].map((error, i) => (
                          <Alert key={`${key}-${i}`} variant="danger">
                            {key === 'non_field_errors' ? error : `${key}: ${error}`}
                          </Alert>
                        ))
                      ))}
                      
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <Field 
                          type="text" 
                          name="username" 
                          className="form-control" 
                        />
                        <ErrorMessage name="username" component="div" className="text-danger" />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <Field 
                          type="email" 
                          name="email" 
                          className="form-control" 
                        />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="first_name" className="form-label">First Name</label>
                        <Field 
                          type="text" 
                          name="first_name" 
                          className="form-control" 
                        />
                        <ErrorMessage name="first_name" component="div" className="text-danger" />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="last_name" className="form-label">Last Name</label>
                        <Field 
                          type="text" 
                          name="last_name" 
                          className="form-control" 
                        />
                        <ErrorMessage name="last_name" component="div" className="text-danger" />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <Field 
                          type="password" 
                          name="password" 
                          className="form-control" 
                        />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="password2" className="form-label">Confirm Password</label>
                        <Field 
                          type="password" 
                          name="password2" 
                          className="form-control" 
                        />
                        <ErrorMessage name="password2" component="div" className="text-danger" />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="user_type" className="form-label">Tipo de Usuario</label>
                        <Field 
                          as="select"
                          name="user_type" 
                          className="form-control"
                        >
                          <option value="customer">Cliente</option>
                          <option value="seller">Vendedor</option>
                        </Field>
                        <ErrorMessage name="user_type" component="div" className="text-danger" />
                      </div>
                      
                      <div className="d-grid">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          variant="primary"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Registering...
                            </>
                          ) : 'Register'}
                        </Button>
                      </div>
                      
                      <div className="text-center mt-3">
                        <Button 
                          variant="link" 
                          onClick={() => navigate('/login')}
                        >
                          Already have an account? Login
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;