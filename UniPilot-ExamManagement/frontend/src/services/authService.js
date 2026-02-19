import api from "../utils/api.js";

export const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  async refreshToken() {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};
