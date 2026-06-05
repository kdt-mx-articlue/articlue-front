import {
  readJson,
  writeJson,
  readString,
  writeString,
  removeItem,
} from "./careerDataService.js";
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  submitResume,
} from "./resumeApi.js";
import { getTechStacks as getTechStackCatalog } from "./techStackApi.js";
import { getGithubInfo, saveGithubInfo } from "./githubApi.js";

export const RESUME_DRAFT_KEY = "articlue_resume_draft";
export const RESUME_PROGRESS_KEY = "articlue_resume_progress";
export const TECH_STACK_KEY = "articlue-resume-techs";
export const GITHUB_KEY = "articlue_github_connection";
export const RESUME_SUBMITTED_KEY = "articlue_resume_submitted";
export const RESUME_SUBMITTED_AT_KEY = "articlue_resume_submitted_at";
export const RESUME_CONTINUE_KEY = "articlue_resume_continue";
export const ACTIVE_RESUME_ID_KEY = "articlue_active_resume_id";

export function getActiveResumeId() {
  return readString(ACTIVE_RESUME_ID_KEY, "");
}

export function setActiveResumeId(resumeId) {
  if (resumeId) {
    writeString(ACTIVE_RESUME_ID_KEY, resumeId);
  }
}

export function clearActiveResumeId() {
  removeItem(ACTIVE_RESUME_ID_KEY);
}

function extractResumeId(data) {
  return (
    data?.resumeId ||
    data?.resume_id ||
    data?.id ||
    data?.data?.resumeId ||
    data?.data?.resume_id ||
    data?.data?.id ||
    data?.resume?.resumeId ||
    data?.resume?.resume_id ||
    data?.resume?.id ||
    ""
  );
}

function normalizeResumeData(data, fallback = {}) {
  const source = data?.data || data?.resume || data || fallback;

  return {
    ...fallback,
    ...source,
    form: source?.form || fallback?.form || {},
    techStacks: source?.techStacks || fallback?.techStacks || [],
    experiences: source?.experiences || fallback?.experiences || [],
    essays: source?.essays || fallback?.essays || [],
    certificates: source?.certificates || fallback?.certificates || [],
    careers: source?.careers || fallback?.careers || [],
    files: source?.files || fallback?.files || [],
    github: source?.github || fallback?.github || {},
  };
}

function buildResumePayload(draft = {}) {
  const form = draft.form || {};

  return {
    resumeTitle: form.title || form.resumeTitle || "새 이력서",
    resume_title: form.title || form.resumeTitle || "새 이력서",
    desiredJob: form.desiredJob || form.job || "Backend Developer",
    desired_job: form.desiredJob || form.job || "Backend Developer",
    introduction:
      form.introduction ||
      form.summary ||
      "Articlue 커리어 프로필 기반 이력서입니다.",
    resumeStatus: "DRAFT",
    resume_status: "DRAFT",
    representativeYn: "Y",
    representative_yn: "Y",
    ...draft,
  };
}

export function getResumeDraft(fallback = {}) {
  return readJson(RESUME_DRAFT_KEY, fallback);
}

export function saveResumeDraft(draft) {
  writeJson(RESUME_DRAFT_KEY, draft);
}

export async function ensureActiveResume(draft = {}) {
  try {
    const savedResumeId = getActiveResumeId();

    if (savedResumeId) {
      return savedResumeId;
    }

    const listResponse = await getResumes();
    const resumes = listResponse?.data || listResponse?.resumes || listResponse || [];

    if (Array.isArray(resumes) && resumes.length > 0) {
      const firstResumeId = extractResumeId(resumes[0]);

      if (firstResumeId) {
        setActiveResumeId(firstResumeId);
        return firstResumeId;
      }
    }

    const createResponse = await createResume(buildResumePayload(draft));
    const createdResumeId = extractResumeId(createResponse);

    if (createdResumeId) {
      setActiveResumeId(createdResumeId);
      return createdResumeId;
    }

    return "";
  } catch (error) {
    console.warn("활성 이력서 생성/조회 API 실패. localStorage 상태를 유지합니다.", error);
    return getActiveResumeId();
  }
}


function hasMeaningfulDraftValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value).some(hasMeaningfulDraftValue);
  }
  return String(value || "").trim().length > 0;
}

function mergeFormFieldSafely(apiForm = {}, fallbackForm = {}) {
  const keys = new Set([
    ...Object.keys(fallbackForm || {}),
    ...Object.keys(apiForm || {}),
  ]);

  return Array.from(keys).reduce((merged, key) => {
    const apiValue = apiForm?.[key];
    const fallbackValue = fallbackForm?.[key];

    if (typeof apiValue === "boolean") {
      merged[key] = apiValue || Boolean(fallbackValue);
      return merged;
    }

    merged[key] = hasMeaningfulDraftValue(apiValue) ? apiValue : fallbackValue || "";
    return merged;
  }, {});
}

