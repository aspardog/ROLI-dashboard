# Referencia rápida - Archivos de diseño

Esta es una guía visual de dónde están los estilos en cada archivo.

---

## 🎨 src/constants.js

**Qué contiene:** Todos los colores, regiones, variables

### Colores principales (línea ~52)

```javascript
export const COLORS = {
  top5: '#4a90e2',      // 🔵 Azul - Top 5 países
  bottom5: '#e74c3c',   // 🔴 Rojo - Bottom 5 países
  background: '#f8f9fa',// ⚪ Gris claro - Fondo general
  text: '#2c3e50',      // ⚫ Gris oscuro - Texto principal
  muted: '#7f8c8d',     // 🌫️ Gris medio - Texto secundario
  divider: '#e1e4e8'    // ➖ Gris claro - Líneas
};
```

**Afecta a:** TODO el dashboard (estos colores se usan en todos lados)

---

## 📱 src/responsive.css

**Qué contiene:** Estilos para móviles y tablets

### Breakpoints

```css
/* Para pantallas menores a 768px (tablets y móviles) */
@media (max-width: 768px) {
  /* Estilos aquí */
}

/* Para pantallas menores a 480px (móviles pequeños) */
@media (max-width: 480px) {
  /* Estilos aquí */
}
```

### Elementos comunes que puedes ajustar:

```css
.dashboard-header h1 {
  font-size: 20px !important;        /* Tamaño del título principal */
  line-height: 1.3 !important;       /* Altura de línea */
  letter-spacing: -0.3px !important; /* Espaciado entre letras */
}

.controls-container {
  padding: 16px 12px !important;     /* Espacio interno */
  margin-bottom: 16px !important;    /* Espacio externo */
}
```

---

## 📄 App.js

**Qué contiene:** Estructura principal del dashboard, header, banner, controles

### Header principal (línea ~109)

```javascript
<h1 style={{
  fontSize: '32px',           // Tamaño del título
  fontWeight: '700',          // Peso de la fuente (700 = bold)
  color: COLORS.text,         // Color del texto
  margin: 0,
  letterSpacing: '-0.5px'     // Espaciado entre letras
}}>
  Rule of Law Index – Data Visualization Tool
</h1>
```

### Barra de acento azul (línea ~108)

```javascript
<div style={{
  width: '6px',                    // Ancho de la barra
  height: '48px',                  // Alto de la barra
  backgroundColor: COLORS.top5,    // Color (azul)
  borderRadius: '3px'              // Esquinas redondeadas
}} />
```

### Controles (línea ~130+)

```javascript
<div style={{
  flex: 1
}}>
  <label style={{
    fontSize: '13px',                    // Tamaño del label
    fontWeight: '600',                   // Peso
    color: COLORS.muted,                 // Color
    textTransform: 'uppercase',          // MAYÚSCULAS
    letterSpacing: '0.5px',              // Espaciado
    marginBottom: '12px'                 // Espacio abajo
  }}>
    Region
  </label>

  <select style={{
    width: '100%',
    padding: '14px 16px',                // Espacio interno
    fontSize: '16px',                    // Tamaño de texto
    border: '2px solid #e5e5e5',         // Borde
    borderRadius: '8px',                 // Esquinas redondeadas
    backgroundColor: 'white',
    color: COLORS.text,
    cursor: 'pointer'
  }}>
    {/* opciones */}
  </select>
</div>
```

### Botones de tipo de gráfico (línea ~160+)

```javascript
<button style={{
  flex: 1,
  padding: '14px 20px',                          // Espacio interno
  fontSize: '15px',                              // Tamaño texto
  fontWeight: '600',                             // Peso
  backgroundColor: chartType === 'timeseries'
    ? COLORS.top5                                // Azul cuando activo
    : 'white',                                   // Blanco cuando inactivo
  color: chartType === 'timeseries'
    ? 'white'                                    // Texto blanco cuando activo
    : COLORS.text,                               // Texto oscuro cuando inactivo
  border: chartType === 'timeseries'
    ? `2px solid ${COLORS.top5}`                 // Borde azul cuando activo
    : '2px solid #e5e5e5',                       // Borde gris cuando inactivo
  borderRadius: '8px',                           // Esquinas redondeadas
  cursor: 'pointer'
}}>
  Time Series
</button>
```

---

## 🔵 src/InfoModal.js

**Qué contiene:** Modal "Learn about the Index"

### Contenedor del modal (línea ~8)

```javascript
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Fondo oscuro semi-transparente
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
}}>
```

### Caja blanca del modal (línea ~22)

```javascript
<div style={{
  backgroundColor: 'white',
  borderRadius: '12px',              // Esquinas redondeadas
  maxWidth: '900px',                 // Ancho máximo
  width: '100%',
  maxHeight: '90vh',                 // Altura máxima (90% de la pantalla)
  overflowY: 'auto',                 // Scroll vertical
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',  // Sombra
  position: 'relative'
}}>
```

### Botón cerrar (X) (línea ~35)

```javascript
<button style={{
  width: '40px',
  height: '40px',
  borderRadius: '50%',                    // Círculo
  backgroundColor: COLORS.background,
  color: COLORS.text,
  fontSize: '24px',                       // Tamaño de la X
  fontWeight: '300',
  cursor: 'pointer',
  border: 'none'
}}>
  ×
</button>
```

### Título del modal (línea ~55)

