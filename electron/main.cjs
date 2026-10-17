const { app, BrowserWindow, ipcMain, protocol, net } = require("electron");
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { exec } = require('node:child_process');
const { Microsoft, Launch } = require("minecraft-java-core");
const isDev = !app.isPackaged && !process.env.USE_DIST;
const activeLaunches = new Map();
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');
const { spawn } = require('child_process');

const DIRS = { mod: 'mods', resourcepack: 'resourcepacks', shader: 'shaders' }
const allowDevTools = false

const libraryRoot = (() => {

  if (!app.isPackaged) return path.join(__dirname, '..', 'Library');

  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'Library');
  }

  return path.join(path.dirname(process.execPath), 'Library');
})();

function resolveLib(p = '') {
  const rel = String(p)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')        
    .replace(/^Library\//i, '');
  const full = path.resolve(libraryRoot, rel);
  if (full !== libraryRoot && !full.startsWith(libraryRoot + path.sep)) {
    throw new Error('Path escapes Library: ' + p);
  }
  return full;
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'library', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

function runUpdater() {
  const bat = path.join(appDir, 'launcher_update.bat');
  if (!fs.existsSync(bat)) throw new Error('launcher_update.bat not found next to the launcher');

  const child = spawn('cmd.exe', ['/d', '/s', '/c', `"${bat}"`], {
    cwd: appDir,                
    detached: true,        
    stdio: 'ignore',
    windowsHide: true,
    windowsVerbatimArguments: true
  });
  child.unref();
}


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'App', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      devTools: allowDevTools,
      nodeIntegration: false
    }
  });
  win.removeMenu();
  win.webContents.openDevTools({ mode: 'detach' });

  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.error('LOAD FAILED:', code, desc, url);
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  console.log('libraryRoot:', libraryRoot, 'exists:', fs.existsSync(libraryRoot));

    protocol.handle('library', async (request) => {
    try {
        const { pathname } = new URL(request.url);
        const filePath = resolveLib(decodeURIComponent(pathname));
        return await net.fetch(pathToFileURL(filePath).toString());
    } catch (err) {
        console.error('library:// error:', request.url, err.message);
        return new Response('Not found', { status: 404 });
    }
    });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


async function login() {
  const mc = await new Microsoft().getAuth();

  if (mc.error) {
    console.log("Auth error:", mc.error);
    return { error: mc.error };
  }

  fs.mkdirSync(resolveLib('Config'), { recursive: true });
  fs.writeFileSync(
    resolveLib('Config/account.json'),
    JSON.stringify(mc, null, 4)
  );

  console.log("Logged in:", mc.name);
  return mc;
}

ipcMain.handle('authenticate_login', async () => {
  return await login();
});

