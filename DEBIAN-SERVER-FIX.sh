#!/bin/bash
# Debian Server Fix Script - TargetCloseError Solution

echo "=== Diagnóstico del Servidor Debian ==="
echo ""

# 1. Verificar sistema operativo
echo "📊 Sistema: $(lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"

# 2. Verificar memoria
echo "💾 Memoria disponible:"
free -h
echo ""

# 3. Verificar espacio en disco
echo "💽 Espacio en disco:"
df -h /
echo ""

# 4. Verificar Chrome
echo "🔍 Google Chrome:"
if command -v google-chrome-stable &> /dev/null; then
    echo "✅ Chrome instalado: $(google-chrome-stable --version)"
else
    echo "❌ Chrome no encontrado - instalando..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list
    apt update
    apt install -y google-chrome-stable
fi
echo ""

# 5. Verificar Node.js
echo "🟢 Node.js: $(node --version)"
echo "📦 NPM: $(npm --version)"
echo ""

# 6. Verificar procesos Chrome activos
echo "🔍 Procesos Chrome activos: $(pgrep chrome | wc -l)"
if [ $(pgrep chrome | wc -l) -gt 0 ]; then
    echo "⚠️  Matando procesos Chrome antiguos..."
    pkill -f chrome
    sleep 2
fi
echo ""

# 7. Verificar /dev/shm
echo "📏 Shared Memory (/dev/shm):"
df -h /dev/shm
echo ""

# 8. Limpiar sesiones antiguas
echo "🧹 Limpiando sesiones antiguas..."
rm -rf wppconnect_tokens/*
rm -rf /tmp/.com.google.Chrome.*
rm -rf ~/.config/google-chrome/Default/
echo "✅ Limpieza completada"
echo ""

# 9. Verificar dependencias del sistema
echo "🔧 Verificando dependencias del sistema..."
missing_deps=()
for dep in libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo1 libgtk-3-0 libgdk-pixbuf2.0-0; do
    if ! dpkg -l | grep -q "^ii  $dep"; then
        missing_deps+=("$dep")
    fi
done

if [ ${#missing_deps[@]} -gt 0 ]; then
    echo "❌ Dependencias faltantes: ${missing_deps[*]}"
    echo "Instalando dependencias..."
    apt update
    apt install -y "${missing_deps[@]}"
else
    echo "✅ Todas las dependencias están instaladas"
fi
echo ""

# 10. Configurar variables de entorno
echo "🌍 Configurando variables de entorno..."
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_ARGS="--no-sandbox,--disable-dev-shm-usage,--disable-gpu"

echo "export NODE_OPTIONS='--max-old-space-size=4096'" >> ~/.bashrc
echo "export PUPPETEER_EXECUTABLE_PATH='/usr/bin/google-chrome-stable'" >> ~/.bashrc
echo "export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true" >> ~/.bashrc

echo "✅ Variables de entorno configuradas"
echo ""

# 11. Limpiar caché de npm
echo "🗑️  Limpiando caché de npm..."
npm cache clean --force
echo ""

# 12. Reinstalar dependencias
echo "📦 Reinstalando dependencias..."
npm install
echo ""

# 13. Crear archivo de configuración optimizado
echo "⚙️  Creando configuración optimizada..."
cat > config.optimized.json << 'EOF'
{
  "createOptions": {
    "browserArgs": [
      "--disable-web-security",
      "--no-sandbox",
      "--disable-web-security",
      "--aggressive-cache-discard",
      "--disable-cache",
      "--disable-application-cache",
      "--disable-offline-load-stale-cache",
      "--disk-cache-size=0",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-first-run",
      "--safebrowsing-disable-auto-update",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-accelerated-2d-canvas",
      "--no-zygote",
      "--single-process",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--disable-background-networking",
      "--enable-features=NetworkService",
      "--force-color-profile=srgb",
      "--disable-extensions-http-throttling",
      "--disable-component-extensions-with-background-pages"
    ],
    "puppeteerOptions": {
      "headless": "new",
      "executablePath": "/usr/bin/google-chrome-stable",
      "timeout": 0,
      "protocolTimeout": 0,
      "defaultViewport": null,
      "dumpio": true,
      "args": [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--memory-pressure-off",
        "--max-old-space-size=4096"
      ]
    }
  }
}
EOF

echo "✅ Configuración optimizada creada"
echo ""

# 14. Instrucciones finales
echo "🎯 INSTRUCCIONES FINALES:"
echo ""
echo "1. Ejecuta estos comandos para iniciar el servidor:"
echo "   source ~/.bashrc"
echo "   npm run dev"
echo ""
echo "2. Si el error persiste, ejecuta:"
echo "   tail -f /var/log/syslog"
echo "   # En otra terminal:"
echo "   htop"
echo ""
echo "3. Para ver logs detallados de Chrome:"
echo "   DEBUG=puppeteer:* npm run dev"
echo ""
echo "✅ Diagnóstico completo realizado"
echo "📊 Revisa la memoria disponible antes de iniciar"