"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

type ProductCardProps = {
  product: any;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [variant, setVariant] = useState<any>(null);
  const [withFries, setWithFries] = useState(false);

  // Inicializar la variante por defecto
  useEffect(() => {
    if (product.variantes && product.variantes.length > 0) {
      setVariant(product.variantes[0]);
    }
  }, [product]);

  const currentPrice = variant ? variant.precio : product.precio_base;
  const finalPrice = withFries ? currentPrice + 2500 : currentPrice;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-neutral-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:border-red-600/30"
    >
      <div className="relative aspect-[1/1] overflow-hidden bg-neutral-800">
        {product.imagen_url ? (
            <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out grayscale-[20%] group-hover:grayscale-0" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-700 font-black uppercase italic text-xs">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
      </div>

      <div className="flex flex-col p-6 flex-grow relative -mt-12 bg-neutral-900/80 backdrop-blur-xl rounded-t-[2.5rem] border-t border-white/5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black text-white leading-none uppercase italic tracking-tighter">
            {product.nombre}
          </h3>
          <span className="font-black text-xl italic tracking-tighter leading-none" style={{ color: "var(--primary)" }}>
            ${finalPrice?.toLocaleString("es-AR")}
          </span>
        </div>
        
        <p className="text-[10px] text-neutral-400 line-clamp-2 mb-6 font-medium leading-relaxed uppercase tracking-wider">
          {product.description || product.descripcion}
        </p>

        {/* Variant Selector (Dinámico) */}
        {product.variantes && product.variantes.length > 0 && (
          <div className="space-y-5 mb-6">
            <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Elegí la opción</span>
                <div className="flex flex-wrap gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                    {product.variantes.map((v: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setVariant(v)}
                            className={`flex-grow py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all italic ${
                                variant?.nombre === v.nombre 
                                ? "bg-red-600 text-white shadow-lg" 
                                : "text-neutral-500 hover:text-neutral-300"
                            }`}
                        >
                            {v.nombre}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* Solo mostrar opción de papas si el nombre o descripción sugiere que es una hamburguesa */}
        {(product.nombre.toLowerCase().includes("burger") || product.es_burger) && (
            <div className="flex flex-col gap-2 mb-6">
                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">¿Querés sumar papas? (+$2.500)</span>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setWithFries(false)} className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all italic border-2 ${!withFries ? "bg-white text-black border-white" : "border-white/5 text-neutral-500"}`}>Sola</button>
                    <button onClick={() => setWithFries(true)} className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all italic border-2 ${withFries ? "bg-white text-black border-white" : "border-white/5 text-neutral-500"}`}>Con Papas</button>
                </div>
            </div>
        )}
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addToCart(product, variant?.nombre, withFries)}
          className="mt-auto w-full flex items-center justify-center gap-3 py-4 text-white rounded-2xl font-black hover:brightness-110 transition-all shadow-xl uppercase tracking-[0.2em] text-[10px] italic"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus size={14} />
          Agregar
        </motion.button>
      </div>
    </motion.div>
  );
};
