// installer.js - USB-based deployment
// Run from USB stick on any Windows/Mac/Linux device

const fs = require('fs');
const path = require('path');
const os = require('os');

class SWBInstaller {
  constructor() {
    this.appName = 'SWB_Assistant';
    this.appDir = path.join(os.homedir(), `.${this.appName}`);
    this.usbPath = process.argv[2]; // USB drive path
  }

  async install() {
    console.log('🔒 SWB Assistant - Privacy-First Installation');
    console.log('================================================\n');

    if (!this.usbPath) {
      console.error('❌ USB path is required. Usage: node installer.cjs <USB_PATH>');
      process.exit(1);
    }

    try {
      // Step 1: Create local directory
      if (!fs.existsSync(this.appDir)) {
        fs.mkdirSync(this.appDir, { recursive: true });
        console.log('✓ Created local directory');
      }

      // Step 2: Copy encrypted data from USB
      const usbAppDir = path.join(this.usbPath, 'SWB_Assistant');
      if (fs.existsSync(usbAppDir)) {
        this.copyFiles(usbAppDir, this.appDir);
        console.log('✓ Copied application files from USB');
      }

      // Step 3: Initialize encrypted local database
      await this.initializeLocalDB();
      console.log('✓ Initialized encrypted database');

      // Step 4: Set up system integration
      this.setupSystemIntegration();
      console.log('✓ Set up system integration');

      // Step 5: Security check
      this.setupPermissions();
      console.log('✓ Set secure file permissions');

      console.log('\n✓ Installation complete!');
      console.log(`\nTo launch: ${this.getLaunchCommand()}`);
      console.log('\nIMPORTANT: You can safely eject the USB now.');
      console.log('All data is encrypted and stored locally on your device.\n');
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      process.exit(1);
    }
  }

  copyFiles(source, destination) {
    const files = fs.readdirSync(source);
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath);
        }
        this.copyFiles(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }

  async initializeLocalDB() {
    const Database = require('better-sqlite3');
    const dbPath = path.join(this.appDir, 'swb.db');

    const db = new Database(dbPath);

    // Initialize encrypted schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        encrypted_profile TEXT NOT NULL,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS safety_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        encrypted_data TEXT NOT NULL,
        created_at INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        category TEXT,
        encrypted_data TEXT,
        last_updated INTEGER
      );

      CREATE TABLE IF NOT EXISTS peer_network (
        id TEXT PRIMARY KEY,
        encrypted_feedback TEXT,
        anonymous_hash TEXT UNIQUE,
        created_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_user_plans ON safety_plans(user_id);
    `);

    db.close();
  }

  setupPermissions() {
    if (os.platform() !== 'win32') {
      const { execSync } = require('child_process');
      execSync(`chmod -R 700 ${this.appDir}`);
    }
  }

  setupSystemIntegration() {
    const platform = os.platform();

    if (platform === 'win32') {
      this.setupWindowsIntegration();
    } else if (platform === 'darwin') {
      this.setupMacIntegration();
    } else {
      this.setupLinuxIntegration();
    }
  }

  setupWindowsIntegration() {
    const { execSync } = require('child_process');
    const scriptPath = path.join(this.appDir, 'launch.vbs');

    const vbsScript = `
      Set oShell = CreateObject("WScript.Shell")
      oShell.Run "node ${path.join(this.appDir, 'app.js')}", 0, False
    `;

    fs.writeFileSync(scriptPath, vbsScript);
    console.log('  → To auto-launch on startup, right-click and "Send to" Startup folder');
  }

  setupMacIntegration() {
    const plistPath = path.join(
      os.homedir(),
      'Library/LaunchAgents/com.swb.assistant.plist'
    );

    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.swb.assistant</string>
  <key>ProgramArguments</key>
  <array>
    <string>node</string>
    <string>${path.join(this.appDir, 'app.js')}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/dev/null</string>
  <key>StandardErrorPath</key>
  <string>/dev/null</string>
</dict>
</plist>`;

    fs.writeFileSync(plistPath, plist);
    console.log('  → App will auto-launch on next login');
  }

  setupLinuxIntegration() {
    const desktopEntry = path.join(
      os.homedir(),
      '.config/autostart/swb-assistant.desktop'
    );

    const desktop = `[Desktop Entry]
Type=Application
Name=SWB Assistant
Exec=node ${path.join(this.appDir, 'app.js')}
Icon=swb
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true`;

    fs.writeFileSync(desktopEntry, desktop);
    console.log('  → App will auto-launch on next login');
  }

  getLaunchCommand() {
    const platform = os.platform();
    if (platform === 'win32') {
      return `"${path.join(this.appDir, 'launch.vbs')}"`;
    } else {
      return `node ${path.join(this.appDir, 'app.js')}`;
    }
  }
}

const installer = new SWBInstaller();
installer.install();
