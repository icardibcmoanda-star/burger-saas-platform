"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";

export default function ShopPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShopData() {
      if (!slug) return;

      // 1. Obtener datos del comercio
      const { data: shopData } = await supabase
        .from("comercios")
        .select("*")
        .eq("slug", slug)
        .single();

      if (shopData) {
        setShop(shopData);

        // 2. Obtener categorías
        const { data: catData } = await supabase
          .from("categorias")
          .select("*")
          .eq("comercio_id", shopData.id)
          .order("orden");
        
        setCategories(catData || []);
        if (catData?.length) setActiveCategory(catData[0].nombre);

        // 3. Obtener productos
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

  const filteredProducts = products.filter(p => p.categorias.nombre === activeCategory);

  return (
    <CartProvider shopInfo={shop}>
      <main className="min-h-screen bg-black text-white pb-24" style={{ "--primary": shop.color_primario } as any}>
        <Header shop={shop} />
        
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl">
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

        <CartDrawer shop={shop} />
      </main>
    </CartProvider>
  );
}
