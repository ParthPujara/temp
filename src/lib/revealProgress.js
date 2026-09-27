import { motionValue } from 'motion/react'

// How far the About reveal has played: 0 = hero state (stone inside wireframe),
// 1 = fully revealed (stone gone, wireframe expanded, about text visible).
// Written by the About section on scroll, read by the 3D scene every frame.
export const revealProgress = motionValue(0)
