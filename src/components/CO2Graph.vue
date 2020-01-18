<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    graphData: Object
  },
  data: () => ({
    options: {
      responsive: false,
      // maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  }),
  mounted() {
    console.log(this.graphData);
    this.renderChart(this.graphData, this.options);
  }
};
</script>
