import instance from "./axiosInstance";

const BASE_URL = "/book-loans";

export const bookLoanService = {
    // // POST /book-loans/search?page=&size=  (body: filters)
    // search: async (params = { page: 0, size: 10 }) => {
    //     const { page = 0, size = 10, ...filters } = params || {};
    //     const res = await instance.get(`${BASE_URL}/search?page=${page}&size=${size}`, filters);
    //     return res.data;
    // },

    // GET /book-loans/search?page=&size=&...filters
    search: async (params = { page: 0, size: 10 }) => {
        const { page = 0, size = 10, ...filters } = params || {};
        const res = await instance.get(`${BASE_URL}`, {
            params: { page, size, ...filters },
        });
        return res.data;
    },


    // POST /book-loans
    create: async (payload) => {
        const res = await instance.post(BASE_URL, payload);
        return res.data;
    },

    // PUT /book-loans/{id}
    update: async (id, payload) => {
        const res = await instance.put(`${BASE_URL}/${id}`, payload);
        return res.data;
    },

    // DELETE /book-loans/{id}
    remove: async (id) => {
        const res = await instance.delete(`${BASE_URL}/${id}`);
        return res.data;
    },

    // GET /book-loans/{id}
    getById: async (id) => {
        const res = await instance.get(`${BASE_URL}/${id}`);
        return res.data;
    },
};