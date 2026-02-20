import axios from "axios"

const $http = axios.create({
  baseURL: "",
  headers: { "Cache-Control": "no-cache" },
  timeout: 60 * 1000,
})
