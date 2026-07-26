"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { SPRING, enter } from "../../lib/motion";
import { cn } from "../../lib/cn";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSwitchMode: (mode: "login" | "signup") => void;
  mode?: "login" | "signup";
  onLayoutComplete?: () => void;
}

function Label({ htmlFor, children, className = "" }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 pointer-events-none",
        "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400",
        "peer-focus:top-1 peer-focus:-translate-y-1 peer-focus:text-[11px] peer-focus:text-blue-600 peer-focus:font-medium",
        "peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:-translate-y-1 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-blue-600 peer-[:not(:placeholder-shown)]:font-medium",
        className
      )}
    >
      {children}
    </label>
  );
}

function InputWrapper({ children, error, className = "" }: { children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-red-500 text-[11px] font-medium"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({
  id,
  type = "text",
  label,
  error,
  value,
  onChange,
  onBlur,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePassword,
  autoComplete,
  ...props
}: {
  id: string;
  type?: string;
  label: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  autoComplete?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "value" | "onChange" | "onBlur" | "autoComplete">) {
  return (
    <InputWrapper error={error} className="w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder=" "
        autoComplete={autoComplete}
        className={cn(
          "peer w-full h-14 bg-white rounded-2xl border transition-all duration-300",
          "placeholder:text-transparent",
          "border-gray-200 hover:border-gray-300",
          "focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none",
          "text-gray-900 placeholder:text-gray-400",
          "pl-4 pr-12",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/10",
          "disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-500"
        )}
        {...props}
      />
      <Label htmlFor={id}>{label}</Label>

      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        >
          {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    </InputWrapper>
  );
}

function PrimaryButton({
  children,
  disabled,
  loading,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof motion.button>, "children" | "className" | "disabled">) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={cn(
        "w-full h-14 rounded-2xl bg-gray-900 text-white font-medium text-[15px] transition-all duration-200",
        "hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-4 focus:ring-gray-900/20",
        "flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {loading && (
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            strokeDashoffset="31.4"
            style={{ transformOrigin: "center" }}
          />
        </motion.svg>
      )}
      {children}
    </motion.button>
  );
}

function SocialButton({
  children,
  icon: Icon,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
} & Omit<React.ComponentProps<typeof motion.button>, "children" | "className">) {
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: "0 8px 30px -8px rgba(17,24,39,0.12)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full h-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-3",
        "text-gray-900 font-medium text-[15px]",
        "hover:bg-gray-50 hover:border-gray-300",
        "focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600",
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {children}
    </motion.button>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500 font-medium">{children}</span>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function LoginForm({ onSwitchMode, mode = "login", onLayoutComplete }: LoginFormProps) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      if (isLogin && (key === "fullName" || key === "confirmPassword")) return;
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(cred.user, { displayName: formData.fullName });
        onLayoutComplete?.();
      }
      navigate("/dashboard");
    } catch (err: any) {
      const message = 
        err.code === "auth/invalid-credential" ? "Incorrect email or password." :
        err.code === "auth/email-already-in-use" ? "An account with this email already exists.":
        err.code === "auth/weak-password" ? "Password is too weak.":
        "Something went wrong. Please try again.";
      setErrors({ email: message });
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch {
      setErrors({ email: "Google sign-in failed. Please try again." });
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/dashboard");
    } catch {
      setErrors({ email: "Github sign-in failed. Please try again." });
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center px-6 lg:px-12 max-w-md w-full mx-auto py-12 lg:py-0">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          transition={{ ...SPRING, duration: 0.5 }}
        >
          {/* Logo */}
          <motion.div {...enter(0)} className="flex justify-center lg:justify-start mb-10 lg:mb-12">
            <a href="/" aria-label="MLSentinel home">
              <span className="font-semibold tracking-tight text-ink text-[19px]">MLSentinel</span>
            </a>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ ...SPRING, duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            <div {...enter(0.05)} className="text-center lg:text-left">
              <h1 className="text-[34px] font-semibold leading-[1.1] tracking-tight text-ink max-lg:text-[28px]">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-3 text-gray-600 leading-relaxed max-lg:text-center">
                {isLogin
                  ? "Continue monitoring your production models."
                  : "Start monitoring your ML models in minutes."}
              </p>
            </div>

            {!isLogin && (
              <motion.div {...enter(0.1)} className="space-y-4">
                <Input
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={submitted || errors.fullName ? errors.fullName : undefined}
                  autoComplete="name"
                  required
                  disabled={isSubmitting}
                />
              </motion.div>
            )}

            <motion.div {...enter(isLogin ? 0.1 : 0.15)} className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={submitted || errors.email ? errors.email : undefined}
                autoComplete={isLogin ? "email" : "username"}
                required
                disabled={isSubmitting}
              />
            </motion.div>

            <motion.div {...enter(isLogin ? 0.15 : 0.2)} className="space-y-4">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={submitted || errors.password ? errors.password : undefined}
                showPasswordToggle
                isPasswordVisible={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                disabled={isSubmitting}
              />
            </motion.div>

            {!isLogin && (
              <motion.div {...enter(0.25)} className="space-y-4">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={submitted || errors.confirmPassword ? errors.confirmPassword : undefined}
                  showPasswordToggle
                  isPasswordVisible={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                />
              </motion.div>
            )}

            {isLogin && (
              <motion.div {...enter(0.2)} className="text-right">
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </motion.div>
            )}

            <motion.div {...enter(isLogin ? 0.25 : 0.3)}>
              <PrimaryButton type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {isLogin ? "Continue" : "Create Account"}
              </PrimaryButton>
            </motion.div>

            <motion.div {...enter(isLogin ? 0.3 : 0.35)}>
              <Divider>or</Divider>
            </motion.div>

            <motion.div {...enter(isLogin ? 0.35 : 0.4)} className="grid grid-cols-2 gap-3">
              <SocialButton type="button" icon={GoogleIcon} onClick={handleGoogleLogin}>
                Google
              </SocialButton>
              <SocialButton type="button" icon={GithubIcon} onClick={handleGithubLogin}>
                GitHub
              </SocialButton>
            </motion.div>

            <motion.div {...enter(isLogin ? 0.4 : 0.45)} className="text-center text-gray-600">
              <span className="font-medium">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>{" "}
              <button
                type="button"
                onClick={() => onSwitchMode(isLogin ? "signup" : "login")}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
