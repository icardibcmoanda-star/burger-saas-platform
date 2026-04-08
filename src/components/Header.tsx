"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

type HeaderProps = {
  shop: any;
  onCartClick: () => void;
};

export const Header: React.FC<HeaderProps> = ({ shop, onCartClick }) => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-3">
        {shop.logo_url ? (
            <img src={shop.logo_url} alt={shop.nombre} className="w-10 h-10 rounded-full object-cover border border-white/10" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-white italic">
                {shop.nombre.charAt(0)}
            </div>
        )}
        <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
          {shop.nombre.split(" ")[0]} <span className="text-red-600 block text-[10px] tracking-[0.3em] not-italic font-bold -mt-1">{shop.nombre.split(" ").slice(1).join(" ") || "BURGERS"}</span>
        </h1>
      </div>
      <button
        onClick={onCartClick}
        className="relative p-3 bg-red-600 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
      >
        <ShoppingBag size={20} className="text-white" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
            {totalItems}
          </span>
        )}
      </button>
    </header>
  );
};
