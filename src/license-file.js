const path = require("path");

function getLicenseFileDirectory(envVariable) {
  if (envVariable) {
    const dirs = envVariable.split(";");
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      if (dir.indexOf("@") === -1) {
        return !path.extname(dir) ? dir : path.win32.dirname(dir);
      }
    }
  }

  return "C:\\flexlm";
}

module.exports = { getLicenseFileDirectory };
