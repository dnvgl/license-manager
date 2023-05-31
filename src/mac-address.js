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
        const candidate = macAddresses[key].filter((m) => !m.internal)[0];
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
    return wireless;
  }
  const wifi1 = getMac(macAddresses, "wi-fi");
  if (wifi1) {
    return wifi1;
  }
  const wifi2 = getMac(macAddresses, "wifi");
  if (wifi2) {
    return wifi2;
  }
  const ethernet = getMac(macAddresses, "ethernet");
  if (ethernet) {
    return ethernet;
  }
  const eth = getMac(macAddresses, "eth");
  if (eth) {
    return eth;
  }
  const def = getMac(macAddresses);
  if (def) {
    return def;
  }
  return undefined;
}

module.exports = {
  primaryMacAddress,
};
