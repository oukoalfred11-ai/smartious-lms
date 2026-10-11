const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('picker', {
  onSources: (fn) => ipcRenderer.on('sm:sources', (_e, list) => fn(list)),
  pick: (id) => ipcRenderer.send('sm:pick', id),
})
