import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function JobFitRadarChart({ data = [], companyName = "", jobTitle = "" }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5">
        <p className="mb-2 text-[13px] font-black text-blue-700 dark:text-blue-300">
          AI Job Fit Radar
        </p>

        <h3 className="break-keep text-[22px] font-black tracking-[-0.5px] text-slate-900 dark:text-white">
          직무 적합도 방사형 그래프
        </h3>

        <p className="mt-2 break-keep text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
          {companyName && jobTitle
            ? `${companyName} · ${jobTitle} 공고를 기준으로 기술스택, 경력조건, 주요업무, 우대사항, 조직문화 적합도를 비교합니다.`
            : "노션 공고 데이터를 기준으로 사용자의 기술스택과 직무 적합도를 비교합니다."}
        </p>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fontWeight: 700 }}
            />
            <Radar
              name="적합도"
              dataKey="score"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.24}
            />
            <Tooltip formatter={(value) => [`${value}%`, "적합도"]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div
            key={item.subject}
            className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="mb-1 block text-[12px] font-black text-slate-500 dark:text-slate-400">
              {item.subject}
            </span>
            <strong className="text-[18px] font-black text-slate-900 dark:text-white">
              {item.score}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}