import { useEffect } from "react";
import { saveAuthUser } from "../utils/auth.js";
import { githubAuthToken, getGithubMe } from "../services/authApi.js";

export default function GithubCallback() {
  useEffect(() => {
    const handleGithubCallback = async () => {
      const url = new URL(window.location.href);

      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      const errorDescription = url.searchParams.get("error_description");
      const savedState = localStorage.getItem("github_oauth_state");

      if (error) {
        console.error("GitHub 로그인 오류:", error, errorDescription);
        localStorage.removeItem("github_oauth_state");
        window.location.replace("/login");
        return;
      }

      if (!code) {
        console.error("GitHub 로그인 실패: code가 없습니다.");
        localStorage.removeItem("github_oauth_state");
        window.location.replace("/login");
        return;
      }

      if (savedState && state && savedState !== state) {
        console.error("GitHub 로그인 실패: state 값이 일치하지 않습니다.");
        localStorage.removeItem("github_oauth_state");
        window.location.replace("/login");
        return;
      }

      let githubUser = {
        name: "GitHub 사용자",
        email: "github@articlue.demo",
        provider: "github",
        loginType: "github",
        authCode: code,
        state,
        loginAt: new Date().toISOString(),
      };

      try {
        const tokenData = await githubAuthToken({
          code,
          state,
          redirectUri: "http://localhost:5173/auth/github/callback",
          redirect_uri: "http://localhost:5173/auth/github/callback",
        });

        const tokenUser =
          tokenData?.member ||
          tokenData?.user ||
          tokenData?.githubUser ||
          tokenData?.data ||
          tokenData ||
          {};

        githubUser = {
          ...githubUser,
          name:
            tokenUser?.name ||
            tokenUser?.nickname ||
            tokenUser?.login ||
            tokenUser?.username ||
            githubUser.name,
          email: tokenUser?.email || githubUser.email,
          githubLogin:
            tokenUser?.login ||
            tokenUser?.username ||
            tokenUser?.githubLogin ||
            "",
          githubProfileUrl:
            tokenUser?.htmlUrl ||
            tokenUser?.html_url ||
            tokenUser?.profileUrl ||
            tokenUser?.profile_url ||
            "",
        };

        try {
          const infoData = await getGithubMe();
          const info = infoData?.data || infoData?.github || infoData || {};

          githubUser = {
            ...githubUser,
            name:
              info?.name ||
              info?.nickname ||
              info?.login ||
              info?.username ||
              githubUser.name,
            email: info?.email || githubUser.email,
            githubLogin:
              info?.login ||
              info?.username ||
              info?.githubLogin ||
              githubUser.githubLogin ||
              "",
            githubProfileUrl:
              info?.htmlUrl ||
              info?.html_url ||
              info?.profileUrl ||
              info?.profile_url ||
              githubUser.githubProfileUrl ||
              "",
          };
        } catch (infoError) {
          console.warn("GitHub 사용자 정보 조회 실패. 토큰 응답 정보로 로그인 상태를 저장합니다.", infoError);
        }
      } catch (tokenError) {
        console.warn("GitHub 토큰 교환 API 실패. 콜백 code 기반 시연 로그인으로 저장합니다.", tokenError);
      }

      saveAuthUser(githubUser);
      localStorage.removeItem("github_oauth_state");

      const savedRedirectPath = localStorage.getItem("redirectAfterLogin");

      const redirectPath =
        savedRedirectPath && savedRedirectPath !== "/login"
          ? savedRedirectPath
          : "/home";

      localStorage.removeItem("redirectAfterLogin");

      window.location.replace(redirectPath);
    };

    handleGithubCallback();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-[#0f172a]">
      <p className="text-lg font-black">GitHub 로그인 처리 중...</p>
    </main>
  );
}
