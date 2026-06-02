import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const INTERVIEW_RESULT_KEY = "articlue_interview_results";
const THEME_KEY = "articlue-theme";

const companyOptions = [
  "네이버웹툰 - Backend",
  "토스 - Node.js Developer",
  "카카오 - Server Developer",
];

const portfolioOptions = [
  "백엔드_프로젝트_최종.pdf",
  "이력서_최종.pdf",
  "포트폴리오_v2.pdf",
];

const followUpQuestion =
  "방금 답변에서 비용과 안정성의 균형을 언급하셨습니다. 그렇다면 사용자 경험을 해치지 않는 선에서 어떤 데이터를 먼저 캐시에서 제거할지 판단하는 기준은 무엇인가요?";

export default function Interview() {
  const [searchParams] = useSearchParams();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState("setup");
  const [company, setCompany] = useState("네이버웹툰 - Backend");
  const [portfolio, setPortfolio] = useState("백엔드_프로젝트_최종.pdf");
  const [difficulty, setDifficulty] = useState("실전 압박");
  const [questionCount, setQuestionCount] = useState("5개");
  const [persona, setPersona] = useState("실무진");
  const [toast, setToast] = useState("");
  const [analysis, setAnalysis] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [analysisDesc, setAnalysisDesc] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [remaining, setRemaining] = useState(90);

  useEffect(() => {
    const syncDarkMode = () => {
      const savedTheme = localStorage.getItem(THEME_KEY) || "light";
      const shouldUseDarkMode = savedTheme === "dark";

      document.documentElement.classList.toggle("dark", shouldUseDarkMode);
      setIsDarkMode(shouldUseDarkMode);
    };

    syncDarkMode();

    const observer = new MutationObserver(syncDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("storage", syncDarkMode);
    window.addEventListener("focus", syncDarkMode);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncDarkMode);
      window.removeEventListener("focus", syncDarkMode);
    };
  }, []);

  useEffect(() => {
    const previousBodyBg = document.body.style.backgroundColor;
    const previousHtmlBg = document.documentElement.style.backgroundColor;

    document.body.style.backgroundColor = isDarkMode ? "#020617" : "#f8fafc";
    document.documentElement.style.backgroundColor = isDarkMode
      ? "#020617"
      : "#f8fafc";

    return () => {
      document.body.style.backgroundColor = previousBodyBg;
      document.documentElement.style.backgroundColor = previousHtmlBg;
    };
  }, [isDarkMode]);

  useEffect(() => {
    const queryCompany = searchParams.get("company");

    if (queryCompany) {
      const matched = companyOptions.find((option) =>
        option.includes(queryCompany)
      );

      if (matched) {
        setCompany(matched);
        return;
      }
    }

    const savedCompany = localStorage.getItem("articlue_interview_company");
    const savedRole = localStorage.getItem("articlue_interview_role");

    if (savedCompany) {
      setCompany(`${savedCompany} - ${savedRole || "Backend"}`);
    }
  }, [searchParams]);

  const summary = useMemo(() => {
    const [companyName, roleName = "Developer"] = company.split(" - ");
    const countNumber = Number.parseInt(questionCount, 10) || 5;

    const timeText =
      countNumber <= 3
        ? "약 5~7분"
        : countNumber >= 7
        ? "약 12~15분"
        : "약 8~10분";

    return { companyName, roleName, countNumber, timeText };
  }, [company, questionCount]);

  useEffect(() => {
    if (view !== "interview" || analysis) return;

    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [view, analysis]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const saveInterviewResult = () => {
    const answeredCount = messages.filter(
      (message) => message.type === "user"
    ).length;

    const score = answeredCount >= 3 ? 88 : answeredCount >= 1 ? 82 : 76;

    const resultData = {
      id: Date.now(),
      company: summary.companyName,
      role: summary.roleName,
      portfolio,
      difficulty,
      persona,
      score,
      answeredCount,
      questionCount: summary.countNumber,
      timeText: summary.timeText,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = JSON.parse(
        localStorage.getItem(INTERVIEW_RESULT_KEY) || "[]"
      );

      const next = Array.isArray(saved)
        ? [resultData, ...saved]
        : [resultData];

      localStorage.setItem(INTERVIEW_RESULT_KEY, JSON.stringify(next));
    } catch {
      localStorage.setItem(INTERVIEW_RESULT_KEY, JSON.stringify([resultData]));
    }
  };

  const resetSettings = () => {
    setCompany("네이버웹툰 - Backend");
    setPortfolio("백엔드_프로젝트_최종.pdf");
    setDifficulty("실전 압박");
    setQuestionCount("5개");
    setPersona("실무진");
    showToast("면접 조건을 기본값으로 초기화했습니다.");
  };

  const showSummary = () => {
    setView("summary");
    showToast("면접 준비 요약을 확인해 주세요.");
  };

  const backToSetup = () => {
    setView("setup");
    showToast("면접 조건을 다시 수정할 수 있습니다.");
  };

  const startInterview = () => {
    setView("interview");
    setAnalysis(true);
    setAnalysisTitle("AI 면접관이 입장하고 있습니다");
    setAnalysisDesc("선택한 면접 조건을 확인하고 실전 면접 환경을 구성하는 중입니다.");
    setCurrentQuestion(1);
    setRemaining(90);
    setMessages([]);
    setAnswer("");
    showToast("AI 면접관을 준비 중입니다.");

    window.setTimeout(() => {
      setAnalysisTitle("기업 JD와 포트폴리오를 분석 중입니다");
      setAnalysisDesc(
        "선택한 기업, 직무 요구사항, 포트폴리오 내용을 기준으로 첫 질문과 RAG 근거를 준비하고 있습니다."
      );
    }, 1200);

    window.setTimeout(() => {
      setAnalysis(false);
      showToast("면접이 시작되었습니다.");
    }, 2800);
  };

  const sendAnswer = () => {
    if (!answer.trim()) {
      showToast("답변을 입력해 주세요.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", text: answer.trim() },
      { type: "bot", text: followUpQuestion },
    ]);

    setAnswer("");
    setCurrentQuestion((prev) => Math.min(summary.countNumber, prev + 1));
    setRemaining(90);
    showToast("답변이 전송되었습니다.");
  };

  const endInterview = () => {
    setAnalysis(true);
    setAnalysisTitle("면접 답변을 종합 분석 중입니다");
    setAnalysisDesc(
      "기술 정확도, 비즈니스 핏, 커뮤니케이션 논리성을 기준으로 리포트를 생성하고 있습니다."
    );
    showToast("면접 리포트를 생성 중입니다.");

    window.setTimeout(() => {
      saveInterviewResult();
      setAnalysis(false);
      setView("result");
      showToast("면접 결과가 내 커리어 관리에 저장되었습니다.");
    }, 1400);
  };

  if (view === "interview") {
    const timerPercent = Math.max((remaining / 90) * 100, 0);
    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");

    return (
      <section
        className={`relative flex h-screen flex-col overflow-hidden transition-colors ${
          isDarkMode
            ? "bg-[#020617] text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <header
          className={`flex h-[68px] shrink-0 items-center justify-between border-b px-7 transition-colors ${
            isDarkMode
              ? "border-slate-800 bg-[#020617]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/home"
              className="whitespace-nowrap text-[24px] font-black tracking-[-0.8px] text-blue-600 dark:text-blue-400"
            >
              Articlue.
            </Link>
            <div className="truncate text-[16px] font-black">
              [{summary.companyName}] - {summary.roleName} {difficulty} 면접
            </div>
          </div>

          <button
            type="button"
            onClick={endInterview}
            className="rounded-full border border-slate-200 px-[15px] py-[10px] text-[14px] font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-300"
          >
            면접 종료
          </button>
        </header>

        {analysis && (
          <div className="absolute inset-x-0 top-[68px] bottom-0 z-50 flex items-center justify-center bg-slate-50/85 backdrop-blur-md dark:bg-slate-950/85">
            <div className="w-[min(520px,calc(100%-48px))] rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-[18px] h-[46px] w-[46px] animate-spin rounded-full border-4 border-slate-100 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
              <h2 className="mb-[10px] text-[22px] font-black tracking-[-0.4px]">
                {analysisTitle}
              </h2>
              <p className="text-[14px] font-extrabold leading-[1.7] text-slate-600 dark:text-slate-300">
                {analysisDesc}
              </p>
            </div>
          </div>
        )}

        <main
          className={`relative flex min-h-0 flex-1 transition-colors ${
            isDarkMode ? "bg-[#020617]" : "bg-slate-50"
          }`}
        >
          <section className="mx-auto flex min-h-0 w-full max-w-[1050px] flex-1 flex-col px-8 pt-[26px]">
            <div className="mb-[18px] flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white px-[22px] py-[18px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
              <div>
                <strong className="text-[16px] font-black">
                  {difficulty} 면접 진행 중
                </strong>
                <p className="mt-[5px] text-[13px] leading-[1.5] text-slate-600 dark:text-slate-300">
                  {company}, {portfolio}, {persona} 면접관 기준으로 질문이 생성됩니다.
                </p>
                <div className="mt-2 inline-flex text-[12px] font-black text-blue-700 dark:text-blue-300">
                  {currentQuestion} / {summary.countNumber} 질문 진행 중 · 답변 준비 단계
                </div>
              </div>

              <div className="min-w-[160px] text-right">
                <div className="text-[12px] font-black text-slate-600 dark:text-slate-300">
                  답변 제한 시간
                </div>
                <div className="font-mono text-[28px] font-black text-blue-600 dark:text-blue-400">
                  {min}:{sec}
                </div>
                <div className="mt-[34px] h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500"
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
              <div className="w-fit animate-pulse rounded-[20px] bg-slate-100 px-[15px] py-3 text-[13px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                기업 JD와 포트폴리오를 분석 중입니다...
              </div>

              <BotMessage
                speaker={`${summary.companyName} ${persona} 면접관`}
                text="Redis를 도입하셨는데, 메모리 초과(OOM) 발생 시 어떤 비즈니스적 기준을 세워 데이터를 삭제(Eviction)하셨나요?"
                source="[동아일보] 글로벌 서비스 트래픽 폭주와 캐시 전략 변화 분석 · 2026.04.10"
              />

              <div className="mx-auto w-[min(520px,100%)] rounded-[20px] border border-dashed border-blue-200 bg-blue-50 px-4 py-[14px] text-center text-[13px] font-black leading-[1.6] text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                첫 질문을 확인한 뒤 30초 동안 핵심 근거를 정리해 보세요. 준비가 되면 바로 답변을 입력하면 됩니다.
              </div>

              <div className="self-center rounded-[20px] border border-dashed border-slate-200 bg-slate-100 px-[18px] py-[14px] text-center text-[13px] font-extrabold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                답변 방향이 어렵다면 30초 후 힌트를 확인할 수 있습니다.
                <button
                  type="button"
                  onClick={() => showToast("답변 가이드 힌트가 열렸습니다.")}
                  className="ml-2 font-black text-blue-700 dark:text-blue-300"
                >
                  답변 가이드 힌트 보기
                </button>
              </div>

              {messages.map((message, index) =>
                message.type === "user" ? (
                  <UserMessage key={index} text={message.text} />
                ) : (
                  <BotMessage
                    key={index}
                    speaker={`${summary.companyName} ${persona} 면접관`}
                    text={message.text}
                    source="[DBR] 플랫폼 비즈니스의 서버 비용 최적화 전략 · 2026.04.12"
                  />
                )
              )}
            </div>

            <div className="mt-[18px] shrink-0 rounded-t-[24px] border border-slate-200 bg-white p-[18px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3">
                <div className="mb-2 flex justify-between text-[13px] font-black text-slate-600 dark:text-slate-300">
                  <span>답변 타이머</span>
                  <span>제한 시간 내 핵심 근거를 중심으로 답변하세요</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500"
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-end gap-[14px]">
                <div className="flex shrink-0 items-end gap-3">
                  <ToolButton
                    label="파일 첨부"
                    icon="📎"
                    onClick={() => showToast("서류 업로드 기능은 추후 연동됩니다.")}
                  />
                  <ToolButton
                    label="음성 입력"
                    icon="🎙️"
                    onClick={() => showToast("마이크 입력 기능은 추후 연동됩니다.")}
                  />
                  <ToolButton
                    label="힌트 보기"
                    icon="💡"
                    onClick={() => showToast("답변 가이드 힌트가 열렸습니다.")}
                  />
                </div>

                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="답변을 입력하세요. Enter는 줄바꿈, 전송 버튼 클릭 시 답변이 제출됩니다."
                  className="min-h-[72px] flex-1 resize-y rounded-[20px] border border-slate-200 bg-slate-100 px-4 py-[14px] text-[15px] leading-[1.6] text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <button
                  type="button"
                  onClick={sendAnswer}
                  className="h-[54px] min-w-[122px] rounded-full bg-blue-600 px-5 text-[14px] font-black text-white"
                >
                  답변 전송
                </button>
              </div>
            </div>
          </section>
        </main>

        <Toast toast={toast} />
      </section>
    );
  }

  return (
    <section
      className={`min-h-screen overflow-y-auto transition-colors ${
        isDarkMode
          ? "bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_30%),#020617] text-white"
          : "bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_30%),#f8fafc] text-slate-900"
      }`}
    >
      <header className="flex h-[72px] items-center justify-between px-[42px]">
        <Link
          to="/home"
          className="block text-[28px] font-black tracking-[-0.9px] text-blue-600 dark:text-blue-400"
        >
          Articlue.
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-8 pb-12 pt-[18px]">
        <nav className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-[14px] rounded-[28px] border border-slate-200 bg-white/80 px-7 py-[18px] shadow-[0_14px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
          {[
            ["1", "조건 설정", "setup"],
            ["2", "요약 확인", "summary"],
            ["3", "면접 준비", "interview"],
            ["4", "면접 진행", "interview"],
            ["5", "결과 확인", "result"],
          ].map(([num, label, key], index) => (
            <FragmentStep
              key={label}
              num={num}
              label={label}
              active={view === key || (view === "interview" && key === "interview")}
              showLine={index < 4}
            />
          ))}
        </nav>

        {view === "setup" && (
          <SetupView
            company={company}
            setCompany={setCompany}
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            persona={persona}
            setPersona={setPersona}
            resetSettings={resetSettings}
            showSummary={showSummary}
          />
        )}

        {view === "summary" && (
          <SummaryView
            summary={summary}
            portfolio={portfolio}
            difficulty={difficulty}
            persona={persona}
            startInterview={startInterview}
            backToSetup={backToSetup}
          />
        )}

        {view === "result" && (
          <ResultView
            summary={summary}
            portfolio={portfolio}
            difficulty={difficulty}
            persona={persona}
            messages={messages}
            restart={() => setView("setup")}
          />
        )}

        <div className="mx-auto flex w-full max-w-[680px] items-start gap-[14px] rounded-[22px] border border-slate-200 bg-white/80 px-[22px] py-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80">
          <strong className="whitespace-nowrap text-[14px] font-black text-blue-700 dark:text-blue-300">
            진행 안내
          </strong>
          <span className="text-[13px] font-extrabold leading-[1.7] text-slate-600 dark:text-slate-300">
            설정 완료 후 요약을 확인하고 AI 면접관 입장하기를 누르면 실제 면접
            화면으로 전환됩니다.
          </span>
        </div>
      </main>

      <Toast toast={toast} />
    </section>
  );
}

function SetupView(props) {
  return (
    <section className="mx-auto w-full max-w-[660px]">
      <div className="w-full rounded-[30px] border border-slate-200 bg-white px-[30px] py-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
        <h1 className="mb-[9px] text-[28px] font-black tracking-[-0.7px]">
          면접 조건을 설정하세요.
        </h1>
        <p className="mb-[22px] text-[14px] font-extrabold leading-[1.7] text-slate-600 dark:text-slate-300">
          기업, 포트폴리오, 난이도, 질문 수, 면접관 페르소나를 먼저 설정하세요.
          설정을 마치면 다음 단계에서 면접 준비 요약을 별도 화면으로 확인합니다.
        </p>

        <FormGroup label="타겟 기업 선택">
          <select
            value={props.company}
            onChange={(event) => props.setCompany(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-[14px] py-3 text-[14px] font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {companyOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup label="포트폴리오 연동">
          <select
            value={props.portfolio}
            onChange={(event) => props.setPortfolio(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-[14px] py-3 text-[14px] font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {portfolioOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup label="면접 난이도">
          <div className="grid grid-cols-2 gap-2">
            {["일반 핏 인터뷰", "실전 압박"].map((item) => (
              <RadioButton
                key={item}
                active={props.difficulty === item}
                onClick={() => props.setDifficulty(item)}
              >
                {item}
              </RadioButton>
            ))}
          </div>
        </FormGroup>

        <FormGroup label="면접 질문 수">
          <div className="grid grid-cols-3 gap-2">
            {["3개", "5개", "7개"].map((item) => (
              <RadioButton
                key={item}
                active={props.questionCount === item}
                onClick={() => props.setQuestionCount(item)}
              >
                {item}
              </RadioButton>
            ))}
          </div>
        </FormGroup>

        <FormGroup label="면접관 페르소나">
          <div className="grid grid-cols-2 gap-2">
            {["실무진", "임원진"].map((item) => (
              <RadioButton
                key={item}
                active={props.persona === item}
                onClick={() => props.setPersona(item)}
              >
                {item}
              </RadioButton>
            ))}
          </div>
        </FormGroup>

        <div className="mt-[18px] grid grid-cols-[.72fr_1.28fr] gap-[10px]">
          <button
            type="button"
            onClick={props.resetSettings}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-blue-600 px-[18px] py-3 text-[14px] font-black text-blue-700 dark:text-blue-300"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={props.showSummary}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
          >
            설정 완료 후 준비 요약 확인 →
          </button>
        </div>
      </div>
    </section>
  );
}

function SummaryView({
  summary,
  portfolio,
  difficulty,
  persona,
  startInterview,
  backToSetup,
}) {
  return (
    <section className="mx-auto w-full max-w-[680px]">
      <aside className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5">
          <h2 className="mb-2 text-[25px] font-black tracking-[-0.5px]">
            면접 준비 요약
          </h2>
          <p className="text-[13px] font-extrabold leading-[1.6] text-slate-600 dark:text-slate-300">
            설정한 조건을 기준으로 실전 면접이 구성됩니다. 내용을 확인한 뒤 AI
            면접관 입장하기를 눌러주세요.
          </p>
        </div>

        <SummaryTable
          rows={[
            ["🏢", "기업", summary.companyName],
            ["💼", "지원 직무", summary.roleName],
            ["📄", "포트폴리오", portfolio],
            ["🛡️", "면접 난이도", difficulty],
            ["👤", "면접관 페르소나", persona],
            ["💬", "질문 구성", `총 ${summary.countNumber}문항 · 꼬리질문 포함`],
            ["⏱️", "예상 소요 시간", summary.timeText],
            [
              "✅",
              "평가 기준",
              "기술 정확도, 문제 해결 과정, 비즈니스 임팩트, 커뮤니케이션",
            ],
          ]}
        />

        <div className="mt-[22px] flex flex-col gap-[10px]">
          <button
            type="button"
            onClick={startInterview}
            className="min-h-[52px] w-full rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
          >
            AI 면접관 입장하기
          </button>
          <button
            type="button"
            onClick={backToSetup}
            className="min-h-[52px] w-full rounded-full border border-blue-600 px-[18px] py-3 text-[14px] font-black text-blue-700 dark:text-blue-300"
          >
            설정 다시 수정하기
          </button>
        </div>
      </aside>
    </section>
  );
}

function ResultView({ summary, portfolio, difficulty, persona, messages, restart }) {
  const answeredCount = messages.filter((message) => message.type === "user").length;
  const score = answeredCount >= 3 ? 88 : answeredCount >= 1 ? 82 : 76;

  return (
    <section className="mx-auto w-full max-w-[920px]">
      <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between gap-5">
          <div>
            <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
              AI 면접 결과 리포트
            </p>
            <h1 className="text-[30px] font-black tracking-[-0.8px]">
              {summary.companyName} {summary.roleName} 면접 결과
            </h1>
            <p className="mt-3 text-[14px] font-extrabold leading-[1.7] text-slate-600 dark:text-slate-300">
              답변 내용을 바탕으로 기술 정확도, 문제 해결 과정, 비즈니스 임팩트,
              커뮤니케이션 구조를 종합 평가했습니다.
            </p>
          </div>

          <div className="min-w-[150px] rounded-[24px] bg-blue-50 px-5 py-4 text-center dark:bg-blue-950">
            <span className="block text-[12px] font-black text-blue-700 dark:text-blue-300">
              종합 점수
            </span>
            <strong className="block text-[42px] font-black text-blue-700 dark:text-blue-300">
              {score}
            </strong>
            <span className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400">
              / 100
            </span>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-4 gap-3">
          {[
            ["기술 정확도", "86점"],
            ["문제 해결 과정", "84점"],
            ["비즈니스 핏", "78점"],
            ["커뮤니케이션", "88점"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="mb-2 block text-[12px] font-black text-slate-500 dark:text-slate-400">
                {label}
              </span>
              <strong className="text-[24px] font-black">{value}</strong>
            </div>
          ))}
        </div>

        <SummaryTable
          rows={[
            ["🏢", "기업", summary.companyName],
            ["💼", "직무", summary.roleName],
            ["📄", "포트폴리오", portfolio],
            ["🛡️", "난이도", difficulty],
            ["👤", "면접관", persona],
            ["💬", "답변 수", `${answeredCount}개 답변 기록`],
          ]}
        />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <ResultCard
            title="강점"
            items={[
              "Redis 캐싱과 서버 안정성에 대한 기술 이해도가 드러났습니다.",
              "답변 구조가 비교적 명확하고 질문 의도에 맞게 전개되었습니다.",
              "운영 관점의 리스크를 함께 고려하려는 태도가 좋습니다.",
            ]}
          />
          <ResultCard
            title="보완할 점"
            items={[
              "비용 절감, 응답 속도 개선 등 수치 기반 성과 표현이 부족합니다.",
              "기술 선택의 우선순위를 비즈니스 기준과 더 직접적으로 연결해야 합니다.",
              "꼬리질문에서는 결론을 먼저 말하고 근거를 붙이는 방식이 더 좋습니다.",
            ]}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Link
            to="/growth"
            className="rounded-full border border-blue-600 px-[18px] py-3 text-[14px] font-black text-blue-700 dark:text-blue-300"
          >
            성장 리포트로 이동
          </Link>
          <Link
            to="/mypage"
            className="rounded-full border border-slate-200 px-[18px] py-3 text-[14px] font-black text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            내 커리어 관리로 이동
          </Link>
          <button
            type="button"
            onClick={restart}
            className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
          >
            새 면접 다시 설정
          </button>
        </div>
      </div>
    </section>
  );
}

function SummaryTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {rows.map(([icon, label, value], index) => (
        <div
          key={label}
          className={`grid grid-cols-[36px_100px_minmax(0,1fr)] items-center gap-[10px] border-b border-slate-200 px-[14px] py-[14px] last:border-b-0 dark:border-slate-700 ${
            index === rows.length - 1 ? "items-start" : ""
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-blue-100 bg-blue-50 text-[14px] text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {icon}
          </span>
          <span className="text-[12px] font-black text-slate-400">
            {label}
          </span>
          <strong className="truncate text-[13px] font-black leading-[1.55]">
            {value}
          </strong>
        </div>
      ))}
    </div>
  );
}

function ResultCard({ title, items }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-3 text-[18px] font-black">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-[13px] font-extrabold leading-[1.65] text-slate-600 dark:text-slate-300"
          >
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BotMessage({ speaker, text, source }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-blue-100 font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        AI
      </div>
      <div className="max-w-[72%]">
        <div className="mb-[7px] text-[13px] font-black text-slate-600 dark:text-slate-300">
          {speaker}
        </div>
        <div className="rounded-[22px] rounded-tl-lg border border-slate-200 bg-slate-100 px-[18px] py-4 text-[15px] leading-[1.7] dark:border-slate-700 dark:bg-slate-800">
          {text}
        </div>
        <div className="mt-[34px] rounded-2xl border border-slate-200 bg-white p-3 text-[12px] leading-[1.6] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <strong className="text-blue-700 dark:text-blue-300">RAG 근거</strong>
          <br />
          {source}
          <br />
          <button
            type="button"
            className="mt-2 rounded-full border border-blue-600 px-3 py-[7px] text-[12px] font-black text-blue-700 dark:text-blue-300"
          >
            원문 보기 ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[72%]">
        <div className="mb-[7px] text-right text-[13px] font-black text-slate-600 dark:text-slate-300">
          지원자
        </div>
        <div className="rounded-[22px] rounded-tr-lg border border-blue-600 bg-blue-600 px-[18px] py-4 text-[15px] leading-[1.7] text-white">
          {text}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-[7px] text-[12px] font-black text-slate-600 dark:text-slate-300"
    >
      <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full border border-slate-200 bg-white text-[22px] shadow-[0_6px_18px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-800">
        {icon}
      </span>
      <span className="rounded-lg bg-slate-100 px-2 py-[5px] leading-none dark:bg-slate-800">
        {label}
      </span>
    </button>
  );
}

function FragmentStep({ num, label, active, showLine }) {
  return (
    <>
      <div className="flex flex-col items-center gap-[7px] whitespace-nowrap text-[12px] font-black text-slate-400">
        <span
          className={`flex h-[34px] w-[34px] items-center justify-center rounded-full font-black ${
            active
              ? "bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)]"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {num}
        </span>
        <strong className={active ? "text-blue-700 dark:text-blue-300" : ""}>
          {label}
        </strong>
      </div>
      {showLine && (
        <div className="h-[2px] rounded-full bg-slate-200 dark:bg-slate-700" />
      )}
    </>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="mb-[18px]">
      <label className="mb-2 block text-[13px] font-black text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function RadioButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border p-3 text-center text-[13px] font-black ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function Toast({ toast }) {
  return (
    <div
      className={`fixed bottom-7 right-7 z-[999] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-black text-white transition-all dark:bg-white dark:text-slate-900 ${
        toast
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      {toast || "저장되었습니다."}
    </div>
  );
}