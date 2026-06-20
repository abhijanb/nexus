export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
    </div>
  );
}
