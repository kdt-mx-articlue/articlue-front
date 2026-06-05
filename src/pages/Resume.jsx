import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import { notifyCareerScoreChanged } from "../utils/careerScore.js";
import {
  getGithubConnection,
  getResumeDraft,
  getTechStacks as getSavedTechStacks,
  markResumeContinue,
  markResumeSubmitted,
  saveGithubConnection as saveGithubConnectionToService,
  saveResumeDraft,
  saveResumeProgress,
  saveTechStacks,
} from "../services/resumeService.js";
import {
  getUserProfile,
  saveUserProfile,
  USER_PROFILE_KEY,
} from "../services/profileService.js";

const programmingLanguages = [
  "Python", "JavaScript", "TypeScript", "Java", "Kotlin", "Swift", "Dart",
  "C#", "C++", "Go", "PHP", "Ruby", "Rust", "Scala", "R", "HTML/CSS",
];

const languageFrameworkMap = {
  Python: ["FastAPI", "Django", "Flask", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "Numpy", "LangChain"],
  JavaScript: ["React", "Vue.js", "Next.js", "Svelte", "Node.js", "Express", "NestJS"],
  TypeScript: ["React", "Next.js", "Node.js", "NestJS", "Express", "Prisma"],
  Java: ["Spring", "Spring Boot", "JPA", "MyBatis", "Gradle", "Maven"],
  Kotlin: ["Spring Boot", "Android", "Ktor", "Coroutine", "Jetpack Compose"],
  Swift: ["iOS", "SwiftUI", "UIKit", "Combine", "CoreData"],
  Dart: ["Flutter", "Firebase", "Riverpod", "Bloc"],
  "C#": [".NET", "ASP.NET", "Unity", "Entity Framework"],
  "C++": ["STL", "Qt", "Unreal Engine", "OpenCV"],
  Go: ["Gin", "Echo", "Fiber", "GORM", "gRPC"],
  PHP: ["Laravel", "Symfony", "CodeIgniter", "Composer"],
  Ruby: ["Ruby on Rails", "Sinatra", "RSpec"],
  Rust: ["Actix", "Rocket", "Tokio", "Axum"],
  Scala: ["Akka", "Play Framework", "Spark"],
  R: ["Tidyverse", "Shiny", "ggplot2", "dplyr"],
  "HTML/CSS": ["React", "Vue.js", "TailwindCSS", "Sass", "Bootstrap", "Styled Components"],
};

const commonTechGroups = [
  { label: "Database", items: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "MariaDB", "Elasticsearch"] },
  { label: "DevOps & Cloud", items: ["AWS", "Docker", "Kubernetes", "GCP", "Azure", "GitHub Actions", "Jenkins", "Terraform"] },
  { label: "Tools & Collaboration", items: ["Git", "GitHub", "Jira", "Figma", "Slack", "Notion"] },
];

const allSelectableTechs = new Set([
  ...programmingLanguages,
  ...Object.values(languageFrameworkMap).flat(),
  ...commonTechGroups.flatMap((group) => group.items),
]);

function sanitizeTechStacks(techs) {
  if (!Array.isArray(techs)) return [];

  return techs
    .map((tech) => {
      if (typeof tech === "string") return tech;
      return tech?.name || tech?.label || tech?.value || "";
    })
    .filter((tech, index, array) => {
      if (!tech) return false;
      if (!allSelectableTechs.has(tech)) return false;
      return array.indexOf(tech) === index;
    });
}

const initialForm = {
  title: "",
  name: "",
  phone: "",
  email: "",
  birth: "",
  region: "",
  postcode: "",
  baseAddress: "",
  detailAddress: "",
  gender: "",
  military: "",
  preferredArea: "",
  highSchool: "",
  university: "",
  major: "",
  grade: "",
  gradeScale: "",
  hasGraduate: false,
  graduateSchool: "",
  graduateMajor: "",
};

const initialExperience = {
  title: "",
  isOngoing: false,
  startDate: "",
  endDate: "",
};

const initialEssays = [
  {
    title: "",
    body: "",
    label: "문항 1. 지원 동기",
    titlePlaceholder: "예: 기술을 비즈니스 가치로 연결하는 개발자",
    bodyPlaceholder: "지원 동기를 작성하세요.",
  },
  {
    title: "",
    body: "",
    label: "문항 2. 프로젝트 경험",
    titlePlaceholder: "예: Redis 캐싱으로 응답 속도를 개선한 경험",
    bodyPlaceholder: "프로젝트 경험을 작성하세요.",
  },
  {
    title: "",
    body: "",
    label: "문항 3. 입사 후 성장 목표",
    titlePlaceholder: "예: 서비스 안정성을 고민하는 백엔드 개발자",
    bodyPlaceholder: "입사 후 성장 목표를 작성하세요.",
  },
];

const initialCertificate = {
  type: "국가",
  name: "",
  date: "",
  organization: "",
};

const initialCareer = {
  company: "",
  department: "",
  position: "",
  startDate: "",
  endDate: "",
  isWorking: false,
  expectedLeaveDate: "",
  availableDate: "",
  result: "",
};

const initialGithub = {
  username: "",
  profileUrl: "",
  repoUrl: "",
  connected: false,
};

