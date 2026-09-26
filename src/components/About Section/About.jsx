import { lazy, Suspense } from 'react'
import ExpertiseCard from './ExpertiseCard'

// Lazy-loaded so three.js doesn't block the first paint
const AboutModel = lazy(() => import('./AboutModel'))

// TODO: replace with your own story and areas of expertise
const expertise = [
  {
    title: 'Web Development',
    description:
      'Responsive, accessible, fast interfaces built with modern HTML, CSS and JavaScript, from pixel-perfect layouts to smooth interactions.',
    tags: ['React', 'JavaScript', 'Tailwind CSS', 'Three.js'],
  },
  {
    title: 'MERN Stack',
    description:
      'Full-stack applications end to end: REST APIs, databases, authentication and deployment, with a clean React front end on top.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
]

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="text-sm text-cyan-primary">About me</p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            I build for the web, end to end.
          </h2>
          <p className="mt-6 leading-relaxed text-text-secondary">
            I'm a software developer who enjoys turning ideas into products people actually use.
            I care about clean code, thoughtful design and the small details that make an
            interface feel right.
          </p>
        </div>

        <div className="h-80 md:h-[28rem]">
          <Suspense fallback={null}>
            <AboutModel />
          </Suspense>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {expertise.map((item) => (
          <ExpertiseCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  )
}
