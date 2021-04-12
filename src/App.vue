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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
