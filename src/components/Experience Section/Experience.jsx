import { useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { experienceAnchors, experienceProgress } from '../../lib/scrollProgress'
import { experience } from './experience'
import ExperienceItem from './ExperienceItem'

export default function Experience() {
  const sectionRef = useRef()
  // 0 when the section's top is 80% down the screen, 1 when it's 10% from the top: a short
  // scroll, and the heading and every card are on screen by the time it finishes
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.8', 'start 0.1'] })

  // Drives the 3D scene: in the center of the screen the logos stream back into the core,
  // which splits into the timeline nodes; the finished timeline then glides left onto the
  // entries (see Scene/ExperienceNodes.jsx)
  useMotionValueEvent(scrollYProgress, 'change', (value) => experienceProgress.set(value))

  const opacity = useTransform(experienceProgress, [0.7, 0.95], [0, 1])
  const y = useTransform(experienceProgress, [0.7, 0.95], [24, 0])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="pointer-events-none relative min-h-screen px-6 py-24"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div style={{ opacity, y }}>
          <p className="text-sm text-cyan-primary">Experience</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">Where I've been</h2>
        </motion.div>

        <ol className="mt-12 space-y-8 md:space-y-10">
          {experience.map((item, i) => (
            <ExperienceItem
              key={item.title}
              {...item}
              index={i}
              anchorRef={(el) => {
                experienceAnchors[i] = el
              }}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
