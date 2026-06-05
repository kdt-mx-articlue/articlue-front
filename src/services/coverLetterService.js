import { readJson, writeJson } from "./careerDataService.js";

export const COVER_LETTER_KEY = "articlue_cover_letters";

const COMPANY_NAME_MAP = {
  naver: "네이버웹툰",
  toss: "토스",
  kakao: "카카오",
};

export function getCoverLetterMap() {
  const data = readJson(COVER_LETTER_KEY, {});
  return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

export function saveCoverLetter(companyId, content) {
  const saved = getCoverLetterMap();

  writeJson(COVER_LETTER_KEY, {
    ...saved,
    [companyId]: {
      ...content,
      savedAt: content?.savedAt || new Date().toISOString(),
    },
  });
}

export function getCoverLetters() {
  const data = getCoverLetterMap();

  return Object.entries(data).map(([companyId, content]) => {
    const motivation =
      content?.지원동기 || content?.motivation || "지원동기 내용이 없습니다.";
    const project =
      content?.프로젝트경험 ||
      content?.project ||
      "프로젝트 경험 내용이 없습니다.";

    return {
      id: companyId,
      company: content?.company || COMPANY_NAME_MAP[companyId] || companyId,
      title: `[${content?.company || COMPANY_NAME_MAP[companyId] || companyId}] 맞춤 자소서 초안`,
      motivation,
      project,
      savedAt: content?.savedAt || null,
    };
  });
}

export function getCoverLetterCount() {
  return Object.keys(getCoverLetterMap()).length;
}