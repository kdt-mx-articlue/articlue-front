import { useEffect, useState } from "react";
import "./Growth.css";

const THEME_KEY = "articlue-theme";

const navItems = [
  { label: "메인 홈", href: "index.html" },
  { label: "커리어 피팅 & 맞춤 자소서", href: "fitting.html" },
  { label: "RAG 실전 면접 시뮬레이션", href: "interview.html" },
  { label: "성장 진단 & 인사이트", href: "growth.html", active: true },
  { label: "마이 커리어 아카이브", href: "mypage.html" },
];

const summaryCards = [
  {
    label: "포트폴리오 완성도",
    badge: "보완 권장",
    badgeClass: "badge-warn",
    value: "72점",
    desc: "구현 내용은 충분하지만 문제 정의, 성능 개선 수치, 협업 과정 설명이 더 필요합니다.",
  },
  {
    label: "기업 JD 적합도",
    badge: "양호",
    badgeClass: "badge-good",
    value: "81%",
    desc: "백엔드 서버 설계와 API 경험은 직무 요구와 잘 맞습니다. 운영 경험을 추가하면 더 강해집니다.",
  },
  {
    label: "우선 보완 역량",
    badge: "긴급 보완",
    badgeClass: "badge-risk",
    value: "인프라·배포",
    desc: "Docker, AWS, CI/CD 경험이 약하게 드러나 백엔드 실무 투입 가능성 설득이 부족합니다.",
  },
];

const scoreRows = [
  { label: "서버 설계", score: 92 },
  { label: "API 구현", score: 86 },
  { label: "협업 문서화", score: 73 },
  { label: "비즈니스 표현", score: 64 },
  { label: "인프라 운영", score: 58 },
];

const weakCards = [
  {
    title: "인프라·배포 경험",
    badge: "긴급 보완",
    badgeClass: "badge-risk",
    desc: "Docker, AWS, CI/CD 키워드가 포트폴리오에 약하게 드러나 운영 가능한 백엔드 역량 설득이 부족합니다.",
    action: "배포 구조, 장애 대응, 자동화 파이프라인 경험을 3문장으로 추가하세요.",
  },
  {
    title: "비즈니스 임팩트 설명",
    badge: "보완 권장",
    badgeClass: "badge-warn",
    desc: "Redis 캐싱 경험은 있으나 트래픽 개선, 응답 속도, 사용자 경험 개선으로 연결되는 설명이 부족합니다.",
    action: "“문제 → 기술 선택 → 개선 결과” 구조로 프로젝트 문장을 재작성하세요.",
  },
  {
    title: "협업 과정 증명",
    badge: "유지 강화",
    badgeClass: "badge-good",
    desc: "협업 경험은 확인되지만 코드 리뷰, 이슈 관리, 문서화 방식이 더 구체적이면 신뢰도가 올라갑니다.",
    action: "GitHub Issue, PR, 회고 문서 등 협업 산출물을 연결하세요.",
  },
];

const roadmapCards = [
  { step: 1, title: "포트폴리오 문장 보강", desc: "기능 구현 중심 문장을 문제 해결 과정과 성과 중심 문장으로 바꿉니다." },
  { step: 2, title: "인프라 경험 추가", desc: "AWS 배포, Docker 컨테이너, CI/CD 자동화 흐름을 별도 항목으로 정리합니다." },
  { step: 3, title: "면접 답변으로 전환", desc: "보완된 경험을 바탕으로 압박 질문과 꼬리 질문에 대응할 답변을 생성합니다." },
];

