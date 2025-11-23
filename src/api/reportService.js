import instance from "./axiosInstance";

const BASE_URL = "/reports";

export const reportService = {
    getSummaryRange: async (start, end) => {
        const res = await instance.get(
            `${BASE_URL}/daily-range?start=${start}&end=${end}`
        );
        return res.data;
    },

    getOverdueRange: async (start, end) => {
        const res = await instance.get(
            `${BASE_URL}/overdue-range?start=${start}&end=${end}`
        );
        return res.data;
    },
};
