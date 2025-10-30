import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5118'
})

export default api
