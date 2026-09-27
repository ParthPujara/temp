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

// Experience: the skill logos dissolve into particles that stream back into the core and
// re-form the stone, the orbit system shrinks to the left, and the core splits into one
// timeline node per experience entry, joined by a line
export const experienceProgress = motionValue(0)

// Point in experienceProgress where the core (with its re-formed stone) splits into the
// timeline nodes
export const NODES_SPLIT_AT = 0.45

// The DOM boxes the timeline nodes sit on, one per experience entry (in order).
// Registered by the Experience section, read by the 3D scene every frame.
export const experienceAnchors = []

// Contact: the timeline nodes gather in the center of the screen and merge into one
// hero-style model, which then moves onto the right-hand side of the Contact section
export const contactProgress = motionValue(0)

// Point in contactProgress where the gathered nodes become the single model
export const MERGE_AT = 0.45

// The DOM box the merged model sits on. Registered by the Contact section.
export const contactAnchor = { current: null }
