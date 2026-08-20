# Guía para Diseñadora - ROLI Dashboard

¡Bienvenida al proyecto! Esta guía te ayudará a hacer cambios de diseño directamente en el código.

## 🎯 Tu rama de trabajo: `design`

Siempre trabajarás en la rama llamada `design`. Tus cambios NO afectarán la versión en producción hasta que Main User los apruebe.

---

## 🛠️ Setup inicial (solo una vez)

### 1. Instalar herramientas necesarias

**Git:**
- Mac: Ya viene instalado, abre Terminal y escribe `git --version`
- Windows: Descarga de https://git-scm.com/download/win

**Node.js:**
- Descarga de: https://nodejs.org (versión LTS)
- Verifica en Terminal: `node --version`

**Visual Studio Code (editor de código):**
- Descarga de: https://code.visualstudio.com
- Instala estas extensiones (búscalas en VS Code):
  - "GitLens" (para ver cambios de Git visualmente)
  - "Prettier" (formatea el código automáticamente)
  - "ES7+ React" (ayuda con React)

### 2. Clonar el proyecto en tu computadora

```bash
# Abre Terminal/Command Prompt
# Navega a donde quieres guardar el proyecto
cd Desktop

# Clona el repositorio
git clone https://github.com/worldjusticeproject/roli-dashboard-viz.git

# Entra a la carpeta
cd ROLI-dashboard

# Cambia a la rama design (TU rama de trabajo)
git checkout design

# Instala dependencias
npm install
```

### 3. Abrir el proyecto en VS Code

```bash
# Desde la carpeta del proyecto:
code .
```

---

## 🚀 Flujo de trabajo diario

### Cada vez que vayas a trabajar:

```bash
# 1. Asegúrate de estar en la rama design
git checkout design

# 2. Obtén los últimos cambios
git pull origin design

# 3. Arranca el servidor de desarrollo
npm start
```

El navegador se abrirá automáticamente en `http://localhost:3000`

### Mientras trabajas:

1. **Haz cambios en los archivos** (ver sección "Archivos que modificarás")
2. **Guarda el archivo** (Cmd+S / Ctrl+S)
3. **El navegador se recarga solo** y ves tus cambios
4. **Repite** hasta que estés contenta

### Cuando termines una sesión:

```bash
# 1. Guarda todos tus cambios en Git
git add .

# 2. Crea un commit con descripción de lo que hiciste
git commit -m "Mejora colores del header y aumenta tamaño de fuente"

# 3. Sube tus cambios a GitHub
git push origin design
```

---

## 📁 Archivos que modificarás

### 🎨 **Colores y constantes** - `src/constants.js`
```javascript
// Líneas 52-62 aproximadamente
export const COLORS = {
  top5: '#4a90e2',      // Azul para top 5
  bottom5: '#e74c3c',   // Rojo para bottom 5
  background: '#f8f9fa', // Fondo gris claro
  text: '#2c3e50',      // Texto principal
  muted: '#7f8c8d',     // Texto secundario
  divider: '#e1e4e8'    // Líneas divisorias
};
```

**Qué puedes cambiar:**
- Colores (usa códigos HEX como `#FF5733`)
- No cambies los nombres de las variables (top5, bottom5, etc.)

### 📱 **Estilos responsive** - `src/responsive.css`
```css
/* Estilos para móviles */
@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 20px !important;
  }
}
```

**Qué puedes cambiar:**
- Tamaños de fuente
- Espaciados (padding, margin)
- Colores de fondo
- Tamaños de elementos

### 🎯 **Componentes principales** - `App.js`, `src/InfoModal.js`, etc.

Estos archivos tienen estilos inline (dentro del código JavaScript).

**Ejemplo en App.js:**
```javascript
style={{
  fontSize: '32px',
  fontWeight: '700',
  color: COLORS.text,
  margin: 0
}}
```

