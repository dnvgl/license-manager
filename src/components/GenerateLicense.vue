<template>
  <div>
    <b-alert :show="status === 'Unauthorized'" variant="warning">
      You are not authorized. Are you online?
    </b-alert>

    <div v-if="status === 'Init'">
      Loading....
      <b-progress
        :value="100"
        :striped="true"
        :animated="true"
        v-show="true"
        variant="primary"
        class="mt-2"
      ></b-progress>
    </div>

    <div v-if="status === 'Loaded' && availableLicenses.length">
      <h1>Available licenses</h1>
      <ul>
        <li :key="al.Id" v-for="al in availableLicenses">
          {{ al.Product_Name2__c }}
        </li>
      </ul>
      <b-button @click="next">Next</b-button>
    </div>

    <div v-if="status === 'Loaded' && !availableLicenses.length">
      <b-alert show variant="danger">
        <h2>No available licenses found</h2>
        <p>Please contact support.</p>
      </b-alert>
    </div>

    <div v-if="status === 'Generate'">
      <h1>Generate License</h1>

      Once you click 'Generate' the license will be activated and available for
      use.

      <b-form-group
        id="input-group-1"
        label="Your mac id:"
        label-for="macInput"
        description="We need your mac address to generate a license for your machine.  Usually you can use the default"
      >
        <b-form-select
          id="macInput"
          v-model="selected"
          :options="options"
        ></b-form-select>
      </b-form-group>

      <b-button @click="generate">Generate</b-button>
    </div>

    <div v-if="status === 'Running'">
      {{ message }}

      <b-progress
        :value="100"
        :striped="true"
        :animated="true"
        v-show="true"
        variant="primary"
        class="mt-2"
      ></b-progress>
    </div>

    <div v-if="status === 'Success'">
      <b-alert show variant="info">
        <h2>License generated successfully</h2>
        <p>Your license is now activated.</p>
      </b-alert>
    </div>

    <div v-if="status === 'Failed'">
      <b-alert show variant="danger">
        <h2>License generation failed</h2>
        <p>Please contact support.</p>
      </b-alert>
    </div>
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
      status: "Init",
      selected: undefined,
      message: "",
      availableLicenses: [],
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
      let def = true;
      const result = [];
      for (const key in this.macAddresses) {
        if (Object.hasOwnProperty.call(this.macAddresses, key)) {
          const macAddress = this.macAddresses[key][0];
          if (macAddress && !macAddress.internal) {
            let option = {
              value: macAddress,
              text: `${key}: ${macAddress.mac} ${def ? "(default)" : ""}`,
            };
            def = false;
            result.push(option);
          }
        }
      }
      return result;
    },
    token() {
      return window.electron.getToken();
    },
  },
  methods: {
    next() {
      this.status = "Generate";
    },
    async generate() {
      try {
        this.status = "Running";
        this.message = `Generating license using mac address ${this.selected.mac}...`;

        const payloadBase64 = this.token.split(".")[1]; // the payload is the second dot-separated component of the JWT
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
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );

        const contentDisposition = license.headers["content-disposition"];
        const filename = contentDisposition.substring(
          contentDisposition.indexOf("=") + 1
        );

        window.electron.writeLicenseFile(filename, license.data);

        this.status = "Success";
      } catch (e) {
        this.status = "Failed";
      }
    },
  },
  mounted() {
    axios
      .get(
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/availableLicenses"
          : "https://software-license-dev.dnvgl.com/api/availableLicenses",
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      )
      .then((al) => {
        this.availableLicenses = al.data;
        this.status = "Loaded";
      });

    const defaultOption = this.options.find(
      (o) => o.value.mac == this.primaryMacAddress.mac
    );

    this.selected = defaultOption ? defaultOption.value : undefined;

    if (this.token === "Unauthorized") {
      this.status = "Unauthorized";
    }
  },
};
</script>
