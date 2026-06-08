export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-[13px] font-black text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Section({ id, title, description, action, children }) {
  return (
    <section
      id={id}
      className="mb-5 scroll-mt-[96px] rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-[18px] flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-[7px] text-[20px] font-black tracking-[-0.4px] text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-[14px] leading-[1.6] text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Modal({ open, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/45 px-5 backdrop-blur-sm">
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-[14px] py-[13px] text-[14px] font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950 dark:disabled:bg-slate-900 dark:disabled:text-slate-500";

export const textareaClass =
  "min-h-[130px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-[14px] py-[13px] text-[14px] font-bold leading-7 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-[18px] py-[11px] text-[14px] font-black text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-blue-600 px-[18px] py-[11px] text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700";

export const outlineButtonClass =
  "inline-flex items-center justify-center rounded-full border border-blue-600 bg-transparent px-[18px] py-[11px] text-[14px] font-black text-blue-700 transition hover:-translate-y-0.5 dark:text-blue-300";