const PROGRESS_WEIGHTS = {
  basic: 20,
  techStack: 20,
  education: 15,
  experience: 15,
  essay: 15,
  portfolio: 10,
  github: 5,
};

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function getSectionRatio(values) {
  if (!values.length) return 0;

  const completed = values.filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return hasText(value);
  }).length;

  return completed / values.length;
}

function getProfileFormFields() {
  const profile = getUserProfile();

  return {
    name: profile?.name || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    birth: profile?.birth || "",
    region: profile?.address || "",
    postcode: profile?.postcode || "",
    baseAddress: profile?.baseAddress || profile?.address || "",
    detailAddress: profile?.detailAddress || "",
    gender: profile?.gender || "",
    military: profile?.military || "",
  };
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-[13px] font-black text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({ id, title, description, action, children }) {
  return (
    <section
      id={id}
      className="mb-5 scroll-mt-[96px] rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-[18px] flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-[14px] leading-[1.6] text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function TechStackBlock({ selectedTechs, onChange }) {
  const cleanSelectedTechs = sanitizeTechStacks(selectedTechs);

  const selectedLanguages = programmingLanguages.filter((language) =>
    cleanSelectedTechs.includes(language)
  );

  const toggleTech = (tech) => {
    const exists = cleanSelectedTechs.includes(tech);

    if (programmingLanguages.includes(tech)) {
      if (exists) {
        const relatedStacks = languageFrameworkMap[tech] || [];

        const nextTechs = cleanSelectedTechs.filter(
          (item) => item !== tech && !relatedStacks.includes(item)
        );

        onChange(nextTechs);
        return;
      }

      onChange([...cleanSelectedTechs, tech]);
      return;
    }

    const nextTechs = exists
      ? cleanSelectedTechs.filter((item) => item !== tech)
      : [...cleanSelectedTechs, tech];

    onChange(nextTechs);
  };

  const renderTechButton = (tech) => {
    const active = cleanSelectedTechs.includes(tech);

    return (
      <button
        key={tech}
        type="button"
        onClick={() => toggleTech(tech)}
        className={`rounded-full border px-[17px] py-[10px] text-[14px] font-bold transition ${
          active
            ? "border-blue-600 bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]"
            : "border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40"
        }`}
      >
        {tech}
      </button>
    );
  };

  return (
    <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
      <div className="mb-6">
        <h3 className="mb-2 text-[15px] font-black text-slate-900 dark:text-white">
          사용 가능한 프로그래밍 언어
        </h3>

        <p className="mb-3 break-keep text-[14px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
          주력으로 사용하는 언어를 먼저 선택해주세요. 선택한 언어에 맞는 기술
          스택이 아래에 표시됩니다.
        </p>

        <div className="flex flex-wrap gap-2">
          {programmingLanguages.map(renderTechButton)}
        </div>
      </div>

      {selectedLanguages.length === 0 && (
        <div className="mb-6 rounded-[20px] border border-dashed border-blue-200 bg-blue-50/80 px-5 py-5 text-[14px] font-bold leading-[1.7] text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
          사용 언어를 선택하면 해당 언어 기반의 프레임워크 및 라이브러리가
          아래에 자동으로 표시됩니다.
        </div>
      )}

      {selectedLanguages.length > 0 && (
        <div className="mb-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 className="mb-3 text-[15px] font-black text-slate-900 dark:text-white">
            관련 프레임워크 및 라이브러리
          </h3>

          <div className="flex flex-col gap-5">
            {selectedLanguages.map((language) => (
              <div key={language}>
                <div className="mb-2 text-[14px] font-black text-slate-900 dark:text-white">
                  [{language}] 관련 스택
                </div>

                <div className="flex flex-wrap gap-2">
                  {(languageFrameworkMap[language] || []).map(renderTechButton)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 text-[15px] font-black text-slate-900 dark:text-white">
          데이터베이스 및 공통 기술 (DevOps, Tools 등)
        </h3>

        {commonTechGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            <div className="mb-2 text-[14px] font-black text-slate-900 dark:text-white">
              {group.label}
            </div>

            <div className="flex flex-wrap gap-2">
              {group.items.map(renderTechButton)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[18px] border border-blue-100 bg-blue-50 px-4 py-[14px] text-[13px] font-extrabold leading-[1.6] text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
        선택된 기술 스택 {cleanSelectedTechs.length}개
        {cleanSelectedTechs.length > 0 && (
          <span className="ml-1 font-bold">
            · {cleanSelectedTechs.slice(0, 8).join(", ")}
            {cleanSelectedTechs.length > 8 ? " 외" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function Modal({ open, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/45 px-5 backdrop-blur-sm">
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-[14px] py-[13px] text-[14px] font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950 dark:disabled:bg-slate-900 dark:disabled:text-slate-500";

const textareaClass =
  "min-h-[130px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-[14px] py-[13px] text-[14px] font-bold leading-7 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-[18px] py-[11px] text-[14px] font-black text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-blue-600 px-[18px] py-[11px] text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700";

const outlineButtonClass =
  "inline-flex items-center justify-center rounded-full border border-blue-600 bg-transparent px-[18px] py-[11px] text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5 dark:text-blue-300";

export default function Resume() {
  const navigate = useNavigate();
  const savedDraft = getResumeDraft(null);
  const savedProfileFields = getProfileFormFields();
  const savedGithub = getGithubConnection(initialGithub);
  const savedTechs = sanitizeTechStacks(getSavedTechStacks());

  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(savedDraft?.form || {}),
    ...savedProfileFields,
  }));

  const [techStacks, setTechStacks] = useState(() => {
    const draftTechs = sanitizeTechStacks(savedDraft?.techStacks || []);
    return draftTechs.length ? draftTechs : savedTechs;
  });

  const [experiences, setExperiences] = useState(() =>
    savedDraft?.experiences?.length ? savedDraft.experiences : [initialExperience]
  );

  const [essays, setEssays] = useState(() =>
    savedDraft?.essays?.length ? savedDraft.essays : initialEssays
  );

  const [certificates, setCertificates] = useState(() =>
    savedDraft?.certificates?.length ? savedDraft.certificates : [initialCertificate]
  );

  const [careers, setCareers] = useState(() =>
    savedDraft?.careers?.length ? savedDraft.careers : [initialCareer]
  );

  const [files, setFiles] = useState(() => savedDraft?.files || []);

  const [github, setGithub] = useState(() => ({
    ...initialGithub,
    ...savedGithub,
    ...(savedDraft?.github || {}),
  }));

  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [githubDraft, setGithubDraft] = useState(() => ({
    ...initialGithub,
    ...savedGithub,
    ...(savedDraft?.github || {}),
  }));

  const [toast, setToast] = useState("");
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [missingItems, setMissingItems] = useState([]);
  const [userProfile, setUserProfile] = useState(() => getUserProfile());

  const syncProfileFields = () => {
    const nextProfile = getUserProfile();
    const nextProfileFields = getProfileFormFields();

    setUserProfile(nextProfile || {});

    setForm((prev) => ({
      ...prev,
      ...nextProfileFields,
    }));

    if (nextProfileFields.name.trim()) {
      saveUserProfile({
        ...nextProfile,
        name: nextProfileFields.name.trim(),
      });
    }
  };

  useEffect(() => {
    syncProfileFields();

    const handleFocus = () => syncProfileFields();
    const handleStorage = (event) => {
      if (event.key === USER_PROFILE_KEY) syncProfileFields();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);


  const progress = useMemo(() => {
    const basicRatio = getSectionRatio([
      form.title,
      form.name,
      form.phone,
      form.email,
      form.birth,
      form.region,
      form.gender,
      form.military,
      form.preferredArea,
    ]);

    const techStackRatio = techStacks.length > 0 ? 1 : 0;

    const educationValues = [
      form.highSchool,
      form.university,
      form.major,
      form.grade,
      form.gradeScale,
    ];

    if (form.hasGraduate) {
      educationValues.push(form.graduateSchool, form.graduateMajor);
    }

    const educationRatio = getSectionRatio(educationValues);

    const hasProjectExperience = experiences.some(
      (item) =>
        hasText(item.title) &&
        hasText(item.startDate) &&
        (item.isOngoing || hasText(item.endDate))
    );

    const hasCertificate = certificates.some((item) => hasText(item.name));

    const hasCareerResult = careers.some(
      (item) => hasText(item.company) || hasText(item.result)
    );

    const experienceRatio = getSectionRatio([
      hasProjectExperience,
      hasCertificate,
      hasCareerResult,
    ]);

    const essayRatio = essays.some(
      (item) => hasText(item.title) && hasText(item.body)
    )
      ? 1
      : 0;

    const portfolioRatio = files.length > 0 ? 1 : 0;
    const githubRatio = github.connected ? 1 : 0;

    const weightedScore =
      basicRatio * PROGRESS_WEIGHTS.basic +
      techStackRatio * PROGRESS_WEIGHTS.techStack +
      educationRatio * PROGRESS_WEIGHTS.education +
      experienceRatio * PROGRESS_WEIGHTS.experience +
      essayRatio * PROGRESS_WEIGHTS.essay +
      portfolioRatio * PROGRESS_WEIGHTS.portfolio +
      githubRatio * PROGRESS_WEIGHTS.github;

    return Math.min(100, Math.round(weightedScore));
  }, [
    form,
    techStacks,
    experiences,
    essays,
    certificates,
    careers,
    files,
    github.connected,
  ]);

  useEffect(() => {
    saveResumeProgress(progress);
    notifyCareerScoreChanged();
  }, [progress]);

  useEffect(() => {
    const draft = {
      form,
      techStacks,
      experiences,
      essays,
      certificates,
      careers,
      files,
      github,
      updatedAt: new Date().toISOString(),
    };

    saveResumeDraft(draft);

    const cleanTechStacks = sanitizeTechStacks(techStacks);

    if (cleanTechStacks.length !== techStacks.length) {
      setTechStacks(cleanTechStacks);
      return;
    }

    saveTechStacks(cleanTechStacks);
    notifyCareerScoreChanged();
  }, [form, techStacks, experiences, essays, certificates, careers, files, github]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  };

  const updateForm = (key, value) => {
    const readOnlyProfileKeys = [
      "name",
      "phone",
      "email",
      "birth",
      "region",
      "postcode",
      "baseAddress",
      "detailAddress",
      "gender",
      "military",
    ];

    if (readOnlyProfileKeys.includes(key)) {
      showToast("기본 인적사항은 마이페이지에서 수정할 수 있습니다.");
      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateArray = (setter, index, key, value) => {
    setter((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [...prev, { ...initialExperience }]);
    showToast("경험 카드가 추가되었습니다.");
  };

  const addEssay = () => {
    setEssays((prev) => [
      ...prev,
      {
        title: "",
        body: "",
        label: `문항 ${prev.length + 1}`,
        titlePlaceholder: "소제목 입력",
        bodyPlaceholder: "자소서 초안을 입력하세요.",
      },
    ]);
    showToast("자소서 문항이 추가되었습니다.");
  };

  const addCertificate = () => {
    setCertificates((prev) => [...prev, { ...initialCertificate }]);
    showToast("자격증 카드가 추가되었습니다.");
  };

  const addCareer = () => {
    setCareers((prev) => [...prev, { ...initialCareer }]);
    showToast("경력 카드가 추가되었습니다.");
  };

  const removeItem = (setter, index) => {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
    showToast("카드가 삭제되었습니다.");
  };

  const normalizeFiles = (fileList) => {
    const selected = Array.from(fileList || []);

    const validFiles = selected.filter((file) => {
      const isValidType =
        file.type === "application/pdf" || file.type === "text/plain";
      const isValidSize = file.size <= 50 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selected.length) {
      showToast(".pdf, .txt 파일만 업로드할 수 있으며 파일당 최대 50MB입니다.");
    }

    return validFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
  };

  const handleFileChange = (event) => {
    const newFiles = normalizeFiles(event.target.files);

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      showToast("포트폴리오 파일이 추가되었습니다.");
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFiles = normalizeFiles(event.dataTransfer.files);

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      showToast("포트폴리오 파일이 추가되었습니다.");
    }
  };

  const saveGithubConnection = () => {
    if (!githubDraft.username.trim() && !githubDraft.profileUrl.trim()) {
      showToast("GitHub 사용자명 또는 프로필 URL을 입력해주세요.");
      return;
    }

    const nextGithub = {
      ...githubDraft,
      connected: true,
    };

    setGithub(nextGithub);
    saveGithubConnectionToService(nextGithub);
    setGithubModalOpen(false);
    notifyCareerScoreChanged();
    showToast("GitHub 계정 정보가 저장되었습니다.");
  };

  const getMissingItems = () => {
    const items = [];

    if (!form.title.trim()) items.push("이력서 제목");
    if (!form.name.trim()) items.push("이름");
    if (!form.phone.trim()) items.push("연락처");
    if (!form.email.trim()) items.push("이메일");
    if (techStacks.length === 0) items.push("기술 스택");
    if (!form.university.trim()) items.push("대학교명");
    if (!form.major.trim()) items.push("전공");
    if (!experiences.some((item) => item.title.trim())) items.push("경험 활동명");
    if (!essays.some((item) => item.title.trim() && item.body.trim()))
      items.push("자소서 초안");
    if (files.length === 0) items.push("포트폴리오 문서");
    if (!certificates.some((item) => item.name.trim())) items.push("자격증명");
    if (!careers.some((item) => item.company.trim() || item.result.trim()))
      items.push("경력 또는 주요 성과");

    return items;
  };

  const submitResume = () => {
    const nextMissingItems = getMissingItems();

    saveResumeProgress(progress);
    notifyCareerScoreChanged();

    if (nextMissingItems.length > 0) {
      setMissingItems(nextMissingItems);
      setMissingModalOpen(true);
      return;
    }

    forceSubmitResume();
  };

  const forceSubmitResume = () => {
    saveResumeProgress(progress);
    markResumeSubmitted();
    notifyCareerScoreChanged();
    setMissingModalOpen(false);
    setCompleteModalOpen(true);
  };

  const saveAndExit = () => {
    saveResumeProgress(progress);
    markResumeContinue();
    notifyCareerScoreChanged();
    showToast("임시 저장되었습니다.");
    navigate("/home");
  };

  return (
    <AppLayout title="커리어 프로필 작성">
      <div className="mb-5 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[320px] flex-1">
            <div className="mb-[7px] text-[13px] font-black text-emerald-600">
              방금 전 저장됨 · <strong>{progress}% 완료</strong>
            </div>
            <div className="h-[9px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button type="button" onClick={saveAndExit} className={secondaryButtonClass}>
            임시 저장 후 나가기
          </button>
        </div>
      </div>

      <div className="mb-[22px]">
        <h1 className="mb-[10px] text-[30px] font-black tracking-[-0.7px] text-slate-900 dark:text-white">
          커리어 프로필 작성
        </h1>
        <p className="text-[15px] leading-[1.7] text-slate-600 dark:text-slate-300">
          한 번만 입력하면 기업 매칭, 맞춤 자소서 생성, RAG 면접 시뮬레이션에
          활용되는 통합 프로필이 만들어집니다.
        </p>
      </div>

      <div>
      <Section
        id="section-basic"
        title="1. 기본 정보 및 프로필 연동"
        description="GitHub를 연동하면 주요 기술 스택을 자동 파싱할 수 있습니다."
      >
        <div className="mb-4 flex items-center justify-between gap-4 rounded-[22px] bg-slate-100 px-5 py-4 dark:bg-slate-800">
          <div>
            <strong className="mb-[5px] block font-black text-slate-900 dark:text-white">
              GitHub 계정 연동
            </strong>
            <p className="text-[13px] leading-[1.5] text-slate-600 dark:text-slate-300">
              Repository, README, 사용 언어를 기반으로 기술 스택을 분석합니다.
            </p>
            <div
              className={`mt-2 text-[12px] font-black ${
                github.connected ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {github.connected
                ? `${github.username || "GitHub"} 계정 정보가 저장되었습니다.`
                : "아직 연동된 GitHub 계정이 없습니다."}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setGithubDraft(github);
              setGithubModalOpen(true);
            }}
            className={primaryButtonClass}
          >
            GitHub 계정 연동하기
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="이력서 제목 (Max 30자)">
            <input
              className={inputClass}
              maxLength={30}
              placeholder="예: 백엔드 개발자 이력서"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
            />
          </Field>

          <Field label="희망 지역">
            <select
              className={inputClass}
              value={form.preferredArea}
              onChange={(e) => updateForm("preferredArea", e.target.value)}
            >
              <option value="">희망 지역 선택</option>
              <option>서울</option>
              <option>판교</option>
              <option>광주</option>
            </select>
          </Field>
        </div>

        <div className="mb-5 rounded-[24px] border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-white px-3 py-2 text-[12px] font-black text-blue-700 dark:bg-slate-900 dark:text-blue-300">
                MyPage 프로필 연동 완료
              </div>
              <h3 className="text-[19px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
                기본 인적사항은 마이페이지 정보로 자동 반영됩니다.
              </h3>
              <p className="mt-2 break-keep text-[13px] font-extrabold leading-[1.65] text-slate-600 dark:text-slate-300">
                이름, 연락처, 이메일, 생년월일, 주소, 성별, 병역 여부는 이력서 작성 화면에서 수정할 수 없습니다. 정보 변경은 내 커리어 관리 화면에서 진행해주세요.
              </p>
            </div>

            <button type="button" onClick={() => navigate("/mypage")} className={outlineButtonClass}>
              프로필 수정하기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["이름", form.name],
              ["닉네임", userProfile?.nickname],
              ["이메일", form.email],
              ["연락처", form.phone],
              ["생년월일", form.birth],
              ["성별", form.gender],
              ["병역 여부", form.military],
              ["우편번호", userProfile?.postcode || form.postcode],
              ["주소", userProfile?.baseAddress || form.baseAddress || form.region],
              ["상세주소", userProfile?.detailAddress || form.detailAddress],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-h-[70px] rounded-[18px] border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="mb-2 block text-[12px] font-black text-slate-500 dark:text-slate-400">
                  {label}
                </span>
                <strong className="block break-keep text-[14px] font-black leading-[1.5] text-slate-800 dark:text-slate-100">
                  {value || "마이페이지에서 입력 필요"}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div id="section-tech-stack">
          <TechStackBlock
            selectedTechs={techStacks}
            onChange={(nextTechs) => {
              setTechStacks(sanitizeTechStacks(nextTechs));
              notifyCareerScoreChanged();
              showToast("기술 스택이 저장되었습니다.");
            }}
          />
        </div>
      </Section>

      <Section
        id="section-education"
        title="2. 학력 사항"
        description="학점 척도를 통일하면 AI 파싱 정확도가 높아집니다."
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="고등학교명">
            <input
              className={inputClass}
              placeholder="고등학교명 입력"
              value={form.highSchool}
              onChange={(e) => updateForm("highSchool", e.target.value)}
            />
          </Field>

          <Field label="대학교명">
            <input
              className={inputClass}
              placeholder="대학교명 입력"
              value={form.university}
              onChange={(e) => updateForm("university", e.target.value)}
            />
          </Field>

          <Field label="전공">
            <input
              className={inputClass}
              placeholder="예: 컴퓨터공학과"
              value={form.major}
              onChange={(e) => updateForm("major", e.target.value)}
            />
          </Field>

          <Field label="학점">
            <div className="grid grid-cols-[1fr_150px] gap-2">
              <input
                className={inputClass}
                type="number"
                placeholder="3.8"
                value={form.grade}
                onChange={(e) => updateForm("grade", e.target.value)}
              />
              <select
                className={inputClass}
                value={form.gradeScale}
                onChange={(e) => updateForm("gradeScale", e.target.value)}
              >
                <option value="">학점 기준 선택</option>
                <option>4.5 만점</option>
                <option>4.3 만점</option>
                <option>100점 만점</option>
              </select>
            </div>
          </Field>
        </div>

        <label className="mt-1 flex items-center gap-2 text-[14px] font-extrabold text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.hasGraduate}
            onChange={(e) => updateForm("hasGraduate", e.target.checked)}
            className="h-4 w-4"
          />
          대학원 과정이 있습니다.
        </label>

        {form.hasGraduate && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="대학원명">
              <input
                className={inputClass}
                placeholder="예: 서울대학교 대학원"
                value={form.graduateSchool}
                onChange={(e) => updateForm("graduateSchool", e.target.value)}
              />
            </Field>

            <Field label="대학원 세부 전공">
              <input
                className={inputClass}
                placeholder="예: 인공지능학과"
                value={form.graduateMajor}
                onChange={(e) => updateForm("graduateMajor", e.target.value)}
              />
            </Field>
          </div>
        )}
      </Section>

      <Section
        id="section-experience"
        title="3. 경험"
        description="수상, 대외활동, 교육 경험을 카드 단위로 추가할 수 있습니다."
        action={
          <button type="button" onClick={addExperience} className={primaryButtonClass}>
            + 경험 추가하기
          </button>
        }
      >
        {experiences.map((experience, index) => (
          <div
            key={index}
            className="mb-4 rounded-[22px] border border-slate-200 bg-slate-100 p-5 last:mb-0 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <strong className="text-[16px] font-black text-slate-900 dark:text-white">
                경험 {index + 1}
              </strong>
              {experiences.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setExperiences, index)}
                  className="rounded-full bg-red-500 px-4 py-2 text-[13px] font-black text-white"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="과제명/활동명">
                <input
                  className={inputClass}
                  placeholder={index === 0 ? "예: 스마트인재개발원 핵심 프로젝트" : "활동명 입력"}
                  value={experience.title}
                  onChange={(e) =>
                    updateArray(setExperiences, index, "title", e.target.value)
                  }
                />
              </Field>

              <Field label="진행 여부">
                <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-[14px] py-[13px] text-[14px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={experience.isOngoing}
                    onChange={(e) =>
                      updateArray(setExperiences, index, "isOngoing", e.target.checked)
                    }
                  />
                  진행 중
                </label>
              </Field>

              <Field label="시작 연월일">
                <input
                  className={inputClass}
                  type="date"
                  value={experience.startDate}
                  onChange={(e) =>
                    updateArray(setExperiences, index, "startDate", e.target.value)
                  }
                />
              </Field>

              <Field label="종료 연월일">
                <input
                  className={inputClass}
                  type="date"
                  disabled={experience.isOngoing}
                  value={experience.isOngoing ? "" : experience.endDate}
                  onChange={(e) =>
                    updateArray(setExperiences, index, "endDate", e.target.value)
                  }
                />
              </Field>
            </div>
          </div>
        ))}
      </Section>

      <Section
        id="section-essay"
        title="4. 자소서 초안"
        description="문항별 초안을 입력하면 기업 맞춤형 문장으로 재구성됩니다."
        action={
          <button type="button" onClick={addEssay} className={primaryButtonClass}>
            + 문항 추가하기
          </button>
        }
      >
        {essays.map((essay, index) => (
          <div
            key={index}
            className="mb-4 rounded-[22px] border border-slate-200 bg-slate-100 p-5 last:mb-0 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <strong className="text-[16px] font-black text-slate-900 dark:text-white">
                {index < 3 ? essay.label : `문항 ${index + 1}`}
              </strong>
              {essays.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeItem(setEssays, index)}
                  className="rounded-full bg-red-500 px-4 py-2 text-[13px] font-black text-white"
                >
                  삭제
                </button>
              )}
            </div>

            <Field label="소제목">
              <input
                className={inputClass}
                placeholder={essay.titlePlaceholder || "소제목 입력"}
                value={essay.title}
                onChange={(e) => updateArray(setEssays, index, "title", e.target.value)}
              />
            </Field>

            <Field label="본문">
              <textarea
                className={textareaClass}
                maxLength={1000}
                placeholder={essay.bodyPlaceholder || "자소서 초안을 입력하세요."}
                value={essay.body}
                onChange={(e) => updateArray(setEssays, index, "body", e.target.value)}
              />
              <div className="mt-[6px] text-right font-mono text-[12px] font-extrabold text-slate-400 dark:text-slate-500">
                {essay.body.length} / 1000자
              </div>
            </Field>
          </div>
        ))}
      </Section>

      <Section
        id="section-portfolio"
        title="5. 포트폴리오 문서 첨부"
        description=".pdf, .txt 파일만 지원합니다. 최대 50MB까지 업로드할 수 있습니다."
      >
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="block cursor-pointer rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-100 p-[34px] text-center transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
        >
          <strong className="mb-2 block text-[17px] font-black text-slate-900 dark:text-white">
            파일을 드래그하거나 클릭해서 업로드하세요
          </strong>
          <p className="text-[14px] leading-[1.6] text-slate-600 dark:text-slate-300">
            .pdf, .txt 파일을 여러 개 업로드할 수 있습니다. (파일당 최대 50MB)
          </p>
          <input
            type="file"
            accept=".pdf,.txt"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {files.length > 0 && (
          <div className="mt-[14px] flex flex-col gap-[10px] rounded-[18px] border border-emerald-200 bg-emerald-50 p-[14px] text-[14px] font-black text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <div className="flex items-center justify-between gap-3">
              <span>업로드된 파일 {files.length}개</span>
              <button type="button" onClick={() => setFiles([])} className={secondaryButtonClass}>
                전체 삭제
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-emerald-200 bg-white px-3 py-[11px] dark:border-emerald-900 dark:bg-slate-900"
                >
                  <span className="truncate text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) =>
                        prev.filter((_, fileIndex) => fileIndex !== index)
                      )
                    }
                    className="rounded-full border border-slate-200 px-3 py-1 text-[12px] font-black text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section
        id="section-certificate"
        title="6. 자격증"
        description="자격증 카드마다 국가/민간/어학 유형을 선택할 수 있습니다."
        action={
          <button type="button" onClick={addCertificate} className={primaryButtonClass}>
            + 자격증 추가
          </button>
        }
      >
        {certificates.map((certificate, index) => (
          <div
            key={index}
            className="mb-4 rounded-[22px] border border-slate-200 bg-slate-100 p-5 last:mb-0 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <strong className="text-[16px] font-black text-slate-900 dark:text-white">
                자격증 {index + 1}
              </strong>
              {certificates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setCertificates, index)}
                  className="rounded-full bg-red-500 px-4 py-2 text-[13px] font-black text-white"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="mb-4 flex gap-2">
              {["국가", "민간", "어학"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateArray(setCertificates, index, "type", type)}
                  className={`rounded-full border px-[14px] py-[9px] text-[13px] font-black ${
                    certificate.type === type
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="자격증명">
                <input
                  className={inputClass}
                  placeholder="예: 정보처리기사"
                  value={certificate.name}
                  onChange={(e) =>
                    updateArray(setCertificates, index, "name", e.target.value)
                  }
                />
              </Field>

              <Field label="취득 연월일">
                <input
                  className={inputClass}
                  type="date"
                  value={certificate.date}
                  onChange={(e) =>
                    updateArray(setCertificates, index, "date", e.target.value)
                  }
                />
              </Field>

              <Field label="발급기관">
                <input
                  className={inputClass}
                  placeholder="예: 한국산업인력공단"
                  value={certificate.organization}
                  onChange={(e) =>
                    updateArray(setCertificates, index, "organization", e.target.value)
                  }
                />
              </Field>
            </div>
          </div>
        ))}
      </Section>

      <Section
        id="section-career"
        title="7. 경력 사항"
        description="주요 성과는 불릿 포인트 형태로 작성하면 AI가 성과 중심 문장으로 바꾸기 좋습니다."
        action={
          <button type="button" onClick={addCareer} className={primaryButtonClass}>
            + 경력 추가
          </button>
        }
      >
        {careers.map((career, index) => (
          <div
            key={index}
            className="mb-4 rounded-[22px] border border-slate-200 bg-slate-100 p-5 last:mb-0 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <strong className="text-[16px] font-black text-slate-900 dark:text-white">
                경력 {index + 1}
              </strong>
              {careers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setCareers, index)}
                  className="rounded-full bg-red-500 px-4 py-2 text-[13px] font-black text-white"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="회사명">
                <input
                  className={inputClass}
                  placeholder="회사명 입력"
                  value={career.company}
                  onChange={(e) => updateArray(setCareers, index, "company", e.target.value)}
                />
              </Field>

              <Field label="부서">
                <input
                  className={inputClass}
                  placeholder="부서 입력"
                  value={career.department}
                  onChange={(e) =>
                    updateArray(setCareers, index, "department", e.target.value)
                  }
                />
              </Field>

              <Field label="직무">
                <input
                  className={inputClass}
                  placeholder="직무 입력"
                  value={career.position}
                  onChange={(e) =>
                    updateArray(setCareers, index, "position", e.target.value)
                  }
                />
              </Field>

              <Field label="입사 연월일">
                <input
                  className={inputClass}
                  type="date"
                  value={career.startDate}
                  onChange={(e) =>
                    updateArray(setCareers, index, "startDate", e.target.value)
                  }
                />
              </Field>

              <Field label="퇴사 연월일">
                <input
                  className={inputClass}
                  type="date"
                  disabled={career.isWorking}
                  value={career.isWorking ? "" : career.endDate}
                  onChange={(e) =>
                    updateArray(setCareers, index, "endDate", e.target.value)
                  }
                />

                <label className="mt-2 flex items-center gap-2 text-[14px] font-extrabold text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={career.isWorking}
                    onChange={(e) =>
                      updateArray(setCareers, index, "isWorking", e.target.checked)
                    }
                  />
                  재직 중
                </label>
              </Field>
            </div>

            {career.isWorking && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="퇴사 예정 일자">
                  <input
                    className={inputClass}
                    type="date"
                    value={career.expectedLeaveDate}
                    onChange={(e) =>
                      updateArray(setCareers, index, "expectedLeaveDate", e.target.value)
                    }
                  />
                </Field>

                <Field label="입사 가능 일자">
                  <input
                    className={inputClass}
                    type="date"
                    value={career.availableDate}
                    onChange={(e) =>
                      updateArray(setCareers, index, "availableDate", e.target.value)
                    }
                  />
                </Field>
              </div>
            )}

            <Field label="주요 성과">
              <textarea
                className={textareaClass}
                placeholder={
                  "- Redis 캐싱 적용으로 반복 조회 API 응답 속도 개선\n- DB 부하 감소를 통해 서비스 안정성 향상"
                }
                value={career.result}
                onChange={(e) => updateArray(setCareers, index, "result", e.target.value)}
              />
            </Field>
          </div>
        ))}
      </Section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[84px] items-center justify-center border-t border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/90">
        <div className="flex w-full max-w-[1120px] items-center justify-between gap-4 px-10">
          <p className="text-[14px] font-extrabold text-slate-600 dark:text-slate-300">
            최종 제출하면 AI가 이력서를 분석해 추천 정확도를 업데이트합니다.
          </p>
          <button type="button" onClick={submitResume} className={primaryButtonClass}>
            최종 제출하고 기업 추천받기
          </button>
        </div>
      </div>

      <Modal open={missingModalOpen}>
        <div className="w-full max-w-[520px] rounded-[28px] bg-white p-8 shadow-2xl dark:bg-slate-900">
          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-2 text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            AI 추천 정확도 확인
          </div>
          <h3 className="mb-3 text-[24px] font-black tracking-[-0.6px] text-slate-900 dark:text-white">
            더 정확한 AI 추천을 위해 확인이 필요해요
          </h3>
          <p className="mb-5 text-[14px] font-bold leading-7 text-slate-600 dark:text-slate-300">
            아직 작성되지 않은 항목이 있습니다.
            <br />
            이력서를 더 완성하면 기업 추천 정확도가 향상됩니다.
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            {missingItems.map((item) => (
              <span
                key={item}
                className="rounded-full bg-red-50 px-3 py-2 text-[13px] font-black text-red-600 dark:bg-red-950 dark:text-red-300"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={forceSubmitResume} className={secondaryButtonClass}>
              그대로 제출하기
            </button>
            <button
              type="button"
              onClick={() => setMissingModalOpen(false)}
              className={primaryButtonClass}
            >
              작성 이어가기
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={completeModalOpen}>
        <div className="w-full max-w-[620px] rounded-[30px] bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-emerald-500 text-[28px] font-black text-white">
            ✓
          </div>
          <h3 className="mb-3 text-[26px] font-black tracking-[-0.8px] text-slate-900 dark:text-white">
            이력서 제출이 완료되었습니다
          </h3>
          <p className="mb-6 text-[14px] font-bold leading-7 text-slate-600 dark:text-slate-300">
            입력한 이력서 정보가 통합 프로필에 반영되었습니다.
            <br />
            AI가 프로필을 다시 분석해 기업 추천 정확도를 업데이트했습니다.
          </p>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              ["상태", "최종 제출 완료"],
              ["추천 반영", "AI 매칭 업데이트"],
              ["다음 단계", "추천 기업 확인"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="mb-1 text-[12px] font-black text-slate-500 dark:text-slate-400">
                  {label}
                </div>
                <div className="text-[13px] font-black text-slate-900 dark:text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => navigate("/home")} className={secondaryButtonClass}>
              AI 커리어 홈으로 이동
            </button>
            <button type="button" onClick={() => navigate("/fitting")} className={primaryButtonClass}>
              추천 기업 보러가기
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={githubModalOpen}>
        <div className="w-full max-w-[620px] rounded-[28px] bg-white p-7 shadow-2xl dark:bg-slate-900">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-2 text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                GitHub 프로필 연동
              </div>
              <h3 className="mb-2 text-[24px] font-black tracking-[-0.6px] text-slate-900 dark:text-white">
                GitHub 계정 정보를 입력해주세요
              </h3>
              <p className="text-[14px] font-bold leading-7 text-slate-600 dark:text-slate-300">
                입력한 계정 정보를 기반으로 Repository, README, 사용 언어를 분석해
                기술 스택 파싱에 활용합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGithubModalOpen(false)}
              className="h-9 w-9 rounded-full bg-slate-100 text-[20px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              ×
            </button>
          </div>

          <Field label="GitHub 사용자명">
            <input
              className={inputClass}
              placeholder="예: hjyong4939"
              value={githubDraft.username}
              onChange={(e) =>
                setGithubDraft((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </Field>

          <Field label="GitHub 프로필 URL">
            <input
              className={inputClass}
              type="url"
              placeholder="예: https://github.com/hjyong4939"
              value={githubDraft.profileUrl}
              onChange={(e) =>
                setGithubDraft((prev) => ({ ...prev, profileUrl: e.target.value }))
              }
            />
          </Field>

          <Field label="대표 Repository URL">
            <input
              className={inputClass}
              type="url"
              placeholder="예: https://github.com/hjyong4939/articlue"
              value={githubDraft.repoUrl}
              onChange={(e) =>
                setGithubDraft((prev) => ({ ...prev, repoUrl: e.target.value }))
              }
            />
          </Field>

          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-[13px] font-bold leading-6 text-slate-600 dark:border-blue-900 dark:bg-blue-950 dark:text-slate-300">
            현재는 프론트 시연용 입력 모달입니다. 실제 GitHub OAuth/API 연동
            전까지는 입력한 정보를 localStorage에 저장해 화면 상태와 기술 스택
            분석 흐름을 시연합니다.
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setGithubModalOpen(false)} className={secondaryButtonClass}>
              취소
            </button>
            <button type="button" onClick={saveGithubConnection} className={primaryButtonClass}>
              연동 정보 저장
            </button>
          </div>
        </div>
      </Modal>

      <div
        className={`fixed bottom-[104px] right-7 z-[999] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-extrabold text-white transition-all dark:bg-white dark:text-slate-900 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        {toast || "저장되었습니다."}
      </div>
    </AppLayout>
  );
}