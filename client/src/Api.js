import axios from "axios";

export default axios.create({
  baseURL: "http://localhost/awp-pictures/api/public",
  responseType: "json"
});