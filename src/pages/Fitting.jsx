import { useEffect, useMemo, useState } from "react";
import "./Fitting.css";

const THEME_KEY = "articlue-theme";
const FAVORITE_JOBS_KEY = "articlue_favorite_jobs";

const navItems = [
  { label: "메인 홈", href: "index.html" },
  { label: "규격화 이력서 작성", href: "resume.html" },
  { label: "커리어 피팅 & 맞춤 자소서", href: "fitting.html", active: true },
  { label: "RAG 실전 면접 시뮬레이션", href: "interview.html" },
  { label: "성장 진단 & 인사이트", href: "growth.html" },
  { label: "마이 커리어 아카이브", href: "mypage.html" },
];

const companies = [
  {
    id: "naver",
    logo: "NW",
    company: "네이버웹툰",
    role: "Backend Server Developer",
    match: "92%",
    reasons: [
      "Redis 캐싱 경험이 대용량 트래픽 처리 JD와 직접 연결됩니다.",
      "API 설계 경험이 백엔드 핵심 요구사항과 일치합니다.",
    ],
    stacks: ["Redis", "Spring Boot", "대용량 트래픽"],
    mutedStacks: ["Kafka"],
    favorite: {
      reason: "Redis 캐싱과 대용량 트래픽 처리 경험이 네이버웹툰 백엔드 JD와 높게 맞습니다.",
      desc: "대용량 트래픽 처리 경험과 Redis 캐싱 구조 경험이 JD 핵심 요구사항과 높은 연관성을 보입니다.",
      stacks: ["Java", "Spring Boot", "Redis", "Kafka"],
    },
    panel: {
      title: "네이버웹툰 준비하기",
      desc: "추천 근거를 바탕으로 자소서 초안과 면접 질문을 이어서 만들 수 있습니다.",
      previewTitle: "트래픽 문제를 해결한 백엔드 경험 강조",
      previewText:
        "Redis 캐싱 적용 경험을 단순 기술 나열이 아니라 응답 속도 개선, 서버 부하 완화, 사용자 경험 개선 관점으로 정리합니다.",
    },
    essay: {
      title: "네이버웹툰 맞춤 자소서",
      motivation:
        "대규모 트래픽 환경에서 안정적인 서버 구조를 고민해온 경험을 바탕으로 사용자 경험 개선에 기여하고 싶습니다.",
      project: "Redis 캐싱을 적용해 반복 조회 API 속도를 개선하고 DB 부하를 감소시킨 경험이 있습니다.",
    },
  },
  {
    id: "toss",
    logo: "TS",
    company: "토스",
    role: "Server Developer",
    match: "88%",
    reasons: [
      "서버 구조 개선 경험이 금융 서비스 안정성 요구와 맞닿아 있습니다.",
      "데이터 처리 경험이 결제 도메인의 신뢰성 기준과 연결됩니다.",
    ],
    stacks: ["Node.js", "MySQL", "성능 개선"],
    mutedStacks: ["MSA"],
    favorite: {
      reason: "서버 구조 개선과 데이터 처리 경험이 금융 서비스 안정성 요구와 연결됩니다.",
      desc: "서버 구조 개선 경험과 금융 서비스의 안정성 요구사항이 높은 관련성을 보입니다.",
      stacks: ["Node.js", "TypeScript", "MySQL", "MSA"],
    },
    panel: {
      title: "토스 준비하기",
      desc: "금융 서비스에서 중요한 안정성과 신뢰성을 중심으로 지원 전략을 구성합니다.",
      previewTitle: "안정적인 서버 구조 개선 경험 강조",
      previewText:
        "서버 구조 개선과 데이터 처리 경험을 결제 서비스의 안정성, 장애 예방, 응답 속도 개선 관점으로 정리합니다.",
    },
    essay: {
      title: "토스 맞춤 자소서",
      motivation: "금융 서비스에서 중요한 안정성과 확장성을 고려한 백엔드 개발 역량을 강화해왔습니다.",
      project: "Node.js 기반 서버 구조 개선과 MySQL 최적화를 통해 응답 속도를 개선한 경험이 있습니다.",
    },
  },
  {
    id: "kakao",
    logo: "KK",
    company: "카카오",
    role: "Platform Server Developer",
    match: "84%",
    reasons: [
      "REST API 설계 경험이 플랫폼 서버 개발 요구사항과 맞습니다.",
      "운영 개선 경험이 서비스 안정화 역량으로 해석됩니다.",
    ],
    stacks: ["Java", "REST API", "운영 개선"],
    mutedStacks: ["AWS"],
    favorite: {
      reason: "REST API 설계와 서비스 운영 개선 경험이 플랫폼 서버 개발 직무와 잘 맞습니다.",
      desc: "REST API 설계 경험과 서비스 운영 개선 경험이 공고 조건과 연결됩니다.",
      stacks: ["Java", "MySQL", "Kubernetes", "AWS"],
    },
    panel: {
      title: "카카오 준비하기",
      desc: "플랫폼 서버 개발에서 요구하는 API 설계와 운영 개선 역량을 중심으로 준비합니다.",
      previewTitle: "운영 가능한 API 설계 경험 강조",
      previewText:
        "REST API 설계 경험과 서비스 운영 개선 사례를 확장성, 유지보수성, 사용자 영향 관점으로 정리합니다.",
    },
    essay: {
      title: "카카오 맞춤 자소서",
      motivation: "사용자 중심 서비스 운영 경험을 바탕으로 안정적인 서버 개발을 수행하고 싶습니다.",
      project: "REST API 설계와 서비스 유지보수 과정에서 장애 대응 경험을 축적했습니다.",
    },
  },
];

