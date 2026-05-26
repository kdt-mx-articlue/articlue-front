import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <h1 className="text-3xl font-black text-brand-500 text-center mb-3">
          Articlue
        </h1>

        <h2 className="text-2xl font-black text-text-main text-center mb-3">
          회원가입
        </h2>

        <p className="text-sm text-text-sub text-center mb-8">
          커리어 피팅을 위한 계정을 생성하세요.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="이름"
            className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500"
          />

          <input
            type="email"
            placeholder="이메일"
            className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500"
          />

          <input
            type="password"
            placeholder="비밀번호"
            className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500"
          />

          <button
            type="button"
            className="w-full h-12 rounded-full bg-brand-500 text-white font-black hover:bg-brand-600 transition"
          >
            회원가입
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2 text-sm">
          <span className="text-text-sub">이미 계정이 있나요?</span>
          <Link to="/login" className="font-black text-brand-500">
            로그인
          </Link>
        </div>
      </section>
    </main>
  );
}