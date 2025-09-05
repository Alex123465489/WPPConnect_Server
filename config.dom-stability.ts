/**
 * Configuración de Estabilización DOM para fix de ProtocolError DOM.resolveNode
 * Este archivo contiene configuraciones específicas para estabilizar la inyección de wapi.js
 */

export const domStabilityConfig = {
  // Configuración de espera para estabilidad DOM
  waitForSelector: 'div[data-testid="side"]',
  waitForTimeout: 45000,
  
  // Opciones de Puppeteer optimizadas para estabilidad DOM
  puppeteerOptions: {
    headless: false, // Temporal para debugging - cambiar a true después de verificar
    devtools: false,
    slowMo: 100, // Reducir velocidad para estabilidad
    defaultViewport: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false
    },
    waitForInitialPage: true,
    timeout: 60000,
    
    // Args específicos para estabilidad DOM
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-ipc-flooding-protection',
      '--enable-features=NetworkService,NetworkServiceLogging',
      '--disable-features=TranslateUI',
      '--disable-features=Translate',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
      '--disable-features=OutOfBlinkCors',
      '--disable-blink-features=AutomationControlled'
    ]
  },

  // Configuración de retry para inyección wapi.js
  wapiInjection: {
    maxRetries: 5,
    retryDelay: 3000,
    waitForReady: true,
    checkInterval: 500
  },

  // Opciones de estabilidad DOM
  domStability: {
    waitUntil: 'networkidle2',
    timeout: 45000,
    checkInterval: 200,
    domContentLoaded: true,
    networkIdleTimeout: 5000
  },

  // Configuración de navegador para estabilidad
  browserConfig: {
    cacheEnabled: false,
    userDataDir: '/tmp/puppeteer_dev_profile_dom_fix',
    ignoreDefaultArgs: ['--enable-automation'],
    handleSIGINT: false,
    handleSIGTERM: false,
    handleSIGHUP: false
  }
};

// Función auxiliar para esperar estabilidad DOM
export const waitForDOMStability = async (page, timeout = 45000) => {
  try {
    // Esperar a que el documento esté completamente cargado
    await page.waitForFunction(
      () => document.readyState === 'complete',
      { timeout }
    );

    // Esperar a que el selector principal esté presente
    await page.waitForSelector('div[data-testid="side"]', { timeout });

    // Esperar estabilidad de red
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Pequeña pausa adicional para asegurar estabilidad completa
    await page.waitForTimeout(2000);

    console.log('DOM estabilizado correctamente');
    return true;
  } catch (error) {
    console.error('Error esperando estabilidad DOM:', error);
    return false;
  }
};

// Función para verificar disponibilidad de wapi.js
export const checkWAPIReady = async (page, maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const isReady = await page.evaluate(() => {
        return typeof window.WAPI !== 'undefined' || 
               document.querySelector('script[src*="wapi.js"]') !== null;
      });
      
      if (isReady) {
        console.log('wapi.js está listo para inyección');
        return true;
      }
      
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(`Intento ${i + 1} fallido, reintentando...`);
      await page.waitForTimeout(3000);
    }
  }
  
  return false;
};