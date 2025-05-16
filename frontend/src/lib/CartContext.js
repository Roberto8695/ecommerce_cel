'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Crear contexto
const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  // Estado para almacenar los productos del carrito
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  
  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error al cargar el carrito desde localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);
  
  // Actualizar localStorage y totales cuando cambia el carrito
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    setCartTotal(total);
    
    // Calcular cantidad total de productos
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);
  
  // Añadir producto al carrito
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      // Si el producto ya está, aumentamos la cantidad
      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      }
      
      // Si no está, lo añadimos con cantidad 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };
  
  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => {
      return prevItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };
  
  // Vaciar carrito
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };
  
  // Valor que se proporciona al contexto
  const value = {
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
