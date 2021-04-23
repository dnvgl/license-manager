const os = require("os");
const fs = require("fs");
const path = require("path");
const { contextBridge } = require("electron");
const { getLicenseFileDirectory } = require("../src/license-file");

contextBridge.exposeInMainWorld("electron", {
  getMacAddress: () => os.networkInterfaces(),
  getToken: () => window.process.argv.slice(-1)[0],
  writeLicenseFile: (filename, data) => {
    let directory = getLicenseFileDirectory(process.env.DNVSLM_LICENSE_FILE);

    if (!fs.existsSync(path)) {
      try{
        fs.mkdirSync(directory, { recursive: true })
      } catch (e) {
        console.log(e)  
        directory = "C:\\flexlm"
        fs.mkdirSync(directory, { recursive: true })
      }
    }
    const loc = path.join(directory, filename)
    fs.writeFileSync(loc, data);
    return loc
  },
});
