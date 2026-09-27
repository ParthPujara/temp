import { useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { contactAnchor, contactProgress } from '../../lib/scrollProgress'
import ContactForm from './ContactForm'

export default function Contact() {
  const sectionRef = useRef()
  // 0 when the section's top enters the bottom of the screen, 1 when it reaches the top
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start start'] })

  // Drives the 3D scene: the timeline nodes gather in the center, merge into one model and
  // move onto the box on the right (see Scene/ContactModel.jsx)
  useMotionValueEvent(scrollYProgress, 'change', (value) => contactProgress.set(value))

  // The form slides in from the left as the model moves over to the right
  const opacity = useTransform(contactProgress, [0.55, 0.9], [0, 1])
  const x = useTransform(contactProgress, [0.55, 0.9], [-40, 0])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="pointer-events-none relative flex min-h-screen items-center px-6 py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
        <motion.div style={{ opacity, x }}>
          <p className="text-sm text-cyan-primary">Contact</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">Let's build something together</h2>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Have a project in mind, an opportunity, or just want to say hi? Drop me a message.
          </p>
          <ContactForm />
        </motion.div>

        {/* Empty box the merged 3D model sits on (above the form on phones) */}
        <div
          ref={(el) => {
            contactAnchor.current = el
          }}
          aria-hidden="true"
          className="order-first mx-auto aspect-square w-full max-w-60 md:order-none md:max-w-md"
        />
      </div>
    </section>
  )
}
