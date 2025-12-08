import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  hover?: boolean
  gradient?: string
  className?: string
  onClick?: () => void
}

const Card = ({ 
  children, 
  className, 
  hover = true,
  gradient,
  onClick,
}: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={hover ? { 
        scale: 1.02, 
        transition: { duration: 0.2 } 
      } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-6 backdrop-blur-sm',
        'border border-white/20 shadow-xl',
        'transition-all duration-300',
        gradient && `bg-gradient-to-br ${gradient}`,
        !gradient && 'bg-white/10',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export default Card

