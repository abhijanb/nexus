import { RefreshCw } from "lucide-react";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

export function GoogleLogin() {
  const { handleGoogleLogin, isLoading } = useGoogleAuth();
  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full bg-surface-container-high border border-outline-variant/50 text-on-surface font-label-md text-label-md py-4 rounded-lg hover:bg-surface-container-highest hover:border-primary/30 transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {isLoading ? (
        <RefreshCw className="animate-spin" size={18} />
      ) : (
        <svg className="text-on-surface group-hover:scale-110 transition-transform shrink-0" fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.42-7.84 5.42-4.84 0-8.75-4.01-8.75-8.94s3.91-8.94 8.75-8.94c2.75 0 4.59 1.16 5.64 2.17l2.59-2.5c-1.66-1.55-3.82-2.5-8.23-2.5-6.62 0-12 5.38-12 12s5.38 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.78-.08-1.38-.24-1.97h-11.28z" />
        </svg>
      )}
      <span className="relative z-10">Continue with Google</span>
    </button>
  );
}
