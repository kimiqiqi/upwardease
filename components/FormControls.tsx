import React from "react";

export const Button = ({ children, variant = "primary", className = "", ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-eggplant text-white hover:bg-eggplant/90",
    secondary: "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600",
    outline: "border-2 border-eggplant text-eggplant dark:text-teal-300 dark:border-teal-300 hover:bg-eggplant/10 dark:hover:bg-teal-300/10",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>}
    <input className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-eggplant dark:focus:ring-teal-400" {...props} />
  </div>
);

export const Textarea = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>}
    <textarea className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-eggplant dark:focus:ring-teal-400 resize-none" {...props} />
  </div>
);

export const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants = {
    default: "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200",
    pending: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200",
    approved: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
    rejected: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200",
    admin: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200",
    superadmin: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200",
    user: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto text-slate-800 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
};
