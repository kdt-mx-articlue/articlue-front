import { useEffect, useMemo, useState } from "react";
import "./MyPage.css";

const fallbackJobs = [
  {
    id: "naver-webtoon-backend",
    company: "네이버웹툰",
    role: "Backend Developer",
    match: "89%",
    desc: "대규모 트래픽 처리와 Redis 캐싱 경험을 강조하면 적합도가 높습니다.",
    stacks: ["Java", "Spring Boot", "Redis"],
  },
  {
    id: "toss-server",
    company: "토스",
    role: "Server Developer",
    match: "86%",
    desc: "결제/정산 도메인 이해와 장애 대응 경험을 비즈니스 성과로 정리해보세요.",
    stacks: ["Kotlin", "MSA", "MySQL"],
  },
  {
    id: "kakao-platform",
    company: "카카오",
    role: "Platform Engineer",
    match: "82%",
    desc: "API 안정성 개선 경험과 운영 자동화 경험을 중심으로 준비하면 좋습니다.",
    stacks: ["Cloud", "Docker", "Monitoring"],
  },
];

const favoriteKeys = [
  "articlue_favorite_jobs",
  "favoriteJobs",
  "likedJobs",
  "articlueLikedJobs",
];

const timelineItems = [
  { number: 1, title: "네이버웹툰 Backend 공고 분석 완료", meta: "오늘 · JD 적합도 89%" },
  { number: 2, title: "RAG 실전 압박 면접 리포트 생성", meta: "어제 · 종합 85점" },
  { number: 3, title: "Redis 성과 표현 보완 필요 진단", meta: "2일 전 · 성장 진단" },
  { number: 4, title: "토스 맞춤형 자소서 초안 저장", meta: "3일 전 · 맞춤 자소서" },
];

const resumeArchives = [
  {
    title: "[네이버웹툰] Backend 맞춤형 이력서",
    meta: "생성일: 2026.05.04 · 기업 인재상 맞춤 버전",
  },
  {
    title: "[토스] Server Developer 자소서 초안",
    meta: "생성일: 2026.05.02 · 서비스 운영 경험 강조 버전",
  },
];

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
  for (const key of favoriteKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return normalizeJobs(parsed);
      }
    } catch {
      // localStorage 값이 깨져 있으면 다음 key를 확인합니다.
    }
  }

  return fallbackJobs;
}

function getSafeProgress() {
  const raw =
    localStorage.getItem("articlue_resume_progress") ||
    localStorage.getItem("resumeProgress") ||
    "72";

  const score = Number(raw);
  if (!Number.isFinite(score)) return 72;

  return Math.max(0, Math.min(100, score));
}

