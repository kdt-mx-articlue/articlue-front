import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { isAuthenticated, clearAuthStorage } from "../utils/auth.js";

const INTERVIEW_RESULT_KEY = "articlue_interview_results";
const COVER_LETTER_KEY = "articlue_cover_letters";

const FAVORITE_KEYS = [
  "articlue_favorite_jobs",
  "favoriteJobs",
  "likedJobs",
  "articlueLikedJobs",
];

const COMPANY_NAME_MAP = {
  naver: "네이버웹툰",
  toss: "토스",
  kakao: "카카오",
};

function applyDocumentTheme(theme) {
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

function normalizeJobs(jobs) {
  return jobs.map((job, index) => ({
    id: job.id || job.company || `job-${index}`,
    company: job.company || job.name || "기업명 없음",
    role: job.role || job.position || "직무 정보 없음",
    match: job.match || job.score || job.matchRate || "-",
    desc:
      job.desc ||
      job.description ||
      "찜한 기업 공고를 기반으로 지원 전략을 이어갈 수 있습니다.",
    stacks: Array.isArray(job.stacks)
      ? job.stacks
      : Array.isArray(job.tags)
      ? job.tags
      : ["Java", "Spring Boot"],
  }));
}

function readFavoriteJobs() {
  for (const key of FAVORITE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return normalizeJobs(parsed);
    } catch {
      // ignore
    }
  }

  return [];
}

function readInterviewResults() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(INTERVIEW_RESULT_KEY) || "[]"
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCoverLetters() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COVER_LETTER_KEY) || "{}");

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return [];
    }

    return Object.entries(parsed).map(([companyId, content]) => {
      const motivation =
        content?.지원동기 || content?.motivation || "지원동기 내용이 없습니다.";
      const project =
        content?.프로젝트경험 ||
        content?.project ||
        "프로젝트 경험 내용이 없습니다.";

      return {
        id: companyId,
        company: COMPANY_NAME_MAP[companyId] || companyId,
        title: `[${COMPANY_NAME_MAP[companyId] || companyId}] 맞춤 자소서 초안`,
        motivation,
        project,
        savedAt: content?.savedAt || null,
      };
    });
  } catch {
    return [];
  }
}

function readTechStacks() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem("articlue-resume-techs") || "[]"
    );

    if (Array.isArray(parsed) && parsed.length) {
      return parsed
        .map((tech) => {
          if (typeof tech === "string") return tech;
          return tech.name || tech.label || tech.value || "";
        })
        .filter(Boolean);
    }
  } catch {
    // ignore
  }

  return [];
}

function readProgress() {
  const raw = Number(localStorage.getItem("articlue_resume_progress"));
  if (Number.isFinite(raw) && raw >= 0) {
    return Math.min(100, Math.max(0, raw));
  }
  return 72;
}

function formatDate(value) {
  if (!value) return "최근 기록";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "최근 기록";

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  } catch {
    return "최근 기록";
  }
}

function getTimestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default function MyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [interviewResults, setInterviewResults] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedInterviewReport, setSelectedInterviewReport] = useState(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("resume");
  const [progress, setProgress] = useState(() => readProgress());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("articlue-theme") || "light"
  );

  const submitted =
    localStorage.getItem("articlue_resume_submitted") === "true";

  const matchScore = submitted
    ? Math.max(86, progress)
    : Math.min(79, progress);

  const techStacks = useMemo(() => readTechStacks(), []);

  const techSummary =
    techStacks.length > 0
      ? `신입 · Backend Developer · ${techStacks.slice(0, 3).join("/")} 중심`
      : "신입 · Backend Developer · 기술스택 미입력";

  const latestInterview = interviewResults[0];
  const firstFavorite = favorites[0];
  const latestCoverLetter = coverLetters[0];

  const activityItems = useMemo(() => {
    const interviewActivities = interviewResults.map((result) => ({
      id: `interview-${result.id || result.company}-${result.createdAt}`,
      title: `${result.company} ${result.role} 면접 리포트 생성`,
      meta: `${formatDate(result.createdAt)} · 종합 ${result.score}점`,
      type: "면접 리포트",
      timestamp: getTimestamp(result.createdAt),
    }));

    const coverLetterActivities = coverLetters.map((letter) => ({
      id: `cover-${letter.id}`,
      title: `${letter.company} 맞춤 자소서 초안 저장`,
      meta: letter.savedAt
        ? `${formatDate(letter.savedAt)} · 맞춤 자소서`
        : "최근 · 맞춤 자소서",
      type: "맞춤 자소서",
      timestamp: getTimestamp(letter.savedAt),
    }));

    return [...interviewActivities, ...coverLetterActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [interviewResults, coverLetters]);

  const nextActionTitle = firstFavorite
    ? `${firstFavorite.company} 맞춤 자소서 작성`
    : "추천 기업 지원 전략 확인하기";

  const nextActionDesc = firstFavorite
    ? `${firstFavorite.company} ${firstFavorite.role} 공고를 기준으로 맞춤 자소서와 면접 질문을 연결합니다.`
    : "커리어 피팅에서 관심 기업을 찜하면 맞춤 지원 전략을 이어갈 수 있습니다.";

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("articlue_current_user") || "null");
    } catch {
      return null;
    }
  })();

  const profileName =
    localStorage.getItem("articlue_profile_name") ||
    currentUser?.name ||
    "사용자";

  const refreshPageData = () => {
    setFavorites(readFavoriteJobs());
    setInterviewResults(readInterviewResults());
    setCoverLetters(readCoverLetters());
    setProfileImage(localStorage.getItem("articlue_profile_image") || "");
    setProgress(readProgress());
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    setAuthChecked(true);
    refreshPageData();

    const savedTheme = localStorage.getItem("articlue-theme") || "light";
    setTheme(savedTheme);
    applyDocumentTheme(savedTheme);

    const handleStorage = (event) => {
      if (event.key === "isLogin" || event.key === "articlue_current_user") {
        if (!isAuthenticated()) {
          navigate("/login", { replace: true });
        }
      }

      if (
        FAVORITE_KEYS.includes(event.key) ||
        event.key === "articlue_resume_progress" ||
        event.key === "articlue_profile_image" ||
        event.key === "articlue_profile_name" ||
        event.key === INTERVIEW_RESULT_KEY ||
        event.key === COVER_LETTER_KEY
      ) {
        refreshPageData();
      }

      if (event.key === "articlue-theme") {
        const nextTheme = event.newValue || "light";
        setTheme(nextTheme);
        applyDocumentTheme(nextTheme);
      }
    };

    const handleFocus = () => {
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }

      refreshPageData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("articlue-theme", nextTheme);
    applyDocumentTheme(nextTheme);

    showToast(
      nextTheme === "dark"
        ? "다크모드로 변경되었습니다."
        : "라이트모드로 변경되었습니다."
    );
  };

  const openLogoutModal = () => {
    setSettingsOpen(false);
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    clearAuthStorage();
    setLogoutOpen(false);
    navigate("/login", { replace: true });
  };

  const removeFavorite = (id) => {
    const next = favorites.filter((job) => String(job.id) !== String(id));
    setFavorites(next);
    localStorage.setItem("articlue_favorite_jobs", JSON.stringify(next));
    showToast("찜한 공고에서 삭제했습니다.");
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("프로필 이미지는 2MB 이하 파일을 사용해 주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      localStorage.setItem("articlue_profile_image", result);
      setProfileImage(result);
      showToast("프로필 이미지가 변경되었습니다.");
    };
    reader.readAsDataURL(file);
  };

  const resetProfileImage = () => {
    localStorage.removeItem("articlue_profile_image");
    setProfileImage("");
    showToast("기본 프로필 이미지로 변경되었습니다.");
  };

  if (!authChecked) return null;

  return (
    <AppLayout title="내 커리어 관리">
      <div className="min-h-screen text-slate-900 transition-colors dark:text-slate-100">
        <div className="mb-[16px] flex items-center justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSettingsOpen((prev) => !prev);
              }}
              className="inline-flex items-center gap-[6px] rounded-full border border-slate-200 bg-white px-[14px] py-[9px] text-[13px] font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              ⚙ 설정
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[1200] w-[260px] rounded-[22px] border border-slate-200 bg-white p-[14px] shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-[10px] border-b border-slate-200 px-1 pb-3 text-[15px] font-black text-slate-900 dark:border-slate-700 dark:text-white">
                  설정
                </div>

                <div className="flex items-center justify-between gap-3 px-[6px] py-3">
                  <div>
                    <strong className="mb-1 block text-[13px] font-black text-slate-900 dark:text-white">
                      화면 모드
                    </strong>
                    <span className="block text-[12px] font-extrabold leading-[1.4] text-slate-400 dark:text-slate-400">
                      전체 페이지에 동일하게 적용됩니다.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="다크모드 전환"
                    className={`h-[30px] w-[54px] rounded-full border border-slate-200 p-[3px] transition dark:border-slate-700 ${
                      theme === "dark"
                        ? "bg-blue-600"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition ${
                        theme === "dark" ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

                <button
                  type="button"
                  onClick={openLogoutModal}
                  className="flex w-full items-center justify-between rounded-[14px] px-[6px] py-[11px] text-left text-[13px] font-black text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  로그아웃 <span>›</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="relative mb-[22px] grid grid-cols-[1.15fr_.85fr] items-center gap-6 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] px-[34px] py-[30px] text-white shadow-[0_18px_55px_rgba(37,99,235,0.10)]">
          <div className="relative z-10">
            <h2 className="mb-[10px] text-[31px] font-black leading-[1.25] tracking-[-1px]">
              내 지원 준비 상태와 다음 액션을 한눈에 확인하세요.
            </h2>
            <p className="break-keep text-[15px] leading-[1.75] opacity-95">
              찜한 기업 공고, 생성한 이력서, 면접 리포트, 성장 진단 결과를
              연결해 지금 가장 먼저 해야 할 준비를 보여줍니다.
            </p>

            <div className="mt-[18px] flex flex-wrap gap-[10px]">
              <Link
                to="/fitting"
                className="rounded-full border border-white bg-white px-[18px] py-[11px] text-[14px] font-black text-blue-700"
              >
                추천 기업 확인하기
              </Link>
              <Link
                to="/growth"
                className="rounded-full border border-white/50 px-[18px] py-[11px] text-[14px] font-black text-white"
              >
                성장 진단 다시 보기
              </Link>
            </div>
          </div>

          <div className="relative z-10 rounded-[24px] border border-white/25 bg-white/15 p-[18px] backdrop-blur-md">
            <div className="mb-[14px] text-[13px] font-black opacity-90">
              오늘의 커리어 상태
            </div>
            <div className="grid grid-cols-3 gap-[10px]">
              {[
                [`${progress}%`, "프로필 완성도"],
                [`${matchScore}%`, "추천 적합도 평균"],
                [favorites.length, "찜한 기업 공고"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-white/20 bg-white/15 p-[14px]"
                >
                  <strong className="block text-[25px] font-black tracking-[-0.7px]">
                    {value}
                  </strong>
                  <span className="text-[12px] font-extrabold opacity-90">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-[110px] -top-[130px] h-[300px] w-[300px] rounded-full bg-white/15" />
        </section>

        <section className="mb-[22px] rounded-[26px] border border-slate-200 bg-white p-[25px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-[18px] flex items-start justify-between gap-4">
            <div>
              <h2 className="mb-[6px] text-[21px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
                찜한 기업 공고
              </h2>
              <p className="break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
                커리어 피팅에서 찜한 기업 공고를 상단에서 바로 확인하고, 지원
                전략·맞춤 자소서·면접 준비로 이어갈 수 있습니다.
              </p>
            </div>
            <div className="min-w-[74px] rounded-[20px] bg-blue-50 px-[13px] py-[10px] text-center text-[13px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <strong className="block text-[24px] leading-none">
                {favorites.length}
              </strong>
              개 찜
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-100 p-7 text-center text-[14px] font-extrabold leading-[1.7] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              아직 찜한 기업 공고가 없습니다.
              <br />
              커리어 피팅 화면에서 관심 있는 기업을 저장해보세요.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[14px]">
              {favorites.map((job) => (
                <article
                  key={job.id}
                  className="rounded-[22px] border border-slate-200 bg-white p-[18px] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="mb-[10px] flex justify-between gap-[10px]">
                    <div>
                      <div className="text-[17px] font-black text-slate-900 dark:text-white">
                        {job.company}
                      </div>
                      <div className="mt-1 text-[13px] font-extrabold text-slate-600 dark:text-slate-300">
                        {job.role}
                      </div>
                    </div>
                    <span className="h-fit rounded-full bg-emerald-50 px-[10px] py-[7px] text-[12px] font-black text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                      {job.match}
                    </span>
                  </div>

                  <p className="my-3 text-[13px] leading-[1.6] text-slate-600 dark:text-slate-300">
                    {job.desc}
                  </p>

                  <div className="mb-[14px] flex flex-wrap gap-[7px]">
                    {job.stacks.slice(0, 3).map((stack) => (
                      <span
                        key={stack}
                        className="rounded-full border border-slate-200 bg-slate-100 px-[9px] py-[6px] text-[12px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/fitting?company=${encodeURIComponent(job.company)}`}
                      className="rounded-full bg-blue-600 px-[14px] py-[9px] text-[12px] font-black text-white"
                    >
                      맞춤 자소서 작성
                    </Link>
                    <Link
                      to={`/interview?company=${encodeURIComponent(
                        job.company
                      )}`}
                      className="rounded-full border border-blue-600 bg-white px-[14px] py-[9px] text-[12px] font-black text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
                    >
                      AI 면접 시작
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFavorite(job.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-[14px] py-[9px] text-[12px] font-black text-red-500 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    >
                      찜 해제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mb-[22px] grid grid-cols-[1fr_.9fr] gap-[22px]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-[25px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
            <div className="grid grid-cols-[auto_1fr] items-start gap-[18px]">
              <div
                className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-300 text-[28px] font-black text-white"
                style={
                  profileImage
                    ? {
                        backgroundImage: `url(${profileImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {!profileImage && profileName.slice(0, 1)}
              </div>

              <div>
                <div className="mb-[7px] text-[24px] font-black text-slate-900 dark:text-white">
                  {profileName}
                </div>
                <div className="mb-3 text-[14px] font-extrabold text-slate-600 dark:text-slate-300">
                  {techSummary}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-[12px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    프로필 사진 변경
                  </button>
                  <button
                    type="button"
                    onClick={resetProfileImage}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-[12px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    기본 사진으로 되돌리기
                  </button>
                  <Link
                    to="/resume"
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-[12px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    이력서 수정
                  </Link>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["포트폴리오 완성도", `${progress}%`, progress],
                ["최근 AI 분석 상태", submitted ? "분석 완료" : "보완 권장", 64],
                [
                  "최근 면접 결과",
                  latestInterview ? `${latestInterview.score}점` : "기록 없음",
                  null,
                ],
                ["저장된 자소서", `${coverLetters.length}개`, null],
              ].map(([label, value, bar]) => (
                <div
                  key={label}
                  className="rounded-[20px] border border-slate-200 bg-slate-100 p-[15px] dark:border-slate-700 dark:bg-slate-800"
                >
                  <span className="mb-2 block text-[12px] font-black text-slate-600 dark:text-slate-300">
                    {label}
                  </span>
                  <strong className="text-[22px] font-black text-slate-900 dark:text-white">
                    {value}
                  </strong>
                  {bar !== null && (
                    <div className="mt-[10px] h-[9px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                        style={{ width: `${bar}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[26px] border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
            <h2 className="mb-[10px] text-[22px] font-black text-slate-900 dark:text-white">
              기술 구현 설명은 충분하지만, 비즈니스 성과 연결이 부족합니다.
            </h2>
            <p className="mb-[17px] break-keep text-[14px] leading-[1.75] text-slate-600 dark:text-slate-300">
              Redis 캐싱, API 최적화 경험은 강점입니다. 다만 채용 공고
              기준으로는 트래픽 개선 수치, 비용 절감, 사용자 경험 개선처럼 기업
              관점의 성과 표현을 보완하면 추천 적합도가 더 올라갑니다.
            </p>
            <Link
              to="/growth"
              className="inline-flex rounded-full bg-blue-600 px-[17px] py-[11px] text-[14px] font-black text-white"
            >
              부족한 역량 보완하러 가기
            </Link>
          </aside>
        </section>

        <section className="mb-[22px] grid grid-cols-2 gap-[22px]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-[25px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-[18px]">
              <h2 className="mb-[6px] text-[21px] font-black text-slate-900 dark:text-white">
                최근 활동 타임라인
              </h2>
              <p className="text-[14px] text-slate-600 dark:text-slate-300">
                저장된 맞춤 자소서와 면접 리포트를 최신순으로 정리했습니다.
              </p>
            </div>

            <div className="grid gap-3">
              {activityItems.length > 0 ? (
                activityItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[34px_1fr] gap-3"
                  >
                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[14px] bg-blue-50 font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <div>
                      <div className="mb-1 text-[14px] font-black text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[12px] font-extrabold text-slate-400 dark:text-slate-500">
                        {item.meta} · {item.type}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-100 p-6 text-center text-[14px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  아직 저장된 활동 기록이 없습니다.
                  <br />
                  자소서 생성이나 면접 완료 후 이곳에 표시됩니다.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-[25px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-[18px]">
              <h2 className="mb-[6px] text-[21px] font-black text-slate-900 dark:text-white">
                다음 추천 액션
              </h2>
              <p className="text-[14px] text-slate-600 dark:text-slate-300">
                현재 상태 기준으로 가장 효과적인 다음 행동입니다.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                [
                  nextActionTitle,
                  nextActionDesc,
                  firstFavorite
                    ? `/fitting?company=${encodeURIComponent(
                        firstFavorite.company
                      )}`
                    : "/fitting",
                  firstFavorite ? "이어가기" : "추천 보기",
                ],
                [
                  "비즈니스 임팩트 문장 보완",
                  "기술 경험을 성과 중심 문장으로 재작성합니다.",
                  "/resume",
                  "수정하기",
                ],
                [
                  latestInterview
                    ? `${latestInterview.company} 면접 재도전`
                    : "실전 압박 면접 도전",
                  latestInterview
                    ? `최근 ${latestInterview.score}점 결과를 바탕으로 다시 훈련합니다.`
                    : "꼬리질문 대응을 실전처럼 훈련합니다.",
                  latestInterview
                    ? `/interview?company=${encodeURIComponent(
                        latestInterview.company
                      )}`
                    : "/interview",
                  "면접 시작",
                ],
              ].map(([title, desc, path, label]) => (
                <div
                  key={title}
                  className="flex items-center justify-between gap-[14px] rounded-[20px] border border-slate-200 bg-white p-[15px] dark:border-slate-700 dark:bg-slate-800"
                >
                  <div>
                    <strong className="mb-1 block text-[14px] text-slate-900 dark:text-white">
                      {title}
                    </strong>
                    <span className="text-[12px] font-extrabold text-slate-600 dark:text-slate-300">
                      {desc}
                    </span>
                  </div>
                  <Link
                    to={path}
                    className="rounded-full border border-blue-600 px-[15px] py-[9px] text-[13px] font-black text-blue-700 dark:text-blue-300"
                  >
                    {label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-[25px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-[18px]">
            <h2 className="mb-[6px] text-[21px] font-black text-slate-900 dark:text-white">
              데이터 보관함
            </h2>
            <p className="text-[14px] text-slate-600 dark:text-slate-300">
              생성한 이력서, 면접 리포트, 성장 진단 리포트를 한곳에서 관리합니다.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["resume", "맞춤형 이력서"],
              ["interview", "RAG 면접 리포트"],
              ["growth", "진단 및 보완 리포트"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-full border px-[14px] py-[10px] font-black ${
                  activeTab === key
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "resume" && (
            coverLetters.length > 0 ? (
              <div className="grid gap-3">
                {coverLetters.map((letter) => (
                  <article
                    key={letter.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-[10px] py-[6px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          맞춤 자소서
                        </span>
                        <span className="rounded-full bg-slate-100 px-[10px] py-[6px] text-[12px] font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                          {letter.company}
                        </span>
                      </div>

                      <h3 className="mb-2 text-[18px] font-black text-slate-900 dark:text-white">
                        {letter.title}
                      </h3>
                      <p className="line-clamp-2 break-keep text-[13px] font-extrabold leading-[1.65] text-slate-600 dark:text-slate-300">
                        {letter.motivation}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCoverLetter(letter)}
                        className="rounded-full border border-blue-600 px-[16px] py-[10px] text-[13px] font-black text-blue-700 dark:text-blue-300"
                      >
                        내용 보기
                      </button>
                      <Link
                        to={`/fitting?company=${encodeURIComponent(
                          letter.company
                        )}`}
                        className="rounded-full bg-blue-600 px-[16px] py-[10px] text-[13px] font-black text-white"
                      >
                        이어서 준비
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-100 p-7 text-center text-[14px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                저장된 맞춤 자소서가 없습니다.
                <br />
                커리어 피팅에서 맞춤 자소서를 생성해보세요.
              </div>
            )
          )}

          {activeTab === "interview" && (
            interviewResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {interviewResults.map((result) => (
                  <article
                    key={result.id || `${result.company}-${result.createdAt}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-[10px] py-[6px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          RAG 면접 리포트
                        </span>
                        <span className="rounded-full bg-slate-100 px-[10px] py-[6px] text-[12px] font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                          {formatDate(result.createdAt)}
                        </span>
                      </div>

                      <h3 className="mb-2 text-[18px] font-black text-slate-900 dark:text-white">
                        {result.company} {result.role} 면접 결과
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-[10px] py-[7px] text-[12px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          답변 {result.answeredCount ?? 0}개
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-[10px] py-[7px] text-[12px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          총 {result.questionCount ?? 5}문항
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-[10px] py-[7px] text-[12px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {result.difficulty || "실전 압박"}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-[190px] flex-col items-end gap-3">
                      <div className="text-right">
                        <span className="block text-[12px] font-black text-slate-400">
                          종합 점수
                        </span>
                        <strong className="text-[34px] font-black text-blue-700 dark:text-blue-300">
                          {result.score}점
                        </strong>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInterviewReport(result)}
                          className="rounded-full border border-blue-600 px-[16px] py-[10px] text-[13px] font-black text-blue-700 dark:text-blue-300"
                        >
                          내용 보기
                        </button>

                        <Link
                          to={`/interview?company=${encodeURIComponent(
                            result.company
                          )}`}
                          className="rounded-full bg-blue-600 px-[16px] py-[10px] text-[13px] font-black text-white"
                        >
                          다시 면접
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-100 p-7 text-center text-[14px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                저장된 면접 리포트가 없습니다.
                <br />
                면접을 완료하면 이곳에 자동으로 저장됩니다.
              </div>
            )
          )}

          {activeTab === "growth" && (
            <div className="grid gap-3">
              <article className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div>
                  <div className="mb-1 font-black text-slate-900 dark:text-white">
                    📈 포트폴리오 약점 진단 리포트
                  </div>
                  <div className="text-[13px] font-extrabold text-slate-600 dark:text-slate-300">
                    Redis 성과 표현 보완 권장 · 인프라 경험 보완 필요
                  </div>
                </div>
                <Link
                  to="/growth"
                  className="rounded-full bg-blue-600 px-[17px] py-[10px] text-[13px] font-black text-white"
                >
                  내용 보기
                </Link>
              </article>
            </div>
          )}
        </section>

        {selectedCoverLetter && (
          <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-900/55 p-6 backdrop-blur-md">
            <div className="w-full max-w-[720px] rounded-[30px] border border-slate-200 bg-white p-[28px] shadow-[0_28px_90px_rgba(15,23,42,0.28)] dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="mb-3 inline-flex rounded-full bg-blue-50 px-[12px] py-[7px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    맞춤 자소서 상세
                  </span>
                  <h3 className="text-[26px] font-black tracking-[-0.7px] text-slate-900 dark:text-white">
                    {selectedCoverLetter.company} 맞춤 자소서
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCoverLetter(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[16px] font-black text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 rounded-[22px] border border-slate-200 bg-slate-100 p-5 dark:border-slate-700 dark:bg-slate-800">
                <h4 className="mb-3 text-[15px] font-black text-blue-700 dark:text-blue-300">
                  지원 동기
                </h4>
                <p className="break-keep text-[14px] font-extrabold leading-[1.75] text-slate-600 dark:text-slate-300">
                  {selectedCoverLetter.motivation}
                </p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-100 p-5 dark:border-slate-700 dark:bg-slate-800">
                <h4 className="mb-3 text-[15px] font-black text-blue-700 dark:text-blue-300">
                  프로젝트 경험
                </h4>
                <p className="break-keep text-[14px] font-extrabold leading-[1.75] text-slate-600 dark:text-slate-300">
                  {selectedCoverLetter.project}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCoverLetter(null)}
                  className="rounded-full border border-slate-200 bg-white px-[18px] py-3 text-[14px] font-black text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  닫기
                </button>

                <Link
                  to={`/fitting?company=${encodeURIComponent(
                    selectedCoverLetter.company
                  )}`}
                  className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
                >
                  이 기업 준비 이어가기
                </Link>
              </div>
            </div>
          </div>
        )}

        {selectedInterviewReport && (
          <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-900/55 p-6 backdrop-blur-md">
            <div className="w-full max-w-[720px] rounded-[30px] border border-slate-200 bg-white p-[28px] shadow-[0_28px_90px_rgba(15,23,42,0.28)] dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="mb-3 inline-flex rounded-full bg-blue-50 px-[12px] py-[7px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    RAG 면접 상세 리포트
                  </span>
                  <h3 className="text-[26px] font-black tracking-[-0.7px] text-slate-900 dark:text-white">
                    {selectedInterviewReport.company} 면접 결과
                  </h3>
                  <p className="mt-2 text-[14px] font-extrabold text-slate-600 dark:text-slate-300">
                    {selectedInterviewReport.role} ·{" "}
                    {formatDate(selectedInterviewReport.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInterviewReport(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[16px] font-black text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="mb-5 grid grid-cols-[.75fr_1.25fr] gap-4">
                <div className="rounded-[24px] bg-blue-50 p-5 text-center dark:bg-blue-950">
                  <span className="mb-2 block text-[12px] font-black text-blue-700 dark:text-blue-300">
                    종합 점수
                  </span>
                  <strong className="text-[48px] font-black leading-none text-blue-700 dark:text-blue-300">
                    {selectedInterviewReport.score}
                  </strong>
                  <span className="ml-1 text-[15px] font-black text-blue-700 dark:text-blue-300">
                    점
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["답변 수", `${selectedInterviewReport.answeredCount ?? 0}개`],
                    ["질문 수", `${selectedInterviewReport.questionCount ?? 5}문항`],
                    ["난이도", selectedInterviewReport.difficulty || "실전 압박"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[20px] border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <span className="mb-2 block text-[12px] font-black text-slate-500 dark:text-slate-400">
                        {label}
                      </span>
                      <strong className="text-[18px] font-black text-slate-900 dark:text-white">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-4">
                <div className="rounded-[22px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="mb-3 text-[17px] font-black text-slate-900 dark:text-white">
                    강점
                  </h4>
                  <ul className="space-y-2 text-[13px] font-extrabold leading-[1.65] text-slate-600 dark:text-slate-300">
                    <li>· 질문 의도를 파악하고 답변을 구조화하려는 흐름이 좋습니다.</li>
                    <li>· 기술 선택의 이유를 설명하려는 시도가 확인됩니다.</li>
                    <li>· 기업 직무와 연결된 경험을 면접 답변으로 확장할 수 있습니다.</li>
                  </ul>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="mb-3 text-[17px] font-black text-slate-900 dark:text-white">
                    보완점
                  </h4>
                  <ul className="space-y-2 text-[13px] font-extrabold leading-[1.65] text-slate-600 dark:text-slate-300">
                    <li>· 성능 개선 수치와 비즈니스 효과를 더 구체화해야 합니다.</li>
                    <li>· 꼬리질문에서는 결론을 먼저 말하는 방식이 더 안정적입니다.</li>
                    <li>· 장애 상황, 우선순위 판단 기준을 사례 중심으로 보완하세요.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInterviewReport(null)}
                  className="rounded-full border border-slate-200 bg-white px-[18px] py-3 text-[14px] font-black text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  닫기
                </button>

                <Link
                  to={`/interview?company=${encodeURIComponent(
                    selectedInterviewReport.company
                  )}`}
                  className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
                >
                  이 기업으로 다시 면접 보기
                </Link>
              </div>
            </div>
          </div>
        )}

        {logoutOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/45 p-6 backdrop-blur-md">
            <div className="w-full max-w-[360px] rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_24px_70px_rgba(15,23,42,0.24)] dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-3 text-[20px] font-black tracking-[-0.3px] text-slate-900 dark:text-white">
                로그아웃
              </h3>
              <p className="mb-[22px] text-[15px] font-extrabold leading-[1.65] text-slate-600 dark:text-slate-300">
                정말 로그아웃 하시겠습니까?
              </p>

              <div className="flex justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setLogoutOpen(false)}
                  className="rounded-full border border-slate-200 bg-white px-[17px] py-[11px] text-[14px] font-black text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="rounded-full border border-blue-600 bg-blue-600 px-[17px] py-[11px] text-[14px] font-black text-white hover:bg-blue-700"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-7 right-7 z-[2300] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-black text-white transition-all dark:bg-white dark:text-slate-900 ${
            toast
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-5 opacity-0"
          }`}
        >
          {toast || "알림"}
        </div>
      </div>
    </AppLayout>
  );
}