<template>
  <div class="dashboard">
    <v-container>
      <v-layout>
        <!-- Graph -->
        <v-flex sm12 md9>
          <v-row>
            <span v-if="loading">
              <v-overlay :value="loading">
                <v-progress-circular indeterminate size="64" />
              </v-overlay>
              <h2>It's another API being slow, it's not us</h2>
            </span>
            <CO2Graph
              v-else
              :width="calcWidth()"
              height="400"
              :graphData="graphData"
              :key="refreshProp"
            />
          </v-row>
          <v-row>
            <v-switch v-model="forecast" label="Forecast" color="primary" />
          </v-row>
        </v-flex>

        <v-flex id="sidePanel" sm12 md3>
          <v-row>
            <v-col>
              <v-text-field label="Postcode" outlined v-model="postcode" />
            </v-col>
            <v-col>
              <v-btn
                id="updateBtn"
                color="green"
                outlined
                large
                @click="fetchGraphData()"
              >
                update
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-switch v-model="manual" label="Manual control" color="primary" />
          </v-row>
          <v-row v-if="manual">
            <v-slider
              v-model="threshold"
              max="300"
              vertical
              label="CO2 concentration threshold"
              @input="updateThresh()"
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
            <v-col>
            <v-btn @click="applyConfig" class="white--text" color="green"
              >Apply</v-btn
            >
            </v-col>
            <v-col>
              <v-chip v-if="saving" id="savingChip" color="green" dark> CO2 saving: {{ Math.trunc(saving) }}%</v-chip>
            </v-col>
          </v-row>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import CO2Graph from "@/components/CO2Graph.vue";
import { getData, sendConfig } from "@/backend.js";
// const labels24hr = [ -48,-47,-46,-45,-44,-43,-42,-41,-40,-39,-38,-37,-36,-35,-34,-33,-32,-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1 ];
// eslint-disable-next-line
const labels24hr = [-24.0, -23.5, -23.0, -22.5, -22.0, -21.5, -21.0, -20.5, -20.0, -19.5, -19.0, -18.5, -18.0, -17.5, -17.0, -16.5, -16.0, -15.5, -15.0, -14.5, -14.0, -13.5, -13.0, -12.5, -12.0, -11.5, -11.0, -10.5, -10.0, -9.5, -9.0, -8.5, -8.0, -7.5, -7.0, -6.5, -6.0, -5.5, -5.0, -4.5, -4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5];
// eslint-disable-next-line
const labels48hr = [-24.0, -23.5, -23.0, -22.5, -22.0, -21.5, -21.0, -20.5, -20.0, -19.5, -19.0, -18.5, -18.0, -17.5, -17.0, -16.5, -16.0, -15.5, -15.0, -14.5, -14.0, -13.5, -13.0, -12.5, -12.0, -11.5, -11.0, -10.5, -10.0, -9.5, -9.0, -8.5, -8.0, -7.5, -7.0, -6.5, -6.0, -5.5, -5.0, -4.5, -4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 14.5, 15.0, 15.5, 16.0, 16.5, 17.0, 17.5, 18.0, 18.5, 19.0, 19.5, 20.0, 20.5, 21.0, 21.5, 22.0, 22.5, 23.0, 23.5 ];


export default {
  name: "home",
  components: {
    CO2Graph
  },
  data: () => ({
    loading: true,
    forecast: false,
    postcode: "CB1",
    threshold: 130,
    manual: false,
    graphPoints: 24,
    time: 12,
    window: 20,
    refreshProp: 1,
    saving: 0,
    pastData: [],
    forecastData: [],
    graphData: {
      labels: labels24hr,
      datasets: [
        {
          label: "Carbon intensity g/kWHr ",
          borderColor: "#3e95cd",
          fill: false
        }
      ]
    }
  }),
  watch: {
    manual: function() {
      this.updateThresh();
    },
    forecast: function() {
      this.updateGraphSeries();
    }
  },
  methods: {
    calcWidth() {
      if (window.innerWidth > 800) {
        return (2 / 3) * window.innerWidth;
      } else {
        return window.innerWidth - 100;
      }
    },
    applyConfig() {
      sendConfig(this.manual, this.threshold, this.time, this.window).then(
        resp => {
          console.log("returned");
          console.log(resp);
          this.saving =
            (100 * (resp.data.dumb_sum - resp.data.smart_sum)) /
            resp.data.dumb_sum;
        }
      );
    },
    updateThresh() {
      if (this.manual) {
        if (this.graphData.datasets.length == 2) {
          this.graphData.datasets[1].data = Array(this.graphPoints).fill(
            this.threshold
          );
        } else {
          this.graphData.datasets.push({
            label: "Threshold",
            borderColor: "#663399",
            data: Array(this.graphPoints).fill(this.threshold),
            fill: true
          });
        }
      } else {
        if (this.graphData.datasets.length == 2) {
          this.graphData.datasets.pop();
        }
      }
      this.refreshProp += 1;
    },
    fetchGraphData() {
      this.loading = true;
      getData(this.postcode).then(resp => {
        this.pastData = resp.data.past_data;
        this.forecastData = resp.data.future_data;
        this.graphData.datasets[0].data = resp.data.data;
        this.loading = false;
        this.refreshProp += 1;
        this.updateGraphSeries();
      });
    },
    updateGraphSeries() {
      if (this.forecast) {
        this.graphData.labels = labels48hr;
        this.graphPoints = 96;
        this.graphData.datasets[0].data = this.pastData.concat(
          this.forecastData
        );
      } else {
        this.graphData.labels = labels24hr;
        this.graphPoints = 48;
        this.graphData.datasets[0].data = this.pastData;
      }
      this.updateThresh();
      this.refreshProp += 1;
    }
  },
  mounted() {
    this.fetchGraphData();
  }
};
</script>

<style>
#sidePanel {
  margin-top: 20px;
}
#updateBtn {
  height: 55px;
}
#savingChip {
  /* margin-top: 10px; */
}
</style>
