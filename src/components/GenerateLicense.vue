<template>
  <div class="pt-5">
    <div align="center" v-if="status === 'Unauthorized' || status === 'Design'">
      <i class="fal fa-wifi-slash feedback-icon fail" aria-hidden="true"></i>
      <p>You are not authorized. Are you online?</p>
      <b-button @click="close" variant="primary">Close</b-button>
    </div>

    <div
      align="center"
      v-if="status === 'ProxyAuthError' || status === 'Design'"
    >
      <i class="fal fa-shield-check feedback-icon fail" aria-hidden="true"></i>
      <h1>No internet connection</h1>
      <p>
        Sign in failed due to restrictions from your firewall
      </p>
      <b-button @click="close" variant="primary">Close</b-button>
    </div>

    <div align="center" v-if="status === 'Offline' || status === 'Design'">
      <i class="fal fa-wifi-slash feedback-icon fail" aria-hidden="true"></i>
      <h1>No internet connection</h1>
      <p>Unable to load licenses. Are you online?</p>
      <b-button @click="init" class="mr-2" variant="primary">Retry</b-button>
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

      <b-form-checkbox-group
        id="selectedLicenses"
        v-model="selectedLicenses"
        class="mb-3"
        stacked
      >
        <b-row
          v-for="availableLicense in availableLicenses"
          :key="availableLicense.opportunityId"
        >
          <b-col>
            <b-form-checkbox :value="availableLicense.opportunityId">
              {{ availableLicense.productInfo }}
            </b-form-checkbox>
            <hr />
          </b-col>

          <!--b-col class="text-right"
            >Expires {{ availableLicense.expires }}
          </b-col-->
        </b-row>
      </b-form-checkbox-group>

      <b-button @click="next" class="mr-2" variant="primary">Next</b-button>
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
        If you don't see any license here, please wait a few minutes and
        refresh. If you still don't see any licenses please contact
        software.support@dnv.com
      </p>
      <b-button @click="init" class="mr-2" variant="primary">Refresh</b-button>
      <b-button @click="close" variant="subtle">Close</b-button>
    </div>

    <div v-if="status === 'Generate' || status === 'Design'">
      <h1>Activate license</h1>

      Once you click Activate, the license will be available for use

      <b-form-group
        id="macInputGroup"
        label="Your MAC ID:"
        label-for="macInput"
        description="The MAC ID is used to lock the license to this machine.  Usually you can use the default MAC ID"
      >
        <b-form-select
          id="macInput"
          v-model="selected"
          :options="options"
        ></b-form-select>
      </b-form-group>

      <b-button @click="generate" class="mr-2" variant="primary"
        >Activate</b-button
      >
      <b-button @click="back" variant="subtle">Cancel</b-button>
    </div>

    <div v-if="status === 'Running' || status === 'Design'">
      {{ message }}

      <b-progress
        :value="value"
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
      <p>
        Your license is now activated and ready for use on this machine. A copy
        of your activated license has been saved to c:\flexlm
      </p>
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
      selectedLicenses: [],
      value: 0,
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

      if (this.token === "ProxyAuthError") {
        this.status = "ProxyAuthError";
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
          if (this.status !== "Design") {
            this.availableLicenses = al.data;
            this.setStatus("Loaded");
          }
        })
        .catch((e) => {
          console.log(e);
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

      if (this.status === "Design") {
        this.message = "Activating license ...";
        this.availableLicenses = [
          {
            opportunityId: "1",
            productInfo: "product 1, product 2, product 3, product 4",
            expires: "2020-10-10",
          },
          {
            opportunityId: "2",
            productInfo: "product 5",
            expires: "2020-10-10",
          },
        ];
      }
    },
    next() {
      this.setStatus("Generate");
    },
    back() {
      this.setStatus("Loaded");
    },
    async generate() {
      try {
        this.setStatus("Running");
        this.message = `Activating license using MAC ID ${this.selected.mac}...`;

        const payloadBase64 = this.token.split(".")[1]; // the payload is the second dot-separated component of the JWT
        const jwt = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf8")
        ); // Base64-decode and get the JSON payload

        for (let i = 0; i < this.selectedLicenses.length; i++) {
          const selectedLicense = this.selectedLicenses[i];

          this.message = `Activating license for ${
            this.availableLicenses.find(
              (a) => a.opportunityId === selectedLicense
            ).productInfo
          } using mac address ${this.selected.mac}...`;

          this.value = ((i + 1) / this.selectedLicenses.length) * 100;

          const license = await axios.post(
            process.env.NODE_ENV === "development"
              ? `http://localhost:3000/api/generateLicense/${selectedLicense}`
              : `https://software-license-dev.dnvgl.com/api/generateLicense/${selectedLicense}`,
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
        }

        this.setStatus("Success");
      } catch (e) {
        console.log("not able to load licenses");
        console.log(e);
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
  font-size: 4em;
}
</style>
