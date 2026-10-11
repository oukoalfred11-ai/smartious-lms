/**
 * Smartious for Windows — an Electron shell around the live portal.
 * ============================================================
 * The window loads https://smartioushomeschool.com/portal, so every web
 * deploy reaches the desktop app at once. This file adds what a browser
 * tab can't give: its own window and taskbar icon, remembered size and
 * position, camera/mic/screen-share for live classes without prompts on
 * every visit, a proper screen picker, native downloads and an offline
 * screen.
 */
const {
  app, BrowserWindow, shell, session, desktopCapturer, ipcMain, Menu, screen,
} = require('electron')
const path = require('path')
const fs = require('fs')

const HOME = 'https://smartioushomeschool.com/portal'
const APP_HOSTS = ['smartioushomeschool.com', 'www.smartioushomeschool.com']
// Payment pages must open inside the app so the return redirect lands here.
const IN_APP_HOSTS = [...APP_HOSTS, 'checkout.paystack.com', 'paystack.com', 'standard.paystack.co']
const isHost = (url, hosts) => {
  try {
    const h = new URL(url).hostname
    return hosts.some(x => h === x || h.endsWith('.' + x))
  } catch { return false }
}

app.setAppUserModelId('com.smartious.homeschool') // taskbar grouping + notifications

if (!app.requestSingleInstanceLock()) app.quit()

// ── Window position memory ──────────────────────────────────
const stateFile = () => path.join(app.getPath('userData'), 'window-state.json')
function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(stateFile(), 'utf8'))
    const visible = screen.getAllDisplays().some(d => {
      const a = d.workArea
      return s.x < a.x + a.width && s.x + s.width > a.x && s.y < a.y + a.height && s.y + s.height > a.y
    })
    return visible ? s : { width: s.width, height: s.height, maximized: s.maximized }
  } catch { return { width: 1360, height: 860 } }
}
function saveState(win) {
  try {
    const b = win.getNormalBounds()
    fs.writeFileSync(stateFile(), JSON.stringify({ ...b, maximized: win.isMaximized() }))
  } catch {}
}

let main

function createWindow() {
  const st = loadState()
  main = new BrowserWindow({
    x: st.x, y: st.y, width: st.width || 1360, height: st.height || 860,
    minWidth: 380, minHeight: 560,
    title: 'Smartious',
    backgroundColor: '#FBFAF5',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  })
  if (st.maximized) main.maximize()

  const ua = main.webContents.getUserAgent()
  main.webContents.setUserAgent(`${ua} SmartiousDesktop/${app.getVersion()}`)

  main.once('ready-to-show', () => main.show())
  // The page calls smartiousDesktop.ready() after its first paint; show by
  // then at the latest even if ready-to-show was slow.
  ipcMain.on('sm:ready', () => { if (!main.isVisible()) main.show() })

  for (const ev of ['resize', 'move', 'close']) main.on(ev, () => saveState(main))

  // Links: our pages (and payment) stay in the app, everything else opens
  // in the user's browser.
  main.webContents.setWindowOpenHandler(({ url }) => {
    if (isHost(url, APP_HOSTS)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true, backgroundColor: '#FBFAF5', width: 1280, height: 820,
          icon: path.join(__dirname, '..', 'build', 'icon.png'),
          webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
        },
      }
    }
    if (/^https?:|^mailto:|^tel:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  main.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('file:') || isHost(url, IN_APP_HOSTS)) return
    e.preventDefault()
    if (/^https?:|^mailto:|^tel:/.test(url)) shell.openExternal(url)
  })

  // Offline / server unreachable → branded retry screen.
  main.webContents.on('did-fail-load', (_e, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3 /* aborted, e.g. a redirect */) return
    if (String(url).startsWith('file:')) return
    main.loadFile(path.join(__dirname, 'offline.html'))
  })

  // Mouse back button / Alt+Left: let the portal close a drawer or step back
  // to its dashboard first (see frontend/src/lib/appShell.js), then history.
  main.on('app-command', (_e, cmd) => { if (cmd === 'browser-backward') goBack() })
  main.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return
    if (input.alt && input.key === 'ArrowLeft') { e.preventDefault(); goBack() }
    if (input.control && input.shift && input.key.toLowerCase() === 'r') { e.preventDefault(); main.webContents.reloadIgnoringCache() }
  })

  main.loadURL(HOME)
}

