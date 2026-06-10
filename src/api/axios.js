import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getApiErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "서버 응답 시간이 초과되었습니다.";
  }

  if (!error?.response) {
    return "서버에 연결할 수 없습니다.";
  }

  const status = error.response.status;
  const serverMessage =
    error.response.data?.message ||
    error.response.data?.error ||
    error.response.data?.detail;

  if (serverMessage) return serverMessage;

  if (status === 400) return "요청 형식이 올바르지 않습니다.";
  if (status === 401) return "로그인이 필요하거나 인증이 만료되었습니다.";
  if (status === 403) return "접근 권한이 없습니다.";
  if (status === 404) return "요청한 API를 찾을 수 없습니다.";
  if (status === 408) return "요청 시간이 초과되었습니다.";
  if (status === 409) return "이미 존재하는 데이터입니다.";
  if (status === 422) return "입력값을 다시 확인해 주세요.";
  if (status === 500) return "서버 내부 오류가 발생했습니다.";
  if (status === 502) return "백엔드 서버 연결에 실패했습니다.";
  if (status === 503) return "서버가 일시적으로 사용할 수 없습니다.";
  if (status === 504) return "서버 응답 시간이 초과되었습니다.";

  return "요청 처리 중 오류가 발생했습니다.";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = getApiErrorMessage(error);

    error.userMessage = message;

    if (status === 401) {
      console.warn(message);
    } else if (status >= 500 || !error?.response) {
      console.error(message, error);
    } else {
      console.warn(message, error);
    }

    return Promise.reject(error);
  }
);

export { getApiErrorMessage };
export default api;