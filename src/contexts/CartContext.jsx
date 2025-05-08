import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCurrency } from './useCurrency';

// Crear contexto
const CartContext = createContext();

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { formatPrice } = useCurrency();

  // Cargar carrito desde localStorage
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

  // Actualizar contador y total cuando cambia el carrito
  useEffect(() => {
    // Calcular cantidad total de items
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);

    // Calcular precio total
    const total = cart.reduce((sum, item) => {
      // Calcular precio con descuento si lo hay
      let itemPrice = item.price;
      if (item.discount && item.discount > 0) {
        itemPrice = itemPrice - (itemPrice * (item.discount / 100));
      }
      return sum + (itemPrice * item.quantity);
    }, 0);
    setCartTotal(total);

    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Añadir producto al carrito
  const addToCart = (product, quantity = 1) => {
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    let newCart;
    if (existingItemIndex >= 0) {
      // Producto ya existe, aumentar cantidad
      newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity: newCart[existingItemIndex].quantity + quantity
      };
    } else {
      // Producto nuevo, añadir al carrito
      newCart = [...cart, { ...product, quantity }];
    }
    
    // Actualizar el carrito
    setCart(newCart);
    
    // Mostrar mensaje de confirmación (ahora fuera del callback)
    toast.success(`${product.title || product.name} añadido al carrito`, {
      position: "bottom-right",
      autoClose: 3000
    });
  };

  // Actualizar cantidad de un producto
  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    // Encontrar el ítem a eliminar antes de actualizar el carrito
    const itemToRemove = cart.find(item => item.id === productId);
    
    // Actualizar el carrito
    setCart(cart.filter(item => item.id !== productId));
    
    // Mostrar mensaje de confirmación (ahora fuera del callback)
    if (itemToRemove) {
      toast.info(`${itemToRemove.title || itemToRemove.name} eliminado del carrito`, {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  // Vaciar el carrito
  const clearCart = () => {
    setCart([]);
    toast.info("Carrito vaciado", {
      position: "bottom-right",
      autoClose: 3000
    });
  };

  // Valor del contexto
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

// El hook useCart se ha movido a ./useCart.js
// export const useCart = () => {
//   return useContext(CartContext);
// };

export default CartContext; 