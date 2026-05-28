import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuthUser } from "../utils/auth.js";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const getSavedUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("articlue_users")) || [];
    } catch {
      return [];
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();

    setEmailError(false);
    setPasswordError(false);

    const normalizedEmail = email.trim().toLowerCase();
    const users = getSavedUsers();

    const matchedUser = users.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail
    );

    if (!matchedUser) {
      setEmailError(true);
      showToast("가입된 회원 정보가 없습니다. 회원가입 후 이용해 주세요.");
      return;
    }

    if (matchedUser.password !== password) {
      setPasswordError(true);
      showToast("비밀번호가 일치하지 않습니다.");
      return;
    }

    const userName = matchedUser.name || "Articlue 사용자";

    saveAuthUser({
      name: userName,
      email: matchedUser.email,
      loginType: "local",
      provider: "local",
      loginAt: new Date().toISOString(),
    });

    showToast("로그인 되었습니다.");

    setTimeout(() => {
      const redirectPath =
        localStorage.getItem("redirectAfterLogin") || "/resume";

      localStorage.removeItem("redirectAfterLogin");

      navigate(redirectPath, { replace: true });
    }, 1000);
  };

  const showSocialLoginNotice = () => {
    showToast(
      "해당 소셜 로그인은 현재 준비 중입니다. 시연 버전에서는 일반 로그인 기능을 이용해주세요."
    );
  };

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_JS_KEY;
    const REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";

    if (!KAKAO_CLIENT_ID) {
      showToast("카카오 JavaScript Key가 설정되지 않았습니다.");
      return;
    }

    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code`;

    window.location.href = kakaoURL;
  };

  const handleNaverLogin = () => {
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const REDIRECT_URI = "http://localhost:5173/auth/naver/callback";

    if (!NAVER_CLIENT_ID) {
      showToast("네이버 Client ID가 설정되지 않았습니다.");
      return;
    }

    const state = Math.random().toString(36).substring(2);
    localStorage.setItem("naver_oauth_state", state);

    const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&state=${state}`;

    window.location.href = naverURL;
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <section className="w-full max-w-[460px] bg-white border border-[#e2e8f0] rounded-[28px] p-[36px] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <Link
          to="/"
          className="mb-[14px] flex justify-center text-[32px] font-black text-[#2563eb] no-underline"
        >
          Articlue.
        </Link>

        <h1 className="mb-[10px] text-center text-[28px] font-black text-[#0f172a]">
          로그인
        </h1>

        <p className="mb-[30px] text-center text-[14px] leading-[1.7] text-[#475569]">
          로그인 후 맞춤형 이력서 작성과 AI 기반 취업 분석 기능을 이용할 수
          있습니다.
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-[18px]">
            <label
              htmlFor="loginEmailInput"
              className="mb-2 block text-[14px] font-extrabold text-[#0f172a]"
            >
              이메일
            </label>

            <input
              id="loginEmailInput"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`h-[52px] w-full rounded-2xl border px-4 text-[15px] text-[#0f172a] outline-none ${
                emailError
                  ? "border-[#ef4444] bg-[#fef2f2]"
                  : "border-[#e2e8f0] bg-[#f1f5f9] focus:border-[#2563eb]"
              }`}
            />

            {emailError && (
              <div className="mt-2 text-[12px] font-black text-[#ef4444]">
                가입되지 않은 이메일입니다.
              </div>
            )}
          </div>

          <div className="mb-[18px]">
            <label
              htmlFor="loginPasswordInput"
              className="mb-2 block text-[14px] font-extrabold text-[#0f172a]"
            >
              비밀번호
            </label>

            <input
              id="loginPasswordInput"
              type="password"
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`h-[52px] w-full rounded-2xl border px-4 text-[15px] text-[#0f172a] outline-none ${
                passwordError
                  ? "border-[#ef4444] bg-[#fef2f2]"
                  : "border-[#e2e8f0] bg-[#f1f5f9] focus:border-[#2563eb]"
              }`}
            />

            {passwordError && (
              <div className="mt-2 text-[12px] font-black text-[#ef4444]">
                비밀번호가 일치하지 않습니다.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-[10px] h-[54px] w-full rounded-full border-0 bg-[#2563eb] text-[15px] font-black text-white transition hover:bg-[#1d4ed8]"
          >
            로그인
          </button>

          <div className="mt-5">
            <div className="my-5 flex items-center gap-3 text-[12px] font-extrabold text-[#475569] before:h-px before:flex-1 before:bg-[#e2e8f0] after:h-px after:flex-1 after:bg-[#e2e8f0]">
              간편 로그인
            </div>

            <div className="flex items-center justify-center gap-[14px]">
              <button
                type="button"
                aria-label="카카오톡 로그인"
                title="카카오톡 로그인"
                onClick={handleKakaoLogin}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                <svg
                  className="block h-6 w-6"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <circle cx="24" cy="24" r="22" fill="#FEE500" />
                  <path
                    d="M24 13.5c-7.2 0-13 4.4-13 9.8 0 3.5 2.4 6.5 6 8.2l-1.2 4.5c-.1.5.4.9.8.6l5.2-3.5c.7.1 1.5.2 2.2.2 7.2 0 13-4.4 13-9.8s-5.8-10-13-10z"
                    fill="#191919"
                  />
                </svg>
              </button>

              <button
                type="button"
                aria-label="네이버 로그인"
                title="네이버 로그인"
                onClick={handleNaverLogin}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                <svg
                  className="block h-6 w-6"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <circle cx="24" cy="24" r="22" fill="#03C75A" />
                  <path
                    d="M28.8 24.7 19 10.5h-8.1v27h8.3V23.3l9.8 14.2h8.1v-27h-8.3v14.2z"
                    fill="#FFFFFF"
                  />
                </svg>
              </button>

              <button
                type="button"
                aria-label="구글 로그인"
                title="구글 로그인"
                onClick={showSocialLoginNotice}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                <svg
                  className="block h-6 w-6"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C40.9 35.6 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"
                  />
                </svg>
                <span className="absolute right-[5px] top-1 h-2 w-2 rounded-full border-2 border-white bg-[#f59e0b]" />
              </button>

              <button
                type="button"
                aria-label="GitHub 로그인"
                title="GitHub 로그인"
                onClick={showSocialLoginNotice}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                <svg
                  className="block h-[25px] w-[25px]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.3.8-.6v-2.1c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.6 2.9 4.1 2.1.1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5z"
                  />
                </svg>
                <span className="absolute right-[5px] top-1 h-2 w-2 rounded-full border-2 border-white bg-[#f59e0b]" />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[rgba(37,99,235,0.18)] bg-[#eff6ff] px-[14px] py-[13px] text-[12px] font-extrabold leading-[1.65] text-[#475569]">
            <strong className="mb-1 block text-[13px] font-black text-[#1d4ed8]">
              시연용 인증 안내
            </strong>
            현재 로그인은 프론트 시연용으로 동작합니다. 회원가입 시
            localStorage에 저장된 계정과 비교하며, 실제 배포 시에는 서버 DB와
            비밀번호 해시 기반 인증으로 교체해야 합니다.
          </div>
        </form>

        <div className="mt-[22px] flex justify-center gap-2 text-[14px]">
          <span className="text-[#475569]">아직 회원이 아니신가요?</span>

          <Link to="/signup" className="font-black text-[#2563eb] no-underline">
            회원가입 하기
          </Link>
        </div>
      </section>

      <div
        className={`fixed bottom-7 right-7 rounded-full bg-[#0f172a] px-[18px] py-[13px] text-[14px] font-extrabold text-white transition-all duration-[250ms] ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        {toast || "로그인 되었습니다."}
      </div>
    </main>
  );
}