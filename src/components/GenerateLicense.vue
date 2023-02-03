<template>
  <div class="p-6">
    <div align="center" v-if="status === 'Unauthorized' || status === 'Design'">
      <i class="fal fa-wifi-slash feedback-icon fail" aria-hidden="true"></i>
      <h1>No internet connection?</h1>
      <p>You are not authorized. Are you online?</p>
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div
      align="center"
      v-if="status === 'ProxyAuthError' || status === 'Design'"
    >
      <i class="fal fa-shield-check feedback-icon fail" aria-hidden="true"></i>
      <h1>No internet connection</h1>
      <p>Sign in failed due to restrictions from your firewall</p>
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div align="center" v-if="status === 'Offline' || status === 'Design'">
      <i class="fal fa-wifi-slash feedback-icon fail" aria-hidden="true"></i>
      <h1>No internet connection</h1>
      <p>Unable to load licenses. Are you online?</p>
      <b-button @click="init(true)" class="mr-2" variant="primary"
        >Retry</b-button
      >
      <b-button @click="close" variant="subtle">Exit</b-button>
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
      Select one or more licenses to
      <span class="avenir-medium">Activate</span> on this computer or
      <span class="avenir-medium">Reassign</span>
      to a single user on a different computer.
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

      <b-button
        @click="next"
        class="mr-2"
        variant="primary"
        :disabled="!selectedLicenses.length"
        >Activate</b-button
      >
      <b-button
        class="mr-2"
        @click="() => this.setStatus('Transfer')"
        variant="secondary"
        :disabled="!selectedLicenses.length"
        >Reassign</b-button
      >
      <b-button @click="close" style="float: right" variant="subtle"
        >Exit</b-button
      >
    </div>

    <div
      v-if="
        (status === 'Transfer' && availableLicenses.length) ||
        status === 'Design'
      "
    >
      <h1>Reassign licenses</h1>
      <p>
        The user who received this license will be notified by email. The email
        will provide information on how to activate this license.
      </p>
      <p>The following licenses will be reassigned:</p>
      <div class="p-1" style="background-color: #ccecf8">
        <div
          class="p-1"
          v-for="selectedLicense in selectedLicenses"
          :key="selectedLicense"
        >
          {{
            availableLicenses.filter(
              (a) => a.opportunityId === selectedLicense
            )[0].productInfo
          }}
        </div>
      </div>
      <b-form class="mb-2 mt-2" :novalidate="true">
        <b-form-group label="Email" label-for="input-email">
          <b-form-input
            id="input-email"
            placeholder="Enter the email of the person to reassign the license to"
            v-model="transfereeEmail"
            :state="emailValidation"
            required
          ></b-form-input>
          <b-form-invalid-feedback :state="emailValidation">
            This email looks invalid
          </b-form-invalid-feedback>
          <b-form-valid-feedback :state="emailValidation">
            This email looks good
          </b-form-valid-feedback>
        </b-form-group>
      </b-form>

      <b-button
        @click="transfer"
        class="mr-2"
        variant="primary"
        :disabled="!emailValidation || !selectedLicenses.length"
        >Reassign</b-button
      >
      <b-button @click="back" variant="subtle">Cancel</b-button>
    </div>

    <div v-if="status === 'Transferring' || status === 'Design'">
      Reassigning license

      <b-progress
        :value="100"
        :striped="true"
        :animated="true"
        v-show="true"
        variant="primary"
        class="mt-2"
      ></b-progress>
    </div>

    <div align="center" v-if="status === 'Transferred' || status === 'Design'">
      <i
        class="fal fa-check-circle feedback-icon success"
        aria-hidden="true"
      ></i>
      <h1>Licenses reassigned successfully</h1>
      <p>
        An email will be sent to {{ transfereeEmail }} to notify about the
        reassingment of the licenses
      </p>
      <b-button
        v-show="hasLicensesLeft"
        @click="back"
        class="mr-2"
        variant="primary"
        >Licenses</b-button
      >
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div v-if="status === 'TransferFailed' || status === 'Design'">
      <div align="center">
        <i
          class="fal fa-exclamation-circle feedback-icon fail"
          aria-hidden="true"
        ></i>
        <h1>{{ transferFailedMessage }}</h1>
        <p>
          We were not able to find {{ transfereeEmail }} in your company
          account. If this was unexpected plase contact our support team for
          assistance by submitting the form below.
        </p>
      </div>

      <b-form class="mb-2 mt-2" :novalidate="true">
        <b-form-group
          label="Message to support (optional)"
          label-for="input-comment"
        >
          <b-form-input
            id="input-comment"
            placeholder="Comment"
            v-model="transferFailedComment"
            required
          ></b-form-input>
        </b-form-group>
      </b-form>

      <b-button class="mr-2" @click="submitTransferFailed" variant="primary"
        >Submit</b-button
      >
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div
      align="center"
      v-if="status === 'TransferFailedSuccess' || status === 'Design'"
    >
      <i
        class="fal fa-check-circle feedback-icon success"
        aria-hidden="true"
      ></i>
      <h1>Support form successfully submitted</h1>
      <p>Someone from support will contact you soon</p>
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div
      align="center"
      v-if="status === 'TransferFailedFailed' || status === 'Design'"
    >
      <i
        class="fal fa-exclamation-circle feedback-icon fail"
        aria-hidden="true"
      ></i>
      <h1>Sending form failed</h1>
      <p>Please contact software.support@dnv.com</p>
      <b-button @click="close" variant="subtle">Exit</b-button>
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
      <b-button @click="init(true)" class="mr-2" variant="primary"
        >Refresh</b-button
      >
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div v-if="status === 'Generate' || status === 'Design'">
      <h1>Activate licenses</h1>

      Once you click Activate, the licenses will be available for use

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
      <h1>Licenses activated successfully</h1>
      <p>
        Your licenses are now activated and ready for use on this machine. A
        copy of your activated licenses has been saved to c:\flexlm
      </p>
      <b-button @click="close" variant="subtle">Exit</b-button>
    </div>

    <div align="center" v-if="status === 'Failed' || status === 'Design'">
      <i
        class="fal fa-exclamation-circle feedback-icon fail"
        aria-hidden="true"
      ></i>
      <h1>{{ licenseActivationFailedMessage }}</h1>
      <p>Please contact software.support@dnv.com</p>
      <b-button @click="close" variant="subtle">Exit</b-button>
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
      //baseUrl: "https://licenseactivation-xba.dnv.com",
      baseUrl: "https://licenseactivation-uat.dnv.com",
      //baseUrl: "https://licenseactivation.dnv.com",
      //baseUrl: "http://localhost:30009",
      status: "Init", //Design
      message: "",
      transferFailedMessage: "Reassignment failed",
      transferFailedComment: "",
      licenseActivationFailedMessage: "License activation failed",
      availableLicenses: [],
      selectedLicenses: [],
      value: 0,
      transfereeEmail: "",
    };
  },
  computed: {
    primaryMacAddress() {
      const result = primaryMacAddress(this.macAddresses);
      window.electron.log(result);
      return result;
    },
    primaryMac() {
      return this.primaryMacAddress
        .map((p) => {
          return p.mac.replace(/:/g, "");
        })
        .join(" ");
    },
    emailValidation() {
      if (!this.transfereeEmail.length) {
        return null;
      }

      const emailFormat =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
      return emailFormat.test(this.transfereeEmail.toLowerCase());
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
    hasLicensesLeft() {
      return this.availableLicenses.length - this.selectedLicenses.length;
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
    init(load) {
      this.setStatus("Init");
      this.selectedLicenses = [];

      if (this.token === "Unauthorized") {
        window.electron.log("unauthorized");
        this.status = "Unauthorized";
        return;
      }

      if (this.token === "ProxyAuthError") {
        window.electron.log("proxyautherror");
        this.status = "ProxyAuthError";
        return;
      }

      window.electron.log("loading licenses");

      if (load) {
        axios
          .get(`${this.baseUrl}/api/availableLicenses`, {
            headers: { Authorization: `Bearer ${this.token}` },
          })
          .then((al) => {
            if (this.status !== "Design") {
              this.availableLicenses = al.data;
              this.setStatus("Loaded");
            }
          })
          .catch((e) => {
            if (e.message === "Network Error") {
              this.setStatus("Offline");
            } else {
              this.setStatus("Loaded");
            }
            window.electron.error(e.message);
          });
      } else {
        this.setStatus("Loaded");
      }

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
    async transfer() {
      this.setStatus("Transferring");

      const payloadBase64 = this.token.split(".")[1]; // the payload is the second dot-separated component of the JWT
      const jwt = JSON.parse(
        Buffer.from(payloadBase64, "base64").toString("utf8")
      ); // Base64-decode and get the JSON payload

      for (let i = 0; i < this.selectedLicenses.length; i++) {
        const selectedLicense = this.selectedLicenses[i];

        await axios
          .post(
            `${this.baseUrl}/api/transferLicense/${selectedLicense}`,
            {
              newLicenseeEmail: this.transfereeEmail,
              fedId: jwt.userId,
            },
            {
              headers: { Authorization: `Bearer ${this.token}` },
            }
          )
          .then(() => {
            this.setStatus("Transferred");
          })
          .catch((e) => {
            if (e.message === "Network Error") {
              this.setStatus("Offline");
            } else {
              this.setStatus("TransferFailed");
              this.transferFailedMessage =
                "Reassignment failed for unknown reasons, please contact software.support@dnv.com";
            }

            if (e.response && e.response.status === 409) {
              this.transferFailedMessage =
                e.response.data.message ||
                "User must have the same account, please add comments and click “SUBMIT” to create a support ticket to solve the issue";
            }

            window.electron.error("not able to transfer license");
            window.electron.error(e.message);
          });
      }
    },
    back() {
      this.init(true);
    },
    async generate() {
      try {
        window.electron.log(`activating licenses for ${this.primaryMac}`);

        this.setStatus("Running");
        this.message = `Activating license using MAC ID(s) ${this.primaryMac}...`;

        const payloadBase64 = this.token.split(".")[1]; // the payload is the second dot-separated component of the JWT
        const jwt = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf8")
        ); // Base64-decode and get the JSON payload

        for (let i = 0; i < this.selectedLicenses.length; i++) {
          const selectedLicense = this.selectedLicenses[i];
          const productInfo = this.availableLicenses.find(
            (a) => a.opportunityId === selectedLicense
          ).productInfo;

          this.message = `Activating license for ${productInfo} using mac address ${this.primaryMac}...`;

          window.electron.log(this.message);

          this.value = ((i + 1) / this.selectedLicenses.length) * 100;

          const license = await axios
            .post(
              `${this.baseUrl}/api/generateLicense/${selectedLicense}`,
              {
                hostId: this.primaryMac,
                fedId: jwt.userId,
              },
              {
                headers: { Authorization: `Bearer ${this.token}` },
              }
            )
            .catch((e) => {
              if (e.message === "Network Error") {
                this.setStatus("Offline");
              } else {
                this.licenseActivationFailedMessage = `License activation failed for ${productInfo}`;
                this.setStatus("Failed");
              }
              window.electron.error("not able to generate license");
              window.electron.error(e.message);
            });

          if (license) {
            const contentDisposition = license.headers["content-disposition"];
            const filename = contentDisposition.substring(
              contentDisposition.indexOf("=") + 1
            );

            window.electron.writeLicenseFile(filename, license.data);
          } else {
            return;
          }
        }

        this.setStatus("Success");
      } catch (e) {
        this.setStatus("Failed");
        window.electron.error("not able to generate license");
        window.electron.error(e.message);
      }
    },
    async submitTransferFailed() {
      try {
        axios
          .post(
            `{this.baseUrl}/api/transferFailed/${this.selectedLicenses[0]}`,
            {
              comment: this.transferFailedComment,
              transfereeEmail: this.transfereeEmail,
            },
            {
              headers: { Authorization: `Bearer ${this.token}` },
            }
          )
          .catch((e) => {
            if (e.message === "Network Error") {
              this.setStatus("Offline");
            } else {
              this.setStatus("TransferFailedFailed");
            }
            window.electron.error("not able to send transfer failed message");
            window.electron.error(e.message);
          });
        this.setStatus("TransferFailedSuccess");
      } catch (e) {
        this.setStatus("TransferFailedFailed");
        window.electron.error("not able to generate license");
        window.electron.error(e.message);
      }
    },
    close() {
      window.close();
    },
  },
  mounted() {
    this.init(true);
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
