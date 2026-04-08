"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Save, Store, Package, LayoutGrid, Settings } from "lucide-react";

export default function AdminPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newComercio, setNewComercio] = useState({ nombre: "", slug: "", whatsapp_numero: "", color_primario: "#dc2626" });

  useEffect(() => {
    fetchComercios();
  }, []);

  async function fetchComercios() {
    const { data } = await supabase.from("comercios").select("*");
    setComercios(data || []);
  }

  async function selectComercio(comercio: any) {
    setSelectedComercio(comercio);
    setLoading(true);
    
    const { data: cats } = await supabase.from("categorias").select("*").eq("comercio_id", comercio.id).order("orden");
    const { data: prods } = await supabase.from("productos").select("*").eq("comercio_id", comercio.id);
    
    setCategorias(cats || []);
    setProductos(prods || []);
    setLoading(false);
  }

  async function handleCreateComercio(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from("comercios").insert([newComercio]).select();
    if (!error) {
        fetchComercios();
        setNewComercio({ nombre: "", slug: "", whatsapp_numero: "", color_primario: "#dc2626" });
    }
  }

  async function addCategoria() {
    if (!selectedComercio) return;
    const nombre = prompt("Nombre de la categoría (ej: Burgers, Bebidas):");
    if (!nombre) return;
    
    await supabase.from("categorias").insert([{ comercio_id: selectedComercio.id, nombre, orden: categorias.length }]);
    selectComercio(selectedComercio);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar: Mis Locales */}
        <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Store className="text-red-500" />
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Locales</h2>
            </div>
            
            <div className="space-y-2">
                {comercios.map(c => (
                    <button 
                        key={c.id} 
                        onClick={() => selectComercio(c)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-bold uppercase tracking-tight ${selectedComercio?.id === c.id ? "bg-red-600 border-red-600 text-white shadow-lg" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"}`}
                    >
                        {c.nombre}
                    </button>
                ))}
            </div>

            <form onSubmit={handleCreateComercio} className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Nuevo Local</p>
                <input 
                    placeholder="Nombre" value={newComercio.nombre} 
                    onChange={e => setNewComercio({...newComercio, nombre: e.target.value})}
                    className="w-full bg-neutral-800 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-600" 
                />
                <input 
                    placeholder="Slug (ej: comadreja)" value={newComercio.slug} 
                    onChange={e => setNewComercio({...newComercio, slug: e.target.value.toLowerCase().replace(/ /g, "-")})}
                    className="w-full bg-neutral-800 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-600" 
                />
                <input 
                    placeholder="WhatsApp (ej: 549341...)" value={newComercio.whatsapp_numero} 
                    onChange={e => setNewComercio({...newComercio, whatsapp_numero: e.target.value})}
                    className="w-full bg-neutral-800 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-600" 
                />
                <button type="submit" className="w-full bg-white text-black py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Crear</button>
            </form>
        </div>

        {/* Main: Gestión de Productos */}
        <div className="md:col-span-3 space-y-8">
            {selectedComercio ? (
                <div className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter">{selectedComercio.nombre}</h1>
                            <p className="text-neutral-500 text-xs mt-1 uppercase tracking-[0.3em]">Gestión de Menú y Precios</p>
                        </div>
                        <a 
                            href={`/${selectedComercio.slug}`} target="_blank"
                            className="bg-neutral-800 text-neutral-400 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all border border-neutral-700"
                        >
                            Ver App en vivo
                        </a>
                    </div>

                    {/* Categorías */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase italic tracking-widest text-red-500">Menú</h3>
                            <button onClick={addCategoria} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all">
                                <Plus size={14} /> Añadir Categoría
                            </button>
                        </div>

                        {categorias.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-neutral-800 rounded-[2rem] text-center text-neutral-600 uppercase text-xs font-bold italic">
                                No hay categorías creadas todavía
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {categorias.map(cat => (
                                    <div key={cat.id} className="bg-neutral-900/50 rounded-[2.5rem] border border-neutral-800/50 p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-xl font-black uppercase italic text-white tracking-tighter">{cat.nombre}</h4>
                                            <button className="text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                        
                                        {/* Aquí irían los productos de esta categoría */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            {productos.filter(p => p.categoria_id === cat.id).map(p => (
                                                <div key={p.id} className="bg-neutral-800 p-4 rounded-2xl flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-sm uppercase italic">{p.nombre}</p>
                                                        <p className="text-[10px] text-red-500 font-black">${p.precio_base.toLocaleString()}</p>
                                                    </div>
                                                    <button className="p-2 hover:bg-red-600/20 rounded-lg text-neutral-500 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full py-3 border-2 border-dashed border-neutral-800 rounded-xl text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:border-red-600/50 hover:text-red-500 transition-all">
                                            + Nuevo Producto en {cat.nombre}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-neutral-700 space-y-4">
                    <Store size={64} strokeWidth={1} />
                    <p className="text-xs font-black uppercase tracking-[0.3em] italic">Seleccioná un local para administrar</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
