function getMac(macAddresses, name) {
  // exact match first
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

  // then check for approximate matches
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
  let wireless = getMac(macAddresses, "wireless");
  if (!wireless) {
    wireless = getMac(macAddresses, "wi-fi");
  }
  if (!wireless) {
    wireless = getMac(macAddresses, "wifi");
  }
  let ethernet = getMac(macAddresses, "ethernet");
  if (!ethernet) {
    ethernet = getMac(macAddresses, "eth");
  }
  if (!ethernet) {
    ethernet = getMac(macAddresses);
  }

  const primaryMacAddresses = [];
  if (wireless) {
    primaryMacAddresses.push(wireless);
  }
  if (ethernet) {
    primaryMacAddresses.push(ethernet);
  }

  return primaryMacAddresses;
}

module.exports = {
  primaryMacAddress,
};
