<template>
  <div class="mac">
    <fieldset>
      <legend>Mac address</legend>
      <b-form-select v-model="selected" :options="options"></b-form-select>
    </fieldset>
    <hr />

    <b-button @click="generate">Generate license</b-button>

    <hr />

    <b-progress
      :value="100"
      :striped="running"
      :animated="running"
      variant="primary"
      class="mt-2"
    ></b-progress>
    <span>{{ message }}</span>
  </div>
</template>

<script>
import axios from "axios";
import { primaryMacAddress } from "../mac-address";

export default {
  props: {
    macAddresses: Object,
  },
  data() {
    return {
      running: false,
      selected: undefined,
      message: "",
    };
  },
  computed: {
    primaryMacAddress() {
      return primaryMacAddress(this.macAddresses);
    },
    primaryMac() {
      return this.primaryMacAddress.mac.replace(/:/g, "");
    },
    options() {
      const result = [];
      for (const key in this.macAddresses) {
        if (Object.hasOwnProperty.call(this.macAddresses, key)) {
          const macAddress = this.macAddresses[key][0];
          if (macAddress && !macAddress.internal) {
            let option = {
              value: macAddress,
              text: `${key}: ${macAddress.mac}`,
            };
            result.push(option);
          }
        }
      }
      return result;
    },
  },
  methods: {
    async generate() {
      try {
        this.running = true;
        this.message = `Generating license using mac address ${this.selected.mac}`;

        const token = window.electron.getToken();
        const payloadBase64 = token.split(".")[1]; // the payload is the second dot-separated component of the JWT
        const jwt = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf8")
        ); // Base64-decode and get the JSON payload

        const license = await axios.post(
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/generateLicense"
            : "https://software-license-dev/api/generateLicense",
          {
            hostId: this.primaryMac,
            fedId: jwt.userId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const contentDisposition = license.headers["content-disposition"];
        const filename = contentDisposition.substring(
          contentDisposition.indexOf("=") + 1
        );

        window.electron.writeLicenseFile(filename, license.data);

        this.message = "License generation completed successfully";
      } catch {
        this.message = "License generation failed";
      } finally {
        this.running = false;
      }
    },
  },
  mounted() {
    const defaultOption = this.options.find(
      (o) => o.value.mac == this.primaryMacAddress.mac
    );

    this.selected = defaultOption ? defaultOption.value : undefined;
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
