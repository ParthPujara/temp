import { useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { revealProgress } from '../../lib/scrollProgress'
import ExpertiseCard from './ExpertiseCard'

// TODO: replace with your own story and areas of expertise
const expertise = [
  {
    title: 'Web Development',
    description:
      'Responsive, accessible, fast interfaces, from pixel-perfect layouts to smooth interactions.',
    tags: ['React', 'JavaScript', 'Tailwind CSS', 'Three.js'],
  },
  {
    title: 'MERN Stack',
    description:
      'Full-stack apps end to end: REST APIs, databases, authentication and deployment.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
]

export default function About() {
  const sectionRef = useRef()
  // 0 when the section's top enters the bottom of the screen, 1 when it reaches the top:
  // the reveal plays over exactly one screen height of scrolling
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start start'] })

  // Share the reveal with the 3D scene so the stone and wireframe move in sync with the text
  useMotionValueEvent(scrollYProgress, 'change', (value) => revealProgress.set(value))

  // Text grows out of the center as the stone collapses (stone timing lives in Scene/Model.jsx)
  const opacity = useTransform(revealProgress, [0.25, 0.7], [0, 1])
  const scale = useTransform(revealProgress, [0.25, 0.7], [0.4, 1])
  const filter = useTransform(revealProgress, [0.25, 0.7], ['blur(16px)', 'blur(0px)'])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="pointer-events-none relative flex h-screen items-center justify-center px-6"
    >
      <motion.div style={{ opacity, scale, filter }} className="max-w-2xl text-center">
        <p className="text-sm text-cyan-primary">About me</p>
        <h2 className="mt-2 text-3xl font-bold md:text-5xl">I build for the web, end to end.</h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-text-secondary">
          I'm a software developer who enjoys turning ideas into products people actually use,
          with clean code, thoughtful design and attention to the small details.
        </p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          {expertise.map((item) => (
            <ExpertiseCard key={item.title} {...item} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
