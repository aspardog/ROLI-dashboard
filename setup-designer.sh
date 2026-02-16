#!/bin/bash

# Script de configuración para diseñadora
# Este script asegura que siempre trabajes en la rama 'design'

echo "🎨 Configurando entorno de diseño para ROLI Dashboard..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto ROLI-dashboard"
    exit 1
fi

# Cambiar a la rama design
echo "📍 Cambiando a la rama 'design'..."
git checkout design

if [ $? -ne 0 ]; then
    echo "❌ Error al cambiar a la rama design"
    exit 1
fi

# Obtener últimos cambios
echo "⬇️  Obteniendo últimos cambios..."
git pull origin design

# Verificar rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "✅ Estás en la rama: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "design" ]; then
    echo "⚠️  ADVERTENCIA: No estás en la rama 'design'"
    echo "   Por favor ejecuta: git checkout design"
    exit 1
fi

# Instalar o actualizar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias (esto puede tomar unos minutos)..."
    npm install
else
    echo "📦 Actualizando dependencias..."
    npm install
fi

# Configurar Git para mostrar siempre la rama actual en el prompt
echo ""
echo "🔧 Configurando Git..."

# Configurar para que siempre muestre en qué rama estás
git config --local status.branch true
git config --local status.short true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Todo listo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Rama actual: $CURRENT_BRANCH"
echo ""
echo "🚀 Para iniciar el servidor de desarrollo:"
echo "   npm start"
echo ""
echo "⚠️  RECUERDA: Siempre trabaja en la rama 'design'"
echo "   Verifica con: git status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
