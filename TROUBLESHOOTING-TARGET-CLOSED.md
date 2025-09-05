# Solución para TargetCloseError: Protocol error (DOM.describeNode): Target closed

## Problema
Después de aplicar los cambios anteriores, ahora aparece un nuevo error más severo:
- `TargetCloseError: Protocol error (DOM.describeNode): Target closed`
- `wapi.js failed`
- El navegador/cierra durante la inyección de wapi.js

## Causas Principales
1. **Memoria insuficiente**: El navegador se queda sin memoria RAM
2. **Proceso del navegador muriendo**: Chrome/Chromium crashea
3. **Timeout muy agresivo**: Los timeouts son demasiado cortos
4. **Configuración de shared memory**: `/dev/shm` insuficiente
5. **Versiones incompatibles**: Incompatibilidad entre Puppeteer y Chrome

## Solución Inmediata

### 1. Verificar Recursos del Sistema
```bash
# Verificar memoria disponible
free -h

# Verificar espacio en disco
df -h

# Verificar procesos de Chrome activos
ps aux | grep chrome
```

### 2. Aumentar Shared Memory (Crítico para Docker/Debian)
```bash
# Si estás usando Docker, montar tmpfs para /dev/shm
docker run --shm-size=2g --tmpfs /tmp:size=1g ...

# O en docker-compose.yml
services:
  wppconnect-server:
    shm_size: 2g
    tmpfs:
      - /tmp:size=1g
```

### 3. Configuración de Memoria en src/config.ts
Actualiza tu configuración con estos parámetros de memoria:

```typescript
// Agregar estas opciones específicas de memoria
export default {
  createOptions: {
    browserArgs: [
      // ... args existentes ...
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images',
      '--disable-javascript-harmony-shipping',
      '--disable-backgrounding-occluded-windows',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--force-device-scale-factor=1',
      '--memory-pressure-off',
      '--max-old-space-size=4096',
      '--js-flags="--max-old-space-size=4096"',
      '--aggressive-cache-discard',
      '--memory-pressure-thresholds=57344,85196,114688',
      '--memory-pressure-off'
    ],
    puppeteerOptions: {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: '/usr/bin/google-chrome-stable',
      timeout: 0,
      protocolTimeout: 0,
      // Agregar estas opciones de memoria
      defaultViewport: null,
      dumpio: true, // Para ver logs de Chrome
    }
  }
}
```

### 4. Limpiar Sesiones Anteriores
```bash
# Limpiar directorios de datos de usuario
rm -rf wppconnect_tokens/*
rm -rf /tmp/.com.google.Chrome.*
rm -rf ~/.config/google-chrome/Default/

# Limpiar caché de npm
npm cache clean --force
```

### 5. Verificar Versión de Node.js
```bash
# Versión recomendada: 16.x o 18.x
node --version

# Si necesitas cambiar de versión (usando nvm)
nvm install 18
nvm use 18
```

### 6. Instalar Chrome Oficial (si no está instalado)
```bash
# Instalar Google Chrome oficial
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
apt update
apt install -y google-chrome-stable

# Verificar instalación
which google-chrome-stable
google-chrome-stable --version
```

### 7. Variables de Entorno Críticas
```bash
# Establecer estas variables antes de ejecutar
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Para Docker
export PUPPETEER_ARGS="--no-sandbox,--disable-dev-shm-usage,--disable-gpu"
```

### 8. Script de Inicio Seguro
Crea un archivo `start-safe.sh`:

```bash
#!/bin/bash
# start-safe.sh - Inicio seguro con configuración de memoria

# Limpiar procesos anteriores
pkill -f chrome
pkill -f node

# Variables de entorno
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# Limpiar temporales
rm -rf /tmp/.com.google.Chrome.*
rm -rf wppconnect_tokens/*

# Iniciar servidor
npm run dev
```

```bash
# Hacer ejecutable
chmod +x start-safe.sh
./start-safe.sh
```

### 9. Solución Docker Específica
Si usas Docker, actualiza tu `docker-compose.yml`:

```yaml
version: '3.8'
services:
  wppconnect-server:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - NODE_OPTIONS=--max-old-space-size=4096
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
    volumes:
      - ./wppconnect_tokens:/app/wppconnect_tokens
    shm_size: 2g
    tmpfs:
      - /tmp:size=1g
    cap_add:
      - SYS_ADMIN
    security_opt:
      - seccomp:unconfined
```

### 10. Debugging Avanzado

#### Habilitar logs detallados:
```bash
# Agregar a tu código de inicio
DEBUG=puppeteer:* npm run dev

# O en package.json
"scripts": {
  "dev:debug": "DEBUG=puppeteer:* NODE_OPTIONS='--max-old-space-size=4096' nodemon src/index.ts"
}
```

#### Verificar configuración actual:
```bash
# Crear script de verificación
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  console.log('Browser launched successfully');
  await browser.close();
})();
"
```

## Comandos de Diagnóstico

```bash
# Verificar todos los puntos
./diagnostic.sh
```

Crea este script de diagnóstico:

```bash
#!/bin/bash
echo "=== Diagnóstico WPPConnect Server ==="
echo "1. Node version: $(node --version)"
echo "2. NPM version: $(npm --version)"
echo "3. Chrome path: $(which google-chrome-stable)"
echo "4. Chrome version: $(google-chrome-stable --version 2>/dev/null || echo 'No encontrado')"
echo "5. Memoria libre: $(free -h | grep Mem | awk '{print $7}')"
echo "6. Espacio en disco: $(df -h / | tail -1 | awk '{print $4}')"
echo "7. Procesos de Chrome: $(pgrep chrome | wc -l)"
echo "8. Variables de entorno:"
echo "   NODE_OPTIONS: $NODE_OPTIONS"
echo "   PUPPETEER_EXECUTABLE_PATH: $PUPPETEER_EXECUTABLE_PATH"
```

## Solución Rápida

Si necesitas una solución inmediata:

1. **Ejecutar estos comandos en orden:**
```bash
# 1. Detener todo
pkill -f chrome
pkill -f node

# 2. Limpiar
rm -rf wppconnect_tokens/*
npm cache clean --force

# 3. Configurar variables
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# 4. Reinstalar dependencias
npm install

# 5. Iniciar con timeout extendido
npm run dev
```

2. **Si usas Docker:**
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

## Notas Importantes

- **Memoria mínima**: 2GB RAM disponible
- **Chrome vs Chromium**: Usar Google Chrome oficial, no Chromium
- **Docker**: Siempre usar `--shm-size=2g` o más
- **Monitoreo**: Usar `htop` para ver consumo de memoria
- **Logs**: Revisar `/var/log/syslog` para errores del sistema

## Próximos Pasos

1. Ejecutar el diagnóstico completo
2. Aplicar la configuración de memoria
3. Verificar con el script de inicio seguro
4. Monitorear logs durante 5-10 minutos después del inicio

Si el problema persiste, proporcionar:
- Output completo del script de diagnóstico
- Logs del sistema (`dmesg | tail -50`)
- Configuración actual de `src/config.ts`