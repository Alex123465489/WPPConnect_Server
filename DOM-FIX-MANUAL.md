# FIX RÁPIDO: ProtocolError DOM.resolveNode

## Error Actual
`ProtocolError: Protocol error (DOM.resolveNode): Node with given id does not belong to the document`

## Solución Inmediata - Comandos Directos

### 1. LIMPIAR TODO (Ejecutar en orden)
```bash
# Parar procesos
pkill -f "node.*index.js" || true

# Limpiar sesiones corruptas
rm -rf wppconnect_tokens/*
rm -rf ~/.config/google-chrome/Default/
rm -rf /tmp/.com.google.Chrome.*
rm -rf /tmp/puppeteer_dev_profile-*

# Limpiar caché de Node
npm cache clean --force
```

### 2. REINICIAR CON CONFIGURACIÓN ACTUALIZADA
```bash
# Variables de entorno para estabilidad
export NODE_OPTIONS="--max-old-space-size=4096"

# Reinstalar dependencias limpias
rm -rf node_modules package-lock.json
npm install

# Iniciar con configuración de estabilización
npm start
```

### 3. CONFIGURACIÓN YA APLICADA
Los siguientes cambios ya están implementados en `src/config.ts`:
- ✅ Tiempo de espera extendido: 45-60 segundos
- ✅ SlowMo: 100ms para estabilidad
- ✅ Args anti-DOM corruption
- ✅ Retry automático para inyección wapi.js

### 4. PASOS DE VERIFICACIÓN

#### Si el error persiste:
1. **Abrir Chrome manualmente** y verificar WhatsApp Web carga
2. **Ejecutar con debugging**:
   ```bash
   DEBUG=puppeteer:* npm start
   ```

3. **Test rápido** (copiar y pegar):
   ```bash
   node -e "
   const puppeteer = require('puppeteer');
   (async () => {
     const browser = await puppeteer.launch({ headless: false });
     const page = await browser.newPage();
     await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2', timeout: 60000 });
     await page.waitForSelector('div[data-testid=side]', { timeout: 45000 });
     console.log('✅ DOM estable y listo');
     await browser.close();
   })();
   "
   ```

### 5. NOTAS CRÍTICAS
- **headless: false** está activado temporalmente para verificar la carga
- Después de confirmar que funciona, cambiar a `headless: true` en `src/config.ts`
- Este error es diferente al "Session Unpaired" - es un problema de timing DOM

### 6. CAMBIO A HEADLESS (Después de verificar)
Cuando todo funcione correctamente, cambiar línea 159 en `src/config.ts`:
```typescript
headless: true, // Cambiar de false a true
```

## Resumen
1. Ejecutar comandos de limpieza
2. Iniciar con configuración actualizada
3. Verificar carga en Chrome
4. Cambiar a headless cuando esté estable