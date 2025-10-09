import axios from "axios";
// const BASE_URL = "http://localhost:8080/api/students";
const BASE_URL = "http://160.30.113.40:8080/api/students";

export const studentService = {
    /**
     * Gọi API tìm kiếm (POST /students/search)
     * @param {Object} params - { page, size, keyword }
     */
    search: async (params = { page: 0, size: 10 }) => {
        const res = await axios.post(`${BASE_URL}/search`, params, {
            headers: { "Content-Type": "application/json" },
        });
        // Giả định backend trả về { content, totalElements, totalPages }
        return res.data;
    },
};