'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 90, damping: 22 },
  },
}

const scaleFade = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
}

interface StatItem { n: string; label: string }

interface Props {
  stats: StatItem[]
}

export default function AnimatedHero({ stats }: Props) {
  return (
    <motion.div
      className="max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Badge */}
      <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-7">
        <span className="badge">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-gold-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          Pakistan&apos;s Premium Muslim Matrimonial Platform
        </span>
      </motion.div>

      {/* H1 */}
      <motion.h1
        variants={fadeUp}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light leading-[1.05] mb-5 text-balance"
      >
        Find Your
        <motion.span
          className="block italic text-gold-gradient font-semibold"
          variants={scaleFade}
        >
          Perfect Rishta
        </motion.span>
      </motion.h1>

      {/* Urdu subtitle */}
      <motion.p
        variants={fadeUp}
        className="text-xl md:text-2xl font-serif italic text-parchment/35 mb-4"
        dir="rtl"
      >
        اپنا ہم سفر تلاش کریں
      </motion.p>

      {/* Description */}
      <motion.p
        variants={fadeUp}
        className="text-parchment/55 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Browse thousands of verified rishta profiles with AI-powered compatibility matching.
        Trusted by families across Pakistan, UAE, UK and beyond.
      </motion.p>

      {/* Stats */}
      <motion.div variants={container} className="flex flex-wrap justify-center gap-10 mb-10">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} className="text-center">
            <motion.div
              className="text-3xl md:text-4xl font-serif font-semibold text-gold-gradient"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 100, damping: 20 }}
            >
              {s.n}
            </motion.div>
            <div className="text-xs text-parchment/40 mt-1 tracking-wider uppercase">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
        <MagneticButton href="/browse" primary>Browse Profiles</MagneticButton>
        <MagneticButton href="/match">AI Match Score</MagneticButton>
      </motion.div>
    </motion.div>
  )
}

function MagneticButton({
  href,
  children,
  primary,
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`
  }

  function handleMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0, 0)'
    el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.1s ease, box-shadow 0.2s ease' }}
      className={
        primary
          ? 'btn-primary text-base px-8 py-3.5 rounded-xl text-void'
          : 'btn-secondary text-base px-8 py-3.5 rounded-xl'
      }
    >
      {children}
    </a>
  )
}
