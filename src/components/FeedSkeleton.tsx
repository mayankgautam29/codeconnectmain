import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
            <Skeleton className="size-10 rounded-full bg-white/10" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 bg-white/10" />
              <Skeleton className="h-2.5 w-16 bg-white/10" />
            </div>
          </div>
          <Skeleton className="w-full min-h-[280px] rounded-none bg-white/[0.06]" />
          <div className="px-4 py-3 space-y-2">
            <Skeleton className="h-8 w-20 bg-white/10" />
            <Skeleton className="h-3 w-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