```javascript
<h2 style={{
  fontSize: '28px',
  fontWeight: '700',
  color: COLORS.text,
  marginTop: 0,
  marginBottom: '16px',
  letterSpacing: '-0.5px'
}}>
  Rule of Law Index – Data Visualization Tool
</h2>
```

---

## 🎯 src/HowToUseModal.js

**Qué contiene:** Modal "How to use this dashboard"

Tiene **la misma estructura** que InfoModal.js, solo cambia el contenido.

---

## 📊 src/TopBottomChart.js

**Qué contiene:** Gráfico de Top & Bottom performers

### Contenedor del gráfico (línea ~45+)

```javascript
<div style={{
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  marginBottom: '32px'
}}>
```

### Título del gráfico (línea ~50+)

```javascript
<h2 style={{
  fontSize: '20px',
  fontWeight: '600',
  color: COLORS.text,
  marginBottom: '6px'
}}>
  Top & Bottom Performers
</h2>
```

### Configuración de Recharts (línea ~80+)

```javascript
<BarChart
  layout="vertical"
  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
>
  <XAxis type="number" domain={[0, 1]} />
  <YAxis type="category" width={110} />
  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
    {/* Colores de las barras */}
  </Bar>
</BarChart>
```

---

## 📈 src/TimeSeriesChart.js

**Qué contiene:** Gráfico de línea temporal

Similar estructura a TopBottomChart.js

### Colores de las líneas (usa `TS_COLORS` de constants.js)

```javascript
// En src/constants.js línea ~64
export const TS_COLORS = {
  line: '#2c5aa0',           // Azul oscuro - Línea principal
  regionalAvg: '#e67e22',    // Naranja - Promedio regional
  dot: '#2c5aa0',            // Azul oscuro - Puntos
  grid: '#e1e4e8'            // Gris - Líneas de guía
};
```

---

## 🕸️ src/RadarChartView.js

**Qué contiene:** Gráfico radar (multi-año)

### Colores por año (línea ~20+)

```javascript
const YEAR_COLORS = {
  '2019': '#3b82f6',  // Azul
  '2020': '#10b981',  // Verde
  '2021': '#f59e0b',  // Naranja
  '2022': '#ef4444',  // Rojo
  '2023': '#8b5cf6',  // Morado
  '2024': '#ec4899',  // Rosa
  '2025': '#06b6d4'   // Cyan
};
```

---

## 📊 src/FactorComparisonChart.js

**Qué contiene:** Comparación de factores entre países

### Colores de países/regiones (línea ~30+)

```javascript
const ENTITY_COLORS = [
  '#2563eb',  // Azul
  '#dc2626',  // Rojo
  '#059669',  // Verde
  '#d97706',  // Naranja
  '#7c3aed'   // Morado
];
```

---

## 🎨 Paleta de colores rápida

Copia y pega estos códigos HEX:

```
Azules:
#2563eb - Azul brillante
#1d4ed8 - Azul medio
#1e3a8a - Azul oscuro
#3b82f6 - Azul claro

Rojos:
#dc2626 - Rojo brillante
#b91c1c - Rojo medio
#991b1b - Rojo oscuro

Verdes:
#059669 - Verde brillante
#047857 - Verde medio
#065f46 - Verde oscuro

Naranjas:
#d97706 - Naranja brillante
#b45309 - Naranja medio

Morados:
#7c3aed - Morado brillante
#6d28d9 - Morado medio

Grises:
#f8f9fa - Fondo claro
#e5e7eb - Borde claro
#9ca3af - Gris medio
#4b5563 - Gris oscuro
#1f2937 - Casi negro
```

---

## 🔍 Cómo encontrar algo específico

### En VS Code:

**Buscar en todos los archivos:**
- `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows)
- Escribe lo que buscas (ej: "fontSize: '32px'")
- Te muestra todos los archivos donde aparece

**Buscar en archivo actual:**
- `Cmd+F` (Mac) / `Ctrl+F` (Windows)

**Ir a línea específica:**
- `Cmd+G` (Mac) / `Ctrl+G` (Windows)
- Escribe el número de línea

---

## 💡 Tips para modificar estilos

### ✅ Empieza por aquí (más fácil → más difícil):

1. **Colores** → `src/constants.js`
2. **Tamaños de fuente** → Busca `fontSize` en VS Code
3. **Espaciados** → Busca `padding` o `margin`
4. **Bordes/sombras** → Busca `borderRadius` o `boxShadow`
5. **Estilos móvil** → `src/responsive.css`
6. **Estructura** → `App.js` (más complejo)

### 🎯 Unidades comunes:

- `px` - Píxeles (tamaño fijo)
- `%` - Porcentaje (relativo al contenedor)
- `vh` - Viewport height (% de altura de pantalla)
- `vw` - Viewport width (% de ancho de pantalla)
- `rem` - Relativo al tamaño de fuente raíz

### 🌈 Formatos de color:

- HEX: `#FF5733`
- RGB: `rgb(255, 87, 51)`
- RGBA (con transparencia): `rgba(255, 87, 51, 0.8)`

---

## ⚠️ NO toques estos archivos (a menos que sepas lo que haces):

- ❌ `package.json` - Configuración de dependencias
- ❌ `craco.config.js` - Configuración de build
- ❌ `src/parse-roli-data.js` - Parser de datos
- ❌ `src/svgExport.js` - Exportación de SVG
- ❌ Archivos en `data/` - Datos del proyecto
- ❌ `public/` - Archivos públicos (excepto index.html si sabes HTML)

---

¡Feliz diseño! 🎨
