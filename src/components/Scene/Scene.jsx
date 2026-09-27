import { lazy, Suspense } from 'react'

// Lazy-loaded so three.js doesn't block the first paint
const SceneCanvas = lazy(() => import('./SceneCanvas'))

// Fixed behind the whole page so the model stays centered while sections scroll over it
export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 opacity-60">
      <Suspense fallback={null}>
        <SceneCanvas />
      </Suspense>
    </div>
  )
}
