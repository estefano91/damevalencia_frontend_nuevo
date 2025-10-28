# Script de Deploy a Firebase Hosting
# AURA Sports

Write-Host "🚀 AURA Sports - Firebase Deploy" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estás en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "   Ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Directorio correcto" -ForegroundColor Green
Write-Host ""

# Paso 2: Instalar dependencias si es necesario
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ node_modules existe" -ForegroundColor Green
}
Write-Host ""

# Paso 3: Verificar configuración de Firebase
Write-Host "🔥 Verificando configuración de Firebase..." -ForegroundColor Yellow
if (-not (Test-Path "firebase.json")) {
    Write-Host "❌ Error: firebase.json no encontrado" -ForegroundColor Red
    Write-Host "   Ejecuta: firebase init hosting" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Firebase configurado" -ForegroundColor Green
Write-Host ""

# Paso 4: Build del proyecto
Write-Host "🔨 Construyendo aplicación para producción..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completado" -ForegroundColor Green
Write-Host ""

# Paso 5: Verificar que dist existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Carpeta dist no encontrada" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Archivos generados:" -ForegroundColor Cyan
Get-ChildItem dist | Select-Object Name, Length
Write-Host ""

# Paso 6: Deploy a Firebase
Write-Host "🚀 Desplegando a Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Despliegue exitoso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Tu aplicación estará disponible en:" -ForegroundColor Cyan
    Write-Host "   https://aura-sports-app.web.app" -ForegroundColor White
} else {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
    exit 1
}


