#!/bin/bash

# Script para sincronizar rama design con main
# Uso: ./sync-design.sh

echo "🔄 Sincronizando rama 'design' con 'main'..."
echo ""

# Guardar rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"

# Actualizar main
echo ""
echo "⬇️  Actualizando main..."
git checkout main
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Error al actualizar main"
    git checkout $CURRENT_BRANCH
    exit 1
fi

# Cambiar a design
echo ""
echo "📍 Cambiando a design..."
git checkout design
git pull origin design

if [ $? -ne 0 ]; then
    echo "❌ Error al actualizar design"
    git checkout $CURRENT_BRANCH
    exit 1
fi

# Merge main into design
echo ""
echo "🔀 Mergeando main en design..."
git merge main -m "Sync: Merge main into design"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ¡Conflictos detectados!"
    echo ""
    echo "Opciones:"
    echo "1. Resolver conflictos manualmente y luego:"
    echo "   git add ."
    echo "   git commit"
    echo "   git push origin design"
    echo ""
    echo "2. Abortar el merge:"
    echo "   git merge --abort"
    echo ""
    git checkout $CURRENT_BRANCH
    exit 1
fi

# Push design
echo ""
echo "⬆️  Subiendo cambios a design..."
git push origin design

if [ $? -ne 0 ]; then
    echo "❌ Error al subir design"
    git checkout $CURRENT_BRANCH
    exit 1
fi

# Volver a rama original
echo ""
echo "📍 Volviendo a $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Sincronización completada!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Rama 'design' ahora está actualizada con 'main'"
echo "La diseñadora puede hacer 'git pull origin design' para obtener los cambios"
echo ""
