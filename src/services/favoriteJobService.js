import { readJson, writeJson, clamp } from "./careerDataService.js";

export const FAVORITE_KEY = "articlue_favorite_jobs";

export const FAVORITE_KEYS = [
  "articlue_favorite_jobs",
  "favoriteJobs",
  "likedJobs",
  "articlueLikedJobs",
];

export function normalizeFavoriteJobs(jobs) {
  if (!Array.isArray(jobs)) return [];

  return jobs.map((job, index) => ({
    id: job.id || job.company || `job-${index}`,
    company: job.company || job.name || "기업명 없음",
    role: job.role || job.position || "직무 정보 없음",
    match: job.match || `${clamp(job.score || job.matchRate || 80)}%`,
    desc:
      job.desc ||
      job.description ||
      "찜한 기업 공고를 기반으로 지원 전략을 이어갈 수 있습니다.",
    stacks: Array.isArray(job.stacks)
      ? job.stacks
      : Array.isArray(job.tags)
      ? job.tags
      : ["Java", "Spring Boot"],
    tags: Array.isArray(job.tags)
      ? job.tags
      : Array.isArray(job.stacks)
      ? job.stacks
      : ["Java", "Spring Boot"],
    savedAt: job.savedAt || null,
  }));
}

export function getFavoriteJobs() {
  for (const key of FAVORITE_KEYS) {
    const data = readJson(key, []);
    if (Array.isArray(data) && data.length > 0) {
      return normalizeFavoriteJobs(data);
    }
  }

  return [];
}

export function saveFavoriteJobs(jobs) {
  writeJson(FAVORITE_KEY, normalizeFavoriteJobs(jobs));
}

export function toggleFavoriteJob(company) {
  const saved = getFavoriteJobs();
  const exists = saved.some((job) => job.id === company.id);

  const next = exists
    ? saved.filter((job) => job.id !== company.id)
    : [
        ...saved,
        {
          id: company.id,
          reason: company.favorite?.reason || "",
          company: company.company,
          role: company.role,
          match: company.score,
          desc: company.favorite?.desc || "",
          stacks: company.favorite?.stacks || company.stacks || [],
          tags: company.favorite?.stacks || company.stacks || [],
          savedAt: new Date().toISOString(),
        },
      ];

  saveFavoriteJobs(next);

  return {
    next,
    exists,
  };
}