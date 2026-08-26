import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/hero/Navbar";
import Hero from "./components/hero/Hero";
// import { ProblemSection } from "./components/problem/ProblemSection";
import { SmoothScroll } from "./components/SmoothScroll";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import CreateWorkspace from "./pages/onboarding/CreateWorkspace";
import CreateProject from "./pages/onboarding/CreateProject";
import CreateModel from "./pages/onboarding/CreateModel";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import ConnectGithub from "./pages/ConnectGithub";
import GithubCallback from "./pages/GithubCallback";
import SelectRepo from "./pages/SelectRepo";
import Dashboard from "./pages/Dashboard";
import SetupWorkflow from "./pages/SetupWorkflow";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import AlertsPage from "./pages/AlertsPage";
import ModelsPage from "./pages/ModelsPage";
import MonitoringPage from "./pages/MonitoringPage";
import DataQualityPage from "./pages/DataQualityPage";
import AddModelPage from "./pages/AddModelPage";
import DashboardLayout from "./layouts/DashboardLayout";
import HistoryPage from "./pages/HistoryPage";
import DocsPage from "./pages/DocsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProductStory from "./components/hero/ProductStory";
// import HowItWorks from "./components/hero/HowitWorks";
import SDKSection from "./components/hero/SDKSection";
import SeeWhatChanged from "./components/hero/Seewhatchanged";
import HorizontalTagline from "./components/hero/HorizontalTagline";
import MonitoringSection from "./components/hero/MonitoringSection";
import Footer from "./components/hero/Footer";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <SmoothScroll>
                <main>
                  <Hero />
                  <ProductStory />
                  <SDKSection />
                  <SeeWhatChanged />
                  <HorizontalTagline />
                  <MonitoringSection />
                  <Footer />
                </main>
              </SmoothScroll>
            </>
          }
        />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* PROTECTED ROUTES - Redirects to /login  if NOT logged in */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><OnboardingGuard><Dashboard /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/dashboard/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
        <Route path="/onboarding/workspace" element={<ProtectedRoute><CreateWorkspace /></ProtectedRoute>} />
        <Route path="/onboarding/project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/onboarding/model" element={<ProtectedRoute><CreateModel /></ProtectedRoute>} />
        <Route path="/dashboard/github/connect" element={<ProtectedRoute><ConnectGithub /></ProtectedRoute>} />
        <Route path="/github/callback" element={<ProtectedRoute><GithubCallback /></ProtectedRoute>} />
        <Route path="/dashboard/github/select-repo" element={<ProtectedRoute><SelectRepo /></ProtectedRoute>} />
        <Route path="/dashboard/github/setup" element={<ProtectedRoute><SetupWorkflow /></ProtectedRoute>} />
        <Route path="/dashboard/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/dashboard/models" element={<ProtectedRoute><ModelsPage /></ProtectedRoute>} />
        <Route path="/dashboard/monitoring" element={<ProtectedRoute><MonitoringPage /></ProtectedRoute>} />
        <Route path="/dashboard/data-quality" element={<ProtectedRoute><DataQualityPage /></ProtectedRoute>} />
        <Route path="/dashboard/add-model" element={<ProtectedRoute><AddModelPage /></ProtectedRoute>} />
        <Route path="/dashboard/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}