import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'dark' | 'light' | 'lime'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const baseClasses = {
  dark: 'text-forest-900',
  light: 'text-white',
  lime: 'text-lime-400',
}

const accentClasses = {
  dark: 'text-lime-400',
  light: 'text-lime-400',
  lime: 'text-white',
}

export function Logo({ variant = 'dark', size = 'md', className }: LogoProps) {
  return (
    <span
      className={cn(
        'font-display font-bold tracking-tight select-none',
        sizeClasses[size],
        baseClasses[variant],
        className
      )}
    >
      Lok<span className={accentClasses[variant]}>via</span>
    </span>
  )
}
