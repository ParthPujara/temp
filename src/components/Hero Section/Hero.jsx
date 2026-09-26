import { lazy, Suspense } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import SocialLinks from './SocialLinks'

// Lazy-loaded so three.js doesn't block the first paint
const HeroModel = lazy(() => import('./HeroModel'))

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 3D model: fills the section behind the text */}
      <div className="absolute inset-0 opacity-60">
        <Suspense fallback={null}>
          <HeroModel />
        </Suspense>
      </div>

      {/* Text: pointer-events-none lets mouse drags pass through to the model */}
      <div className="pointer-events-none relative z-10 px-6 text-center">
        <p className="text-sm text-cyan-primary">Hi, I'm</p>
        <h1 className="mt-2 text-5xl font-bold md:text-7xl">Parth Pujara</h1>
        <p className="mt-4 text-lg text-text-secondary">Software Developer</p>

        <div className="mt-8">
          <SocialLinks />
        </div>
      </div>

      {/* Scroll hint only, not clickable */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-text-muted"
      >
        <LuChevronDown className="h-7 w-7 animate-bounce text-cyan-primary" />
      </div>
    </section>
  )
}
