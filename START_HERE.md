# 👋 ¡Hola Diseñadora!

Bienvenida al proyecto ROLI Dashboard. Esta es tu guía de inicio rápido.

---

## 🚀 Setup inicial (solo la primera vez)

### Paso 1: Instalar herramientas

**Necesitas instalar:**

1. **Git**
   - Mac: Ya viene instalado ✅
   - Windows: https://git-scm.com/download/win

2. **Node.js** (versión 16 o superior)
   - https://nodejs.org/en/download/
   - Descarga la versión "LTS"

3. **VS Code** (editor de código)
   - https://code.visualstudio.com/

### Paso 2: Clonar el proyecto

Abre Terminal (Mac) o Command Prompt (Windows) y ejecuta:

```bash
# Navega a donde quieres guardar el proyecto (ej: Desktop)
cd Desktop

# Clona el repositorio
git clone https://github.com/aspardog/ROLI-dashboard.git

# Entra a la carpeta
cd ROLI-dashboard
```

### Paso 3: Ejecutar setup automático

**En Mac/Linux:**
```bash
./setup-designer.sh
```

**En Windows:**
```bash
setup-designer.bat
```

Este script:
- ✅ Te cambia automáticamente a la rama `design`
- ✅ Instala todas las dependencias
- ✅ Configura Git para que siempre sepas en qué rama estás
- ✅ Verifica que todo esté listo

### Paso 4: Abrir en VS Code

```bash
code .
```

---

## 🎨 Cada vez que vayas a trabajar

### Opción A: Usando el script (Recomendado)

Simplemente ejecuta el script de nuevo:

**Mac/Linux:**
```bash
./setup-designer.sh
```

**Windows:**
```bash
setup-designer.bat
```

El script se asegura de que:
- Estés en la rama correcta (`design`)
- Tengas los últimos cambios
- Las dependencias estén actualizadas

### Opción B: Manualmente

```bash
# 1. Asegúrate de estar en design
git checkout design

# 2. Obtén últimos cambios
git pull origin design

# 3. Inicia el servidor
npm start
```

---

## ✅ Verificar que estás en la rama correcta

**ANTES de hacer cualquier cambio, siempre verifica:**

```bash
git status
```

Debe decir: `On branch design`

Si dice `On branch main` → ⚠️ **DETENTE** y ejecuta:
```bash
git checkout design
```

---

## 📁 ¿Qué archivos modificar?

### Colores y constantes
📄 `src/constants.js` (líneas 52-62)

### Estilos responsive
📄 `src/responsive.css`

### Componentes principales
📄 `App.js`
📄 `src/InfoModal.js`
📄 `src/HowToUseModal.js`

**💡 Tip:** Lee `DESIGN_FILES_REFERENCE.md` para una guía detallada de dónde está cada cosa.

---

## 💾 Guardar tus cambios

### 1. Ver qué archivos cambiaste:
```bash
git status
```

### 2. Agregar todos los cambios:
```bash
git add .
```

### 3. Crear un commit:
```bash
git commit -m "Descripción breve de lo que hiciste"
```

**Ejemplos de buenos mensajes:**
- ✅ "Mejorar colores del header"
- ✅ "Aumentar tamaño de fuente en títulos"
- ✅ "Ajustar espaciado en controles"

**Ejemplos de malos mensajes:**
- ❌ "cambios"
- ❌ "update"
- ❌ "asdf"

### 4. Subir a GitHub:
```bash
git push origin design
```

---

## 🔄 Crear Pull Request (cuando estés lista)

1. Ve a: https://github.com/aspardog/ROLI-dashboard
2. Verás un banner amarillo: **"design had recent pushes"**
3. Click en **"Compare & pull request"**
4. Verifica que sea: `base: main` ← `compare: design`
5. Escribe:
   - **Título:** Resumen de tus cambios
   - **Descripción:** Qué hiciste y por qué
   - **Screenshots:** Antes y después (¡super útil!)
6. Click **"Create pull request"**
7. Notifica a Santiago

---

## 🆘 Comandos de emergencia

### Si algo se rompió y quieres deshacer TODO:
```bash
git reset --hard origin/design
```
⚠️ Esto **borra todos tus cambios locales** sin guardar.

### Si el servidor no arranca:
```bash
# Detén el servidor (Ctrl+C)
# Limpia y reinstala
rm -rf node_modules
npm install
npm start
```

### Si accidentalmente hiciste cambios en main:
```bash
# NO hagas commit
# Cambia a design
git checkout design

# Git te preguntará si quieres llevar los cambios
# Responde: y (yes)
```

---

## 📚 Guías completas

- **CLAUDE_CODE_SETUP.md** - 🤖 Cómo instalar y usar Claude Code localmente (tu asistente AI personal)
- **DESIGN_GUIDE.md** - Tutorial detallado paso a paso
- **DESIGN_FILES_REFERENCE.md** - Referencia de todos los archivos con ejemplos
- **DESIGNER_README.md** - Información específica para diseñadoras (Claude Code lee esto automáticamente)

---

## 💡 Reglas de oro

1. ✅ **SIEMPRE** verifica que estés en la rama `design` antes de hacer cambios
2. ✅ **NUNCA** trabajes en la rama `main`
3. ✅ Haz commits pequeños y frecuentes
4. ✅ Usa mensajes descriptivos en commits
5. ✅ Prueba en diferentes tamaños de ventana (desktop, tablet, móvil)
6. ✅ Haz screenshots antes/después para los Pull Requests

---

## 📞 ¿Necesitas ayuda?

Contacta a Santiago: [tu contacto]

---

## 🎯 Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│ COMANDOS ESENCIALES                             │
├─────────────────────────────────────────────────┤
│ ✓ Verificar rama:       git status              │
│ ✓ Cambiar a design:     git checkout design     │
│ ✓ Ver últimos cambios:  git pull origin design  │
│ ✓ Iniciar servidor:     npm start               │
│ ✓ Guardar cambios:      git add .               │
│                         git commit -m "..."     │
│                         git push origin design  │
└─────────────────────────────────────────────────┘
```

---

¡Disfruta diseñando! 🎨✨
