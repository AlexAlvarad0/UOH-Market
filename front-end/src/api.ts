import axios from 'axios';
import { API_URL } from './config';

type RegisterData = {
  username: string;
  email: string;
  password: string;
  password2?: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
};

/**
 * Registra un nuevo usuario
 */
export const register = async (userData: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/api/accounts/register/`, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Error en el registro');
  }
};

/**
 * Versión simplificada para compatibilidad con implementaciones existentes
 */
export const registerSimple = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/accounts/register/`, {
      username,
      email,
      password,
      password2: password // Muchas APIs de Django requieren confirmación de contraseña
    });
    return true;
  } catch (error) {
    console.error('Error en el registro:', error);
    return false;
  }
};

export const login = async (email: string, password: string) => {
  try {
    // Actualizando la URL para usar auth en lugar de accounts
    const response = await axios.post(`${API_URL}/api/login/`, { email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Error en el inicio de sesión');
  }
};
