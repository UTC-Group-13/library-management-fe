import axios from "axios";

// const BASE_URL = "http://localhost:8080/api/books";
const BASE_URL = "http://160.30.113.40:8080/api/books";

export const bookService = {
    /**
     * Gọi API tìm kiếm (POST /authors/search)
     * @param {Object} params - { page, size, keyword }
     */
    search: async (params = {page: 0, size: 10}) => {
        const res = await axios.post(`${BASE_URL}/search`, params, {
            headers: {"Content-Type": "application/json"},
        });
        // Giả định backend trả về { content, totalElements, totalPages }
        return res.data;
    },

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

    delete: async (id) => {
        await axios.delete(`${BASE_URL}/${id}`);
    },
};