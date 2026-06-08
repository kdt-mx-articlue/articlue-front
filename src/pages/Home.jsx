import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import {
  getCareerScores,
  getNextAction,
  getReadinessStatus,
  getTechStacks,
} from "../utils/careerScore.js";
import { markRecommendationViewed } from "../services/careerDataService.js";
import {
  getFavoriteJobs,
  getFavoriteCount,
} from "../services/favoriteJobService.js";
import { getCoverLetters } from "../services/coverLetterService.js";
import {
  getInterviewResults,
  getLatestInterviewSummary,
} from "../services/interviewService.js";
import {
  isResumeSubmitted,
  markResumeContinue,
} from "../services/resumeService.js";

const fallbackCompanies = [
  ["NW", "네이버웹툰 · Backend", "Redis · 대용량 트래픽 · API 설계", "92%"],
  ["TS", "토스 · Server", "결제 안정성 · 데이터 처리 · 성능 개선", "88%"],
  ["KK", "카카오 · Platform", "분산 시스템 · 백엔드 운영 · 모니터링", "84%"],
];

function formatDate(value) {
  if (!value) return "최근 기록";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "최근 기록";

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  } catch {
    return "최근 기록";
  }
}

function getTimestamp(value) {
  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function buildFavoriteCompanies() {
  return getFavoriteJobs().map((job) => ({
    logo: String(job.company || "기업").slice(0, 2).toUpperCase(),
    title: `${job.company || "기업명 없음"} · ${job.role || "직무 정보 없음"}`,
    company: job.company || "기업명 없음",
    role: job.role || "직무 정보 없음",
    desc:
      job.desc ||
      (Array.isArray(job.stacks) ? job.stacks.join(" · ") : "관심 기업 공고"),
    score: job.match || "80%",
    path: `/fitting?company=${encodeURIComponent(job.company || "")}`,
  }));
}

function buildRecentActivities() {
  const favorites = buildFavoriteCompanies();
  const coverLetters = getCoverLetters();
  const interviewResults = getInterviewResults();
  const techStacks = getTechStacks();

  const items = [];

  if (techStacks.length > 0) {
    items.push({
      id: "tech-stack",
      title: "기술스택 업데이트",
      desc: `${techStacks.slice(0, 4).join(" · ")}${
        techStacks.length > 4 ? ` 외 ${techStacks.length - 4}개` : ""
      }`,
      meta: "이력서 데이터",
      timestamp: 4,
    });
  }

  favorites.slice(0, 2).forEach((job, index) => {
    items.push({
      id: `favorite-${job.title}-${index}`,
      title: `${job.company} 공고 저장`,
      desc: `${job.role} 지원 준비를 이어갈 수 있습니다.`,
      meta: "찜한 기업",
      timestamp: 3 - index,
    });
  });

  coverLetters.forEach((letter) => {
    items.push({
      id: `cover-${letter.id}`,
      title: `${letter.company} 맞춤 자소서 저장`,
      desc: "지원 동기와 프로젝트 경험 초안이 저장되었습니다.",
      meta: letter.savedAt ? formatDate(letter.savedAt) : "맞춤 자소서",
      timestamp: getTimestamp(letter.savedAt) || 2,
    });
  });

  interviewResults.forEach((result) => {
    items.push({
      id: `interview-${result.id || result.company}-${result.createdAt}`,
      title: `${result.company || "기업"} 면접 리포트 생성`,
      desc: `${result.role || "면접"} · 종합 ${result.score ?? 0}점`,
      meta: formatDate(result.createdAt),
      timestamp: getTimestamp(result.createdAt) || 1,
    });
  });

  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
}

function getScoreTone(score) {
  if (score >= 80) return "양호";
  if (score >= 60) return "보완 권장";
  if (score >= 40) return "진행 중";
  return "우선 보완";
}

export default function Home() {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [careerScores, setCareerScores] = useState(() => getCareerScores());
  const [nextAction, setNextAction] = useState(() => getNextAction());
  const [favoriteCompanies, setFavoriteCompanies] = useState(() =>
    buildFavoriteCompanies()
  );
  const [latestInterview, setLatestInterview] = useState(() =>
    getLatestInterviewSummary()
  );
  const [techStacks, setTechStacks] = useState(() => getTechStacks());
  const [recentActivities, setRecentActivities] = useState(() =>
    buildRecentActivities()
  );

  const overall = careerScores.overall;
  const readinessStatus = getReadinessStatus(overall);

  const companyList = useMemo(() => {
    if (favoriteCompanies.length > 0) {
      return favoriteCompanies.slice(0, 3);
    }

    return fallbackCompanies.map(([logo, title, desc, score]) => ({
      logo,
      title,
      desc,
      score,
      path: "/fitting",
    }));
  }, [favoriteCompanies]);

  const todayStatusCards = useMemo(
    () => [
      {
        label: "프로필 완성도",
        value: `${careerScores.resume}%`,
        desc: getScoreTone(careerScores.resume),
        path: "/resume",
      },
      {
        label: "종합 준비도",
        value: `${careerScores.overall}%`,
        desc: readinessStatus,
        path: "/growth",
      },
      {
        label: "찜한 기업",
        value: `${favoriteCount}개`,
        desc: favoriteCount > 0 ? "지원 후보 있음" : "관심 기업 필요",
        path: "/fitting",
      },
      {
        label: "최근 면접",
        value: latestInterview.value,
        desc: latestInterview.desc,
        path: "/interview",
      },
    ],
    [careerScores, favoriteCount, latestInterview, readinessStatus]
  );

  const scoreBreakdown = useMemo(
    () => [
      ["이력서", careerScores.resume, "/resume"],
      ["자소서", careerScores.coverLetter, "/fitting"],
      ["면접", careerScores.interview, "/interview"],
      ["기술", careerScores.tech, "/resume"],
    ],
    [careerScores]
  );

  const refreshHomeData = () => {
    const nextScores = getCareerScores();
    const favorites = buildFavoriteCompanies();

    setCareerScores(nextScores);
    setNextAction(getNextAction());
    setFavoriteCompanies(favorites);
    setFavoriteCount(getFavoriteCount());
    setLatestInterview(getLatestInterviewSummary());
    setTechStacks(getTechStacks());
    setRecentActivities(buildRecentActivities());
    setShowBanner(!isResumeSubmitted());
  };

  useEffect(() => {
    refreshHomeData();

    const handleRefresh = () => {
      refreshHomeData();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("careerScoreChanged", handleRefresh);
    window.addEventListener("articlue:career-score-changed", handleRefresh);
    window.addEventListener("articlue-career-score-change", handleRefresh);
    window.addEventListener("articlue:data-updated", handleRefresh);
    window.addEventListener("articlue:resume-updated", handleRefresh);
    window.addEventListener("articlue:profile-updated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("careerScoreChanged", handleRefresh);
      window.removeEventListener("articlue:career-score-changed", handleRefresh);
      window.removeEventListener("articlue-career-score-change", handleRefresh);
      window.removeEventListener("articlue:data-updated", handleRefresh);
      window.removeEventListener("articlue:resume-updated", handleRefresh);
      window.removeEventListener("articlue:profile-updated", handleRefresh);
    };
  }, []);

  const hideImproveBanner = () => {
    setShowBanner(false);
  };

  const handleRecommendationViewed = () => {
    markRecommendationViewed("main_home");
  };

  return (
    <AppLayout title="AI 커리어 홈">
      {showBanner && (
        <div className="mb-[18px] flex items-center justify-between gap-[18px] rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-[16px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-blue-900 dark:from-slate-900 dark:to-slate-800">
          <div>
            <strong className="mb-[5px] block text-[16px] font-black text-slate-900 dark:text-white">
              이력서를 완성하고 더 정확한 추천을 받아보세요.
            </strong>
            <p className="text-[13px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
              최종 제출을 완료하면 AI가 더 정확한 기업과 직무를 추천해드립니다.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/resume"
              onClick={markResumeContinue}
              className="inline-flex rounded-full border border-blue-600 px-[19px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5 dark:text-blue-300"
            >
              이력서 보완하기
            </Link>

            <button
              type="button"
              onClick={hideImproveBanner}
              className="h-[34px] w-[34px] rounded-full border border-slate-200 bg-white text-slate-600 font-black dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <section className="relative mb-[20px] grid grid-cols-[minmax(0,1fr)_220px] items-center gap-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] p-[28px] text-white shadow-[0_18px_55px_rgba(37,99,235,0.12)]">
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[13px] font-black">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              오늘의 커리어 대시보드
            </div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[12px] font-black">
              시연 저장소 기반 데이터 표시
            </div>
          </div>

          <h2 className="mb-[12px] text-[29px] font-extrabold leading-[1.34] tracking-[-0.2px]">
            내 지원 준비 상태와 오늘 해야 할 액션을 한눈에 확인하세요
          </h2>

          <p className="mb-5 max-w-[650px] text-[15px] leading-[1.72] opacity-95">
            이력서, 자소서, 면접, 기술스택 데이터를 연결해 현재 준비도와
            다음 행동, 추천 기업을 하나의 흐름으로 정리합니다.
          </p>

          <div className="flex flex-wrap gap-[10px]">
            <Link
              to={nextAction.path}
              className="inline-flex items-center justify-center rounded-full bg-white px-[19px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5"
            >
              {nextAction.label}
            </Link>

            <Link
              to="/growth"
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-[19px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5"
            >
              성장 리포트 보기
            </Link>
          </div>
        </div>

        <div className="relative z-10 w-[220px] rounded-[24px] border border-white/25 bg-white/15 p-5 backdrop-blur-xl">
          <div className="mb-3 text-[14px] font-black opacity-90">
            현재 추천 준비도
          </div>

          <div className="mb-[10px]">
            <strong className="block text-[42px] font-black leading-none tracking-[-1px]">
              {overall}%
            </strong>
            <span className="mt-[7px] block whitespace-nowrap text-[13px] font-extrabold opacity-85">
              {readinessStatus}
            </span>
          </div>

          <div className="mb-[13px] h-[10px] overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white to-green-200"
              style={{ width: `${overall}%` }}
            />
          </div>

          <p className="text-[13px] font-medium leading-[1.65] opacity-90">
            이력서 {careerScores.resume}%, 자소서 {careerScores.coverLetter}%,
            면접 {careerScores.interview}%, 기술 {careerScores.tech}% 기준입니다.
          </p>
        </div>

        <div className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full bg-white/15" />
      </section>

      <section className="mb-[20px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-[18px] flex items-start justify-between gap-[14px]">
          <div>
            <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
              AI 추천 결과
            </p>
            <h3 className="mb-[7px] text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              오늘의 추천 기업 TOP 3
            </h3>
            <p className="text-[14px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
              현재 프로필과 준비도 데이터를 기준으로 적합도가 높은 기업입니다.
            </p>
          </div>

          <Link
            to="/fitting"
            onClick={handleRecommendationViewed}
            className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[13px] font-black text-blue-700 transition hover:-translate-y-0.5 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {companyList.map((company, index) => (
            <Link
              key={company.title}
              to={company.path}
              className="group rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800 dark:hover:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-blue-600 font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)]">
                  {company.logo}
                </div>

                <span className="rounded-full bg-white px-3 py-2 text-[12px] font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  TOP {index + 1}
                </span>
              </div>

              <strong className="mb-2 block min-h-[44px] break-keep text-[16px] font-black leading-[1.45] text-slate-900 dark:text-white">
                {company.title}
              </strong>

              <p className="mb-4 line-clamp-2 text-[13px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                {company.desc}
              </p>

              <div className="flex items-end justify-between gap-3">
                <span className="text-[12px] font-black text-blue-700 dark:text-blue-300">
                  매칭 적합도
                </span>
                <strong className="font-mono text-[26px] font-black text-emerald-600 dark:text-emerald-400">
                  {company.score}
                </strong>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-[14px] flex flex-wrap gap-[7px]">
          {[
            `${techStacks.length}개 기술스택 반영`,
            `${careerScores.coverLetter}% 자소서 준비도`,
            `${careerScores.interview}% 면접 준비도`,
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-blue-50 px-[10px] py-[6px] text-[12px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-[20px] grid grid-cols-4 gap-4">
        {todayStatusCards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-800"
          >
            <span className="mb-3 block text-[13px] font-black text-slate-600 dark:text-slate-300">
              {card.label}
            </span>
            <strong className="block truncate text-[25px] font-black text-slate-900 dark:text-white">
              {card.value}
            </strong>
            <p className="mt-2 line-clamp-2 text-[12px] font-bold leading-[1.55] text-slate-400 dark:text-slate-500">
              {card.desc}
            </p>
          </Link>
        ))}
      </section>

      <section className="mb-[22px] grid grid-cols-[.95fr_1.05fr] gap-[22px]">
        <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-[18px] flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
                다음 액션
              </p>
              <h3 className="text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
                {nextAction.title}
              </h3>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-2 text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              우선순위
            </span>
          </div>

          <p className="mb-[18px] break-keep text-[14px] font-bold leading-[1.7] text-slate-600 dark:text-slate-300">
            {nextAction.description}
          </p>

          <div className="mb-[18px] grid grid-cols-2 gap-3">
            {scoreBreakdown.map(([label, score, path]) => (
              <Link
                key={label}
                to={path}
                className="rounded-[18px] border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[12px] font-black text-slate-600 dark:text-slate-300">
                    {label}
                  </span>
                  <strong className="text-[13px] font-black text-slate-900 dark:text-white">
                    {score}%
                  </strong>
                </div>
                <div className="h-[8px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>

          <Link
            to={nextAction.path}
            className="inline-flex rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            {nextAction.label}
          </Link>
        </article>

        <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-[18px] flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
                최근 활동
              </h3>
              <p className="text-[14px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                이력서, 자소서, 면접, 찜한 기업 기록을 최신 상태로 정리합니다.
              </p>
            </div>
            <Link
              to="/mypage"
              className="text-[13px] font-black text-blue-700 dark:text-blue-300"
            >
              관리하기 →
            </Link>
          </div>

          {recentActivities.length > 0 ? (
            <div className="grid gap-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-blue-50 text-[13px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 truncate text-[14px] font-black text-slate-900 dark:text-white">
                      {activity.title}
                    </div>
                    <p className="line-clamp-1 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      {activity.desc}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-[11px] font-black text-slate-400 dark:text-slate-500">
                    {activity.meta}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-100 p-7 text-center text-[14px] font-extrabold leading-[1.7] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              아직 표시할 활동이 없습니다.
              <br />
              이력서 작성, 기업 찜, 자소서 생성, 면접 연습을 진행하면 이곳에 표시됩니다.
            </div>
          )}
        </article>
      </section>
    </AppLayout>
  );
}