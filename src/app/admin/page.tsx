"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Store, Package, LayoutGrid, X, Image as ImageIcon, Sparkles, ChevronRight, Wand2, RefreshCw, FileText, ListPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  // IA States
  const [iaPrompt, setIaPrompt] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  const handleBulkUpload = async () => {
    if (!bulkText || !selectedComercio || categorias.length === 0) {
        alert("Escribí el menú y asegúrate de tener al menos una categoría creada.");
        return;
    }
    setIsScanning(true);
    try {
        const res = await fetch("/api/scan-menu", {
            method: "POST",
            body: JSON.stringify({ menuText: bulkText })
        });
        const items = await res.json();
        
        // Insertamos todos los productos en la primera categoría por defecto (luego el usuario los mueve si quiere)
        const categoryId = categorias[0].id;
        const productsToInsert = items.map((item: any) => ({
            ...item,
            comercio_id: selectedComercio.id,
            categoria_id: categoryId
        }));

        const { error } = await supabase.from("productos").insert(productsToInsert);
        if (!error) {
            alert(`¡Éxito! Se cargaron ${items.length} productos.`);
            setIsBulkModalOpen(false);
            setBulkText("");
            selectComercio(selectedComercio);
        }
    } catch (e: any) {
        console.error(e);
        alert("Error: " + (e.details || e.message || "Fallo al procesar el menú"));
    } finally {
        setIsScanning(false);
    }
  };

  const generateWithIA = async () => {
    if (!iaPrompt || !selectedComercio) return;
    setIsGenerating(true);
    try {
        const res = await fetch("/api/generate-design", {
            method: "POST",
            body: JSON.stringify({ prompt: iaPrompt })
        });
        const design = await res.json();
        await supabase.from("comercios").update({
            color_primario: design.color_primario,
            hero_titulo: design.hero_titulo,
            hero_subtitulo: design.hero_subtitulo,
            config_ia: design
        }).eq("id", selectedComercio.id);
        selectComercio({...selectedComercio, ...design});
        alert("Diseño actualizado");
    } catch (e) {
        alert("Error con la IA");
    } finally {
        setIsGenerating(false);
    }
  };

  async function handleCreateComercio(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("comercios").insert([newComercio]);
    if (!error) fetchComercios();
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const productToSave = {
        ...newProduct,
        comercio_id: selectedComercio.id,
        variantes: newProduct.has_variants ? newProduct.variantes : null
    };
    await supabase.from("productos").insert([productToSave]);
    setIsProductModalOpen(false);
    selectComercio(selectedComercio);
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 min-h-screen shadow-2xl bg-white">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 border-r border-neutral-200 p-8 bg-neutral-100/50">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                    <Store size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-neutral-800">Admin<span className="text-blue-600">Burger</span></h2>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-4">Mis Locales</h3>
                    <div className="space-y-2">
                        {comercios.map(c => (
                            <button 
                                key={c.id} onClick={() => selectComercio(c)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center justify-between group ${selectedComercio?.id === c.id ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-neutral-200 text-neutral-500 hover:border-blue-300 hover:text-blue-600"}`}
                            >
                                {c.nombre}
                                <ChevronRight size={14} className={selectedComercio?.id === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleCreateComercio} className="p-6 bg-white rounded-[2rem] border border-neutral-200 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-neutral-800 uppercase tracking-widest text-center">Nuevo Negocio</h4>
                    <input placeholder="NOMBRE" value={newComercio.nombre} onChange={e => setNewComercio({...newComercio, nombre: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-blue-600 outline-none uppercase italic" />
                    <input placeholder="SLUG" value={newComercio.slug} onChange={e => setNewComercio({...newComercio, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-blue-600 outline-none uppercase italic" />
                    <input placeholder="WHATSAPP" value={newComercio.whatsapp_numero} onChange={e => setNewComercio({...newComercio, whatsapp_numero: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-blue-600 outline-none uppercase italic" />
                    <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all italic">Dar de Alta</button>
                </form>
            </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 p-8 lg:p-12 overflow-y-auto">
            {selectedComercio ? (
                <div className="animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-neutral-100 pb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-200 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    Web Activa
                                </span>
                                <span className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">/{selectedComercio.slug}</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none">{selectedComercio.nombre}</h1>
                        </div>
                        <a href={`/${selectedComercio.slug}`} target="_blank" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase hover:bg-neutral-900 transition-all italic tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center gap-2">
                            Ver Web <ChevronRight size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {/* IA DESIGNER */}
                        <div className="p-8 bg-white border border-neutral-200 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles size={20} className="text-blue-600" />
                                    <h3 className="text-lg font-black uppercase italic text-neutral-800">Diseño IA</h3>
                                </div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-6">Rediseñá tu web en un segundo</p>
                                <input 
                                    placeholder="EJ: ESTILO RETRO NEON..." value={iaPrompt} onChange={(e) => setIaPrompt(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 mb-4 italic"
                                />
                            </div>
                            <button onClick={generateWithIA} disabled={isGenerating || !iaPrompt} className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2 italic">
                                {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                GENERAR DISEÑO
                            </button>
                        </div>

                        {/* BULK UPLOAD */}
                        <div className="p-8 bg-neutral-900 text-white rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <ListPlus size={20} className="text-blue-400" />
                                    <h3 className="text-lg font-black uppercase italic">Carga Masiva</h3>
                                </div>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-6 text-white/60">Pegá tu menú y la IA hará el resto</p>
                                <p className="text-[10px] text-neutral-400 leading-relaxed italic">Ideal para cargar toda la carta de una sola vez sin completar formularios.</p>
                            </div>
                            <button onClick={() => setIsBulkModalOpen(true)} className="w-full mt-6 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all flex items-center justify-center gap-2 italic">
                                <FileText size={14} />
                                ESCANEAR CARTA
                            </button>
                        </div>
                    </div>

                    {/* Menú Section */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-neutral-800 leading-none">Tu Menú</h3>
                            <button onClick={() => {const n = prompt("Nombre:"); if(n) supabase.from("categorias").insert([{comercio_id: selectedComercio.id, nombre: n.toUpperCase()}]).then(() => selectComercio(selectedComercio))}} className="bg-neutral-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic hover:bg-neutral-900 hover:text-white transition-all">+ Categoría</button>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {categorias.map(cat => (
                                <div key={cat.id} className="bg-neutral-50 rounded-[3rem] border border-neutral-200 p-8 lg:p-12 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-2xl font-black uppercase italic text-neutral-800 tracking-tighter">{cat.nombre}</h4>
                                        <button onClick={() => {if(confirm("¿Borrar categoría?")) supabase.from("categorias").delete().eq("id", cat.id).then(() => selectComercio(selectedComercio))}} className="text-neutral-300 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {productos.filter(p => p.categoria_id === cat.id).map(p => (
                                            <div key={p.id} className="bg-white border border-neutral-200 p-5 rounded-3xl flex justify-between items-center group/item hover:border-blue-600/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    {p.imagen_url && <img src={p.imagen_url} className="w-12 h-12 rounded-xl object-cover grayscale opacity-50 group-hover/item:grayscale-0 group-hover/item:opacity-100" alt="" />}
                                                    <div>
                                                        <p className="font-black text-sm uppercase italic leading-none">{p.nombre}</p>
                                                        <p className="text-[10px] text-blue-600 font-black mt-1 italic">${p.precio_base.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => {if(confirm("¿Borrar?")) supabase.from("productos").delete().eq("id", p.id).then(() => selectComercio(selectedComercio))}} className="p-3 text-neutral-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => { setNewProduct({...newProduct, categoria_id: cat.id}); setIsProductModalOpen(true); }}
                                        className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-2xl text-[9px] font-black text-neutral-400 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all italic"
                                    >
                                        + Producto Individual
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-200">
                    <Store size={160} strokeWidth={0.5} className="mb-8 opacity-10 animate-pulse" />
                    <p className="text-2xl font-black uppercase tracking-[0.6em] italic opacity-20 text-neutral-400 text-center px-6 leading-loose">Elegí o creá un local <br /> para empezar a vender</p>
                </div>
            )}
        </div>
      </div>

      {/* Modal Carga Masiva */}
      <AnimatePresence>
        {isBulkModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkModalOpen(false)} className="absolute inset-0" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white border border-neutral-200 w-full max-w-xl rounded-[3rem] p-10 lg:p-16 shadow-2xl">
                    <button onClick={() => setIsBulkModalOpen(false)} className="absolute top-8 right-8 text-neutral-400 hover:text-black"><X size={32} /></button>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 leading-none">Escáner de Menú</h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8">Pegá el texto de tu menú desordenado abajo</p>
                    
                    <textarea 
                        placeholder="Ej: Hamburguesa Simple 8000, Doble 10000. Papas fritas grandes 5000..." 
                        value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                        className="w-full h-64 bg-neutral-50 border border-neutral-200 rounded-[2rem] p-8 text-sm font-bold focus:border-blue-600 outline-none transition-all italic resize-none mb-8"
                    />
                    
                    <button 
                        onClick={handleBulkUpload} disabled={isScanning || !bulkText}
                        className="w-full py-6 bg-neutral-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 italic"
                    >
                        {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        {isScanning ? "IA ESCANEANDO..." : "CARGAR TODO AL MENÚ"}
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Modal Individual (Simplificado) */}
      <AnimatePresence>
        {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0" />
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white border border-neutral-200 w-full max-w-2xl rounded-[4rem] p-12 lg:p-20 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-12 text-neutral-900 leading-none">Nuevo Ítem</h2>
                    <form onSubmit={handleSaveProduct} className="space-y-8">
                        <input required placeholder="NOMBRE" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value.toUpperCase()})} className="w-full bg-neutral-50 border-none rounded-[1.5rem] px-8 py-5 text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none italic" />
                        <button type="submit" className="w-full bg-neutral-900 text-white py-8 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl italic">Cargar Ítem</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
