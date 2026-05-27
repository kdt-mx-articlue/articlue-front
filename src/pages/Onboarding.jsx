import { Link } from "react-router-dom";

const sections = [
  {
    id: "hero",
    title: (
      <>
        AI가 포트폴리오를
        <br />
        분석해 합격 가능성이
        <br />
        높은 기업을 추천합니다
      </>
    ),
    lead: "이력서, 포트폴리오, 기술 경험을 기반으로 기업 추천, 맞춤 자소서, RAG 실전 면접까지 한 번에 연결해 드립니다.",
    primary: { label: "로그인 후 시작하기", to: "/login" },
    secondary: { label: "서비스 둘러보기", href: "#input" },
    note: "Articlue의 기업 추천, 자소서 생성, 면접 기능은 로그인 후 이용할 수 있습니다.",
    steps: [
      "포트폴리오 입력",
      "핵심 역량 분석",
      "기업 직무 기술서 비교",
      "매칭률 산출",
      "추천 기업 제공",
    ],
    bottomTitle: "분석 결과",
    metrics: ["기업 추천", "맞춤 자소서", "면접 준비", "성장 인사이트"],
  },
  {
    id: "input",
    title: (
      <>
        기술 경험을 구조화하면
        <br />
        추천 정확도가 올라갑니다
      </>
    ),
    lead: "프로젝트 경험, 기술 스택, 포트폴리오를 체계적으로 입력하면 AI가 더 명확하게 분석하고 추천합니다.",
    secondary: { label: "다음 단계 보기", href: "#diagnosis" },
    steps: ["프로젝트 경험", "기술 스택", "포트폴리오", "역량 데이터 구축"],
    bottomTitle: "입력 데이터",
    metrics: ["프로젝트", "기술 스택", "GitHub", "포트폴리오"],
  },
  {
    id: "diagnosis",
    title: (
      <>
        성장 진단으로
        <br />
        나의 강점과
        <br />
        보완점을 파악하세요
      </>
    ),
    lead: "이력서를 AI가 분석해 강점과 보완점을 진단하고, 더 성장할 수 있는 방향을 제시해 드립니다.",
    secondary: { label: "다음 단계 보기", href: "#matching" },
    steps: ["이력서 분석", "역량 진단", "강점 도출", "보완 영역 발견"],
    bottomTitle: "진단 항목",
    metrics: ["기술 역량", "프로젝트 경험", "문제 해결력", "커뮤니케이션"],
  },
  {
    id: "matching",
    title: (
      <>
        AI가 직무 기술서를 분석해
        <br />
        나에게 맞는
        <br />
        기업을 추천합니다
      </>
    ),
    lead: "수많은 기업의 직무 기술서를 분석하고 내 프로필과 비교하여 합격 가능성이 높은 기업을 추천해 드립니다.",
    secondary: { label: "다음 단계 보기", href: "#coverletter" },
    steps: ["기업 직무 기술서 수집", "요구 역량 추출", "프로필 비교", "기업 추천"],
    bottomTitle: "추천 기준",
    metrics: ["기술 스택", "프로젝트 경험", "산업 분야", "직무 적합도"],
  },
  {
    id: "coverletter",
    title: (
      <>
        맞춤 자소서를
        <br />
        처음부터 끝까지
        <br />
        도와드립니다
      </>
    ),
    lead: "기업과 직무에 최적화된 맞춤 자소서를 AI가 초안부터 완성까지 함께 작성해 드립니다.",
    secondary: { label: "다음 단계 보기", href: "#interview" },
    steps: ["기업 분석", "강점 매핑", "초안 생성", "문장 개선"],
    bottomTitle: "작성 지원",
    metrics: ["초안 생성", "문장 개선", "톤 조정", "기업 맞춤화"],
  },
  {
    id: "interview",
    title: (
      <>
        실전 면접을
        <br />
        시뮬레이션하고
        <br />
        피드백을 받으세요
      </>
    ),
    lead: "기업별·직무별 맞춤 질문을 생성하고 실제 면접처럼 연습한 뒤 AI 피드백을 받을 수 있습니다.",
    final: true,
    steps: ["질문 생성", "답변 작성", "AI 분석", "피드백 제공"],
    bottomTitle: "면접 지원",
    metrics: ["기술 면접", "인성 면접", "압박 질문", "답변 피드백"],
  },
];

