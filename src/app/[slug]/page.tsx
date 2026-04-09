"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { motion } from "framer-motion";

export default function ShopPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadShopData() {
      if (!slug) return;

      const { data: shopData } = await supabase
        .from("comercios")
        .select("*")
        .eq("slug", slug)
        .single();

      if (shopData) {
        setShop(shopData);

        const { data: catData } = await supabase
          .from("categorias")
          .select("*")
          .eq("comercio_id", shopData.id)
          .order("orden");
        
        setCategories(catData || []);
        if (catData?.length) setActiveCategory(catData[0].nombre);

        const { data: prodData } = await supabase
          .from("productos")
          .select("*, categorias(nombre)")
          .eq("comercio_id", shopData.id);
        
        setProducts(prodData || []);
      }
      setLoading(false);
    }

    loadShopData();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-black italic tracking-tighter mb-4">404</h1>
        <p className="text-neutral-500 uppercase tracking-widest text-[10px]">Local no encontrado</p>
    </div>
  );

  const filteredProducts = products.filter(p => p.categorias?.nombre === activeCategory);
  
  // Estilo dinámico basado en la IA o configuración manual
  const primaryColor = shop.color_primario || "#dc2626";
  const bgColor = shop.config_ia?.bg_color || "#000000";
  const isLightBg = bgColor.toLowerCase() === "#ffffff" || bgColor.toLowerCase() === "white";

  return (
    <CartProvider shopInfo={shop}>
      <main 
        className={`min-h-screen pb-24 transition-colors duration-1000 ${isLightBg ? 'bg-neutral-50 text-neutral-900' : 'bg-black text-white'}`}
        style={{ "--primary": primaryColor } as any}
      >
        <Header shop={shop} onCartClick={() => setIsCartOpen(true)} />
        
        {/* HERO DINÁMICO (Generado por IA) */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: primaryColor }}>
            <div className="absolute inset-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop" className="w-full h-full object-cover grayscale blur-[1px]" alt="" />
            </div>
            <div className="relative z-10 text-center px-6">
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none"
                >
                    {shop.hero_titulo || shop.nombre}
                </motion.h2>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="mt-4 text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs italic"
                >
                    {shop.hero_subtitulo || "Original Taste & Culture"}
                </motion.p>
            </div>
        </section>

        <div className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isLightBg ? 'bg-white/80 border-neutral-200' : 'bg-black/80 border-white/5'}`}>
            <CategoryFilter 
                categories={categories.map(c => c.nombre)} 
                active={activeCategory} 
                onChange={setActiveCategory} 
            />
        </div>

        <div className="px-6 py-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>

        <CartDrawer shop={shop} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </main>
    </CartProvider>
  );
}
