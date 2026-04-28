import { cn } from '../../lib/utils'

interface ChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function Chip({ children, active, onClick }: ChipProps) {
  return (
    <button type="button" className={cn('chip', active && 'chip-active')} onClick={onClick}>
      {children}
    </button>
  )
}