function mergeDraftSafely(apiDraft = {}, fallbackDraft = {}) {
  const safeForm = mergeFormFieldSafely(apiDraft.form || {}, fallbackDraft.form || {});

  return {
    ...fallbackDraft,
    ...apiDraft,
    form: safeForm,
    techStacks: apiDraft.techStacks?.length ? apiDraft.techStacks : fallbackDraft.techStacks || [],
    experiences: apiDraft.experiences?.length ? apiDraft.experiences : fallbackDraft.experiences || [],
    essays: apiDraft.essays?.length ? apiDraft.essays : fallbackDraft.essays || [],
    certificates: apiDraft.certificates?.length ? apiDraft.certificates : fallbackDraft.certificates || [],
    careers: apiDraft.careers?.length ? apiDraft.careers : fallbackDraft.careers || [],
    files: apiDraft.files?.length ? apiDraft.files : fallbackDraft.files || [],
    github: {
      ...(fallbackDraft.github || {}),
      ...(apiDraft.github || {}),
    },
  };
}

export async function syncResumeDraftFromApi(fallback = {}) {
  try {
    const resumeId = await ensureActiveResume(fallback);

    if (!resumeId) {
      return getResumeDraft(fallback);
    }

    const response = await getResume(resumeId);
    const normalized = normalizeResumeData(response, fallback);
    const localDraft = getResumeDraft(fallback);
    const mergedDraft = mergeDraftSafely(normalized, localDraft);

    saveResumeDraft(mergedDraft);

    return mergedDraft;
  } catch (error) {
    console.warn("이력서 API 조회 실패. localStorage draft를 사용합니다.", error);
    return getResumeDraft(fallback);
  }
}

export async function saveResumeDraftToApi(draft) {
  saveResumeDraft(draft);

  try {
    const resumeId = await ensureActiveResume(draft);
    const payload = buildResumePayload(draft);

    if (!resumeId) {
      return null;
    }

    const response = await updateResume(resumeId, payload);
    const nextResumeId = extractResumeId(response);

    if (nextResumeId) {
      setActiveResumeId(nextResumeId);
    }

    return response;
  } catch (error) {
    console.warn("이력서 API 저장 실패. localStorage 저장만 유지합니다.", error);
    return null;
  }
}

export function getResumeProgress() {
  return Number(readString(RESUME_PROGRESS_KEY, "0")) || 0;
}

export function saveResumeProgress(progress) {
  writeString(RESUME_PROGRESS_KEY, progress);
}

export function getTechStacks() {
  const data = readJson(TECH_STACK_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function getNormalizedTechStacks() {
  return getTechStacks()
    .map((tech) => {
      if (typeof tech === "string") return tech;
      return tech?.name || tech?.label || tech?.value || "";
    })
    .filter(Boolean);
}

export function saveTechStacks(techStacks) {
  writeJson(TECH_STACK_KEY, Array.isArray(techStacks) ? techStacks : []);
}

export async function syncTechStackCatalogFromApi() {
  try {
    const response = await getTechStackCatalog();
    return response?.data || response || [];
  } catch (error) {
    console.warn("기술스택 API 조회 실패. localStorage 값을 사용합니다.", error);
    return getTechStacks();
  }
}

export function getGithubConnection(fallback = {}) {
  return readJson(GITHUB_KEY, fallback);
}

export function saveGithubConnection(data) {
  writeJson(GITHUB_KEY, data);
}

export async function syncGithubConnectionFromApi(fallback = {}) {
  try {
    const response = await getGithubInfo();
    const github = response?.data || response || fallback;

    saveGithubConnection(github);

    return github;
  } catch (error) {
    console.warn("GitHub API 조회 실패. localStorage 값을 사용합니다.", error);
    return getGithubConnection(fallback);
  }
}

export async function saveGithubConnectionToApi(data) {
  saveGithubConnection(data);

  try {
    const response = await saveGithubInfo(data);
    return response;
  } catch (error) {
    console.warn("GitHub API 저장 실패. localStorage 저장만 유지합니다.", error);
    return null;
  }
}

export function isResumeSubmitted() {
  return readString(RESUME_SUBMITTED_KEY, "false") === "true";
}

export function markResumeSubmitted() {
  writeString(RESUME_SUBMITTED_KEY, "true");
  writeString(RESUME_SUBMITTED_AT_KEY, new Date().toISOString());
}

export async function submitResumeToApi() {
  markResumeSubmitted();

  try {
    const resumeId = getActiveResumeId();

    if (!resumeId) {
      return null;
    }

    const response = await submitResume(resumeId);
    return response;
  } catch (error) {
    console.warn("이력서 최종 제출 API 실패. localStorage 제출 상태만 유지합니다.", error);
    return null;
  }
}

export function markResumeContinue() {
  writeString(RESUME_CONTINUE_KEY, "true");
}