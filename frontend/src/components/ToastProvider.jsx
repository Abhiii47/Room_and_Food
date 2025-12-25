// src/components/ToastProvider.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, opts={})=>{
    const id = Date.now() + Math.random().toString(36).slice(2,8);
    const toast = { id, message, type: opts.type || "info", duration: opts.duration ?? 4200 };
    setToasts(t => [toast, ...t]);
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), toast.duration);
    return id;
  },[]);
  const remove = useCallback((id)=> setToasts(t => t.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div aria-live="polite" className="fixed right-6 bottom-6 z-[9999] flex flex-col gap-3">
        {toasts.map(t=>(
          <div key={t.id} className={`max-w-sm w-full p-3 rounded-lg shadow-lg transform-gpu ${t.type==='success' ? 'bg-green-600 text-white' : t.type==='error' ? 'bg-red-600 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm">{t.message}</div>
              <button onClick={()=>remove(t.id)} className="text-xs opacity-80">✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
