import { useEffect, useState } from "react";
import { getCurrentUser, getLoginType } from "../utils/auth.js";

function getLoginLabel(loginType) {
  if (loginType === "kakao") return "Kakao";
  if (loginType === "naver") return "Naver";
  if (loginType === "local") return "일반 로그인";
  return "로그인";
}

export default function Topbar({ title }) {
  const [userInfo, setUserInfo] = useState({
    name: "사용자",
    loginType: "",
    profileImage: "",
  });

  useEffect(() => {
    const readUserInfo = () => {
      const currentUser = getCurrentUser();

      const profileName =
        localStorage.getItem("articlue_profile_name") ||
        currentUser?.name ||
        "사용자";

      const loginType =
        getLoginType() ||
        currentUser?.loginType ||
        currentUser?.provider ||
        "";

      const profileImage =
        localStorage.getItem("articlue_profile_image") ||
        currentUser?.profileImage ||
        "";

      setUserInfo({
        name: profileName,
        loginType,
        profileImage,
      });
    };

    readUserInfo();

    window.addEventListener("storage", readUserInfo);
    window.addEventListener("focus", readUserInfo);

    return () => {
      window.removeEventListener("storage", readUserInfo);
      window.removeEventListener("focus", readUserInfo);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-10 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-[22px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-[14px] font-extrabold text-slate-700 dark:text-slate-200">
            {userInfo.name} 님
          </p>
          <p className="mt-[2px] text-[12px] font-bold text-slate-400 dark:text-slate-500">
            오늘의 커리어 액션을 확인하세요
          </p>
        </div>

        {userInfo.loginType && (
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-[7px] text-[12px] font-black text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            {getLoginLabel(userInfo.loginType)}
          </span>
        )}

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-blue-300 text-[15px] font-black text-white">
          {userInfo.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt="프로필 이미지"
              className="h-full w-full object-cover"
            />
          ) : (
            userInfo.name.slice(0, 1)
          )}
        </div>
      </div>
    </header>
  );
}