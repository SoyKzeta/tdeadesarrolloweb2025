import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCurrency } from './useCurrency';


const CartContext = createContext();


export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { formatPrice } = useCurrency();

  
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (err) {
        console.error('Error al cargar el carrito:', err);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  
  useEffect(() => {
    
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);

    
    const total = cart.reduce((sum, item) => {
      
      let itemPrice = item.price;
      if (item.discount && item.discount > 0) {
        itemPrice = itemPrice - (itemPrice * (item.discount / 100));
      }
      return sum + (itemPrice * item.quantity);
    }, 0);
    setCartTotal(total);

    
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  
  const addToCart = (product, quantity = 1) => {
    
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    let newCart;
    if (existingItemIndex >= 0) {
      
      newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity: newCart[existingItemIndex].quantity + quantity
      };
    } else {
      
      newCart = [...cart, { ...product, quantity }];
    }
    
    
    setCart(newCart);
    
    
    toast.success(`${product.title || product.name} añadido al carrito`, {
      position: "bottom-right",
      autoClose: 3000
    });
  };

  
  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  
  const removeFromCart = (productId) => {
    
    const itemToRemove = cart.find(item => item.id === productId);
    
    
    setCart(cart.filter(item => item.id !== productId));
    
    
    if (itemToRemove) {
      toast.info(`${itemToRemove.title || itemToRemove.name} eliminado del carrito`, {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  
  const clearCart = () => {
    setCart([]);
    toast.info("Carrito vaciado", {
      position: "bottom-right",
      autoClose: 3000
    });
  };

  
  const value = {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    formatCartTotal: () => formatPrice(cartTotal)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};






export default CartContext; 