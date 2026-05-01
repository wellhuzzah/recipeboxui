import axios from 'axios'

const api = axios.create({
  baseURL: 'https://bar.letsfriggen.party/api',
})

export default api