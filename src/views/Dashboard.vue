<template>
  <div class="dashboard">
    <v-container>
      <v-layout>
        <!-- Graph -->
        <v-flex sm12 md9>
          <span v-if="loading">
            <v-overlay :value="loading">
              <v-progress-circular indeterminate size="64" />
            </v-overlay>
          </span>
          <CO2Graph
            v-else
            :width="calcWidth()"
            height="400"
            :graphData="graphData"
            :refreshProp="refreshProp"
          />
        </v-flex>

        <v-flex id="sidePanel" sm12 md3>
          <v-row>
            <v-text-field label="Postcode" outlined :value="postcode" />
          </v-row>
          <v-row>
            <v-switch
              v-model="manual"
              label="Manual control"
              color="primary"
              @click="updateManualLine()"
            />
          </v-row>
          <v-row v-if="manual">
            <v-slider
              v-model="threshold"
              vertical
              label="CO2 concentration threshold"
            />
          </v-row>
          <v-row v-else>
            <v-col>
              <v-text-field
                v-model="time"
                label="Charging time"
                outlined
                type="number"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="window"
                label="Charging window"
                outlined
                type="number"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-btn @click="applyConfig" class="white--text" color="green"
              >Apply</v-btn
            >
          </v-row>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import CO2Graph from "@/components/CO2Graph.vue";
import { getData, sendConfig } from "@/backend.js";
// eslint-disable-next-line
const labels24hr = [ -24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1 ];

export default {
  name: "home",
  components: {
    CO2Graph
  },
  data: () => ({
    loading: true,
    postcode: "CB1",
    threshold: 130,
    manual: false,
    time: 3,
    window: 8,
    refreshProp: 1,
    graphData: {
      labels: labels24hr,
      datasets: [
        {
          // eslint-disable-next-line
          data: [ 100, 120, 135, 130, 120, 105, 107, 100, 102, 112, 120, 143, 150, 153, 150, 145, 143, 160, 140, 130, 128, 125, 123, 143 ],
          label: "Carbon intensity g/kWHr ",
          borderColor: "#3e95cd",
          fill: false
        }
      ]
    }
  }),
  methods: {
    calcWidth() {
      if (window.innerWidth > 800) {
        return (2 / 3) * window.innerWidth;
      } else {
        return window.innerWidth - 100;
      }
    },
    applyConfig() {
      sendConfig(this.manual, this.threshold, this.time, this.window);
    },
    updateManualLine() {
      if (this.manual) {
        this.graphData.datasets.append({
          label: "Threshold",
          borderColor: "#0000ff",
          fill: false
        });
      } else {
        if (this.graphData.datasets.length == 2) {
          this.graphData.datasets.pop();
        }
      }
      this.refreshProp += 1;
    }
  },
  mounted() {
    getData(this.postcode).then(resp => {
      this.loading = false;
      this.graphData.datasets.data = resp.data;
    });
  }
};
</script>

<style>
#sidePanel {
  margin-top: 20px;
}
</style>
