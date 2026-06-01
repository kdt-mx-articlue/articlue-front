const RESUME_PROGRESS_KEY = "articlue_resume_progress";
const COVER_LETTER_KEY = "articlue_cover_letters";
const INTERVIEW_RESULT_KEY = "articlue_interview_results";
const TECH_STACK_KEY = "articlue-resume-techs";

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, Math.round(number)));
}

export function getResumeScore() {
  return clampScore(localStorage.getItem(RESUME_PROGRESS_KEY));
}

export function getCoverLetterCount() {
  const data = readJson(COVER_LETTER_KEY, {});
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") return Object.keys(data).length;
  return 0;
}

export function getCoverLetterScore() {
  const count = getCoverLetterCount();

  if (count <= 0) return 0;
  if (count === 1) return 30;
  if (count === 2) return 60;
  if (count === 3) return 80;
  return 100;
}

export function getInterviewResults() {
  const data = readJson(INTERVIEW_RESULT_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function getInterviewScore() {
  const results = getInterviewResults()
    .map((item) => Number(item.score))
    .filter((score) => Number.isFinite(score));

  if (results.length === 0) return 0;

  const average =
    results.reduce((sum, score) => sum + score, 0) / results.length;

  return clampScore(average);
}

export function getTechStacks() {
  const data = readJson(TECH_STACK_KEY, []);

  if (!Array.isArray(data)) return [];

  return data
    .map((tech) => {
      if (typeof tech === "string") return tech;
      return tech?.name || tech?.label || tech?.value || "";
    })
    .filter(Boolean);
}

export function getTechScore() {
  const count = getTechStacks().length;

  if (count <= 0) return 0;

  return clampScore((count / 20) * 100);
}

export function getCareerScores() {
  const resume = getResumeScore();
  const coverLetter = getCoverLetterScore();
  const interview = getInterviewScore();
  const tech = getTechScore();

  const overall = clampScore((resume + coverLetter + interview + tech) / 4);

  return {
    resume,
    coverLetter,
    interview,
    tech,
    overall,
  };
}

export function getReadinessData() {
  const scores = getCareerScores();

  return [
    { category: "이력서", score: scores.resume },
    { category: "자소서", score: scores.coverLetter },
    { category: "면접", score: scores.interview },
    { category: "기술 적합도", score: scores.tech },
  ];
}

export function getReadinessStatus(score) {
  if (score >= 90) return "지원 준비 완료";
  if (score >= 70) return "양호";
  if (score >= 40) return "보완 권장";
  return "집중 보완 필요";
}

export function getNextAction() {
  const scores = getCareerScores();

  if (scores.resume < 40) {
    return {
      title: "이력서 보완이 다음 우선순위예요",
      description: `현재 프로필 완성도는 ${scores.resume}%입니다. 추천 정확도를 높이려면 기본 정보, 프로젝트 경험, 기술 스택을 먼저 채워야 합니다.`,
      path: "/resume",
      label: "이력서 보완하기",
    };
  }

  if (scores.coverLetter === 0) {
    return {
      title: "맞춤 자소서를 먼저 생성해보세요",
      description:
        "저장된 맞춤 자소서가 없습니다. 추천 기업 기준으로 자소서 초안을 생성하면 지원 준비도가 올라갑니다.",
      path: "/fitting",
      label: "자소서 생성하기",
    };
  }

  if (scores.interview > 0 && scores.interview < 80) {
    return {
      title: "면접 답변을 한 번 더 보완해보세요",
      description: `최근 면접 준비도는 ${scores.interview}%입니다. 꼬리질문 대응과 성과 설명을 다시 연습하는 것이 좋습니다.`,
      path: "/interview",
      label: "면접 재도전",
    };
  }

  if (scores.tech < 40) {
    return {
      title: "기술 스택을 더 구체화해보세요",
      description:
        "기술 적합도가 아직 낮습니다. 사용 가능한 언어, 프레임워크, 데이터베이스, 협업 도구를 추가해보세요.",
      path: "/resume",
      label: "기술스택 추가",
    };
  }

  return {
    title: "추천 기업 지원 준비를 이어가세요",
    description:
      "이력서, 자소서, 면접 준비가 어느 정도 진행되었습니다. 관심 기업 기준으로 지원 전략을 이어가면 좋습니다.",
    path: "/fitting",
    label: "추천 기업 보기",
  };
}