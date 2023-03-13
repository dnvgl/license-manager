function getMac(macAddresses, name) {
  // exact match first
  let m = macAddresses.find(
    (m) =>
      (!name ||
        (m.iface && name && m.iface.toLowerCase() === name.toLowerCase())) &&
      !m.internal &&
      m.mac &&
      m.mac !== "00:00:00:00:00:00"
  );

  if (m) {
    return m;
  }

  // then check for approximate matches
  m = macAddresses.find(
    (m) =>
      (!name ||
        (m.iface &&
          name &&
          m.iface.toLowerCase().indexOf(name.toLowerCase()) > -1)) &&
      !m.internal &&
      m.mac &&
      m.mac !== "00:00:00:00:00:00"
  );

  // then check for type matches
  m = macAddresses.find((m) => {
    (!name || (m.iface && name && m.type === name)) &&
      !m.internal &&
      m.mac &&
      m.mac !== "00:00:00:00:00:00";
  });

  return m;
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
    ethernet = getMac(macAddresses, "wired");
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
