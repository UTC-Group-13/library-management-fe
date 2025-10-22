import instance from "./axiosInstance";
// const BASE_URL = "http://localhost:8080/api/categories";
const BASE_URL = "/categories";

export const categoryService = {
    /**
     * Gọi API tìm kiếm (POST /categories/search)
     * @param {Object} params - { page, size, keyword }
     */
    search: async (params = { page: 0, size: 10 }) => {
        const res = await instance.post(`${BASE_URL}/search`, params, {
            headers: { "Content-Type": "application/json" },
        });
        // Giả định backend trả về { content, totalElements, totalPages }
        return res.data;
    },

    getAll: async () => {
        const res = await instance.get(BASE_URL);
        return res.data;
    },

    create: async (data) => {
        const res = await instance.post(BASE_URL, data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await instance.put(`${BASE_URL}/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        await instance.delete(`${BASE_URL}/${id}`);
    },
};