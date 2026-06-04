import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";

const FAVORITE_KEY = "articlue_favorite_jobs";

const companies = [
  {
    id: "naver",
    logo: "NW",
    company: "네이버웹툰",
    role: "Backend Server Developer",
    score: "92%",
    reasons: [
      "Redis 캐싱 경험이 대용량 트래픽 처리 JD와 직접 연결됩니다.",
      "API 설계 경험이 백엔드 핵심 요구사항과 일치합니다.",
    ],
    stacks: ["Redis", "Spring Boot", "대용량 트래픽", "Kafka"],
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
      project:
        "Redis 캐싱을 적용해 반복 조회 API 속도를 개선하고 DB 부하를 감소시킨 경험이 있습니다.",
    },
    favorite: {
      reason:
        "Redis 캐싱과 대용량 트래픽 처리 경험이 네이버웹툰 백엔드 JD와 높게 맞습니다.",
      desc:
        "대용량 트래픽 처리 경험과 Redis 캐싱 구조 경험이 JD 핵심 요구사항과 높은 연관성을 보입니다.",
      stacks: ["Java", "Spring Boot", "Redis", "Kafka"],
    },
  },
  {
    id: "toss",
    logo: "TS",
    company: "토스",
    role: "Server Developer",
    score: "88%",
    reasons: [
      "서버 구조 개선 경험이 금융 서비스 안정성 요구와 맞닿아 있습니다.",
      "데이터 처리 경험이 결제 도메인의 신뢰성 기준과 연결됩니다.",
    ],
    stacks: ["Node.js", "MySQL", "성능 개선", "MSA"],
    panel: {
      title: "토스 준비하기",
      desc: "금융 서비스에서 중요한 안정성과 신뢰성을 중심으로 지원 전략을 구성합니다.",
      previewTitle: "안정적인 서버 구조 개선 경험 강조",
      previewText:
        "서버 구조 개선과 데이터 처리 경험을 결제 서비스의 안정성, 장애 예방, 응답 속도 개선 관점으로 정리합니다.",
    },
    essay: {
      title: "토스 맞춤 자소서",
      motivation:
        "금융 서비스에서 중요한 안정성과 확장성을 고려한 백엔드 개발 역량을 강화해왔습니다.",
      project:
        "Node.js 기반 서버 구조 개선과 MySQL 최적화를 통해 응답 속도를 개선한 경험이 있습니다.",
    },
    favorite: {
      reason:
        "서버 구조 개선과 데이터 처리 경험이 금융 서비스 안정성 요구와 연결됩니다.",
      desc:
        "서버 구조 개선 경험과 금융 서비스의 안정성 요구사항이 높은 관련성을 보입니다.",
      stacks: ["Node.js", "TypeScript", "MySQL", "MSA"],
    },
  },
  {
    id: "kakao",
    logo: "KK",
    company: "카카오",
    role: "Platform Server Developer",
    score: "84%",
    reasons: [
      "REST API 설계 경험이 플랫폼 서버 개발 요구사항과 맞습니다.",
      "운영 개선 경험이 서비스 안정화 역량으로 해석됩니다.",
    ],
    stacks: ["Java", "REST API", "운영 개선", "AWS"],
    panel: {
      title: "카카오 준비하기",
      desc: "플랫폼 서버 개발에서 요구하는 API 설계와 운영 개선 역량을 중심으로 준비합니다.",
      previewTitle: "운영 가능한 API 설계 경험 강조",
      previewText:
        "REST API 설계 경험과 서비스 운영 개선 사례를 확장성, 유지보수성, 사용자 영향 관점으로 정리합니다.",
    },
    essay: {
      title: "카카오 맞춤 자소서",
      motivation:
        "사용자 중심 서비스 운영 경험을 바탕으로 안정적인 서버 개발을 수행하고 싶습니다.",
      project:
        "REST API 설계와 서비스 유지보수 과정에서 장애 대응 경험을 축적했습니다.",
    },
    favorite: {
      reason:
        "REST API 설계와 서비스 운영 개선 경험이 플랫폼 서버 개발 직무와 잘 맞습니다.",
      desc:
        "REST API 설계 경험과 서비스 운영 개선 경험이 공고 조건과 연결됩니다.",
      stacks: ["Java", "MySQL", "Kubernetes", "AWS"],
    },
  },
];

