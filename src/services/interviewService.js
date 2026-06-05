import { readJson, writeJson, readString, writeString } from "./careerDataService.js";

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