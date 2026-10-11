// Exposed to the portal as window.smartiousDesktop (see
// frontend/src/lib/appShell.js). Deliberately tiny: the page gets no Node
// access, only these calls.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('smartiousDesktop', {
  ready: () => ipcRenderer.send('sm:ready'),
  info: () => ipcRenderer.invoke('sm:info'),
})
