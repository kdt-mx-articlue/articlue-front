import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout({ title, children }) {
  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Topbar title={title} />

        <div className="w-full max-w-[1240px] mx-auto px-10 py-[34px] pb-[70px]">
          {children}
        </div>
      </main>
    </div>
  );
}