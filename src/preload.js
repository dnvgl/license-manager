const os = require("os");
import authService from "./auth-service";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getMacAddress: () => os.networkInterfaces(),
  getToken: () => authService.getAccessToken(),
});
