"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Store, Package, LayoutGrid, X, Image as ImageIcon, Sparkles, ChevronRight, Wand2, RefreshCw } from "lucide-react";
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
    const { data, error } = await supabase.from("comercios").select("*");
    if (error) console.error(error);
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
    if (!iaPrompt || !selectedComercio) return;
    setIsGenerating(true);
    try {
        const res = await fetch("/api/generate-design", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: iaPrompt })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.details || data.error || "Error desconocido");
        }
        
        const design = data;
        
        // Guardamos el diseño en Supabase
        const { error: updateError } = await supabase.from("comercios").update({
            color_primario: design.color_primario,
            hero_titulo: design.hero_titulo,
            hero_subtitulo: design.hero_subtitulo,
            config_ia: design
        }).eq("id", selectedComercio.id);

        if (updateError) throw updateError;

        alert("✨ ¡Diseño generado con éxito! Aplicando cambios...");
        selectComercio({...selectedComercio, ...design});
        setIaPrompt("");
    } catch (e: any) {
        console.error(e);
        alert("Fallo de IA: " + e.message);
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
        alert("Comercio creado con éxito");
    } else {
        alert("Error al crear: " + error.message);
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
    } else {
        alert("Error al cargar producto: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 min-h-screen shadow-2xl bg-white">
        
        {/* Sidebar - Diseño Claro */}
        <div className="lg:col-span-1 border-r border-neutral-200 p-8 bg-neutral-100/50">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                    <Store size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-neutral-800">Admin<span className="text-blue-600">Burger</span></h2>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-4">Lista de Locales</h3>
                    <div className="space-y-2">
                        {comercios.length === 0 && <p className="text-[10px] text-neutral-400 italic">No hay locales creados</p>}
                        {comercios.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => selectComercio(c)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center justify-between group ${selectedComercio?.id === c.id ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-neutral-200 text-neutral-500 hover:border-blue-300 hover:text-blue-600"}`}
                            >
                                {c.nombre}
                                <ChevronRight size={14} className={selectedComercio?.id === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-white rounded-[2rem] border border-neutral-200 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-neutral-800 uppercase tracking-widest text-center">Nuevo Negocio</h4>
                    <input placeholder="NOMBRE" value={newComercio.nombre} onChange={e => setNewComercio({...newComercio, nombre: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-blue-600 outline-none uppercase italic" />
                    <input placeholder="SLUG" value={newComercio.slug} onChange={e => setNewComercio({...newComercio, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-blue-600 outline-none uppercase italic" />
                    <input placeholder="WHATSAPP" value={newComercio.whatsapp_numero} onChange={e => setNewComercio({...newComercio, whatsapp_numero: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-blue-600 outline-none uppercase italic" />
                    <button onClick={handleCreateComercio} className="w-full bg-neutral-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all italic">Dar de Alta</button>
                </div>
            </div>
        </div>

        {/* Content - Diseño Claro */}
        <div className="lg:col-span-3 p-8 lg:p-12">
            {selectedComercio ? (
                <div className="animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-neutral-100 pb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-200">Local Seleccionado</span>
                                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">/{selectedComercio.slug}</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none">{selectedComercio.nombre}</h1>
                        </div>
                        <a href={`/${selectedComercio.slug}`} target="_blank" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase hover:bg-neutral-900 transition-all italic tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center gap-2">
                            Ver Web <ChevronRight size={14} />
                        </a>
                    </div>

                    {/* IA DESIGNER - AHORA MÁS VISIBLE */}
                    <div className="mb-16 p-10 bg-white border-2 border-dashed border-blue-200 rounded-[3rem] shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles size={24} className="text-blue-600 animate-pulse" />
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-neutral-800 leading-none">Rediseñar con IA (Gemini)</h3>
                            </div>
                            <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest mb-8 max-w-xl leading-relaxed italic">
                                Escribí la "onda" que querés para tu web. Ejemplo: "Estilo retro de los 80, colores neon y mucha tipografía gruesa". Gemini hará la magia.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    placeholder="DESCRIBÍ TU ESTILO ACÁ..." 
                                    value={iaPrompt}
                                    onChange={(e) => setIaPrompt(e.target.value)}
                                    className="flex-grow bg-neutral-100 border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-black text-neutral-800 placeholder:text-neutral-400 outline-none focus:bg-white focus:border-blue-600 transition-all italic"
                                />
                                <button 
                                    onClick={generateWithIA}
                                    disabled={isGenerating || !iaPrompt}
                                    className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3 italic shadow-lg shadow-blue-100"
                                >
                                    {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    {isGenerating ? "TRABAJANDO..." : "GENERAR DISEÑO"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Gestión de Menú */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-neutral-800">Menú Digital</h3>
                            <button onClick={() => {const n = prompt("Nombre:"); if(n) supabase.from("categorias").insert([{comercio_id: selectedComercio.id, nombre: n.toUpperCase()}]).then(() => selectComercio(selectedComercio))}} className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 px-8 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-neutral-900 hover:text-white transition-all italic tracking-[0.2em]">
                                <Plus size={16} /> Nueva Categoría
                            </button>
                        </div>

                        {categorias.length === 0 ? (
                            <div className="p-20 bg-neutral-50 border border-neutral-200 rounded-[3rem] text-center border-dashed">
                                <p className="text-neutral-400 uppercase text-[10px] font-black tracking-widest">Empezá creando tu primera categoría</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {categorias.map(cat => (
                                    <div key={cat.id} className="bg-neutral-50 rounded-[3.5rem] border border-neutral-200 p-10 lg:p-16">
                                        <h4 className="text-4xl font-black uppercase italic text-neutral-800 tracking-tighter mb-12 flex items-center gap-6">
                                            {cat.nombre}
                                            <div className="h-[2px] flex-grow bg-neutral-200" />
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                            {productos.filter(p => p.categoria_id === cat.id).map(p => (
                                                <div key={p.id} className="bg-white border border-neutral-200 p-8 rounded-[2.5rem] flex justify-between items-center group/item hover:border-blue-600/50 transition-all shadow-sm hover:shadow-xl">
                                                    <div className="flex items-center gap-6">
                                                        {p.imagen_url && <img src={p.imagen_url} className="w-16 h-16 rounded-[1.2rem] object-cover border border-neutral-100" alt="" />}
                                                        <div>
                                                            <p className="font-black text-lg uppercase italic tracking-tighter text-neutral-800">{p.nombre}</p>
                                                            <p className="text-[10px] text-blue-600 font-black tracking-[0.2em] uppercase mt-2 italic">
                                                                {p.variantes ? `${p.variantes.length} OPCIONES` : `$${p.precio_base.toLocaleString()}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => {if(confirm("¿Borrar?")) supabase.from("productos").delete().eq("id", p.id).then(() => selectComercio(selectedComercio))}} className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => { setNewProduct({...newProduct, categoria_id: cat.id}); setIsProductModalOpen(true); }}
                                            className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-[2.5rem] text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] hover:border-blue-600 hover:text-blue-600 transition-all italic bg-white"
                                        >
                                            + CARGAR PRODUCTO EN {cat.nombre}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-200">
                    <Store size={160} strokeWidth={0.5} className="mb-8 opacity-20" />
                    <p className="text-2xl font-black uppercase tracking-[0.6em] italic opacity-20 text-neutral-400">Seleccioná un comercio</p>
                </div>
            )}
        </div>
      </div>

      {/* Modal Producto - Diseño Claro */}
      <AnimatePresence>
        {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0" />
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white border border-neutral-200 w-full max-w-2xl rounded-[4rem] p-12 lg:p-20 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-12 text-neutral-900 leading-none">Cargar Ítem</h2>
                    <form onSubmit={handleSaveProduct} className="space-y-8">
                        <input required placeholder="NOMBRE" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value.toUpperCase()})} className="w-full bg-neutral-100 border-none rounded-[1.5rem] px-8 py-5 text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none italic" />
                        {!newProduct.has_variants && <input required type="number" placeholder="PRECIO FINAL ($)" value={newProduct.precio_base || ""} onChange={e => setNewProduct({...newProduct, precio_base: parseInt(e.target.value)})} className="w-full bg-neutral-100 border-none rounded-[1.5rem] px-8 py-5 text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none italic" />}
                        <textarea placeholder="DESCRIPCIÓN" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value.toUpperCase()})} className="w-full bg-neutral-100 border-none rounded-[1.5rem] px-8 py-5 text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none italic h-32 resize-none" />
                        
                        <div className="p-8 bg-neutral-50 rounded-[2.5rem] border border-neutral-200 space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input type="checkbox" checked={newProduct.has_variants} onChange={e => setNewProduct({...newProduct, has_variants: e.target.checked})} className="w-6 h-6 rounded-lg bg-neutral-200 border-none text-blue-600 focus:ring-0" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic text-neutral-800">Habilitar niveles</span>
                                </label>
                                {newProduct.has_variants && <button type="button" onClick={() => setNewProduct({...newProduct, variantes: [...newProduct.variantes, {nombre: "", precio: 0}]})} className="text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-200 px-5 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">+ Añadir</button>}
                            </div>
                            {newProduct.has_variants && (
                                <div className="space-y-4 pt-6 border-t border-neutral-200">
                                    {newProduct.variantes.map((v: any, i: number) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <input placeholder="NOMBRE" value={v.nombre} onChange={e => {const n = [...newProduct.variantes]; n[i].nombre = e.target.value.toUpperCase(); setNewProduct({...newProduct, variantes: n})}} className="flex-grow bg-white border border-neutral-200 rounded-xl px-5 py-3 text-[10px] font-bold italic" />
                                            <input type="number" placeholder="PRECIO" value={v.precio || ""} onChange={e => {const n = [...newProduct.variantes]; n[i].precio = parseInt(e.target.value); setNewProduct({...newProduct, variantes: n})}} className="w-32 bg-white border border-neutral-200 rounded-xl px-5 py-3 text-[10px] font-bold italic" />
                                            <button type="button" onClick={() => {const n = [...newProduct.variantes]; n.splice(i,1); setNewProduct({...newProduct, variantes: n})}} className="p-3 text-neutral-400 hover:text-red-500"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input placeholder="URL IMAGEN" value={newProduct.imagen_url} onChange={e => setNewProduct({...newProduct, imagen_url: e.target.value})} className="w-full bg-neutral-100 border-none rounded-[1.5rem] px-8 py-5 text-[10px] font-black focus:ring-2 focus:ring-blue-600 outline-none italic" />
                        <button type="submit" className="w-full bg-neutral-900 text-white py-8 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl italic">Cargar al Menú</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
