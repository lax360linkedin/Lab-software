import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../auth/authTypes";

export const getDashboardPathForRole = (role?: UserRole): string => {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "lab_technician":
      return "/dashboard/technician";
    case "receptionist":
      return "/dashboard/receptionist";
    default:
      return "/login";
  }
};

interface RoleDashboardGuardProps {
  allowedRole: UserRole;
  children: ReactNode;
}

/**
 * Route guard wrapper outside the auth folder.
 * Blocks direct URL access to other roles' dashboards and redirects to the user's own dashboard.
 */
export const RoleDashboardGuard = ({
  allowedRole,
  children,
}: RoleDashboardGuardProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Block direct URL access to other roles' dashboards
  if (user.role !== allowedRole) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

/**
 * Handles /dashboard navigation by redirecting the user to their own role-specific dashboard.
 */
export const RoleDashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
};

interface LabRouteGuardProps {
  children?: ReactNode;
}

/**
 * Route guard wrapper outside the auth folder.
 * Blocks direct URL access to technical laboratory processing routes for Receptionists,
 * redirecting them to their receptionist dashboard.
 */
export const LabRouteGuard = ({ children }: LabRouteGuardProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Receptionists are not allowed to access lab processing routes
  if (user.role === "receptionist") {
    return <Navigate to="/dashboard/receptionist" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleDashboardGuard;
