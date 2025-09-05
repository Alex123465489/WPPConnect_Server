import { CreateOptions } from '@wppconnect-team/wppconnect';

export default {
  createOptions: {
    session: 'session1',
    
    // 🔒 Anti-detection settings
    headless: true,
    devtools: false,
    useChrome: true,
    
    // 🎭 User-Agent realista
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // 📱 Viewport realista
    defaultViewport: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
    
    // 🛡️ Browser args ultra-stealth (40+ flags)
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-features=IsolateOrigins',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=SameSiteByDefaultCookies',
      '--disable-features=CookieDeprecationMessages',
      '--disable-ipc-flooding-protection',
      '--disable-component-update',
      '--disable-client-side-phishing-detection',
      '--force-webrtc-ip-handling-policy=default_public_interface_only',
      '--disable-background-networking',
      '--disable-features=OutOfBlinkCors',
      '--window-size=1366,768',
      '--disable-webgl',
      '--disable-features=WebRtcHideLocalIpsWithMdns',
      '--disable-features=WebRtcLocalIpsAllowedUrls',
      '--disable-component-extensions-with-background-pages',
      '--disable-plugins-discovery',
      '--disable-background-fetch',
      '--disable-features=HeavyAdPrivacyMitigations',
      '--disable-features=HeavyAdIntervention',
      '--disable-features=PrivacySandboxSettings4',
      '--disable-features=InterestCohortFeaturePolicy',
      '--disable-features=InterestCohortAPIOriginTrial',
      '--disable-features=TrustTokens',
      '--disable-features=FledgeInterestGroups',
      '--disable-features=FledgeInterestGroupAPI',
    ],
    
    // ⚙️ Puppeteer ultra-stealth options
    puppeteerOptions: {
      executablePath: '/usr/bin/google-chrome-stable',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--window-size=1366,768',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--force-webrtc-ip-handling-policy=default_public_interface_only',
        '--disable-webgl',
        '--disable-features=WebRtcHideLocalIpsWithMdns',
        '--disable-features=WebRtcLocalIpsAllowedUrls',
        '--disable-features=PrivacySandboxSettings4',
        '--disable-features=InterestCohortFeaturePolicy',
      ],
      timeout: 0,
      protocolTimeout: 0,
      slowMo: 50, // Reducción de velocidad para parecer más humano
    },
    
    // 🔄 Multi-device y seguridad
    multiDevice: true,
    authTimeoutMs: 90000,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 60000,
    
    // 📞 Webhook settings
    onMessage: true,
    onAck: true,
    onPresenceChanged: true,
    onParticipantsChanged: true,
    onReactionMessage: true,
    onPollResponse: true,
    onRevokedMessage: true,
    onLabelChanged: true,
    onDisconnected: true,
    onStateChanged: true,
    onStreamChanged: true,
    
    // 🗂️ Cache y performance
    cacheEnabled: false,
    disableWelcome: true,
    updatesLog: false,
    logLevel: 'error',
    
    // 🎨 Customización realista
    deviceName: 'Chrome Desktop',
    poweredBy: 'WPPConnect',
    
    // 🔒 Seguridad adicional
    autoClose: 0,
    skipSavePostman: true,
    skipBrokenMethodsCheck: true,
    
    // 📱 Device info ultra-realista
    device: {
      manufacturer: 'Google',
      model: 'Chrome',
      platform: 'Windows',
      os_version: '10',
      wa_version: '2.23.10.78',
    },
    
    // 🎯 Timing para evitar detección
    waitForLogin: true,
    waitForLoginTimeoutMs: 60000,
    
    // 🎭 Stealth options adicionales
    stealthOptions: {
      hideWebDriver: true,
      hideAutomation: true,
      mockWebGL: true,
      mockPlugins: true,
      mockLanguages: true,
      mockPlatform: true,
      mockUserAgent: true,
      mockPermissions: true,
    }
  }
};