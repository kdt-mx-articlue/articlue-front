import { Link } from "react-router-dom";

export default function AppLayout({
  title,
  children,
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600">
            Articlue
          </h1>
        </div>

        <nav className="flex flex-col">
          <Link
            to="/"
            className="px-6 py-4 font-semibold text-slate-600 hover:bg-slate-100"
          >
            AI 커리어 홈
          </Link>

          <Link
            to="/resume"
            className="px-6 py-4 font-semibold text-slate-600 hover:bg-slate-100"
          >
            커리어 프로필 작성
          </Link>

          <Link
            to="/fitting"
            className="px-6 py-4 font-semibold text-slate-600 hover:bg-slate-100"
          >
            커리어 피팅 & 맞춤 자소서
          </Link>

          <Link
            to="/growth"
            className="px-6 py-4 font-semibold text-slate-600 hover:bg-slate-100"
          >
            커리어 분석 리포트
          </Link>

          <Link
            to="/interview"
            className="px-6 py-4 font-semibold text-slate-600 hover:bg-slate-100"
          >
            AI 면접 시뮬레이션
          </Link>

          <Link
            to="/mypage"
            className="px-6 py-4 font-semibold text-slate-600 hover:bg-slate-100"
          >
            내 커리어 관리
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <header className="h-[68px] bg-white border-b border-slate-200 flex items-center px-10">
          <h2 className="text-xl font-black">
            {title}
          </h2>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}