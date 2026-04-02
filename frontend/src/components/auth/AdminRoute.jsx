import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, token, fetchUser, hasHydrated } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!hasHydrated) return;
      // If we have a token but no user data, fetch user info
      if (token && !user) {
        await fetchUser();
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [token, user, fetchUser, hasHydrated]);

  // Show loading while checking authentication
  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