export default function MyPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem("articlue-theme") || "light");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("resume");
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [profileScore, setProfileScore] = useState(72);
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState("사용자");

  const favoriteCount = favoriteJobs.length;

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__articlueToastTimer);
    window.__articlueToastTimer = window.setTimeout(() => setToast(""), 2300);
  };

  const syncPageData = () => {
    setFavoriteJobs(readFavoriteJobs());
    setProfileScore(getSafeProgress());
    setProfileImage(localStorage.getItem("articlue_profile_image") || "");

    try {
      const user = JSON.parse(localStorage.getItem("articlue_current_user") || "{}");
      setProfileName(user.name || localStorage.getItem("articlue_user_name") || "사용자");
    } catch {
      setProfileName(localStorage.getItem("articlue_user_name") || "사용자");
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("articlue-theme", theme);
  }, [theme]);

  useEffect(() => {
    syncPageData();

    const handleStorage = (event) => {
      if (favoriteKeys.includes(event.key) || event.key === "articlue_resume_progress") {
        syncPageData();
      }

      if (event.key === "articlue-theme") {
        setTheme(localStorage.getItem("articlue-theme") || "light");
      }
    };

    const handlePageShow = () => syncPageData();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pageshow", handlePageShow);
      window.clearTimeout(window.__articlueToastTimer);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setLogoutOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const profileInitial = useMemo(() => profileName.slice(0, 1) || "사", [profileName]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    showToast(nextTheme === "dark" ? "다크모드로 변경되었습니다." : "라이트모드로 변경되었습니다.");
  };

  const saveFavoriteJobs = (jobs) => {
    localStorage.setItem("articlue_favorite_jobs", JSON.stringify(jobs));
    setFavoriteJobs(jobs);
  };

  const removeFavorite = (id) => {
    const nextJobs = favoriteJobs.filter((job) => String(job.id) !== String(id));
    saveFavoriteJobs(nextJobs);
    showToast("찜한 공고에서 해제했습니다.");
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
      const imageData = String(reader.result || "");
      localStorage.setItem("articlue_profile_image", imageData);
      setProfileImage(imageData);
      showToast("프로필 이미지가 변경되었습니다.");
    };
    reader.readAsDataURL(file);
  };

  const resetProfileImage = () => {
    localStorage.removeItem("articlue_profile_image");
    setProfileImage("");
    showToast("기본 프로필 이미지로 변경되었습니다.");
  };

  const confirmLogout = () => {
    localStorage.removeItem("articlue_current_user");
    window.location.href = "login.html";
  };

  return (
    <>
      <nav className="sidebar">
        <a className="logo" href="index.html">Articlue.</a>
        <div className="nav-menu">
          <a href="index.html" className="nav-item">메인 홈</a>
          <a href="fitting.html" className="nav-item">커리어 피팅 & 맞춤 자소서</a>
          <a href="interview.html" className="nav-item">RAG 실전 면접 시뮬레이션</a>
          <a href="growth.html" className="nav-item">성장 진단 & 인사이트</a>
          <a href="mypage.html" className="nav-item active">마이 커리어 아카이브</a>
        </div>
      </nav>

      <main className="main">
        <header className="topbar">
          <h1>마이 커리어 아카이브</h1>
          <div className="top-actions">
            <div className="settings-wrap">
              <button
                className="settings-btn"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSettingsOpen((prev) => !prev);
                }}
              >
                ⚙ 설정
              </button>

              <div className={`settings-panel ${settingsOpen ? "show" : ""}`} aria-label="설정 메뉴">
                <div className="settings-title">설정</div>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <strong>화면 모드</strong>
                    <span>전체 페이지에 동일하게 적용됩니다.</span>
                  </div>
                  <button
                    className="mode-switch"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleTheme();
                    }}
                    aria-label="다크모드 전환"
                  >
                    <span className="mode-switch-thumb" />
                  </button>
                </div>

                <div className="settings-divider" />

                <button
                  className="settings-link"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSettingsOpen(false);
                    setLogoutOpen(true);
                  }}
                >
                  로그아웃 <span>›</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="content">
          <section className="hero">
            <div className="hero-copy">
              <h2>내 지원 준비 상태와 다음 액션을 한눈에 확인하세요.</h2>
              <p>
                찜한 기업 공고, 생성한 이력서, 면접 리포트, 성장 진단 결과를 연결해 지금 가장 먼저 해야 할 준비를 보여줍니다.
              </p>
              <div className="hero-actions">
                <a className="btn-primary" href="fitting.html">추천 기업 확인하기</a>
                <a className="btn-outline" href="growth.html">성장 진단 다시 보기</a>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-title">오늘의 커리어 상태</div>
              <div className="metric-row">
                <div className="metric-chip"><strong>{profileScore}%</strong><span>프로필 완성도</span></div>
                <div className="metric-chip"><strong>86%</strong><span>추천 적합도 평균</span></div>
                <div className="metric-chip"><strong>{favoriteCount}</strong><span>찜한 기업 공고</span></div>
              </div>
            </div>
          </section>

          <section className="grid top-grid">
            <div className="card">
              <div className="profile-card">
                <div
                  className={`profile-img ${profileImage ? "has-image" : ""}`}
                  style={profileImage ? { backgroundImage: `url("${profileImage}")` } : undefined}
                >
                  {profileInitial}
                </div>

                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfileImageChange}
                />

                <div>
                  <div className="profile-name">{profileName}</div>
                  <div className="profile-meta">신입 · Backend Developer · Java/Spring 중심</div>
                  <div className="profile-actions">
                    <button
                      className="btn-mini"
                      type="button"
                      onClick={() => document.getElementById("profileImageInput")?.click()}
                    >
                      프로필 사진 변경
                    </button>
                    <button className="btn-mini" type="button" onClick={resetProfileImage}>
                      기본 사진으로 되돌리기
                    </button>
                    <button className="btn-mini" type="button" onClick={() => { window.location.href = "resume.html"; }}>
                      이력서 수정
                    </button>
                  </div>
                </div>
              </div>

              <div className="status-grid">
                <div className="status-card">
                  <span>포트폴리오 완성도</span>
                  <strong>{profileScore}%</strong>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${profileScore}%` }} />
                  </div>
                </div>
                <div className="status-card">
                  <span>최근 AI 분석 상태</span>
                  <strong>보완 권장</strong>
                  <div className="progress-track"><div className="progress-fill" style={{ width: "64%" }} /></div>
                </div>
                <div className="status-card"><span>최근 면접 결과</span><strong>85점</strong></div>
                <div className="status-card"><span>추천 기업 적합도 평균</span><strong>86%</strong></div>
              </div>
            </div>

            <aside className="insight-card">
              <h2>기술 구현 설명은 충분하지만, 비즈니스 성과 연결이 부족합니다.</h2>
              <p>
                Redis 캐싱, API 최적화 경험은 강점입니다. 다만 채용 공고 기준으로는 트래픽 개선 수치, 비용 절감,
                사용자 경험 개선처럼 기업 관점의 성과 표현을 보완하면 추천 적합도가 더 올라갑니다.
              </p>
              <button className="btn-primary" type="button" onClick={() => { window.location.href = "growth.html"; }}>
                부족한 역량 보완하러 가기
              </button>
            </aside>
          </section>

          <section className="card favorite-section">
            <div className="section-head">
              <div>
                <h2>찜한 기업 공고</h2>
                <p>
                  커리어 피팅에서 찜한 기업 공고를 상단에서 바로 확인하고, 지원 전략·맞춤 자소서·면접 준비로 이어갈 수 있습니다.
                </p>
              </div>
              <div className="count-badge"><strong>{favoriteCount}</strong>개 찜</div>
            </div>

            {favoriteCount > 0 ? (
              <div className="favorite-list">
                {favoriteJobs.map((job) => (
                  <article className="favorite-card" key={job.id}>
                    <div className="favorite-top">
                      <div>
                        <div className="company">{job.company}</div>
                        <div className="role">{job.role}</div>
                      </div>
                      <span className="score">{job.match}</span>
                    </div>
                    <p className="job-desc">{job.desc}</p>
                    <div className="stack-wrap">
                      {job.stacks.slice(0, 3).map((stack) => (
                        <span className="stack" key={stack}>{stack}</span>
                      ))}
                    </div>
                    <div className="job-actions">
                      <button className="btn-primary" type="button" onClick={() => { window.location.href = "fitting.html"; }}>
                        지원 전략 이어가기
                      </button>
                      <button className="btn-outline" type="button" onClick={() => { window.location.href = "interview.html"; }}>
                        면접 질문 생성
                      </button>
                      <button className="btn-danger" type="button" onClick={() => removeFavorite(job.id)}>
                        보관 해제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                아직 찜한 기업 공고가 없습니다.
                <br />
                커리어 피팅 화면에서 관심 있는 기업을 저장해보세요.
              </div>
            )}
          </section>

          <section className="two-grid">
            <div className="card">
              <div className="section-head">
                <div>
                  <h2>최근 활동 타임라인</h2>
                  <p>최근 생성·분석·면접 기록을 시간순으로 정리했습니다.</p>
                </div>
              </div>
              <div className="timeline">
                {timelineItems.map((item) => (
                  <div className="timeline-item" key={item.number}>
                    <div className="timeline-icon">{item.number}</div>
                    <div>
                      <div className="timeline-title">{item.title}</div>
                      <div className="timeline-meta">{item.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-head">
                <div>
                  <h2>다음 추천 액션</h2>
                  <p>현재 상태 기준으로 가장 효과적인 다음 행동입니다.</p>
                </div>
              </div>
              <div className="action-list">
                <div className="action-item">
                  <div>
                    <strong>네이버웹툰 지원 전략 이어가기</strong>
                    <span>찜한 공고 기준 맞춤 자소서와 면접 질문을 연결합니다.</span>
                  </div>
                  <button className="btn-primary" type="button" onClick={() => { window.location.href = "fitting.html"; }}>
                    이어가기
                  </button>
                </div>
                <div className="action-item">
                  <div>
                    <strong>비즈니스 임팩트 문장 보완</strong>
                    <span>기술 경험을 성과 중심 문장으로 재작성합니다.</span>
                  </div>
                  <button className="btn-outline" type="button" onClick={() => { window.location.href = "resume.html"; }}>
                    수정하기
                  </button>
                </div>
                <div className="action-item">
                  <div>
                    <strong>실전 압박 면접 재도전</strong>
                    <span>최근 면접 약점인 꼬리질문 대응을 다시 훈련합니다.</span>
                  </div>
                  <button className="btn-outline" type="button" onClick={() => { window.location.href = "interview.html"; }}>
                    면접 시작
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="card data-archive-section">
            <div className="section-head">
              <div>
                <h2>데이터 보관함</h2>
                <p>생성한 이력서, 면접 리포트, 성장 진단 리포트를 한곳에서 관리합니다.</p>
              </div>
            </div>

            <div className="tabs">
              <button className={`tab-btn ${activeTab === "resume" ? "active" : ""}`} type="button" onClick={() => setActiveTab("resume")}>
                맞춤형 이력서
              </button>
              <button className={`tab-btn ${activeTab === "interview" ? "active" : ""}`} type="button" onClick={() => setActiveTab("interview")}>
                RAG 면접 리포트
              </button>
              <button className={`tab-btn ${activeTab === "growth" ? "active" : ""}`} type="button" onClick={() => setActiveTab("growth")}>
                진단 및 보완 리포트
              </button>
            </div>

            {activeTab === "resume" && (
              <div className="tab-content active">
                <div className="archive-list">
                  {resumeArchives.map((archive) => (
                    <article className="archive-item" key={archive.title}>
                      <div>
                        <div className="archive-title">{archive.title}</div>
                        <div className="archive-meta">{archive.meta}</div>
                      </div>
                      <div className="archive-actions">
                        <button className="btn-outline" type="button" onClick={() => showToast("이력서 미리보기 화면을 준비 중입니다.")}>
                          내용 보기
                        </button>
                        <button className="btn-primary" type="button" onClick={() => showToast("PDF 다운로드 기능은 추후 연동됩니다.")}>
                          PDF 다운로드
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "interview" && (
              <div className="tab-content active">
                <div className="archive-list">
                  <article className="archive-item">
                    <div>
                      <div className="archive-title">💬 [토스] RAG 실전 면접 피드백 리포트</div>
                      <div className="archive-meta">면접일: 2026.05.03 · 종합 점수 <span className="score">85점</span></div>
                    </div>
                    <div className="archive-actions">
                      <button className="btn-primary" type="button" onClick={() => showToast("상세 리포트 화면을 준비 중입니다.")}>
                        상세 리포트 보기
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            )}

            {activeTab === "growth" && (
              <div className="tab-content active">
                <div className="archive-list">
                  <article className="archive-item">
                    <div>
                      <div className="archive-title">📈 포트폴리오 약점 진단 리포트</div>
                      <div className="archive-meta">진단일: 2026.05.01 · Redis 성과 표현 보완 권장</div>
                    </div>
                    <div className="archive-actions">
                      <button className="btn-primary" type="button" onClick={() => { window.location.href = "growth.html"; }}>
                        진단 다시 보기
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <div
        className={`logout-modal-overlay ${logoutOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logoutModalTitle"
        onClick={(event) => {
          if (event.target === event.currentTarget) setLogoutOpen(false);
        }}
      >
        <div className="logout-modal">
          <h3 id="logoutModalTitle">로그아웃</h3>
          <p>정말 로그아웃 하시겠습니까?</p>
          <div className="logout-modal-actions">
            <button className="logout-cancel-btn" type="button" onClick={() => setLogoutOpen(false)}>
              취소
            </button>
            <button className="logout-confirm-btn" type="button" onClick={confirmLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className={`toast ${toast ? "show" : ""}`}>{toast || "알림"}</div>
    </>
  );
}
