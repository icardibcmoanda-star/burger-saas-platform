"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag, Send, CreditCard, Banknote, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  shop: any;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, shop }) => {
  const { cart, totalPrice, updateQuantity, removeFromCart, updateNotes, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Transferencia" | "">("");

  const formatWhatsAppMessage = () => {
    const itemsText = cart
      .map((item) => {
        let text = `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString("es-AR")})`;
        if (item.notes) text += `\n  ⚠️ ACLARACIÓN: ${item.notes}`;
        return text;
      })
      .join("\n");

    const message = `*NUEVO PEDIDO - ${shop.nombre.toUpperCase()}*\n\n` +
      `*Cliente:* ${customerName}\n` +
      `*Pago:* ${paymentMethod}\n\n` +
      `*Detalle:*\n${itemsText}\n\n` +
      `*TOTAL:* $${totalPrice.toLocaleString("es-AR")}\n\n` +
      `_Enviado desde la Web App_`;

    return encodeURIComponent(message);
  };

  const handleSendOrder = () => {
    if (cart.length === 0 || !customerName || !paymentMethod) return;
    window.open(`https://wa.me/${shop.whatsapp_numero}?text=${formatWhatsAppMessage()}`, "_blank");
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  const primaryColor = shop.color_primario || "#dc2626";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        className="relative w-full max-w-md h-full bg-black border-l border-white/5 shadow-2xl flex flex-col"
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: primaryColor }}>
                <ShoppingBag className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">TU PEDIDO</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-neutral-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-neutral-900/20">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-700 gap-4">
              <ShoppingBag size={80} strokeWidth={1} />
              <p className="font-black uppercase tracking-[0.2em] text-[10px] italic">Tu bolsa está vacía</p>
            </div>
          ) : (
            <div className="space-y-6">
                <div className="space-y-4">
                    {cart.map((item) => (
                    <div key={item.cartId} className="flex flex-col gap-4 p-5 bg-neutral-900/50 rounded-[2rem] border border-white/5 shadow-xl">
                        <div className="flex gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover grayscale-[30%]" />
                            <div className="flex-grow flex flex-col justify-between py-0.5">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-xs uppercase tracking-tight text-white italic leading-tight max-w-[150px]">{item.name}</h4>
                                    <span className="font-black text-sm italic" style={{ color: primaryColor }}>
                                    ${(item.price * item.quantity).toLocaleString("es-AR")}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3 bg-black/50 px-3 py-1 rounded-full border border-white/5">
                                        <button onClick={() => updateQuantity(item.cartId, -1)} className="text-neutral-500 hover:text-red-500 transition-colors">
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-xs font-black text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartId, 1)} className="text-neutral-500 hover:text-red-500 transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-neutral-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Aclaración (sin cebolla, etc.)"
                            value={item.notes}
                            onChange={(e) => updateNotes(item.cartId, e.target.value)}
                            className="w-full text-[10px] bg-black/30 border border-white/5 rounded-xl px-4 py-2 text-neutral-400 placeholder:text-neutral-700 outline-none focus:border-red-600/50 transition-all italic font-medium"
                        />
                    </div>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-neutral-500 italic ml-2">¿Cómo pagás?</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setPaymentMethod("Efectivo")}
                            className={`flex flex-col items-center gap-2 py-5 rounded-[2rem] border-2 transition-all ${
                                paymentMethod === "Efectivo" 
                                ? "text-white shadow-xl shadow-red-900/40" 
                                : "bg-black border-white/5 text-neutral-600 hover:border-white/10"
                            }`}
                            style={paymentMethod === "Efectivo" ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        >
                            <Banknote size={20} />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">Efectivo</span>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod("Transferencia")}
                            className={`flex flex-col items-center gap-2 py-5 rounded-[2rem] border-2 transition-all ${
                                paymentMethod === "Transferencia" 
                                ? "text-white shadow-xl shadow-red-900/40" 
                                : "bg-black border-white/5 text-neutral-600 hover:border-white/10"
                            }`}
                            style={paymentMethod === "Transferencia" ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        >
                            <CreditCard size={20} />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">Transf.</span>
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-black border-t border-white/5 shadow-2xl space-y-5 rounded-t-[3rem]">
            <input
                type="text"
                placeholder="TU NOMBRE COMPLETO"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black focus:border-red-600 outline-none text-white placeholder:text-neutral-700 italic tracking-widest uppercase"
            />
            
            <div className="flex justify-between items-end mb-2 px-2">
                <span className="text-neutral-600 font-black uppercase tracking-[0.2em] text-[10px] italic">Total final</span>
                <span className="text-4xl font-black italic tracking-tighter" style={{ color: primaryColor }}>
                    ${totalPrice.toLocaleString("es-AR")}
                </span>
            </div>
            
            <button
              onClick={handleSendOrder}
              disabled={!customerName || !paymentMethod}
              className="w-full flex items-center justify-center gap-4 py-5 text-white rounded-3xl font-black uppercase tracking-[0.3em] hover:brightness-110 disabled:opacity-20 transition-all shadow-xl italic text-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={18} />
              Enviar Pedido
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
