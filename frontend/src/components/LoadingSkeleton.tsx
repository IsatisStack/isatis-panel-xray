export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded ${className}`} />;
}

export function LoadingCard() {
  return (
    <div className="animate-pulse bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <LoadingSkeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-3/4 rounded" />
          <LoadingSkeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
      <LoadingSkeleton className="h-8 w-full rounded" />
    </div>
  );
}

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}