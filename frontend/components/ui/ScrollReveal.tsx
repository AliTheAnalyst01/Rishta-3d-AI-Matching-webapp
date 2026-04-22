'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  /** 'up' | 'left' | 'right' | 'scale' */
  direction?: 'up' | 'left' | 'right' | 'scale'
  stagger?: boolean
}

const variants = {
  up: {
    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.88 },
    show: { opacity: 1, scale: 1 },
  },
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  stagger = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: delay } },
        }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={variants[direction]}
      transition={{ type: 'spring', stiffness: 90, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Wrap each child inside a stagger parent */
export function StaggerItem({
  children,
  className,
  direction = 'up',
}: {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'left' | 'right' | 'scale'
}) {
  return (
    <motion.div
      className={className}
      variants={variants[direction]}
      transition={{ type: 'spring', stiffness: 90, damping: 22 }}
    >
      {children}
    </motion.div>
  )
}
