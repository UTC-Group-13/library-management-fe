import instance from "./axiosInstance";

const BASE_URL = "/admin";
// const BASE_URL = "http://160.30.113.40:8080/api/admin";

export const adminService = {

    info: async () => {
        const res = await instance.get(`${BASE_URL}/info`);
        return res.data;
    },
};