export default function DataStream() {
  return (
    <aside className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none">
      <div className="font-code-md text-code-md text-primary flex flex-col gap-2 text-right">
        <span>&gt; INITIALIZING_AUTH_PROTOCOL</span>
        <span>&gt; LOADING_KEY_STORES... [OK]</span>
        <span>&gt; ESTABLISHING_ENCRYPTED_TUNNEL</span>
        <span>&gt; SYNCING_WORKSPACE_PREFS</span>
        <span>&gt; READY_FOR_INPUT</span>
        <span className="animate-pulse">_</span>
      </div>
    </aside>
  );
}
