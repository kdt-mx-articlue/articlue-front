import { useEffect, useRef, useState } from "react";

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

export default function TechStackSelector() {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const savedTechs = localStorage.getItem("articlue-resume-techs");

    if (savedTechs) {
      setSelectedTechs(JSON.parse(savedTechs));
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    localStorage.setItem(
      "articlue-resume-techs",
      JSON.stringify(selectedTechs)
    );
  }, [selectedTechs]);

  const handleToggle = (tech) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((item) => item !== tech));
      return;
    }

    setSelectedTechs([...selectedTechs, tech]);
  };

  const handleRemove = (tech) => {
    setSelectedTechs(selectedTechs.filter((item) => item !== tech));
  };

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-text-main mb-2">
        기술 스택 선택
      </h2>

      <p className="text-text-sub mb-5">
        보유하고 있는 기술 스택을 선택해주세요.
      </p>

      <div className="flex flex-wrap gap-2">
        {techStacks.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => handleToggle(tech)}
            className={
              selectedTechs.includes(tech)
                ? "bg-brand-500 text-white px-4 py-2 rounded-full font-bold"
                : "bg-slate-100 text-text-sub px-4 py-2 rounded-full font-bold hover:bg-brand-50"
            }
          >
            {tech}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold text-text-sub mb-2">
          선택한 기술 스택
        </p>

        <div className="min-h-12 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          {selectedTechs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTechs.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleRemove(tech)}
                  className="bg-brand-50 text-brand-700 px-3 py-2 rounded-full font-bold"
                >
                  {tech} ×
                </button>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">
              아직 선택된 기술 스택이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}