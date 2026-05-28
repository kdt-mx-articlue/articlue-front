import { Link } from "react-router-dom";
import { useState } from "react";
import AppLayout from "../components/AppLayout.jsx";

const summaryCards = [
  {
    label: "포트폴리오 완성도",
    badge: "보완 권장",
    badgeClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
    value: "72점",
    desc: "구현 내용은 충분하지만 문제 정의, 성능 개선 수치, 협업 과정 설명이 더 필요합니다.",
  },
  {
    label: "기업 JD 적합도",
    badge: "양호",
    badgeClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    value: "81%",
    desc: "백엔드 서버 설계와 API 경험은 직무 요구와 잘 맞습니다. 운영 경험을 추가하면 더 강해집니다.",
  },
  {
    label: "우선 보완 역량",
    badge: "긴급 보완",
    badgeClass: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
    value: "인프라·배포",
    desc: "Docker, AWS, CI/CD 경험이 약하게 드러나 백엔드 실무 투입 가능성 설득이 부족합니다.",
  },
];

const scores = [
  ["서버 설계", 92],
  ["API 구현", 86],
  ["협업 문서화", 73],
  ["비즈니스 표현", 64],
  ["인프라 운영", 58],
];

const recommendedCompanies = [
  {
    rank: "TOP 1",
    company: "네이버웹툰",
    role: "Backend Engineer",
    match: 91,
    reason:
      "Redis 캐싱, API 설계, 대용량 트래픽 처리 경험이 백엔드 JD와 높게 일치합니다.",
    improvement: "AWS · CI/CD 경험을 추가하면 적합도를 더 높일 수 있어요.",
    skills: ["Redis", "API 설계", "대용량 트래픽"],
    tone: "border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
  },
  {
    rank: "TOP 2",
    company: "토스",
    role: "Server Developer",
    match: 88,
    reason:
      "성능 개선과 안정적인 서버 운영 경험이 결제·금융 서비스 백엔드 역량과 잘 연결됩니다.",
    improvement: "장애 대응과 운영 안정성 사례를 추가하면 설득력이 올라가요.",
    skills: ["Spring", "성능 개선", "서버 안정성"],
    tone: "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  },
  {
    rank: "TOP 3",
    company: "카카오",
    role: "Platform Backend",
    match: 84,
    reason:
      "플랫폼 구조 이해와 협업 기반 개발 경험이 서비스 운영형 백엔드 직무와 맞습니다.",
    improvement: "협업 산출물과 플랫폼 운영 경험을 보강하면 좋아요.",
    skills: ["Platform", "협업", "운영 경험"],
    tone: "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  },
];

const weaknesses = [
  {
    title: "인프라·배포 경험",
    chip: "긴급 보완",
    chipClass: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
    desc: "Docker, AWS, CI/CD 키워드가 포트폴리오에 약하게 드러나 운영 가능한 백엔드 역량 설득이 부족합니다.",
    action: "배포 구조, 장애 대응, 자동화 파이프라인 경험을 3문장으로 추가하세요.",
  },
  {
    title: "비즈니스 임팩트 설명",
    chip: "보완 권장",
    chipClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
    desc: "Redis 캐싱 경험은 있으나 트래픽 개선, 응답 속도, 사용자 경험 개선으로 연결되는 설명이 부족합니다.",
    action: "“문제 → 기술 선택 → 개선 결과” 구조로 프로젝트 문장을 재작성하세요.",
  },
  {
    title: "협업 과정 증명",
    chip: "유지 강화",
    chipClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    desc: "협업 경험은 확인되지만 코드 리뷰, 이슈 관리, 문서화 방식이 더 구체적이면 신뢰도가 올라갑니다.",
    action: "GitHub Issue, PR, 회고 문서 등 협업 산출물을 연결하세요.",
  },
];

const nextActions = [
  [
    "1",
    "포트폴리오 문장 보강",
    "기능 구현 중심 문장을 문제 해결 과정과 성과 중심 문장으로 바꿉니다.",
  ],
  [
    "2",
    "인프라 경험 추가",
    "AWS 배포, Docker 컨테이너, CI/CD 자동화 흐름을 별도 항목으로 정리합니다.",
  ],
  [
    "3",
    "면접 답변으로 전환",
    "보완된 경험을 바탕으로 압박 질문과 꼬리 질문에 대응할 답변을 생성합니다.",
  ],
];

const feedbackCards = [
  [
    "포트폴리오 보완 제안",
    "현재 프로젝트 설명은 기능 구현 중심입니다. 문제 해결 과정과 성능 개선 수치를 함께 작성하면 더 높은 평가를 받을 수 있습니다.",
  ],
  [
    "추천 학습 방향",
    "AWS 배포 경험과 Docker 기반 컨테이너 환경 구축 경험을 추가하면 백엔드 서버 직무 매칭률 향상에 도움이 됩니다.",
  ],
];

export default function Growth() {
  const [toast, setToast] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <AppLayout title="커리어 분석 리포트">
      <section className="relative mb-[22px] grid grid-cols-[1.25fr_.75fr] items-center gap-7 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] p-[34px] text-white shadow-[0_18px_55px_rgba(37,99,235,0.12)]">
        <div className="relative z-10">
          <h2 className="mb-3 mt-[6px] break-keep text-[32px] font-black leading-[1.25] tracking-[-1px]">
            내 포트폴리오의 약점을 진단하고 합격 가능성을 높일 성장 루트를
            확인하세요.
          </h2>

          <p className="max-w-[670px] break-keep text-[15px] leading-[1.75] opacity-95">
            기술 스택과 프로젝트 경험을 기업 JD 기준으로 다시 해석해, 부족한
            역량·보완 이유·다음 액션을 한 화면에서 정리합니다.
          </p>

          <div className="mt-5 flex flex-wrap gap-[10px]">
            <button
              type="button"
              onClick={() => showToast("맞춤 보완 루트를 생성했습니다.")}
              className="rounded-full bg-white px-[18px] py-3 text-[14px] font-black text-blue-700"
            >
              부족한 역량 보완하러 가기
            </button>

            <Link
              to="/interview"
              className="rounded-full border border-white/60 px-[18px] py-3 text-[14px] font-black text-white"
            >
              맞춤 면접 질문 생성하기
            </Link>
          </div>
        </div>

        <div className="relative z-10 rounded-[24px] border border-white/25 bg-white/15 p-[18px] backdrop-blur-md">
          <div className="mb-[14px] text-[13px] font-black opacity-90">
            종합 성장 준비도
          </div>

          <div className="mb-[11px] flex items-end justify-between gap-3">
            <strong className="text-[42px] font-black leading-none tracking-[-1px]">
              72%
            </strong>
            <span className="text-[13px] font-black opacity-90">보완 권장</span>
          </div>

          <div className="mb-[13px] h-[10px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[72%] rounded-full bg-white" />
          </div>

          <p className="text-[13px] leading-[1.6] opacity-90">
            서버 설계는 강점이지만 인프라 운영 경험과 비즈니스 성과 표현을
            보완하면 추천 기업 적합도가 높아집니다.
          </p>
        </div>

        <div className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full bg-white/15" />
      </section>

      <section className="mb-[22px] rounded-[28px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-[20px] flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
              AI Recommended Companies
            </p>

            <h3 className="text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              추천 기업 TOP 3
            </h3>

            <p className="mt-2 break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              현재 포트폴리오와 기술 경험을 기준으로 지원 가능성이 높은
              기업을 우선순위로 정리했습니다.
            </p>
          </div>

          <Link
            to="/fitting"
            className="shrink-0 rounded-full border border-blue-600 px-[16px] py-[10px] text-[13px] font-black text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
          >
            전체 추천 보기
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-[14px]">
          {recommendedCompanies.map((company) => (
            <article
              key={company.company}
              className={`rounded-[24px] border p-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${company.tone}`}
            >
              <div className="mb-[14px] flex items-start justify-between gap-3">
                <div>
                  <span className="mb-2 inline-flex rounded-full bg-white/80 px-[10px] py-[6px] text-[12px] font-black text-blue-700 dark:bg-slate-900/70 dark:text-blue-300">
                    {company.rank}
                  </span>

                  <h4 className="text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
                    {company.company}
                  </h4>

                  <p className="mt-1 text-[13px] font-extrabold text-slate-600 dark:text-slate-300">
                    {company.role}
                  </p>
                </div>

                <div className="text-right">
                  <strong className="block text-[28px] font-black leading-none text-emerald-600 dark:text-emerald-300">
                    {company.match}%
                  </strong>

                  <span className="mt-1 block text-[11px] font-black text-slate-500 dark:text-slate-400">
                    적합도
                  </span>
                </div>
              </div>

              <div className="mb-[14px] rounded-[18px] bg-white/70 p-[14px] dark:bg-slate-900/60">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.08em] text-blue-700 dark:text-blue-300">
                  추천 이유
                </p>

                <p className="break-keep text-[13px] font-bold leading-[1.65] text-slate-700 dark:text-slate-300">
                  {company.reason}
                </p>
              </div>

              <div className="mb-[14px] flex flex-wrap gap-[7px]">
                {company.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/70 bg-white/80 px-[9px] py-[6px] text-[12px] font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mb-[16px] rounded-2xl border border-dashed border-slate-300 px-[12px] py-[10px] text-[12px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {company.improvement}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCompany(company)}
                  className="rounded-full bg-blue-600 px-[12px] py-[10px] text-center text-[12px] font-black text-white transition hover:bg-blue-700"
                >
                  공고 분석 보기
                </button>

                <Link
                  to="/interview"
                  className="rounded-full border border-blue-600 bg-white/80 px-[12px] py-[10px] text-center text-[12px] font-black text-blue-700 transition hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  면접 준비
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-[22px] grid grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[26px] border border-slate-200 bg-white p-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-[14px] flex items-center justify-between gap-3">
              <span className="text-[13px] font-black text-slate-600 dark:text-slate-300">
                {card.label}
              </span>

              <span
                className={`rounded-full px-[10px] py-[7px] text-[12px] font-black ${card.badgeClass}`}
              >
                {card.badge}
              </span>
            </div>

            <div className="mb-2 text-[28px] font-black tracking-[-0.8px] text-slate-900 dark:text-white">
              {card.value}
            </div>

            <p className="break-keep text-[13px] leading-[1.65] text-slate-600 dark:text-slate-300">
              {card.desc}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-5 grid grid-cols-[1.05fr_.95fr] gap-5">
        <article className="flex min-h-[360px] flex-col rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-[18px]">
            <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
              역량별 진단 스코어
            </h3>

            <p className="break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              기업 JD와 포트폴리오 키워드를 기준으로 강점과 취약점을 나눠
              보여줍니다.
            </p>
          </div>

          <div className="mt-1 flex flex-col gap-[14px]">
            {scores.map(([label, score]) => (
              <div
                key={label}
                className="grid grid-cols-[110px_1fr_44px] items-center gap-3"
              >
                <span className="text-[13px] font-black text-slate-600 dark:text-slate-300">
                  {label}
                </span>

                <div className="h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                    style={{ width: `${score}%` }}
                  />
                </div>

                <span className="text-right text-[13px] font-black text-slate-900 dark:text-white">
                  {score}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-[18px] rounded-[20px] bg-blue-50 p-4 text-[13px] font-extrabold leading-[1.65] text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            가장 먼저 보완할 영역은 인프라 운영과 비즈니스 임팩트 설명입니다.
            기술을 단순 나열하지 말고 결과와 수치로 연결하세요.
          </div>
        </article>

        <article className="rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-[18px]">
            <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
              우선순위 약점 진단
            </h3>

            <p className="break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              부족한 이유와 바로 실행할 액션을 함께 제공합니다.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {weaknesses.map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-slate-200 bg-white p-[17px] transition-colors dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-[10px] flex items-center justify-between gap-3">
                  <span className="text-[15px] font-black text-slate-900 dark:text-white">
                    {item.title}
                  </span>

                  <span
                    className={`rounded-full px-[10px] py-[6px] text-[12px] font-black ${item.chipClass}`}
                  >
                    {item.chip}
                  </span>
                </div>

                <p className="mb-3 break-keep text-[14px] leading-[1.7] text-slate-600 dark:text-slate-300">
                  {item.desc}
                </p>

                <div className="rounded-2xl bg-slate-100 px-[14px] py-[13px] text-[13px] font-extrabold leading-[1.6] text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <span className="font-black text-blue-700 dark:text-blue-300">
                    액션:
                  </span>{" "}
                  {item.action}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mb-5">
        <div className="mb-[14px]">
          <h3 className="text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            다음 액션 추천
          </h3>

          <p className="mt-2 break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
            추천 기업 적합도를 높이기 위해 지금 바로 실행할 수 있는 순서입니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {nextActions.map(([num, title, desc]) => (
            <article
              key={num}
              className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors after:absolute after:-right-9 after:-top-10 after:h-[110px] after:w-[110px] after:rounded-full after:bg-blue-600/10 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-[14px] flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-[13px] font-black text-white">
                {num}
              </div>

              <h4 className="mb-[9px] text-[16px] font-black text-slate-900 dark:text-white">
                {title}
              </h4>

              <p className="break-keep text-[13px] leading-[1.65] text-slate-600 dark:text-slate-300">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-[26px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-[18px]">
          <h3 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            AI 성장 피드백
          </h3>

          <p className="break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
            현재 진단 결과를 바탕으로 다음 행동을 선택하세요.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-[14px]">
          {feedbackCards.map(([title, desc]) => (
            <div
              key={title}
              className="rounded-[20px] border border-slate-200 bg-slate-100 p-[18px] transition-colors dark:border-slate-700 dark:bg-slate-800"
            >
              <strong className="mb-[10px] block text-[15px] font-black text-slate-900 dark:text-white">
                {title}
              </strong>

              <p className="break-keep text-[14px] leading-[1.75] text-slate-600 dark:text-slate-300">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-[22px] flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => showToast("맞춤 성장 루트를 저장했습니다.")}
            className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white"
          >
            부족한 역량 보완하러 가기
          </button>

          <Link
            to="/interview"
            className="rounded-full border border-blue-600 px-[18px] py-3 text-[14px] font-black text-blue-700 dark:text-blue-300"
          >
            맞춤 면접 질문 생성하기
          </Link>

          <Link
            to="/fitting"
            className="rounded-full border border-slate-200 bg-slate-100 px-[18px] py-3 text-[14px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            추천 기업 다시 확인하기
          </Link>
        </div>
      </section>

      {selectedCompany && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/70 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-[720px] rounded-[32px] bg-white p-[30px] shadow-[0_30px_80px_rgba(15,23,42,0.25)] dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[18px] font-black text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              ×
            </button>

            <div className="mb-[24px]">
              <span className="mb-3 inline-flex rounded-full bg-blue-100 px-[12px] py-[7px] text-[12px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {selectedCompany.rank}
              </span>

              <h3 className="mt-3 text-[32px] font-black tracking-[-1px] text-slate-900 dark:text-white">
                {selectedCompany.company}
              </h3>

              <p className="mt-2 text-[15px] font-bold text-slate-600 dark:text-slate-300">
                {selectedCompany.role}
              </p>
            </div>

            <div className="mb-[22px] rounded-[24px] bg-slate-100 p-[20px] dark:bg-slate-800">
              <div className="mb-3 flex items-end justify-between gap-4">
                <span className="text-[14px] font-black text-slate-600 dark:text-slate-300">
                  AI 적합도 분석
                </span>

                <strong className="text-[42px] font-black leading-none text-emerald-600 dark:text-emerald-300">
                  {selectedCompany.match}%
                </strong>
              </div>

              <div className="mb-[14px] h-[10px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  style={{ width: `${selectedCompany.match}%` }}
                />
              </div>

              <p className="break-keep text-[14px] leading-[1.7] text-slate-700 dark:text-slate-300">
                {selectedCompany.reason}
              </p>
            </div>

            <div className="mb-[20px]">
              <h4 className="mb-3 text-[15px] font-black text-slate-900 dark:text-white">
                핵심 기술 키워드
              </h4>

              <div className="flex flex-wrap gap-[8px]">
                {selectedCompany.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-slate-200 bg-slate-100 px-[12px] py-[8px] text-[13px] font-black text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-[24px] rounded-[22px] border border-dashed border-slate-300 p-[18px] dark:border-slate-700">
              <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
                적합도를 더 높이려면
              </p>

              <p className="break-keep text-[14px] leading-[1.7] text-slate-700 dark:text-slate-300">
                {selectedCompany.improvement}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/fitting"
                className="rounded-[18px] bg-blue-600 px-[18px] py-[15px] text-center text-[14px] font-black text-white transition hover:bg-blue-700"
              >
                상세 분석 화면으로 이동
              </Link>

              <Link
                to="/interview"
                className="rounded-[18px] border border-slate-300 px-[18px] py-[15px] text-center text-[14px] font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                면접 질문 생성하기
              </Link>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-7 right-7 z-[999] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-extrabold text-white transition-all dark:bg-white dark:text-slate-900 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        {toast || "처리되었습니다."}
      </div>
    </AppLayout>
  );
}