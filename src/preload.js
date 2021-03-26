const os = require("os");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mac_address").innerHTML = JSON.stringify(
    os.networkInterfaces(),
    null,
    "\t"
  );
});