function isLoggedIn() {
  try {
    const data = fs.readFileSync(resolveLib('Config/account.json'), 'utf8');

    if (!data || data.trim() === "false") {
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

ipcMain.handle('authenticate_isloggedin', async () => {
  return isLoggedIn();
});

function getJsonData(file, keyPath) {
  try {
    const data = fs.readFileSync(resolveLib(file), 'utf8');
    const json = JSON.parse(data);
    return keyPath.split('.').reduce((obj, key) => obj?.[key], json);
  } catch (err) {
    console.error(err);
    return null;
  }
}

ipcMain.handle('getjsondata', async (event, file, keyPath) => {
  return getJsonData(file, keyPath);
});

async function rmdirtree(target) {
  try {
    await fs.promises.rm(resolveLib(target), { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

ipcMain.handle('fs_rmdirtree', async (event, target) => {
  return rmdirtree(target);
});

async function rmfile(target) {
  try {
    await fs.promises.rm(resolveLib(target));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

ipcMain.handle('fs_rmfile', async (event, target) => {
  return rmfile(target);
});


async function getInstancesData() {
  const library = resolveLib('Instances');
  const instances = {};

  if (!fs.existsSync(library)) return instances;

  for (const dirName of fs.readdirSync(library)) {
    if (!dirName.endsWith('.instance')) continue;

    const instancePath = path.join(library, dirName);

    if (!fs.statSync(instancePath).isDirectory()) continue;

    const infoPath = path.join(instancePath, 'Resources', 'InstanceInfo.json');

    if (!fs.existsSync(infoPath)) continue;

    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

    instances[dirName] = {
      type: info.type,
      version: info.version,
      selected: info.selected,
      name: info.name,
      ram: info.ram,

      icon: `library://app/Instances/${encodeURIComponent(dirName)}/Resources/icon.png`
    };
  }

  return instances;
}

ipcMain.handle('library_getinstancedata', async () => {
  return getInstancesData();
});

function createInstance(name, type, version) {
  try {
    const instancePath = resolveLib(`Instances/${name}.instance`);
    const templatePath = resolveLib(`Instances/${type}.instancetemplate`);
    const configPath = path.join(instancePath, 'Resources', 'InstanceInfo.json');

    if (fs.existsSync(instancePath)) {
      throw new Error(`Instance directory already exists: ${instancePath}. Not creating instance.`);
    }

    fs.cpSync(templatePath, instancePath, { recursive: true });

    const iConfJsonObj = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    iConfJsonObj.version = version;
    iConfJsonObj.name = name;

    fs.writeFileSync(configPath, JSON.stringify(iConfJsonObj, null, 2), 'utf8');

    console.log('Written config:', fs.readFileSync(configPath, 'utf8'));
    console.log('Version:', iConfJsonObj.version);
    console.log('Name:', iConfJsonObj.name);
    console.log('Completed');
  } catch (err) {
    console.error('Error:', err);
  }
}

ipcMain.handle('library_createinstance', async (event, name, type, version) => {
  createInstance(name, type, version);
});

function selectInstance(name) {
  const instancesDir = resolveLib('Instances');

  for (const dirName of fs.readdirSync(instancesDir)) {
    if (!dirName.endsWith('.instance')) continue;

    const infoPath = path.join(instancesDir, dirName, 'Resources', 'InstanceInfo.json');

    if (!fs.existsSync(infoPath)) continue;

    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    info.selected = info.name === name;

    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2), 'utf8');
  }
}

ipcMain.handle('library_selectinstance', (event, name) => {
  selectInstance(name);
});

ipcMain.handle('launch_instance', async (event, instanceName) => {
  let instanceLauncher = null;
  let launchRegistered = false;
  let currentStage = 'Starting';

  const sendProgress = (data) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send('instance:progress', data);
    }
  };

  const sendToRenderer = (channel, ...args) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send(channel, instanceName, ...args);
    }
  };

  const cleanup = () => {
    if (activeLaunches.get(instanceName) === instanceLauncher) {
      activeLaunches.delete(instanceName);
    }

    if (instanceLauncher) {
      instanceLauncher.removeListener('close', onClose);
      instanceLauncher.removeListener('error', onError);
    }
  };

  function onError(err) {
    sendToRenderer('instance:error', err?.message || String(err));
    cleanup();
  }

  function onClose(code) {
    sendToRenderer('instance:close', code);
    cleanup();
  }

  try {
    if (
      typeof instanceName !== 'string' ||
      !instanceName.trim() ||
      instanceName !== path.basename(instanceName) ||
      instanceName === '.' ||
      instanceName === '..'
    ) {
      throw new Error('Invalid instance name.');
    }

    currentStage = 'Reading instance configuration';

    const instancePath = path.join(libraryRoot, 'Instances', `${instanceName}.instance`);
    const infoPath = path.join(instancePath, 'Resources', 'InstanceInfo.json');
    const accountPath = path.join(libraryRoot, 'Config', 'account.json');
    const minecraftPath = path.join(instancePath, 'Minecraft');

    if (!fs.existsSync(infoPath)) {
      throw new Error('InstanceInfo.json not found.');
    }

    if (!fs.existsSync(accountPath)) {
      throw new Error('Microsoft account file not found. Sign in again.');
    }

    const instanceInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

    const version = instanceInfo.version;
    const type = String(instanceInfo.type || 'vanilla').toLowerCase().trim();
    const ram = instanceInfo.ram || '4G';

    if (!version || typeof version !== 'string') {
      throw new Error('Invalid Minecraft version.');
    }

    currentStage = 'Refreshing Microsoft account';

    let account = JSON.parse(fs.readFileSync(accountPath, 'utf8'));

    if (!account?.refresh_token) {
      throw new Error('No refresh token found. Sign in again.');
    }

    const refreshedAccount = await new Microsoft().refresh(account);

    if (!refreshedAccount || refreshedAccount.error) {
      throw new Error(refreshedAccount?.error || 'Microsoft authentication failed.');
    }

    account = refreshedAccount;

    fs.writeFileSync(accountPath, JSON.stringify(account, null, 4), 'utf8');

    const loader = type === 'vanilla'
      ? { enable: false }
      : { type, build: 'latest', enable: true };

    fs.mkdirSync(minecraftPath, { recursive: true });

    if (activeLaunches.has(instanceName)) {
      throw new Error(`"${instanceName}" is already launching or running.`);
    }

    currentStage = 'Starting Minecraft';

    instanceLauncher = new Launch();
    activeLaunches.set(instanceName, instanceLauncher);
    launchRegistered = true;

    instanceLauncher.on('progress', (data, size) => {
      const isObj = typeof data === 'object' && data !== null;
      const progress = isObj ? data.progress : data;
      const totalSize = isObj ? data.size : size;

      const percent = Number(
        (isObj
          ? data.percent
          : totalSize > 0
            ? (progress / totalSize) * 100
            : 0
        ).toFixed(2)
      );

      sendProgress({ progress, size: totalSize, percent });
    });

    instanceLauncher.on('patch', (patch) => {
      sendToRenderer('instance:patch', String(patch));
    });

    instanceLauncher.on('data', (line) => {
      sendToRenderer('instance:data', String(line));
    });

    instanceLauncher.on('error', onError);
    instanceLauncher.on('close', onClose);

    const options = {
      path: minecraftPath,
      authenticator: account,
      version,
      instance: instanceName,
      intelEnabledMac: true,
      detached: true,
      ignored: [
        'config',
        'logs',
        'resourcepacks',
        'options.txt',
        'optionsof.txt'
      ],
      loader,
      memory: { min: ram, max: ram }
    };

    sendProgress({ percent: 0 });

    await instanceLauncher.Launch(options);

    return {
      success: true,
      instanceName,
      version,
      type,
      ram,
      minecraftPath
    };
  } catch (err) {
    if (launchRegistered && instanceLauncher) {
      if (activeLaunches.get(instanceName) === instanceLauncher) {
        activeLaunches.delete(instanceName);
      }

      for (const name of ['progress', 'patch', 'data', 'error', 'close']) {
        instanceLauncher.removeAllListeners(name);
      }
    }

    sendToRenderer('instance:error', err?.message || String(err));

    return {
      success: false,
      instanceName,
      stage: currentStage,
      error: err?.message || String(err)
    };
  }
});


ipcMain.handle('fs_getusedstorage', async () => {
  try {
    const { default: getFolderSize } = await import('get-folder-size');
    const size = await getFolderSize.loose(libraryRoot);
    return size / (1024 ** 3);
  } catch (err) {
    console.error('Failed to get folder size:', err);
    return 0;
  }
});

ipcMain.handle('launcher_newuser', () => {
  const configDir = resolveLib('Config');
  const configPath = path.join(configDir, 'configuration_setup.json');

  if (fs.existsSync(configPath)) {
    return true;
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ setup_dateComplete: formattedDate }));
  return false;
});

const appDir = !app.isPackaged
  ? path.join(__dirname, '..')
  : process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);

