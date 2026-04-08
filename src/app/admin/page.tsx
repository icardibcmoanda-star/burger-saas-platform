"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Save, Store, Package, LayoutGrid, X, Image as ImageIcon, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Form states
  const [newComercio, setNewComercio] = useState({ nombre: "", slug: "", whatsapp_numero: "", color_primario: "#dc2626" });
  const [newProduct, setNewProduct] = useState<any>({
    nombre: "",
    descripcion: "",
    precio_base: 0,
    imagen_url: "",
    categoria_id: "",
    has_variants: false,
    variantes: [] // Array de { nombre: 'Simple', precio: 11000 }
  });

  useEffect(() => {
    fetchComercios();
  }, []);

  async function fetchComercios() {
    const { data } = await supabase.from("comercios").select("*");
    setComercios(data || []);
  }

  async function selectComercio(comercio: any) {
    setSelectedComercio(comercio);
    const { data: cats } = await supabase.from("categorias").select("*").eq("comercio_id", comercio.id).order("orden");
    const { data: prods } = await supabase.from("productos").select("*").eq("comercio_id", comercio.id);
    setCategorias(cats || []);
    setProductos(prods || []);
  }

  async function handleCreateComercio(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("comercios").insert([newComercio]);
    if (!error) {
        fetchComercios();
        setNewComercio({ nombre: "", slug: "", whatsapp_numero: "", color_primario: "#dc2626" });
    } else {
        alert("Error Supabase: " + error.message);
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const productToSave = {
        ...newProduct,
        comercio_id: selectedComercio.id,
        // Convertimos el array de variantes a JSONB que espera la DB
        variantes: newProduct.has_variants ? newProduct.variantes : null
    };
    
    const { error } = await supabase.from("productos").insert([productToSave]);
    
    if (!error) {
        setIsProductModalOpen(false);
        selectComercio(selectedComercio);
        setNewProduct({
            nombre: "", descripcion: "", precio_base: 0, imagen_url: "", categoria_id: "", has_variants: false, variantes: []
        });
    } else {
        alert("Error al guardar: " + error.message);
    }
  }

  const addVariantField = () => {
    setNewProduct({
        ...newProduct,
        variantes: [...newProduct.variantes, { nombre: "", precio: 0 }]
    });
  };

  const removeVariantField = (index: number) => {
    const newVars = [...newProduct.variantes];
    newVars.splice(index, 1);
    setNewProduct({ ...newProduct, variantes: newVars });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVars = [...newProduct.variantes];
    newVars[index][field] = value;
    setNewProduct({ ...newProduct, variantes: newVars });
  };

  async function deleteProduct(id: string) {
    if(!confirm("¿Borrar producto?")) return;
    await supabase.from("productos").delete().eq("id", id);
    selectComercio(selectedComercio);
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 min-h-screen">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 border-r border-white/5 p-8 bg-neutral-950/50">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center rotate-3">
                    <Store size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Burger<span className="text-red-600">SaaS</span></h2>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4 text-center">Tus Locales</h3>
                    <div className="space-y-2">
                        {comercios.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => selectComercio(c)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest italic flex items-center justify-between group ${selectedComercio?.id === c.id ? "bg-red-600 border-red-600 text-white shadow-xl" : "bg-neutral-900/50 border-white/5 text-neutral-500 hover:border-white/10 hover:text-white"}`}
                            >
                                {c.nombre}
                                <ChevronRight size={14} className={selectedComercio?.id === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-neutral-900/80 rounded-[2rem] border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-center">Nuevo Negocio</h4>
                    <input placeholder="NOMBRE" value={newComercio.nombre} onChange={e => setNewComercio({...newComercio, nombre: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-red-600 outline-none uppercase italic" />
                    <input placeholder="SLUG (EJ: ROSES)" value={newComercio.slug} onChange={e => setNewComercio({...newComercio, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-red-600 outline-none uppercase italic" />
                    <input placeholder="WHATSAPP (+54...)" value={newComercio.whatsapp_numero} onChange={e => setNewComercio({...newComercio, whatsapp_numero: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-red-600 outline-none uppercase italic" />
                    <button onClick={handleCreateComercio} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all italic">Dar de Alta</button>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 p-8 lg:p-12">
            {selectedComercio ? (
                <div className="animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                        <div>
                            <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">{selectedComercio.nombre}</h1>
                            <p className="text-neutral-500 text-xs mt-2 uppercase tracking-[0.3em]">Gestión de Menú Dinámico</p>
                        </div>
                        <a href={`/${selectedComercio.slug}`} target="_blank" className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all italic tracking-[0.1em] shadow-xl">Ver Web en Vivo</a>
                    </div>

                    <div className="space-y-12">
                        {categorias.length === 0 ? (
                            <div className="p-24 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                                <p className="text-neutral-600 uppercase text-xs font-black italic tracking-widest">Creá categorías para empezar</p>
                                <button onClick={() => {const n = prompt("Nombre:"); if(n) supabase.from("categorias").insert([{comercio_id: selectedComercio.id, nombre: n}]).then(() => selectComercio(selectedComercio))}} className="mt-6 bg-red-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest">Crear Primera Categoría</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-10">
                                {categorias.map(cat => (
                                    <div key={cat.id} className="bg-neutral-900/30 rounded-[3rem] border border-white/5 p-8 lg:p-12">
                                        <h4 className="text-3xl font-black uppercase italic text-white tracking-tighter mb-10">{cat.nombre}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                            {productos.filter(p => p.categoria_id === cat.id).map(p => (
                                                <div key={p.id} className="bg-black/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-red-600/30 transition-all">
                                                    <div>
                                                        <p className="font-black text-sm uppercase italic tracking-tight">{p.nombre}</p>
                                                        <p className="text-[10px] text-red-500 font-black tracking-widest uppercase mt-1">
                                                            {p.variantes ? `${p.variantes.length} Variantes` : `$${p.precio_base.toLocaleString()}`}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-3 bg-neutral-900 rounded-xl text-neutral-600 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => { setNewProduct({...newProduct, categoria_id: cat.id}); setIsProductModalOpen(true); }}
                                            className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2rem] text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] hover:border-red-600/50 hover:text-red-500 transition-all italic"
                                        >
                                            + Cargar Producto en {cat.nombre}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-800">
                    <Store size={120} strokeWidth={0.5} className="mb-6 opacity-20" />
                    <p className="text-xl font-black uppercase tracking-[0.5em] italic">Burger Central</p>
                </div>
            )}
        </div>
      </div>

      {/* Modal de Nuevo Producto */}
      <AnimatePresence>
        {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 lg:p-16 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <button onClick={() => setIsProductModalOpen(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white"><X size={32} /></button>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-12 text-red-600">Nuevo Producto</h2>
                    
                    <form onSubmit={handleSaveProduct} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Nombre</label>
                                <input required placeholder="EJ: CLASSIC" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-red-600 outline-none italic" />
                            </div>
                            {!newProduct.has_variants && (
                                <div className="space-y-3 animate-in fade-in">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Precio Fijo ($)</label>
                                    <input required type="number" placeholder="13000" value={newProduct.precio_base || ""} onChange={e => setNewProduct({...newProduct, precio_base: parseInt(e.target.value)})} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-red-600 outline-none italic" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2">Descripción</label>
                            <textarea placeholder="INGREDIENTES..." value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-red-600 outline-none italic h-24 resize-none" />
                        </div>

                        {/* Variantes Selector */}
                        <div className="p-8 bg-black/50 rounded-[2.5rem] border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={newProduct.has_variants} onChange={e => setNewProduct({...newProduct, has_variants: e.target.checked})} className="w-6 h-6 rounded-lg bg-neutral-800 border-none text-red-600 focus:ring-0" id="hasVar" />
                                    <label htmlFor="hasVar" className="text-xs font-black uppercase italic tracking-widest cursor-pointer">¿Tiene variantes de tamaño?</label>
                                </div>
                                {newProduct.has_variants && (
                                    <button type="button" onClick={addVariantField} className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all">+ Añadir Nivel</button>
                                )}
                            </div>

                            {newProduct.has_variants && (
                                <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-4">
                                    {newProduct.variantes.map((v: any, index: number) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <input required placeholder="EJ: SIMPLE" value={v.nombre} onChange={e => updateVariant(index, 'nombre', e.target.value.toUpperCase())} className="flex-grow bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold outline-none italic" />
                                            <input required type="number" placeholder="PRECIO" value={v.precio || ""} onChange={e => updateVariant(index, 'precio', parseInt(e.target.value))} className="w-32 bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold outline-none italic" />
                                            <button type="button" onClick={() => removeVariantField(index)} className="p-3 text-neutral-600 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    {newProduct.variantes.length === 0 && <p className="text-center text-[9px] text-neutral-600 uppercase font-black italic">Hacé clic en añadir nivel para configurar tamaños (Ej: Simple, Doble)</p>}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-2 text-center block">URL de la Imagen</label>
                            <input placeholder="HTTPS://..." value={newProduct.imagen_url} onChange={e => setNewProduct({...newProduct, imagen_url: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-bold focus:border-red-600 outline-none italic" />
                        </div>

                        <button type="submit" className="w-full bg-red-600 text-white py-6 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-2xl shadow-red-900/40 italic">Cargar al Menú</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
