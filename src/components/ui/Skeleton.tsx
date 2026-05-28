import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-forest-900/8',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent',
        className
      )}
      {...props}
    />
  )
}

function SpaceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-forest-900/5 bg-white shadow-card overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, SpaceCardSkeleton }
