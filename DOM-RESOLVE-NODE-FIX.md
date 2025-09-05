# FIX: ProtocolError DOM.resolveNode - Error de Inyección wapi.js

## Descripción del Error
Este error ocurre cuando Puppeteer intenta inyectar `wapi.js` pero falla con:
```
ProtocolError: Protocol error (DOM.resolveNode): Node with given id does not belong to the document
```

## Causas Principales
1. **Página no completamente cargada** antes de inyectar wapi.js
2. **Elementos DOM inestables** durante la inyección
3. **Problemas de sincronización** entre Puppeteer y WhatsApp Web
4. **Estado de navegador corrupto** o caché dañada

## Solución Inmediata - Comandos Manuales

### 1. Limpiar Sesión y Caché
```bash
# Limpiar tokens y sesiones anteriores
rm -rf wppconnect_tokens/*
rm -rf ~/.config/google-chrome/Default/
rm -rf /tmp/.com.google.Chrome.*
```

### 2. Reiniciar con Configuración de Estabilización
```bash
# Variables de entorno para estabilidad
export NODE_OPTIONS="--max-old-space-size=4096"
export PUPPETEER_CACHE_DIR="/tmp/puppeteer-cache"

# Limpiar caché de Node
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 3. Configuración de Espera Activa
Agregar estas opciones a tu configuración actual:

## Archivo de Configuración Actualizado

### Actualizar `src/config.ts` con Estabilización DOM:

```typescript
// Agregar estas opciones específicas para DOM stability
export default {
  // ... configuración existente ...
  
  // Opciones de estabilización DOM
  waitForSelector: 'div[data-testid="side"]',
  waitForTimeout: 30000,
  domStability: {
    waitUntil: 'networkidle2',
    timeout: 30000,
    checkInterval: 100
  },
  
  // Puppeteer options mejorados para DOM
  puppeteerOptions: {
    headless: false, // Temporal para debugging
    devtools: false,
    args: [
      // ... args existentes ...
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--enable-features=NetworkService,NetworkServiceLogging'
    ],
    defaultViewport: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false
    },
    slowMo: 100, // Más lento para estabilidad
    waitForInitialPage: true
  },
  
  // Opciones de retry para inyección wapi.js
  wapiInjection: {
    maxRetries: 5,
    retryDelay: 2000,
    waitForReady: true
  }
};
```

## Secuencia de Inicio Segura

### Comandos en orden específico:

```bash
# 1. Parar cualquier proceso activo
pkill -f "node.*index.js" || true

# 2. Limpiar directorios temporales
rm -rf /tmp/.com.google.Chrome.*
rm -rf /tmp/puppeteer_dev_profile-*

# 3. Iniciar con configuración de debug
DEBUG=puppeteer:* npm start
```

## Verificación Paso a Paso

### 1. Verificar WhatsApp Web carga completamente:
- Abrir Chrome manualmente
- Ir a web.whatsapp.com
- Confirmar que carga sin errores

### 2. Test de Inyección Manual:
```bash
# Test rápido de conexión
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });
  console.log('Página cargada');
  await page.waitForSelector('div[data-testid=side]', { timeout: 30000 });
  console.log('Selector encontrado');
  await browser.close();
})();
"
```

## Solución Alternativa - Retry Automático

### Crear `dom-stability-fix.js`:

```javascript
// Agregar al inicio de tu aplicación
const fixDOMStability = async (page) => {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
  
  // Esperar a que DOM esté completamente estable
  await page.waitForFunction(
    () => document.readyState === 'complete' && 
         document.querySelector('div[data-testid="side"]') !== null,
    { timeout: 30000 }
  );
  
  // Pequeña pausa adicional para estabilidad
  await new Promise(resolve => setTimeout(resolve, 2000));
};

module.exports = fixDOMStability;
```

## Resumen de Acciones
1. **Limpiar** caché y sesiones corruptas
2. **Actualizar** configuración con estabilización DOM
3. **Iniciar** con debugging activado
4. **Verificar** carga completa antes de inyección
5. **Retry** automático si falla inicial

## Notas Importantes
- Este error es diferente al "Session Unpaired" previo
- Indica problemas de timing en la inyección de wapi.js
- La solución se centra en estabilizar el DOM antes de inyectar
- Puede requerir varios intentos de inicio inicial