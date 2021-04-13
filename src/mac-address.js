function getMac(macAddresses, name) {
  //exact match first
  for (const key in macAddresses) {
    if (!name || key.toLowerCase() === name) {
      if (Object.hasOwnProperty.call(macAddresses, key)) {
        const candidate = macAddresses[key].filter(
          (m) => !m.internal && m.mac !== "00:00:00:00:00:00"
        )[0];
        if (candidate) {
          return candidate;
        }
      }
    }
  }

  //then check for approximate matches
  for (const key in macAddresses) {
    if (!name || key.toLowerCase().indexOf(name) > -1) {
      if (Object.hasOwnProperty.call(macAddresses, key)) {
        const candidate = macAddresses[key].filter(
          (m) => !m.internal && m.mac !== "00:00:00:00:00:00"
        )[0];
        if (candidate) {
          return candidate;
        }
      }
    }
  }
  return undefined;
}

function primaryMacAddress(macAddresses) {
  const wireless = getMac(macAddresses, "wireless");
  if (wireless) {
    return wireless.mac.replace(/:/g, "");
  }
  const wifi = getMac(macAddresses, "wifi");
  if (wifi) {
    return wifi.mac.replace(/:/g, "");
  }
  const ethernet = getMac(macAddresses, "ethernet");
  if (ethernet) {
    return ethernet.mac.replace(/:/g, "");
  }
  const eth = getMac(macAddresses, "eth");
  if (eth) {
    return eth.mac.replace(/:/g, "");
  }
  const def = getMac(macAddresses);
  if (def) {
    return def.mac.replace(/:/g, "");
  }
  return undefined;
}

module.exports = {
  primaryMacAddress,
};