**Qué puedes cambiar:**
- `fontSize`: Tamaño de letra (ej: '24px', '18px')
- `fontWeight`: Peso de letra (400=normal, 600=semi-bold, 700=bold)
- `color`: Color del texto
- `margin`, `padding`: Espaciado
- `borderRadius`: Esquinas redondeadas

---

## 🎨 Cambios comunes

### Cambiar color del header

**Archivo:** `App.js`
**Buscar:** `backgroundColor: COLORS.top5`
**Cambiar a:** `backgroundColor: '#TU_COLOR'`

### Cambiar tamaño de títulos

**Archivo:** `App.js`
**Buscar:** `fontSize: '32px'`
**Cambiar a:** `fontSize: '28px'` (o el tamaño que quieras)

### Cambiar colores de los gráficos

**Archivo:** `src/constants.js`
**Modificar:** `COLORS` object

### Cambiar espaciado general

**Archivo:** `src/responsive.css`
**Modificar:** valores de `padding` y `margin`

---

## 🆘 Comandos de emergencia

### Si algo se rompe:

```bash
# Descarta TODOS tus cambios y vuelve al último commit
git reset --hard origin/design

# Reinstala dependencias (si el proyecto no arranca)
rm -rf node_modules
npm install
```

### Si el servidor no arranca:

```bash
# Para el servidor (Ctrl+C)
# Limpia caché
rm -rf node_modules/.cache

# Vuelve a arrancar
npm start
```

---

## 📤 Pedir que Main User revise tus cambios

Cuando tengas cambios listos para que Main User los revise:

1. **Asegúrate de haber hecho commit y push:**
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin design
   ```

2. **Crea un Pull Request en GitHub:**
   - Ve a: https://github.com/worldjusticeproject/roli-dashboard-viz
   - Verás un banner amarillo: "design had recent pushes"
   - Click en "Compare & pull request"
   - **Base:** main ← **Compare:** design
   - Escribe título y descripción
   - Adjunta screenshots del antes/después
   - Click "Create pull request"

3. **Notifica a Main User** (WhatsApp, email, etc.)

---

## 💡 Tips

### ✅ Buenas prácticas:
- Haz commits pequeños y frecuentes
- Usa mensajes descriptivos: ✅ "Mejora contraste en botones" ❌ "cambios"
- Prueba en diferentes tamaños de ventana (desktop, tablet, móvil)
- Si no estás segura de un cambio, haz un screenshot antes

### ❌ Evita:
- Cambiar nombres de variables o funciones
- Borrar archivos
- Modificar archivos en la carpeta `data/`
- Trabajar en la rama `main` (siempre usa `design`)

### 🎯 Si tienes dudas:
- Busca en el archivo el comentario más cercano
- Pregúntale a Main User
- Haz un cambio pequeño y ve qué pasa (siempre puedes deshacerlo)

---

## 🔄 Flujo visual del proceso

```
TU COMPUTADORA                                    GITHUB
     design                                        design
       │                                             │
       │ 1. Haces cambios                            │
       │    en archivos                              │
       │                                             │
       │ 2. git add .                                │
       │    git commit -m "..."                      │
       │                                             │
       │ 3. git push origin design                   │
       ├────────────────────────────────────────────►│
       │                                             │
       │                                             │ 4. Creas Pull Request
       │                                             │    design → main
       │                                             │
       │                                             │ 5. Main User revisa
       │                                             │    y aprueba
       │                                             │
       │                                             ▼
       │                                           main ✅
       │                                      (producción)
       │                                             │
       │ 6. git pull origin design                   │
       │    (traes cambios aprobados)                │
       ◄─────────────────────────────────────────────┤
       │                                             │
```

---

## 📞 Contacto

Si tienes problemas o preguntas:
- Main User: [tu contacto]
- Este proyecto: https://github.com/worldjusticeproject/roli-dashboard-viz

¡Disfruta experimentando con el diseño! 🎨
