import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

export function PublicRoute() {
  const { isAuthenticated, loading } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <Outlet />;
}
