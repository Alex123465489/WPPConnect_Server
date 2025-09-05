/* eslint-disable prettier/prettier */
import { ServerOptions } from './src/types/ServerOptions';

/**
 * Configuración optimizada para Debian 13
 * Resuelve el error: Protocol error (DOM.describeNode): Cannot find context with specified id
 */
export default {
  secretKey: 'THISISMYSECURETOKEN',
  host: 'http://localhost',
  port: '21465',
  deviceName: 'WppConnect',
  poweredBy: 'WPPConnect-Server',
  startAllSession: true,
  tokenStoreType: 'file',
  maxListeners: 15,
  customUserDataDir: './userDataDir/',
  webhook: {
    url: null,
    autoDownload: true,
    uploadS3: false,
    readMessage: true,
    allUnreadOnStart: false,
    listenAcks: true,
    onPresenceChanged: true,
    onParticipantsChanged: true,
    onReactionMessage: true,
    onPollResponse: true,
    onRevokedMessage: true,
    onLabelUpdated: true,
    onSelfMessage: false,
    ignore: ['status@broadcast'],
  },
  websocket: {
    autoDownload: false,
    uploadS3: false,
  },
  chatwoot: {
    sendQrCode: true,
    sendStatus: true,
  },
  archive: {
    enable: false,
    waitTime: 10,
    daysToArchive: 45,
  },
  log: {
    level: 'silly',
    logger: ['console', 'file'],
  },
  createOptions: {
    browserArgs: [
      // Seguridad y sandbox
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',

      // Memoria y rendimiento
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--max_old_space_size=4096',

      // Cache y red
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',

      // Extensions y servicios
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--disable-features=TranslateUI',

      // UI y renderizado
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
      // eslint-disable-next-line prettier/prettier

      // Estabilidad para Debian
      '--disable-features=LeakyPeeker',
      '--disable-breakpad',
      '--disable-component-update',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-client-side-phishing-detection',
      '--enable-simple-cache-backend',
      '--enable-tcp-fast-open',
      '--enable-features=NetworkService,NetworkServiceLogging',
      '--force-color-profile=srgb',
      '--disable-webgl',
      '--disable-threaded-scrolling',
      '--disable-smooth-scrolling',
      '--disable-composited-antialiasing',
      '--disable-canvas-aa',
      '--disable-2d-canvas-clip-aa',
      '--disable-gl-drawing-for-tests',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    headless: true,
    devtools: false,

    // Opciones adicionales de espera
    waitForLogin: true,
    waitForPageLoad: true,

    // Timeouts extendidos
    defaultViewport: null,
    slowMo: 50,
    timeout: 0,

    // Configuración de Puppeteer específica
    puppeteerOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
      headless: 'new' as const,
      executablePath: '/usr/bin/google-chrome-stable', // Ruta específica para Debian
    },

    linkPreviewApiServers: null,
  },
  mapper: {
    enable: false,
    prefix: 'tagone-',
  },
  db: {
    mongodbDatabase: 'tokens',
    mongodbCollection: '',
    mongodbUser: '',
    mongodbPassword: '',
    mongodbHost: '',
    mongoIsRemote: true,
    mongoURLRemote: '',
    mongodbPort: 27017,
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,
    redisPrefix: 'docker',
  },
  aws_s3: {
    region: 'sa-east-1' as any,
    access_key_id: null,
    secret_key: null,
    defaultBucketName: null,
    endpoint: null,
    forcePathStyle: null,
  },
} as unknown as ServerOptions;
