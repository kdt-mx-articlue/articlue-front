import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";

const FAVORITE_KEYS = [
  "articlue_favorite_jobs",
  "favoriteJobs",
  "likedJobs",
  "articlueLikedJobs",
];

function applyDocumentTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
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
      if (Array.isArray(parsed) && parsed.length) {
        return normalizeJobs(parsed);
      }
    } catch {
      // ignore
    }
  }

  return [];
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

export default function MyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [favorites, setFavorites] = useState([]);
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

  const firstFavorite = favorites[0];

  const nextActionTitle = firstFavorite
    ? `${firstFavorite.company} 맞춤 자소서 작성`
    : "추천 기업 지원 전략 확인하기";

  const nextActionDesc = firstFavorite
    ? `${firstFavorite.company} ${firstFavorite.role} 공고를 기준으로 맞춤 자소서와 면접 질문을 연결합니다.`
    : "커리어 피팅에서 관심 기업을 찜하면 맞춤 지원 전략을 이어갈 수 있습니다.";

  const profileName =
    localStorage.getItem("articlue_profile_name") ||
    JSON.parse(localStorage.getItem("articlue_current_user") || "null")?.name ||
    "사용자";

  const refreshPageData = () => {
    setFavorites(readFavoriteJobs());
    setProfileImage(localStorage.getItem("articlue_profile_image") || "");
    setProgress(readProgress());
  };

  useEffect(() => {
    refreshPageData();

    const savedTheme = localStorage.getItem("articlue-theme") || "light";
    setTheme(savedTheme);
    applyDocumentTheme(savedTheme);

    const handleStorage = (event) => {
      if (
        FAVORITE_KEYS.includes(event.key) ||
        event.key === "articlue_resume_progress" ||
        event.key === "articlue_profile_image" ||
        event.key === "articlue_profile_name"
      ) {
        refreshPageData();
      }

      if (event.key === "articlue-theme") {
        const nextTheme = event.newValue || "light";
        setTheme(nextTheme);
        applyDocumentTheme(nextTheme);
      }
    };

    const handleFocus = () => refreshPageData();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

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
    localStorage.removeItem("articlue_current_user");
    localStorage.removeItem("isLogin");
    navigate("/login");
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
                      to="/fitting"
                      className="rounded-full bg-blue-600 px-[14px] py-[9px] text-[12px] font-black text-white"
                    >
                      맞춤 자소서 작성
                    </Link>
                    <Link
                      to="/interview"
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
                ["최근 면접 결과", "85점", null],
                ["추천 기업 적합도 평균", `${matchScore}%`, null],
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
                최근 생성·분석·면접 기록을 시간순으로 정리했습니다.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["1", "네이버웹툰 Backend 공고 분석 완료", "오늘 · JD 적합도 89%"],
                ["2", "RAG 실전 압박 면접 리포트 생성", "어제 · 종합 85점"],
                ["3", "Redis 성과 표현 보완 필요 진단", "2일 전 · 성장 진단"],
                ["4", "토스 맞춤형 자소서 초안 저장", "3일 전 · 맞춤 자소서"],
              ].map(([num, title, meta]) => (
                <div key={num} className="grid grid-cols-[34px_1fr] gap-3">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[14px] bg-blue-50 font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {num}
                  </div>
                  <div>
                    <div className="mb-1 text-[14px] font-black text-slate-900 dark:text-white">
                      {title}
                    </div>
                    <div className="text-[12px] font-extrabold text-slate-400 dark:text-slate-500">
                      {meta}
                    </div>
                  </div>
                </div>
              ))}
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
                  "/fitting",
                  firstFavorite ? "이어가기" : "추천 보기",
                ],
                [
                  "비즈니스 임팩트 문장 보완",
                  "기술 경험을 성과 중심 문장으로 재작성합니다.",
                  "/resume",
                  "수정하기",
                ],
                [
                  "실전 압박 면접 재도전",
                  "최근 면접 약점인 꼬리질문 대응을 다시 훈련합니다.",
                  "/interview",
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

          <div className="grid gap-3">
            {(activeTab === "resume"
              ? [
                  [
                    "[네이버웹툰] Backend 맞춤형 이력서",
                    "생성일: 2026.05.04 · 기업 인재상 맞춤 버전",
                  ],
                  [
                    "[토스] Server Developer 자소서 초안",
                    "생성일: 2026.05.02 · 서비스 운영 경험 강조 버전",
                  ],
                ]
              : activeTab === "interview"
              ? [
                  [
                    "💬 [토스] RAG 실전 면접 피드백 리포트",
                    "면접일: 2026.05.03 · 종합 점수 85점",
                  ],
                ]
              : [
                  [
                    "📈 포트폴리오 약점 진단 리포트",
                    "진단일: 2026.05.01 · Redis 성과 표현 보완 권장",
                  ],
                ]
            ).map(([title, meta]) => (
              <article
                key={title}
                className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <div className="mb-1 font-black text-slate-900 dark:text-white">
                    {title}
                  </div>
                  <div className="text-[13px] font-extrabold text-slate-600 dark:text-slate-300">
                    {meta}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("상세 화면은 추후 연동됩니다.")}
                  className="rounded-full bg-blue-600 px-[17px] py-[10px] text-[13px] font-black text-white"
                >
                  내용 보기
                </button>
              </article>
            ))}
          </div>
        </section>

        {logoutOpen && (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/45 p-6 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
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
          className={`fixed bottom-7 right-7 z-[2100] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-black text-white transition-all dark:bg-white dark:text-slate-900 ${
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