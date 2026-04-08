"use client";

import React, { createContext, useContext, useState } from "react";

export type CartItem = {
  cartId: string;
  productId: string;
  name: string;
  image: string;
  variant?: string;
  withFries?: boolean;
  price: number;
  quantity: number;
  notes?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, variant?: string, withFries?: boolean) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  updateNotes: (cartId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode, shopInfo: any }> = ({ children, shopInfo }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any, variant: string = "Doble", withFries: boolean = false) => {
    const prices = product.variantes || {
        sinPapas: { Simple: product.precio_base, Doble: product.precio_base, Triple: product.precio_base },
        conPapas: { Simple: product.precio_base, Doble: product.precio_base, Triple: product.precio_base }
    };

    const price = product.es_burger 
      ? (withFries ? prices.conPapas[variant] : prices.sinPapas[variant])
      : product.precio_base;

    const cartId = `${product.id}-${variant}-${withFries}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev, 
        { 
          cartId,
          productId: product.id,
          name: product.es_burger ? `${product.nombre} (${variant}${withFries ? ' + Papas' : ''})` : product.nombre,
          image: product.imagen_url || "",
          variant,
          withFries,
          price,
          quantity: 1,
          notes: ""
        }
      ];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const updateNotes = (cartId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, notes } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, updateNotes, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
