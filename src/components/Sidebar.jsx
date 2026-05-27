import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "AI 커리어 홈", path: "/" },
  { label: "커리어 프로필 작성", path: "/resume" },
  { label: "커리어 피팅 & 맞춤 자소서", path: "/fitting" },
  { label: "AI 면접 시뮬레이션", path: "/interview" },
  { label: "커리어 분석 리포트", path: "/growth" },
  { label: "내 커리어 관리", path: "/mypage" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">
      <Link
        to="/"
        className="px-[25px] py-[30px] text-[26px] font-black text-blue-600 tracking-[-0.8px] no-underline"
      >
        Articlue.
      </Link>

      <nav className="py-[10px]">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-[25px] py-[15px] text-[15px] font-bold transition ${
                active
                  ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}