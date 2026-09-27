import { motion, useTransform } from 'motion/react'
import { experienceProgress } from '../../lib/scrollProgress'

export default function ExperienceItem({ title, place, period, description, index, anchorRef }) {
  // Each card slides in from the right as the timeline settles beside it, one after another
  const start = 0.7 + index * 0.07
  const opacity = useTransform(experienceProgress, [start, start + 0.16], [0, 1])
  const x = useTransform(experienceProgress, [start, start + 0.16], [40, 0])

  return (
    <li className="flex items-center gap-5 md:gap-8">
      {/* Empty box that the 3D timeline node sits on (see Scene/ExperienceNodes.jsx) */}
      <div ref={anchorRef} aria-hidden="true" className="h-12 w-12 shrink-0 md:h-16 md:w-16" />

      <motion.article
        style={{ opacity, x }}
        className="flex-1 rounded-2xl border border-border-subtle bg-surface/70 p-5 backdrop-blur-sm"
      >
        <p className="text-xs font-medium tracking-wider text-cyan-primary uppercase">{period}</p>
        <h3 className="mt-1 text-lg font-semibold md:text-xl">{title}</h3>
        <p className="text-sm text-text-secondary">{place}</p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{description}</p>
      </motion.article>
    </li>
  )
}
