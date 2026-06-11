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
      questions: [
        "Redis를 도입하셨는데, 메모리 초과(OOM) 발생 시 어떤 비즈니스적 기준을 세워 데이터를 삭제(Eviction)하셨나요?",
        "프로젝트에서 백엔드와 프론트엔드를 함께 다룬 경험이 있다면, 역할 충돌이나 일정 지연을 어떻게 조율했나요?",
        "지원 직무와 관련해 본인의 프로젝트 경험 중 가장 설득력 있게 설명할 수 있는 성과는 무엇인가요?",
        "기술을 선택할 때 단순 구현 가능성 외에 운영 비용, 유지보수성, 사용자 경험을 어떻게 고려하나요?",
        "팀 프로젝트에서 본인의 기여도를 객관적으로 증명해야 한다면 어떤 근거를 제시하시겠나요?",
      ],
      followUpQuestions: [
        "방금 답변에서 비용과 안정성의 균형을 언급하셨습니다. 그렇다면 사용자 경험을 해치지 않는 선에서 어떤 데이터를 먼저 캐시에서 제거할지 판단하는 기준은 무엇인가요?",
        "그 과정에서 본인이 직접 결정한 부분과 팀원과 협의한 부분을 구분해서 설명해 주실 수 있나요?",
        "말씀하신 성과를 수치나 사용자 관점의 변화로 표현한다면 어떻게 설명할 수 있을까요?",
        "만약 선택한 기술이 예상보다 유지보수 비용이 크다는 것을 알게 된다면 어떤 방식으로 개선하시겠습니까?",
        "기여도를 설명할 때 코드 작성 외에 문제 해결 과정이나 커뮤니케이션 측면에서는 어떤 근거를 제시할 수 있나요?",
      ],
      scores: {
        tech: 86,
        problem: 84,
        business: 78,
        communication: 88,
        total: 84,
      },
      strengths: [
        "기술 선택과 운영 안정성을 함께 고려하려는 관점이 좋습니다.",
        "프로젝트 경험을 바탕으로 문제 해결 과정을 설명할 수 있습니다.",
        "질문 의도를 파악하고 답변 구조를 잡는 능력이 안정적입니다.",
      ],
      improvements: [
        "성과를 설명할 때 수치, 사용자 변화, 개선 전후 비교가 더 필요합니다.",
        "기술 선택 이유를 비즈니스 기준과 더 직접적으로 연결해야 합니다.",
        "답변 초반에 결론을 먼저 말하고 근거를 붙이면 전달력이 더 좋아집니다.",
      ],
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