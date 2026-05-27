import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col">
        <Topbar title={title} />

        <section className="w-full max-w-[1240px] mx-auto px-10 pt-[34px] pb-[70px]">
          {children}
        </section>
      </main>
    </div>
  );
}