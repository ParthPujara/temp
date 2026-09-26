import { useEffect, useRef, useState } from 'react'

// Tracks whether an element is on screen; used to pause 3D canvases while scrolled away
export default function useInView() {
  const ref = useRef()
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}
