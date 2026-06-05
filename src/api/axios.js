import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("인증이 만료되었거나 로그인이 필요합니다.");
    }

    if (status >= 500) {
      console.error("서버 오류가 발생했습니다.", error);
    }

    return Promise.reject(error);
  }
);

export default api;