function FlowCard({ section }) {
  return (
    <div className="flex min-h-[420px] flex-col justify-between rounded-[30px] border border-slate-200 bg-white/90 px-7 py-[26px] shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      <div className="flex flex-col items-center px-1 pb-[18px]">
        {section.steps.map((step, index) => (
          <div key={step} className="w-full">
            <div className="mx-auto grid w-full max-w-[300px] grid-cols-[56px_minmax(0,1fr)] items-center gap-[14px]">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[15px] font-black text-blue-700">
                {index + 1}
              </div>

              <strong className="text-[15px] font-black leading-tight tracking-[-0.2px] text-slate-950">
                {step}
              </strong>
            </div>

            {index !== section.steps.length - 1 && (
              <div className="my-[7px] ml-[calc(50%-122px)] h-[22px] w-px bg-gradient-to-b from-slate-200 to-blue-200" />
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-[18px]">
        <div className="mb-[14px] text-center text-[13px] font-black text-slate-600">
          {section.bottomTitle}
        </div>

        <div className="grid grid-cols-4 gap-[10px]">
          {section.metrics.map((metric) => (
            <div
              key={metric}
              className="flex min-h-[70px] flex-col items-center justify-center gap-[7px] rounded-[18px] bg-slate-50 px-2.5 py-2 text-center text-[12px] font-black leading-tight text-slate-600"
            >
              <span className="flex h-[22px] items-center justify-center text-blue-600">
                ●
              </span>
              {metric}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pager({ activeIndex }) {
  return (
    <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-[10px]">
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`rounded-full transition ${
            activeIndex === index
              ? "h-[9px] w-[9px] bg-blue-600"
              : "h-[7px] w-[7px] bg-slate-300"
          }`}
          aria-label={`${index + 1}번째 섹션으로 이동`}
        />
      ))}
    </div>
  );
}

export default function Onboarding() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-slate-50 text-slate-950">
      <header className="fixed left-0 right-0 top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-slate-50/80 px-[42px] backdrop-blur-xl">
        <a
          href="#hero"
          className="inline-flex items-center text-[28px] font-black tracking-[-0.9px] text-blue-600 no-underline"
        >
          Articlue.
        </a>

        <Link
          to="/login"
          className="rounded-full px-[14px] py-[10px] text-[14px] font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          로그인
        </Link>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="relative flex min-h-screen snap-start items-center overflow-hidden px-[42px] pb-16 pt-[104px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(37,99,235,0.07),transparent_30%)]" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1160px] grid-cols-[1fr_.88fr] items-center gap-[62px] max-[900px]:grid-cols-1 max-[900px]:gap-[30px]">
            <div>
              {index === 0 ? (
                <h1 className="mb-6 break-keep text-[52px] font-black leading-[1.18] tracking-[-2.4px] max-[900px]:text-[38px]">
                  {section.title}
                </h1>
              ) : (
                <h2 className="mb-[22px] break-keep text-[44px] font-black leading-[1.2] tracking-[-1.7px] max-[900px]:text-[34px]">
                  {section.title}
                </h2>
              )}

              <p className="mb-[34px] max-w-[560px] break-keep text-[17px] font-bold leading-[1.9] text-slate-600 max-[900px]:text-[15px]">
                {section.lead}
              </p>

              {section.final ? (
                <div className="mt-[30px] rounded-[26px] border border-blue-100 bg-white/80 p-6 shadow-[0_16px_38px_rgba(37,99,235,0.10)] backdrop-blur-xl">
                  <div className="mb-[14px] text-[18px] font-black tracking-[-0.4px] text-slate-950">
                    지금 바로 Articlue를 시작해보세요
                  </div>

                  <div className="mb-3 flex flex-wrap gap-[10px]">
                    <Link
                      to="/signup"
                      className="inline-flex rounded-full border border-blue-600 bg-blue-600 px-6 py-[15px] text-[15px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      회원가입 후 시작하기
                    </Link>

                    <Link
                      to="/login"
                      className="inline-flex rounded-full border border-blue-600 bg-white/70 px-6 py-[15px] text-[15px] font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      로그인 후 시작하기
                    </Link>
                  </div>

                  <p className="text-[13px] font-extrabold leading-[1.7] text-slate-600">
                    서비스 흐름을 다시 보고 싶다면{" "}
                    <a href="#hero" className="font-black text-blue-700">
                      처음으로 돌아가기
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    {section.primary && (
                      <Link
                        to={section.primary.to}
                        className="inline-flex rounded-full border border-blue-600 bg-blue-600 px-[22px] py-[14px] text-[15px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                      >
                        {section.primary.label}
                      </Link>
                    )}

                    {section.secondary && (
                      <a
                        href={section.secondary.href}
                        className="inline-flex rounded-full border border-blue-600 bg-white/70 px-[22px] py-[14px] text-[15px] font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                      >
                        {section.secondary.label}
                      </a>
                    )}
                  </div>

                  {section.note && (
                    <p className="mt-[18px] text-[13px] font-extrabold leading-[1.7] text-slate-400">
                      {section.note}
                    </p>
                  )}
                </>
              )}
            </div>

            <FlowCard section={section} />
          </div>

          <Pager activeIndex={index} />
        </section>
      ))}
    </main>
  );
}