import { useContext } from 'react';
import CartContext from './CartContext';

// Hook para usar el contexto del carrito
export const useCart = () => {
  return useContext(CartContext);
}; 