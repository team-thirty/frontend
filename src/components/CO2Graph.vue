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
              beginAtZero: false
            },
            scaleLabel: {
              display: true,
              labelString: 'CO2 g/kWHr'
            }
          }
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Hours elapsed'
            }
          }
        ]
      },
      animation: {
        duration: 0
      },
      hover: {
        animationDuration: 0
      },
      responsiveAnimationDuration: 0
    }
  }),
  mounted() {
    this.renderChart(this.graphData, this.options);
  }
};
</script>
