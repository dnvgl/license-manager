<template>
  <div>
    <b-form-group
      id="input-group-1"
      label="Mac address:"
      label-for="macInput"
      description="We need your mac address to generate a license for your machine.  Usually you can use the default"
    >
      <b-form-select
        id="macInput"
        v-model="selected"
        :options="options"
      ></b-form-select>
    </b-form-group>

    <hr />

    <b-button @click="generate">Generate license</b-button>

    <hr />

    <b-progress
      :value="100"
      :striped="running"
      :animated="running"
      v-show="showProgress"
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
      showProgress: false,
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
        this.showProgress = true;
        this.message = `Generating license using mac address ${this.selected.mac}`;

        const token = window.electron.getToken();
        const payloadBase64 = token.split(".")[1]; // the payload is the second dot-separated component of the JWT
        const jwt = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf8")
        ); // Base64-decode and get the JSON payload

        const license = await axios.post(
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/generateLicense"
            : "https://software-license-dev.dnvgl.com/api/generateLicense",
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

        const loc = window.electron.writeLicenseFile(filename, license.data);

        this.message = `License written to ${loc}`;
      } catch (e) {
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
