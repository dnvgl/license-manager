<template>
  <div id="app" class="container">
    <generate-license :mac-addresses="macAddress" />
  </div>
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
