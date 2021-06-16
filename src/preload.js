const os = require("os");
const fs = require("fs");
const path = require("path");
const logger = require("electron-log");
const { contextBridge } = require("electron");
const { getLicenseFileDirectories } = require("../src/license-file");

contextBridge.exposeInMainWorld("electron", {
  getMacAddress: () => os.networkInterfaces(),
  getToken: () => window.process.argv.slice(-1)[0],
  log: logger.log,
  writeLicenseFile: (filename, data) => {
    let directories = getLicenseFileDirectories(
      process.env.DNVSLM_LICENSE_FILE
    );

    directories.forEach((directory) => {
      if (!fs.existsSync(directory)) {
        try {
          fs.mkdirSync(directory, { recursive: true });
        } catch (e) {
          logger.log(`unable to create directory, ${e}`);
        }
      }

      try {
        const loc = path.join(directory, filename);
        fs.writeFileSync(loc, data);
      } catch (e) {
        logger.log(`unable to write file, ${e}`);
      }
    });
  },
});
