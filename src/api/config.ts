import axios from "axios";

// Configuração base do axios
const api = axios.create({
  baseURL: "https://crud-produtos-awoy.onrender.com", // verifique a porta do NestJS
  // baseURL: "http://localhost:3000", // verifique a porta do NestJS
});

export default api;
