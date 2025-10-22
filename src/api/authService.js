import instance from "./axiosInstance";

const BASE_URL = "/auth";

export const authService = {
  login: async (username, password) => {
    const res = await instance.post(`${BASE_URL}/login`, { username, password });
    return res.data; // { token, expiresAt }
  },

  refreshToken: async (token) => {
    const res = await instance.post(
      `${BASE_URL}/refresh-token`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    return res.data;
  },
};
