import { motionValue } from 'motion/react'

// Scroll-driven progress values shared between the page sections (which write them on
// scroll) and the 3D scene (which reads them every frame). Each runs 0 → 1 while its
// section scrolls into view.

// About: the stone collapses, the wireframe expands and the About text emerges
export const revealProgress = motionValue(0)

// Skills: the wireframe shrinks into a core, the stone reforms inside it and shatters, and
// the particles become skill logos orbiting the core on one ring per skill group
export const skillsProgress = motionValue(0)

// Point in skillsProgress where the stone breaks into particles
export const SHATTER_AT = 0.4
