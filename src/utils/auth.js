const LOGIN_EXPIRE_DAYS = 7;
const LOGIN_EXPIRE_MS = LOGIN_EXPIRE_DAYS * 24 * 60 * 60 * 1000;

export function clearAuthStorage() {
  localStorage.removeItem("articlue_current_user");
  localStorage.removeItem("isLogin");
  localStorage.removeItem("articlue_profile_name");
  localStorage.removeItem("articlue_profile_image");
  localStorage.removeItem("articlue_login_type");
  localStorage.removeItem("articlue_login_at");
  localStorage.removeItem("naver_oauth_state");
}

export function isLoginExpired() {
  const loginAt = localStorage.getItem("articlue_login_at");

  if (!loginAt) return true;

  const loginTime = Number(loginAt);

  if (!Number.isFinite(loginTime)) return true;

  return Date.now() - loginTime > LOGIN_EXPIRE_MS;
}

export function isAuthenticated() {
  const isLogin = localStorage.getItem("isLogin") === "true";
  const currentUser = localStorage.getItem("articlue_current_user");

  if (!isLogin || !currentUser) return false;

  if (isLoginExpired()) {
    clearAuthStorage();
    return false;
  }

  return true;
}

export function saveAuthUser(user) {
  const name = user.name || "Articlue 사용자";
  const loginType = user.loginType || user.provider || "local";

  localStorage.setItem("isLogin", "true");
  localStorage.setItem("articlue_current_user", JSON.stringify(user));
  localStorage.setItem("articlue_profile_name", name);
  localStorage.setItem("articlue_login_type", loginType);
  localStorage.setItem("articlue_login_at", String(Date.now()));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("articlue_current_user") || "null");
  } catch {
    return null;
  }
}

export function getLoginType() {
  return localStorage.getItem("articlue_login_type") || "";
}