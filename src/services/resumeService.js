import { readJson, writeJson, readString, writeString } from "./careerDataService.js";

export const RESUME_DRAFT_KEY = "articlue_resume_draft";
export const RESUME_PROGRESS_KEY = "articlue_resume_progress";
export const TECH_STACK_KEY = "articlue-resume-techs";
export const GITHUB_KEY = "articlue_github_connection";

export function getResumeDraft(fallback = {}) {
  return readJson(RESUME_DRAFT_KEY, fallback);
}

export function saveResumeDraft(draft) {
  writeJson(RESUME_DRAFT_KEY, draft);
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

export function saveTechStacks(techStacks) {
  writeJson(TECH_STACK_KEY, Array.isArray(techStacks) ? techStacks : []);
}

export function getGithubConnection(fallback = {}) {
  return readJson(GITHUB_KEY, fallback);
}

export function saveGithubConnection(data) {
  writeJson(GITHUB_KEY, data);
}

export function markResumeSubmitted() {
  writeString("articlue_resume_submitted", "true");
  writeString("articlue_resume_submitted_at", new Date().toISOString());
}

export function markResumeContinue() {
  writeString("articlue_resume_continue", "true");
}