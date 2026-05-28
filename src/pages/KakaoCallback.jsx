import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuthUser } from "../utils/auth.js";

export default function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    const kakaoUser = {
      name: "카카오 사용자",
      email: "kakao@articlue.demo",
      provider: "kakao",
      loginType: "kakao",
      authCode: code,
      loginAt: new Date().toISOString(),
    };

    saveAuthUser(kakaoUser);

    const redirectPath = localStorage.getItem("redirectAfterLogin") || "/home";
    localStorage.removeItem("redirectAfterLogin");

    navigate(redirectPath, { replace: true });
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-[#0f172a]">
      <p className="text-lg font-black">카카오 로그인 처리 중...</p>
    </main>
  );
}