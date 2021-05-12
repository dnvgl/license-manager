<template>
  <div class="pt-5">
    <div align="center" v-if="status === 'Unauthorized' || status === 'Design'">
      <i class="fal fa-wifi-slash feedback-icon fail" aria-hidden="true"></i>
      <p>You are not authorized. Are you online?</p>
      <b-button @click="close" variant="primary">Close</b-button>
    </div>

    <div align="center" v-if="status === 'Offline' || status === 'Design'">
      <i class="fal fa-wifi-slash feedback-icon fail" aria-hidden="true"></i>
      <p>Unable to load licenses. Are you online?</p>
      <b-button class="mr-2" @click="init" variant="primary">Retry</b-button>
      <b-button @click="close" variant="subtle">Close</b-button>
    </div>

    <div v-if="status === 'Init' || status === 'Design'">
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

    <div
      v-if="
        (status === 'Loaded' && availableLicenses.length) || status === 'Design'
      "
    >
      <h1>Available licenses</h1>
      <hr />
      <p :key="al.Id" v-for="al in availableLicenses">
        {{ al.Product_Name2__c }}
      </p>
      <hr />
      <b-button class="mr-2" variant="primary" @click="next">Next</b-button>
      <b-button @click="close" variant="subtle">Close</b-button>
    </div>

    <div
      align="center"
      v-if="
        (status === 'Loaded' && !availableLicenses.length) ||
          status === 'Design'
      "
    >
      <i class="fal fa-empty-set feedback-icon fail" aria-hidden="true"></i>
      <h1>No available licenses found</h1>
      <p>
        If you expected to see a license here please contact
        software.support@dnv.com
      </p>
      <b-button @click="close" variant="primary">Close</b-button>
    </div>

    <div v-if="status === 'Generate' || status === 'Design'">
      <h1>Activate License</h1>

      Once you click 'Activate' the license will be activated and available for
      use.

      <b-form-group
        id="input-group-1"
        label="Your mac id:"
        label-for="macInput"
        description="We need your mac address to activate a license for your machine.  Usually you can use the default"
      >
        <b-form-select
          id="macInput"
          v-model="selected"
          :options="options"
        ></b-form-select>
      </b-form-group>

      <b-button class="mr-2" variant="primary" @click="generate"
        >Activate</b-button
      >
      <b-button variant="subtle" @click="cancel">Cancel</b-button>
    </div>

    <div v-if="status === 'Running' || status === 'Design'">
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

    <div align="center" v-if="status === 'Success' || status === 'Design'">
      <i
        class="fal fa-check-circle feedback-icon success"
        aria-hidden="true"
      ></i>
      <h1>License activated successfully</h1>
      <p>Your license is now activated</p>
      <b-button @click="close" variant="primary">Close</b-button>
    </div>

    <div align="center" v-if="status === 'Failed' || status === 'Design'">
      <i
        class="fal fa-exclamation-circle feedback-icon fail"
        aria-hidden="true"
      ></i>
      <h1>License activation failed</h1>
      <p>Please contact software.support@dnv.com</p>
      <b-button @click="close" variant="primary">Close</b-button>
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
      status: "Init", //Design
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
    setStatus(status) {
      if (this.status !== "Design") {
        this.status = status;
      }
    },
    init() {
      if (this.token === "Unauthorized") {
        this.status = "Unauthorized";
        return;
      }

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
          this.setStatus("Loaded");

          if (this.status === "Design") {
            this.message = "Activating license ...";
            this.availableLicenses = [
              { Id: "test", Product_Name2__c: "Test product" },
            ];
          }
        })
        .catch((e) => {
          if (e.message === "Network Error") {
            this.setStatus("Offline");
          } else {
            this.setStatus("Loaded");
          }
        });

      const defaultOption = this.options.find(
        (o) => o.value.mac == this.primaryMacAddress.mac
      );

      this.selected = defaultOption ? defaultOption.value : undefined;
    },
    next() {
      this.setStatus("Generate");
    },
    async generate() {
      try {
        this.setStatus("Running");
        this.message = `Activating license using mac address ${this.selected.mac}...`;

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

        this.setStatus("Success");
      } catch (e) {
        console.log("not able to load licenses");
        this.setStatus("Failed");
      }
    },
    close() {
      window.close();
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style scoped>
.success {
  color: #36842d;
}

.fail {
  color: #c4262e;
}

.feedback-icon {
  font-size: 7em;
}
</style>
