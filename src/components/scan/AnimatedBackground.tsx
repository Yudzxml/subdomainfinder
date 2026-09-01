'use client';

import { motion } from 'framer-motion';

interface FloatingOrbProps {
  className?: string;
  delay?: number;
  duration?: number;
}

/** Soft glowing orb that drifts slowly — used to add life to hero sections. */
export function FloatingOrb({ className = '', delay = 0, duration = 8 }: FloatingOrbProps) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-2xl ${className}`}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 10, 0, -8, 0],
        scale: [1, 1.08, 1, 0.96, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

interface SectionHeadingProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({ title, action, className = '' }: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}
