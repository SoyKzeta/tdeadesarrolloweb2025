import { useContext } from 'react';
import CurrencyContext from './CurrencyContext';


export const useCurrency = () => {
  return useContext(CurrencyContext);
}; 