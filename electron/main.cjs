
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron");
const serve = require('electron-serve').default;
const { spawn, exec } = require("child_process");

const { Microsoft, Launch } = require("minecraft-java-core");
const fs = require("fs");
const path = require('path');
const { mkdir } = require('node:fs/promises'); 
const { writeFile, readSync } = require("node:fs");
const { writeFileSync } = require('node:fs'); 
const { pipeline } = require('node:stream/promises');

const logFile = "./launcher.log";

const loadURL = serve({ directory: path.join(__dirname, '../build') });

process.on('unhandledRejection', (reason) => {
  fs.appendFileSync('./launcher.log', '[UNHANDLED REJECTION] ' + JSON.stringify(reason) + '\n');
});
process.on('uncaughtException', (err) => {
  fs.appendFileSync('./launcher.log', '[UNCAUGHT EXCEPTION] ' + err.stack + '\n');
});

async function createDir(dirPath, recursive) {
  try {
    await mkdir(dirPath, { recursive: recursive });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}
createDir("NeonLauncherData", true)


function log(msg) {
  fs.appendFileSync(logFile, msg + "\n");
}

async function login() {
  log("Login triggered");

  const mc = await new Microsoft().getAuth();

  if (mc.error) {
    log("Auth failed: " + mc.error);
    return { error: mc.error };
  }

  fs.writeFileSync("./account.json", JSON.stringify(mc, null, 4));
  log(`Logged in as ${mc.name}`);

  return mc;
}

function getUsername() {
  if (!fs.existsSync("./account.json")) return null;

  const data = fs.readFileSync("./account.json", "utf8");
  return JSON.parse(data).name;
}


function logout() {
  if (fs.existsSync("./account.json")) {
    fs.rmSync("./account.json")
    return true
  }
}

function getFolder(dirPath) {
  return fs.existsSync(dirPath);
}

async function createInstanceConfig(name, version, platform) {
  if (name == null || version == null || platform == null) {
    console.error("Missing required configuration arguments.");
    return 1; 
  }
  if (getFolder("NeonLauncherData/" + name) === true) {
    console.log("Dir already exists!");
    return 2;
  }
  
  console.log("Creating");
  await createDir(`NeonLauncherData/${name}`); 
  
  const launchData = {
    "Version": version,
    "platform": platform,
    "JVMArgs": "",
    "memory_min": "1G",
    "memory_max": "3G"
  };
  writeFileSync(`NeonLauncherData/${name}/launchconfig.json`, JSON.stringify(launchData, null, 2));
  
  console.log("Config saved.");
}


function getUUID() {
  if (!fs.existsSync("./account.json")) return null;

  const data = fs.readFileSync("./account.json", "utf8");
  return JSON.parse(data).uuid;
}

ipcMain.handle("login", async () => {
  return await login();
});

ipcMain.handle("get-username", () => {
  return getUsername();
});

ipcMain.handle("get-uuid", () => {
  return getUUID();
});

ipcMain.handle("logout", () => {
  return logout();
})

ipcMain.handle("getversionconfigs", async () => {
  const dirPath = "NeonLauncherData";

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  const dirs = items
    .filter(item => item.isDirectory() && item.name !== "Internal")
    .map(item => item.name);

  return {
    dirs
  };
});

async function readConfig(name) {
    try {
    const filePath = path.join(
      "NeonLauncherData",
      name,
      "launchconfig.json"
    );

    if (!fs.existsSync(filePath)) {
      return { error: "Config not found" };
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);

    return json;
  } catch (err) {
    return { error: err.message };
  }
}

ipcMain.handle("readconfig", async (event, name) => {
  try {
    const filePath = path.join(
      "NeonLauncherData",
      name,
      "launchconfig.json"
    );

    if (!fs.existsSync(filePath)) {
      return { error: "Config not found" };
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);

    return json;
  } catch (err) {
    return { error: err.message };
  }
});
ipcMain.handle("createInstanceConfig", async (event, instanceName, instancePlatform, instanceVersion) => {
  return await createInstanceConfig(instanceName, instancePlatform, instanceVersion);
});

ipcMain.handle("alert", async (event, message) => {
  const win = BrowserWindow.getFocusedWindow();
  await dialog.showMessageBox(win, {
    type: "warning",
    buttons: ["OK"],
    message: message
  });
});

ipcMain.handle("setPlayVersion", async (event, name) => {
    await createDir("NeonLauncherData/Internal", true)
    writeFileSync("NeonLauncherData/Internal/selected.txt", name)
})

ipcMain.handle("readPlayVersion", () => {
    const filePath = "NeonLauncherData/Internal/selected.txt";
    if (!fs.existsSync(filePath)) return "";
    return fs.readFileSync(filePath, "utf8");
});

ipcMain.handle("checkIfAccount", () => {

      const filePath = path.join(process.cwd(), "account.json");

      if (!fs.existsSync(filePath)) {
          return "nologin";
      }

      return "login";
})

ipcMain.handle("start", async (event) => {
  let mc;
  try {
    mc = JSON.parse(fs.readFileSync('./account.json', 'utf8'));
  } catch {
    return { error: "No account found. Please log in first." };
  }

  if (!mc.refresh_token) {
    mc = await new Microsoft().getAuth();
  } else {
    mc = await new Microsoft().refresh(mc);
  }

  if (mc.error) return { error: mc.error };
  fs.writeFileSync('./account.json', JSON.stringify(mc, null, 4));

  const selectedPath = "NeonLauncherData/Internal/selected.txt";
  if (!fs.existsSync(selectedPath)) return { error: "No instance selected." };
  const lpath = fs.readFileSync(selectedPath, "utf8").trim();

  const config = await readConfig(lpath);
  if (config.error) return { error: config.error };

  const launcher = new Launch();

const isVanilla = config.platform === "vanilla";

const opt = {
  authenticator: mc,
  path: path.join(process.cwd(), `NeonLauncherData/${lpath}`),
  version: config.Version,          
  loader: {
    type: isVanilla ? null : config.platform,
    build: "latest",
    version: config.Version,
    enable: !isVanilla
  },
  memory: {
    min: config.memory_min || "1G",
    max: config.memory_max || "3G"
  },
  JVM_ARGS: config.JVMArgs ? config.JVMArgs.split(" ").filter(s => s.trim() !== "") : [],
};


launcher.on('progress', (progress, size, element) => {
  event.sender.send('launch-progress', { progress, size, element });
});

launcher.on('check', (progress, size, element) => {
  event.sender.send('launch-check', { progress, size, element });
});

let gameStarted = false;
launcher.on('data', (data) => {
  if (!gameStarted) { gameStarted = true; event.sender.send('launch-started'); }
  event.sender.send('launch-data', data);
});
launcher.on('close', (code) => {
  event.sender.send('launch-close', code);
});
launcher.on('error', (err) => {
  const errMsg = err ? JSON.stringify(err) : "Unknown/undefined error";
  log("[MC error] " + errMsg);
  event.sender.send('launch-error', errMsg);
});

// launcher.on('error', (err) => {
//   log("[MC error] type=" + typeof err);
//   log("[MC error] value=" + String(err));
//   log("[MC error] json=" + JSON.stringify(err));
//   log("[MC error] keys=" + (err ? Object.keys(err) : "null"));
//   if (err && err.error) log("[MC error] .error=" + err.error);
//   if (err && err.message) log("[MC error] .message=" + err.message);
//   if (err && err.stack) log("[MC error] .stack=" + err.stack);
//   event.sender.send('launch-error', String(err));
// });

  await launcher.Launch(opt);
  return { success: true };
});

ipcMain.handle("set-mica", (_, enabled) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (enabled) {
    win.setBackgroundMaterial("mica");
  } else {
    win.setBackgroundMaterial("none");
    win.setBackgroundColor("#1a1a1a");
  }
});

