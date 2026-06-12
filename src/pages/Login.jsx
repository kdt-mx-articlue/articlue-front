import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuthUser } from "../utils/auth.js";
import { githubAuthLogin, githubAuthToken, login } from "../services/authApi.js";

export default function Login() {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [loginIdError, setLoginIdError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const getSavedUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("articlue_users")) || [];
    } catch {
      return [];
    }
  };

  const moveAfterLogin = () => {
    const redirectPath = localStorage.getItem("redirectAfterLogin") || "/resume";
    localStorage.removeItem("redirectAfterLogin");
    navigate(redirectPath, { replace: true });
  };

  const loginWithFallback = (trimmedLoginId) => {
    const users = getSavedUsers();

    const matchedUser = users.find(
      (user) => user.loginId?.trim() === trimmedLoginId
    );

    if (!matchedUser) {
      setLoginIdError(true);
      showToast("가입된 회원 아이디가 없습니다. 회원가입 후 이용해 주세요.");
      return false;
    }

    if (matchedUser.password !== password) {
      setPasswordError(true);
      showToast("비밀번호가 일치하지 않습니다.");
      return false;
    }

    saveAuthUser({
      name: matchedUser.name || "Articlue 사용자",
      nickname: matchedUser.nickname || "",
      loginId: matchedUser.loginId,
      email: matchedUser.email || "",
      loginType: "local",
      provider: "local",
      loginAt: new Date().toISOString(),
    });

    showToast("로그인 되었습니다.");

    setTimeout(moveAfterLogin, 800);
    return true;
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginIdError(false);
    setPasswordError(false);

    const trimmedLoginId = loginId.trim();

    if (!trimmedLoginId) {
      setLoginIdError(true);
      showToast("회원 아이디를 입력해 주세요.");
      return;
    }

    if (!password) {
      setPasswordError(true);
      showToast("비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const data = await login({
        loginId: trimmedLoginId,
        password,
      });

      const user = data?.member || data?.user || data?.data || data || {};

      saveAuthUser({
        name: user?.name || user?.nickname || "Articlue 사용자",
        nickname: user?.nickname || "",
        loginId: user?.loginId || trimmedLoginId,
        email: user?.email || "",
        loginType: "local",
        provider: "local",
        loginAt: new Date().toISOString(),
      });

      showToast("로그인 되었습니다.");
      setTimeout(moveAfterLogin, 800);
    } catch (error) {
      console.warn("API 로그인 실패. 시연용 localStorage 로그인으로 전환합니다.", error);
      loginWithFallback(trimmedLoginId);
    } finally {
      setLoading(false);
    }
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

  const handleGithubLogin = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const loginResponse = await githubAuthLogin({
        scope: "read:user user:email repo",
      });

      const loginResult = loginResponse?.data || loginResponse || {};

      const deviceCode =
        loginResult.device_code ||
        loginResult.deviceCode;

      const userCode =
        loginResult.user_code ||
        loginResult.userCode;

      const verificationUri =
        loginResult.verification_uri_complete ||
        loginResult.verificationUriComplete ||
        loginResult.verification_uri ||
        loginResult.verificationUri;

      let pollingIntervalSeconds = Number(
        loginResult.interval ||
        loginResult.intervalSeconds ||
        5
      );

      if (!deviceCode || !userCode || !verificationUri) {
        console.log("GitHub 인증 코드 발급 응답:", loginResponse);
        showToast("GitHub 인증 코드 발급 응답이 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      localStorage.setItem("github_device_code", deviceCode);
      localStorage.setItem("github_user_code", userCode);

      try {
        await navigator.clipboard.writeText(userCode);

        alert(
          `GitHub 인증 코드를 클립보드에 복사했습니다.\n\n인증 코드: ${userCode}\n\n확인을 누르면 GitHub 인증 페이지가 새 탭으로 열립니다.`
        );
      } catch (clipboardError) {
        console.warn("GitHub 인증 코드 복사 실패:", clipboardError);

        alert(
          `GitHub 인증 페이지에서 아래 코드를 입력해 주세요.\n\n인증 코드: ${userCode}\n\n확인을 누르면 GitHub 인증 페이지가 새 탭으로 열립니다.`
        );
      }

      const githubWindow = window.open(verificationUri, "_blank");

      if (!githubWindow) {
        showToast("팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해 주세요.");
        setLoading(false);
        return;
      }

      showToast("GitHub 인증 완료를 기다리는 중입니다.");

      let tryCount = 0;
      const maxTryCount = 60;

      const pollGithubToken = async () => {
        tryCount++;

        try {
          const tokenResponse = await githubAuthToken({
            device_code: deviceCode,
            deviceCode,
          });

          console.log("GitHub 토큰 발급 응답:", tokenResponse);

          const tokenRoot = tokenResponse || {};
          const tokenData = tokenRoot.data || {};

          const errorCode =
            tokenData.errorCode ||
            tokenData.error_code ||
            tokenRoot.errorCode ||
            tokenRoot.error_code;

          /**
           * GitHub가 요청 간격이 너무 짧다고 응답한 경우
           * 응답으로 내려온 interval 값으로 다음 요청 간격을 늘린다.
           */
          if (errorCode === "slow_down") {
            pollingIntervalSeconds = Number(tokenData.interval || 15);

            if (tryCount >= maxTryCount) {
              setLoading(false);
              showToast("GitHub 인증 시간이 초과되었습니다. 다시 시도해 주세요.");
              return;
            }

            window.setTimeout(
              pollGithubToken,
              pollingIntervalSeconds * 1000
            );

            return;
          }

          /**
           * 아직 사용자가 GitHub 인증을 완료하지 않은 경우
           * 실패가 아니라 대기 상태이므로 계속 확인한다.
           */
          const isPending =
            tokenRoot.status === "AUTHORIZATION_PENDING" ||
            tokenRoot.authenticated === false ||
            errorCode === "authorization_pending";

          if (isPending) {
            if (tryCount >= maxTryCount) {
              setLoading(false);
              showToast("GitHub 인증 시간이 초과되었습니다. 다시 시도해 주세요.");
              return;
            }

            window.setTimeout(
              pollGithubToken,
              pollingIntervalSeconds * 1000
            );

            return;
          }

          /**
           * 인증 성공 시 백엔드가 내려주는 세션 ID
           */
          const githubSessionId =
            tokenData.github_session_id ||
            tokenData.githubSessionId ||
            tokenData.social_session_id ||
            tokenData.socialSessionId ||
            tokenRoot.github_session_id ||
            tokenRoot.githubSessionId ||
            tokenRoot.social_session_id ||
            tokenRoot.socialSessionId;

          const githubUser =
            tokenData.socialUser ||
            tokenData.githubUser ||
            tokenData.github_user ||
            tokenData.user ||
            tokenRoot.socialUser ||
            tokenRoot.githubUser ||
            tokenRoot.github_user ||
            tokenRoot.user ||
            {};

          if (!githubSessionId) {
            console.log("GitHub 세션 ID 없는 응답:", tokenResponse);

            if (tryCount >= maxTryCount) {
              setLoading(false);
              showToast("GitHub 세션 정보를 받지 못했습니다.");
              return;
            }

            window.setTimeout(
              pollGithubToken,
              pollingIntervalSeconds * 1000
            );

            return;
          }

          localStorage.setItem("github_session_id", githubSessionId);
          localStorage.setItem("social_session_id", githubSessionId);

          saveAuthUser({
            name:
              githubUser.name ||
              githubUser.login ||
              githubUser.nickname ||
              "GitHub 사용자",
            nickname: githubUser.login || githubUser.nickname || "",
            loginId: githubUser.login || "",
            email: githubUser.email || "",
            loginType: "github",
            provider: "github",
            githubSessionId,
            loginAt: new Date().toISOString(),
          });

          showToast("GitHub 인증이 완료되었습니다.");
          setLoading(false);

          navigate("/", { replace: true });
        } catch (tokenError) {
          console.warn("GitHub 토큰 발급 확인 중:", tokenError);

          if (tryCount >= maxTryCount) {
            setLoading(false);
            showToast("GitHub 인증 시간이 초과되었습니다. 다시 시도해 주세요.");
            return;
          }

          window.setTimeout(
            pollGithubToken,
            pollingIntervalSeconds * 1000
          );
        }
      };

      window.setTimeout(
        pollGithubToken,
        pollingIntervalSeconds * 1000
      );
    } catch (error) {
      console.error("GitHub 인증 실패:", error);
      showToast(error.userMessage || "GitHub 인증에 실패했습니다.");
      setLoading(false);
    }
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
              htmlFor="loginIdInput"
              className="mb-2 block text-[14px] font-extrabold text-[#0f172a]"
            >
              회원 아이디
            </label>

            <input
              id="loginIdInput"
              type="text"
              placeholder="회원 아이디 입력"
              autoComplete="username"
              required
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className={`h-[52px] w-full rounded-2xl border px-4 text-[15px] text-[#0f172a] outline-none ${
                loginIdError
                  ? "border-[#ef4444] bg-[#fef2f2]"
                  : "border-[#e2e8f0] bg-[#f1f5f9] focus:border-[#2563eb]"
              }`}
            />

            {loginIdError && (
              <div className="mt-2 text-[12px] font-black text-[#ef4444]">
                가입되지 않은 회원 아이디입니다.
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
            disabled={loading}
            className="mt-[10px] h-[54px] w-full rounded-full border-0 bg-[#2563eb] text-[15px] font-black text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
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
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9]"
              >
                <svg className="block h-6 w-6" viewBox="0 0 48 48" aria-hidden="true">
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
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9]"
              >
                <svg className="block h-6 w-6" viewBox="0 0 48 48" aria-hidden="true">
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
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9]"
              >
                <span className="text-sm font-black">G</span>
                <span className="absolute right-[5px] top-1 h-2 w-2 rounded-full border-2 border-white bg-[#f59e0b]" />
              </button>

              <button
                type="button"
                aria-label="GitHub 로그인"
                title="GitHub 로그인"
                onClick={handleGithubLogin}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9]"
              >
                <span className="text-sm font-black">GH</span>
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[rgba(37,99,235,0.18)] bg-[#eff6ff] px-[14px] py-[13px] text-[12px] font-extrabold leading-[1.65] text-[#475569]">
            <strong className="mb-1 block text-[13px] font-black text-[#1d4ed8]">
              인증 연동 안내
            </strong>
            백엔드 API 연결을 먼저 시도하고, 서버가 준비되지 않은 경우에만
            시연용 localStorage 로그인으로 동작합니다. GitHub 로그인은 OAuth 흐름으로 이동합니다.
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