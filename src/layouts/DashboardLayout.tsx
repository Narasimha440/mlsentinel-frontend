import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/dashboard/Sidebar";


export default function DashboardLayout() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            <Sidebar
                userName={user?.displayName || "MLSentinel user"}
                userEmail={user?.email || ""}
                userPhotoUrl={user?.photoURL || undefined}
            />

            <main className="ml-64 min-h-screen min-w-0 bg-white">
                <Outlet />
            </main>
        </div>
    );
}