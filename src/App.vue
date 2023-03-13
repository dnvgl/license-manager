<template>
  <b-container id="app">
    <generate-license class="p-4" />
  </b-container>
</template>

<script>
import GenerateLicense from "./components/GenerateLicense.vue";

export default {
  name: "App",
  components: {
    GenerateLicense,
  },
};
</script>