function Growth() {
  const [toastMessage, setToastMessage] = useState("처리되었습니다.");
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        document.documentElement.setAttribute("data-theme", event.newValue || "light");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    window.setTimeout(() => setIsToastVisible(false), 2500);
  };

  const goToInterview = () => {
    window.location.href = "interview.html";
  };

  const goToFitting = () => {
    window.location.href = "fitting.html";
  };

  return (
    <div className="growth-page">
      <aside className="sidebar">
        <a className="logo" href="index.html">Articlue.</a>
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
          <h1>성장 진단 & 인사이트</h1>
        </header>

        <div className="container">
          <section className="hero">
            <div className="hero-copy">
              <h2>내 포트폴리오의 약점을 진단하고 합격 가능성을 높일 성장 루트를 확인하세요.</h2>
              <p>기술 스택과 프로젝트 경험을 기업 JD 기준으로 다시 해석해, 부족한 역량·보완 이유·다음 액션을 한 화면에서 정리합니다.</p>
              <div className="hero-actions">
                <button className="btn-primary" type="button" onClick={() => showToast("맞춤 보완 루트를 생성했습니다.")}>부족한 역량 보완하러 가기</button>
                <button className="btn-outline" type="button" onClick={goToInterview}>맞춤 면접 질문 생성하기</button>
              </div>
            </div>

            <div className="hero-panel">
              <div className="hero-panel-title">종합 성장 준비도</div>
              <div className="growth-score"><strong>72%</strong><span>보완 권장</span></div>
              <div className="track"><div className="fill" /></div>
              <p className="hero-note">서버 설계는 강점이지만 인프라 운영 경험과 비즈니스 성과 표현을 보완하면 추천 기업 적합도가 높아집니다.</p>
            </div>
          </section>

          <section className="summary-grid">
            {summaryCards.map((card) => (
              <article className="summary-card" key={card.label}>
                <div className="summary-top">
                  <span className="summary-label">{card.label}</span>
                  <span className={`summary-badge ${card.badgeClass}`}>{card.badge}</span>
                </div>
                <div className="summary-value">{card.value}</div>
                <p className="summary-desc">{card.desc}</p>
              </article>
            ))}
          </section>

          <section className="section-grid">
            <article className="card radar-card">
              <div className="section-head">
                <div>
                  <h3>역량별 진단 스코어</h3>
                  <p>기업 JD와 포트폴리오 키워드를 기준으로 강점과 취약점을 나눠 보여줍니다.</p>
                </div>
              </div>

              <div className="bar-list">
                {scoreRows.map((row) => (
                  <div className="bar-row" key={row.label}>
                    <span className="bar-label">{row.label}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${row.score}%` }} /></div>
                    <span className="bar-score">{row.score}</span>
                  </div>
                ))}
              </div>

              <div className="chart-note">가장 먼저 보완할 영역은 인프라 운영과 비즈니스 임팩트 설명입니다. 기술을 단순 나열하지 말고 결과와 수치로 연결하세요.</div>
            </article>

            <article className="card">
              <div className="section-head">
                <div>
                  <h3>우선순위 약점 진단</h3>
                  <p>부족한 이유와 바로 실행할 액션을 함께 제공합니다.</p>
                </div>
              </div>

              <div className="priority-list">
                {weakCards.map((card) => (
                  <div className="weak-card" key={card.title}>
                    <div className="weak-top">
                      <span className="weak-title">{card.title}</span>
                      <span className={`weak-chip ${card.badgeClass}`}>{card.badge}</span>
                    </div>
                    <p className="weak-desc">{card.desc}</p>
                    <div className="action-box"><span>액션:</span> {card.action}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="roadmap">
            {roadmapCards.map((card) => (
              <article className="roadmap-card" key={card.step}>
                <div className="roadmap-step">{card.step}</div>
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </article>
            ))}
          </section>

          <section className="feedback-card">
            <div className="section-head">
              <div>
                <h3>AI 성장 피드백</h3>
                <p>현재 진단 결과를 바탕으로 다음 행동을 선택하세요.</p>
              </div>
            </div>

            <div className="feedback-grid">
              <div className="feedback-box">
                <strong>포트폴리오 보완 제안</strong>
                <p>현재 프로젝트 설명은 기능 구현 중심입니다. 문제 해결 과정과 성능 개선 수치를 함께 작성하면 더 높은 평가를 받을 수 있습니다.</p>
              </div>
              <div className="feedback-box">
                <strong>추천 학습 방향</strong>
                <p>AWS 배포 경험과 Docker 기반 컨테이너 환경 구축 경험을 추가하면 백엔드 서버 직무 매칭률 향상에 도움이 됩니다.</p>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn-primary" type="button" onClick={() => showToast("맞춤 성장 루트를 저장했습니다.")}>부족한 역량 보완하러 가기</button>
              <button className="btn-outline" type="button" onClick={goToInterview}>맞춤 면접 질문 생성하기</button>
              <button className="btn-soft" type="button" onClick={goToFitting}>추천 기업 다시 확인하기</button>
            </div>
          </section>
        </div>
      </main>

      <div className={`toast ${isToastVisible ? "show" : ""}`}>{toastMessage}</div>
    </div>
  );
}

export default Growth;
