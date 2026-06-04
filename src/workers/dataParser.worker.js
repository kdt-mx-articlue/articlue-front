const PARSER_VERSION = "1.1.0";

const STOP_WORDS = new Set([
  "그리고",
  "또한",
  "하지만",
  "그래서",
  "저는",
  "제가",
  "하는",
  "하고",
  "하여",
  "하며",
  "에서",
  "으로",
  "에게",
  "까지",
  "부터",
  "입니다",
  "습니다",
  "있습니다",
  "했습니다",
  "됩니다",
  "대한",
  "통해",
  "위해",
  "기반",
  "관련",
  "경험",
  "학교",
  "다니는",
  "고등어가",
  "dlfurtj",
]);

const TECH_KEYWORDS = new Set([
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "vue",
  "next",
  "node",
  "express",
  "nest",
  "python",
  "java",
  "spring",
  "springboot",
  "fastapi",
  "django",
  "flask",
  "mysql",
  "postgresql",
  "mongodb",
  "redis",
  "oracle",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "github",
  "git",
  "figma",
  "jira",
  "notion",
  "tailwind",
  "typescript",
]);

function safeText(value) {
  return String(value || "").trim();
}

function normalizeText(value) {
  return safeText(value)
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function normalizeKeyword(word) {
  return safeText(word)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.]/gu, "")
    .replace(/\.js$/g, "")
    .replace(/^nodejs$/g, "node")
    .replace(/^vuejs$/g, "vue")
    .replace(/^nextjs$/g, "next")
    .replace(/^nestjs$/g, "nest")
    .replace(/^springboot$/g, "springboot")
    .replace(/^tailwindcss$/g, "tailwind");
}

