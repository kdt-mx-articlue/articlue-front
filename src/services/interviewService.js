import {
  readJson,
  writeJson,
  readString,
  writeString,
} from "./careerDataService.js";

export const INTERVIEW_RESULT_KEY = "articlue_interview_results";
export const INTERVIEW_COMPANY_KEY = "articlue_interview_company";
export const INTERVIEW_ROLE_KEY = "articlue_interview_role";

export function getInterviewResults() {
  const data = readJson(INTERVIEW_RESULT_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function saveInterviewResult(result) {
  const saved = getInterviewResults();
  writeJson(INTERVIEW_RESULT_KEY, [result, ...saved]);
}

export function saveInterviewTarget(company, role) {
  writeString(INTERVIEW_COMPANY_KEY, company);
  writeString(INTERVIEW_ROLE_KEY, role);
}

export function getInterviewTarget() {
  return {
    company: readString(INTERVIEW_COMPANY_KEY, ""),
    role: readString(INTERVIEW_ROLE_KEY, ""),
  };
}

export function getLatestInterviewSummary() {
  const results = getInterviewResults();

  if (results.length === 0) {
    return {
      value: "기록 없음",
      desc: "면접을 완료하면 최근 면접 준비 기록이 표시됩니다.",
    };
  }

  const latest = [...results].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();

    return bTime - aTime;
  })[0];

  return {
    value: latest.company || "최근 면접",
    desc: `${latest.role || "면접"} · 종합 ${latest.score ?? 0}점`,
  };
}