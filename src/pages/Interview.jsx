import { useEffect, useMemo, useRef, useState } from "react";
import "./Interview.css";

const companies = [
  "네이버웹툰 - Backend",
  "토스 - Node.js Developer",
  "카카오 - Server Developer",
];

const portfolios = ["백엔드_프로젝트_최종.pdf", "이력서_최종.pdf", "포트폴리오_v2.pdf"];
const difficulties = ["일반 핏 인터뷰", "실전 압박"];
const questionCounts = ["3개", "5개", "7개"];
const personas = ["실무진", "임원진"];

function splitCompany(value) {
  const [companyName, roleName = "Developer"] = value.split(" - ");
  return { companyName, roleName };
}

export default function Interview() {
  const [theme, setTheme] = useState(() => localStorage.getItem("articlue-theme") || "light");
  const [company, setCompany] = useState(companies[0]);
  const [portfolio, setPortfolio] = useState(portfolios[0]);
  const [difficulty, setDifficulty] = useState("실전 압박");
  const [questionCount, setQuestionCount] = useState("5개");
  const [persona, setPersona] = useState("실무진");
  const [view, setView] = useState("setup");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isInterviewReady, setIsInterviewReady] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(null);
  const [remaining, setRemaining] = useState(90);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState("");
  const chatWindowRef = useRef(null);

  const settings = useMemo(() => {
    const { companyName, roleName } = splitCompany(company);
    const countNumber = parseInt(questionCount, 10) || 5;
    const timeText = countNumber <= 3 ? "약 5~7분" : countNumber >= 7 ? "약 12~15분" : "약 8~10분";
    return { company, portfolio, difficulty, persona, questionCount, countNumber, timeText, companyName, roleName };
  }, [company, portfolio, difficulty, persona, questionCount]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("articlue-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isInterviewReady) return;
    const timerId = setInterval(() => {
      setRemaining((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [isInterviewReady]);

  useEffect(() => {
    if (chatWindowRef.current) chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  const timerPercent = Math.max((remaining / 90) * 100, 0);
  const timerText = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  function showToast(message) {
    setToast(message);
  }

  function resetInterviewSettings() {
    setCompany(companies[0]);
    setPortfolio(portfolios[0]);
    setDifficulty("실전 압박");
    setQuestionCount("5개");
    setPersona("실무진");
    showToast("면접 조건을 기본값으로 초기화했습니다.");
  }

  function showPreparationSummary() {
    setView("summary");
    showToast("면접 준비 요약을 확인해 주세요.");
  }

  function focusSettingCard() {
    setView("setup");
    showToast("면접 조건을 다시 수정할 수 있습니다.");
  }

  function startInterview() {
    setInterviewStarted(true);
    setIsInterviewReady(false);
    setCurrentQuestion(1);
    setRemaining(90);
    setMessages([]);
    setAnalysisStep("entering");
    showToast("AI 면접관을 준비 중입니다.");

    setTimeout(() => {
      setAnalysisStep("analyzing");
    }, 1200);

    setTimeout(() => {
      setAnalysisStep(null);
      setIsInterviewReady(true);
      showToast("면접이 시작되었습니다.");
    }, 2800);
  }

  function endInterview() {
    const ok = window.confirm("면접을 종료하고 리포트를 생성하시겠습니까?");
    if (!ok) return;
    setIsInterviewReady(false);
    setAnalysisStep("report");
    showToast("면접 리포트를 생성 중입니다.");
    setTimeout(() => {
      window.location.href = "growth.html";
    }, 1400);
  }

  function sendAnswer() {
    const text = answer.trim();
    if (!isInterviewReady) {
      showToast("먼저 면접을 시작해 주세요.");
      return;
    }
    if (!text) {
      showToast("답변을 입력해 주세요.");
      return;
    }

    setMessages((prev) => [...prev, { type: "user", text }]);
    setAnswer("");
    showToast("답변이 전송되었습니다.");

    setTimeout(() => {
      setCurrentQuestion((value) => Math.min(value + 1, settings.countNumber));
      setRemaining(90);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "방금 답변에서 비용과 안정성의 균형을 언급하셨습니다. 그렇다면 사용자 경험을 해치지 않는 선에서 어떤 데이터를 먼저 캐시에서 제거할지 판단하는 기준은 무엇인가요?",
          source: "[DBR] 플랫폼 비즈니스의 서버 비용 최적화 전략 · 2026.04.12",
        },
      ]);
    }, 900);
  }

  const questionProgressLabel = !isInterviewReady
    ? analysisStep === "analyzing"
      ? "RAG 근거 분석 중"
      : analysisStep
        ? "면접관 입장 중"
        : "답변 준비 단계"
    : messages.at(-1)?.type === "user"
      ? "답변 분석 중"
      : currentQuestion > 1
        ? "꼬리질문 응답 단계"
        : "답변 준비 단계";

  return (
    <>
      {!interviewStarted && (
        <section id="startPage" className="interview-start-page">
          <header className="start-topbar">
            <a className="start-logo" href="index.html">Articlue.</a>
          </header>

          <main className="interview-setup-shell">
            <nav className="setup-stepper" aria-label="면접 진행 단계">
              <div className={`step ${view === "setup" ? "active" : ""}`}><span>1</span><strong>조건 설정</strong></div>
              <div className="step-line" />
              <div className={`step ${view === "summary" ? "active" : ""}`}><span>2</span><strong>요약 확인</strong></div>
              <div className="step-line" />
              <div className="step"><span>3</span><strong>면접 준비</strong></div>
              <div className="step-line" />
              <div className="step"><span>4</span><strong>면접 진행</strong></div>
              <div className="step-line" />
              <div className="step"><span>5</span><strong>결과 확인</strong></div>
            </nav>

            {view === "setup" && (
              <section className="setup-view">
                <div className="setting-card setup-panel">
                  <h1>면접 조건을 설정하세요.</h1>
                  <p className="panel-desc">기업, 포트폴리오, 난이도, 질문 수, 면접관 페르소나를 먼저 설정하세요. 설정을 마치면 다음 단계에서 면접 준비 요약을 별도 화면으로 확인합니다.</p>

                  <SelectField label="타겟 기업 선택" value={company} onChange={setCompany} options={companies} />
                  <SelectField label="포트폴리오 연동" value={portfolio} onChange={setPortfolio} options={portfolios} />
                  <RadioGroup label="면접 난이도" options={difficulties} value={difficulty} onChange={setDifficulty} />
                  <RadioGroup label="면접 질문 수" options={questionCounts} value={questionCount} onChange={setQuestionCount} columns="three" />
                  <RadioGroup label="면접관 페르소나" options={personas} value={persona} onChange={setPersona} />

                  <div className="setup-actions">
                    <button className="btn-outline" type="button" onClick={resetInterviewSettings}>초기화</button>
                    <button className="btn-primary" type="button" onClick={showPreparationSummary}>설정 완료 후 준비 요약 확인 →</button>
                  </div>
                </div>
              </section>
            )}

            {view === "summary" && (
              <section className="summary-view show" aria-live="polite">
                <aside className="summary-panel pulse">
                  <div className="summary-head">
                    <div>
                      <h2>면접 준비 요약</h2>
                      <p>설정한 조건을 기준으로 실전 면접이 구성됩니다. 내용을 확인한 뒤 AI 면접관 입장하기를 눌러주세요.</p>
                    </div>
                  </div>
                  <div className="summary-list">
                    <SummaryRow icon="🏢" label="기업" value={settings.companyName} />
                    <SummaryRow icon="💼" label="지원 직무" value={settings.roleName} />
                    <SummaryRow icon="📄" label="포트폴리오" value={settings.portfolio} />
                    <SummaryRow icon="🛡️" label="면접 난이도" value={settings.difficulty} />
                    <SummaryRow icon="👤" label="면접관 페르소나" value={settings.persona} />
                    <SummaryRow icon="❓" label="질문 구성" value={`총 ${settings.countNumber}문항 · 꼬리질문 포함`} />
                    <SummaryRow icon="⏱️" label="예상 소요 시간" value={settings.timeText} />
                    <SummaryRow icon="✅" label="평가 기준" value="기술 정확도, 문제 해결 과정, 비즈니스 임팩트, 커뮤니케이션" criteria />
                  </div>
                  <div className="summary-actions">
                    <button className="btn-primary" type="button" onClick={startInterview}>AI 면접관 입장하기</button>
                    <button className="btn-outline" type="button" onClick={focusSettingCard}>설정 다시 수정하기</button>
                  </div>
                </aside>
              </section>
            )}
          </main>
        </section>
      )}

      {interviewStarted && (
        <div id="interviewPage" className="interview-page" style={{ display: "flex" }}>
          <header className="topbar">
            <div className="topbar-left">
              <a className="logo" href="index.html">Articlue.</a>
              <div className="interview-title">[{settings.companyName}] - {settings.roleName} {settings.difficulty} 면접</div>
            </div>
            <div className="topbar-right">
              <button className="btn-danger end-interview-btn" type="button" onClick={endInterview}>면접 종료</button>
            </div>
          </header>

          {analysisStep && (
            <div className="analysis-overlay show">
              <div className="analysis-card">
                <div className="analysis-loader" aria-hidden="true" />
                <h2>{analysisStep === "report" ? "면접 답변을 종합 분석 중입니다" : analysisStep === "analyzing" ? "기업 JD와 포트폴리오를 분석 중입니다" : "AI 면접관이 입장하고 있습니다"}</h2>
                <p>{analysisStep === "report" ? "기술 정확도, 비즈니스 핏, 커뮤니케이션 논리성을 기준으로 리포트를 생성하고 있습니다." : analysisStep === "analyzing" ? "선택한 기업, 직무 요구사항, 포트폴리오 내용을 기준으로 첫 질문과 RAG 근거를 준비하고 있습니다." : "선택한 면접 조건을 확인하고 실전 면접 환경을 구성하는 중입니다."}</p>
              </div>
            </div>
          )}

          <main className="layout">
            <section className="chat-area">
              <div className="interview-status">
                <div className="status-left">
                  <strong>{isInterviewReady ? `${settings.difficulty} 면접 진행 중` : `${settings.difficulty} 면접 진행 전`}</strong>
                  <p>{settings.company}, {settings.portfolio}, {settings.persona} 면접관 기준으로 질문이 생성됩니다.</p>
                  <div className="question-progress">{currentQuestion} / {settings.countNumber} 질문 진행 중 · {questionProgressLabel}</div>
                </div>
                <div className="timer-box">
                  <div className="timer-label">답변 제한 시간</div>
                  <div className="timer" style={{ color: remaining <= 20 ? "var(--red-500)" : "var(--blue-500)" }}>{timerText}</div>
                  <TimerBar percent={timerPercent} />
                </div>
              </div>

              <div ref={chatWindowRef} className="chat-window">
                <div className="typing">기업 JD와 포트폴리오를 분석 중입니다...</div>
                <BotMessage speaker={`${settings.companyName} ${settings.persona} 면접관`} text="Redis를 도입하셨는데, 메모리 초과(OOM) 발생 시 어떤 비즈니스적 기준을 세워 데이터를 삭제(Eviction)하셨나요?" source="[동아일보] 글로벌 서비스 트래픽 폭주와 캐시 전략 변화 분석 · 2026.04.10" />
                <div className="thinking-card">첫 질문을 확인한 뒤 30초 동안 핵심 근거를 정리해 보세요. 준비가 되면 바로 답변을 입력하면 됩니다.</div>
                <div className="hint-box">답변 방향이 어렵다면 30초 후 힌트를 확인할 수 있습니다.<button type="button" onClick={() => showToast("답변 가이드 힌트가 열렸습니다.")}>답변 가이드 힌트 보기</button></div>
                {messages.map((message, index) => message.type === "user" ? <UserMessage key={index} text={message.text} /> : <BotMessage key={index} speaker={`${settings.companyName} ${settings.persona} 면접관`} text={message.text} source={message.source} />)}
              </div>

              <div className="input-panel">
                <div className="answer-timer">
                  <div className="answer-timer-top"><span>답변 타이머</span><span>제한 시간 내 핵심 근거를 중심으로 답변하세요</span></div>
                  <TimerBar percent={timerPercent} />
                </div>
                <div className="input-row">
                  <div className="input-tools" aria-label="답변 보조 기능">
                    <InputTool label="파일 첨부" icon="📎" onClick={() => showToast("서류 업로드 기능은 추후 연동됩니다.")} />
                    <InputTool label="음성 입력" icon="🎙️" onClick={() => showToast("마이크 입력 기능은 추후 연동됩니다.")} />
                    <InputTool label="힌트 보기" icon="💡" onClick={() => showToast("답변 가이드 힌트가 열렸습니다.")} />
                  </div>
                  <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="답변을 입력하세요. Enter는 줄바꿈, 전송 버튼 클릭 시 답변이 제출됩니다." />
                  <button className="btn-primary send-answer-btn" type="button" onClick={sendAnswer}>답변 전송 <span aria-hidden="true">➤</span></button>
                </div>
              </div>
            </section>
          </main>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`}>{toast || "저장되었습니다."}</div>
    </>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange, columns }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className={`radio-row ${columns || ""}`}>
        {options.map((option) => (
          <button key={option} className={`radio-card ${value === option ? "active" : ""}`} type="button" onClick={() => onChange(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, criteria }) {
  return (
    <div className={`summary-row ${criteria ? "criteria" : ""}`}>
      <span className="summary-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TimerBar({ percent }) {
  return <div className="timer-bar"><div className="timer-fill" style={{ width: `${percent}%` }} /></div>;
}

function BotMessage({ speaker, text, source }) {
  return (
    <div className="message-row">
      <div className="avatar">AI</div>
      <div className="bubble-wrap">
        <div className="speaker">{speaker}</div>
        <div className="bubble bot-bubble">{text}</div>
        {source && <div className="source-box"><strong>RAG 근거</strong><br />{source}<br /><button className="btn-outline" type="button" style={{ marginTop: 8, padding: "7px 12px" }}>원문 보기 ↗</button></div>}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="message-row user-row">
      <div className="bubble-wrap">
        <div className="speaker" style={{ textAlign: "right" }}>지원자</div>
        <div className="bubble user-bubble">{text}</div>
      </div>
    </div>
  );
}

function InputTool({ label, icon, onClick }) {
  return (
    <button className="input-tool" type="button" onClick={onClick} aria-label={label}>
      <span className="input-tool-icon" aria-hidden="true">{icon}</span>
      <span className="input-tool-label">{label}</span>
    </button>
  );
}
