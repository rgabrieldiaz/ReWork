export function PublicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 dark:bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen opacity-50 dark:opacity-100 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen opacity-50 dark:opacity-100 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}
