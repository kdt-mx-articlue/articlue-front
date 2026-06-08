import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppLayout from "../components/AppLayout.jsx";
import {
  getCareerScores,
  getReadinessData,
  getReadinessStatus,
} from "../utils/careerScore.js";

const FAVORITE_KEY = "articlue_favorite_jobs";
const COVER_LETTER_KEY = "articlue_cover_letters";
const INTERVIEW_RESULT_KEY = "articlue_interview_results";
const TECH_STACK_KEY = "articlue-resume-techs";

const scores = [
  ["서버 설계", 92],
  ["API 구현", 86],
  ["협업 문서화", 73],
  ["비즈니스 표현", 64],
  ["인프라 운영", 58],
];

const baseCompanies = [
  {
    id: "naver",
    company: "네이버웹툰",
    role: "Backend Engineer",
    match: 91,
    reason:
      "Redis 캐싱, API 설계, 대용량 트래픽 처리 경험이 백엔드 JD와 높게 일치합니다.",
    improvement: "AWS · CI/CD 경험을 추가하면 적합도를 더 높일 수 있어요.",
    skills: ["Redis", "API 설계", "대용량 트래픽"],
    tone: "border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
  },
  {
    id: "toss",
    company: "토스",
    role: "Server Developer",
    match: 88,
    reason:
      "성능 개선과 안정적인 서버 운영 경험이 금융 서비스 백엔드 역량과 잘 연결됩니다.",
    improvement: "장애 대응과 운영 안정성 사례를 추가하면 설득력이 올라가요.",
    skills: ["Spring", "성능 개선", "서버 안정성"],
    tone: "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  },
  {
    id: "kakao",
    company: "카카오",
    role: "Platform Backend",
    match: 84,
    reason:
      "플랫폼 구조 이해와 협업 기반 개발 경험이 서비스 운영형 백엔드 직무와 맞습니다.",
    improvement: "협업 산출물과 플랫폼 운영 경험을 보강하면 좋아요.",
    skills: ["Platform", "협업", "운영 경험"],
    tone: "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  },
];

const weaknesses = [
  [
    "인프라·배포 경험",
    "Docker, AWS, CI/CD 키워드가 약하게 드러나 운영 가능한 백엔드 역량 설득이 부족합니다.",
    "배포 구조, 장애 대응, 자동화 파이프라인 경험을 3문장으로 추가하세요.",
  ],
  [
    "비즈니스 임팩트 설명",
    "Redis 캐싱 경험은 있으나 트래픽 개선, 응답 속도, 사용자 경험 개선으로 연결되는 설명이 부족합니다.",
    "문제 → 기술 선택 → 개선 결과 구조로 프로젝트 문장을 재작성하세요.",
  ],
  [
    "협업 과정 증명",
    "협업 경험은 확인되지만 코드 리뷰, 이슈 관리, 문서화 방식이 더 구체적이면 신뢰도가 올라갑니다.",
    "GitHub Issue, PR, 회고 문서 등 협업 산출물을 연결하세요.",
  ],
];

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readTechStacks() {
  const parsed = readJson(TECH_STACK_KEY, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((tech) => {
      if (typeof tech === "string") return tech;
      return tech?.name || tech?.label || tech?.value || "";
    })
    .filter(Boolean);
}

function hasCompanyCoverLetter(coverLetters, companyId) {
  return Boolean(coverLetters && typeof coverLetters === "object" && coverLetters[companyId]);
}

function findCompanyInterview(interviewResults, companyName) {
  if (!Array.isArray(interviewResults)) return null;
  return interviewResults.find((result) => result.company === companyName) || null;
}

function hasFavoriteCompany(favorites, companyName) {
  if (!Array.isArray(favorites)) return false;
  return favorites.some((job) => job.company === companyName);
}

function countSkillMatches(companySkills, techStacks) {
  const normalizedTechs = techStacks.map((tech) => tech.toLowerCase());

  return companySkills.filter((skill) =>
    normalizedTechs.some(
      (tech) =>
        skill.toLowerCase().includes(tech) ||
        tech.includes(skill.toLowerCase())
    )
  ).length;
}

function buildDynamicCompanies() {
  const favorites = readJson(FAVORITE_KEY, []);
  const coverLetters = readJson(COVER_LETTER_KEY, {});
  const interviewResults = readJson(INTERVIEW_RESULT_KEY, []);
  const techStacks = readTechStacks();

  return baseCompanies
    .map((company) => {
      const isFavorite = hasFavoriteCompany(favorites, company.company);
      const hasCoverLetter = hasCompanyCoverLetter(coverLetters, company.id);
      const interview = findCompanyInterview(interviewResults, company.company);
      const skillMatchCount = countSkillMatches(company.skills, techStacks);

      let bonus = 0;
      const statusBadges = [];

      if (isFavorite) {
        bonus += 20;
        statusBadges.push("찜한 기업");
      }

      if (hasCoverLetter) {
        bonus += 15;
        statusBadges.push("자소서 생성 완료");
      }

      if (interview) {
        bonus += 10;
        statusBadges.push(`면접 ${interview.score}점`);
      }

      if (skillMatchCount > 0) {
        bonus += skillMatchCount * 4;
        statusBadges.push(`기술 ${skillMatchCount}개 일치`);
      }

      const dynamicMatch = Math.min(99, company.match + Math.round(bonus / 3));

      let reason = company.reason;
      let improvement = company.improvement;

      if (isFavorite && hasCoverLetter && interview) {
        reason = `${company.company}는 찜한 기업이며 맞춤 자소서와 면접 기록까지 있어 지원 준비도가 가장 높습니다.`;
      } else if (isFavorite && hasCoverLetter) {
        reason = `${company.company}는 찜한 기업이고 맞춤 자소서 초안까지 생성되어 바로 지원 준비를 이어가기 좋습니다.`;
      } else if (isFavorite) {
        reason = `${company.company}는 사용자가 찜한 기업입니다. 현재 관심도가 높기 때문에 우선 지원 후보로 볼 수 있습니다.`;
      } else if (hasCoverLetter) {
        reason = `${company.company} 맞춤 자소서가 이미 생성되어 있어 지원 자료 준비가 빠르게 이어질 수 있습니다.`;
      } else if (interview) {
        reason = `${company.company} 면접 기록이 있어 답변 보완 방향을 바탕으로 재도전 전략을 세우기 좋습니다.`;
      } else if (skillMatchCount > 0) {
        reason = `이력서에 입력된 기술스택과 ${company.company}의 핵심 요구 역량이 일부 일치합니다.`;
      }

      if (interview && Number(interview.score) < 80) {
        improvement = `최근 면접 점수가 ${interview.score}점입니다. 기술 선택 이유와 비즈니스 성과 설명을 보완한 뒤 재도전하세요.`;
      } else if (hasCoverLetter && !interview) {
        improvement = "자소서 초안은 준비됐습니다. 다음 단계로 실전 면접 질문을 생성해보세요.";
      } else if (isFavorite && !hasCoverLetter) {
        improvement = "찜한 기업입니다. 먼저 맞춤 자소서를 생성하면 지원 준비도가 올라갑니다.";
      }

      return {
        ...company,
        match: dynamicMatch,
        reason,
        improvement,
        statusBadges,
        interview,
        hasCoverLetter,
      };
    })
    .sort((a, b) => b.match - a.match)
    .map((company, index) => ({
      ...company,
      rank: `TOP ${index + 1}`,
    }));
}


function getScoreLevel(score) {
  if (score >= 80) return "양호";
  if (score >= 60) return "보완 권장";
  if (score >= 40) return "집중 보완";
  return "우선 보완";
}

function getLowestScoreItem(careerScores) {
  const items = [
    {
      key: "resume",
      label: "이력서 완성도",
      score: careerScores.resume,
      title: "이력서 기본 정보와 프로젝트 경험 보완이 가장 우선입니다.",
      description:
        "프로필 기본 정보, 프로젝트 경험, 기술 스택을 더 채우면 추천 기업 적합도와 성장 진단 정확도가 함께 올라갑니다.",
      path: "/resume",
      buttonLabel: "이력서 보완하기",
    },
    {
      key: "coverLetter",
      label: "자소서 준비도",
      score: careerScores.coverLetter,
      title: "추천 기업 기준 맞춤 자소서를 먼저 준비하면 좋습니다.",
      description:
        "관심 기업별 지원 동기와 프로젝트 경험을 정리하면 실제 지원 단계로 넘어가기 쉬워집니다.",
      path: "/fitting",
      buttonLabel: "자소서 생성하기",
    },
    {
      key: "interview",
      label: "면접 준비도",
      score: careerScores.interview,
      title: "면접 답변 근거와 성과 설명을 보완해야 합니다.",
      description:
        "기술 선택 이유, 문제 해결 과정, 결과 수치를 말로 설명하는 연습을 추가하면 면접 준비도가 올라갑니다.",
      path: "/interview",
      buttonLabel: "면접 연습하기",
    },
    {
      key: "tech",
      label: "기술스택 적합도",
      score: careerScores.tech,
      title: "기술스택을 더 구체적으로 입력해야 추천 정확도가 올라갑니다.",
      description:
        "언어, 프레임워크, 데이터베이스, 협업 도구를 추가하면 기업별 직무 적합도 계산이 더 정밀해집니다.",
      path: "/resume",
      buttonLabel: "기술스택 추가하기",
    },
  ];

  return items.sort((a, b) => a.score - b.score)[0];
}

function getPrimaryAction(careerScores) {
  if (careerScores.resume < 60) {
    return {
      label: "이력서 보완",
      title: "지원 준비의 기준 데이터부터 채워야 합니다.",
      description: "기본 정보와 프로젝트 경험을 채우면 모든 화면의 준비도 계산이 안정화됩니다.",
      path: "/resume",
    };
  }

  if (careerScores.coverLetter < 60) {
    return {
      label: "자소서 생성",
      title: "추천 기업 기준 맞춤 자소서를 생성하세요.",
      description: "기업별 지원 동기와 프로젝트 경험을 정리하면 다음 단계로 넘어가기 쉽습니다.",
      path: "/fitting",
    };
  }

  if (careerScores.interview < 60) {
    return {
      label: "면접 연습",
      title: "자소서 이후에는 면접 답변 완성도가 중요합니다.",
      description: "질문별 답변 근거와 성과 설명을 연습해 면접 준비도를 끌어올리세요.",
      path: "/interview",
    };
  }

  return {
    label: "추천 기업 확인",
    title: "이제 관심 기업 기준으로 지원 전략을 이어가세요.",
    description: "추천 기업을 비교하고 자소서·면접 준비를 기업별로 연결하면 좋습니다.",
    path: "/fitting",
  };
}

export default function Growth() {
  const [toast, setToast] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshGrowthData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    window.addEventListener("focus", refreshGrowthData);
    window.addEventListener("storage", refreshGrowthData);
    window.addEventListener("careerScoreChanged", refreshGrowthData);
    window.addEventListener("articlue:career-score-changed", refreshGrowthData);
    window.addEventListener("articlue-career-score-change", refreshGrowthData);
    window.addEventListener("articlue:data-updated", refreshGrowthData);
    window.addEventListener("articlue:resume-updated", refreshGrowthData);
    window.addEventListener("articlue:profile-updated", refreshGrowthData);

    return () => {
      window.removeEventListener("focus", refreshGrowthData);
      window.removeEventListener("storage", refreshGrowthData);
      window.removeEventListener("careerScoreChanged", refreshGrowthData);
      window.removeEventListener("articlue:career-score-changed", refreshGrowthData);
      window.removeEventListener("articlue-career-score-change", refreshGrowthData);
      window.removeEventListener("articlue:data-updated", refreshGrowthData);
      window.removeEventListener("articlue:resume-updated", refreshGrowthData);
      window.removeEventListener("articlue:profile-updated", refreshGrowthData);
    };
  }, []);

  const careerScores = useMemo(() => getCareerScores(), [refreshKey]);
  const readinessData = useMemo(() => getReadinessData(), [refreshKey]);
  const readinessStatus = getReadinessStatus(careerScores.overall);

  const recommendedCompanies = useMemo(() => buildDynamicCompanies(), [refreshKey]);

  const radarData = scores.map(([subject, score]) => ({
    subject,
    score,
    fullMark: 100,
  }));

  const dashboardCards = [
    {
      label: "이력서 완성도",
      value: careerScores.resume,
      description: "기본 정보, 프로젝트 경험, 기술스택 입력 상태",
      path: "/resume",
      buttonLabel: "보완하기",
    },
    {
      label: "자소서 준비도",
      value: careerScores.coverLetter,
      description: "추천 기업 기준 맞춤 자소서 저장 상태",
      path: "/fitting",
      buttonLabel: "생성하기",
    },
    {
      label: "면접 준비도",
      value: careerScores.interview,
      description: "AI 면접 리포트와 답변 완성도 기준",
      path: "/interview",
      buttonLabel: "연습하기",
    },
    {
      label: "기술스택 적합도",
      value: careerScores.tech,
      description: "입력된 기술스택과 추천 직무 요구 역량 일치도",
      path: "/resume",
      buttonLabel: "추가하기",
    },
  ];

  const lowestScoreItem = getLowestScoreItem(careerScores);
  const primaryAction = getPrimaryAction(careerScores);

  const actionCards = [
    primaryAction,
    {
      label: "성장 리포트 확인",
      title: "점수별 약점과 보완 방향을 다시 점검하세요.",
      description: "현재 화면에서 부족한 영역, 추천 기업, 차트 분석을 함께 확인할 수 있습니다.",
      path: "/growth",
    },
    {
      label: "기업 추천 확인",
      title: "내 준비도와 맞는 기업을 비교하세요.",
      description: "찜한 기업, 자소서, 면접 기록, 기술스택을 반영한 추천 우선순위를 확인하세요.",
      path: "/fitting",
    },
  ];

  const supportFlow = [
    ["01", "프로필 작성", "기본 정보와 기술스택 입력"],
    ["02", "기업 추천", "적합도 높은 기업 확인"],
    ["03", "자소서 생성", "기업별 지원 문서 준비"],
    ["04", "면접 연습", "답변 근거와 성과 설명 보완"],
    ["05", "최종 점검", "성장 리포트로 약점 확인"],
  ];

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <AppLayout title="커리어 분석 리포트">
      <section className="relative mb-[22px] grid grid-cols-[1.25fr_.75fr] items-center gap-7 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] p-[34px] text-white shadow-[0_18px_55px_rgba(37,99,235,0.12)]">
        <div className="relative z-10">
          <h2 className="mb-3 mt-[6px] break-keep text-[32px] font-black leading-[1.25] tracking-[-1px]">
            내 커리어 프로필의 약점을 진단하고 합격 가능성을 높일 성장 루트를 확인하세요.
          </h2>

          <p className="max-w-[670px] break-keep text-[15px] leading-[1.75] opacity-95">
            기술 스택과 프로젝트 경험을 기업 직무 기준으로 다시 해석해, 부족한
            역량·보완 이유·다음 액션을 한 화면에서 정리합니다.
          </p>

          <div className="mt-[14px] inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-2 text-[12px] font-black text-white/95">
            계산 기준: 이력서 · 자소서 · 면접 · 기술스택 입력값
          </div>

          <div className="mt-5 flex flex-wrap gap-[10px]">
            <button
              type="button"
              onClick={() => showToast("맞춤 보완 루트를 생성했습니다.")}
              className="rounded-full bg-white px-[18px] py-3 text-[14px] font-black text-blue-700"
            >
              부족한 역량 보완하러 가기
            </button>

            <Link
              to="/interview"
              className="rounded-full border border-white/60 px-[18px] py-3 text-[14px] font-black text-white"
            >
              맞춤 면접 질문 생성하기
            </Link>
          </div>
        </div>

        <div className="relative z-10 rounded-[24px] border border-white/25 bg-white/15 p-[18px] backdrop-blur-md">
          <div className="mb-[14px] text-[13px] font-black opacity-90">
            종합 성장 준비도
          </div>

          <div className="mb-[11px] flex items-end justify-between gap-3">
            <strong className="text-[42px] font-black leading-none tracking-[-1px]">
              {careerScores.overall}%
            </strong>
            <span className="text-[13px] font-black opacity-90">
              {readinessStatus}
            </span>
          </div>

          <div className="mb-[13px] h-[10px] overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${careerScores.overall}%` }}
            />
          </div>

          <p className="text-[13px] leading-[1.6] opacity-90">
            이력서 {careerScores.resume}%, 자소서 {careerScores.coverLetter}%,
            면접 {careerScores.interview}%, 기술 적합도 {careerScores.tech}%를
            기준으로 계산된 준비도입니다.
          </p>
        </div>

        <div className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full bg-white/15" />
      </section>

      <section className="mb-[22px] grid grid-cols-4 gap-4">
        {dashboardCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[26px] border border-slate-200 bg-white p-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-[13px] flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-black text-slate-900 dark:text-white">
                  {card.label}
                </h3>
                <p className="mt-2 break-keep text-[12px] font-bold leading-[1.55] text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-blue-50 px-[10px] py-[7px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {getScoreLevel(card.value)}
              </span>
            </div>

            <div className="mb-[12px] flex items-end justify-between gap-3">
              <strong className="text-[34px] font-black leading-none tracking-[-1px] text-slate-900 dark:text-white">
                {card.value}%
              </strong>
              <Link
                to={card.path}
                className="rounded-full border border-blue-600 px-[12px] py-[8px] text-[12px] font-black text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                {card.buttonLabel}
              </Link>
            </div>

            <div className="h-[9px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                style={{ width: `${card.value}%` }}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="mb-[22px] grid grid-cols-[1.05fr_.95fr] gap-5">
        <article className="rounded-[28px] border border-amber-100 bg-amber-50 p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-4 inline-flex rounded-full bg-white px-[12px] py-[8px] text-[12px] font-black text-amber-700 dark:bg-slate-900 dark:text-amber-300">
            우선 보완 영역
          </div>

          <h3 className="mb-2 text-[24px] font-black tracking-[-0.6px] text-slate-900 dark:text-white">
            {lowestScoreItem.label}
          </h3>

          <div className="mb-4 flex items-end gap-2">
            <strong className="text-[46px] font-black leading-none tracking-[-1.2px] text-amber-700 dark:text-amber-300">
              {lowestScoreItem.score}%
            </strong>
            <span className="pb-1 text-[13px] font-black text-slate-500 dark:text-slate-400">
              현재 가장 낮은 항목
            </span>
          </div>

          <h4 className="mb-2 break-keep text-[18px] font-black text-slate-900 dark:text-white">
            {lowestScoreItem.title}
          </h4>

          <p className="mb-5 break-keep text-[14px] font-bold leading-[1.75] text-slate-700 dark:text-slate-300">
            {lowestScoreItem.description}
          </p>

          <Link
            to={lowestScoreItem.path}
            className="inline-flex rounded-full bg-amber-600 px-[18px] py-3 text-[14px] font-black text-white hover:bg-amber-700"
          >
            {lowestScoreItem.buttonLabel}
          </Link>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5">
            <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
              Next Best Actions
            </p>
            <h3 className="text-[23px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              지금 바로 이어갈 추천 액션
            </h3>
          </div>

          <div className="grid gap-3">
            {actionCards.map((action) => (
              <div
                key={action.title}
                className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-slate-50 p-[16px] dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <span className="mb-2 inline-flex rounded-full bg-blue-50 px-[10px] py-[6px] text-[11px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {action.label}
                  </span>
                  <strong className="mb-1 block break-keep text-[15px] font-black text-slate-900 dark:text-white">
                    {action.title}
                  </strong>
                  <p className="break-keep text-[12px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                    {action.description}
                  </p>
                </div>

                <Link
                  to={action.path}
                  className="shrink-0 rounded-full border border-blue-600 px-[14px] py-[9px] text-[12px] font-black text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  이동
                </Link>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mb-[22px] rounded-[28px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-[18px]">
          <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
            Support Flow
          </p>
          <h3 className="text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
            지원 준비 흐름
          </h3>
          <p className="mt-2 break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
            Articlue의 각 화면이 어떤 순서로 연결되는지 한눈에 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {supportFlow.map(([step, title, desc]) => (
            <div
              key={step}
              className="rounded-[22px] border border-slate-200 bg-slate-50 p-[17px] dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-[12px] font-black text-white">
                {step}
              </span>
              <strong className="mb-2 block text-[15px] font-black text-slate-900 dark:text-white">
                {title}
              </strong>
              <p className="break-keep text-[12px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-[22px] rounded-[28px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-[20px] flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
              AI Recommended Companies
            </p>
            <h3 className="text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              추천 기업 TOP 3
            </h3>
            <p className="mt-2 break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              찜한 기업, 자소서 생성 여부, 면접 기록, 기술스택을 반영해 지원 가능성이 높은 기업을 우선순위로 정리했습니다.
            </p>
          </div>

          <Link
            to="/fitting"
            className="shrink-0 rounded-full border border-blue-600 px-[16px] py-[10px] text-[13px] font-black text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
          >
            전체 추천 보기
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-[14px]">
          {recommendedCompanies.map((company) => (
            <article
              key={company.company}
              className={`rounded-[24px] border p-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${company.tone}`}
            >
              <div className="mb-[14px] flex items-start justify-between gap-3">
                <div>
                  <span className="mb-2 inline-flex rounded-full bg-white/80 px-[10px] py-[6px] text-[12px] font-black text-blue-700 dark:bg-slate-900/70 dark:text-blue-300">
                    {company.rank}
                  </span>

                  <h4 className="text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
                    {company.company}
                  </h4>

                  <p className="mt-1 text-[13px] font-extrabold text-slate-600 dark:text-slate-300">
                    {company.role}
                  </p>
                </div>

                <div className="text-right">
                  <strong className="block text-[28px] font-black leading-none text-emerald-600 dark:text-emerald-300">
                    {company.match}%
                  </strong>
                  <span className="mt-1 block text-[11px] font-black text-slate-500 dark:text-slate-400">
                    적합도
                  </span>
                </div>
              </div>

              {company.statusBadges.length > 0 && (
                <div className="mb-[12px] flex flex-wrap gap-[7px]">
                  {company.statusBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-white/80 px-[9px] py-[6px] text-[11px] font-black text-blue-700 dark:bg-slate-900/70 dark:text-blue-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-[14px] rounded-[18px] bg-white/70 p-[14px] dark:bg-slate-900/60">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.08em] text-blue-700 dark:text-blue-300">
                  추천 이유
                </p>
                <p className="break-keep text-[13px] font-bold leading-[1.65] text-slate-700 dark:text-slate-300">
                  {company.reason}
                </p>
              </div>

              <div className="mb-[14px] flex flex-wrap gap-[7px]">
                {company.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/70 bg-white/80 px-[9px] py-[6px] text-[12px] font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mb-[16px] rounded-2xl border border-dashed border-slate-300 px-[12px] py-[10px] text-[12px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {company.improvement}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCompany(company)}
                  className="rounded-full bg-blue-600 px-[12px] py-[10px] text-center text-[12px] font-black text-white hover:bg-blue-700"
                >
                  공고 분석 보기
                </button>

                <Link
                  to={`/interview?company=${encodeURIComponent(company.company)}`}
                  className="rounded-full border border-blue-600 bg-white/80 px-[12px] py-[10px] text-center text-[12px] font-black text-blue-700 hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  면접 준비
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-[22px] grid grid-cols-[1fr_1fr] gap-5">
        <article className="rounded-[28px] border border-slate-200 bg-white p-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-[21px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              역량 매칭 레이더 차트
            </h3>
            <p className="mt-2 text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              핵심 백엔드 역량을 한눈에 비교해 강점과 약점을 파악합니다.
            </p>
          </div>

          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar
                  name="역량 점수"
                  dataKey="score"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.24}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-[21px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              합격 준비도 분석
            </h3>
            <p className="mt-2 text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              이력서, 자소서, 면접, 기술 적합도를 기준으로 현재 지원 준비 상태를 비교합니다.
            </p>
          </div>

          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, "준비도"]} />
                <Bar
                  dataKey="score"
                  name="준비도"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mb-5 grid grid-cols-[1fr_1fr] gap-5">
        <article className="rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-[18px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            역량별 진단 스코어
          </h3>

          <div className="flex flex-col gap-[14px]">
            {scores.map(([label, score]) => (
              <div
                key={label}
                className="grid grid-cols-[110px_1fr_44px] items-center gap-3"
              >
                <span className="text-[13px] font-black text-slate-600 dark:text-slate-300">
                  {label}
                </span>

                <div className="h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                    style={{ width: `${score}%` }}
                  />
                </div>

                <span className="text-right text-[13px] font-black text-slate-900 dark:text-white">
                  {score}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-[18px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            우선순위 약점 진단
          </h3>

          <div className="flex flex-col gap-3">
            {weaknesses.map(([title, desc, action]) => (
              <div
                key={title}
                className="rounded-[20px] border border-slate-200 bg-white p-[17px] dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-[10px] text-[15px] font-black text-slate-900 dark:text-white">
                  {title}
                </div>

                <p className="mb-3 break-keep text-[14px] leading-[1.7] text-slate-600 dark:text-slate-300">
                  {desc}
                </p>

                <div className="rounded-2xl bg-slate-100 px-[14px] py-[13px] text-[13px] font-extrabold leading-[1.6] text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <span className="font-black text-blue-700 dark:text-blue-300">
                    액션:
                  </span>{" "}
                  {action}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-[18px]">
          <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            AI 성장 피드백
          </h3>

          <p className="break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
            현재 진단 결과를 바탕으로 다음 행동을 선택하세요.
          </p>
        </div>

        <div className="mt-[22px] flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => showToast("맞춤 성장 루트를 저장했습니다.")}
            className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
          >
            부족한 역량 보완하러 가기
          </button>

          <Link
            to="/interview"
            className="rounded-full border border-blue-600 px-[18px] py-3 text-[14px] font-black text-blue-700 dark:text-blue-300"
          >
            맞춤 면접 질문 생성하기
          </Link>

          <Link
            to="/fitting"
            className="rounded-full border border-slate-200 bg-slate-100 px-[18px] py-3 text-[14px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            추천 기업 다시 확인하기
          </Link>
        </div>
      </section>

      {selectedCompany && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/70 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-[720px] rounded-[32px] bg-white p-[30px] shadow-[0_30px_80px_rgba(15,23,42,0.25)] dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[18px] font-black text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              ×
            </button>

            <div className="mb-[24px]">
              <span className="mb-3 inline-flex rounded-full bg-blue-100 px-[12px] py-[7px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {selectedCompany.rank}
              </span>

              <h3 className="mt-3 text-[32px] font-black tracking-[-1px] text-slate-900 dark:text-white">
                {selectedCompany.company}
              </h3>

              <p className="mt-2 text-[15px] font-bold text-slate-600 dark:text-slate-300">
                {selectedCompany.role}
              </p>
            </div>

            <div className="mb-[22px] rounded-[24px] bg-slate-100 p-[20px] dark:bg-slate-800">
              <div className="mb-3 flex items-end justify-between gap-4">
                <span className="text-[14px] font-black text-slate-600 dark:text-slate-300">
                  AI 적합도 분석
                </span>

                <strong className="text-[42px] font-black leading-none text-emerald-600 dark:text-emerald-300">
                  {selectedCompany.match}%
                </strong>
              </div>

              <div className="mb-[14px] h-[10px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  style={{ width: `${selectedCompany.match}%` }}
                />
              </div>

              <p className="break-keep text-[14px] leading-[1.7] text-slate-700 dark:text-slate-300">
                {selectedCompany.reason}
              </p>
            </div>

            {selectedCompany.statusBadges.length > 0 && (
              <div className="mb-[20px]">
                <h4 className="mb-3 text-[15px] font-black text-slate-900 dark:text-white">
                  현재 준비 상태
                </h4>

                <div className="flex flex-wrap gap-[8px]">
                  {selectedCompany.statusBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-blue-100 bg-blue-50 px-[12px] py-[8px] text-[13px] font-black text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-[24px] rounded-[22px] border border-dashed border-slate-300 p-[18px] dark:border-slate-700">
              <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
                적합도를 더 높이려면
              </p>

              <p className="break-keep text-[14px] leading-[1.7] text-slate-700 dark:text-slate-300">
                {selectedCompany.improvement}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to={`/fitting?company=${encodeURIComponent(selectedCompany.company)}`}
                className="rounded-[18px] bg-blue-600 px-[18px] py-[15px] text-center text-[14px] font-black text-white hover:bg-blue-700"
              >
                상세 분석 화면으로 이동
              </Link>

              <Link
                to={`/interview?company=${encodeURIComponent(selectedCompany.company)}`}
                className="rounded-[18px] border border-slate-300 px-[18px] py-[15px] text-center text-[14px] font-black text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                면접 질문 생성하기
              </Link>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-7 right-7 z-[999] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-extrabold text-white transition-all dark:bg-white dark:text-slate-900 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        {toast || "처리되었습니다."}
      </div>
    </AppLayout>
  );
}