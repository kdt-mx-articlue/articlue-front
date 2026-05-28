import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    localStorage.setItem("redirectAfterLogin", location.pathname);

    return <Navigate to="/login" replace />;
  }

  return children;
}