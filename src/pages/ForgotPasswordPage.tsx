import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SPRING } from "../lib/motion";

type Step = "email" | "code" | "password" | "complete";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStep("code");
  };

  const submitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit verification code.");
      return;
    }
    setError("");
    setStep("password");
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep("complete");
  };

  const fieldClass = "h-14 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={SPRING}
      className="flex min-h-screen items-center justify-center bg-white px-6 py-12"
    >
      <motion.section
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, duration: 0.45 }}
        className="w-full max-w-md"
        aria-labelledby="forgot-password-title"
      >
        <Link to="/" className="inline-block text-[19px] font-semibold tracking-tight text-ink">
          MLSentinel
        </Link>

        {step === "email" && (
          <form onSubmit={submitEmail} className="mt-10 space-y-5">
            <div>
              <h1 id="forgot-password-title" className="text-[34px] font-semibold tracking-tight text-ink">
                Forgot password?
              </h1>
              <p className="mt-3 leading-relaxed text-gray-600">Enter your email and we’ll send you a verification code.</p>
            </div>
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-gray-700">Email address</label>
              <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
            </div>
            {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
            <button type="submit" className="h-14 w-full rounded-2xl bg-ink font-medium text-white transition hover:bg-black">Send verification code</button>
            <p className="text-center text-gray-600"><Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Back to login</Link></p>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="mt-10 space-y-5">
            <div>
              <h1 id="forgot-password-title" className="text-[34px] font-semibold tracking-tight text-ink">Check your email</h1>
              <p className="mt-3 leading-relaxed text-gray-600">Enter the six-digit code sent to <span className="font-medium text-ink">{email}</span>.</p>
            </div>
            <div>
              <label htmlFor="verification-code" className="mb-2 block text-sm font-medium text-gray-700">Verification code</label>
              <input
                id="verification-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`${fieldClass} text-center text-2xl font-semibold tracking-[0.45em]`}
                aria-describedby="code-help"
              />
              <p id="code-help" className="mt-2 text-sm text-gray-500">The code expires after 10 minutes.</p>
            </div>
            {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
            <button type="submit" className="h-14 w-full rounded-2xl bg-ink font-medium text-white transition hover:bg-black">Verify code</button>
            <button type="button" onClick={() => { setError(""); setStep("email"); }} className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700">Use a different email</button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={submitPassword} className="mt-10 space-y-5">
            <div>
              <h1 id="forgot-password-title" className="text-[34px] font-semibold tracking-tight text-ink">Set a new password</h1>
              <p className="mt-3 leading-relaxed text-gray-600">Choose a secure password for your MLSentinel account.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium text-gray-700">Confirm new password</label>
                <input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={fieldClass} />
              </div>
            </div>
            {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
            <button type="submit" className="h-14 w-full rounded-2xl bg-ink font-medium text-white transition hover:bg-black">Update password</button>
          </form>
        )}

        {step === "complete" && (
          <div className="mt-10 space-y-5">
            <div>
              <h1 id="forgot-password-title" className="text-[34px] font-semibold tracking-tight text-ink">Password updated</h1>
              <p className="mt-3 leading-relaxed text-gray-600">Your password has been reset successfully. You can now log in.</p>
            </div>
            <Link to="/login" className="flex h-14 w-full items-center justify-center rounded-2xl bg-ink font-medium text-white transition hover:bg-black">Go to login</Link>
          </div>
        )}
      </motion.section>
    </motion.main>
  );
}
