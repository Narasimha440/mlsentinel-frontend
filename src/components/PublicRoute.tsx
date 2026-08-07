import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">Loading...</div>;
  }

  // If they are already logged in, redirect them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow them to see the landing page / login pages
  return <Outlet />;
}