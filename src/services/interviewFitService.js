const INTERVIEW_RESULT_KEY = "articlue_interview_result";

const DEFAULT_SECONDARY_FIT_DATA = {
  status: "empty",
  totalScore: 0,
  radarData: [
    { subject: "기술 이해도", score: 0, fullMark: 100 },
    { subject: "문제 해결력", score: 0, fullMark: 100 },
    { subject: "비즈니스 이해도", score: 0, fullMark: 100 },
    { subject: "커뮤니케이션", score: 0, fullMark: 100 },
    { subject: "성장 가능성", score: 0, fullMark: 100 },
  ],
  strengths: [],
  improvements: [],
  summary: "아직 AI 면접 결과가 없어 2차 최종 직무 적합도를 계산할 수 없습니다.",
};

function clampPercent(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) return fallback;

  return Math.min(100, Math.max(0, Math.round(number)));
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) return fallback;

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getInterviewData() {
  const saved = readJson(INTERVIEW_RESULT_KEY, null);

  if (!saved) return null;

  return saved?.data || saved?.result || saved;
}

export function getSecondFitResult() {
  const interviewData = getInterviewData();

  if (!interviewData) return DEFAULT_SECONDARY_FIT_DATA;

  const scores = interviewData.scores || {};

  const tech = clampPercent(scores.tech, 0);
  const problem = clampPercent(scores.problem, 0);
  const business = clampPercent(scores.business, 0);
  const communication = clampPercent(scores.communication, 0);
  const total = clampPercent(scores.total, 0);

  const growthPotential = clampPercent(
    Math.round((problem + business + communication) / 3),
    total
  );

  const hasScore =
    tech > 0 ||
    problem > 0 ||
    business > 0 ||
    communication > 0 ||
    total > 0;

  if (!hasScore) return DEFAULT_SECONDARY_FIT_DATA;

  return {
    status: interviewData.status || "ready",
    totalScore:
      total || Math.round((tech + problem + business + communication) / 4),
    radarData: [
      { subject: "기술 이해도", score: tech, fullMark: 100 },
      { subject: "문제 해결력", score: problem, fullMark: 100 },
      { subject: "비즈니스 이해도", score: business, fullMark: 100 },
      { subject: "커뮤니케이션", score: communication, fullMark: 100 },
      { subject: "성장 가능성", score: growthPotential, fullMark: 100 },
    ],
    strengths: Array.isArray(interviewData.strengths)
      ? interviewData.strengths
      : [],
    improvements: Array.isArray(interviewData.improvements)
      ? interviewData.improvements
      : [],
    summary:
      interviewData.summary ||
      "AI 면접 결과를 기반으로 2차 최종 직무 적합도를 계산했습니다.",
  };
}