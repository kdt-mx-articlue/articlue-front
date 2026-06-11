import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import { analyzeResume } from "../services/aiApi.js";

const loadingSteps = [
  "이력서 저장 결과를 확인하고 있습니다.",
  "AI가 이력서 핵심 정보를 분석하고 있습니다.",
  "직무 적합도와 성장 포인트를 계산하고 있습니다.",
  "추천 기업과 면접 준비 데이터를 생성하고 있습니다.",
  "분석 결과를 화면에 반영하고 있습니다.",
];

function saveAiAnalysisResult(resumeId, result = {}) {
  const analyzedAt = new Date().toISOString();

  window.localStorage.setItem(
    "articlue_ai_analysis_result",
    JSON.stringify({
      resumeId,
      result,
      analyzedAt,
    })
  );

  window.localStorage.setItem(
    "articlue_growth_result",
    JSON.stringify({
      resumeId,
      data: result?.growth || {},
      analyzedAt,
    })
  );

  window.localStorage.setItem(
    "articlue_fitting_result",
    JSON.stringify({
      resumeId,
      data: result?.fitting || {},
      analyzedAt,
    })
  );

  window.localStorage.setItem(
    "articlue_interview_result",
    JSON.stringify({
      resumeId,
      data: result?.interview || {},
      analyzedAt,
    })
  );
}

function createFallbackAnalysisResult(resumeId) {
  return {
    growth: {
      resumeId,
      status: "fallback",
      summary: "AI 분석 API 연결 전까지 사용할 개발용 성장 분석 데이터입니다.",
    },
    fitting: {
      resumeId,
      status: "fallback",
      summary: "AI 분석 API 연결 전까지 사용할 개발용 추천 기업 데이터입니다.",
    },
    interview: {
      resumeId,
      status: "fallback",
      summary: "AI 분석 API 연결 전까지 사용할 개발용 면접 준비 데이터입니다.",
    },
  };
}

export default function Loading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resumeId = searchParams.get("resumeId");

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [errorMessage, setErrorMessage] = useState("");

  const currentStep = useMemo(() => {
    return loadingSteps[Math.min(stepIndex, loadingSteps.length - 1)];
  }, [stepIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, loadingSteps.length - 1));
      setProgress((prev) => Math.min(prev + 18, 92));
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    const completeAndMove = () => {
      setProgress(100);
      setStepIndex(loadingSteps.length - 1);

      window.setTimeout(() => {
        navigate("/growth", { replace: true });
      }, 700);
    };

    const runAnalysis = async () => {
      if (!resumeId) {
        setErrorMessage("이력서 ID가 없어 AI 분석을 시작할 수 없습니다.");
        return;
      }

      try {
        const result = await analyzeResume(resumeId);

        if (ignore) return;

        saveAiAnalysisResult(resumeId, result);
        completeAndMove();
      } catch (error) {
        console.error("AI 이력서 분석 실패. 개발용 분석 결과로 대체합니다.", error);

        if (ignore) return;

        const fallbackResult = createFallbackAnalysisResult(resumeId);
        saveAiAnalysisResult(resumeId, fallbackResult);

        completeAndMove();
      }
    };

    runAnalysis();

    return () => {
      ignore = true;
    };
  }, [navigate, resumeId]);

  return (
    <AppLayout title="AI 이력서 분석 중">
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6 py-10">
        <section className="w-full max-w-[760px] rounded-[32px] border border-slate-200 bg-white p-9 text-center shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto mb-6 flex h-[86px] w-[86px] items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-300" />
          </div>

          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            AI 분석 진행 중
          </div>

          <h1 className="mb-3 text-[30px] font-black tracking-[-0.8px] text-slate-900 dark:text-white">
            이력서를 기반으로 커리어 분석을 생성하고 있습니다
          </h1>

          <p className="mx-auto mb-7 max-w-[560px] break-keep text-[15px] font-bold leading-7 text-slate-600 dark:text-slate-300">
            저장된 이력서 데이터를 분석해 성장 리포트, 추천 기업, 면접 준비
            데이터를 연결합니다.
          </p>

          <div className="mb-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex items-center justify-between text-[13px] font-black text-slate-600 dark:text-slate-300">
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>

            <div className="h-[12px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {loadingSteps.map((step, index) => (
              <div
                key={step}
                className={`rounded-[18px] border px-4 py-3 text-[13px] font-extrabold leading-6 ${
                  index <= stepIndex
                    ? "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                    : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {index + 1}. {step}
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-[22px] border border-red-200 bg-red-50 p-5 text-left dark:border-red-900 dark:bg-red-950">
              <strong className="mb-2 block text-[15px] font-black text-red-600 dark:text-red-300">
                분석을 시작하지 못했습니다.
              </strong>
              <p className="break-keep text-[13px] font-extrabold leading-6 text-red-500 dark:text-red-300">
                {errorMessage}
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/resume", { replace: true })}
                  className="rounded-full border border-red-200 bg-white px-4 py-2 text-[13px] font-black text-red-600 dark:border-red-900 dark:bg-slate-900 dark:text-red-300"
                >
                  이력서로 돌아가기
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}