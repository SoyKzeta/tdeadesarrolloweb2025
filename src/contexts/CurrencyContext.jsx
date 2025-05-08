import { createContext, useState, useEffect } from 'react';


const exchangeRates = {
  USD: 1,               
  COP: 4080,            
  MXN: 16.9,            
  EUR: 0.91,            
  ARS: 850,             
  CLP: 900,             
  PEN: 3.66,            
  BRL: 5.1              
};


const CurrencyContext = createContext();


export const CurrencyProvider = ({ children }) => {
  
  const [currency, setCurrency] = useState('COP');
  
  
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);
  
  
  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };
  
  
  const formatPrice = (priceInUSD) => {
    if (!priceInUSD) return '0';
    
    const price = priceInUSD * exchangeRates[currency];
    
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  
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






export default CurrencyContext; 