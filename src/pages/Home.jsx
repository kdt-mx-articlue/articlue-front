import { useEffect, useState } from "react";
import "./Home.css";

const THEME_KEY = "articlue-theme";
const LEGACY_THEME_KEY = "articlue_theme";

const navItems = [
  { label: "메인 홈", href: "/", active: true },
  { label: "규격화 이력서 작성", href: "/resume" },
  { label: "커리어 피팅 & 맞춤 자소서", href: "/fitting" },
  { label: "RAG 실전 면접 시뮬레이션", href: "/interview" },
  { label: "성장 진단 & 인사이트", href: "/growth" },
  { label: "마이 커리어 아카이브", href: "/mypage" },
];

const recommendedCompanies = [
  {
    logo: "NW",
    name: "네이버웹툰 · Backend",
    keywords: "Redis · 대용량 트래픽 · API 설계",
    score: "92%",
  },
  {
    logo: "TS",
    name: "토스 · Server",
    keywords: "결제 안정성 · 데이터 처리 · 성능 개선",
    score: "88%",
  },
  {
    logo: "KK",
    name: "카카오 · Platform",
    keywords: "분산 시스템 · 백엔드 운영 · 모니터링",
    score: "84%",
  },
];

const serviceSteps = [
  {
    number: 1,
    title: "이력서 작성",
    description: "기술 경험과 프로젝트 성과를 구조화합니다.",
    linkLabel: "작성하러 가기 →",
    href: "/resume?continue=1",
    isResumeContinue: true,
  },
  {
    number: 2,
    title: "기업 추천",
    description: "JD와 포트폴리오를 비교해 적합 기업을 찾습니다.",
    linkLabel: "추천 보기 →",
    href: "/fitting",
  },
  {
    number: 3,
    title: "자소서 변환",
    description: "기술 중심 문장을 기업 관점의 성과 언어로 정리합니다.",
    linkLabel: "변환하기 →",
    href: "/fitting",
  },
  {
    number: 4,
    title: "RAG 실전 면접 시뮬레이션",
    description: "추천 기업 기준으로 꼬리 질문과 답변 방향을 제공합니다.",
    linkLabel: "연습하기 →",
    href: "/interview",
  },
];

function getStoredResumeProgress() {
  const raw = localStorage.getItem("articlue_resume_progress");
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed >= 0) {
    return Math.min(100, Math.max(0, parsed));
  }

  return 68;
}

function getStoredFavoriteCount() {
  try {
    const favorites = JSON.parse(localStorage.getItem("articlue_favorite_jobs") || "[]");
    return Array.isArray(favorites) ? favorites.length : 0;
  } catch {
    return 0;
  }
}

