import { BrowserWindow, Menu, dialog, app } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path";

import authService from "./auth-service";

let win = null;

async function createAppWindow() {
  // Create the browser window.

  const token = authService.getAccessToken();

  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
      additionalArguments: [token],
    },
  });

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          click() {
            win.close();
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click() {
            dialog.showMessageBox({
              title: "About",
              message: `You are running version : ${app.getVersion()}`,
            });
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }

  win.on("closed", () => {
    win = null;
  });
}

export { createAppWindow };
