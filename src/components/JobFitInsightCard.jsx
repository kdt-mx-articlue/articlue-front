function getScoreLevel(score) {
  if (score >= 80) return "강점";
  if (score >= 65) return "양호";
  if (score >= 50) return "보완";
  return "우선 보완";
}

function getAdvice(subject, score) {
  if (subject.includes("기술스택")) {
    return score >= 70
      ? "공고 핵심 기술과 현재 기술스택이 잘 연결되어 있습니다."
      : "공고 기술스택과 현재 이력서 기술스택 사이의 연결을 더 보강하세요.";
  }

  if (subject.includes("경력조건")) {
    return score >= 70
      ? "경력 조건은 현재 지원 단계와 비교적 잘 맞습니다."
      : "공고의 경력 조건과 본인 경험 수준을 연결하는 설명이 필요합니다.";
  }

  if (subject.includes("주요업무")) {
    return score >= 70
      ? "주요 업무와 프로젝트 경험의 방향이 잘 맞습니다."
      : "주요 업무와 연결되는 프로젝트 경험을 구체적으로 작성하세요.";
  }

  if (subject.includes("우대사항")) {
    return score >= 70
      ? "우대사항과 연결되는 경험을 자소서에 적극적으로 활용하세요."
      : "우대사항에 해당하는 경험이나 학습 내용을 추가하면 적합도가 올라갑니다.";
  }

  if (subject.includes("조직문화")) {
    return score >= 70
      ? "조직문화와 협업 방식이 비교적 잘 맞습니다."
      : "협업 방식, 커뮤니케이션, 문제 해결 태도를 더 구체적으로 보여주세요.";
  }

  return "해당 항목의 근거를 이력서와 자소서에 더 명확히 연결하세요.";
}

export default function JobFitInsightCard({ data = [], companyName = "" }) {
  const sortedByScore = [...data].sort((a, b) => b.score - a.score);
  const strengths = sortedByScore.slice(0, 3);
  const weaknesses = [...data].sort((a, b) => a.score - b.score).slice(0, 2);

  const topStrength = strengths[0];
  const topWeakness = weaknesses[0];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5">
        <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
          AI Fit Insight
        </p>

        <h3 className="break-keep text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
          {companyName ? `${companyName} 적합도 인사이트` : "직무 적합도 인사이트"}
        </h3>

        <p className="mt-2 break-keep text-[14px] font-bold leading-[1.65] text-slate-600 dark:text-slate-300">
          방사형 그래프의 점수를 기준으로 강점과 보완 필요 영역을 자동으로 정리했습니다.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <span className="mb-2 block text-[12px] font-black text-emerald-700 dark:text-emerald-300">
            가장 강한 영역
          </span>
          <strong className="block text-[20px] font-black text-slate-900 dark:text-white">
            {topStrength?.subject || "분석 대기"}
          </strong>
          <p className="mt-2 text-[13px] font-black text-emerald-700 dark:text-emerald-300">
            {topStrength ? `${topStrength.score}%` : "-"}
          </p>
        </div>

        <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <span className="mb-2 block text-[12px] font-black text-amber-700 dark:text-amber-300">
            우선 보완 영역
          </span>
          <strong className="block text-[20px] font-black text-slate-900 dark:text-white">
            {topWeakness?.subject || "분석 대기"}
          </strong>
          <p className="mt-2 text-[13px] font-black text-amber-700 dark:text-amber-300">
            {topWeakness ? `${topWeakness.score}%` : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <article className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <h4 className="mb-4 text-[17px] font-black text-slate-900 dark:text-white">
            강점 TOP 3
          </h4>

          <div className="flex flex-col gap-3">
            {strengths.map((item, index) => (
              <div
                key={item.subject}
                className="rounded-[18px] border border-emerald-100 bg-white px-4 py-3 dark:border-emerald-900 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white">
                    {index + 1}. {item.subject}
                  </span>
                  <strong className="text-[15px] font-black text-emerald-600 dark:text-emerald-300">
                    {item.score}%
                  </strong>
                </div>

                <span className="mb-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {getScoreLevel(item.score)}
                </span>

                <p className="break-keep text-[12px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                  {getAdvice(item.subject, item.score)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-amber-100 bg-amber-50/70 p-5 dark:border-amber-900 dark:bg-amber-950/20">
          <h4 className="mb-4 text-[17px] font-black text-slate-900 dark:text-white">
            보완 필요 영역 TOP 2
          </h4>

          <div className="flex flex-col gap-3">
            {weaknesses.map((item, index) => (
              <div
                key={item.subject}
                className="rounded-[18px] border border-amber-100 bg-white px-4 py-3 dark:border-amber-900 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white">
                    {index + 1}. {item.subject}
                  </span>
                  <strong className="text-[15px] font-black text-amber-600 dark:text-amber-300">
                    {item.score}%
                  </strong>
                </div>

                <span className="mb-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-black text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  {getScoreLevel(item.score)}
                </span>

                <p className="break-keep text-[12px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                  {getAdvice(item.subject, item.score)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}