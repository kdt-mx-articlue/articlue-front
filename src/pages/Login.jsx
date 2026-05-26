export default function Login() {
  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-text-main text-center mb-3">
          로그인
        </h1>

        <p className="text-text-sub text-center mb-8">
          Articlue 계정으로 커리어 피팅을 시작하세요.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            className="w-full h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500"
          />

          <input
            type="password"
            placeholder="비밀번호"
            className="w-full h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500"
          />

          <button
            type="button"
            className="w-full h-12 rounded-full bg-brand-500 text-white font-bold hover:bg-brand-600 transition"
          >
            로그인
          </button>
        </div>

        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-text-muted">또는</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("naver")}
            className="w-full h-12 rounded-full bg-[#03C75A] text-white font-bold"
          >
            네이버로 로그인
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            className="w-full h-12 rounded-full bg-[#FEE500] text-[#191919] font-bold"
          >
            카카오로 로그인
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="w-full h-12 rounded-full bg-[#24292F] text-white font-bold"
          >
            GitHub로 로그인
          </button>
        </div>
      </section>
    </main>
  );
}