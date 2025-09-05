# 🖥️ Solución SSH para Servidor Debian - TargetCloseError

## Entorno Actual
- **Cliente**: Windows (SSH)
- **Servidor**: Debian (sin Docker)
- **Error**: `TargetCloseError: Protocol error (DOM.describeNode): Target closed`

## 📋 Pasos Inmediatos en el Servidor Debian

### 1. Conectarse al Servidor Debian
```bash
# Desde tu terminal Windows (PowerShell/CMD)
ssh root@TU_SERVIDOR_IP
```

### 2. Ejecutar Diagnóstico Completo
```bash
# Copiar y pegar ESTO completo en tu terminal SSH:

# === DIAGNÓSTICO INICIAL ===
echo "=== DIAGNÓSTICO DEL SERVIDOR DEBIAN ==="
echo "📊 Sistema: $(lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "💾 Memoria total: $(free -h | grep Mem | awk '{print $2}')"
echo "💾 Memoria libre: $(free -h | grep Mem | awk '{print $7}')"
echo "💽 Espacio en disco: $(df -h / | tail -1 | awk '{print $4}')"
echo "🟢 Node.js: $(node --version)"
echo "📦 NPM: $(npm --version)"
echo "🔍 Chrome: $(google-chrome-stable --version 2>/dev/null || echo 'No instalado')"
echo ""

# Verificar si Chrome está instalado
if ! command -v google-chrome-stable &> /dev/null; then
    echo "❌ Chrome no está instalado. Instalando..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list
    apt update
    apt install -y google-chrome-stable
fi

# Verificar dependencias del sistema
echo "🔧 Verificando dependencias..."
apt update
apt install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo1 libgtk-3-0 libgdk-pixbuf2.0-0

# Limpiar procesos Chrome antiguos
echo "🧹 Limpiando procesos Chrome..."
pkill -f chrome || true
sleep 2

# Limpiar sesiones y caché
echo "🧹 Limpiando sesiones y caché..."
rm -rf wppconnect_tokens/*
rm -rf /tmp/.com.google.Chrome.*
rm -rf ~/.config/google-chrome/Default/
npm cache clean --force

# Configurar variables de entorno permanentes
echo "🌍 Configurando variables de entorno..."
echo "export NODE_OPTIONS='--max-old-space-size=4096'" >> ~/.bashrc
echo "export PUPPETEER_EXECUTABLE_PATH='/usr/bin/google-chrome-stable'" >> ~/.bashrc
echo "export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true" >> ~/.bashrc
source ~/.bashrc

# Instalar/Reinstalar dependencias
echo "📦 Reinstalando dependencias..."
npm install

# Verificar configuración actual
echo "✅ Diagnóstico completado"
```

### 3. Iniciar el Servidor con Configuración Optimizada
```bash
# Después del diagnóstico, ejecuta:

# Establecer variables para esta sesión
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Iniciar servidor con logs detallados
npm run dev
```

### 4. Monitoreo en Tiempo Real (Segunda Terminal)
```bash
# Abre UNA SEGUNDA terminal SSH y ejecuta:
ssh root@TU_SERVIDOR_IP

# Monitorear memoria y procesos
echo "=== MONITOREO EN TIEMPO REAL ==="
watch -n 2 'echo "Memoria:"; free -h; echo ""; echo "Procesos Chrome:"; pgrep chrome | wc -l; echo ""; echo "CPU:"; top -bn1 | grep "Cpu(s)"'
```

### 5. Solución Rápida si el Error Persiste
```bash
# Si aparece el error TargetCloseError de nuevo:

# 1. Detener todo
pkill -f chrome
pkill -f node

# 2. Verificar memoria disponible
free -h

# 3. Si la memoria es < 2GB, aumentar swap:
swapon --show
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 4. Limpiar y reiniciar
rm -rf wppconnect_tokens/*
npm run dev
```

## 🔧 Script de Diagnóstico Completo

Guarda este archivo como `diagnostic-debian.sh` en tu servidor:

