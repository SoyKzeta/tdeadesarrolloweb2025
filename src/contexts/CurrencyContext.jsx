import { createContext, useState, useEffect } from 'react';

// Definir tasas de cambio (valores aproximados)
const exchangeRates = {
  USD: 1,               // Dólar estadounidense (base)
  COP: 4080,            // Peso colombiano
  MXN: 16.9,            // Peso mexicano
  EUR: 0.91,            // Euro
  ARS: 850,             // Peso argentino
  CLP: 900,             // Peso chileno
  PEN: 3.66,            // Sol peruano
  BRL: 5.1              // Real brasileño
};

// Crear contexto
const CurrencyContext = createContext();

// Proveedor del contexto
export const CurrencyProvider = ({ children }) => {
  // Estado para la moneda seleccionada (por defecto COP)
  const [currency, setCurrency] = useState('COP');
  
  // Cargar moneda guardada si existe
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);
  
  // Función para cambiar la moneda
  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };
  
  // Función para convertir precios
  const formatPrice = (priceInUSD) => {
    if (!priceInUSD) return '0';
    
    const price = priceInUSD * exchangeRates[currency];
    
    // Formatear según la moneda
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // Obtener símbolo de la moneda
  const getCurrencySymbol = () => {
    const symbols = {
      USD: '$',
      COP: 'COL$',
      MXN: 'MX$',
      EUR: '€',
      ARS: 'AR$',
      CLP: 'CL$',
      PEN: 'S/',
      BRL: 'R$'
    };
    
    return symbols[currency] || '';
  };
  
  // Valor del contexto
  const value = {
    currency,
    changeCurrency,
    formatPrice,
    getCurrencySymbol,
    exchangeRates
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// El hook useCurrency se ha movido a ./useCurrency.js
// export const useCurrency = () => {
//   return useContext(CurrencyContext);
// };

export default CurrencyContext; 