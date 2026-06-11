const DATASET_PATH = "/data/articlue_job_postings_dataset.csv";

const RADAR_AXES = [
  "기술스택 적합도",
  "경력조건 적합도",
  "주요업무 적합도",
  "우대사항 적합도",
  "조직문화 적합도",
];

function safeText(value) {
  return String(value || "").trim();
}

function normalizeHeader(value) {
  return safeText(value).replace(/^\uFEFF/, "").trim();
}

function parseCsvRecords(csvText) {
  const records = [];
  let record = [];
  let field = "";
  let insideQuotes = false;

  const text = String(csvText || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      record.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      record.push(field);

      if (record.some((item) => safeText(item))) {
        records.push(record);
      }

      record = [];
      field = "";
      continue;
    }

    field += char;
  }

  record.push(field);

  if (record.some((item) => safeText(item))) {
    records.push(record);
  }

  return records;
}

function parseCsv(csvText) {
  const records = parseCsvRecords(csvText);

  if (records.length <= 1) return [];

  const headers = records[0].map(normalizeHeader);

  return records.slice(1).map((values) => {
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function pick(row, keys, fallback = "") {
  for (const key of keys) {
    if (safeText(row[key])) return row[key];
  }

  return fallback;
}

function tokenize(value) {
  return safeText(value)
    .toLowerCase()
    .replace(/[()[\]{}]/g, " ")
    .split(/[,/|·\s\n\r]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function getUserTechStacks() {
  try {
    const raw = window.localStorage.getItem("articlue-resume-techs");
    const parsed = JSON.parse(raw || "[]");

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((tech) => {
        if (typeof tech === "string") return tech;
        return tech?.name || tech?.label || tech?.value || "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function countMatches(sourceText, userTechs) {
  const text = safeText(sourceText).toLowerCase();
  const sourceTokens = tokenize(sourceText);
  const normalizedUserTechs = userTechs.map((tech) => tech.toLowerCase());

  return normalizedUserTechs.filter((tech) =>
    sourceTokens.some(
      (token) =>
        token.includes(tech) ||
        tech.includes(token) ||
        text.includes(tech)
    )
  ).length;
}

function calculateTextRichnessScore(value, base = 45) {
  const text = safeText(value);

  if (!text) return base;

  const lengthBonus = Math.min(30, Math.round(text.length / 25));
  const keywordBonus = [
    "경험",
    "협업",
    "운영",
    "설계",
    "개발",
    "개선",
    "분석",
    "배포",
    "성능",
    "자동화",
    "API",
    "DB",
    "데이터",
    "서비스",
  ].filter((keyword) => text.includes(keyword)).length * 4;

  return Math.min(95, base + lengthBonus + keywordBonus);
}

function calculateTechScore(job, userTechs) {
  if (!userTechs.length) return 45;

  const targetText = [
    job.techStacks,
    job.requirements,
    job.responsibilities,
    job.preferences,
  ].join(" ");

  const matchCount = countMatches(targetText, userTechs);
  const total = Math.max(userTechs.length, 1);

  return Math.min(98, 50 + Math.round((matchCount / total) * 45));
}

function calculateCareerScore(job) {
  const careerLevel = safeText(job.careerLevel);

  if (!careerLevel) return 65;
  if (careerLevel.includes("신입")) return 88;
  if (careerLevel.includes("주니어")) return 82;
  if (careerLevel.includes("경력무관")) return 78;
  if (careerLevel.includes("1년") || careerLevel.includes("2년")) return 74;
  if (careerLevel.includes("3년")) return 64;
  if (careerLevel.includes("4년") || careerLevel.includes("5년")) return 56;

  return 60;
}

function buildRadarData(job, userTechs) {
  const techScore = calculateTechScore(job, userTechs);
  const careerScore = calculateCareerScore(job);
  const responsibilityScore = calculateTextRichnessScore(job.responsibilities, 52);
  const preferenceScore = calculateTextRichnessScore(job.preferences, 48);
  const cultureScore = calculateTextRichnessScore(job.teamCulture, 50);

  return [
    { subject: RADAR_AXES[0], score: techScore, fullMark: 100 },
    { subject: RADAR_AXES[1], score: careerScore, fullMark: 100 },
    { subject: RADAR_AXES[2], score: responsibilityScore, fullMark: 100 },
    { subject: RADAR_AXES[3], score: preferenceScore, fullMark: 100 },
    { subject: RADAR_AXES[4], score: cultureScore, fullMark: 100 },
  ];
}

function calculateOverallMatch(radarData) {
  if (!Array.isArray(radarData) || radarData.length === 0) return 0;

  const total = radarData.reduce((sum, item) => sum + Number(item.score || 0), 0);
  return Math.round(total / radarData.length);
}

function normalizeJob(row, index, userTechs) {
  const companyName = pick(row, ["company_name", "company", "기업명"], "기업명 미상");
  const jobTitle = pick(row, ["job_title", "title", "직무명", "공고명"], "직무명 미상");
  const careerLevel = pick(row, ["career_level", "career", "경력", "경력조건"], "경력 조건 미상");
  const techStacks = pick(row, ["tech_stacks", "tech_stack", "skills", "기술스택"], "");
  const requirements = pick(row, ["requirements", "requirement", "자격요건"], "");
  const preferences = pick(row, ["preferences", "preferred", "우대사항"], "");
  const responsibilities = pick(row, ["responsibilities", "main_tasks", "주요업무", "담당업무"], "");
  const teamCulture = pick(row, ["team_culture", "culture", "조직문화"], "");
  const benefits = pick(row, ["benefits", "welfare", "복지"], "");
  const applyUrl = pick(row, ["apply_url", "url", "지원링크"], "");

  const normalized = {
    id: pick(row, ["job_id", "id"], `${companyName}-${jobTitle}-${index}`),
    companyName,
    jobTitle,
    careerLevel,
    techStacks,
    requirements,
    preferences,
    responsibilities,
    teamCulture,
    benefits,
    applyUrl,
  };

  const radarData = buildRadarData(normalized, userTechs);
  const overallMatch = calculateOverallMatch(radarData);

  return {
    ...normalized,
    overallMatch,
    radarData,
  };
}

export async function getJobFitRadarDataset() {
  const response = await fetch(DATASET_PATH);

  if (!response.ok) {
    throw new Error("공고 데이터 CSV를 불러오지 못했습니다.");
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);
  const userTechs = getUserTechStacks();

  return rows
    .map((row, index) => normalizeJob(row, index, userTechs))
    .filter((job) => job.companyName !== "기업명 미상")
    .sort((a, b) => b.overallMatch - a.overallMatch);
}

export function getDefaultRadarData() {
  return RADAR_AXES.map((axis) => ({
    subject: axis,
    score: 50,
    fullMark: 100,
  }));
}