```bash
#!/bin/bash
# diagnostic-debian.sh

echo "🚀 DIAGNÓSTICO COMPLETO WPPConnect Server"
echo "======================================"
echo ""

# Información del sistema
echo "📊 Sistema: $(lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "🖥️  Kernel: $(uname -r)"
echo ""

# Memoria
echo "💾 MEMORIA:"
free -h
echo ""

# Swap
echo "💿 SWAP:"
swapon --show
echo ""

# CPU
echo "⚡ CPU:"
lscpu | grep "Model name"
echo "Núcleos: $(nproc)"
echo ""

# Espacio en disco
echo "💽 DISCO:"
df -h /
echo ""

# Chrome
echo "🔍 CHROME:"
if command -v google-chrome-stable &> /dev/null; then
    echo "✅ Versión: $(google-chrome-stable --version)"
    echo "📍 Ruta: $(which google-chrome-stable)"
else
    echo "❌ Chrome no instalado"
fi
echo ""

# Node.js
echo "🟢 NODE.JS:"
echo "Versión: $(node --version)"
echo "NPM: $(npm --version)"
echo ""

# Procesos activos
echo "📈 PROCESOS:"
echo "Chrome: $(pgrep chrome | wc -l) procesos"
echo "Node: $(pgrep node | wc -l) procesos"
echo ""

# Verificar dependencias
echo "🔧 DEPENDENCIAS DEL SISTEMA:"
missing=0
for pkg in libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo1 libgtk-3-0 libgdk-pixbuf2.0-0; do
    if ! dpkg -l | grep -q "^ii  $pkg"; then
        echo "❌ Falta: $pkg"
        ((missing++))
    fi
done
if [ $missing -eq 0 ]; then
    echo "✅ Todas las dependencias están instaladas"
fi
echo ""

# Variables de entorno
echo "🌍 VARIABLES DE ENTORNO:"
echo "NODE_OPTIONS: ${NODE_OPTIONS:-'No configurado'}"
echo "PUPPETEER_EXECUTABLE_PATH: ${PUPPETEER_EXECUTABLE_PATH:-'No configurado'}"
echo ""

# Puerto 8080
echo "🌐 PUERTO 8080:"
if netstat -tuln | grep -q ":8080"; then
    echo "⚠️  Puerto 8080 está en uso"
    netstat -tuln | grep ":8080"
else
    echo "✅ Puerto 8080 disponible"
fi

echo ""
echo "✅ Diagnóstico completado"
```

## 📋 Comandos para Ejecutar en Secuencia

### Paso 1: Subir el script al servidor
```bash
# Desde tu terminal Windows (PowerShell)
scp DEBIAN-SERVER-FIX.sh root@TU_SERVIDOR_IP:/root/
```

### Paso 2: Ejecutar el script
```bash
# En tu terminal SSH (servidor Debian)
chmod +x /root/DEBIAN-SERVER-FIX.sh
/root/DEBIAN-SERVER-FIX.sh
```

### Paso 3: Verificar y monitorear
```bash
# Después de ejecutar el script:
source ~/.bashrc
npm run dev

# En otra terminal SSH:
./diagnostic-debian.sh
```

## 🎯 Solución Inmediata (Comandos Copiar-Pegar)

```bash
# TODO EN UNO - Copiar y pegar en tu terminal SSH:

# 1. Diagnóstico
./diagnostic-debian.sh

# 2. Si Chrome no está instalado
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list
apt update && apt install -y google-chrome-stable

# 3. Instalar dependencias
apt install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo1 libgtk-3-0 libgdk-pixbuf2.0-0

# 4. Limpiar y configurar
pkill -f chrome
rm -rf wppconnect_tokens/*
rm -rf /tmp/.com.google.Chrome.*
npm cache clean --force
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
npm install

# 5. Iniciar
npm run dev
```

## 📊 Monitoreo Continuo

Para mantener monitoreo activo:

```bash
# Crear alias para monitoreo
alias monitor-wpp='watch -n 3 "echo \"=== WPPConnect Monitor ===\"; echo \"Memoria libre: \$(free -h | grep Mem | awk '\''{print \$7}'\'')\"; echo \"Chrome procesos: \$(pgrep chrome | wc -l)\"; echo \"Node procesos: \$(pgrep node | wc -l)\"; echo \"Puerto 8080: \$(netstat -tuln | grep :8080 | wc -l)\""'

# Usar el alias
cd ~/wppconnect-server
monitor-wpp
```

## 🚨 Si el Error Persiste

1. **Verificar logs del sistema:**
   ```bash
   tail -f /var/log/syslog
   ```

2. **Verificar logs de Chrome:**
   ```bash
   DEBUG=puppeteer:* npm run dev 2>&1 | tee debug.log
   ```

3. **Verificar memoria con htop:**
   ```bash
   apt install htop
   htop
   ```

4. **Verificar si es problema de permisos:**
   ```bash
   ls -la wppconnect_tokens/
   chmod 755 wppconnect_tokens/
   ```

## ✅ Resumen de Comandos

```bash
# SECUENCIA COMPLETA PARA EJECUTAR EN TU TERMINAL SSH:

# 1. Diagnóstico
wget -q -O - https://raw.githubusercontent.com/tu-script/diagnostic-debian.sh | bash

# 2. Instalación de dependencias
apt update && apt install -y google-chrome-stable libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo1 libgtk-3-0 libgdk-pixbuf2.0-0

# 3. Configuración
pkill -f chrome
rm -rf wppconnect_tokens/*
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
npm install

# 4. Inicio
npm run dev
```

## 📞 Soporte Rápido

Si después de todo el error persiste, ejecuta:

```bash
# Comando de diagnóstico completo
echo "=== REPORTE DE ERROR ===" > error-report.txt
echo "Fecha: $(date)" >> error-report.txt
echo "Sistema: $(lsb_release -d)" >> error-report.txt
echo "Memoria: $(free -h)" >> error-report.txt
echo "Chrome: $(google-chrome-stable --version)" >> error-report.txt
echo "Procesos: $(pgrep chrome | wc -l)" >> error-report.txt
echo "Logs recientes:" >> error-report.txt
tail -20 /var/log/syslog >> error-report.txt
cat error-report.txt
```

Comparte el contenido de `error-report.txt` para análisis adicional.