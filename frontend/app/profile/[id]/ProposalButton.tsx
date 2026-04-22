'use client'

import { useState } from 'react'

export default function ProposalButton({ profileId, large = false }: { profileId: number; large?: boolean }) {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
        style={{ background: 'var(--green-pale)', color: 'oklch(36% 0.16 145)', border: '1.5px solid oklch(86% 0.08 145)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Proposal Sent — we will be in touch
      </div>
    )
  }

  return (
    <button
      onClick={() => setSent(true)}
      className={`btn-primary w-full justify-center ${large ? 'py-3.5 text-base' : 'py-2.5 text-sm'}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      Send Proposal
    </button>
  )
}
