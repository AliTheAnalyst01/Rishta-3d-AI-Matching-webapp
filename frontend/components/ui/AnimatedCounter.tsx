'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion'

interface Props {
  value: string
  className?: string
}

/** Animates a numeric suffix like "3,840+" or "100+" counting up from 0 */
export default function AnimatedCounter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  // Extract leading digits and trailing suffix
  const match = value.match(/^([0-9,]+)(\+|k|%)?(.*)$/)
  if (!match) return <span className={className}>{value}</span>

  const numericStr = match[1].replace(/,/g, '')
  const numericVal = parseInt(numericStr, 10)
  const suffix = match[2] ?? ''
  const rest = match[3] ?? ''
  const isNumeric = !isNaN(numericVal) && numericVal > 0

  if (!isNumeric) return <span className={className}>{value}</span>

  return (
    <CountUp
      ref={ref}
      target={numericVal}
      suffix={suffix + rest}
      originalStr={match[1]}
      inView={inView}
      className={className}
    />
  )
}

function CountUp({
  target,
  suffix,
  originalStr,
  inView,
  className,
  ref,
}: {
  target: number
  suffix: string
  originalStr: string
  inView: boolean
  className?: string
  ref: React.RefObject<HTMLSpanElement>
}) {
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (v) => {
    const n = Math.round(v)
    return n.toLocaleString() + suffix
  })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(motionVal, target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    })
    return ctrl.stop
  }, [inView, target, motionVal])

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  )
}
