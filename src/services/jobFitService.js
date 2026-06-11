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

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result.map((item) => item.trim());
}

function parseCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const headers = splitCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);

    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function tokenize(value) {
  return safeText(value)
    .toLowerCase()
    .replace(/[()[\]{}]/g, " ")
    .split(/[,/|·\s]+/)
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
  const sourceTokens = tokenize(sourceText);
  const normalizedUserTechs = userTechs.map((tech) => tech.toLowerCase());

  return normalizedUserTechs.filter((tech) =>
    sourceTokens.some(
      (token) =>
        token.includes(tech) ||
        tech.includes(token) ||
        sourceText.toLowerCase().includes(tech)
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
  ].filter((keyword) => text.includes(keyword)).length * 4;

  return Math.min(95, base + lengthBonus + keywordBonus);
}

function calculateTechScore(job, userTechs) {
  if (!userTechs.length) return 45;

  const matchCount = countMatches(job.tech_stacks, userTechs);
  const total = Math.max(userTechs.length, 1);

  return Math.min(98, 50 + Math.round((matchCount / total) * 45));
}

function calculateCareerScore(job) {
  const careerLevel = safeText(job.career_level);

  if (!careerLevel) return 65;
  if (careerLevel.includes("신입")) return 88;
  if (careerLevel.includes("주니어")) return 82;
  if (careerLevel.includes("경력무관")) return 78;
  if (careerLevel.includes("1년") || careerLevel.includes("2년")) return 74;
  if (careerLevel.includes("3년")) return 64;

  return 58;
}

function buildRadarData(job, userTechs) {
  const techScore = calculateTechScore(job, userTechs);
  const careerScore = calculateCareerScore(job);
  const responsibilityScore = calculateTextRichnessScore(job.responsibilities, 52);
  const preferenceScore = calculateTextRichnessScore(job.preferences, 48);
  const cultureScore = calculateTextRichnessScore(job.team_culture, 50);

  return [
    { subject: RADAR_AXES[0], score: techScore, fullMark: 100 },
    { subject: RADAR_AXES[1], score: careerScore, fullMark: 100 },
    { subject: RADAR_AXES[2], score: responsibilityScore, fullMark: 100 },
    { subject: RADAR_AXES[3], score: preferenceScore, fullMark: 100 },
    { subject: RADAR_AXES[4], score: cultureScore, fullMark: 100 },
  ];
}

function calculateOverallMatch(radarData) {
  const total = radarData.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / radarData.length);
}

function normalizeJob(row, index, userTechs) {
  const radarData = buildRadarData(row, userTechs);
  const overallMatch = calculateOverallMatch(radarData);

  return {
    id: row.job_id || `${row.company_name}-${row.job_title}-${index}`,
    companyName: row.company_name || "기업명 미상",
    jobTitle: row.job_title || "직무명 미상",
    careerLevel: row.career_level || "경력 조건 미상",
    techStacks: row.tech_stacks || "",
    requirements: row.requirements || "",
    preferences: row.preferences || "",
    responsibilities: row.responsibilities || "",
    teamCulture: row.team_culture || "",
    benefits: row.benefits || "",
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
    .sort((a, b) => b.overallMatch - a.overallMatch);
}

export function getDefaultRadarData() {
  return RADAR_AXES.map((axis) => ({
    subject: axis,
    score: 50,
    fullMark: 100,
  }));
}