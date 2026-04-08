"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Save, Store, Package, LayoutGrid, X, Image as ImageIcon, Sparkles, ChevronRight, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // IA States
  const [iaPrompt, setIaPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [newComercio, setNewComercio] = useState({ nombre: "", slug: "", whatsapp_numero: "", color_primario: "#dc2626" });
  const [newProduct, setNewProduct] = useState<any>({
    nombre: "", descripcion: "", precio_base: 0, imagen_url: "", categoria_id: "", has_variants: false, variantes: []
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

  const generateWithIA = async () => {
    if (!iaPrompt) return;
    setIsGenerating(true);
    try {
        const res = await fetch("/api/generate-design", {
            method: "POST",
            body: JSON.stringify({ prompt: iaPrompt })
        });
        const design = await res.json();
        
        // Guardamos el diseño en Supabase para este comercio
        const { error } = await supabase.from("comercios").update({
            color_primario: design.color_primario,
            hero_titulo: design.hero_titulo,
            hero_subtitulo: design.hero_subtitulo,
            config_ia: design // Guardamos el JSON completo por las dudas
        }).eq("id", selectedComercio.id);

        if (!error) {
            alert("¡Diseño generado y aplicado!");
            fetchComercios(); // Recargamos para ver los cambios
            setSelectedComercio({...selectedComercio, ...design});
        }
    } catch (e) {
        alert("Error con la IA");
    } finally {
        setIsGenerating(false);
    }
  };

  async function handleCreateComercio(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("comercios").insert([newComercio]);
    if (!error) {
        fetchComercios();
        setNewComercio({ nombre: "", slug: "", whatsapp_numero: "", color_primario: "#dc2626" });
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const productToSave = {
        ...newProduct,
        comercio_id: selectedComercio.id,
        variantes: newProduct.has_variants ? newProduct.variantes : null
    };
    const { error } = await supabase.from("productos").insert([productToSave]);
    if (!error) {
        setIsProductModalOpen(false);
        selectComercio(selectedComercio);
        setNewProduct({
            nombre: "", descripcion: "", precio_base: 0, imagen_url: "", categoria_id: "", has_variants: false, variantes: []
        });
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 min-h-screen">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 border-r border-white/5 p-8 bg-neutral-950/50">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center rotate-3">
                    <Store size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">Burger<span className="text-red-600">SaaS</span></h2>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Mis Locales</h3>
                    <div className="space-y-2">
                        {comercios.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => selectComercio(c)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center justify-between group ${selectedComercio?.id === c.id ? "bg-red-600 border-red-600 text-white shadow-xl shadow-red-900/20" : "bg-neutral-900/50 border-white/5 text-neutral-500 hover:border-white/10 hover:text-white"}`}
                            >
                                {c.nombre}
                                <ChevronRight size={14} className={selectedComercio?.id === c.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-neutral-900/80 rounded-[2rem] border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-center">Nuevo Comercio</h4>
                    <input placeholder="NOMBRE" value={newComercio.nombre} onChange={e => setNewComercio({...newComercio, nombre: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-red-600 outline-none uppercase italic" />
                    <input placeholder="SLUG (EJ: COMADREJA)" value={newComercio.slug} onChange={e => setNewComercio({...newComercio, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-red-600 outline-none uppercase italic" />
                    <input placeholder="WHATSAPP (+54...)" value={newComercio.whatsapp_numero} onChange={e => setNewComercio({...newComercio, whatsapp_numero: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-red-600 outline-none uppercase italic" />
                    <button onClick={handleCreateComercio} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all italic">Crear Ahora</button>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 p-8 lg:p-12">
            {selectedComercio ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="px-3 py-1 bg-green-600/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-600/20 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Web Activa
                                </div>
                                <span className="text-neutral-700 text-[10px] font-black uppercase tracking-[0.2em]">Slug: /{selectedComercio.slug}</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">{selectedComercio.nombre}</h1>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <a href={`/${selectedComercio.slug}`} target="_blank" className="flex-grow md:flex-none text-center bg-white text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all italic tracking-[0.2em] shadow-xl">Visitar Tienda</a>
                        </div>
                    </div>

                    {/* IA DESIGNER SECTION */}
                    <div className="mb-16 p-10 bg-gradient-to-br from-red-600 to-red-900 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                            <Sparkles size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Wand2 size={24} className="text-white animate-bounce" />
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Diseñador con IA (Gemini)</h3>
                            </div>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-8 max-w-xl leading-relaxed">
                                ¿Cómo querés que se sienta tu local? Escribí la "vibra" (ej: industrial, elegante, retro de los 80) y Gemini creará tus colores y textos de venta automáticamente.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    placeholder="EJ: QUIERO UN ESTILO URBANO CON COLORES NEON Y TEXTOS AGRESIVOS" 
                                    value={iaPrompt}
                                    onChange={(e) => setIaPrompt(e.target.value)}
                                    className="flex-grow bg-black/30 border border-white/20 rounded-2xl px-6 py-5 text-sm font-black text-white placeholder:text-white/30 outline-none focus:bg-black/50 transition-all italic"
                                />
                                <button 
                                    onClick={generateWithIA}
                                    disabled={isGenerating || !iaPrompt}
                                    className="bg-white text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 italic"
                                >
                                    {isGenerating ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : <Sparkles size={16} />}
                                    {isGenerating ? "DISEÑANDO..." : "GENERAR DISEÑO"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Menú Section */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Carta Digital</h3>
                            <button onClick={() => {const n = prompt("Nombre:"); if(n) supabase.from("categorias").insert([{comercio_id: selectedComercio.id, nombre: n.toUpperCase()}]).then(() => selectComercio(selectedComercio))}} className="flex items-center gap-3 bg-neutral-900 border border-white/5 px-8 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all italic tracking-[0.2em]">
                                <Plus size={16} /> Nueva Categoría
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {categorias.map(cat => (
                                <div key={cat.id} className="bg-neutral-900/30 rounded-[3.5rem] border border-white/5 p-10 lg:p-16">
                                    <h4 className="text-4xl font-black uppercase italic text-white tracking-tighter mb-12 flex items-center gap-6">
                                        {cat.nombre}
                                        <div className="h-[2px] flex-grow bg-white/5" />
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                        {productos.filter(p => p.categoria_id === cat.id).map(p => (
                                            <div key={p.id} className="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group/item hover:border-red-600/50 transition-all shadow-xl">
                                                <div className="flex items-center gap-6">
                                                    {p.imagen_url && <img src={p.imagen_url} className="w-16 h-16 rounded-[1.2rem] object-cover grayscale opacity-50 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-500" alt="" />}
                                                    <div>
                                                        <p className="font-black text-lg uppercase italic tracking-tighter">{p.nombre}</p>
                                                        <p className="text-[10px] text-red-500 font-black tracking-[0.2em] uppercase mt-2 italic">
                                                            {p.variantes ? `${p.variantes.length} OPCIONES` : `$${p.precio_base.toLocaleString()}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => {if(confirm("¿Borrar?")) supabase.from("productos").delete().eq("id", p.id).then(() => selectComercio(selectedComercio))}} className="p-4 bg-neutral-950 rounded-2xl text-neutral-700 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => { setNewProduct({...newProduct, categoria_id: cat.id}); setIsProductModalOpen(true); }}
                                        className="w-full py-8 border-2 border-dashed border-white/10 rounded-[2.5rem] text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] hover:border-red-600/50 hover:text-red-500 transition-all italic bg-black/20"
                                    >
                                        + CARGAR PRODUCTO EN {cat.nombre}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-900">
                    <Store size={160} strokeWidth={0.5} className="mb-8 opacity-10 animate-pulse" />
                    <p className="text-2xl font-black uppercase tracking-[0.6em] italic opacity-20">Seleccioná un local</p>
                </div>
            )}
        </div>
      </div>

      {/* Modal Producto (Se mantiene igual pero con estilo pulido) */}
      <AnimatePresence>
        {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/90" />
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-[4rem] p-12 lg:p-20 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-12 text-white">Cargar Ítem</h2>
                    <form onSubmit={handleSaveProduct} className="space-y-8">
                        <input required placeholder="NOMBRE" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-black focus:border-red-600 outline-none italic" />
                        {!newProduct.has_variants && <input required type="number" placeholder="PRECIO FINAL ($)" value={newProduct.precio_base || ""} onChange={e => setNewProduct({...newProduct, precio_base: parseInt(e.target.value)})} className="w-full bg-black border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-black focus:border-red-600 outline-none italic" />}
                        <textarea placeholder="DESCRIPCIÓN / INGREDIENTES" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-black focus:border-red-600 outline-none italic h-32 resize-none" />
                        
                        <div className="p-8 bg-black/50 rounded-[2.5rem] border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input type="checkbox" checked={newProduct.has_variants} onChange={e => setNewProduct({...newProduct, has_variants: e.target.checked})} className="w-6 h-6 rounded-lg bg-neutral-800 border-none text-red-600 focus:ring-0" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic text-white">Habilitar niveles (S/D/T)</span>
                                </label>
                                {newProduct.has_variants && <button type="button" onClick={() => setNewProduct({...newProduct, variantes: [...newProduct.variantes, {nombre: "", precio: 0}]})} className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/20 px-5 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all">+ Añadir</button>}
                            </div>
                            {newProduct.has_variants && (
                                <div className="space-y-4 pt-6 border-t border-white/5 animate-in slide-in-from-top-4">
                                    {newProduct.variantes.map((v: any, i: number) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <input placeholder="NOMBRE (EJ: SIMPLE)" value={v.nombre} onChange={e => {const n = [...newProduct.variantes]; n[i].nombre = e.target.value.toUpperCase(); setNewProduct({...newProduct, variantes: n})}} className="flex-grow bg-neutral-900 border-none rounded-xl px-5 py-3 text-[10px] font-bold italic" />
                                            <input type="number" placeholder="PRECIO" value={v.precio || ""} onChange={e => {const n = [...newProduct.variantes]; n[i].precio = parseInt(e.target.value); setNewProduct({...newProduct, variantes: n})}} className="w-32 bg-neutral-900 border-none rounded-xl px-5 py-3 text-[10px] font-bold italic" />
                                            <button type="button" onClick={() => {const n = [...newProduct.variantes]; n.splice(i,1); setNewProduct({...newProduct, variantes: n})}} className="p-3 text-neutral-700 hover:text-red-500"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input placeholder="URL IMAGEN" value={newProduct.imagen_url} onChange={e => setNewProduct({...newProduct, imagen_url: e.target.value})} className="w-full bg-black border border-white/5 rounded-[1.5rem] px-8 py-5 text-[10px] font-black focus:border-red-600 outline-none italic" />
                        <button type="submit" className="w-full bg-red-600 text-white py-8 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl shadow-red-900/40 italic">Confirmar Ítem</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
