import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { user } = useAuth();
    const location = useLocation();

    // If admin access is required
    if (requireAdmin) {
        // Not logged in at all -> redirect to login with state
        if (!user) {
            return <Navigate to="/login" state={{ from: location, message: "Please login to access admin pages" }} replace />;
        }

        // Logged in but not admin -> redirect to login with warning
        if (user.role !== 'admin') {
            return <Navigate to="/login" state={{ from: location, message: "Access denied. Admin privileges required." }} replace />;
        }
    }

    // User has proper access, render the component
    return children;
}
