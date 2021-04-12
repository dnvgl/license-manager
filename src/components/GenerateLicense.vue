<template>
  <div class="mac">
    <span>{{ primaryMacAddress }}</span>
    <b-progress
      :value="100"
      :striped="running"
      :animated="running"
      variant="primary"
      class="mt-2"
    ></b-progress>
  </div>
</template>

<script>
import axios from "axios";

function getMac(macAddresses, name) {
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

export default {
  props: {
    macAddresses: Object,
  },
  data() {
    return {
      running: false,
    };
  },
  computed: {
    primaryMacAddress: function() {
      console.log(this.macAddresses);

      const wireless = getMac(this.macAddresses, "wireless");
      if (wireless) {
        return wireless.mac.replace(/:/g, "");
      }
      const wifi = getMac(this.macAddresses, "wifi");
      if (wifi) {
        return wifi.mac.replace(/:/g, "");
      }
      const ethernet = getMac(this.macAddresses, "ethernet");
      if (ethernet) {
        return ethernet.mac.replace(/:/g, "");
      }
      const eth = getMac(this.macAddresses, "eth");
      if (eth) {
        return eth.mac.replace(/:/g, "");
      }
      const def = getMac(this.macAddresses);
      if (def) {
        return def.mac.replace(/:/g, "");
      }
      return undefined;
    },
  },
  async mounted() {
    this.running = true;

    const token = window.electron.getToken();

    console.log(token);

    const license = await axios.post(
      "http://localhost:3000/api/generateLicense",
      {
        hostId: this.primaryMacAddress,
        fedId: "astrid",
      }
    );

    console.log(license);

    this.running = false;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
