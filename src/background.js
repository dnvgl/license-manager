"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  dialog,
  createWindow,
} from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { autoUpdater } from "electron-updater";
import logger from "electron-log";

//override console
Object.assign(console, logger.functions);

import { createAppWindow } from "./app-process";
import { createAuthWindow } from "./auth-process";
import authService from "./auth-service";

autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = "info";
//autoUpdater.channel = "latest";
autoUpdater.channel = "beta";
//autoUpdater.channel = "alpha";

ipcMain.on("log", (event, arg) => {
  logger.info(arg);
});

ipcMain.on("error", (event, arg) => {
  logger.error(arg);
});

const isDevelopment = process.env.NODE_ENV !== "production";

if (!isDevelopment) {
  autoUpdater.checkForUpdates();

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail:
        "A new version has been downloaded. Restart the application to apply the updates.",
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

autoUpdater.on("error", (message) => {
  logger.error("There was a problem updating the application");
  logger.error(message);
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

app.on("login", (event, webContents, details, authInfo, callback) => {
  logger.warn("login triggered: ");
  logger.warn(authInfo);

  event.preventDefault();

  if (process.env.username && process.env.password) {
    callback(process.env.username, process.env.password);
  } else {
    createAppWindow("ProxyAuthError");
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      logger.error("Vue Devtools failed to install:", e.toString());
    }
  }

  try {
    await authService.refreshTokens();
    createAppWindow();
  } catch (err) {
    logger.info(err);
    createAuthWindow();
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

process.on("uncaughtException", (err) => {
  logger.error(err);
  createAppWindow();
});