async function downloadUpdate(url, onProgress) {
  if (!/^https:\/\//i.test(url)) throw new Error('Update URL must be https');

  const dest = path.join(appDir, 'update.zip');
  const tmp = dest + '.part';

  const res = await net.fetch(url);          
  if (!res.ok || !res.body) throw new Error(`Download failed: HTTP ${res.status}`);

  const total = Number(res.headers.get('content-length')) || 0;
  let received = 0;

  const source = Readable.fromWeb(res.body);
  source.on('data', (chunk) => {
    received += chunk.length;
    if (total && onProgress) onProgress(received / total * 100);
  });

  try {
    await pipeline(source, fs.createWriteStream(tmp));
    fs.renameSync(tmp, dest);               
  } catch (err) {
    fs.rmSync(tmp, { force: true });
    throw err;
  }
  return dest;
}

ipcMain.handle('update_download', async (event, url) => {
  try {
    const file = await downloadUpdate(url, (percent) => {
      if (!event.sender.isDestroyed()) event.sender.send('update:progress', percent);
    });

    runUpdater();
    setTimeout(() => app.quit(), 500);  

    return { success: true, file };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

async function modrinth(endpoint) {
  const res = await fetch(`https://api.modrinth.com/v2${endpoint}`, {
    headers: { 'User-Agent': 'neonlauncher' }
  })
  if (!res.ok) throw new Error(`Modrinth request failed (${res.status})`)
  return res.json()
}

async function downloadFile(file, dir) {
  await fs.promises.mkdir(dir, { recursive: true })

  const dest = path.join(dir, path.basename(file.filename))
  if (fs.existsSync(dest)) return file.filename 

  const res = await fetch(file.url)
  if (!res.ok) throw new Error(`Download failed for ${file.filename} (${res.status})`)

  await fs.promises.writeFile(dest, Buffer.from(await res.arrayBuffer()))
  return file.filename
}

const primaryFile = v => v.files.find(f => f.primary) ?? v.files[0]

async function installDependencies(version, info, modsDir, seen, installed) {
  const t = info.type.toLowerCase()
  const loaders = t === 'quilt' ? ['quilt', 'fabric'] : [t]

  for (const dep of version.dependencies ?? []) {
    if (dep.dependency_type !== 'required' || !dep.project_id) continue
    if (seen.has(dep.project_id)) continue
    seen.add(dep.project_id)

    let depVersion

    if (dep.version_id) {
      depVersion = await modrinth(`/version/${dep.version_id}`)
    } else {
      const list = await modrinth(
        `/project/${dep.project_id}/version` +
        `?loaders=${encodeURIComponent(JSON.stringify(loaders))}` +
        `&game_versions=${encodeURIComponent(JSON.stringify([info.version]))}`
      )
      depVersion = list[0]
    }

    if (!depVersion) continue 

    installed.push(await downloadFile(primaryFile(depVersion), modsDir))
    await installDependencies(depVersion, info, modsDir, seen, installed)
  }
}

ipcMain.handle('install_resource', async (event, url, instance, type) => {
  const folder = DIRS[type]
  if (!folder) throw new Error(`Unknown resource type: ${type}`)

  if (path.basename(instance) !== instance || !instance.endsWith('.instance')) {
    throw new Error('Invalid instance')
  }

  const parsed = new URL(url)
  if (parsed.hostname !== 'cdn.modrinth.com') throw new Error('Unsupported download source')

  const match = parsed.pathname.match(/\/data\/([^/]+)\/versions\/([^/]+)\//)
  if (!match) throw new Error('Could not read version from URL')
  const [, projectId, versionId] = match

  const instancePath = path.join(resolveLib('Instances'), instance)
  const infoPath = path.join(instancePath, 'Resources', 'InstanceInfo.json')
  if (!fs.existsSync(infoPath)) throw new Error('Instance not found')
  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'))

  const name = instance.slice(0, -'.instance'.length)
  const baseDir = path.join(instancePath, 'Minecraft', 'instances', name)

  const version = await modrinth(`/version/${versionId}`)
  const file = version.files.find(f => f.url === url) ?? primaryFile(version)

  const installed = [await downloadFile(file, path.join(baseDir, folder))]

  if (type === 'mod') {
    await installDependencies(
      version, info, path.join(baseDir, 'mods'), new Set([projectId]), installed
    )
  }

  return installed
})


ipcMain.handle('opendir', async => {
exec(`explorer.exe ${libraryRoot}`)
})
