// assistant.js - Floating window interface

const { BrowserWindow, ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class ClippyAssistant {
  constructor() {
    this.window = null;
    this.isMinimized = true;
    this.position = { x: 50, y: 50 };
    this.dragStart = null;
    this.encryptionKey = this.loadEncryptionKey();
  }

  async init() {
    app.on('ready', () => {
      this.createWindow();
      this.setupIPC();
      this.setupHotkeys();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 100,
      height: 100,
      x: this.position.x,
      y: this.position.y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    this.window.loadFile('ui/assistant.html');

    this.window.on('moved', () => {
      const [x, y] = this.window.getPosition();
      this.position = { x, y };
      this.savePosition();
    });

    this.window.on('closed', () => {
      this.window = null;
    });
  }

  setupIPC() {
    ipcMain.on('toggle-menu', (event) => {
      if (this.isMinimized) {
        this.expandMenu();
      } else {
        this.minimizeMenu();
      }
    });

    ipcMain.on('request-resource', (event, category) => {
      const resource = this.getEncryptedResource(category);
      event.reply('resource-data', resource);
    });

    ipcMain.on('save-safety-plan', (event, data) => {
      this.saveEncryptedData('safety_plans', data);
      event.reply('save-status', { success: true });
    });

    ipcMain.on('access-peer-network', (event) => {
      const peerData = this.getPeerNetworkData();
      event.reply('peer-data', peerData);
    });
  }

  expandMenu() {
    if (!this.window) return;
    this.window.setSize(400, 600);
    this.isMinimized = false;
    this.window.webContents.send('menu-expanded');
  }

  minimizeMenu() {
    if (!this.window) return;
    this.window.setSize(100, 100);
    this.isMinimized = true;
    this.window.webContents.send('menu-minimized');
  }

  setupHotkeys() {
    const { globalShortcut } = require('electron');

    globalShortcut.register('Alt+Shift+S', () => {
      if (!this.window) return;
      if (this.window.isVisible()) {
        this.window.hide();
      } else {
        this.window.show();
      }
    });

    globalShortcut.register('CmdOrCtrl+Alt+K', () => {
      if (this.window) {
        this.window.webContents.send('quick-safety-check');
      }
    });
  }

  loadEncryptionKey() {
    const keyPath = path.join(
      require('os').homedir(),
      `.SWB_Assistant/encryption.key`
    );

    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath);
    } else {
      const key = crypto.randomBytes(32);
      fs.writeFileSync(keyPath, key);
      fs.chmodSync(keyPath, 0o600);
      return key;
    }
  }

  saveEncryptedData(table, data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);

    const db = require('better-sqlite3')(
      path.join(require('os').homedir(), `.SWB_Assistant/swb.db`)
    );

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO ${table} (id, encrypted_data, created_at)
      VALUES (?, ?, ?)
    `);

    stmt.run(
      crypto.randomUUID(),
      Buffer.concat([iv, encrypted]).toString('hex'),
      Date.now()
    );

    db.close();
  }

  getEncryptedResource(category) {
    const db = require('better-sqlite3')(
      path.join(require('os').homedir(), `.SWB_Assistant/swb.db`)
    );

    const stmt = db.prepare(
      `SELECT encrypted_data FROM resources WHERE category = ? LIMIT 1`
    );
    const result = stmt.get(category);

    db.close();

    if (!result) return null;

    const encrypted = Buffer.from(result.encrypted_data, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      encrypted.slice(0, 16)
    );

    const decrypted = Buffer.concat([
      decipher.update(encrypted.slice(16)),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  getPeerNetworkData() {
    const db = require('better-sqlite3')(
      path.join(require('os').homedir(), `.SWB_Assistant/swb.db`)
    );

    const stmt = db.prepare(
      `SELECT anonymous_hash, encrypted_feedback FROM peer_network LIMIT 10`
    );
    const results = stmt.all();

    db.close();

    return results.map(row => ({
      id: row.anonymous_hash,
      feedback: this.decryptData(row.encrypted_feedback),
    }));
  }

  savePosition() {
    const configPath = path.join(
      require('os').homedir(),
      `.SWB_Assistant/config.json`
    );
    fs.writeFileSync(
      configPath,
      JSON.stringify({ position: this.position })
    );
  }

  decryptData(encryptedHex) {
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      encrypted.slice(0, 16)
    );

    return Buffer.concat([
      decipher.update(encrypted.slice(16)),
      decipher.final(),
    ]).toString('utf8');
  }
}

const assistant = new ClippyAssistant();
assistant.init();