ipcMain.handle("open_directory", (_, dirPath) => {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath)) {
    shell.openPath(fullPath);
    return { success: true };
  } else {
    return { error: "Directory does not exist." };
  }
});

ipcMain.handle('open_url', async (_, url) => {
    await shell.openExternal(url);
});

ipcMain.handle("download_update", async () => {
  try {
    const versionRes = await fetch("https://raw.githubusercontent.com/QuasiChicken90/NeonLauncher/refs/heads/main/update.txt");
    const versionText = (await versionRes.text()).trim();
    const url = `https://github.com/QuasiChicken90/NeonLauncher/releases/latest/download/${versionText}.exe`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

    const savePath = path.join(app.getPath("temp"), `${versionText}.exe`);
    log("[update] saving to: " + savePath);

    const fileStream = fs.createWriteStream(savePath);
    await pipeline(response.body, fileStream);
    await new Promise((res, rej) => fileStream.close(e => e ? rej(e) : res()));
    log("[update] file closed, size: " + fs.statSync(savePath).size);

    const batPath = path.join(app.getPath("temp"), "neon_update.bat");
    const batContent = `@echo off
ping 127.0.0.1 -n 4 > nul
start "" "${savePath}"
del "%~f0"
`;
    fs.writeFileSync(batPath, batContent);
    // log("[update] bat written to: " + batPath);

    const child = spawn("cmd.exe", ["/c", batPath], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });

    child.on("error", (err) => log("[update spawn error] " + err.message));
    child.on("close", (code) => log("[update spawn close] code=" + code));
    child.unref();

    setTimeout(() => app.quit(), 1000);

  } catch (err) {
    return { error: err.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: false,
    frame: true,
    backgroundColor: "#00000000",
    icon: 'NeonLauncherData/static/icon.png',
    title: 'Neon Launcher (Beta)',
    vibrancy: "mica",
    visualEffectState: "active",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Loaded URL:', win.webContents.getURL());
  });
  win.webContents.on('did-fail-load', (event, code, desc, url) => {
    console.log('Failed to load:', url, code, desc);
  });

  if (app.isPackaged) {
    // setTimeout(() => win.webContents.openDevTools(), 2000); debug
    loadURL(win);
  } else {
    win.loadURL('http://localhost:5173');
  }
}


app.whenReady().then(() => {
  log("App ready");
  Menu.setApplicationMenu(null);
  createWindow();
  
});
