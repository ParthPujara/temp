import { motion, useScroll, useTransform } from 'motion/react'
import { LuChevronDown } from 'react-icons/lu'
import SocialLinks from './SocialLinks'

export default function Hero() {
  // Fade the hero out over the first part of the scroll
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const y = useTransform(scrollY, [0, 400], [0, -60])

  return (
    // pointer-events-none lets mouse drags pass through to the 3D model behind
    <section className="pointer-events-none relative flex h-screen items-center justify-center">
      <motion.div style={{ opacity, y }} className="px-6 text-center">
        <p className="text-sm text-cyan-primary">Hi, I'm</p>
        <h1 className="mt-2 text-5xl font-bold md:text-7xl">Parth Pujara</h1>
        <p className="mt-4 text-lg text-text-secondary">Software Developer</p>

        <div className="mt-8">
          <SocialLinks />
        </div>
      </motion.div>

      {/* Scroll hint only, not clickable */}
      <motion.div
        aria-hidden="true"
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <LuChevronDown className="h-7 w-7 animate-bounce text-cyan-primary" />
      </motion.div>
    </section>
  )
}
