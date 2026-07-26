"use client";

import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SPRING } from "../lib/motion";
import { LoginForm } from "../components/login/LoginForm";

export function LoginPage({ mode: initialMode = "login" }: { mode?: "login" | "signup" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode = modeParam === "login" || modeParam === "signup" ? modeParam : initialMode;

  const switchMode = (newMode: "login" | "signup") => {
    setSearchParams({ mode: newMode }, { replace: true });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={SPRING}
      className="min-h-screen bg-white relative overflow-hidden"
    >
      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ ...SPRING, duration: 0.5 }}
          className="w-full"
        >
          <LoginForm onSwitchMode={switchMode} mode={mode} onLayoutComplete={() => {}} />
        </motion.div>
      </div>
    </motion.main>
  );
}
