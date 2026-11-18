import axios from 'axios'

const api = axios.create({
  baseURL: 'https://thebar.letsfriggen.party/api',
})

export default api