function BookmarkIcon({ active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-[19px] w-[19px] ${
        active
          ? "fill-blue-600/20 stroke-blue-600 dark:fill-blue-400/20 dark:stroke-blue-300"
          : "fill-none stroke-slate-500 dark:stroke-slate-400"
      }`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3.5H18C18.8284 3.5 19.5 4.17157 19.5 5V20.5L12 16L4.5 20.5V5C4.5 4.17157 5.17157 3.5 6 3.5Z" />
    </svg>
  );
}

export default function Fitting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState("naver");
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState("");
  const [essayModal, setEssayModal] = useState(null);

  const selected = useMemo(
    () => companies.find((company) => company.id === selectedId) || companies[0],
    [selectedId]
  );

  useEffect(() => {
    const companyName = searchParams.get("company");

    if (!companyName) return;

    const matched = companies.find((company) => company.company === companyName);

    if (matched) {
      setSelectedId(matched.id);
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "[]");
      setFavorites(Array.isArray(saved) ? saved : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const isLiked = (id) => favorites.some((job) => job.id === id);

  const toggleFavoriteJob = (company) => {
    setFavorites((prev) => {
      const exists = prev.some((job) => job.id === company.id);

      const next = exists
        ? prev.filter((job) => job.id !== company.id)
        : [
            ...prev,
            {
              id: company.id,
              reason: company.favorite.reason,
              company: company.company,
              role: company.role,
              match: company.score,
              desc: company.favorite.desc,
              stacks: company.favorite.stacks,
              tags: company.favorite.stacks,
              savedAt: new Date().toISOString(),
            },
          ];

      localStorage.setItem(FAVORITE_KEY, JSON.stringify(next));
      showToast(
        exists
          ? "관심 기업이 삭제되었습니다."
          : "관심 기업이 저장되었습니다."
      );

      return next;
    });
  };

  const generateResume = (company) => {
    setSelectedId(company.id);

    const saved = JSON.parse(
      localStorage.getItem("articlue_cover_letters") || "{}"
    );

    localStorage.setItem(
      "articlue_cover_letters",
      JSON.stringify({
        ...saved,
        [company.id]: {
          지원동기: company.essay.motivation,
          프로젝트경험: company.essay.project,
          savedAt: new Date().toISOString(),
        },
      })
    );

    setEssayModal(company);
    showToast("맞춤 자소서가 저장되었습니다.");
  };

  const goInterview = (company) => {
    setSelectedId(company.id);
    localStorage.setItem("articlue_interview_company", company.company);
    localStorage.setItem("articlue_interview_role", company.role);
    navigate(`/interview?company=${encodeURIComponent(company.company)}`);
  };

  return (
    <AppLayout title="커리어 피팅 & 맞춤 자소서">
      <div className="mx-auto w-full max-w-[1120px]">
        <section className="relative mb-5 grid grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)] items-center gap-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] px-[30px] py-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <div className="relative z-10 min-w-0">
            <h2 className="mb-[10px] break-keep text-[28px] font-black leading-[1.25] tracking-[-0.9px]">
              내 이력서와 가장 잘 맞는 기업을 확인하세요
            </h2>

            <p className="max-w-[650px] break-keep text-[14px] leading-[1.7] opacity-95">
              기술 경험, JD 키워드, 포트폴리오 근거를 기준으로 추천 기업을
              정렬했습니다. 기업을 선택하면 맞춤 자소서와 실전 면접 준비까지
              바로 이어집니다.
            </p>

            <div className="mt-[18px] flex flex-wrap gap-[10px]">
              <a
                href="#recommendations"
                className="inline-flex items-center justify-center rounded-full bg-white px-[18px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5 dark:bg-white dark:text-blue-700"
              >
                추천 기업 보기
              </a>

              <Link
                to="/resume"
                onClick={() =>
                  localStorage.setItem("articlue_resume_continue", "true")
                }
                className="inline-flex items-center justify-center rounded-full border border-white/50 px-[18px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                이력서 보완하기
              </Link>
            </div>
          </div>

          <div
            className="relative z-10 min-w-0 rounded-[24px] border border-white/25 bg-white/15 px-[18px] py-4 backdrop-blur-md"
            aria-label="추천 요약"
          >
            <div className="mb-3 text-[13px] font-black opacity-90">
              현재 최고 적합 기업
            </div>

            <div className="mb-[10px]">
              <strong className="block text-[34px] font-black leading-none tracking-[-1px]">
                92%
              </strong>
              <span className="mt-2 block text-[13px] font-extrabold opacity-90">
                네이버웹툰 · Backend
              </span>
            </div>

            <div className="mb-3 h-[9px] overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[92%] rounded-full bg-white" />
            </div>

            <div className="flex flex-wrap gap-[7px]">
              {["Redis", "대용량 트래픽", "API 설계"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/15 px-[10px] py-[7px] text-[12px] font-black"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute -right-[90px] -top-[110px] h-[320px] w-[320px] rounded-full bg-white/15" />
        </section>

        <div
          id="recommendations"
          className="mb-3 mt-5 flex scroll-mt-[92px] items-end justify-between gap-4"
        >
          <div>
            <h2 className="mb-[6px] text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
              상위 추천 기업 3개
            </h2>
            <p className="break-keep text-[14px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
              매칭률보다 중요한 것은 추천 근거입니다. 각 기업 카드에서 왜
              추천됐는지 먼저 확인해보세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="추천 필터">
            {["적합도순", "백엔드", "자소서 가능"].map((chip, index) => (
              <span
                key={chip}
                className={`rounded-full border px-3 py-2 text-[13px] font-black transition-colors ${
                  index === 0
                    ? "border-blue-100 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 items-start gap-4">
          <div className="flex flex-col gap-[10px]">
            {companies.map((company) => {
              const active = selectedId === company.id;
              const liked = isLiked(company.id);

              return (
                <article
                  key={company.id}
                  onClick={() => setSelectedId(company.id)}
                  className={`min-h-[142px] cursor-pointer rounded-[22px] border bg-white px-[18px] py-4 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-blue-100 dark:bg-slate-900 ${
                    active
                      ? "border-blue-600 shadow-[0_14px_36px_rgba(37,99,235,0.13)] dark:border-blue-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="mb-[10px] grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {company.logo}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 text-[18px] font-black text-slate-900 dark:text-white">
                        {company.company}
                      </div>
                      <div className="text-[13px] font-extrabold text-slate-600 dark:text-slate-300">
                        {company.role}
                      </div>
                    </div>

                    <div>
                      <div className="text-right text-[28px] font-black tracking-[-0.8px] text-emerald-600 dark:text-emerald-400">
                        {company.score}
                      </div>
                      <div className="mt-[3px] text-right text-[12px] font-black text-slate-400 dark:text-slate-500">
                        직무 적합도
                      </div>
                    </div>
                  </div>

                  <div className="mb-[10px] rounded-2xl bg-slate-100 px-[14px] py-[11px] dark:bg-slate-800">
                    <strong className="mb-2 block text-[13px] font-black text-blue-800 dark:text-blue-300">
                      왜 추천됐나요?
                    </strong>

                    <ul className="flex flex-col gap-[7px]">
                      {company.reasons.map((reason) => (
                        <li
                          key={reason}
                          className="flex break-keep text-[13px] font-bold leading-[1.55] text-slate-600 before:mr-2 before:mt-2 before:h-[6px] before:w-[6px] before:shrink-0 before:rounded-full before:bg-blue-600 before:content-[''] dark:text-slate-300"
                        >
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-[10px] flex flex-wrap gap-[7px]">
                    {company.stacks.map((stack, index) => (
                      <span
                        key={stack}
                        className={`rounded-full px-[10px] py-[7px] text-[12px] font-black ${
                          index === company.stacks.length - 1
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {stack}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        generateResume(company);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      맞춤 자소서 생성
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goInterview(company);
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-white px-[18px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 dark:border-blue-500 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
                    >
                      실전 면접 준비
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavoriteJob(company);
                      }}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5 ${
                        liked
                          ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                          : "border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-blue-950/50"
                      }`}
                      aria-label={`${company.company} 공고 찜하기`}
                    >
                      <BookmarkIcon active={liked} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside
            className="grid min-h-[142px] grid-cols-[auto_minmax(170px,.85fr)_minmax(280px,1.15fr)_minmax(300px,1fr)_minmax(150px,.55fr)] items-center gap-[14px] rounded-[22px] border border-blue-100 bg-white px-[18px] py-4 shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-blue-900 dark:bg-slate-900"
            aria-label="선택 기업 준비 패널"
          >
            <div className="flex h-[50px] w-[50px] rotate-[-6deg] items-center justify-center rounded-xl bg-[#13c85a] text-center text-[11px] font-black leading-none tracking-[-0.5px] text-white shadow-[0_8px_18px_rgba(16,185,129,0.18)]">
              WEB
              <br />
              TOON
            </div>

            <div>
              <h3 className="mb-2 text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
                {selected.panel.title}
              </h3>
              <p className="break-keep text-[13px] font-bold leading-[1.6] text-slate-600 dark:text-slate-300">
                {selected.panel.desc}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-[14px] dark:border-blue-900 dark:from-blue-950/45 dark:to-slate-900">
              <div className="mb-2 text-[12px] font-black text-blue-800 dark:text-blue-300">
                맞춤 자소서 방향
              </div>
              <div className="mb-[6px] text-[14px] font-black text-slate-900 dark:text-white">
                {selected.panel.previewTitle}
              </div>
              <p className="break-keep text-[12px] font-bold leading-[1.55] text-slate-600 dark:text-slate-300">
                {selected.panel.previewText}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["1", "기업 선택"],
                ["2", "자소서 생성"],
                ["3", "면접 대비"],
              ].map(([num, label]) => (
                <div
                  key={num}
                  className="rounded-2xl border border-slate-200 bg-slate-100 px-[10px] py-[11px] text-center dark:border-slate-700 dark:bg-slate-800"
                >
                  <span className="mb-[7px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[12px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {num}
                  </span>
                  <strong className="block text-[12px] font-black leading-[1.35] text-slate-900 dark:text-white">
                    {label}
                  </strong>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => generateResume(selected)}
                className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                자소서 생성
              </button>

              <button
                type="button"
                onClick={() => goInterview(selected)}
                className="rounded-full border border-blue-600 bg-white px-[18px] py-3 text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 dark:border-blue-500 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                면접 준비
              </button>
            </div>
          </aside>
        </section>
      </div>

      {essayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-6">
          <div className="w-full max-w-[720px] rounded-[28px] border border-slate-200 bg-white p-[26px] shadow-[0_24px_80px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-[22px] font-black text-slate-900 dark:text-white">
                {essayModal.essay.title}
              </h3>

              <button
                type="button"
                onClick={() => setEssayModal(null)}
                className="h-9 w-9 rounded-full bg-slate-100 text-[14px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 rounded-[20px] border border-slate-200 bg-slate-100 p-[18px] dark:border-slate-700 dark:bg-slate-800">
              <strong className="mb-2 block text-[14px] font-black text-blue-800 dark:text-blue-300">
                지원 동기
              </strong>
              <p className="text-[14px] font-bold leading-[1.75] text-slate-600 dark:text-slate-300">
                {essayModal.essay.motivation}
              </p>
            </div>

            <div className="mb-3 rounded-[20px] border border-slate-200 bg-slate-100 p-[18px] dark:border-slate-700 dark:bg-slate-800">
              <strong className="mb-2 block text-[14px] font-black text-blue-800 dark:text-blue-300">
                프로젝트 경험
              </strong>
              <p className="text-[14px] font-bold leading-[1.75] text-slate-600 dark:text-slate-300">
                {essayModal.essay.project}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-[9px]">
              <button
                type="button"
                onClick={() =>
                  showToast("맞춤 자소서가 저장되었습니다.")
                }
                className="rounded-full bg-blue-600 px-[18px] py-3 text-[14px] font-black text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                자소서 저장
              </button>

              <button
                type="button"
                onClick={() => setEssayModal(null)}
                className="rounded-full border border-blue-600 bg-white px-[18px] py-3 text-[14px] font-black text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-7 right-7 z-[120] rounded-full bg-slate-900 px-[18px] py-[13px] text-[14px] font-black text-white transition-all dark:bg-white dark:text-slate-900 ${
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