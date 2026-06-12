import api from "../api/axios.js";

export async function signup(payload) {
  const response = await api.post("/auth/signup", payload);
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get("/members/me");
  return response.data;
}

/**
 * GitHub 세션 ID 조회
 * - 기존 프론트에서 저장할 수 있는 이름들을 최대한 유지해서 찾는다.
 */
function getGithubSessionId() {
  return (
    localStorage.getItem("github_session_id") ||
    localStorage.getItem("social_session_id") ||
    localStorage.getItem("githubSessionId") ||
    localStorage.getItem("socialSessionId")
  );
}

/**
 * GitHub 세션 헤더 생성
 * - axios 공통 인터셉터에 넣지 않고 authApi 내부에서만 사용한다.
 */
function getGithubSessionHeaders() {
  const githubSessionId = getGithubSessionId();

  if (!githubSessionId) {
    return {};
  }

  return {
    "X-GitHub-Session-Id": githubSessionId,
    "X-Social-Session-Id": githubSessionId,
  };
}

/**
 * GitHub Device Flow 인증 코드 발급
 *
 * 기존 프론트에서 사용하는 함수명 유지:
 * githubAuthLogin
 */
export async function githubAuthLogin(payload = {}) {
  const response = await api.post("/github/auth/login", {
    scope: payload.scope || "read:user user:email repo",
    ...payload,
  });

  return response.data;
}

/**
 * GitHub Device Flow 토큰 발급
 *
 * 기존 프론트에서 사용하는 함수명 유지:
 * githubAuthToken
 */
export async function githubAuthToken(payload = {}) {
  const response = await api.post("/github/auth/token", payload);
  return response.data;
}

/**
 * GitHub 사용자 정보 조회
 *
 * 기존 프론트에서 사용하는 함수명 유지:
 * getGithubMe
 */
export async function getGithubMe() {
  const response = await api.get("/github/info", {
    headers: getGithubSessionHeaders(),
  });

  return response.data;
}