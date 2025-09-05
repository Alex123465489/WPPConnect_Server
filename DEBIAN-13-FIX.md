# Solución para Error DOM.describeNode en Debian 13

## Problema
Después de escanear el QR, aparece el error:
```
ProtocolError: Protocol error (DOM.describeNode): Cannot find context with specified id
```

## Causa Principal
Este error ocurre cuando Puppeteer pierde el contexto del DOM durante la inyección de `wapi.js`. Es común en Debian 13 debido a:
1. Incompatibilidades de Chrome/Chromium con la versión de Puppeteer
2. Problemas de memoria compartida (`/dev/shm`)
3. Falta de dependencias del sistema
4. Configuración inadecuada del navegador

## Solución Paso a Paso

### 1. Instalar Dependencias del Sistema
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias de Chrome
sudo apt install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libappindicator3-1 \
    libindicator7 \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    libgbm-dev \
    libxshmfence-dev \
    libglu1-mesa-dev \
    libglib2.0-0 \
    libnss3-dev \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxss1 \
    libgtk-3-0 \
    libx11-xcb1

# Instalar Chrome oficial
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable
```

### 2. Verificar Instalación de Chrome
```bash
# Verificar que Chrome esté instalado
which google-chrome-stable
google-chrome-stable --version

# Verificar permisos
ls -la /usr/bin/google-chrome*
```

### 3. Configurar Memoria Compartida
```bash
# Crear directorio temporal para memoria compartida
sudo mkdir -p /tmp/chrome-dev-shm
sudo chmod 1777 /tmp/chrome-dev-shm

# Añadir al /etc/fstab para persistencia
echo "tmpfs /tmp/chrome-dev-shm tmpfs rw,nosuid,nodev,size=2G 0 0" | sudo tee -a /etc/fstab
```

### 4. Copiar Configuración Optimizada
```bash
# Hacer backup de la configuración actual
cp src/config.ts src/config.ts.backup

# Copiar la configuración optimizada para Debian
cp config.debian-fix.ts src/config.ts
```

### 5. Limpiar Caché y Reinstalar Dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Reinstalar Puppeteer con Chrome específico
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable npm install
```

### 6. Verificar Permisos de Directorios
```bash
# Crear directorios necesarios
mkdir -p userDataDir
mkdir -p wppconnect_tokens
mkdir -p logs

# Dar permisos apropiados
chmod 755 userDataDir
chmod 755 wppconnect_tokens
chmod 755 logs
```

### 7. Variables de Entorno Opcionales
Crear archivo `.env`:
```bash
cat > .env << EOF
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
NODE_ENV=production
PUPPETEER_CACHE_DIR=/tmp/puppeteer-cache
EOF
```

### 8. Ejecutar con Permisos Apropiados
```bash
# Si usas puerto 80 o 443, necesitarás sudo
# Para puerto 21465 (puerto por defecto)
npm run dev

# O con PM2 para producción
npm install -g pm2
pm2 start dist/server.js --name wppconnect-server
```

## Solución Alternativa: Usar Chromium
Si Chrome oficial no funciona, puedes usar Chromium:

```bash
# Instalar Chromium
sudo apt install -y chromium-browser chromium-chromedriver

# Actualizar configuración
# En src/config.ts cambiar:
# executablePath: '/usr/bin/chromium-browser'
```

## Verificación Final
Después de aplicar estos cambios:

1. **Reiniciar el servidor**
2. **Limpiar sesiones previas**: `rm -rf userDataDir/*`
3. **Generar nuevo QR**
4. **Verificar logs**: `tail -f logs/wppconnect.log`

## Si el Problema Persiste

1. **Verificar versión de Node.js**:
   ```bash
   node --version  # Debe ser 18.x o superior
   ```

2. **Verificar dependencias**:
   ```bash
   npm ls puppeteer-core
   npm ls @wppconnect-team/wppconnect
   ```

3. **Ejecutar en modo debug**:
   ```bash
   DEBUG=puppeteer:* npm run dev
   ```

4. **Comprobar puertos**:
   ```bash
   netstat -tlnp | grep :21465
   ```

## Notas Importantes
- Esta configuración ha sido probada específicamente en Debian 13
- Asegúrate de tener suficiente RAM (mínimo 2GB)
- El error puede ocurrir temporalmente durante actualizaciones de WhatsApp Web
- Mantén actualizado el paquete `@wppconnect-team/wppconnect`

## Comandos de Diagnóstico
```bash
# Verificar sistema
lsb_release -a
uname -a

# Verificar recursos
free -h
df -h

# Verificar proceso de Chrome
ps aux | grep chrome

# Verificar logs del sistema
journalctl -u wppconnect-server -f
```