import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/navbar/Navbar";
import { Hero } from "./components/hero/Hero";
import { ProblemSection } from "./components/problem/ProblemSection";
import { SmoothScroll } from "./components/SmoothScroll";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import CreateWorkspace from "./pages/onboarding/CreateWorkspace";
import CreateProject from "./pages/onboarding/CreateProject";
import CreateModel from "./pages/onboarding/CreateModel";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <SmoothScroll>
              <main>
                <Hero />
                <ProblemSection />
              </main>
            </SmoothScroll>
          </>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage mode="signup" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><OnboardingGuard><Dashboard /></OnboardingGuard></ProtectedRoute>} />
      <Route path="/dashboard/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
      <Route path="/onboarding/workspace" element={<ProtectedRoute><CreateWorkspace /></ProtectedRoute>} />
      <Route path="/onboarding/project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/onboarding/model" element={<ProtectedRoute><CreateModel /></ProtectedRoute>} />
    </Routes>
  );
}