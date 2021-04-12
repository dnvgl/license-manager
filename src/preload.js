const os = require("os");
const fs = require("fs");
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getMacAddress: () => os.networkInterfaces(),
  getToken: () => window.process.argv.slice(-1)[0],
  writeLicenseFile: (path, data) => fs.writeFileSync(path, data),
});
