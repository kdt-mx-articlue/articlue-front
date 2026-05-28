import { useEffect } from "react";
import { saveAuthUser } from "../utils/auth.js";

export default function NaverCallback() {
  useEffect(() => {
    const url = new URL(window.location.href);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    const savedState = localStorage.getItem("naver_oauth_state");

    if (error) {
      console.error("네이버 로그인 오류:", error, errorDescription);
      localStorage.removeItem("naver_oauth_state");
      window.location.replace("/login");
      return;
    }

    if (!code || !state) {
      console.error("네이버 로그인 실패: code 또는 state가 없습니다.");
      localStorage.removeItem("naver_oauth_state");
      window.location.replace("/login");
      return;
    }

    if (savedState && savedState !== state) {
      console.error("네이버 로그인 실패: state 값이 일치하지 않습니다.");
      localStorage.removeItem("naver_oauth_state");
      window.location.replace("/login");
      return;
    }

    const naverUser = {
      name: "네이버 사용자",
      email: "naver@articlue.demo",
      provider: "naver",
      loginType: "naver",
      authCode: code,
      state,
      loginAt: new Date().toISOString(),
    };

    saveAuthUser(naverUser);

    localStorage.removeItem("naver_oauth_state");

    const savedRedirectPath = localStorage.getItem("redirectAfterLogin");

    const redirectPath =
      savedRedirectPath && savedRedirectPath !== "/login"
        ? savedRedirectPath
        : "/home";

    localStorage.removeItem("redirectAfterLogin");

    window.location.replace(redirectPath);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-[#0f172a]">
      <p className="text-lg font-black">네이버 로그인 처리 중...</p>
    </main>
  );
}