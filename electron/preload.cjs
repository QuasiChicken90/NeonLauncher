const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    authenticate: () => ipcRenderer.invoke('authenticate_login'),
    authenticate_isloggedin: () => ipcRenderer.invoke('authenticate_isloggedin'),

    getjsondata: (file, path) => ipcRenderer.invoke('getjsondata', file, path),

    fs_rmdirtree: (path) => ipcRenderer.invoke('fs_rmdirtree', path),
    fs_rmfile: (path) => ipcRenderer.invoke('fs_rmfile', path),
    fs_getusedstorage: () => ipcRenderer.invoke("fs_getusedstorage"),
    
    library_getinstancedata: () => ipcRenderer.invoke("library_getinstancedata"),
    opendir: () => ipcRenderer.invoke("opendir"),
    library_createinstance: (name, type, version) =>
        ipcRenderer.invoke('library_createinstance', name, type, version),
    library_selectinstance: (name) => ipcRenderer.invoke('library_selectinstance', name),
    install_resource: (url, instance, type) => ipcRenderer.invoke("install_resource", url, instance, type),
    launch_instance: (name) => ipcRenderer.invoke("launch_instance", name),

    onDownloadProgress: (callback) => {
        ipcRenderer.on('instance:progress', (_event, data) => {
            callback(data);
        });
    },

    launcher_newuser: () => ipcRenderer.invoke("launcher_newuser"),
    
    update_download: (url) => ipcRenderer.invoke('update_download', url),
    onUpdateProgress: (cb) => {
    const handler = (_event, percent) => cb(percent);
    ipcRenderer.on('update:progress', handler);
    return () => ipcRenderer.removeListener('update:progress', handler);
    },
})