export default function Home() {
  const [progress, setProgress] = useState(68);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [userGreeting, setUserGreeting] = useState("오늘의 커리어 액션을 확인하세요");
  const [showImproveBanner, setShowImproveBanner] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const savedProgress = getStoredResumeProgress();
    setProgress(savedProgress);
    setFavoriteCount(getStoredFavoriteCount());

    const userName = localStorage.getItem("articlue_user_name") || localStorage.getItem("userName") || "";
    if (userName) {
      setUserGreeting(`${userName} 님, 오늘의 커리어 액션을 확인하세요`);
    }

    setShowImproveBanner(
      savedProgress < 80 && localStorage.getItem("articlue_hide_resume_banner") !== "true",
    );

    const handleStorageChange = (event) => {
      if (event.key === THEME_KEY || event.key === LEGACY_THEME_KEY) {
        const nextTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || "light";
        document.documentElement.setAttribute("data-theme", nextTheme);
      }

      if (event.key === "articlue_resume_progress") {
        const nextProgress = getStoredResumeProgress();
        setProgress(nextProgress);
        setShowImproveBanner(
          nextProgress < 80 && localStorage.getItem("articlue_hide_resume_banner") !== "true",
        );
      }

      if (event.key === "articlue_favorite_jobs") {
        setFavoriteCount(getStoredFavoriteCount());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleResumeContinue = () => {
    localStorage.setItem("articlue_resume_continue", "true");
  };

  const handleRecommendationViewed = () => {
    localStorage.setItem("articlue_recommendation_entry", "main_home");
  };

  const handleCloseBanner = () => {
    localStorage.setItem("articlue_hide_resume_banner", "true");
    setShowImproveBanner(false);
  };

  return (
    <div className="home-page">
      <aside className="sidebar">
        <a className="logo" href="/">
          Articlue.
        </a>
        <nav className="nav-menu" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={`nav-item${item.active ? " active" : ""}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>메인 홈</h1>
          <div className="header-meta">
            <span>{userGreeting}</span>
          </div>
        </header>

        <section className="content">
          {showImproveBanner && (
            <div className="resume-improve-banner show">
              <div className="resume-improve-copy">
                <strong>이력서를 조금 더 채우면 추천 정확도가 높아져요.</strong>
                <p>현재 입력된 기술 경험을 기준으로 추천은 가능하지만, 프로젝트 성과와 역할을 추가하면 더 정밀하게 매칭됩니다.</p>
              </div>
              <div className="resume-improve-actions">
                <a className="btn-outline" href="/resume?continue=1" onClick={handleResumeContinue}>
                  이력서 보완하기
                </a>
                <button className="banner-close" type="button" onClick={handleCloseBanner} aria-label="추천 정확도 안내 닫기">
                  ×
                </button>
              </div>
            </div>
          )}

          <section className="hero">
            <div className="hero-copy">
              <h2>
                <span className="hero-title-line">오늘 기준으로</span>
                <span className="hero-title-line">지원 가능성이 높은</span>
                <span className="hero-title-line">기업을 확인해보세요</span>
              </h2>
              <p>이력서 완성도와 기술 경험을 바탕으로 맞춤 기업을 추천하고, 자소서와 실전 면접 준비까지 한 흐름으로 이어줍니다.</p>
              <div className="hero-actions">
                <a className="btn-primary" href="/fitting" onClick={handleRecommendationViewed}>
                  오늘의 추천 기업 확인하기
                </a>
                <a className="btn-outline" href="/resume?continue=1" onClick={handleResumeContinue}>
                  이력서 완성도 높이기
                </a>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-title">현재 추천 준비도</div>
              <div className="score-row">
                <strong>{progress}%</strong>
                <span>이력서 기반</span>
              </div>
              <div className="score-track">
                <div className="score-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="panel-note">프로젝트 성과와 사용 기술을 더 구체화하면 추천 기업과 면접 질문의 정확도가 함께 올라갑니다.</p>
            </div>
          </section>

          <section className="dashboard-grid">
            <article className="card accuracy-card">
              <div className="accuracy-copy">
                <h3>추천 정확도</h3>
                <p className="card-desc">이력서를 조금 더 작성하면 기업 추천 품질이 올라갑니다.</p>
              </div>
              <div
                className="circle"
                style={{ background: `conic-gradient(var(--blue-500) 0 ${progress}%, var(--surface-soft) ${progress}% 100%)` }}
              >
                <div className="circle-inner">
                  <strong>{progress}%</strong>
                  <span>프로필 완성도</span>
                </div>
              </div>
              <div className="accuracy-note">
                <span />프로젝트 성과를 추가하면 더 정밀해져요
              </div>
              <div className="accuracy-list">
                <div className="accuracy-item"><span>기본 정보</span><strong>완료</strong></div>
                <div className="accuracy-item"><span>프로젝트</span><strong>보완 필요</strong></div>
                <div className="accuracy-item"><span>기술 스택</span><strong>양호</strong></div>
              </div>
            </article>

            <article className="card">
              <div className="card-head">
                <div>
                  <h3>오늘의 추천 기업</h3>
                  <p className="card-desc">현재 프로필 기준으로 적합도가 높은 기업입니다.</p>
                </div>
                <a className="step-link" href="/fitting">전체 보기 →</a>
              </div>

              <div className="company-list">
                {recommendedCompanies.map((company) => (
                  <a className="company-card" href="/fitting" key={company.name}>
                    <div className="company-logo">{company.logo}</div>
                    <div className="company-info">
                      <strong>{company.name}</strong>
                      <span>{company.keywords}</span>
                    </div>
                    <div className="match-score">{company.score}</div>
                  </a>
                ))}
              </div>

              <div className="chip-row">
                <span className="chip">추천 근거 4개 일치</span>
                <span className="chip">자소서 생성 가능</span>
                <span className="chip">면접 대비 가능</span>
              </div>
            </article>
          </section>

          <section className="step-grid">
            {serviceSteps.map((step) => (
              <article className="step-card" key={step.number}>
                <div className="step-number">{step.number}</div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                <a className="step-link" href={step.href} onClick={step.isResumeContinue ? handleResumeContinue : undefined}>
                  {step.linkLabel}
                </a>
              </article>
            ))}
          </section>

          <section className="sub-grid">
            <article className="mini-stat">
              <span>찜한 기업 공고</span>
              <strong>{favoriteCount}개</strong>
              <p>관심 기업은 마이 커리어 아카이브에서 다시 확인할 수 있습니다.</p>
            </article>
            <article className="mini-stat">
              <span>최근 면접 준비</span>
              <strong>Backend</strong>
              <p>네이버웹툰 실무진 면접 기준 질문이 준비되어 있습니다.</p>
            </article>
            <article className="mini-stat">
              <span>다음 추천 액션</span>
              <strong>프로젝트 성과 보완</strong>
              <p>숫자 기반 성과를 추가하면 매칭률이 더 명확해집니다.</p>
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}
