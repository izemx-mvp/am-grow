export function ShimmerBlock({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`shimmer ${className}`} />;
}

export function ShimmerList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerBlock key={i} className={`h-10 w-full`} />
      ))}
    </div>
  );
}
