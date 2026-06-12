import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveAuthUser } from "../utils/auth.js";

export default function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function login() {
      try {
        const code =
          new URL(window.location.href)
            .searchParams
            .get("code");

        if (!code) {
          alert("카카오 인가코드가 없습니다.");
          navigate("/login");
          return;
        }

        const response =
          await axios.post(
            "http://localhost:3000/api/auth/kakao",
            {
              code,
            }
          );

        const user =
          response.data.data;

        saveAuthUser(user);

        const redirectPath =
          localStorage.getItem(
            "redirectAfterLogin"
          ) || "/home";

        localStorage.removeItem(
          "redirectAfterLogin"
        );

        navigate(
          redirectPath,
          { replace: true }
        );

      } catch (error) {

        console.error(error);

        alert(
          error.response?.data?.message ||
          "카카오 로그인 실패"
        );

        navigate("/login");
      }
    }

    login();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-[#0f172a]">
      <p className="text-lg font-black">
        카카오 로그인 처리 중...
      </p>
    </main>
  );
}