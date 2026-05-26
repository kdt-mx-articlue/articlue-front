import TechStackSelector from "../components/TechStackSelector";

export default function Resume() {
  return (
    <main className="min-h-screen bg-bg p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-main mb-8">
          규격화 이력서 작성
        </h1>

        <TechStackSelector />
      </div>
    </main>
  );
}