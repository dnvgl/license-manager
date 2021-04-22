const os = require("os");
const fs = require("fs");
const path = require("path");
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getMacAddress: () => os.networkInterfaces(),
  getToken: () => window.process.argv.slice(-1)[0],
  writeLicenseFile: (filename, data) => {
    const directory = "c:/FlexLM";
      
    fs.mkdir(directory, { recursive: true }, (error) => {
      if (error) {
        console.log(error);
      }
    });
  
    fs.writeFileSync(path.join(directory, filename), data)
  }
});
