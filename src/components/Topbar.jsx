import { useEffect, useState } from "react";

export default function Topbar({ title }) {
  const [greeting, setGreeting] = useState("오늘의 커리어 액션을 확인하세요");

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("articlue_current_user") || "null"
    );

    if (currentUser?.name) {
      setGreeting(`${currentUser.name} 님, 오늘의 커리어 액션을 확인하세요`);
      return;
    }

    const profileName = localStorage.getItem("articlue_profile_name");

    if (profileName) {
      setGreeting(`${profileName} 님, 오늘의 커리어 액션을 확인하세요`);
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-10">
      <h1 className="text-[22px] font-black tracking-[-0.4px] text-slate-900">
        {title}
      </h1>

      <div className="flex items-center gap-3 text-[14px] font-extrabold text-slate-600">
        <span>{greeting}</span>
      </div>
    </header>
  );
}