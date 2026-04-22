'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

/** Card whose border illuminates dynamically under the cursor — taste-skill Spotlight Border Card */
export default function SpotlightCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      ref={ref}
      className={`card relative overflow-hidden p-7 group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      {/* Spotlight glow that follows cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        animate={{
          opacity: hovered ? 1 : 0,
          background: hovered
            ? `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(212,167,87,0.12) 0%, transparent 60%)`
            : 'none',
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Spotlight border */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, rgba(212,167,87,0.4) 0%, transparent 60%)`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
          borderRadius: 'inherit',
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />

      {children}
    </motion.div>
  )
}
