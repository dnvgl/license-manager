<template>
  <div class="mac">
    <span>{{ message }}</span>
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
import { primaryMacAddress } from "../mac-address";

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
    message() {
      return this.running
        ? `Generating license using mac address ${this.primaryMacAddress}`
        : "Done";
    },
    primaryMacAddress() {
      return primaryMacAddress(this.macAddresses);
    },
  },
  async mounted() {
    this.running = true;

    const token = window.electron.getToken();
    const payloadBase64 = token.split(".")[1]; // the payload is the second dot-separated component of the JWT
    const jwt = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8")
    ); // Base64-decode and get the JSON payload

    const license = await axios.post(
      "http://localhost:3000/api/generateLicense",
      {
        hostId: this.primaryMacAddress,
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
