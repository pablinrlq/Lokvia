import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-forest-900 text-lime-400',
        lime: 'bg-lime-400/20 text-forest-900',
        outline: 'border border-forest-900/20 text-forest-900',
        earth: 'bg-earth-400/20 text-earth-500',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        destructive: 'bg-red-100 text-red-700',
        glass: 'bg-white/80 backdrop-blur-sm text-forest-900 shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
