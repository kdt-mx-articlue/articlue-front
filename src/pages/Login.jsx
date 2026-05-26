import { useEffect, useState } from "react";
import "./Login.css";

const THEME_KEY = "articlue-theme";

function getSavedUsers() {
  try {
    return JSON.parse(localStorage.getItem("articlue_users")) || [];
  } catch (error) {
    return [];
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [toast, setToast] = useState("로그인 되었습니다.");
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        document.documentElement.setAttribute("data-theme", event.newValue || "light");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const showToast = (message) => {
    setToast(message);
    setIsToastOpen(true);
    window.setTimeout(() => setIsToastOpen(false), 2500);
  };

  const clearLoginErrors = () => {
    setErrors({ email: false, password: false });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    clearLoginErrors();

    const normalizedEmail = email.trim().toLowerCase();
    const users = getSavedUsers();
    const matchedUser = users.find((user) => user.email === normalizedEmail);

    if (!matchedUser) {
      setErrors({ email: true, password: false });
      showToast("가입된 회원 정보가 없습니다. 회원가입 후 이용해 주세요.");
      return;
    }

    if (matchedUser.password !== password) {
      setErrors({ email: false, password: true });
      showToast("비밀번호가 일치하지 않습니다.");
      return;
    }

    localStorage.setItem("isLogin", "true");
    localStorage.setItem(
      "articlue_current_user",
      JSON.stringify({
        name: matchedUser.name,
        email: matchedUser.email,
        loginAt: new Date().toISOString(),
      })
    );

    showToast("로그인 되었습니다.");

    window.setTimeout(() => {
      const redirectPage = localStorage.getItem("redirectAfterLogin") || "resume.html";
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPage;
    }, 1000);
  };

  const showSocialLoginNotice = () => {
    showToast("소셜 로그인은 현재 준비 중입니다. 시연 버전에서는 일반 로그인 기능을 이용해주세요.");
  };

  return (
    <main className="login-page">
      <section className="login-wrap" aria-label="로그인 영역">
        <a className="logo" href="index.html">
          Articlue.
        </a>

        <h1 className="title">로그인</h1>

        <p className="desc">
          로그인 후 맞춤형 이력서 작성과 AI 기반 취업 분석 기능을 이용할 수 있습니다.
        </p>

        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <label className="input-label" htmlFor="loginEmailInput">
              이메일
            </label>
            <input
              id="loginEmailInput"
              type="email"
              className={`input${errors.email ? " invalid" : ""}`}
              placeholder="example@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className={`input-error${errors.email ? " show" : ""}`}>
              가입되지 않은 이메일입니다.
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="loginPasswordInput">
              비밀번호
            </label>
            <input
              id="loginPasswordInput"
              type="password"
              className={`input${errors.password ? " invalid" : ""}`}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className={`input-error${errors.password ? " show" : ""}`}>
              비밀번호가 일치하지 않습니다.
            </div>
          </div>

          <button className="btn-primary" type="submit">
            로그인
          </button>

          <section className="social-login-section" aria-label="간편 로그인">
            <div className="social-divider">간편 로그인</div>
            <div className="social-grid">
              <button type="button" className="social-icon-btn" aria-label="카카오톡 로그인" title="카카오톡 로그인" onClick={showSocialLoginNotice}>
                <svg className="social-icon" viewBox="0 0 48 48" role="img" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" fill="#FEE500" />
                  <path d="M24 13.5c-7.2 0-13 4.4-13 9.8 0 3.5 2.4 6.5 6 8.2l-1.2 4.5c-.1.5.4.9.8.6l5.2-3.5c.7.1 1.5.2 2.2.2 7.2 0 13-4.4 13-9.8s-5.8-10-13-10z" fill="#191919" />
                </svg>
                <span className="coming-dot" aria-hidden="true" />
              </button>

              <button type="button" className="social-icon-btn" aria-label="네이버 로그인" title="네이버 로그인" onClick={showSocialLoginNotice}>
                <svg className="social-icon" viewBox="0 0 48 48" role="img" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" fill="#03C75A" />
                  <path d="M28.8 24.7 19 10.5h-8.1v27h8.3V23.3l9.8 14.2h8.1v-27h-8.3v14.2z" fill="#FFFFFF" />
                </svg>
                <span className="coming-dot" aria-hidden="true" />
              </button>

              <button type="button" className="social-icon-btn" aria-label="구글 로그인" title="구글 로그인" onClick={showSocialLoginNotice}>
                <svg className="social-icon" viewBox="0 0 48 48" role="img" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C40.9 35.6 44 30 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                <span className="coming-dot" aria-hidden="true" />
              </button>

              <button type="button" className="social-icon-btn" aria-label="GitHub 로그인" title="GitHub 로그인" onClick={showSocialLoginNotice}>
                <svg className="social-icon github" viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.3.8-.6v-2.1c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.6 2.9 4.1 2.1.1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5z" />
                </svg>
                <span className="coming-dot" aria-hidden="true" />
              </button>
            </div>
          </section>

          <div className="demo-auth-notice">
            <strong>시연용 인증 안내</strong>
            현재 로그인은 프론트 시연용으로 동작합니다. 회원가입 시 localStorage에 저장된 계정과 비교하며, 실제 배포 시에는 서버 DB와 비밀번호 해시 기반 인증으로 교체해야 합니다.
          </div>
        </form>

        <div className="bottom-row">
          <span>아직 회원이 아니신가요?</span>
          <a href="signup.html">회원가입 하기</a>
        </div>
      </section>

      <div className={`toast${isToastOpen ? " show" : ""}`}>{toast}</div>
    </main>
  );
}
