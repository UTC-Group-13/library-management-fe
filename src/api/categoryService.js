import axios from "axios";
const BASE_URL = "http://localhost:8080/api/categories";

export const categoryService = {
    getAll: async () => (await axios.get(BASE_URL)).data,
    create: async (data) => (await axios.post(BASE_URL, data)).data,
    update: async (id, data) => (await axios.put(`${BASE_URL}/${id}`, data)).data,
    remove: async (id) => axios.delete(`${BASE_URL}/${id}`),
};