#!/bin/bash

# 🥷 Script Anti-Detección WhatsApp - Solución Inmediata
# Este script limpia TODAS las sesiones previas y configura anti-detection

echo "🚀 Iniciando solución anti-detection para WhatsApp..."
echo "=========================================="

# 1. DETENER TODO
echo "⏹️  Deteniendo procesos..."
killall chrome 2>/dev/null || echo "Chrome no estaba corriendo"
killall node 2>/dev/null || echo "Node no estaba corriendo"
sleep 2

# 2. LIMPIEZA TOTAL DE SESIONES
echo "🧹 Limpiando sesiones previas..."
rm -rf wppconnect_tokens/*
rm -rf /tmp/.com.google.Chrome.*
rm -rf ~/.config/google-chrome/Default/
rm -rf ~/.local/share/google-chrome/Default/
rm -rf ~/.cache/google-chrome/Default/
rm -rf ~/.config/chromium/Default/
rm -rf ~/.cache/chromium/Default/

# 3. VERIFICAR CHROME
if ! command -v google-chrome-stable &> /dev/null; then
    echo "⚠️  Chrome no encontrado, instalando..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
    apt update && apt install -y google-chrome-stable
fi

# 4. CONFIGURAR VARIABLES DE ENTORNO
echo "🔧 Configurando variables de entorno..."
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
export PUPPETEER_CACHE_DIR="/tmp/puppeteer-cache"

# 5. LIMPIAR CACHE DE NODE
echo "🗑️  Limpiando cache de Node..."
npm cache clean --force

# 6. REINSTALAR DEPENDENCIAS
echo "📦 Reinstalando dependencias..."
rm -rf node_modules package-lock.json
npm install

# 7. CREAR DIRECTORIO TEMPORAL
echo "📁 Creando directorios temporales..."
mkdir -p /tmp/.com.google.Chrome
chmod 777 /tmp/.com.google.Chrome

# 8. VERIFICAR PERMISOS
echo "🔐 Verificando permisos..."
chmod -R 755 wppconnect_tokens/

# 9. MOSTRAR INSTRUCCIONES
echo ""
echo "✅ CONFIGURACIÓN COMPLETADA!"
echo "=========================================="
echo ""
echo "📱 SIGUE ESTOS PASOS EXACTOS:"
echo ""
echo "1. 📱 EN TU TELÉFONO:"
echo "   - Abre WhatsApp"
echo "   - Ve a: Configuración → Dispositivos vinculados"
echo "   - Desvincula TODOS los dispositivos"
echo ""
echo "2. 🔄 EN EL SERVIDOR:"
echo "   npm run dev"
echo ""
echo "3. 📲 ESCANEO DEL QR:"
echo "   - Abre navegador en modo INCOGNITO"
echo "   - Ve a: http://TU_SERVIDOR_IP:8080/session/start/session1"
echo "   - Escanea el QR en MENOS de 30 segundos"
echo "   - Mantén el navegador abierto hasta ver 'Session successfully paired'"
echo ""
echo "4. ✅ VERIFICACIÓN:"
echo "   curl http://localhost:8080/session/status/session1"
echo ""
echo "🚨 IMPORTANTE:"
echo "- NO uses el mismo número en WhatsApp Web normal"
echo "- NO uses el mismo número en tu móvil mientras escaneas"
echo "- El escaneo debe ser INMEDIATO después de limpiar"
echo ""
echo "Presiona ENTER cuando hayas desvinculado WhatsApp..."
read -p ""

# 10. INICIAR SERVIDOR
echo "🚀 Iniciando servidor..."
npm run dev