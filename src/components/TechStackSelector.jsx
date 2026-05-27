const techStacks = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Spring",
  "Java",
  "Python",
  "MySQL",
  "Oracle",
  "Redis",
  "Docker",
  "AWS",
  "Git",
];

export default function TechStackSelector({ selectedTechs = [], onChange }) {
  const handleToggle = (tech) => {
    if (selectedTechs.includes(tech)) {
      onChange(selectedTechs.filter((item) => item !== tech));
      return;
    }

    onChange([...selectedTechs, tech]);
  };

  const handleRemove = (tech) => {
    onChange(selectedTechs.filter((item) => item !== tech));
  };

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="mb-[22px]">
        <h2 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900">
          기술 스택 선택
        </h2>
        <p className="text-[14px] leading-[1.6] text-slate-600">
          보유하고 있는 기술 스택을 선택해주세요. 선택한 기술은 기업 추천과
          면접 질문 생성에 함께 반영됩니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {techStacks.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => handleToggle(tech)}
            className={`rounded-full px-4 py-2 text-[13px] font-black transition ${
              selectedTechs.includes(tech)
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[13px] font-black text-slate-600">
          선택한 기술 스택
        </p>

        <div className="min-h-[64px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {selectedTechs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTechs.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleRemove(tech)}
                  className="rounded-full bg-blue-50 px-3 py-2 text-[13px] font-black text-blue-700"
                >
                  {tech} ×
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[13px] font-bold text-slate-400">
              아직 선택된 기술 스택이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}