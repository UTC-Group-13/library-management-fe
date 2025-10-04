import axios from "axios";

const BASE_URL = "http://localhost:8080/api/books";

export const bookService = {
    getAll: async () => {
        const res = await axios.get(BASE_URL);
        return res.data;
    },
    create: async (data) => {
        const res = await axios.post(BASE_URL, data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await axios.put(`${BASE_URL}/${id}`, data);
        return res.data;
    },
    remove: async (id) => {
        await axios.delete(`${BASE_URL}/${id}`);
    },
};