async function goBack() {
  const wc = main?.webContents
  if (!wc) return
  try {
    const handled = await wc.executeJavaScript(
      `(() => { const e = new CustomEvent('sm-back', { cancelable: true }); dispatchEvent(e); return e.defaultPrevented })()`)
    if (!handled && wc.navigationHistory.canGoBack()) wc.navigationHistory.goBack()
  } catch {}
}

// ── Permissions: live classes need camera, mic and screen share ──
function setupPermissions() {
  const ses = session.defaultSession
  const ALLOWED = new Set([
    'media', 'display-capture', 'notifications', 'fullscreen',
    'clipboard-read', 'clipboard-sanitized-write', 'pointerLock',
  ])
  const trusted = (wc, origin) => isHost(origin || wc?.getURL?.() || '', APP_HOSTS)
  ses.setPermissionRequestHandler((wc, permission, cb, details) =>
    cb(ALLOWED.has(permission) && trusted(wc, details?.requestingUrl)))
  ses.setPermissionCheckHandler((wc, permission, origin) =>
    ALLOWED.has(permission) && trusted(wc, origin))

  // getDisplayMedia(): show our own picker of screens and windows.
  ses.setDisplayMediaRequestHandler(async (request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'], thumbnailSize: { width: 320, height: 200 }, fetchWindowIcons: true,
      })
      const choice = await pickSource(sources)
      if (!choice) return callback({})
      callback({ video: choice, audio: request.audioRequested ? 'loopback' : undefined })
    } catch {
      callback({})
    }
  })
}

function pickSource(sources) {
  return new Promise((resolve) => {
    const picker = new BrowserWindow({
      parent: main, modal: true, width: 760, height: 560, resizable: false,
      minimizable: false, maximizable: false, autoHideMenuBar: true,
      title: 'Share your screen', backgroundColor: '#FBFAF5', show: false,
      webPreferences: { preload: path.join(__dirname, 'picker-preload.js'), contextIsolation: true, sandbox: true },
    })
    let done = false
    const finish = (id) => {
      if (done) return
      done = true
      ipcMain.removeAllListeners('sm:pick')
      resolve(sources.find(s => s.id === id) || null)
      if (!picker.isDestroyed()) picker.close()
    }
    ipcMain.on('sm:pick', (_e, id) => finish(id))
    picker.on('closed', () => finish(null))
    picker.webContents.once('did-finish-load', () => {
      picker.webContents.send('sm:sources', sources.map(s => ({
        id: s.id, name: s.name, screen: s.id.startsWith('screen:'),
        thumb: s.thumbnail.toDataURL(), icon: s.appIcon ? s.appIcon.toDataURL() : null,
      })))
      picker.show()
    })
    picker.loadFile(path.join(__dirname, 'picker.html'))
  })
}

// Downloads go to the Downloads folder by default; show the item in
// Explorer when it finishes so the file is easy to find.
function setupDownloads() {
  session.defaultSession.on('will-download', (_e, item) => {
    item.once('done', (_ev, state) => {
      if (state === 'completed') shell.showItemInFolder(item.getSavePath())
    })
  })
}

ipcMain.handle('sm:info', () => ({ version: app.getVersion(), platform: process.platform }))

app.on('second-instance', () => {
  if (!main) return
  if (main.isMinimized()) main.restore()
  main.focus()
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Smartious', submenu: [{ role: 'reload' }, { role: 'forceReload' }, { type: 'separator' }, { role: 'quit' }] },
    { role: 'editMenu' },
    { label: 'View', submenu: [
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' },
      { role: 'togglefullscreen' }, { role: 'toggleDevTools' },
    ] },
  ]))
  setupPermissions()
  setupDownloads()
  createWindow()
})

app.on('window-all-closed', () => app.quit())
