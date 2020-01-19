<template>
  <v-app>
    <v-app-bar app color="green" dark>
      <div class="d-flex align-center">
        <v-toolbar-title>SMUG</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/team-thirty"
        target="_blank"
        color="green darken-2"
        depressed
      >
        <span class="mr-2">Code</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: "App"
};
</script>
