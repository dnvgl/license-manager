<template>
  <b-container id="app">
    <generate-license class="p-4" :mac-addresses="macAddress" />
  </b-container>
</template>

<script>
import GenerateLicense from "./components/GenerateLicense.vue";

export default {
  name: "App",
  components: {
    GenerateLicense,
  },
  data() {
    return {
      macAddress: window.electron.getMacAddress(),
    };
  },
};
</script>
