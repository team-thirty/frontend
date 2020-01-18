import axios from "axios";
const URL = "https://team30app0.azurewebsites.net";

export function getData(postcode) {
  return axios.get(`${URL}/get_graph_data`, {
    params: {
      postcode: postcode
    }
  });
}

export function sendConfig(manual, threshold, time, window) {
  return axios.post(`${URL}/set_params`, {
    manual,
    threshold,
    time,
    window
  });
}