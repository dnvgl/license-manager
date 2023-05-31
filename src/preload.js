const os = require("os");
const fs = require("fs");
const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");
const { getLicenseFileDirectories } = require("../src/license-file");

contextBridge.exposeInMainWorld("electron", {
  getMacAddress: () => os.networkInterfaces(),
  getToken: () => {
    return window.process.argv.slice(-2)[0];
  },
  log: (m) => ipcRenderer.send("log", m),
  error: (m) => ipcRenderer.send("error", m),
  writeLicenseFile: (filename, data) => {
    let directories = getLicenseFileDirectories(
      process.env.DNVSLM_LICENSE_FILE
    );

    directories = [...new Set(directories)];

    directories.forEach((directory) => {
      if (!fs.existsSync(directory)) {
        try {
          fs.mkdirSync(directory, { recursive: true });
        } catch (e) {
          ipcRenderer.send("error", `unable to create directory, ${e}`);
        }
      }

      try {
        const ext = path.extname(filename);
        const basename = path.basename(filename, ext);
        let loc = path.join(directory, `${basename}${ext}`);

        let i = 0;
        while (fs.existsSync(loc)) {
          loc = path.join(directory, `${basename}.${++i}${ext}`);
        }

        fs.writeFileSync(loc, data);
      } catch (e) {
        ipcRenderer.send("error", `unable to write file, ${e}`);
      }
    });
  },
});