function readFavoriteJobs() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_JOBS_KEY)) || [];
  } catch {
    return [];
  }
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5H18C18.8284 3.5 19.5 4.17157 19.5 5V20.5L12 16L4.5 20.5V5C4.5 4.17157 5.17157 3.5 6 3.5Z" />
    </svg>
  );
}

export default function Fitting() {
  const [selectedCompanyId, setSelectedCompanyId] = useState("naver");
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [essayCompanyId, setEssayCompanyId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || companies[0],
    [selectedCompanyId]
  );
  const essayCompany = useMemo(
    () => companies.find((company) => company.id === essayCompanyId),
    [essayCompanyId]
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setFavoriteJobs(readFavoriteJobs());

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        document.documentElement.setAttribute("data-theme", localStorage.getItem(THEME_KEY) || "light");
      }
      if (event.key === FAVORITE_JOBS_KEY) {
        setFavoriteJobs(readFavoriteJobs());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    window.clearTimeout(window.__articlueToastTimer);
    window.__articlueToastTimer = window.setTimeout(() => setToastMessage(""), 2400);
  };

  const handleContinueResume = () => {
    localStorage.setItem("articlue_resume_continue", "true");
  };

  const toggleFavoriteJob = (companyId) => {
    const targetCompany = companies.find((company) => company.id === companyId);
    if (!targetCompany) return;

    const exists = favoriteJobs.some((job) => job.id === companyId);
    const nextFavoriteJobs = exists
      ? favoriteJobs.filter((job) => job.id !== companyId)
      : [
          ...favoriteJobs,
          {
            id: targetCompany.id,
            reason: targetCompany.favorite.reason,
            company: targetCompany.company,
            role: targetCompany.role,
            match: targetCompany.match,
            desc: targetCompany.favorite.desc,
            stacks: targetCompany.favorite.stacks,
            savedAt: new Date().toISOString(),
          },
        ];

    setFavoriteJobs(nextFavoriteJobs);
    localStorage.setItem(FAVORITE_JOBS_KEY, JSON.stringify(nextFavoriteJobs));
    showToast(exists ? "찜한 공고에서 삭제되었습니다." : "마이 커리어 아카이브에 공고를 저장했습니다.");
  };

  const generateEssay = (companyId = selectedCompanyId) => {
    setSelectedCompanyId(companyId);
    setEssayCompanyId(companyId);
    showToast("AI 맞춤 자소서 생성이 완료되었습니다.");
  };

  const goInterview = (companyId = selectedCompanyId) => {
    setSelectedCompanyId(companyId);
    showToast("선택 기업 기준으로 면접 준비 화면으로 이동합니다.");
    window.setTimeout(() => {
      window.location.href = "interview.html";
    }, 650);
  };

  return (
    <>
      <aside className="sidebar">
        <a className="logo" href="index.html">
          Articlue.
        </a>
        <nav className="nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={item.active ? "active" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header>
          <h1>커리어 피팅 & 맞춤 자소서</h1>
        </header>

        <div className="container">
          <section className="hero">
            <div className="hero-copy">
              <h2>내 이력서와 가장 잘 맞는 기업을 확인하세요</h2>
              <p>
                기술 경험, JD 키워드, 포트폴리오 근거를 기준으로 추천 기업을 정렬했습니다. 기업을 선택하면
                맞춤 자소서와 실전 면접 준비까지 바로 이어집니다.
              </p>
              <div className="hero-actions">
                <a className="btn-primary" href="#recommendations">
                  추천 기업 보기
                </a>
                <a className="btn-outline" href="resume.html?continue=1" onClick={handleContinueResume}>
                  이력서 보완하기
                </a>
              </div>
            </div>

            <div className="hero-panel" aria-label="추천 요약">
              <div className="hero-panel-title">현재 최고 적합 기업</div>
              <div className="hero-stat">
                <div>
                  <strong>92%</strong>
                  <span>네이버웹툰 · Backend</span>
                </div>
              </div>
              <div className="hero-track">
                <div className="hero-fill" />
              </div>
              <div className="hero-tags">
                <span>Redis</span>
                <span>대용량 트래픽</span>
                <span>API 설계</span>
              </div>
            </div>
          </section>

          <div className="section-head" id="recommendations">
            <div>
              <h2>상위 추천 기업 3개</h2>
              <p>매칭률보다 중요한 것은 추천 근거입니다. 각 기업 카드에서 왜 추천됐는지 먼저 확인해보세요.</p>
            </div>
            <div className="filter-row" aria-label="추천 필터">
              <span className="chip active">적합도순</span>
              <span className="chip">백엔드</span>
              <span className="chip">자소서 가능</span>
            </div>
          </div>

          <section className="layout-grid">
            <div className="company-list">
              {companies.map((company) => {
                const isSelected = selectedCompanyId === company.id;
                const isFavorite = favoriteJobs.some((job) => job.id === company.id);

                return (
                  <article
                    key={company.id}
                    className={`company-card${isSelected ? " selected" : ""}`}
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <div className="company-top">
                      <div className="company-logo">{company.logo}</div>
                      <div>
                        <div className="company-name">{company.company}</div>
                        <div className="company-role">{company.role}</div>
                      </div>
                      <div>
                        <div className="match-score">{company.match}</div>
                        <div className="match-caption">직무 적합도</div>
                      </div>
                    </div>

                    <div className="reason-box">
                      <strong>왜 추천됐나요?</strong>
                      <ul className="reason-list">
                        {company.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="stack-wrap">
                      {company.stacks.map((stack) => (
                        <span key={stack} className="stack">
                          {stack}
                        </span>
                      ))}
                      {company.mutedStacks.map((stack) => (
                        <span key={stack} className="stack muted">
                          {stack}
                        </span>
                      ))}
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          generateEssay(company.id);
                        }}
                      >
                        맞춤 자소서 생성
                      </button>
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          goInterview(company.id);
                        }}
                      >
                        실전 면접 준비
                      </button>
                      <button
                        className={`bookmark-btn${isFavorite ? " active" : ""}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavoriteJob(company.id);
                        }}
                        aria-label={`${company.company} 공고 찜하기`}
                      >
                        <BookmarkIcon />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="side-panel" aria-label="선택 기업 준비 패널">
              <h3>{selectedCompany.panel.title}</h3>
              <p>{selectedCompany.panel.desc}</p>

              <div className="preview-card">
                <div className="preview-label">맞춤 자소서 방향</div>
                <div className="preview-title">{selectedCompany.panel.previewTitle}</div>
                <p className="preview-text">{selectedCompany.panel.previewText}</p>
              </div>

              <div className="flow-steps">
                <div className="flow-step">
                  <span>1</span>
                  <strong>기업 선택</strong>
                </div>
                <div className="flow-step">
                  <span>2</span>
                  <strong>자소서 생성</strong>
                </div>
                <div className="flow-step">
                  <span>3</span>
                  <strong>면접 대비</strong>
                </div>
              </div>

              <div className="side-actions">
                <button className="btn-primary" type="button" onClick={() => generateEssay()}>
                  자소서 생성
                </button>
                <button className="btn-outline" type="button" onClick={() => goInterview()}>
                  면접 준비
                </button>
              </div>
            </aside>
          </section>
        </div>
      </main>

      {essayCompany && (
        <div className="essay-modal show">
          <div className="essay-content">
            <div className="essay-top">
              <h3>{essayCompany.essay.title}</h3>
              <button className="close-btn" onClick={() => setEssayCompanyId(null)} aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="essay-box">
              <strong>지원 동기</strong>
              <p>{essayCompany.essay.motivation}</p>
            </div>
            <div className="essay-box">
              <strong>프로젝트 경험</strong>
              <p>{essayCompany.essay.project}</p>
            </div>
            <div className="essay-actions">
              <button className="btn-primary" onClick={() => showToast("자소서가 마이 커리어 아카이브에 저장되었습니다.")}>자소서 저장</button>
              <button className="btn-outline" onClick={() => setEssayCompanyId(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast${toastMessage ? " show" : ""}`}>{toastMessage || "처리되었습니다."}</div>
    </>
  );
}
