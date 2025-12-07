import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Optionally, render a loading spinner or skeleton screen
    return <div>Loading authentication...</div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
