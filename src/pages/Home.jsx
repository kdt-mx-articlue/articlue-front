import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";

export default function Home() {
  const [progress, setProgress] = useState(68);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedProgress = Number(localStorage.getItem("articlue_resume_progress"));

    const nextProgress =
      Number.isFinite(savedProgress) && savedProgress >= 0
        ? Math.min(100, Math.max(0, savedProgress))
        : 68;

    setProgress(nextProgress);

    const favorites = JSON.parse(
      localStorage.getItem("articlue_favorite_jobs") || "[]"
    );

    setFavoriteCount(favorites.length);

    const submitted =
      localStorage.getItem("articlue_resume_submitted") === "true";

    setShowBanner(!submitted);
  }, []);

  const hideImproveBanner = () => {
    setShowBanner(false);
  };

  const markRecommendationViewed = () => {
    localStorage.setItem("articlue_recommendation_entry", "main_home");
  };

  const continueResume = () => {
    localStorage.setItem("articlue_resume_continue", "true");
  };

  return (
    <AppLayout title="AI 커리어 홈">
      {showBanner && (
        <div className="mb-[22px] flex items-center justify-between gap-[18px] rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-[18px] shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <div>
            <strong className="mb-[5px] block text-[16px] font-black text-slate-900">
              이력서를 완성하고 더 정확한 추천을 받아보세요.
            </strong>
            <p className="text-[13px] font-bold leading-[1.6] text-slate-600">
              현재 정보만으로도 기업 추천은 가능하지만, 최종 제출을 완료하면
              AI가 더 정확한 기업과 직무를 추천해드립니다.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/resume"
              onClick={continueResume}
              className="inline-flex rounded-full border border-blue-600 px-[19px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5"
            >
              이력서 보완하기
            </Link>

            <button
              type="button"
              onClick={hideImproveBanner}
              className="h-[34px] w-[34px] rounded-full border border-slate-200 bg-white text-slate-600 font-black"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <section className="relative mb-[22px] grid grid-cols-[minmax(0,1fr)_220px] items-center gap-8 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] p-[34px] text-white shadow-[0_18px_55px_rgba(37,99,235,0.12)]">
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[13px] font-black">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            AI 기반 커리어 매칭
          </div>

          <h2 className="mb-[14px] text-[31px] font-extrabold leading-[1.36] tracking-[-0.15px]">
            <span className="block">오늘 기준으로</span>
            <span className="block">지원 가능성이 높은</span>
            <span className="block">기업을 확인해보세요</span>
          </h2>

          <p className="mb-6 max-w-[560px] text-[15px] leading-[1.78] opacity-95">
            이력서 완성도와 기술 경험을 바탕으로 맞춤 기업을 추천하고,
            자소서와 실전 면접 준비까지 한 흐름으로 이어줍니다.
          </p>

          <div className="flex flex-wrap gap-[10px]">
            <Link
              to="/fitting"
              onClick={markRecommendationViewed}
              className="inline-flex items-center justify-center rounded-full bg-white px-[19px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5"
            >
              오늘의 추천 기업 확인하기
            </Link>

            <Link
              to="/resume"
              onClick={continueResume}
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-[19px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5"
            >
              이력서 완성도 높이기
            </Link>
          </div>
        </div>

        <div className="relative z-10 w-[220px] rounded-[24px] border border-white/25 bg-white/15 p-5 backdrop-blur-xl">
          <div className="mb-3 text-[14px] font-black opacity-90">
            현재 추천 준비도
          </div>

          <div className="mb-[10px]">
            <strong className="block text-[44px] font-black leading-none tracking-[-1px]">
              {progress}%
            </strong>
            <span className="mt-[7px] block whitespace-nowrap text-[13px] font-extrabold opacity-85">
              이력서 기반
            </span>
          </div>

          <div className="mb-[14px] h-[10px] overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white to-green-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[13px] font-medium leading-[1.72] opacity-90">
            프로젝트 성과와 사용 기술을 더 구체화하면 추천 기업과 면접 질문의
            정확도가 함께 올라갑니다.
          </p>
        </div>

        <div className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full bg-white/15" />
      </section>

      <section className="mb-[22px] grid grid-cols-[1fr_1.35fr] gap-[22px]">
        <article className="flex flex-col items-center gap-[18px] rounded-[26px] border border-slate-200 bg-white p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <div className="max-w-[280px]">
            <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px]">
              추천 정확도
            </h3>
            <p className="text-[14px] font-bold leading-[1.6] text-slate-600">
              이력서를 조금 더 작성하면 기업 추천 품질이 올라갑니다.
            </p>
          </div>

          <div
            className="relative flex h-[156px] w-[156px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#2563eb 0 ${progress}%, #f1f5f9 ${progress}% 100%)`,
            }}
          >
            <div className="absolute h-[116px] w-[116px] rounded-full bg-white" />
            <div className="relative z-10 text-center">
              <strong className="block text-[34px] font-black text-blue-700">
                {progress}%
              </strong>
              <span className="text-[12px] font-black text-slate-400">
                프로필 완성도
              </span>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-blue-50 px-[14px] py-[13px] text-[13px] font-black text-blue-800">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            프로젝트 성과를 추가하면 더 정밀해져요
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            {[
              ["기본 정보", "완료"],
              ["프로젝트", "보완 필요"],
              ["기술 스택", "양호"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex min-h-[72px] flex-col items-center justify-center gap-[5px] rounded-2xl bg-slate-100 px-2 py-3"
              >
                <span className="whitespace-nowrap text-[12px] font-extrabold text-slate-600">
                  {label}
                </span>
                <strong className="whitespace-nowrap text-[12px] font-black text-slate-900">
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <div className="mb-[18px] flex items-start justify-between gap-[14px]">
            <div>
              <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px]">
                오늘의 추천 기업
              </h3>
              <p className="text-[14px] font-bold leading-[1.6] text-slate-600">
                현재 프로필 기준으로 적합도가 높은 기업입니다.
              </p>
            </div>

            <Link to="/fitting" className="text-[13px] font-black text-blue-700">
              전체 보기 →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {[
              ["NW", "네이버웹툰 · Backend", "Redis · 대용량 트래픽 · API 설계", "92%"],
              ["TS", "토스 · Server", "결제 안정성 · 데이터 처리 · 성능 개선", "88%"],
              ["KK", "카카오 · Platform", "분산 시스템 · 백엔드 운영 · 모니터링", "84%"],
            ].map(([logo, title, desc, score]) => (
              <Link
                key={title}
                to="/fitting"
                className="flex items-center gap-[14px] rounded-[20px] border border-slate-200 bg-white p-[15px] transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-blue-50 font-black text-blue-700">
                  {logo}
                </div>

                <div className="min-w-0 flex-1">
                  <strong className="mb-1 block text-[15px] font-black">
                    {title}
                  </strong>
                  <span className="block truncate text-[12px] font-extrabold text-slate-600">
                    {desc}
                  </span>
                </div>

                <div className="font-mono text-[20px] font-black text-emerald-600">
                  {score}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-[10px] flex flex-wrap gap-[7px]">
            {["추천 근거 4개 일치", "자소서 생성 가능", "면접 대비 가능"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-blue-50 px-[10px] py-[6px] text-[12px] font-black text-blue-800"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-4 gap-4">
        {[
          ["1", "이력서 작성", "기술 경험과 프로젝트 성과를 구조화합니다.", "작성하러 가기 →", "/resume"],
          ["2", "기업 추천", "JD와 포트폴리오를 비교해 적합 기업을 찾습니다.", "추천 보기 →", "/fitting"],
          ["3", "자소서 변환", "기술 중심 문장을 기업 관점의 성과 언어로 정리합니다.", "변환하기 →", "/fitting"],
          ["4", "AI 면접 시뮬레이션", "추천 기업 기준으로 꼬리 질문과 답변 방향을 제공합니다.", "연습하기 →", "/interview"],
        ].map(([num, title, desc, linkText, path]) => (
          <article
            key={num}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-blue-100"
          >
            <div className="mb-[14px] flex h-[30px] w-[30px] items-center justify-center rounded-xl bg-blue-50 text-[13px] font-black text-blue-800">
              {num}
            </div>
            <h4 className="mb-2 text-[16px] font-black">{title}</h4>
            <p className="mb-[15px] text-[13px] font-bold leading-[1.65] text-slate-600">
              {desc}
            </p>
            <Link to={path} className="text-[13px] font-black text-blue-700">
              {linkText}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-[22px] grid grid-cols-3 gap-[18px]">
        {[
          ["찜한 기업 공고", `${favoriteCount}개`, "관심 기업은 내 커리어 관리에서 다시 확인할 수 있습니다."],
          ["최근 면접 준비", "Backend", "네이버웹툰 실무진 면접 기준 질문이 준비되어 있습니다."],
          ["다음 추천 액션", "프로젝트 성과 보완", "숫자 기반 성과를 추가하면 매칭률이 더 명확해집니다."],
        ].map(([label, value, desc]) => (
          <article
            key={label}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
          >
            <span className="mb-2 block text-[13px] font-black text-slate-600">
              {label}
            </span>
            <strong className="text-[25px] font-black">{value}</strong>
            <p className="mt-2 text-[12px] font-bold leading-[1.55] text-slate-400">
              {desc}
            </p>
          </article>
        ))}
      </section>
    </AppLayout>
  );
}