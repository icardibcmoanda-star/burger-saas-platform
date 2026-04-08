-- 1. Tabla de Comercios (Hamburgueserías)
CREATE TABLE comercios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Ej: 'roses-burgers'
  logo_url TEXT,
  color_primario TEXT DEFAULT '#dc2626', -- Rojo por defecto
  whatsapp_numero TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Categorías
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  orden INTEGER DEFAULT 0
);

-- 3. Tabla de Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  precio_base INTEGER DEFAULT 0,
  es_burger BOOLEAN DEFAULT false,
  variantes JSONB DEFAULT NULL, -- Aquí guardaremos Simple/Doble/Triple y Precios
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar acceso público de lectura (RLS)
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de comercios" ON comercios FOR SELECT USING (true);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de categorias" ON categorias FOR SELECT USING (true);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de productos" ON productos FOR SELECT USING (true);
