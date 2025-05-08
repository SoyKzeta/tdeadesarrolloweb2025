import { useContext } from 'react';
import CurrencyContext from './CurrencyContext';

// Hook para usar el contexto de monedas
export const useCurrency = () => {
  return useContext(CurrencyContext);
}; 