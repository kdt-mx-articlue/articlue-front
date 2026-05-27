import { Link } from "react-router-dom";

function Icon({ type }) {
  const common = {
    className: "h-[21px] w-[21px]",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    file: (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    ),
    chart: (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </svg>
    ),
    building: (
      <svg {...common}>
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9h1" />
        <path d="M9 13h1" />
        <path d="M9 17h1" />
        <path d="M15 13h1" />
        <path d="M15 17h1" />
      </svg>
    ),
    target: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
    briefcase: (
      <svg {...common}>
        <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 12h18" />
      </svg>
    ),
    folder: (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
    code: (
      <svg {...common}>
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </svg>
    ),
    files: (
      <svg {...common}>
        <path d="M16 3H7a2 2 0 0 0-2 2v12" />
        <path d="M8 7h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      </svg>
    ),
    database: (
      <svg {...common}>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
    brain: (
      <svg {...common}>
        <path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5.2A3 3 0 0 0 6 18v1a3 3 0 0 0 3 3" />
        <path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5.2A3 3 0 0 1 18 18v1a3 3 0 0 1-3 3" />
        <path d="M9 3v19" />
        <path d="M15 3v19" />
      </svg>
    ),
    thumbs: (
      <svg {...common}>
        <path d="M7 10v11" />
        <path d="M15 6.5 14 10h5a2 2 0 0 1 2 2.3l-1 7A2 2 0 0 1 18 21H7l-4-1V10h4l4-7a2 2 0 0 1 4 1.5Z" />
      </svg>
    ),
    alert: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    ),
    puzzle: (
      <svg {...common}>
        <path d="M8 3h8v4a2 2 0 1 0 0 4v10H8v-4a2 2 0 1 1 0-4z" />
        <path d="M8 7H4v6h4" />
      </svg>
    ),
    message: (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
    check: (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    user: (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
    link: (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
      </svg>
    ),
    plusFile: (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M12 18v-6" />
        <path d="M9 15h6" />
      </svg>
    ),
    sparkles: (
      <svg {...common}>
        <path d="m12 3 1.7 4.6L18 9.3l-4.3 1.7L12 16l-1.7-5L6 9.3l4.3-1.7z" />
        <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
        <path d="M5 14l.6 1.6L7 16.2l-1.4.6L5 18.4l-.6-1.6L3 16.2l1.4-.6z" />
      </svg>
    ),
    sliders: (
      <svg {...common}>
        <path d="M4 21v-7" />
        <path d="M4 10V3" />
        <path d="M12 21v-9" />
        <path d="M12 8V3" />
        <path d="M20 21v-5" />
        <path d="M20 12V3" />
        <path d="M2 14h4" />
        <path d="M10 8h4" />
        <path d="M18 16h4" />
      </svg>
    ),
    help: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.3-1.7 2.7" />
        <path d="M12 17h.01" />
      </svg>
    ),
    reply: (
      <svg {...common}>
        <path d="m9 17-5-5 5-5" />
        <path d="M4 12h11a5 5 0 0 1 5 5v1" />
      </svg>
    ),
    zap: (
      <svg {...common}>
        <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.7 18.6.3 12 .3Z"
        />
      </svg>
    ),
  };

  return icons[type] || icons.file;
}

const sections = [
  {
    id: "hero",
    dots: 0,
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
      ["file", "포트폴리오 입력"],
      ["chart", "핵심 역량 분석"],
      ["building", "기업 직무 기술서 비교"],
      ["target", "매칭률 산출"],
      ["briefcase", "추천 기업 제공"],
    ],
    bottomTitle: "분석 결과",
    metrics: [
      ["building", "기업 추천"],
      ["plusFile", "맞춤 자소서"],
      ["message", "면접 준비"],
      ["sparkles", "성장 인사이트"],
    ],
  },
  {
    id: "input",
    dots: 1,
    title: (
      <>
        기술 경험을 구조화하면
        <br />
        추천 정확도가 올라갑니다
      </>
    ),
    lead: "프로젝트 경험, 기술 스택, 포트폴리오를 체계적으로 입력하면 AI가 더 명확하게 분석하고 추천합니다.",
    secondary: { label: "다음 단계 보기", href: "#diagnosis" },
    steps: [
      ["folder", "프로젝트 경험"],
      ["code", "기술 스택"],
      ["files", "포트폴리오"],
      ["database", "역량 데이터 구축"],
    ],
    bottomTitle: "입력 데이터",
    metrics: [
      ["folder", "프로젝트"],
      ["code", "기술 스택"],
      ["github", "GitHub"],
      ["files", "포트폴리오"],
    ],
  },
  {
    id: "diagnosis",
    dots: 2,
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
    steps: [
      ["search", "이력서 분석"],
      ["brain", "역량 진단"],
      ["thumbs", "강점 도출"],
      ["alert", "보완 영역 발견"],
    ],
    bottomTitle: "진단 항목",
    metrics: [
      ["code", "기술 역량"],
      ["folder", "프로젝트 경험"],
      ["puzzle", "문제 해결력"],
      ["message", "커뮤니케이션"],
    ],
  },
  {
    id: "matching",
    dots: 3,
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
    steps: [
      ["building", "기업 직무 기술서 수집"],
      ["check", "요구 역량 추출"],
      ["user", "프로필 비교"],
      ["briefcase", "기업 추천"],
    ],
    bottomTitle: "추천 기준",
    metrics: [
      ["code", "기술 스택"],
      ["folder", "프로젝트 경험"],
      ["building", "산업 분야"],
      ["target", "직무 적합도"],
    ],
  },
  {
    id: "coverletter",
    dots: 4,
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
    steps: [
      ["building", "기업 분석"],
      ["link", "강점 매핑"],
      ["plusFile", "초안 생성"],
      ["sparkles", "문장 개선"],
    ],
    bottomTitle: "작성 지원",
    metrics: [
      ["plusFile", "초안 생성"],
      ["file", "문장 개선"],
      ["sliders", "톤 조정"],
      ["building", "기업 맞춤화"],
    ],
  },
  {
    id: "interview",
    dots: 5,
    final: true,
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
    steps: [
      ["help", "질문 생성"],
      ["file", "답변 작성"],
      ["brain", "AI 분석"],
      ["reply", "피드백 제공"],
    ],
    bottomTitle: "면접 지원",
    metrics: [
      ["code", "기술 면접"],
      ["user", "인성 면접"],
      ["zap", "압박 질문"],
      ["message", "답변 피드백"],
    ],
  },
];

function FlowCard({ section }) {
  return (
    <div className="flex min-h-[420px] flex-col justify-between rounded-[30px] border border-slate-200 bg-white/90 px-7 py-[26px] shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      <div className="flex flex-col items-center gap-0 px-1 pb-[18px]">
        {section.steps.map(([icon, label], index) => (
          <div key={label} className="w-full">
            <div className="mx-auto grid w-full max-w-[300px] grid-cols-[56px_minmax(0,1fr)] items-center gap-[14px]">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                <Icon type={icon} />
              </div>

              <strong className="self-center text-[15px] font-black leading-[1.25] tracking-[-0.2px] text-slate-950">
                {label}
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
          {section.metrics.map(([icon, label]) => (
            <div
              key={label}
              className="flex min-h-[70px] flex-col items-center justify-center gap-[7px] rounded-[18px] bg-slate-50/90 px-1.5 py-2.5 text-center text-[12px] font-black leading-[1.25] text-slate-600"
            >
              <span className="flex h-[22px] items-center justify-center text-blue-700">
                <Icon type={icon} />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pager({ active }) {
  return (
    <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-[10px]">
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`rounded-full transition ${
            active === index
              ? "h-[9px] w-[9px] bg-blue-600"
              : "h-[7px] w-[7px] bg-[#dbe3ef]"
          }`}
          aria-label={`${index + 1}번째 섹션으로 이동`}
        />
      ))}
    </div>
  );
}

export default function Onboarding() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-[#f8fafc] text-slate-950">
      <header className="fixed left-0 right-0 top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/60 bg-[#f8fafc]/75 px-[42px] backdrop-blur-[18px]">
        <a
          href="#hero"
          className="inline-flex items-center text-[28px] font-black tracking-[-0.9px] text-blue-600 no-underline"
        >
          Articlue.
        </a>

        <Link
          to="/login"
          className="rounded-full px-[14px] py-[10px] text-[14px] font-black text-slate-600 no-underline transition hover:bg-slate-100 hover:text-slate-950"
        >
          로그인
        </Link>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="relative flex min-h-screen items-center overflow-hidden px-[42px] pb-16 pt-[104px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(37,99,235,0.07),transparent_30%)]" />

          <div className="relative z-[1] mx-auto grid w-full max-w-[1160px] grid-cols-[1fr_.88fr] items-center gap-[62px] max-[900px]:grid-cols-1 max-[900px]:gap-[30px]">
            <div>
              {index === 0 ? (
                <h1 className="mb-6 break-keep text-[52px] font-black leading-[1.18] tracking-[-2.4px] text-slate-950 max-[900px]:text-[38px]">
                  {section.title}
                </h1>
              ) : (
                <h2 className="mb-[22px] break-keep text-[44px] font-black leading-[1.2] tracking-[-1.7px] text-slate-950 max-[900px]:text-[34px]">
                  {section.title}
                </h2>
              )}

              <p className="mb-[34px] max-w-[560px] break-keep text-[17px] font-bold leading-[1.9] text-slate-600 max-[900px]:text-[15px]">
                {section.lead}
              </p>

              {section.final ? (
                <div className="mt-[30px] rounded-[26px] border border-blue-100 bg-white/80 p-6 shadow-[0_16px_38px_rgba(37,99,235,0.10)] backdrop-blur-[10px]">
                  <div className="mb-[14px] text-[18px] font-black tracking-[-0.4px] text-slate-950">
                    지금 바로 Articlue를 시작해보세요
                  </div>

                  <div className="mb-3 flex flex-wrap gap-[10px]">
                    <Link
                      to="/signup"
                      className="inline-flex rounded-full border border-blue-600 bg-blue-600 px-6 py-[15px] text-[15px] font-black text-white no-underline shadow-[0_14px_26px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      회원가입 후 시작하기
                    </Link>

                    <Link
                      to="/login"
                      className="inline-flex rounded-full border border-blue-600 bg-white/70 px-6 py-[15px] text-[15px] font-black text-blue-700 no-underline transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      로그인 후 시작하기
                    </Link>
                  </div>

                  <p className="text-[13px] font-extrabold leading-[1.7] text-slate-600">
                    서비스 흐름을 다시 보고 싶다면{" "}
                    <a href="#hero" className="font-black text-blue-700 no-underline">
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
                        className="inline-flex rounded-full border border-blue-600 bg-blue-600 px-[22px] py-[14px] text-[15px] font-black text-white no-underline shadow-[0_14px_26px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                      >
                        {section.primary.label}
                      </Link>
                    )}

                    {section.secondary && (
                      <a
                        href={section.secondary.href}
                        className="inline-flex rounded-full border border-blue-600 bg-white/70 px-[22px] py-[14px] text-[15px] font-black text-blue-700 no-underline transition hover:-translate-y-0.5 hover:bg-blue-50"
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

          <Pager active={section.dots} />
        </section>
      ))}
    </main>
  );
}