import { createContext, useContext, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current[id]);
  }, []);

  const push = useCallback((message, type = "info", ttl = 3800) => {
    const id = ++idSeq;
    setToasts((t) => [...t, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  const icon = { success: "✅", error: "⚠️", info: "💬" };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-region" role="region" aria-live="polite" aria-label="Notifications">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => dismiss(t.id)}
              role="status"
            >
              <span aria-hidden="true">{icon[t.type]}</span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
