import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
}; 