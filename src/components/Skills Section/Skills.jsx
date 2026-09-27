import { useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { skillsProgress } from '../../lib/scrollProgress'
import { skillGroups } from './skills'

export default function Skills() {
  const sectionRef = useRef()
  // 0 when the section's top enters the bottom of the screen, 1 when it reaches the top
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start start'] })

  // Drives the 3D scene: the stone shatters and its particles become logos orbiting the
  // core on one ring per group (see Scene/SkillOrbits.jsx)
  useMotionValueEvent(scrollYProgress, 'change', (value) => skillsProgress.set(value))

  // Heading settles in as the logos finish forming
  const opacity = useTransform(skillsProgress, [0.6, 1], [0, 1])
  const y = useTransform(skillsProgress, [0.6, 1], [24, 0])

  return (
    <section
      id="skills"
      ref={sectionRef}
      // pointer-events-none lets drags reach the 3D scene behind
      className="pointer-events-none relative flex h-screen flex-col items-center px-6 pt-24"
    >
      <motion.div style={{ opacity, y }} className="text-center">
        <p className="text-sm text-cyan-primary">Skills</p>
        <h2 className="mt-2 text-3xl font-bold md:text-5xl">My toolkit</h2>
      </motion.div>

      {/* The logos and group names are drawn in 3D, so list the skills for screen readers too */}
      <div className="sr-only">
        {skillGroups.map((group) => (
          <div key={group.name}>
            <h3>{group.name}</h3>
            <ul>
              {group.skills.map(({ name }) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
