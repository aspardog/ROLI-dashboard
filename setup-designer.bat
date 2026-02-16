@echo off
REM Script de configuración para diseñadora (Windows)
REM Este script asegura que siempre trabajes en la rama 'design'

echo.
echo 🎨 Configurando entorno de diseño para ROLI Dashboard...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: Este script debe ejecutarse desde la raíz del proyecto ROLI-dashboard
    pause
    exit /b 1
)

REM Cambiar a la rama design
echo 📍 Cambiando a la rama 'design'...
git checkout design

if errorlevel 1 (
    echo ❌ Error al cambiar a la rama design
    pause
    exit /b 1
)

REM Obtener últimos cambios
echo ⬇️  Obteniendo últimos cambios...
git pull origin design

REM Verificar rama actual
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo.
echo ✅ Estás en la rama: %CURRENT_BRANCH%

if not "%CURRENT_BRANCH%"=="design" (
    echo ⚠️  ADVERTENCIA: No estás en la rama 'design'
    echo    Por favor ejecuta: git checkout design
    pause
    exit /b 1
)

REM Instalar o actualizar dependencias
if not exist "node_modules" (
    echo 📦 Instalando dependencias (esto puede tomar unos minutos)...
    call npm install
) else (
    echo 📦 Actualizando dependencias...
    call npm install
)

REM Configurar Git
echo.
echo 🔧 Configurando Git...
git config --local status.branch true
git config --local status.short true

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡Todo listo!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📍 Rama actual: %CURRENT_BRANCH%
echo.
echo 🚀 Para iniciar el servidor de desarrollo:
echo    npm start
echo.
echo ⚠️  RECUERDA: Siempre trabaja en la rama 'design'
echo    Verifica con: git status
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
