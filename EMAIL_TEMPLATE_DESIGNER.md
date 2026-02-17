# Email Template for Designer Onboarding

---

**Subject:** Bienvenida al proyecto ROLI Dashboard - Setup inicial

---

Hola [Nombre],

¡Bienvenida al equipo del ROLI Dashboard!

Estoy muy emocionado de trabajar contigo en mejorar el diseño visual y la experiencia de usuario del dashboard. He preparado todo para que puedas empezar a trabajar de manera independiente y efectiva.

## 🎯 Tu rol en el proyecto

Como diseñadora, tu enfoque será en:
- ✅ Diseño visual (colores, tipografía, espaciado)
- ✅ Layouts y diseño responsive
- ✅ Mejoras de experiencia de usuario
- ✅ Consistencia visual y de marca

Yo me encargaré de toda la lógica, datos, y aspectos técnicos del proyecto.

## 🚀 Primeros pasos

### 1. Acceso al repositorio
Ya te agregué como colaboradora al repositorio de GitHub:
**https://github.com/aspardog/ROLI-dashboard**

### 2. Setup inicial (30 minutos aprox)
Por favor lee y sigue esta guía: **`START_HERE.md`**

Este archivo contiene instrucciones paso a paso para:
- Instalar Git, Node.js, y VS Code
- Clonar el proyecto
- Configurar tu ambiente de desarrollo
- Verificar que todo funcione

### 3. Claude Code - Tu asistente AI personal 🤖

**IMPORTANTE:** Tienes acceso a Claude Code, un asistente de inteligencia artificial que puede ayudarte con todas tus tareas de diseño.

**Cómo usarlo:**
- ✅ **Úsalo LOCALMENTE en tu computadora** (usa tu propia cuenta de Claude)
- ❌ **NO lo uses en GitHub** mencionando @claude (eso usa mi cuota y no está configurado para ti)

**Para configurar Claude Code localmente:**
Lee la guía: **`CLAUDE_CODE_SETUP.md`**

Claude Code puede:
- Sugerirte cambios de colores y estilos
- Ayudarte a encontrar dónde están definidos los estilos
- Explicarte qué hace cada sección del código
- Generar código CSS/styling para ti
- Revisar tus cambios antes de hacer commit

**Importante:** Cuando uses Claude Code, siempre empieza diciéndole:
> "Soy la diseñadora trabajando en el ROLI dashboard. Necesito [tu tarea]."

Claude automáticamente entenderá tu rol y te dará asistencia enfocada en diseño (no en la lógica técnica).

## 📖 Documentación esencial

He creado guías específicas para ti:

1. **`START_HERE.md`** - Tu primera parada, setup inicial
2. **`CLAUDE_CODE_SETUP.md`** - Cómo instalar y usar tu asistente AI
3. **`DESIGNER_README.md`** - Contexto completo de tu rol (Claude Code lee esto automáticamente)
4. **`DESIGN_GUIDE.md`** - Tutorial paso a paso de todo el workflow
5. **`DESIGN_FILES_REFERENCE.md`** - Referencia rápida de archivos y dónde está cada cosa

## 🔄 Workflow de trabajo

### Tu rama: `design`
- ✅ SIEMPRE trabajas en la rama `design`
- ❌ NUNCA trabajes directamente en `main`

### Flujo típico:
1. Haces cambios de diseño en la rama `design`
2. Los pruebas localmente (localhost:3000)
3. Haces commit y push a `design`
4. Creas un Pull Request para que yo lo revise
5. Yo reviso, apruebo, y hago merge a `main`
6. Yo sincronizo `design` con `main` para que tengas los últimos cambios

**No te preocupes por sincronizar ramas** - Yo me encargo de mantener `design` actualizado con `main`. Claude Code te recordará hacer `git pull origin main` al inicio de cada sesión para que siempre trabajes con el código más reciente.

## 💡 Tips importantes

1. **Git branch protection:** La rama `main` está protegida. Solo yo puedo hacer merge directo. Tú creas PRs y yo los reviso.

2. **Claude Code es tu amigo:** Úsalo libremente para cualquier duda de diseño. Es muy bueno explicando cómo funcionan los estilos y sugiriendo mejoras.

3. **Commits frecuentes:** Haz commits pequeños y frecuentes. Mejor 5 commits pequeños que 1 gigante.

4. **Prueba en diferentes tamaños:** Siempre revisa tus cambios en desktop, tablet, y móvil (redimensiona la ventana del navegador).

5. **Screenshots en PRs:** Cuando crees un Pull Request, incluye screenshots de antes/después para que pueda ver los cambios visuales fácilmente.

## 🎨 Archivos principales que modificarás

- **`src/constants.js`** - Colores, paletas (líneas 52-62)
- **`src/responsive.css`** - Estilos responsive y mobile
- **`App.js`** - Estilos inline de componentes principales
- **`src/InfoModal.js`** - Modal "Learn about Index"
- **`src/HowToUseModal.js`** - Modal "How to Use"

Ver `DESIGN_FILES_REFERENCE.md` para más detalles.

## 📅 Próximos pasos

1. **Esta semana:**
   - Completa el setup inicial (START_HERE.md)
   - Instala Claude Code localmente (CLAUDE_CODE_SETUP.md)
   - Familiarízate con el proyecto ejecutando `npm start`
   - Explora los archivos mencionados en DESIGN_FILES_REFERENCE.md

2. **Cuando estés lista:**
   - Agenda una llamada de 30min conmigo para revisar dudas
   - Empezaremos con tareas pequeñas de diseño para que te familiarices
   - Luego podrás trabajar de manera más independiente

## 📞 Contacto

Si tienes cualquier pregunta o problema durante el setup:
- Email: [tu email]
- Slack/WhatsApp: [tu contacto]

No dudes en escribirme en cualquier momento. Prefiero que preguntes a que te quedes atascada.

## 🎁 Bonus: Rate limits y costos

**Sobre Claude Code:**
- Tienes tu propia cuenta de Claude con tu propio quota
- Cuando usas Claude Code localmente, usa TU quota (no el mío)
- Si uso @claude en GitHub para revisar tus PRs, uso MI quota (está bien, es parte de mi trabajo de review)
- Tú NO puedes usar @claude en GitHub (está restringido solo para mí para controlar costos)

Claude tiene un tier gratuito generoso. Si lo usas mucho y llegas al límite, puedes:
1. Esperar a que se renueve tu quota mensual
2. Upgradearte a un plan pago (muy económico)
3. Preguntarme y podemos evaluar opciones

---

¡Estoy emocionado de ver tus ideas y mejoras en el dashboard!

Saludos,
Santiago

---

**Links rápidos:**
- Repo: https://github.com/aspardog/ROLI-dashboard
- Claude Code: https://claude.ai/code
- Documentación: https://github.com/aspardog/ROLI-dashboard/blob/design/START_HERE.md
