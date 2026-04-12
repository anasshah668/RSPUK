import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';
import { ensureClientId } from '../utils/clientIdentity';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { authReady, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const applyItems = useCallback((items) => {
    if (!Array.isArray(items)) {
      setCartItems([]);
      return;
    }
    setCartItems(
      items.map((row) => ({
        ...row,
        quantity: Math.max(1, Number(row.quantity) || 1),
      })),
    );
  }, []);

  const refreshCart = useCallback(async () => {
    ensureClientId();
    try {
      const data = await httpClient.get(apiRoutes.cart.get);
      applyItems(data?.items);
    } catch (e) {
      console.error('[cart] load failed', e);
      setCartItems([]);
    }
  }, [applyItems]);

  useEffect(() => {
    if (!authReady) return;
    refreshCart();
  }, [authReady, user?._id, refreshCart]);

  const addToCart = async (product, quantity = 1) => {
    ensureClientId();
    const qty = Math.max(1, Number(quantity) || 1);
    const data = await httpClient.post(apiRoutes.cart.addItem, {
      item: product,
      quantity: qty,
    });
    applyItems(data?.items);
  };

  const removeFromCart = async (productId) => {
    ensureClientId();
    const line = cartItems.find((item) => String(item.id) === String(productId));
    if (!line?.lineId) {
      setCartItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
      return;
    }
    const data = await httpClient.delete(`${apiRoutes.cart.item}/${encodeURIComponent(line.lineId)}`);
    applyItems(data?.items);
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    ensureClientId();
    const line = cartItems.find((item) => String(item.id) === String(productId));
    if (!line?.lineId) {
      setCartItems((prev) =>
        prev.map((item) =>
          String(item.id) === String(productId) ? { ...item, quantity } : item,
        ),
      );
      return;
    }
    const data = await httpClient.patch(`${apiRoutes.cart.item}/${encodeURIComponent(line.lineId)}`, {
      quantity,
    });
    applyItems(data?.items);
  };

  const clearCart = async () => {
    ensureClientId();
    const data = await httpClient.delete(apiRoutes.cart.clear);
    applyItems(data?.items);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price);
      if (!Number.isFinite(price)) return total;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    refreshCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