function isMeaningfulKeyword(keyword) {
  if (!keyword) return false;
  if (STOP_WORDS.has(keyword)) return false;
  if (/^\d+$/.test(keyword)) return false;
  if (keyword.length < 2) return false;

  const isEnglish = /^[a-z0-9+#.]+$/i.test(keyword);
  const isKorean = /^[가-힣]+$/.test(keyword);

  if (isEnglish && keyword.length < 3 && !["go", "r", "c#"].includes(keyword)) {
    return false;
  }

  if (isKorean && keyword.length < 3) {
    return false;
  }

  return true;
}

function getKeywordScore(keyword, count) {
  const techBonus = TECH_KEYWORDS.has(keyword) ? 100 : 0;
  const lengthBonus = Math.min(keyword.length, 12);
  return techBonus + count * 10 + lengthBonus;
}

function extractKeywords(text, limit = 20) {
  const normalized = normalizeText(text);

  const words = normalized
    .split(/[\s,.;:!?()[\]{}"'`~|\\/]+/)
    .map(normalizeKeyword)
    .filter(isMeaningfulKeyword);

  const frequencyMap = new Map();

  words.forEach((word) => {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  });

  return Array.from(frequencyMap.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      score: getKeywordScore(keyword, count),
      type: TECH_KEYWORDS.has(keyword) ? "tech" : "general",
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ keyword, count, type }) => ({
      keyword,
      count,
      type,
    }));
}

function parseResumeDraft(payload) {
  const form = payload?.form || {};
  const techStacks = Array.isArray(payload?.techStacks) ? payload.techStacks : [];
  const experiences = Array.isArray(payload?.experiences) ? payload.experiences : [];
  const essays = Array.isArray(payload?.essays) ? payload.essays : [];
  const certificates = Array.isArray(payload?.certificates) ? payload.certificates : [];
  const careers = Array.isArray(payload?.careers) ? payload.careers : [];
  const files = Array.isArray(payload?.files) ? payload.files : [];

  const combinedText = normalizeText(
    [
      form.title,
      form.preferredArea,
      form.highSchool,
      form.university,
      form.major,
      form.graduateSchool,
      form.graduateMajor,
      ...techStacks,
      ...experiences.map((item) => item?.title),
      ...essays.flatMap((item) => [item?.title, item?.body]),
      ...certificates.flatMap((item) => [
        item?.type,
        item?.name,
        item?.organization,
      ]),
      ...careers.flatMap((item) => [
        item?.company,
        item?.department,
        item?.position,
        item?.result,
      ]),
      ...files.map((file) => file?.name),
    ]
      .filter(Boolean)
      .join("\n")
  );

  return {
    type: "resume",
    version: PARSER_VERSION,
    summary: {
      title: safeText(form.title),
      name: safeText(form.name),
      email: safeText(form.email),
      techStackCount: techStacks.length,
      experienceCount: experiences.filter((item) => safeText(item?.title)).length,
      essayCount: essays.filter(
        (item) => safeText(item?.title) || safeText(item?.body)
      ).length,
      certificateCount: certificates.filter((item) => safeText(item?.name)).length,
      careerCount: careers.filter(
        (item) => safeText(item?.company) || safeText(item?.result)
      ).length,
      fileCount: files.length,
    },
    keywords: extractKeywords(combinedText),
    normalizedText: combinedText,
    parsedAt: new Date().toISOString(),
  };
}

function parseCoverLetters(payload) {
  const entries =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? Object.entries(payload)
      : [];

  const combinedText = normalizeText(
    entries
      .flatMap(([companyId, content]) => [
        companyId,
        content?.지원동기,
        content?.프로젝트경험,
        content?.motivation,
        content?.project,
      ])
      .filter(Boolean)
      .join("\n")
  );

  return {
    type: "coverLetters",
    version: PARSER_VERSION,
    summary: {
      count: entries.length,
      companies: entries.map(([companyId]) => companyId),
    },
    keywords: extractKeywords(combinedText),
    normalizedText: combinedText,
    parsedAt: new Date().toISOString(),
  };
}

function parseInterviewResults(payload) {
  const results = Array.isArray(payload) ? payload : [];

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, item) => sum + Number(item?.score || 0), 0) /
            results.length
        )
      : 0;

  const combinedText = normalizeText(
    results
      .flatMap((item) => [
        item?.company,
        item?.role,
        item?.portfolio,
        item?.difficulty,
        item?.persona,
      ])
      .filter(Boolean)
      .join("\n")
  );

  return {
    type: "interviewResults",
    version: PARSER_VERSION,
    summary: {
      count: results.length,
      averageScore,
      latestCompany: safeText(results[0]?.company),
      latestRole: safeText(results[0]?.role),
    },
    keywords: extractKeywords(combinedText),
    normalizedText: combinedText,
    parsedAt: new Date().toISOString(),
  };
}

function parseFavoriteJobs(payload) {
  const jobs = Array.isArray(payload) ? payload : [];

  const combinedText = normalizeText(
    jobs
      .flatMap((job) => [
        job?.company,
        job?.role,
        job?.desc,
        job?.reason,
        ...(Array.isArray(job?.stacks) ? job.stacks : []),
        ...(Array.isArray(job?.tags) ? job.tags : []),
      ])
      .filter(Boolean)
      .join("\n")
  );

  return {
    type: "favoriteJobs",
    version: PARSER_VERSION,
    summary: {
      count: jobs.length,
      companies: jobs.map((job) => safeText(job?.company)).filter(Boolean),
    },
    keywords: extractKeywords(combinedText),
    normalizedText: combinedText,
    parsedAt: new Date().toISOString(),
  };
}

function parsePayload({ parserType, payload }) {
  switch (parserType) {
    case "resume":
      return parseResumeDraft(payload);
    case "coverLetters":
      return parseCoverLetters(payload);
    case "interviewResults":
      return parseInterviewResults(payload);
    case "favoriteJobs":
      return parseFavoriteJobs(payload);
    default:
      return {
        type: "unknown",
        version: PARSER_VERSION,
        summary: {},
        keywords: [],
        normalizedText: "",
        parsedAt: new Date().toISOString(),
      };
  }
}

self.onmessage = (event) => {
  const { requestId, parserType, payload } = event.data || {};

  try {
    const result = parsePayload({ parserType, payload });

    self.postMessage({
      requestId,
      ok: true,
      result,
    });
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown parser error",
    });
  }
};