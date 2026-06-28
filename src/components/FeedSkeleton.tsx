import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-8 md:space-y-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="max-w-2xl mx-auto rounded-[1.6rem] overflow-hidden border border-white/10 bg-white/[0.045] backdrop-blur-xl p-5 md:p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-3 w-16 bg-white/10" />
            </div>
          </div>
          <Skeleton className="w-full aspect-video rounded-2xl bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-2/3 bg-white/10" />
        </div>
      ))}
    </div>
  );
}
